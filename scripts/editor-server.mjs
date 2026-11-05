import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let currentPort = parseInt(process.env.PORT || '3001', 10);
const HTML_FILE = path.join(projectRoot, 'src', 'menu.html');
const OUTPUT_DIR = path.join(projectRoot, 'output');
const ASSETS_DIR = path.join(projectRoot, 'assets');
const EDITOR_DIR = path.join(projectRoot, 'editor');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf'
};

// SSE Client list
const sseClients = new Set();

function broadcastSSE(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Watch src/menu.html for external changes (Zero-Refresh Live Sync)
let watchDebounceTimer = null;
fs.watch(HTML_FILE, (eventType) => {
  if (eventType === 'change') {
    clearTimeout(watchDebounceTimer);
    watchDebounceTimer = setTimeout(() => {
      try {
        console.log('[LIVE SYNC] Detected change in menu.html, broadcasting to studio...');
        const updatedHtml = fs.readFileSync(HTML_FILE, 'utf8');
        broadcastSSE('menu-reload', { html: updatedHtml, timestamp: Date.now() });
      } catch (err) {
        console.warn('[LIVE SYNC] Error reading updated HTML:', err.message);
      }
    }, 150);
  }
});

function serveStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 Not Found: ${path.basename(filePath)}`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.message}`);
      }
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(urlObj.pathname);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // SSE: GET /api/events -> Real-Time Live Sync & AI Ghost Cursor Stream
    if (pathname === '/api/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write(': connected\n\n');
      sseClients.add(res);
      console.log(`[SSE] Studio client connected (${sseClients.size} active)`);

      req.on('close', () => {
        sseClients.delete(res);
        console.log(`[SSE] Studio client disconnected (${sseClients.size} active)`);
      });
      return;
    }

    // API: POST /api/ai-action -> Broadcast AI Ghost Cursor & Live Typing
    if (pathname === '/api/ai-action' && req.method === 'POST') {
      const actionPayload = await parseJsonBody(req);
      broadcastSSE('ai-action', actionPayload);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, broadcastedTo: sseClients.size }));
      return;
    }

    // API: GET /api/menu -> Get current HTML content
    if (pathname === '/api/menu' && req.method === 'GET') {
      const html = fs.readFileSync(HTML_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, html }));
      return;
    }

    // API: POST /api/save -> Save updated HTML content
    if (pathname === '/api/save' && req.method === 'POST') {
      const { html } = await parseJsonBody(req);
      if (!html || typeof html !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Missing html field' }));
        return;
      }
      fs.writeFileSync(HTML_FILE, html, 'utf8');
      console.log(`[SAVE] Updated ${HTML_FILE} (${Math.round(html.length / 1024)} KB)`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Menu saved successfully' }));
      return;
    }

    // API: POST /api/compile -> Run Playwright verification & PDF compiler
    if (pathname === '/api/compile' && req.method === 'POST') {
      console.log('[COMPILE] Triggering Playwright verify-and-build...');
      const scriptPath = path.join(projectRoot, 'scripts', 'verify-and-build.mjs');
      
      const child = spawn(process.execPath, [scriptPath], {
        cwd: projectRoot,
        env: { ...process.env }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', data => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      child.on('close', code => {
        const passed = code === 0 && stdout.includes('ALL 5 A4 PAGES PASSED');
        const pdfPath = path.join(OUTPUT_DIR, 'crave-lab-menu-a4-production.pdf');
        const pdfExists = fs.existsSync(pdfPath);
        const pdfSize = pdfExists ? fs.statSync(pdfPath).size : 0;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: code === 0,
          passed,
          exitCode: code,
          stdout,
          stderr,
          pdf: {
            exists: pdfExists,
            size: pdfSize,
            filename: 'crave-lab-menu-a4-production.pdf',
            url: '/output/crave-lab-menu-a4-production.pdf'
          }
        }));
      });
      return;
    }

    // Static route: /output/*
    if (pathname.startsWith('/output/')) {
      const relPath = pathname.replace('/output/', '');
      const filePath = path.join(OUTPUT_DIR, relPath);
      serveStatic(res, filePath);
      return;
    }

    // Static route: /assets/*
    if (pathname.startsWith('/assets/')) {
      const relPath = pathname.replace('/assets/', '');
      const filePath = path.join(ASSETS_DIR, relPath);
      serveStatic(res, filePath);
      return;
    }

    // Static route: /src/*
    if (pathname.startsWith('/src/')) {
      const relPath = pathname.replace('/src/', '');
      const filePath = path.join(projectRoot, 'src', relPath);
      serveStatic(res, filePath);
      return;
    }

    // Static route: /editor/* or Root /
    let editorFilePath = path.join(EDITOR_DIR, pathname === '/' ? 'index.html' : pathname.replace('/editor/', ''));
    if (fs.existsSync(editorFilePath) && fs.statSync(editorFilePath).isFile()) {
      serveStatic(res, editorFilePath);
      return;
    }

    // Fallback: if requesting root, serve editor/index.html
    if (pathname === '/') {
      serveStatic(res, path.join(EDITOR_DIR, 'index.html'));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  } catch (err) {
    console.error('Server exception:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🎨 CRAVE LAB ILLUSTRATOR CANVAS STUDIO (LIVE SYNC)`);
    console.log(`====================================================`);
    console.log(`URL: http://localhost:${port}`);
    console.log(`Live Document: ${HTML_FILE}`);
    console.log(`Live Event Stream: http://localhost:${port}/api/events`);
    console.log(`Compilation Engine: scripts/verify-and-build.mjs`);
    console.log(`====================================================\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${currentPort} in use, trying port ${currentPort + 1}...`);
    currentPort += 1;
    startServer(currentPort);
  } else {
    console.error('Server error:', err);
  }
});

startServer(currentPort);

export { server, currentPort, broadcastSSE };
