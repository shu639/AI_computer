import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { ROOT, startServer, launchBrowser, parseArgs } from './serve.mjs';

const LOGICAL_W = 960;
const LOGICAL_H = 540;

const { opts } = parseArgs();
const scale = Math.max(1, Number(opts.scale || 1));
const times = String(opts.times || '0')
  .split(',')
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n));
const OUT_DIR = path.resolve(ROOT, opts.out || 'preview/stills');

await mkdir(OUT_DIR, { recursive: true });

const { server, port } = await startServer();
const browser = await launchBrowser();
const page = await browser.newPage({
  viewport: { width: LOGICAL_W * scale, height: LOGICAL_H * scale },
  deviceScaleFactor: 1,
});

page.on('console', (msg) => console.log('PAGE:', msg.text()));
page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message));

await page.goto(`http://127.0.0.1:${port}/src/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });

if (scale !== 1) {
  await page.addStyleTag({
    content: `canvas { width: ${LOGICAL_W * scale}px !important; height: ${LOGICAL_H * scale}px !important; }`,
  });
}

for (const t of times) {
  await page.evaluate((time) => window.render(time), t);
  const name = `t-${t.toFixed(2).padStart(7, '0')}${scale > 1 ? `@${scale}x` : ''}.png`;
  await page.screenshot({
    path: path.join(OUT_DIR, name),
    clip: { x: 0, y: 0, width: LOGICAL_W * scale, height: LOGICAL_H * scale },
    type: 'png',
  });
  console.log('still', t.toFixed(2), '->', name);
}

console.log(`captured ${times.length} stills -> ${OUT_DIR}`);
await browser.close();
server.close();
