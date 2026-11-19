const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../public/layout6/index.html'), 'utf8');
const open = '<div data-elementor-type="wp-page" data-elementor-id="4337"';
const pageStart = html.indexOf(open);
if (pageStart < 0) {
  console.error('page start missing');
  process.exit(1);
}

let i = pageStart;
let depth = 0;
let pageEnd = -1;
const re = /<\/?div\b[^>]*>/gi;
re.lastIndex = pageStart;
let m;
while ((m = re.exec(html))) {
  const tag = m[0];
  if (/^<\//.test(tag)) {
    depth -= 1;
    if (depth === 0) {
      pageEnd = m.index + tag.length;
      break;
    }
  } else if (!/\/>$/.test(tag)) {
    depth += 1;
  }
}

if (pageEnd < 0) {
  console.error('could not balance page');
  process.exit(1);
}

let page = html.slice(pageStart, pageEnd);
page = page
  .replace(/(src|href)="(wp-content\/[^"]+)"/g, '$1="/layout6/$2"')
  .replace(/(src|href)="(wp-includes\/[^"]+)"/g, '$1="/layout6/$2"')
  .replace(/(src|data-lazyload|data-src)="(wp-content\/[^"]+)"/g, '$1="/layout6/$2"')
  .replace(/url\((['"]?)(?:\.\/)?wp-content\//g, 'url($1/layout6/wp-content/')
  .replace(/srcset="([^"]+)"/g, (_, set) => {
    const fixed = set
      .split(',')
      .map((part) => {
        const trimmed = part.trim();
        if (trimmed.startsWith('wp-content/') || trimmed.startsWith('wp-includes/')) {
          return '/layout6/' + trimmed;
        }
        return trimmed.replace(/(^|\s)(wp-content\/\S+)/g, '$1/layout6/$2');
      })
      .join(', ');
    return `srcset="${fixed}"`;
  });

const outDir = path.join(__dirname, '../../resources/js/themes/theme6/markup');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(__dirname, '_t6_page_clean.html'), page);
fs.writeFileSync(path.join(outDir, 'home.html'), page);
console.log('page', page.length);
console.log('has slider', page.includes('rev_slider') || page.includes('slider61') || page.includes('rs-module'));
console.log('has deal', /deal of the day/i.test(page));
console.log('has vendor', /vendor avenue/i.test(page));
console.log('has brand', /brand avenue/i.test(page));
console.log('has combo', /combo/i.test(page));
