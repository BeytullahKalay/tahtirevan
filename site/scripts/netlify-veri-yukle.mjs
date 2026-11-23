// Netlify derlemesinde çalışır (netlify.toml → build.command), `payload migrate` ile `next build` arasında.
// `npm run netlify:veri` ile Netlify Blobs'a ("aktarim" deposu, "veri.json") yüklenen veriyi canlı veritabanına yazar.
// Yazma izni yalnızca derlemede var; bilgisayardan verilen adres salt okunur.
//
//  - Bekleyen veri yoksa hiçbir şey yapmaz.
//  - Veritabanında zaten veri varsa (ve dosya --uzerine-yaz ile hazırlanmadıysa) dokunmaz.
//  - Kopyalama tek bir işlemdir (transaction): hata olursa veritabanında hiçbir şey değişmez, derleme durur.
//  - Başarılı olunca dosyayı depodan siler (bir sonraki derleme yeniden yazmasın).
//
// Yerelde denemek için: VERI_DOSYASI=backups/netlify-aktarim.json DATABASE_URI=postgres://… node scripts/netlify-veri-yukle.mjs
import fs from "node:fs";
import pg from "pg";

const target = process.env.NETLIFY_DB_URL || (process.env.DATABASE_URI?.startsWith("postgres") ? process.env.DATABASE_URI : "");
const localFile = process.env.VERI_DOSYASI;

if (!target) {
  console.log("[veri-yukle] Postgres adresi yok, atlandı.");
  process.exit(0);
}

let store;
let dump;
if (localFile) {
  dump = JSON.parse(fs.readFileSync(localFile, "utf8"));
} else {
  if (!process.env.NETLIFY_BLOBS_CONTEXT) {
    console.log("[veri-yukle] Netlify Blobs erişimi yok (yerel derleme?), atlandı.");
    process.exit(0);
  }
  const { getStore } = await import("@netlify/blobs");
  store = getStore({ name: "aktarim", consistency: "strong" });
  dump = await store.get("veri.json", { type: "json" });
  if (!dump) {
    console.log("[veri-yukle] Bekleyen veri yok.");
    process.exit(0);
  }
}

const q = (name) => `"${name.replace(/"/g, '""')}"`;
const pgc = new pg.Client({ connectionString: target });
await pgc.connect();

const SKIP = new Set(["payload_migrations"]);
const tables = (
  await pgc.query(`select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name`)
).rows
  .map((r) => r.table_name)
  .filter((t) => !SKIP.has(t));

const filled = [];
for (const t of tables) {
  if ((await pgc.query(`select 1 from ${q(t)} limit 1`)).rows.length) filled.push(t);
}
if (filled.length && !dump.replace) {
  console.log(
    `[veri-yukle] Veritabanında zaten veri var (${filled.slice(0, 5).join(", ")}…); bekleyen veri yazılmadı. ` +
      "Üzerine yazmak için yerelde `npm run netlify:veri -- --uzerine-yaz` çalıştırın.",
  );
  await pgc.end();
  process.exit(0);
}

function convert(value, col) {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && value.$b64 !== undefined) return Buffer.from(value.$b64, "base64");
  switch (col.data_type) {
    case "boolean":
      return value === 1 || value === "1" || value === true || value === "true";
    case "json":
    case "jsonb":
      return typeof value === "string" ? value : JSON.stringify(value);
    case "timestamp with time zone":
    case "timestamp without time zone":
      return typeof value === "number" ? new Date(value).toISOString() : value;
    default:
      return value;
  }
}

console.log(`[veri-yukle] ${dump.createdAt} tarihli veri yazılıyor…`);
await pgc.query("begin");
try {
  const fks = (
    await pgc.query(`
      select con.conname, rel.relname as table, pg_get_constraintdef(con.oid) as def
      from pg_constraint con
      join pg_class rel on rel.oid = con.conrelid
      join pg_namespace ns on ns.oid = rel.relnamespace
      where con.contype = 'f' and ns.nspname = 'public'`)
  ).rows;
  for (const fk of fks) await pgc.query(`alter table ${q(fk.table)} drop constraint ${q(fk.conname)}`);

  if (filled.length) await pgc.query(`truncate ${tables.map(q).join(", ")} restart identity`);

  let total = 0;
  for (const t of tables) {
    const src = dump.tables[t];
    if (!src) continue;
    const cols = (
      await pgc.query(
        `select column_name, data_type, udt_name from information_schema.columns where table_schema = 'public' and table_name = $1`,
        [t],
      )
    ).rows;
    const byName = new Map(cols.map((c) => [c.column_name, c]));
    const idx = src.columns.map((c, i) => [c, i]).filter(([c]) => byName.has(c));
    const missing = src.columns.filter((c) => !byName.has(c));
    if (missing.length) console.log(`  ! ${t}: veritabanında olmayan sütunlar atlandı: ${missing.join(", ")}`);
    if (!src.rows.length || !idx.length) continue;

    const colList = idx.map(([c]) => q(c)).join(", ");
    const params = idx.map(([c], i) => {
      const col = byName.get(c);
      return col.data_type === "USER-DEFINED" ? `$${i + 1}::${q(col.udt_name)}` : `$${i + 1}`;
    });
    for (const row of src.rows) {
      const values = idx.map(([c, i]) => convert(row[i], byName.get(c)));
      await pgc.query(`insert into ${q(t)} (${colList}) values (${params.join(", ")})`, values);
    }
    total += src.rows.length;
    console.log(`  ✓ ${t}: ${src.rows.length}`);
  }

  for (const fk of fks) await pgc.query(`alter table ${q(fk.table)} add constraint ${q(fk.conname)} ${fk.def}`);

  const seqs = (
    await pgc.query(`
      select c.table_name, c.column_name, pg_get_serial_sequence(quote_ident(c.table_name), c.column_name) as seq
      from information_schema.columns c
      where c.table_schema = 'public' and pg_get_serial_sequence(quote_ident(c.table_name), c.column_name) is not null`)
  ).rows;
  for (const s of seqs) {
    await pgc.query(`select setval($1, coalesce((select max(${q(s.column_name)}) from ${q(s.table_name)}), 0) + 1, false)`, [s.seq]);
  }

  await pgc.query("commit");
  console.log(`[veri-yukle] Tamam: ${total} satır yazıldı.`);
} catch (e) {
  await pgc.query("rollback");
  console.error("[veri-yukle] Durdu, veritabanında hiçbir şey değişmedi:", e.message);
  await pgc.end();
  process.exit(1);
}
await pgc.end();

if (store) {
  await store.delete("veri.json");
  console.log("[veri-yukle] Bekleyen veri depodan silindi.");
}
