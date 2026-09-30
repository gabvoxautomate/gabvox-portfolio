const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, 'dist');
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webp': 'image/webp',
};

http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400);
    response.end('Invalid URL');
    return;
  }

  let file = path.resolve(root, `.${pathname}`);
  const relativePath = path.relative(root, file);
  if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  }

  fs.readFile(file, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'EACCES' ? 403 : 404);
      response.end(error.code === 'EACCES' ? 'Forbidden' : 'Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': path.extname(file) === '.html'
        ? 'no-cache'
        : 'public, max-age=3600, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  });
}).listen(4173, () => console.log('Gabvox preview: http://localhost:4173'));
