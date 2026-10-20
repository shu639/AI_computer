import { C, W } from '../palette.js';
import {
  fill,
  rect,
  lineH,
  lineV,
  text,
  textWidth,
  grid,
  halftone,
  panel,
  ball,
  spinArc,
  dashedLine,
  curveArrow,
  arrow,
  line,
  polyline,
  polygon,
  circle,
  ring,
  bigNumber,
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

function arrowAt(ctx, pts, i, color, size = 7) {
  const p = pts[i];
  const q = pts[Math.min(pts.length - 1, i + 1)];
  const a = Math.atan2(q[1] - p[1], q[0] - p[0]);
  polygon(
    ctx,
    [
      [p[0], p[1]],
      [p[0] - Math.cos(a - 0.45) * size, p[1] - Math.sin(a - 0.45) * size],
      [p[0] - Math.cos(a + 0.45) * size, p[1] - Math.sin(a + 0.45) * size],
    ],
    color
  );
}

function flowLines(ctx, cx, cy, r, opts = {}) {
  const { left = 50, right = 690, rows = 20, phase = 0 } = opts;
  for (let i = 0; i < rows; i++) {
    const dy = -150 + (i / (rows - 1)) * 300;
    const top = dy < 0;
    const pts = [];
    for (let k = 0; k <= 50; k++) {
      const x = left + (k / 50) * (right - left);
      let y = cy + dy;
      const d = Math.abs(dy);
      if (d < r + 34) {
        const bend = (r + 34 - d) * 0.62 * Math.sign(dy);
        y -= bend * Math.exp(-Math.pow((x - cx) / (r * 1.7), 2));
      }
      y += Math.sin(x * 0.05 + phase + i) * 1.1;
      pts.push([x, y]);
    }
    const color = top ? C.blue : C.yellow;
    polyline(ctx, pts, color, top ? 1.5 : 2.4);
    const count = top ? 2 : 4;
    for (let j = 1; j <= count; j++) {
      const idx = Math.floor((j / (count + 1)) * 48) + 1;
      arrowAt(ctx, pts, idx, color, top ? 7 : 5);
    }
  }
}

const TRACKS = [
  {
    cn: '上旋',
    en: 'TOPSPIN',
    color: C.red,
    desc: '被往下压，弧线更早下坠',
    kind: 'dip',
  },
  {
    cn: '下旋',
    en: 'BACKSPIN',
    color: C.blue,
    desc: '被往上托，球会“飘”',
    kind: 'float',
  },
  {
    cn: '侧旋',
    en: 'SIDESPIN',
    color: C.green,
    desc: '在空中画出一道弧',
    kind: 'side',
  },
];

export function draw(ctx, t) {
  fill(ctx, C.paper);
  grid(ctx, 0, 64, W, 404, { step: 40, alpha: 0.045 });
  halftone(ctx, 620, 64, 340, 404, C.blue, { size: 8, radius: 1.5, alpha: 0.09 });
  rect(ctx, 0, 64, 7, 404, C.blue);

  // --- Phase A: the hero shot ------------------------------------------------
  const aA = fade(t, 0, 3.6);
  if (aA > 0) {
    ctx.save();
    ctx.globalAlpha = aA;
    flowLines(ctx, 664, 266, 64, { left: 340, right: 930, rows: 14, phase: t * 1.5 });
    const bx = 664;
    const by = 266;
    ball(ctx, bx, by, 64, { angle: t * 5.2, axis: [0, 0, 1], logo: C.red, width: 4 });
    spinArc(ctx, bx, by, 80, -2.4, 0.6, C.red, { width: 4, head: 12 });
    arrow(ctx, 760, 266, 900, 266, C.red, { width: 4, head: 15 });
    text(ctx, 'v', 860, 240, { size: 20, weight: 800, color: C.red, font: FONT_MONO });

    text(ctx, '04 / THE AIR', 44, 82, {
      size: 12,
      weight: 800,
      color: C.blue,
      letterSpacing: 2.2,
    });
    text(ctx, '空气', 42, 106, { size: 66, weight: 800, color: C.ink });
    text(ctx, 'MAGNUS EFFECT', 44, 180, {
      size: 12,
      weight: 800,
      color: C.blue,
      letterSpacing: 2.4,
    });
    text(ctx, '球飞出去，空气也在参与。', 44, 208, { size: 22, weight: 700, color: C.ink2 });
    tag(ctx, '空气不是空的', 44, 260, {
      color: C.yellow,
      textColor: C.ink,
      border: C.ink,
      size: 14,
      weight: 800,
    });
    ctx.restore();
  }

  // --- Phase B: boundary layer and pressure ---------------------------------
  const aB = fade(t, 3.0, 8.9);
  if (aB > 0) {
    ctx.save();
    ctx.globalAlpha = aB;
    text(ctx, '05 / BOUNDARY LAYER', 44, 80, {
      size: 12,
      weight: 800,
      color: C.blue,
      letterSpacing: 2.2,
    });
    text(ctx, '球表面带着一层空气一起转。', 44, 104, { size: 30, weight: 800, color: C.ink });

    const cx = 380;
    const cy = 292;
    const r = 104;
    flowLines(ctx, cx, cy, r, { left: 60, right: 690, rows: 22, phase: t * 2 });
    ball(ctx, cx, cy, r, { angle: t * 6.4, axis: [0, 0, 1], logo: C.red, width: 4 });
    spinArc(ctx, cx, cy, r + 22, -2.2, 0.45, C.red, { width: 4, head: 13 });

    tag(ctx, '上侧：慢 / 高压', 252, 146, {
      color: C.paper,
      textColor: C.red,
      border: C.red,
      size: 14,
      weight: 800,
    });
    tag(ctx, '下侧：快 / 低压', 110, 410, {
      color: C.paper,
      textColor: C.blue,
      border: C.blue,
      size: 14,
      weight: 800,
    });
    arrow(ctx, cx, cy, cx, 430, C.red, { width: 5, head: 16 });
    text(ctx, 'F', cx + 14, 410, { size: 24, weight: 800, color: C.red, font: FONT_MONO });

    panel(ctx, 704, 142, 210, 230, {
      fill: C.paper,
      border: C.ink,
      shadow: C.red,
      offset: 6,
      width: 2.5,
    });
    text(ctx, '压力差', 722, 156, { size: 20, weight: 800, color: C.ink });
    text(ctx, 'PRESSURE', 724, 184, {
      size: 10,
      weight: 800,
      color: C.ink3,
      letterSpacing: 2,
    });
    rect(ctx, 722, 208, 172, 38, C.red);
    text(ctx, '高压', 732, 214, { size: 18, weight: 800, color: C.paper });
    text(ctx, 'HIGH', 884, 218, { size: 10, weight: 800, color: C.paper, align: 'right' });
    rect(ctx, 722, 258, 172, 38, C.blue);
    text(ctx, '低压', 732, 264, { size: 18, weight: 800, color: C.paper });
    text(ctx, 'LOW', 884, 268, { size: 10, weight: 800, color: C.paper, align: 'right' });
    arrow(ctx, 808, 296, 808, 352, C.ink, { width: 3, head: 12 });
    text(ctx, '球被推向低压侧', 722, 354, {
      size: 12,
      weight: 700,
      color: C.ink2,
    });
    ctx.restore();
  }

  // --- Phase C: the perpendicular rule --------------------------------------
  const aC = fade(t, 8.6, 13.9);
  if (aC > 0) {
    ctx.save();
    ctx.globalAlpha = aC;
    text(ctx, '06 / THE RULE', 44, 80, {
      size: 12,
      weight: 800,
      color: C.ink2,
      letterSpacing: 2.2,
    });
    text(ctx, '理想情况下：垂直于转轴和速度。', 44, 104, {
      size: 30,
      weight: 800,
      color: C.ink,
    });

    panel(ctx, 128, 156, 704, 274, {
      fill: C.paper,
      border: C.ink,
      shadow: C.blue,
      offset: 7,
      width: 3,
    });
    grid(ctx, 128, 156, 704, 274, { step: 32, alpha: 0.06 });

    const cx = 470;
    const cy = 300;
    arrow(ctx, cx, cy, cx + 240, cy, C.yellow, { width: 5, head: 16 });
    text(ctx, 'v / 飞行方向', cx + 178, cy - 32, {
      size: 14,
      weight: 800,
      color: C.yellow,
    });
    arrow(ctx, cx, cy, cx, cy + 118, C.red, { width: 5, head: 16 });
    text(ctx, 'F / 马格努斯力', cx + 14, cy + 86, { size: 14, weight: 800, color: C.red });

    // Axis out of the page: a circled dot.
    ring(ctx, cx, cy, 26, C.blue, 3);
    circle(ctx, cx, cy, 7, C.blue);
    text(ctx, '轴', cx - 12, cy - 58, { size: 18, weight: 800, color: C.blue });
    text(ctx, 'AXIS', cx - 18, cy - 36, {
      size: 10,
      weight: 800,
      color: C.ink3,
      letterSpacing: 1.8,
    });

    // Right-angle marks.
    line(ctx, cx + 4, cy + 12, cx + 16, cy + 12, C.ink, 2);
    line(ctx, cx + 12, cy + 4, cx + 12, cy + 16, C.ink, 2);
    line(ctx, cx - 12, cy - 4, cx - 12, cy - 16, C.ink, 2);
    line(ctx, cx - 4, cy - 12, cx - 16, cy - 12, C.ink, 2);

    text(ctx, 'F ⟂ v', 660, 240, { size: 28, weight: 800, color: C.ink, font: FONT_MONO });
    text(ctx, 'F ⟂ 轴', 660, 276, { size: 28, weight: 800, color: C.ink, font: FONT_MONO });
    text(ctx, '三个方向，两两垂直。', 660, 330, { size: 16, weight: 700, color: C.ink2 });
    tag(ctx, 'CROSS PRODUCT / 叉乘', 660, 368, {
      color: C.yellow,
      textColor: C.ink,
      border: C.ink,
      size: 12,
      weight: 800,
    });
    ctx.restore();
  }

  // --- Phase D: three trajectories ------------------------------------------
  const aD = fade(t, 13.6, 22.0);
  if (aD > 0) {
    ctx.save();
    ctx.globalAlpha = aD;
    text(ctx, '07 / THREE CURVES', 44, 80, {
      size: 12,
      weight: 800,
      color: C.ink2,
      letterSpacing: 2.2,
    });
    text(ctx, '同一颗球，三种弧线。', 44, 102, { size: 30, weight: 800, color: C.ink });

    const active = t < 16.6 ? 0 : t < 19.4 ? 1 : 2;
    TRACKS.forEach((tr, i) => {
      const x = 42 + i * 300;
      const y = 146;
      const w = 276;
      const h = 286;
      const on = i === active;
      ctx.save();
      ctx.globalAlpha = aD * (on ? 1 : 0.42);
      panel(ctx, x, y, w, h, {
        fill: C.paper,
        border: on ? tr.color : C.ink3,
        shadow: on ? tr.color : C.ink3,
        offset: 6,
        width: on ? 3 : 2,
      });
      rect(ctx, x, y, w, 7, on ? tr.color : C.ink3);
      text(ctx, tr.cn, x + 18, y + 16, { size: 28, weight: 800, color: tr.color });
      text(ctx, tr.en, x + 20, y + 52, {
        size: 10,
        weight: 800,
        color: C.ink3,
        letterSpacing: 1.8,
      });

      if (tr.kind === 'side') {
        rect(ctx, x + 24, y + 104, w - 48, 126, C.green2);
        dashedLine(ctx, x + w / 2, y + 104, x + w / 2, y + 230, C.paper, {
          width: 1,
          dash: 4,
          gap: 4,
        });
        dashedLine(ctx, x + 24, y + 150, x + w - 24, y + 150, C.paper, {
          width: 1,
          dash: 4,
          gap: 4,
        });
        curveArrow(ctx, [x + 30, y + 214], [x + 130, y + 118], [x + 232, y + 148], tr.color, {
          width: 3,
          head: 10,
        });
        ball(ctx, x + 232, y + 148, 12, { angle: t * 5, axis: [0, 1, 0], logo: tr.color, width: 2 });
        text(ctx, '俯视 / TOP VIEW', x + 28, y + 94, {
          size: 9,
          weight: 800,
          color: C.ink3,
          letterSpacing: 1.4,
        });
      } else {
        dashedLine(ctx, x + 26, y + 122, x + w - 26, y + 122, C.ink2, {
          width: 2,
          dash: 6,
          gap: 5,
        });
        text(ctx, '无旋转', x + w - 28, y + 104, {
          size: 9,
          weight: 700,
          color: C.ink3,
          align: 'right',
        });
        const midY = tr.kind === 'dip' ? y + 168 : y + 94;
        curveArrow(ctx, [x + 30, y + 122], [x + 136, midY], [x + 236, y + 160], tr.color, {
          width: 3,
          head: 10,
        });
        ball(ctx, x + 236, y + 160, 12, { angle: t * 5, axis: [0, 0, 1], logo: tr.color, width: 2 });
      }
      text(ctx, tr.desc, x + 18, y + h - 34, { size: 14, weight: 600, color: C.ink2 });
      ctx.restore();
    });
    ctx.restore();
  }

  registrationMark(ctx, 922, 84, C.ink, 5);
  if (t > 21.55) {
    const p = easeInOut((t - 21.55) / 0.45);
    rect(ctx, 0, 64, W * p, 404, C.blue);
  }
}
