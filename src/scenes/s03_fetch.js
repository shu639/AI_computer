import { C } from '../palette.js';
import { rect, lineV, text, sprite, panel } from '../draw.js';
import { drawCorridor } from '../world.js';
import { BIT_IDLE, BIT_RUN_A, BIT_RUN_B } from '../sprites.js';

const easeOut = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

export function draw(ctx, t) {
  // Stop the corridor when BIT reaches the target chest.
  const scroll = 2186 + Math.floor(Math.min(t, 4.8) * 4);
  const open = t >= 5.0 ? 0x2a : -1;
  drawCorridor(ctx, scroll, { openIndex: open, showLabels: true });

  const runP = Math.min(1, t / 4.8);
  const bx = Math.round(40 + easeOut(runP) * 110);
  const running = t < 4.8;
  const frame = running ? (Math.floor(t * 8) % 2 ? BIT_RUN_A : BIT_RUN_B) : BIT_IDLE;
  rect(ctx, bx + 1, 137, 10, 1, C.ink);
  sprite(ctx, frame, bx, 126);
  if (running) {
    rect(ctx, bx - 4, 132, 3, 1, C.orange);
    rect(ctx, bx - 7, 133, 2, 1, C.charcoal);
  }

  const chestX = 42 * 56 + 24 - scroll;

  if (t > 4.6 && t < 5.4) {
    for (let i = 0; i < 8; i++) {
      const a = i * 0.785 + t * 8;
      rect(ctx, Math.round(chestX + 6 + Math.cos(a) * 12), Math.round(120 + Math.sin(a) * 8), 1, 1, C.yellow);
    }
  }

  if (t >= 5.0) {
    const p = easeOut(Math.min(1, (t - 5.0) / 1.4));
    const cx = Math.round(chestX - 20 - p * 40);
    const cy = Math.round(118 - p * 48);
    panel(ctx, cx, cy, 150, 34, { fill: C.navy, border: C.yellow, shadow: C.charcoal });
    text(ctx, 'LOAD R1,[0x2A]', cx + 8, cy + 9, { color: C.yellow });
    if (cy + 34 < 118) {
      lineV(ctx, Math.round(chestX + 6), cy + 34, 118 - (cy + 34), C.slate);
    }
    if (t > 6.5) {
      text(ctx, '指令卡', cx + 8, cy - 12, { color: C.silver, size: 12 });
    }
  }
}
