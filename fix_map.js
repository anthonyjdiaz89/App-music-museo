const fs = require('fs');
const path = 'assets/audio/map.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/: '\.\/(.*?)',/g, ": require('./$1'),");
content = content.replace(/Record<string, string>/, 'Record<string, any>');
fs.writeFileSync(path, content);
console.log('Fixed map.ts');
