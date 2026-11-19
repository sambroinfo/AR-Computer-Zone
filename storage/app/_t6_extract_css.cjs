const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../layout6/index.pretty.html'), 'utf8');
const styles = [...html.matchAll(/<style[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/style>/g)];
console.log('inline styles', styles.length);

const outDir = path.join(__dirname, '../../public/assets/theme6/css');
fs.mkdirSync(outDir, { recursive: true });

let out = '';
for (const m of styles) {
  out += `/* ${m[1]} */\n${m[2]}\n`;
}
fs.writeFileSync(path.join(outDir, 'elementor-inline.css'), out);
console.log('wrote elementor-inline.css', out.length);

// Collect stylesheet hrefs
const hrefs = [...html.matchAll(/<link[^>]+rel=['"]stylesheet['"][^>]*>/gi)].map((m) => {
  const href = m[0].match(/href=['"]([^'"]+)['"]/i);
  return href ? href[1].replace(/\?.*$/, '').replace(/^\.\.\//g, '') : null;
}).filter(Boolean);

const local = hrefs
  .filter((h) => h.startsWith('wp-content/') || h.startsWith('wp-includes/'))
  .map((h) => h.replace(/^\.\.\//, ''));

fs.writeFileSync(path.join(__dirname, '_t6_css_full.json'), JSON.stringify([...new Set(local)], null, 2));
console.log('css files', [...new Set(local)].length);

// Footer extract
const markers = ['data-elementor-id="4824"', 'elementor-location-footer', 'class="footer"', 'id="footer"'];
for (const mk of markers) {
  console.log(mk, html.indexOf(mk));
}

const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
if (footerMatch) {
  fs.writeFileSync(path.join(__dirname, '_t6_footer_tag.html'), footerMatch[0].slice(0, 50000));
  console.log('footer tag', footerMatch[0].length);
}
