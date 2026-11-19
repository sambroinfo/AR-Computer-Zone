const fs = require('fs');
const path = require('path');
const h = fs.readFileSync(path.join(__dirname, '../../layout6/index.pretty.html'), 'utf8');
const needle = 'data-elementor-id="4824"';
const i = h.indexOf(needle);
console.log('index', i, 'line', h.slice(0, i).split('\n').length);
const start = h.lastIndexOf('<div', i);
const end = Math.min(h.length, i + 80000);
fs.writeFileSync(path.join(__dirname, '_t6_footer_chunk.html'), h.slice(start, end));
console.log('chunk', end - start);

// Also grab main content wrapper start
const main = h.indexOf('elementor-page-4337');
console.log('page body class area');
const content = h.indexOf('data-elementor-id="4337"');
console.log('content 4337', content, 'line', h.slice(0, content).split('\n').length);
