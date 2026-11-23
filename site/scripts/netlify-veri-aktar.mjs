// Yereldeki panel verisini (data/tahtirevan.db, SQLite) Netlify veritabanına (Postgres) aktarır.
//
// Kullanım (site/ klasöründe; Netlify'a giriş yapılmış olmalı: npx netlify-cli login):
//   node scripts/netlify-veri-aktar.mjs                 (canlı veritabanının adresini Netlify'dan kendisi alır)
//   node scripts/netlify-veri-aktar.mjs --uzerine-yaz   (hedefte veri varsa siler, yeniden aktarır)
//   $env:HEDEF_DB = "postgres://…"; node scripts/netlify-veri-aktar.mjs   (başka bir Postgres'e)
// Veritabanı adresi (şifresiyle) ekrana yazılmaz.
//
// Ne yapar:
//  1. Hedefte şema yoksa `payload migrate` ile kurar (migrations/ klasörü).
//  2. Hedef boş değilse durur (--uzerine-yaz verilmedikçe).
//  3. Yabancı anahtarları geçici olarak kaldırır, her tabloyu satır satır kopyalar, anahtarları geri ekler.
//  4. Kimlik sayaçlarını en büyük kimliğe ayarlar (yeni kayıtlar çakışmasın).
// Önce `npm run backup` alın. Kopyalama tek bir işlem (transaction) içindedir: hata olursa hedefte hiçbir şey değişmez.
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { createClient } from "@libsql/client";
import pg from "pg";

const SITE_ID = process.env.NETLIFY_SITE_ID || "03a2575d-9628-4b4a-9781-c6d021693799"; // Netlify projesi: tahtirevan
const replace = process.argv.includes("--uzerine-yaz");
const source = process.env.KAYNAK_DB || "file:./data/tahtirevan.db";

/** Canlı (production) veritabanının adresini Netlify komut aracından alır; ekrana yazmaz. */
function netlifyDbUrl() {
  for (const branch of ["production", "master", "main"]) {
    const r = spawnSync("npx", ["-y", "netlify-cli", "database", "status", "--branch", branch, "--show-credentials", "--json"], {
      shell: process.platform === "win32",
      env: { ...process.env, NETLIFY_SITE_ID: SITE_ID },
      encoding: "utf8",
    });
    const url = /postgres(?:ql)?:\/\/[^\s"'\\]+/.exec(`${r.stdout}`)?.[0];
    if (url) {
      console.log(`Netlify veritabanı bulundu (dal: ${branch}, sunucu: ${new URL(url).hostname}).`);
      return url;
    }
  }
  return undefined;
}

const target = process.env.HEDEF_DB || netlifyDbUrl();
if (!target?.startsWith("postgres")) {
  console.error(
    "Netlify veritabanının adresi alınamadı. Netlify'a giriş yaptığınızdan (npx netlify-cli login) ve projede veritabanı oluşturduğunuzdan emin olun.",
  );
  process.exit(1);
}

const q = (name) => `"${name.replace(/"/g, '""')}"`;

// 1) Şema
console.log("1/4 Şema kuruluyor (payload migrate)…");
execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", ["payload", "migrate"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, DATABASE_URI: target, NETLIFY_DB_URL: "" },
  cwd: path.resolve(import.meta.dirname, ".."),
});

const lite = createClient({ url: source });
const pgc = new pg.Client({ connectionString: target });
await pgc.connect();

const SKIP = new Set(["payload_migrations"]);

const tables = (
  await pgc.query(`select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name`)
).rows
  .map((r) => r.table_name)
  .filter((t) => !SKIP.has(t));

const liteTables = new Set((await lite.execute(`select name from sqlite_master where type = 'table'`)).rows.map((r) => String(r.name)));

// 2) Hedef boş mu?
let filled = [];
for (const t of tables) {
  const { rows } = await pgc.query(`select 1 from ${q(t)} limit 1`);
  if (rows.length) filled.push(t);
}
if (filled.length && !replace) {
  console.error(`Hedef veritabanında zaten veri var (${filled.slice(0, 5).join(", ")}…). Üzerine yazmak için --uzerine-yaz ekleyin.`);
  process.exit(1);
}

const colsOf = async (t) =>
  (
    await pgc.query(
      `select column_name, data_type, udt_name from information_schema.columns where table_schema = 'public' and table_name = $1 order by ordinal_position`,
      [t],
    )
  ).rows;

function convert(value, col) {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint") value = Number(value);
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
      if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return Buffer.from(value);
      return value;
  }
}

console.log("2/4 Kopyalama başlıyor…");
await pgc.query("begin");
try {
  // Yabancı anahtarları kaydet ve kaldır
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
    if (!liteTables.has(t)) {
      console.log(`  - ${t}: yerelde yok, boş kalır`);
      continue;
    }
    const cols = await colsOf(t);
    const liteCols = new Set((await lite.execute(`pragma table_info(${q(t)})`)).rows.map((r) => String(r.name)));
    const shared = cols.filter((c) => liteCols.has(c.column_name));
    const missing = [...liteCols].filter((c) => !cols.some((x) => x.column_name === c));
    if (missing.length) console.log(`  ! ${t}: hedefte olmayan sütunlar atlandı: ${missing.join(", ")}`);

    const { rows } = await lite.execute(`select ${shared.map((c) => q(c.column_name)).join(", ")} from ${q(t)}`);
    for (const row of rows) {
      const values = shared.map((c) => convert(row[c.column_name], c));
      const params = shared.map((c, i) => (c.data_type === "USER-DEFINED" ? `$${i + 1}::${q(c.udt_name)}` : `$${i + 1}`));
      await pgc.query(`insert into ${q(t)} (${shared.map((c) => q(c.column_name)).join(", ")}) values (${params.join(", ")})`, values);
    }
    total += rows.length;
    if (rows.length) console.log(`  ✓ ${t}: ${rows.length}`);
  }

  console.log("3/4 Yabancı anahtarlar geri ekleniyor…");
  for (const fk of fks) await pgc.query(`alter table ${q(fk.table)} add constraint ${q(fk.conname)} ${fk.def}`);

  console.log("4/4 Kimlik sayaçları ayarlanıyor…");
  const seqs = (
    await pgc.query(`
      select c.table_name, c.column_name, pg_get_serial_sequence(quote_ident(c.table_name), c.column_name) as seq
      from information_schema.columns c
      where c.table_schema = 'public' and pg_get_serial_sequence(quote_ident(c.table_name), c.column_name) is not null`)
  ).rows;
  for (const s of seqs) {
    await pgc.query(
      `select setval($1, coalesce((select max(${q(s.column_name)}) from ${q(s.table_name)}), 0) + 1, false)`,
      [s.seq],
    );
  }

  await pgc.query("commit");
  console.log(`Tamam: ${total} satır aktarıldı.`);
} catch (e) {
  await pgc.query("rollback");
  console.error("Aktarma durdu, hedefte hiçbir şey değişmedi:", e.message);
  process.exitCode = 1;
} finally {
  await pgc.end();
  lite.close();
}
