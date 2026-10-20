import { W, H, C, quantize } from './palette.js';
import { fill, rect, lineH, lineV, panel, text, typewriter, sprite } from './draw.js';

const SAMPLE =
  '你好AI取指译码执行写回发送芯片每一次回答都是几十亿次这样的奔跑下集GPU为什么能同时做一万件事0123456789.,:;!?%/[]()';

const ROBOT = [
  '....4444....',
  '...444444...',
  '..44444444..',
  '..4d4444d4..',
  '..44444444..',
  '...444444...',
  '....4444....',
  '...dddddd...',
  '..dd8dd8dd..',
  '..dddddddd..',
  '...d....d...',
  '..dd....dd..',
];

function drawCircuit(ctx) {
  for (let y = 12; y < 150; y += 24) lineH(ctx, 0, y, W, C.charcoal);
  for (let x = 16; x < W; x += 48) lineV(ctx, x, 0, 150, C.charcoal);
  for (let y = 12; y < 150; y += 24) {
    for (let x = 16; x < W; x += 48) {
      rect(ctx, x - 1, y - 1, 3, 3, C.slate);
    }
  }
}

function drawHook(ctx, t) {
  fill(ctx, C.ink);
  drawCircuit(ctx);

  panel(ctx, 24, 20, 272, 118, { fill: C.navy, border: C.silver, shadow: C.charcoal });
  rect(ctx, 26, 22, 268, 14, C.blue);
  text(ctx, 'AI CHAT', 32, 24, { color: C.white });
  text(ctx, '● LIVE', 288, 24, { color: C.lime, align: 'right' });

  // User message
  rect(ctx, 150, 42, 126, 20, C.blue);
  text(ctx, '你好，AI', 158, 46, { color: C.white });
  // Blinking cursor after the message
  if (Math.floor(t * 2) % 2 === 0) rect(ctx, 266, 48, 3, 8, C.yellow);

  // Thinking status
  const dots = '.'.repeat(1 + (Math.floor(t * 3) % 3));
  rect(ctx, 38, 70, 150, 18, C.charcoal);
  text(ctx, '正在思考' + dots, 46, 74, { color: C.silver });

  // Send button
  rect(ctx, 228, 70, 48, 20, C.orange);
  text(ctx, '发送', 238, 74, { color: C.ink });

  // Little robot
  sprite(ctx, ROBOT, 42, 98);
  text(ctx, 'BIT', 58, 104, { color: C.silver });

  // Signal spark travelling along the bottom trace
  const px = 20 + Math.floor((t / 4) * 276);
  rect(ctx, px, 143, 3, 3, C.yellow);
  rect(ctx, px - 3, 144, 2, 1, C.orange);
  rect(ctx, px + 4, 144, 2, 1, C.orange);

  // Chapter label
  text(ctx, '01 / 发送', 6, 3, { color: C.silver });
  text(ctx, Math.min(0.3, t * 0.1).toFixed(1) + 's', 314, 3, { color: C.yellow, align: 'right' });

  // Subtitle band
  rect(ctx, 0, 152, W, 28, C.ink);
  lineH(ctx, 0, 152, W, C.slate);
  text(ctx, typewriter('你按下发送键。', t, 0.25, 10), 10, 159, { color: C.white });
}

function drawPlaceholder(ctx, t) {
  fill(ctx, C.ink);
  panel(ctx, 36, 42, 248, 96, { fill: C.navy, border: C.silver });
  text(ctx, 'PHASE 0 OK', 60, 58, { color: C.lime, size: 24 });
  text(ctx, 't = ' + t.toFixed(2) + 's', 60, 96, { color: C.white });
  text(ctx, '320x180 -> 1920x1080 x6', 60, 114, { color: C.silver });
}

const SCENES = [
  { start: 0, end: 4, draw: drawHook },
];

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });

window.DURATION = 60;
window.FPS = 30;
window.render = (t) => {
  ctx.imageSmoothingEnabled = false;
  const scene = SCENES.find((s) => t >= s.start && t < s.end);
  if (scene) scene.draw(ctx, t - scene.start, t);
  else drawPlaceholder(ctx, t);
  quantize(ctx, W, H);
};

await document.fonts.load(
  '12px "Fusion Pixel 12px Monospaced Simplified Chinese"',
  SAMPLE
);
await document.fonts.ready;
const metrics = ctx.measureText('发送');
console.log('FONT_METRICS', JSON.stringify({
  width: metrics.width,
  actualAscent: metrics.actualBoundingBoxAscent,
  actualDescent: metrics.actualBoundingBoxDescent,
  fontAscent: metrics.fontBoundingBoxAscent,
  fontDescent: metrics.fontBoundingBoxDescent,
}));
window.render(0);
window.__ready = true;
