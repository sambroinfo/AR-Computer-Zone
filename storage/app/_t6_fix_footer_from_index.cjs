const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../public/layout6/index.html'), 'utf8');
const open = '<div data-elementor-type="wp-post" data-elementor-id="4824"';
const footerStart = html.indexOf(open);
if (footerStart < 0) {
  console.error('footer start missing');
  process.exit(1);
}

// Walk balanced divs from the elementor-4824 root
let i = footerStart;
let depth = 0;
let footerEnd = -1;
const re = /<\/?div\b[^>]*>/gi;
re.lastIndex = footerStart;
let m;
while ((m = re.exec(html))) {
  const tag = m[0];
  if (/^<\//.test(tag)) {
    depth -= 1;
    if (depth === 0) {
      footerEnd = m.index + tag.length;
      break;
    }
  } else if (!/\/>$/.test(tag)) {
    depth += 1;
  }
}

if (footerEnd < 0) {
  console.error('could not balance footer');
  process.exit(1);
}

let footer = html.slice(footerStart, footerEnd);
footer = footer
  .replace(/(src|href)="(wp-content\/[^"]+)"/g, '$1="/layout6/$2"')
  .replace(/(src|href)="(wp-includes\/[^"]+)"/g, '$1="/layout6/$2"');

fs.writeFileSync(path.join(__dirname, '_t6_footer_clean.html'), footer);
fs.writeFileSync(path.join(__dirname, '../../resources/js/themes/theme6/markup/footer.html'), footer);
console.log('footer', footer.length, 'end snippet:', footer.slice(-120).replace(/\s+/g, ' '));
