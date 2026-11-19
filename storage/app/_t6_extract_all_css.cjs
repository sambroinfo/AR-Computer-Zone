const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../layout6/index.pretty.html'), 'utf8');
const headEnd = html.indexOf('</head>');
const head = html.slice(0, headEnd);

const styles = [...head.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/gi)];
console.log('head styles', styles.length);
let out = '';
styles.forEach((m, i) => {
  const attrs = m[1];
  const id = (attrs.match(/id=["']([^"']+)["']/) || [])[1] || `style-${i}`;
  console.log(i, id, m[2].length);
  out += `/* ${id} */\n${m[2]}\n`;
});

const outPath = path.join(__dirname, '../../public/assets/theme6/css/elementor-inline.css');
fs.writeFileSync(outPath, out);
console.log('wrote', out.length, 'to', outPath);

// Also ensure body classes and e-con CSS variables work - dump kit CSS snippet check
const has4337 = out.includes('.elementor-4337');
const has4823 = out.includes('.elementor-4823');
const has4824 = out.includes('.elementor-4824');
console.log({ has4337, has4823, has4824 });
