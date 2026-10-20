import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { ROOT, startServer, launchBrowser, parseArgs } from './serve.mjs';

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
  viewport: { width: 320 * scale, height: 180 * scale },
  deviceScaleFactor: 1,
});

page.on('console', (msg) => console.log('PAGE:', msg.text()));
page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message));

await page.goto(`http://127.0.0.1:${port}/src/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });

if (scale > 1) {
  await page.addStyleTag({
    content: `canvas { width: ${320 * scale}px !important; height: ${180 * scale}px !important; }`,
  });
}

for (const t of times) {
  await page.evaluate((time) => window.render(time), t);
  const name = `t-${t.toFixed(2).padStart(7, '0')}${scale > 1 ? `@${scale}x` : ''}.png`;
  await page.screenshot({
    path: path.join(OUT_DIR, name),
    ...(scale === 1 ? { clip: { x: 0, y: 0, width: 320, height: 180 } } : {}),
    type: 'png',
  });
  console.log('still', t.toFixed(2), '->', name);
}

console.log(`captured ${times.length} stills -> ${OUT_DIR}`);
await browser.close();
server.close();
