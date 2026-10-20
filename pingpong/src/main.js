import { W, H, C, quantize } from './palette.js';
import { fill, panel, text } from './draw.js';
import { DURATION, FPS, ALL_TEXT } from './timeline.js';
import { drawHUD } from './hud.js';
import { SCENES } from './scenes/index.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });

function drawPlaceholder(ctx, t) {
  fill(ctx, C.ink);
  panel(ctx, 36, 42, 248, 96, { fill: C.navy, border: C.silver });
  text(ctx, 'SCENE WIP', 60, 58, { color: C.lime, size: 24 });
  text(ctx, 't = ' + t.toFixed(2) + 's', 60, 96, { color: C.white });
  text(ctx, '320x180 -> 1920x1080 x6', 60, 114, { color: C.silver });
}

window.DURATION = DURATION;
window.FPS = FPS;
window.render = (t) => {
  ctx.imageSmoothingEnabled = false;
  const scene = SCENES.find((s) => t >= s.start && t < s.end);
  if (scene) scene.draw(ctx, t - scene.start, t);
  else drawPlaceholder(ctx, t);
  drawHUD(ctx, t);
  quantize(ctx, W, H);
};

await document.fonts.load('12px "Fusion Pixel 12px Monospaced Simplified Chinese"', ALL_TEXT);
await document.fonts.ready;
window.render(0);
window.__ready = true;
