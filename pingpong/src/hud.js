import { W, H, C } from './palette.js';
import {
  rect,
  lineH,
  lineV,
  text,
  textWidth,
  revealText,
  circle,
  registrationMark,
  FONT_MONO,
} from './draw.js';
import { CHAPTERS, SUBTITLES, DURATION } from './timeline.js';

const CHAPTER_INKS = [C.red, C.blue, C.green, C.blue, C.green, C.red, C.yellow];

function timecode(t) {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
}

export function drawHUD(ctx, t) {
  // Masthead
  rect(ctx, 0, 0, W, 58, C.paper);
  rect(ctx, 26, 17, 12, 24, C.red);
  text(ctx, '旋转的语言', 48, 12, { size: 25, weight: 800, color: C.ink });
  text(ctx, 'THE LANGUAGE OF SPIN', 49, 39, {
    size: 10,
    weight: 700,
    color: C.ink2,
    letterSpacing: 2.2,
  });

  const chapterIndex = Math.max(
    0,
    CHAPTERS.findIndex((c) => t >= c.start && t < c.end)
  );
  const chapter = CHAPTERS[chapterIndex] || CHAPTERS[CHAPTERS.length - 1];
  const ink = CHAPTER_INKS[chapterIndex % CHAPTER_INKS.length];

  text(ctx, `CHAPTER ${String(chapterIndex + 1).padStart(2, '0')} / 07`, 360, 19, {
    size: 11,
    weight: 800,
    color: C.ink3,
    letterSpacing: 2,
  });
  text(ctx, chapter.label.replace(/^\d+\s*\/\s*/, ''), 360, 31, {
    size: 19,
    weight: 800,
    color: C.ink,
  });

  text(ctx, timecode(t), 934, 16, {
    size: 18,
    weight: 700,
    color: C.ink,
    align: 'right',
    font: FONT_MONO,
  });
  text(ctx, '120 SEC', 934, 37, {
    size: 10,
    weight: 700,
    color: C.ink3,
    align: 'right',
    letterSpacing: 2,
  });

  // Progress rule
  lineH(ctx, 0, 58, W, C.ink, 1);
  lineH(ctx, 0, 59, W, C.paper3, 2);
  CHAPTERS.forEach((c) => {
    const x = Math.round((W * c.start) / DURATION);
    lineV(ctx, x, 55, 8, C.ink, 1);
  });
  const progress = Math.max(0, Math.min(W, (W * t) / DURATION));
  rect(ctx, 0, 57, progress, 4, ink);

  // Caption strip
  rect(ctx, 0, 468, W, 72, C.paper2);
  lineH(ctx, 0, 468, W, C.ink, 2);
  rect(ctx, 26, 490, 8, 26, ink);
  const sub = SUBTITLES.find((s) => t >= s.start && t < s.end && s.kind !== 'title');
  if (sub) {
    const p = Math.min(1, (t - sub.start) / 0.22);
    const w = textWidth(ctx, sub.text, 30, 700) + 24;
    revealText(ctx, sub.text, 50, 489, p, {
      size: 30,
      weight: 700,
      color: C.ink,
      width: w,
    });
  }
  text(ctx, `SPIN ${String(chapterIndex + 1).padStart(2, '0')}`, 934, 481, {
    size: 11,
    weight: 800,
    color: C.ink3,
    align: 'right',
    letterSpacing: 2,
  });
  circle(ctx, 934, 509, 4, ink);
  text(ctx, 'RISO EDITION', 922, 503, {
    size: 10,
    weight: 700,
    color: C.ink3,
    align: 'right',
    letterSpacing: 1.5,
  });

  registrationMark(ctx, 14, 492, C.ink, 4);
}
