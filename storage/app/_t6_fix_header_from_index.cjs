const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../public/layout6/index.html'), 'utf8');

const headerStart = html.indexOf('<div data-elementor-type="wp-post" data-elementor-id="4823"');
const mainStart = html.indexOf('<div class="container">', headerStart);
if (headerStart < 0 || mainStart < 0) {
  console.error('header bounds missing', headerStart, mainStart);
  process.exit(1);
}

let header = html.slice(headerStart, mainStart);

// Rewrite asset paths to /layout6/...
header = header
  .replace(/(src|href)="(wp-content\/[^"]+)"/g, '$1="/layout6/$2"')
  .replace(/(src|href)="(wp-includes\/[^"]+)"/g, '$1="/layout6/$2"')
  .replace(/url\((['"]?)(?:\.\/)?wp-content\//g, 'url($1/layout6/wp-content/')
  .replace(/url\((['"]?)(?:\.\/)?wp-includes\//g, 'url($1/layout6/wp-includes/');

const outClean = path.join(__dirname, '_t6_header_clean.html');
const outMarkup = path.join(__dirname, '../../resources/js/themes/theme6/markup/header.html');
fs.writeFileSync(outClean, header);
fs.writeFileSync(outMarkup, header);

const menuIdx = header.indexOf('id="menu-primary-menu"');
const sample = header.slice(menuIdx, menuIdx + 350);
console.log('wrote', header.length, 'bytes');
console.log('primary menu sample:\n', sample);
console.log('dropdown-menu empty count', (header.match(/<ul class="dropdown-menu"><\/ul>/g) || []).length);
console.log('dropdown-menu nav-level1 count', (header.match(/dropdown-menu nav-level1/g) || []).length);
