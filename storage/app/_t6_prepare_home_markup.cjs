const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../../resources/js/themes/theme6/markup/home.html');
let html = fs.readFileSync(src, 'utf8');

const local1 = path.join(__dirname, '../../public/uploads/theme6/hero/slider61.jpg');
const local2 = path.join(__dirname, '../../public/uploads/theme6/hero/slider62.jpg');
const destDir = path.join(__dirname, '../../public/layout6/wp-content/uploads/2020/10');
fs.mkdirSync(destDir, { recursive: true });
if (fs.existsSync(local1)) fs.copyFileSync(local1, path.join(destDir, 'slider61.jpg'));
if (fs.existsSync(local2)) fs.copyFileSync(local2, path.join(destDir, 'slider62.jpg'));

html = html
  .replace(/\/\/demo2\.wpthemego\.com\/themes\/sw_topdeal\/layout6\/wp-content\//g, '/layout6/wp-content/')
  .replace(/https?:\/\/demo2\.wpthemego\.com\/themes\/sw_topdeal\/layout6\/wp-content\//g, '/layout6/wp-content/')
  .replace(/\s+srcset="[^"]*"/g, '')
  .replace(/\s+sizes="[^"]*"/g, '')
  .replace(/https:\/layout6\//g, '/layout6/')
  .replace(/href="(?:\.\/)?(?:home\/)?index\.html"/g, 'href="/"')
  .replace(/href="wishlist\/index\.html"/g, 'href="/wishlist"')
  .replace(/href="product-category\/([^"/]+)\/index\.html"/g, 'href="/category/$1"')
  .replace(/href="product\/([^"/]+)\/index[^"]*"/g, 'href="/product/$1"')
  .replace(/href="shop\/index\.html"/g, 'href="/shop"');

const start = html.indexOf('<div class="wp-block-themepunch-revslider">');
const endMarker = '<!-- END REVOLUTION SLIDER -->';
const endMarkerIdx = html.indexOf(endMarker, start);
if (start < 0 || endMarkerIdx < 0) {
  console.error('rev slider bounds missing', start, endMarkerIdx);
  process.exit(1);
}
const end = html.indexOf('</div>', endMarkerIdx) + 6;

const slider = `<div class="wp-block-themepunch-revslider">
  <div id="t6-home-slider" class="t6-rev">
    <a class="t6-rev__slide is-active" href="/shop" aria-label="Slide 1">
      <img src="/layout6/wp-content/uploads/2020/10/slider61.jpg" alt="Slide 1" width="830" height="420" decoding="async">
    </a>
    <a class="t6-rev__slide" href="/shop" aria-label="Slide 2">
      <img src="/layout6/wp-content/uploads/2020/10/slider62.jpg" alt="Slide 2" width="830" height="420" decoding="async">
    </a>
    <div class="t6-rev__dots">
      <button type="button" class="is-active" data-t6-slide="0" aria-label="Slide 1"></button>
      <button type="button" data-t6-slide="1" aria-label="Slide 2"></button>
    </div>
  </div>
</div>`;

html = html.slice(0, start) + slider + html.slice(end);

fs.writeFileSync(src, html);
fs.writeFileSync(path.join(__dirname, '_t6_page_clean.html'), html);
console.log('prepared', html.length, 'cdn left', (html.match(/demo2\.wpthemego/g) || []).length);
