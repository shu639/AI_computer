import { C, W } from '../palette.js';
import {
  fill,
  rect,
  lineH,
  lineV,
  text,
  misprintText,
  textWidth,
  grid,
  halftone,
  courtTop,
  ball,
  paddleTop,
  bezier,
  dashedLine,
  polyline,
  cubicPoint,
  stamp,
  tape,
  registrationMark,
  arrow,
  circle,
  ring,
  ellipse,
  spinArc,
  clamp,
  lerp,
  easeOut,
  easeInOut,
  FONT_MONO,
} from '../draw.js';

const TABLE = { x: 430, y: 96, w: 490, h: 310 };
const P0 = [512, 300];
const P1 = [590, 150];
const P2 = [742, 176];
const P3 = [848, 338];
const STRAIGHT = [850, 132];

function tag(ctx, label, x, y, opts = {}) {
  const { color = C.paper, textColor = C.ink, border = C.ink, size = 12, weight = 700, pad = 7 } = opts;
  const w = textWidth(ctx, label, size, weight) + pad * 2;
  const h = size + pad * 1.2;
  rect(ctx, x, y, w, h, color);
  ctx.save();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
  text(ctx, label, x + pad, y + pad * 0.45, { size, weight, color: textColor });
  return { x, y, w, h };
}

function pathPoint(q) {
  return cubicPoint(P0, P1, P2, P3, clamp(q));
}

function drawTrail(ctx, q, color, width = 4) {
  const pts = [];
  const n = 36;
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * q;
    pts.push(pathPoint(u));
  }
  if (pts.length > 1) polyline(ctx, pts, color, width);
}

function ghostBall(ctx, x, y, r, color) {
  ctx.save();
  ctx.globalAlpha = 0.32;
  ring(ctx, x, y, r, color, 2);
  ctx.restore();
}

export function draw(ctx, t) {
  fill(ctx, C.paper);
  grid(ctx, 0, 64, W, 404, { step: 40, alpha: 0.045 });
  halftone(ctx, 0, 64, 420, 404, C.yellow, { size: 8, radius: 1.6, alpha: 0.14 });
  rect(ctx, 0, 64, 7, 404, C.red);

  // Editorial column
  text(ctx, 'CASE FILE 001 / THE CURVE', 44, 82, {
    size: 12,
    weight: 800,
    color: C.red,
    letterSpacing: 2.2,
  });
  misprintText(ctx, '它会', 42, 108, {
    size: 74,
    weight: 800,
    color: C.ink,
    shadow: C.red,
    offset: 4,
  });
  text(ctx, '拐弯。', 42, 184, { size: 74, weight: 800, color: C.ink });
  lineH(ctx, 46, 264, 296, C.ink, 3);
  text(ctx, 'WHY DOES THE BALL CURVE?', 46, 274, {
    size: 12,
    weight: 800,
    color: C.ink2,
    letterSpacing: 2.4,
  });

  stamp(ctx, 'NO WINGS', 78, 330, { size: 18, color: C.red, angle: -0.11 });

  const noteIn = easeOut((t - 5.9) / 0.5);
  if (noteIn > 0) {
    ctx.save();
    ctx.globalAlpha = noteIn;
    text(ctx, '旋转，悄悄改了路线。', 46, 382, { size: 23, weight: 700, color: C.ink });
    ctx.restore();
  }

  // Legend
  if (t > 6.0) {
    const a = easeOut((t - 6.0) / 0.4);
    ctx.save();
    ctx.globalAlpha = a;
    dashedLine(ctx, 48, 426, 112, 426, C.ink2, { width: 2, dash: 6, gap: 5 });
    text(ctx, '无旋转', 122, 417, { size: 14, weight: 700, color: C.ink2 });
    lineH(ctx, 48, 448, 64, C.red, 4);
    text(ctx, '有旋转', 122, 439, { size: 14, weight: 700, color: C.red });
    ctx.restore();
  }

  // Table and action
  const zoom = lerp(1.13, 1, easeOut(t / 1.8));
  ctx.save();
  ctx.translate(675, 250);
  ctx.scale(zoom, zoom);
  ctx.translate(-675, -250);

  courtTop(ctx, TABLE.x, TABLE.y, TABLE.w, TABLE.h, {
    fill: C.green,
    line: C.paper,
    net: true,
    center: true,
  });

  // Table tags
  text(ctx, 'SERVER', 446, 420, { size: 10, weight: 800, color: C.ink2, letterSpacing: 1.5 });
  text(ctx, 'OPPONENT', 838, 420, {
    size: 10,
    weight: 800,
    color: C.ink2,
    align: 'right',
    letterSpacing: 1.5,
  });
  text(ctx, 'TABLE / 2.74 m', 446, 68, { size: 10, weight: 700, color: C.ink3, letterSpacing: 1.6 });

  // Predicted straight path
  const straightA = clamp((t - 4.6) / 0.5);
  if (straightA > 0) {
    ctx.save();
    ctx.globalAlpha = 0.75 * straightA;
    dashedLine(ctx, P0[0], P0[1], STRAIGHT[0], STRAIGHT[1], C.yellow, { width: 2, dash: 7, gap: 6 });
    ctx.restore();
    tag(ctx, '没有旋转：出界', 638, 100, {
      color: C.paper,
      textColor: C.ink2,
      border: C.yellow,
      size: 12,
    });
  }

  // Full path ghost and travelled path
  if (t > 5.0) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    drawTrail(ctx, 1, C.red, 10);
    ctx.restore();
  }
  const q = easeInOut(clamp((t - 0.5) / 4.4));
  drawTrail(ctx, q, C.red, 4);

  // Motion ticks along the path
  if (q > 0.08 && q < 0.98) {
    for (let i = 0; i < 5; i++) {
      const u = clamp(q - i * 0.035);
      const p = pathPoint(u);
      circle(ctx, p[0], p[1], 3.2 - i * 0.4, C.yellow);
    }
  }

  // Start and opponent paddles
  const swing = clamp((t - 3.7) / 0.5);
  paddleTop(ctx, 452, 300, 1.28 + swing * 0.28, { scale: 0.86, face: C.red, label: 'R' });
  const oppSwing = easeOut(clamp((t - 4.15) / 0.35));
  paddleTop(ctx, 862, 232, -1.32 - oppSwing * 0.34, {
    scale: 0.86,
    face: C.ink,
    label: 'B',
    alpha: 0.95,
  });

  // The ball
  const bp = pathPoint(q);
  const spin = Math.min(t, 5.1) * 5.2;
  ball(ctx, bp[0], bp[1], 19, {
    angle: spin,
    axis: [0, 1, 0],
    face: C.paper,
    line: C.ink,
    logo: C.red,
    width: 3,
  });
  // Spin arrow
  ctx.save();
  ctx.globalAlpha = 0.9;
  const ringR = 27 + Math.sin(t * 4) * 2;
  spinArc(ctx, bp[0], bp[1], ringR, -0.7, 2.15, C.yellow, { width: 2.5, head: 9 });
  ctx.restore();

  // Ghost ball at the start
  ghostBall(ctx, P0[0], P0[1], 19, C.ink2);

  ctx.restore();

  // Freeze frame annotation
  if (t > 5.05) {
    const a = easeOut((t - 5.05) / 0.3);
    ctx.save();
    ctx.globalAlpha = a;
    const fx = TABLE.x - 8;
    const fy = TABLE.y - 8;
    const fw = TABLE.w + 16;
    const fh = TABLE.h + 16;
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 6]);
    ctx.strokeRect(fx, fy, fw, fh);
    ctx.restore();
    tag(ctx, 'FREEZE / 0.1×', 744, 66, {
      color: C.paper,
      textColor: C.red,
      border: C.red,
      size: 11,
      weight: 800,
    });
    const t1 = tag(ctx, '旋转还在', 640, 146, {
      color: C.paper,
      textColor: C.red,
      border: C.red,
      size: 15,
      weight: 800,
    });
    arrow(ctx, t1.x + t1.w + 4, t1.y + t1.h / 2, bp[0] - 26, bp[1] - 10, C.red, { width: 2, head: 10 });
  }

  // Miss stamp
  if (t > 4.55) {
    const s = easeOut((t - 4.55) / 0.25);
    ctx.save();
    ctx.globalAlpha = s;
    ctx.translate(786, 360);
    ctx.rotate(-0.16);
    ctx.scale(0.75 + s * 0.25, 0.75 + s * 0.25);
    stamp(ctx, 'MISS', 0, 0, { size: 24, color: C.yellow, angle: 0 });
    ctx.restore();
  }

  // End-of-scene red band
  if (t > 7.55) {
    const p = easeInOut((t - 7.55) / 0.45);
    rect(ctx, 0, 64, W * p, 404, C.red);
    text(ctx, 'SPIN', 44, 260, { size: 72, weight: 800, color: C.paper });
  }

  registrationMark(ctx, 922, 84, C.ink, 5);

  // Title card: paper slide-up reveal.
  if (t < 1.95) {
    const p = t < 1.5 ? 0 : easeInOut((t - 1.5) / 0.45);
    const offset = -404 * p;
    ctx.save();
    ctx.translate(0, offset);
    rect(ctx, 0, 64, W, 404, C.paper);
    grid(ctx, 0, 64, W, 404, { step: 40, alpha: 0.05 });
    halftone(ctx, 0, 64, 420, 404, C.yellow, { size: 8, radius: 1.6, alpha: 0.16 });
    rect(ctx, 0, 64, 7, 404, C.red);
    text(ctx, 'A 120-SECOND EXPLAINER', 44, 100, {
      size: 12,
      weight: 800,
      color: C.red,
      letterSpacing: 2.6,
    });
    misprintText(ctx, '旋转的', 42, 130, {
      size: 78,
      weight: 800,
      color: C.ink,
      shadow: C.red,
      offset: 5,
    });
    text(ctx, '语言', 42, 214, { size: 78, weight: 800, color: C.ink });
    lineH(ctx, 46, 316, 300, C.ink, 3);
    text(ctx, '两分钟看懂乒乓球旋转', 44, 330, { size: 26, weight: 700, color: C.ink2 });
    text(ctx, 'THE LANGUAGE OF SPIN', 46, 368, {
      size: 12,
      weight: 800,
      color: C.ink3,
      letterSpacing: 2.4,
    });
    ball(ctx, 720, 290, 86, {
      angle: t * 5,
      axis: [0.45, 0.89, 0],
      logo: C.red,
      width: 4,
    });
    spinArc(ctx, 720, 290, 112, -2.4, 0.6, C.red, { width: 5, head: 15 });
    stamp(ctx, 'RISO EDITION', 650, 402, { size: 15, color: C.red, angle: -0.08 });
    tape(ctx, 640, 150, 100, 28, -0.25, C.yellow);
    registrationMark(ctx, 900, 100, C.ink, 5);
    ctx.restore();
  }
}
