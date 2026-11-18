// Test-only static host. Fault injection is never shipped in the application.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
let version = 'original';
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
};
http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/__qa/version' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      version = body;
      res.end('ok');
      return;
    }
    const root = path.resolve('dist/client'),
      relative = decodeURIComponent(url.pathname === '/' ? 'index.html' : url.pathname.slice(1)),
      file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      let content = await fs.readFile(file);
      if (relative === 'sw.js') {
        const failure =
          version === 'failed'
            ? "self.addEventListener('install',e=>e.waitUntil(Promise.reject(new Error('QA failed update'))));"
            : '';
        content = Buffer.concat([content, Buffer.from(`\n// QA version ${version}\n${failure}`)]);
      }
      res.setHeader('Content-Type', types[path.extname(file)] ?? 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-store');
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  })
  .listen(4173, '127.0.0.1', () => console.log('QA static host http://127.0.0.1:4173'));
