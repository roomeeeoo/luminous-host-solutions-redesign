// Rewrites root-absolute links ("/assets/x", "/privacy") in every HTML page to
// relative ones ("assets/x", "../privacy/"), so the site works both at a domain
// root (Netlify) and inside a sub-folder (GitHub Pages: /<repo>/).
// Safe to run repeatedly. Called automatically by build-pages.mjs.
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// 404.html can be served at any depth, so it keeps root-relative links.
const pages = ['index.html', 'privacy/index.html', 'terms/index.html', 'payment-terms/index.html', 'thank-you/index.html'];

function rewrite(url, prefix) {
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  const m = url.slice(1).match(/^([^?#]*)(.*)$/);
  let path = m[1];
  const rest = m[2];
  if (path && !path.endsWith('/') && existsSync(join(ROOT, path)) && statSync(join(ROOT, path)).isDirectory()) path += '/';
  const out = prefix + path + rest;
  return out === '' ? './' : out;
}

for (const page of pages) {
  const file = join(ROOT, page);
  if (!existsSync(file)) continue;
  const prefix = page.includes('/') ? '../' : '';
  const html = readFileSync(file, 'utf8').replace(/\b(href|src|srcset|imagesrcset)="([^"]*)"/g, (_, attr, value) => {
    const fixed = attr.endsWith('srcset')
      ? value.split(',').map((part) => part.trim().replace(/^(\S+)/, (u) => rewrite(u, prefix))).join(', ')
      : rewrite(value, prefix);
    return `${attr}="${fixed}"`;
  });
  writeFileSync(file, html);
  console.log('relativized', page);
}
