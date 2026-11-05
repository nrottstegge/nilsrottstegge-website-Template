import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('../_site/', import.meta.url)));
const config = JSON.parse(await readFile(new URL('../_config.yml', import.meta.url), 'utf8'));
if (process.argv[2]) Object.assign(config, JSON.parse(await readFile(new URL(`../${process.argv[2]}`, import.meta.url), 'utf8')));
const base = config.baseurl || '';
const port = Number(process.env.PORT || 4000);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.yml': 'application/json; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/vnd.microsoft.icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.wasm': 'application/wasm' };
await stat(path.join(root, 'index.html')).catch(() => { throw new Error('Zuerst npm run build ausführen.'); });
const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
    const url = new URL(request.url, 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname);
    if (base && pathname === base) { response.writeHead(308, { Location: `${base}/` }).end(); return; }
    if (!pathname.startsWith(`${base}/`)) { response.writeHead(404).end(); return; }
    const target = path.resolve(root, `.${pathname.slice(base.length)}`);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
    let file = target; if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404).end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Website: http://127.0.0.1:${port}${base}/\nDemo ohne Konto: http://127.0.0.1:${port}${base}/admin/${config.demo_only ? '' : 'demo/'}\nNur auf diesem Rechner erreichbar. Beenden mit Ctrl+C.`));
