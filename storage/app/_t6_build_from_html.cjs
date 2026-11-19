/**
 * Build Theme 6 Vue shells from layout6 HTML — path-fixed, scripts stripped,
 * with clear DYNAMIC markers for logo/search/cart/products.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'layout6/index.pretty.html'), 'utf8');

function fixPaths(s) {
  return s
    .replace(/(src|href|data-lazyload)=(["'])(?!https?:|\/|#|mailto:|tel:|javascript:)([^"']+)\2/gi, (m, attr, q, url) => {
      let u = url.replace(/^\.\.\//, '').replace(/^\.\//, '');
      if (u.startsWith('wp-content/') || u.startsWith('wp-includes/')) {
        return `${attr}=${q}/layout6/${u}${q}`;
      }
      return m;
    })
    .replace(/url\((['"]?)(?!https?:|\/|data:)([^)'"]+)\1\)/gi, (m, q, url) => {
      const u = url.replace(/^\.\.\//, '');
      if (u.startsWith('wp-content/') || u.startsWith('wp-includes/')) {
        return `url(${q}/layout6/${u}${q})`;
      }
      return m;
    })
    // Absolute demo CDN → local layout6
    .replace(/https?:\/\/demo2\.wpthemego\.com\/themes\/sw_topdeal\/layout6\//g, '/layout6/')
    .replace(/\/\/demo2\.wpthemego\.com\/themes\/sw_topdeal\/layout6\//g, '/layout6/');
}

function stripScripts(s) {
  return s.replace(/<script[\s\S]*?<\/script>/gi, '');
}

function stripStyles(s) {
  return s.replace(/<style[\s\S]*?<\/style>/gi, '');
}

// --- Header (4823) ---
const headerStart = html.indexOf('<div data-elementor-type="wp-post" data-elementor-id="4823"');
const mainStart = html.indexOf('<div class="container">', headerStart);
let header = html.slice(headerStart, mainStart);
header = stripScripts(stripStyles(fixPaths(header)));

// Simplify mega menus: keep structure but trim huge megamenu dropdowns to empty placeholders
header = header.replace(/<ul class="dropdown-menu[\s\S]*?<\/ul>/g, '<ul class="dropdown-menu"></ul>');

fs.writeFileSync(path.join(__dirname, '_t6_header_clean.html'), header);
console.log('header clean', header.length);

// --- Page content first major sections (until footer) — keep first ~80KB of meaningful content ---
const pageStart = html.indexOf('<div data-elementor-type="wp-page" data-elementor-id="4337"');
const footerStart = html.indexOf('<div data-elementor-type="wp-post" data-elementor-id="4824"');
let page = html.slice(pageStart, footerStart);
page = stripScripts(stripStyles(fixPaths(page)));

// Truncate after a reasonable amount of sections for Home — keep full for now but write size
fs.writeFileSync(path.join(__dirname, '_t6_page_clean.html'), page);
console.log('page clean', page.length, 'lines', page.split('\n').length);

// --- Footer ---
let footer = html.slice(footerStart, footerStart + 90000);
// find end of elementor-4824: next body-wrapper close-ish
const footerClose = footer.indexOf('<!-- .footer');
if (footerClose > 0) footer = footer.slice(0, footerClose);
footer = stripScripts(stripStyles(fixPaths(footer)));
// cut at last reasonable point — after copyright section
const copyIdx = footer.lastIndexOf('elementor-element-6c3e596');
if (copyIdx > 0) {
  const after = footer.indexOf('</div>\n\t\t</div>', copyIdx + 500);
  // take more generously
  footer = footer.slice(0, Math.min(footer.length, copyIdx + 3500));
}
fs.writeFileSync(path.join(__dirname, '_t6_footer_clean.html'), footer);
console.log('footer clean', footer.length);

// Extract ALL head link stylesheets for blade
const head = html.slice(0, html.indexOf('</head>'));
const hrefs = [...head.matchAll(/<link[^>]+rel=['"]stylesheet['"][^>]*>/gi)]
  .map((m) => {
    const href = (m[0].match(/href=['"]([^'"]+)['"]/i) || [])[1];
    if (!href) return null;
    let u = href.replace(/\?.*$/, '').replace(/^\.\.\//, '');
    if (u.includes('googleapis') || u.includes('gstatic') || u.startsWith('http')) return u.startsWith('http') ? u : null;
    if (u.startsWith('wp-content/') || u.startsWith('wp-includes/')) return '/layout6/' + u;
    return null;
  })
  .filter(Boolean);

fs.writeFileSync(path.join(__dirname, '_t6_css_links.json'), JSON.stringify([...new Set(hrefs)], null, 2));
console.log('css links', [...new Set(hrefs)].length);
