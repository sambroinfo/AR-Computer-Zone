const fs = require('fs');
const lines = fs.readFileSync('c:/xampp/htdocs/layout6/index.pretty.html', 'utf8').split('\n');

function dump(start, end, file) {
  const chunk = lines.slice(start - 1, end).join('\n');
  fs.writeFileSync(file, chunk);
  console.log(file, 'lines', end - start + 1, 'bytes', chunk.length);
}

// Find footer start
let footerLine = -1;
let contentEnd = -1;
lines.forEach((l, i) => {
  if (footerLine < 0 && /footer-elementor|site-footer|class="[^"]*footer/i.test(l) && /elementor-element/.test(l)) {
    footerLine = i + 1;
  }
  if (/<\/body>/i.test(l)) contentEnd = i + 1;
});
console.log('footerLine', footerLine, 'contentEnd', contentEnd);

dump(240, 1570, 'c:/xampp/htdocs/storage/app/_t6_header.html');
dump(1570, 2300, 'c:/xampp/htdocs/storage/app/_t6_hero_products.html');
dump(1620, 1720, 'c:/xampp/htdocs/storage/app/_t6_product_card.html');
if (footerLine > 0) dump(footerLine, Math.min(footerLine + 400, contentEnd || lines.length), 'c:/xampp/htdocs/storage/app/_t6_footer.html');

// Collect unique stylesheet hrefs for blade (normalize to /layout6/...)
const raw = fs.readFileSync('c:/xampp/htdocs/layout6/index.html', 'utf8');
const hrefs = [...raw.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
const css = hrefs
  .filter((h) => /\.css/i.test(h))
  .map((h) => {
    let p = h.replace(/^\.\.\//, '').split('?')[0];
    if (!p.startsWith('http') && !p.startsWith('/')) p = '/layout6/' + p;
    if (p.startsWith('wp-')) p = '/layout6/' + p;
    return p;
  });
fs.writeFileSync('c:/xampp/htdocs/storage/app/_t6_css.json', JSON.stringify([...new Set(css)], null, 2));
console.log('css', css.length);
