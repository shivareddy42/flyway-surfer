import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.bin':'application/octet-stream','.txt':'text/plain'};
http.createServer((req,res)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));}catch{res.writeHead(400);res.end();return;}if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}if(file===root)file=path.join(root,'index.html');fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});}).listen(4173,'127.0.0.1',()=>console.log('Flyway Surfer: http://127.0.0.1:4173'));
