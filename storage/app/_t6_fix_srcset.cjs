const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../../resources/js/themes/theme6/markup/home.html');
let h = fs.readFileSync(p, 'utf8');
h = h
  .replace(/\s+srcset="[^"]*"/g, '')
  .replace(/\s+sizes="[^"]*"/g, '')
  .replace(/https:\/layout6\//g, '/layout6/')
  .replace(/http:\/layout6\//g, '/layout6/');
fs.writeFileSync(p, h);
console.log('fixed', h.length);
