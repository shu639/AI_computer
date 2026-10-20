import { C } from '../palette.js';
import { fill, rect, lineH, panel, text } from '../draw.js';
import { DURATION } from '../timeline.js';

export function draw(ctx, t) {
  fill(ctx, C.ink);
  for (let i = 0; i < 5; i++) rect(ctx, 0, 22 + i * 12, 320, 2, C.charcoal);
  for (let i = 0; i < 70; i++) {
    const x = (i * 47) % 320;
    const y = 24 + ((i * 19) % 62);
    rect(ctx, x, y, 1, 1, (i + Math.floor(t * 2)) % 9 === 0 ? C.yellow : C.slate);
  }
  rect(ctx, 0, 120, 320, 60, C.charcoal);
  lineH(ctx, 0, 120, 320, C.silver);

  panel(ctx, 42, 46, 236, 80, { fill: C.navy, border: C.yellow, shadow: C.ink });
  text(ctx, '旋转的语言', 60, 60, { color: C.yellow, size: 24 });
  text(ctx, 'SPIN LAB / 120s', 60, 96, { color: C.silver });
  text(ctx, `t = ${t.toFixed(2)}s / ${DURATION}s`, 60, 110, { color: C.sky });

  // A placeholder spinning ball.
  const cx = 258;
  const cy = 74;
  for (let y = -10; y <= 10; y++) {
    for (let x = -10; x <= 10; x++) {
      if (x * x + y * y <= 100) rect(ctx, cx + x, cy + y, 1, 1, C.white);
    }
  }
  for (let i = 0; i < 30; i++) {
    const a = i * 0.21 + t * 6;
    const r = 4 + (i % 3) * 2;
    rect(ctx, Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1, C.orange);
  }
}
