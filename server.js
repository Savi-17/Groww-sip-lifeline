import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assistant from './api/assistant.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const MODEL = 'openai/gpt-oss-120b';
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon' };
function send(res, status, payload) { res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' }); res.end(JSON.stringify(payload)); }

const server = http.createServer(async (req,res) => {
  const url = new URL(req.url, `http://${req.headers.host || '0.0.0.0'}`);
  if (req.method === 'GET' && url.pathname === '/api/health') { res.writeHead(200, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' }); return res.end(JSON.stringify({ ok:true, provider:'groq', configured:Boolean(process.env.GROQ_API_KEY), model:MODEL })); }
  if (req.method === 'POST' && url.pathname === '/api/assistant') return assistant(req,res);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error:'Method not allowed' });
  let pathname; try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400).end('Bad request'); return; }
  if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`) || file === path.join(root,'.env')) { res.writeHead(403).end('Forbidden'); return; }
  try {
    if (!statSync(file).isFile()) throw new Error('Not a file');
    res.writeHead(200, { 'Content-Type':mime[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Cache-Control':'no-cache' });
    if (req.method === 'HEAD') res.end(); else createReadStream(file).pipe(res);
  } catch { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}).end('Not found'); }
});
server.listen(PORT, '0.0.0.0', () => console.log(`Groww SIP Lifeline AI running on port ${PORT}`));
