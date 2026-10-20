import path from 'node:path';
import { rm, mkdir } from 'node:fs/promises';
import { ROOT, startServer, launchBrowser, parseArgs } from './serve.mjs';

const { opts, positional } = parseArgs();
const FPS = Number(opts.fps || positional[1] || 30);
const DURATION = Number(opts.duration || positional[0] || 2);
const START = Number(opts.start || 0);
const OUT_DIR = path.resolve(ROOT, opts.out || 'out/frames');
const KEEP = !!opts.keep;

await mkdir(OUT_DIR, { recursive: true });
if (!KEEP) await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const { server, port } = await startServer();
const browser = await launchBrowser();
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
  const t = START + i / FPS;
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
console.log(`captured ${total} frames (${START}s + ${DURATION}s) in ${seconds}s -> ${OUT_DIR}`);

await browser.close();
server.close();
