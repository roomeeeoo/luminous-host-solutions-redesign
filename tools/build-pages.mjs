// Builds /privacy/, /terms/, /payment-terms/ and /thank-you/ from the legal
// source in src/legal/. The legal text itself is copied verbatim from the
// original site; this script only wraps it in the shared header, footer and
// a table of contents. Run:  node tools/build-pages.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const header = `<a href="#main" class="skip-link">Skip to content</a>
<header class="site-header is-scrolled" data-header>
  <div class="header-inner">
    <a href="/" class="brand" aria-label="Luminous Host Solutions home">
      <img src="/assets/images/logo-purple.svg" alt="" width="40" height="40">
      <span class="brand-name">Luminous <span>Host Solutions</span></span>
    </a>
    <nav class="nav-desktop" aria-label="Main">
      <a href="/#services">Services</a>
      <a href="/#how-it-works">How It Works</a>
      <a href="/#about">About</a>
      <a href="/#our-work">Our Work</a>
      <a href="/#quote">Contact</a>
    </nav>
    <a href="/#quote" class="pill pill--header">Request a Quote</a>
    <details class="nav-mobile">
      <summary aria-label="Menu"><span class="bars" aria-hidden="true"><span></span><span></span></span></summary>
      <nav class="nav-mobile-panel" aria-label="Main">
        <a href="/#services">Services</a>
        <a href="/#how-it-works">How It Works</a>
        <a href="/#about">About</a>
        <a href="/#our-work">Our Work</a>
        <a href="/#faq">Questions</a>
        <a href="/#quote">Contact</a>
        <a href="/#quote" class="pill pill--solid">Request a Quote</a>
      </nav>
    </details>
  </div>
</header>`;

const footer = `<footer class="site-footer">
  <div class="wrap footer__top">
    <div class="footer__brand">
      <img src="/assets/images/logo-gold.svg" alt="" width="64" height="64" loading="lazy">
      <p>Create spaces that feel calm, clear, and ready to be lived in.</p>
    </div>
    <div class="footer__col"><h2>Explore</h2><ul>
      <li><a href="/#services">Services</a></li><li><a href="/#how-it-works">How It Works</a></li>
      <li><a href="/#about">About</a></li><li><a href="/#our-work">Our Work</a></li><li><a href="/#quote">Contact</a></li></ul></div>
    <div class="footer__col"><h2>Contact</h2><ul>
      <li><a href="mailto:hello@luminoushostsolutions.com">hello@luminoushostsolutions.com</a></li>
      <li><a href="tel:5029301385">(502) 930-1385</a></li>
      <li><a href="https://instagram.com/luminoushostsolutions" target="_blank" rel="me noopener" aria-label="Instagram (opens in a new window)">Instagram</a></li>
      <li><a href="https://www.facebook.com/luminoushostsolutions" target="_blank" rel="me noopener" aria-label="Facebook (opens in a new window)">Facebook</a></li></ul></div>
    <div class="footer__col"><h2>Legal</h2><ul>
      <li><a href="/privacy">Privacy Policy</a></li><li><a href="/terms">Terms of Service</a></li><li><a href="/payment-terms">Payment Terms</a></li></ul></div>
  </div>
  <div class="wrap footer__base"><p>&copy; 2026 Luminous Host Solutions LLC. All rights reserved.</p><p>Louisville, Kentucky &amp; Southern Indiana</p></div>
</footer>
<script src="/assets/js/site.js" defer></script>`;

const head = ({ title, description, path, robots = '' }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="https://luminoushostsolutions.com${path}">
${robots}<link rel="icon" type="image/png" href="/favicon.png" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#f7f3ec">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Luminous Host Solutions">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="https://luminoushostsolutions.com/og-image.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..600;1,300..600&family=Jost:wght@300..600&display=swap">
<link rel="stylesheet" href="/assets/css/site.css">
</head>`;

const slug = (s) => s.toLowerCase().replace(/&[a-z]+;/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const text = (s) => s.replace(/<[^>]+>/g, '');

const legal = [
  { file: 'privacy', path: '/privacy/', title: 'Privacy Policy | Luminous Host Solutions', description: 'How Luminous Host Solutions LLC handles personal information through its website and app.' },
  { file: 'terms', path: '/terms/', title: 'Terms of Service | Luminous Host Solutions', description: 'The terms under which Luminous Host Solutions LLC provides its website, app and services.' },
  { file: 'payment-terms', path: '/payment-terms/', title: 'Payment Terms | Luminous Host Solutions', description: 'How Luminous Host Solutions LLC prices, invoices and takes payment for its services.' },
];
const names = { privacy: 'Privacy Policy', terms: 'Terms of Service', 'payment-terms': 'Payment Terms' };

for (const page of legal) {
  const src = readFileSync(join(ROOT, 'src/legal', page.file + '.html'), 'utf8');
  const h1 = src.match(/<h1>([\s\S]*?)<\/h1>/)[1];
  const updated = src.match(/<p class="updated">([\s\S]*?)<\/p>/)[1];
  let body = src.match(/<div class="wrap legal-body">([\s\S]*)<\/div><\/article>/)[1];

  const toc = [];
  const used = new Set();
  body = body.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
    let id = slug(inner) || 'section';
    while (used.has(id)) id += '-2';
    used.add(id);
    toc.push(`<li><a href="#${id}">${text(inner)}</a></li>`);
    return `<h2 id="${id}">${inner}</h2>`;
  });

  const others = Object.keys(names).filter((k) => k !== page.file)
    .map((k) => `<a class="textlink" href="/${k}">${names[k]}</a>`).join('');

  const html = `${head(page)}
<body class="page-legal">
${header}
<main id="main">
<article class="legal">
  <div class="wrap legal-head">
    <p class="eyebrow">Legal</p>
    <h1>${h1}</h1>
    <p class="updated">${updated}</p>
  </div>
  <div class="wrap legal-layout">
    <nav class="legal-toc" aria-label="On this page"><h2>On this page</h2><ol>${toc.join('')}</ol></nav>
    <div class="legal-body">${body}
      <div class="legal-others">${others}</div>
    </div>
  </div>
</article>
</main>
${footer}
</body>
</html>
`;
  mkdirSync(join(ROOT, page.file), { recursive: true });
  writeFileSync(join(ROOT, page.file, 'index.html'), html);
  console.log('built', page.path, toc.length, 'sections');
}

// Thank-you page (Web3Forms redirects here after a successful submission).
const thanks = `${head({ title: 'Thank you | Luminous Host Solutions', description: 'We have your inquiry.', path: '/thank-you/', robots: '<meta name="robots" content="noindex">\n' })}
<body class="page-plain">
${header}
<main id="main">
<section class="thanks">
  <div class="wrap thanks-inner">
    <img src="/assets/images/logo-purple.svg" alt="" width="88" height="88">
    <p class="eyebrow">Request received</p>
    <h1>Thank <em>you</em></h1>
    <p class="lede">Thank you — we have your details and will come back to you shortly.</p>
    <p class="note">If it is urgent, email us directly at <a href="mailto:hello@luminoushostsolutions.com">hello@luminoushostsolutions.com</a>.</p>
    <a href="/" class="pill pill--solid">Back to the website</a>
  </div>
</section>
</main>
${footer}
</body>
</html>
`;
mkdirSync(join(ROOT, 'thank-you'), { recursive: true });
writeFileSync(join(ROOT, 'thank-you', 'index.html'), thanks);
console.log('built /thank-you/');

// Make every link relative so the site also works from a sub-folder.
await import('./relativize.mjs');
