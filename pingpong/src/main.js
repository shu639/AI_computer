import { W, H, OUT_SCALE } from './palette.js';
import { fill, panel, text, grain } from './draw.js';
import { DURATION, FPS, ALL_TEXT } from './timeline.js';
import { drawHUD } from './hud.js';
import { SCENES } from './scenes/index.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d', { alpha: false });

function drawPlaceholder(ctx, t) {
  fill(ctx);
  panel(ctx, 120, 170, 720, 190, { fill: '#f3e7d3', border: '#1b2a33', shadow: '#d9482b' });
  text(ctx, 'SCENE WIP', 160, 205, { size: 56, weight: 800 });
  text(ctx, 't = ' + t.toFixed(2) + 's', 160, 285, { size: 28 });
}

window.DURATION = DURATION;
window.FPS = FPS;
window.render = (t) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.setTransform(OUT_SCALE, 0, 0, OUT_SCALE, 0, 0);
  const scene = SCENES.find((s) => t >= s.start && t < s.end);
  if (scene) scene.draw(ctx, t - scene.start, t);
  else drawPlaceholder(ctx, t);
  grain(ctx, 0.5);
  drawHUD(ctx, t);
};

try {
  await Promise.all([
    document.fonts.load('700 32px "Microsoft YaHei"', ALL_TEXT),
    document.fonts.load('800 64px "Microsoft YaHei"', ALL_TEXT),
    document.fonts.load('800 64px "Bahnschrift"', '0123456789'),
  ]);
  await document.fonts.ready;
} catch {
  // System fonts are still usable if a family name is not recognised.
}

window.render(0);
window.__ready = true;
