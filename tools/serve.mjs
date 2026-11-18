// Zero-dependency local preview server. Serves this folder the way Netlify
// would: /privacy and /privacy/ both resolve to privacy/index.html.
// Run:  node tools/serve.mjs        (optional: PORT=8080 node tools/serve.mjs)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 4321;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};

async function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^([/\\])+/, '');
  if (clean.startsWith('..')) return null;
  const base = join(ROOT, clean);
  for (const candidate of [base, join(base, 'index.html'), base + '.html']) {
    try { if ((await stat(candidate)).isFile()) return candidate; } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolve(req.url || '/');
  if (!file || /[\\/](tools|src|node_modules)[\\/]/.test(file.slice(ROOT.length))) {
    const notFound = await resolve('/404.html');
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    return res.end(notFound ? await readFile(notFound) : 'Not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  res.end(await readFile(file));
}).listen(PORT, () => {
  console.log(`\n  Luminous Host Solutions preview\n  http://localhost:${PORT}\n\n  Press Ctrl+C to stop.\n`);
});
