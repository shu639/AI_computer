import { C } from '../palette.js';
import { rect, lineH, lineV, text, typewriter } from '../draw.js';
import { drawCorridor } from '../world.js';
import { drawChatWorld } from '../chat.js';

const easeOut = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

export function draw(ctx, t) {
  const scroll = 2216;
  drawCorridor(ctx, scroll, { openIndex: 0x2a });
  const chestX = 160;

  // Chest glow while the result returns
  if (t < 4.0) {
    const pulse = Math.floor(t * 4) % 2;
    for (let i = 0; i < 10; i++) {
      const a = i * 0.628 + t * 2;
      const r = 14 + 4 * Math.sin(t * 3 + i);
      rect(ctx, Math.round(chestX + 6 + Math.cos(a) * r), Math.round(126 + Math.sin(a) * r * 0.6), 1, 1, pulse ? C.yellow : C.orange);
    }
  }

  if (t < 2.4) {
    const p = easeOut(Math.min(1, t / 2.4));
    const y = Math.round(54 + p * 54);
    text(ctx, '8', 156, y, { color: C.yellow, size: 24 });
    for (let i = 1; i < 5; i++) {
      rect(ctx, 156 + i * 2, y + i * 10, 2, 2, C.orange);
    }
  }

  if (t >= 2.4 && t < 3.2) {
    const bx = chestX - 4;
    const by = 120;
    const bw = 20;
    const bh = 18;
    lineH(ctx, bx, by, bw, C.yellow);
    lineH(ctx, bx, by + bh - 1, bw, C.yellow);
    lineV(ctx, bx, by, bh, C.yellow);
    lineV(ctx, bx + bw - 1, by, bh, C.yellow);
  }

  // Camera rises through the motherboard into the chat window.
  if (t >= 4.0) {
    const wipe = Math.round(easeOut(Math.min(1, (t - 4.0) / 1.2)) * 180);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 320, wipe);
    ctx.clip();
    drawChatWorld(ctx, 4.0, {
      answerOverride: typewriter('你好！有什么可以帮你？', t, 5.4, 10),
      showStatus: false,
    });
    ctx.restore();
    if (wipe < 180) lineH(ctx, 0, wipe, 320, C.yellow);
  }
}
