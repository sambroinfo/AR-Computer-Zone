const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../layout6/index.pretty.html'), 'utf8');

function between(startNeedle, endNeedle, from = 0) {
  const s = html.indexOf(startNeedle, from);
  if (s < 0) return null;
  const e = html.indexOf(endNeedle, s + startNeedle.length);
  if (e < 0) return null;
  return { start: s, end: e, text: html.slice(s, e) };
}

// Header: elementor-4823 block until main container
const headerStart = html.indexOf('<div data-elementor-type="wp-post" data-elementor-id="4823"');
const mainStart = html.indexOf('<div class="container">', headerStart);
const headerHtml = html.slice(headerStart, mainStart);
fs.writeFileSync(path.join(__dirname, '_t6_header_raw.html'), headerHtml);
console.log('header', headerHtml.length, 'lines', headerHtml.split('\n').length);

// Page content elementor-4337 until footer 4824
const pageStart = html.indexOf('<div data-elementor-type="wp-page" data-elementor-id="4337"');
const footerStart = html.indexOf('<div data-elementor-type="wp-post" data-elementor-id="4824"');
const pageHtml = html.slice(pageStart, footerStart);
fs.writeFileSync(path.join(__dirname, '_t6_page_raw.html'), pageHtml);
console.log('page', pageHtml.length, 'lines', pageHtml.split('\n').length);

// Footer until end of elementor-4824 roughly - find next script after footer or closing body-wrapper
let footerEnd = html.indexOf('</div>\n\t\t</div>\n\t\t<!-- End Footer', footerStart);
if (footerEnd < 0) {
  // find last elementor-4824 closing by counting - take 120k chars
  footerEnd = Math.min(html.length, footerStart + 120000);
}
const footerHtml = html.slice(footerStart, footerEnd);
fs.writeFileSync(path.join(__dirname, '_t6_footer_raw.html'), footerHtml);
console.log('footer', footerHtml.length);

// Also dump post-4337 style if present in page area before content
const style4337 = [...html.matchAll(/<style[^>]*id="([^"]*4337[^"]*)"[^>]*>([\s\S]*?)<\/style>/g)];
console.log('styles 4337', style4337.length);
for (const m of style4337) {
  fs.appendFileSync(path.join(__dirname, '../../public/assets/theme6/css/elementor-inline.css'), `\n/* ${m[1]} */\n${m[2]}\n`);
}

// Find all style ids
const allStyles = [...html.matchAll(/<style[^>]*id="([^"]+)"[^>]*>/g)].map((m) => m[1]);
console.log('all style ids', allStyles);
