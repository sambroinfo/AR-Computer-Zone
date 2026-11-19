const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../layout6/index.pretty.html'), 'utf8');
let out = '';

const styles = [...html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/gi)];
styles.forEach((m, i) => {
  const id = (m[1].match(/id=["']([^"']+)["']/) || [])[1] || `style-${i}`;
  out += `/* ${id} */\n${m[2]}\n`;
});

out += `
/* Theme6 runtime fixes */
.elementor-invisible{opacity:1!important;visibility:visible!important;transform:none!important}
body.home-style6 .body-wrapper{overflow:visible}
img{max-width:100%;height:auto}
.t6-hide{display:none!important}
`;

const dest = path.join(__dirname, '../../public/assets/theme6/css/elementor-inline.css');
fs.writeFileSync(dest, out);
console.log('styles', styles.length, 'bytes', out.length);
console.log({
  has4337: out.includes('.elementor-4337'),
  has4823: out.includes('.elementor-4823'),
  has4824: out.includes('.elementor-4824'),
});
