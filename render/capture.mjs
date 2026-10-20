import http from 'node:http';
import path from 'node:path';
import { readFile, rm, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(import.meta.dirname, '..');
const FPS = Number(process.argv[3] || 30);
const DURATION = Number(process.argv[2] || 2);
const OUT_DIR = path.join(ROOT, 'out', 'frames');
const KEEP = process.argv.includes('--keep');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function startServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(ROOT, '.' + urlPath);
      if (!file.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('forbidden');
        return;
      }
      const data = await readFile(file);
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function launch() {
  try {
    return await chromium.launch({ channel: 'chrome', headless: true });
  } catch (err) {
    const fallback = path.join(
      process.env.LOCALAPPDATA || '',
      'ms-playwright',
      'chromium-1223',
      'chrome-win64',
      'chrome.exe'
    );
    console.warn('chrome channel failed, falling back to:', fallback);
    return chromium.launch({ executablePath: fallback, headless: true });
  }
}

await mkdir(OUT_DIR, { recursive: true });
if (!KEEP) await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const { server, port } = await startServer();
const browser = await launch();
const page = await browser.newPage({
  viewport: { width: 320, height: 180 },
  deviceScaleFactor: 1,
});

page.on('console', (msg) => console.log('PAGE:', msg.text()));
page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message));

await page.goto(`http://127.0.0.1:${port}/src/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });

const total = Math.round(DURATION * FPS);
const started = Date.now();

for (let i = 0; i < total; i++) {
  const t = i / FPS;
  await page.evaluate((time) => window.render(time), t);
  await page.screenshot({
    path: path.join(OUT_DIR, String(i + 1).padStart(5, '0') + '.png'),
    clip: { x: 0, y: 0, width: 320, height: 180 },
    type: 'png',
  });
  if (i % 30 === 0) {
    console.log(`frame ${i + 1}/${total} t=${t.toFixed(2)}s`);
  }
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`captured ${total} frames in ${seconds}s -> ${OUT_DIR}`);

await browser.close();
server.close();
