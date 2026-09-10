import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');
function list(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let refs=0;
for(const file of list(root).filter(f=>/\.(html|css|js)$/.test(f))){const text=fs.readFileSync(file,'utf8');const patterns= file.endsWith('.html')?[/\b(?:src|href)="(\.[^"]+)"/g]:file.endsWith('.css')?[/url\(['"]?(\.[^'"\)]+)['"]?\)/g]:[/\bfrom ['"](\.[^'"]+)['"]/g,/\bfetch\(['"](\.[^'"]+)['"]\)/g];for(const re of patterns)for(const match of text.matchAll(re)){const target=path.resolve(path.dirname(file),match[1]);assert.ok(fs.existsSync(target),`Missing ${match[1]} referenced by ${file}`);refs++;}}
const ids=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'duplicate DOM ids');for(const m of fs.readFileSync(path.join(root,'main.js'),'utf8').matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(m[1]),`Missing UI element ${m[1]}`);
console.log(`Validated ${refs} local asset references and ${ids.length} unique UI ids.`);
