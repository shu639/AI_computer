import { C } from '../palette.js';
import { fill, rect, lineH, lineV, text, sprite } from '../draw.js';
import { drawChatWorld } from '../chat.js';
import { drawCorridor } from '../world.js';
import { BIT_BLINK, BIT_IDLE } from '../sprites.js';

function drawTunnel(ctx, t) {
  fill(ctx, C.ink);
  const cx = 160;
  const cy = 88;
  const speed = 1.5;
  for (let i = 0; i < 18; i++) {
    const phase = (t * speed + i / 18) % 1;
    const size = Math.round(12 + phase * 440);
    const x = cx - (size >> 1);
    const y = cy - (size >> 1);
    const color = i % 3 === 0 ? C.slate : C.charcoal;
    lineH(ctx, x, y, size, color);
    lineH(ctx, x, y + size - 1, size, color);
    lineV(ctx, x, y, size, color);
    lineV(ctx, x + size - 1, y, size, color);
    if (i % 2 === 0) {
      rect(ctx, cx - 1, y - 2, 2, 4, C.yellow);
      rect(ctx, cx - 1, y + size - 2, 2, 4, C.yellow);
      rect(ctx, x - 2, cy - 1, 4, 2, C.yellow);
      rect(ctx, x + size - 2, cy - 1, 4, 2, C.yellow);
    }
  }
  rect(ctx, 159, 87, 3, 3, C.yellow);
}

export function draw(ctx, t) {
  // 0.0-0.6: pixel zoom into the chat window.
  if (t < 0.6) {
    const step = Math.min(3, 1 + Math.floor((t / 0.6) * 3));
    ctx.save();
    ctx.beginPath();
    ctx.rect(160 - 160 / step, 88 - 88 / step, 320 / step, 180 / step);
    ctx.clip();
    ctx.translate(160, 88);
    ctx.scale(step, step);
    ctx.translate(-160, -88);
    drawChatWorld(ctx, 4.0);
    ctx.restore();
    return;
  }

  // 0.6-3.0: tunnel, with the memory corridor sliding up into frame.
  drawTunnel(ctx, t - 0.6);
  if (t >= 2.0 && t < 3.0) {
    const p = Math.min(1, (t - 2.0) / 1.0);
    const offset = Math.round((1 - p) * 180);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, offset, 320, 180 - offset);
    ctx.clip();
    drawCorridor(ctx, Math.floor(t * 12), { showLabels: t > 2.6 });
    ctx.restore();
    lineH(ctx, 0, offset, 320, C.yellow);
  }

  // 3.0-6.0: BIT wakes up in the corridor.
  if (t >= 3.0) {
    const scroll = Math.floor(t * 12);
    drawCorridor(ctx, scroll, { showLabels: true });
    const bob = Math.floor(t * 4) % 2;
    const frame = t < 3.9 ? (bob ? BIT_BLINK : BIT_IDLE) : BIT_IDLE;
    sprite(ctx, frame, 48, 126 - (t > 3.9 ? 1 : 0));
    if (t >= 3.9 && t < 4.5) {
      text(ctx, '!', 62, 104, { color: C.yellow, size: 24 });
    }
  }
}
