import { C, W } from '../palette.js';
import {
  fill,
  rect,
  lineH,
  lineV,
  text,
  textWidth,
  line,
  grid,
  halftone,
  panel,
  roundRectPath,
  polyline,
  ball,
  spinArc,
  dashedLine,
  curveArrow,
  arrow,
  circle,
  ring,
  ellipse,
  bigNumber,
  stamp,
  registrationMark,
  clamp,
  lerp,
  easeOut,
  easeInOut,
  FONT_MONO,
} from '../draw.js';

function fade(t, a, b, d = 0.4) {
  return Math.min(clamp((t - a) / d), clamp((b - t) / d));
}

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

function gauge(ctx, x, y, w, value, label, color, opts = {}) {
  const { dark = false } = opts;
  const base = dark ? C.ink : C.paper2;
  const fg = dark ? C.paper : C.ink2;
  text(ctx, label, x, y - 24, { size: 11, weight: 800, color: fg, letterSpacing: 2 });
  text(ctx, `${Math.round(value * 100)}%`, x + w, y - 24, {
    size: 15,
    weight: 800,
    color,
    align: 'right',
    font: FONT_MONO,
  });
  rect(ctx, x, y, w, 18, base);
  ctx.save();
  ctx.strokeStyle = dark ? C.paper : C.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, 18);
  ctx.restore();
  rect(ctx, x, y, w * clamp(value), 18, color);
  for (let i = 0; i <= 10; i++) {
    const tx = x + (w * i) / 10;
    lineV(ctx, tx, y + 18, i % 5 === 0 ? 8 : 4, dark ? C.paper : C.ink, i % 5 === 0 ? 2 : 1);
  }
}

function rubberFace(ctx, x, y, angle, w, h, opts = {}) {
  const { face = C.red, alpha = 1 } = opts;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  roundRectPath(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.fillStyle = face;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = C.paper;
  ctx.fillRect(-w / 2 + 5, -h / 2 + 6, 4, h - 12);
  ctx.restore();
  ctx.strokeStyle = C.red2;
  ctx.lineWidth = 1;
  for (let yy = -h / 2 + 10; yy < h / 2 - 6; yy += 7) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 8, yy);
    ctx.lineTo(w / 2 - 8, yy);
    ctx.stroke();
  }
  ctx.restore();
}

function burst(ctx, x, y, t, color) {
  const p = clamp(t);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const r0 = 8;
    const r1 = 12 + p * 34;
    line(ctx, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, color, 2);
    circle(ctx, x + Math.cos(a) * r1, y + Math.sin(a) * r1, 2.5, color);
  }
}

export function draw(ctx, t) {
  fill(ctx, C.paper);
  grid(ctx, 0, 64, W, 404, { step: 40, alpha: 0.045 });
  halftone(ctx, 0, 64, 300, 404, C.red, { size: 8, radius: 1.5, alpha: 0.07 });
  rect(ctx, 0, 64, 7, 404, C.red);

  // --- Phase A: hit through the centre --------------------------------------
  const aA = fade(t, 0, 5.6);
  if (aA > 0) {
    ctx.save();
    ctx.globalAlpha = aA;
    text(ctx, '03 / CONTACT', 44, 82, {
      size: 12,
      weight: 800,
      color: C.red,
      letterSpacing: 2.2,
    });
    text(ctx, '撞击', 42, 106, { size: 56, weight: 800, color: C.ink });
    text(ctx, 'HIT / 力穿过球心', 44, 168, { size: 13, weight: 800, color: C.ink2, letterSpacing: 1.6 });

    const cx = 322;
    const cy = 276;
    const r = 104;
    const hitX = cx + r;
    ball(ctx, cx, cy, r, {
      angle: t * 1.4,
      axis: [0, 0, 1],
      logo: C.red,
      width: 4,
      alpha: 1 - clamp((t - 2.45) / 0.15),
    });

    // Incoming paddle.
    const move = easeOut(clamp(t / 2.0));
    const px = Math.max(452, 620 - move * 168);
    rubberFace(ctx, px, cy, 0, 38, 168, { face: C.red });
    for (let i = 0; i < 4; i++) {
      const gx = px + 30 + i * 34;
      lineH(ctx, gx, cy - 62, 18, C.ink, 2);
      lineH(ctx, gx, cy + 62, 18, C.ink, 2);
    }

    // Force line through the centre.
    if (t > 1.9) {
      const p = easeOut((t - 1.9) / 0.35);
      ctx.save();
      ctx.globalAlpha = aA * p;
      dashedLine(ctx, 150, cy, 640, cy, C.yellow, { width: 2, dash: 8, gap: 6 });
      arrow(ctx, 160, cy, 600, cy, C.yellow, { width: 5, head: 18 });
      circle(ctx, cx, cy, 4, C.ink);
      tag(ctx, '力线穿过球心 → 力矩 = 0', 150, 398, {
        color: C.paper,
        textColor: C.ink,
        border: C.yellow,
        size: 12,
      });
      ctx.restore();
    }

    if (t > 2.15) {
      burst(ctx, hitX, cy, (t - 2.15) / 0.4, C.yellow);
    }

    // Ball leaves on a straight line.
    if (t > 2.5) {
      const p = easeOut((t - 2.5) / 1.2);
      const bx = cx + p * 190;
      ball(ctx, bx, cy, r * 0.62, { angle: t * 1.8, axis: [0, 0, 1], logo: C.red });
      dashedLine(ctx, cx + r, cy, 760, cy, C.ink2, { width: 2, dash: 6, gap: 5 });
      text(ctx, '直线', 720, cy - 30, { size: 16, weight: 800, color: C.ink2 });
    }

    gauge(ctx, 650, 150, 260, 0.18, 'SPIN / 旋转', C.ink2);
    text(ctx, '球主要往前飞', 650, 196, { size: 24, weight: 800, color: C.ink });
    text(ctx, 'LOW SPIN', 650, 230, { size: 10, weight: 800, color: C.ink3, letterSpacing: 2 });
    ctx.restore();
  }

  // --- Phase B: brush and lever arm -----------------------------------------
  const aB = fade(t, 5.2, 11.2);
  if (aB > 0) {
    ctx.save();
    ctx.globalAlpha = aB;
    text(ctx, '04 / BRUSH', 44, 82, {
      size: 12,
      weight: 800,
      color: C.red,
      letterSpacing: 2.2,
    });
    text(ctx, '摩擦', 42, 106, { size: 56, weight: 800, color: C.ink });
    text(ctx, 'BRUSH / 力不穿过球心，就有了力臂', 44, 168, {
      size: 13,
      weight: 800,
      color: C.ink2,
      letterSpacing: 1.4,
    });

    const cx = 322;
    const cy = 292;
    const r = 104;
    ball(ctx, cx, cy, r, { angle: t * 8.0, axis: [0, 0, 1], logo: C.red, width: 4 });
    spinArc(ctx, cx, cy, r + 20, -2.2, 0.4, C.red, { width: 4, head: 13 });

    // Paddle brushes up across the right edge.
    const p = easeOut(clamp((t - 5.2) / 1.5));
    for (let i = 3; i >= 1; i--) {
      const q = clamp(p - i * 0.12);
      rubberFace(ctx, 470 - q * 28, 350 - q * 210, 0.82, 34, 156, {
        face: C.red,
        alpha: 0.16,
      });
    }
    rubberFace(ctx, 470 - p * 28, 350 - p * 210, 0.82, 34, 156, { face: C.red });

    // Contact point, force and lever arm.
    const px = 402;
    const py = 218;
    circle(ctx, px, py, 5, C.yellow);
    circle(ctx, px, py, 11, 'transparent');
    ring(ctx, px, py, 11, C.yellow, 2);
    arrow(ctx, px, py, px, py - 112, C.yellow, { width: 5, head: 16 });
    text(ctx, 'F', px + 10, py - 116, { size: 20, weight: 800, color: C.red });

    dashedLine(ctx, cx, cy, px, cy, C.ink, { width: 2, dash: 7, gap: 5 });
    dashedLine(ctx, px, py, px, cy, C.ink, { width: 1, dash: 4, gap: 4 });
    lineV(ctx, px - 8, cy - 8, 8, C.ink, 2);
    lineH(ctx, px - 8, cy - 8, 8, C.ink, 2);
    tag(ctx, '力臂 d', 338, cy + 18, {
      color: C.paper,
      textColor: C.ink,
      border: C.ink,
      size: 13,
    });

    curveArrow(ctx, [cx + 48, cy - 10], [cx + 70, cy - 78], [cx + 12, cy - 112], C.red, {
      width: 3,
      head: 12,
    });
    text(ctx, '力矩', cx + 78, cy - 118, { size: 16, weight: 800, color: C.red });

    gauge(ctx, 650, 150, 260, 0.9, 'SPIN / 旋转', C.red);
    text(ctx, '擦着打，球才转', 650, 196, { size: 24, weight: 800, color: C.ink });
    text(ctx, 'HIGH SPIN', 650, 230, { size: 10, weight: 800, color: C.ink3, letterSpacing: 2 });

    if (t > 7.0) {
      const a = easeOut((t - 7.0) / 0.4);
      ctx.save();
      ctx.globalAlpha = aB * a;
      tag(ctx, '接触时间 ≈ 0.001 s', 650, 300, {
        color: C.yellow,
        textColor: C.ink,
        border: C.ink,
        size: 14,
        weight: 800,
      });
      ctx.restore();
    }
    ctx.restore();
  }

  // --- Phase C: up vs down ---------------------------------------------------
  const aC = fade(t, 10.9, 13.75);
  if (aC > 0) {
    ctx.save();
    ctx.globalAlpha = aC;
    text(ctx, '05 / TWO DIRECTIONS', 44, 80, {
      size: 12,
      weight: 800,
      color: C.ink2,
      letterSpacing: 2.2,
    });

    const panels = [
      { x: 44, color: C.red, cn: '上旋', en: 'TOPSPIN', cy: 260 },
      { x: 492, color: C.blue, cn: '下旋', en: 'BACKSPIN', cy: 260 },
    ];
    panels.forEach((pl, i) => {
      panel(ctx, pl.x, 104, 424, 322, {
        fill: C.paper,
        border: pl.color,
        shadow: pl.color,
        offset: 7,
        width: 3,
      });
      rect(ctx, pl.x, 104, 424, 8, pl.color);
      text(ctx, pl.cn, pl.x + 24, 124, { size: 34, weight: 800, color: pl.color });
      text(ctx, pl.en, pl.x + 26, 168, {
        size: 11,
        weight: 800,
        color: C.ink3,
        letterSpacing: 2,
      });

      const bx = pl.x + 128;
      const by = pl.cy;
      ball(ctx, bx, by, 54, {
        angle: (i === 0 ? 1 : -1) * t * 6,
        axis: [0, 0, 1],
        logo: pl.color,
        width: 3,
      });
      const paddleY = i === 0 ? by + 48 : by - 48;
      rubberFace(ctx, bx + 118, paddleY, i === 0 ? -0.5 : 0.5, 28, 106, { face: C.red });
      const ay0 = i === 0 ? by + 100 : by - 100;
      const ay1 = i === 0 ? by - 48 : by + 48;
      arrow(ctx, bx + 170, ay0, bx + 170, ay1, pl.color, { width: 5, head: 14 });
      spinArc(ctx, bx, by, 65, i === 0 ? -0.7 : 2.4, i === 0 ? 2.2 : 5.3, pl.color, {
        width: 3,
        head: 10,
      });
      text(ctx, i === 0 ? '往上刷' : '往下切', pl.x + 320, by - 60, {
        size: 22,
        weight: 800,
        color: C.ink,
      });
      text(ctx, i === 0 ? '球往前滚' : '球往后滚', pl.x + 320, by - 26, {
        size: 14,
        weight: 600,
        color: C.ink2,
      });

      // Mini trajectory.
      if (i === 0) {
        curveArrow(ctx, [pl.x + 28, 388], [pl.x + 212, 344], [pl.x + 396, 396], pl.color, {
          width: 3,
          head: 11,
        });
      } else {
        curveArrow(ctx, [pl.x + 28, 396], [pl.x + 212, 354], [pl.x + 396, 360], pl.color, {
          width: 3,
          head: 11,
        });
      }
    });
    ctx.restore();
  }

  // --- Phase C2: same force, more spin ---------------------------------------
  const aC2 = fade(t, 13.7, 16.7);
  if (aC2 > 0) {
    ctx.save();
    ctx.globalAlpha = aC2;
    panel(ctx, 128, 110, 704, 330, {
      fill: C.paper,
      border: C.ink,
      shadow: C.yellow,
      offset: 8,
      width: 3,
    });
    text(ctx, '同样力量，咬住球，旋转更强', 156, 132, {
      size: 30,
      weight: 800,
      color: C.ink,
    });
    text(ctx, 'SAME INPUT / DIFFERENT GRIP', 158, 172, {
      size: 10,
      weight: 800,
      color: C.ink3,
      letterSpacing: 2,
    });
    text(ctx, '前提：法向力足够，胶皮能咬住球', 158, 188, {
      size: 11,
      weight: 600,
      color: C.ink2,
    });
    lineH(ctx, 160, 214, 620, C.ink, 2);
    const bars = [
      { x: 250, h: 90, v: '20%', label: '薄蹭', en: 'THIN', color: C.ink2 },
      { x: 520, h: 160, v: '90%', label: '咬住', en: 'GRIP', color: C.red },
    ];
    bars.forEach((b) => {
      rect(ctx, b.x, 390 - b.h, 116, b.h, b.color);
      text(ctx, b.v, b.x + 58, 390 - b.h - 36, {
        size: 28,
        weight: 800,
        color: b.color,
        align: 'center',
        font: FONT_MONO,
      });
      text(ctx, b.label, b.x + 58, 400, { size: 20, weight: 800, color: C.ink, align: 'center' });
      text(ctx, b.en, b.x + 58, 424, {
        size: 10,
        weight: 800,
        color: C.ink3,
        align: 'center',
        letterSpacing: 2,
      });
    });
    ctx.restore();
  }

  // --- Phase D: thin contact slips, grip spins -------------------------------
  const aD = fade(t, 16.2, 20.0);
  if (aD > 0) {
    ctx.save();
    ctx.globalAlpha = aD;
    text(ctx, '06 / GRIP OR SLIP', 44, 80, {
      size: 12,
      weight: 800,
      color: C.ink2,
      letterSpacing: 2.2,
    });
    text(ctx, '蹭得太薄，容易打滑；先咬住球。', 44, 104, {
      size: 30,
      weight: 800,
      color: C.ink,
    });

    const panels = [
      {
        x: 48,
        color: C.red,
        cn: '薄蹭',
        en: 'THIN / SLIP',
        value: 0.15,
        verdict: '打滑',
        ok: false,
      },
      {
        x: 498,
        color: C.green,
        cn: '咬住',
        en: 'GRIP',
        value: 0.9,
        verdict: '咬住',
        ok: true,
      },
    ];
    panels.forEach((pl, idx) => {
      panel(ctx, pl.x, 156, 414, 278, {
        fill: C.paper,
        border: pl.color,
        shadow: pl.color,
        offset: 7,
        width: 3,
      });
      rect(ctx, pl.x, 156, 414, 7, pl.color);
      text(ctx, pl.cn, pl.x + 22, 174, { size: 30, weight: 800, color: pl.color });
      text(ctx, pl.en, pl.x + 24, 214, {
        size: 10,
        weight: 800,
        color: C.ink3,
        letterSpacing: 1.8,
      });

      const bx = pl.x + 126;
      const by = 278;
      const r = 56;
      ball(ctx, bx, by, r, { angle: t * (idx ? 6 : 2), axis: [0, 0, 1], logo: pl.color, width: 3 });
      if (idx === 0) {
        rubberFace(ctx, bx + 72, by, 0, 28, 120, { face: C.red });
        // A visible gap and a slipping contact.
        for (let i = 0; i < 3; i++) {
          arrow(ctx, bx + 52 + i * 14, by - 46 + i * 8, bx + 82 + i * 14, by - 46 + i * 8, C.yellow, {
            width: 2.5,
            head: 8,
          });
        }
        line(ctx, pl.x + 300, 246, pl.x + 340, 286, C.red, 5);
        line(ctx, pl.x + 340, 246, pl.x + 300, 286, C.red, 5);
      } else {
        rubberFace(ctx, bx + 62, by, 0, 28, 120, { face: C.red });
        // Deformation: a flattened patch pressed into the rubber.
        ellipse(ctx, bx + 58, by, 8, 26, C.red2);
        for (let i = -2; i <= 2; i++) {
          lineH(ctx, bx + 40, by + i * 10, 18, C.yellow, 2);
        }
        ring(ctx, pl.x + 320, 266, 16, C.green, 3);
        polyline(
          ctx,
          [
            [pl.x + 311, 266],
            [pl.x + 318, 274],
            [pl.x + 331, 256],
          ],
          C.green,
          4
        );
      }
      text(ctx, pl.verdict, pl.x + 24, 300, { size: 24, weight: 800, color: pl.color });
      text(ctx, idx === 0 ? '球滑走，转速低' : '胶皮形变，带着球转', pl.x + 24, 334, {
        size: 13,
        weight: 600,
        color: C.ink2,
      });
      gauge(ctx, pl.x + 24, 392, 366, pl.value, 'SPIN', pl.color);
    });
    ctx.restore();
  }

  registrationMark(ctx, 922, 84, C.ink, 5);
  if (t > 19.55) {
    const p = easeInOut((t - 19.55) / 0.45);
    rect(ctx, 0, 64, W * p, 404, C.red);
  }
}
