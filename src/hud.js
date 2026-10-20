import { C } from './palette.js';
import { rect, lineH, text, typewriter } from './draw.js';
import { CHAPTERS, SUBTITLES, DURATION } from './timeline.js';

export function drawHUD(ctx, t) {
  const chapter = CHAPTERS.find((c) => t >= c.start && t < c.end) || CHAPTERS[CHAPTERS.length - 1];
  text(ctx, chapter.label, 6, 3, { color: C.silver });

  const sec = t.toFixed(1).padStart(4, '0');
  text(ctx, sec + 's', 314, 3, { color: C.slate, align: 'right' });

  rect(ctx, 6, 17, 308, 1, C.charcoal);
  const progress = Math.max(0, Math.min(308, Math.round((308 * t) / DURATION)));
  rect(ctx, 6, 17, progress, 1, C.yellow);

  const sub = SUBTITLES.find((s) => t >= s.start && t < s.end);
  rect(ctx, 0, 152, 320, 28, C.ink);
  lineH(ctx, 0, 152, 320, C.slate);
  if (sub) {
    const visible = typewriter(sub.text, t, sub.start, sub.cps || 12);
    text(ctx, visible, 10, 159, { color: C.white });
  }
}
