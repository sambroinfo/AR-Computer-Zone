const fs = require('fs');
const lines = fs.readFileSync('c:/xampp/htdocs/layout6/index.pretty.html', 'utf8').split('\n');

const interesting = [];
lines.forEach((l, i) => {
  const t = l.trim();
  if (
    /id="(header|masthead|footer|content|primary|wrapper|page)"/i.test(t) ||
    /class="[^"]*(site-header|header-|topdeal|sw-|elementor-section|footer-|products|product-|banner|slider|homepage)[^"]*"/i.test(t) ||
    /<!--/.test(t)
  ) {
    if (interesting.length < 120) interesting.push({ line: i + 1, text: t.slice(0, 180) });
  }
});
interesting.forEach((x) => console.log(x.line, x.text));

// Also dump CSS link block from original for blade
const raw = fs.readFileSync('c:/xampp/htdocs/layout6/index.html', 'utf8');
const head = raw.match(/<head[\s\S]*?<\/head>/i);
if (head) {
  const links = [...head[0].matchAll(/<link[^>]+>/gi)].map((m) => m[0]);
  fs.writeFileSync('c:/xampp/htdocs/storage/app/_layout6_links.html', links.join('\n'));
  console.log('\nlink tags', links.length);
}
