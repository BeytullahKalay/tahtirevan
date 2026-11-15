// Yerel önizleme: statik dosyaları sunar, form gönderimini (POST) sahte yanıtla karşılar.
// Canlıda formu Netlify Forms karşılar (index.html'deki data-netlify).
// Kullanım: node coming-soon/dev-server.mjs  →  http://localhost:3200
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".txt": "text/plain", ".json": "application/json",
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        console.log("[notify] (yerel, e-posta gönderilmedi)", body);
        res.writeHead(200, { "Content-Type": "application/json" }).end('{"ok":true}');
      });
      return;
    }
    let file = path.normalize(path.join(root, decodeURIComponent(url.pathname)));
    if (!file.startsWith(root) || file.includes(`${path.sep}api${path.sep}`)) return res.writeHead(404).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) file = path.join(root, "index.html");
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(3200, () => console.log("Yakında sayfası: http://localhost:3200"));
