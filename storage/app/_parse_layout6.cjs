const fs = require('fs');
const path = require('path');

const files = [
  'c:/xampp/htdocs/layout6/index.html',
  'c:/xampp/htdocs/layout6/home/index.html',
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('missing', file);
    continue;
  }
  const h = fs.readFileSync(file, 'utf8');
  console.log('\n====', file, 'bytes', h.length);
  const title = h.match(/<title[^>]*>([^<]+)/i);
  console.log('title:', title && title[1]);
  const css = [...h.matchAll(/href=["']([^"']+\.css[^"']*)["']/gi)].map((m) => m[1]);
  console.log('css count', css.length);
  css.slice(0, 20).forEach((c) => console.log(' ', c));
  const bodyClass = h.match(/<body[^>]*class=["']([^"']+)/i);
  console.log('body:', bodyClass && bodyClass[1]);
  // class name frequencies for structure
  const pretty = h.replace(/></g, '>\n<');
  fs.writeFileSync(file.replace(/\.html$/, '.pretty.html'), pretty);
  console.log('pretty lines', pretty.split('\n').length);
}
