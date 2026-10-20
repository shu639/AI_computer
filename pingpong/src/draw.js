import { W, H, C, withAlpha } from './palette.js';

export const FONT_SANS =
  '"Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", "SimHei", "Segoe UI", sans-serif';
export const FONT_MONO = '"Bahnschrift", "DIN Alternate", "Segoe UI", Arial, sans-serif';
export const FONT_SERIF = 'Georgia, "Times New Roman", serif';

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t) => Math.pow(clamp(t), 3);
export const easeInOut = (t) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOutBack = (t) => {
  const x = clamp(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function seeded(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function fill(ctx, color = C.paper) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
}

export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function lineH(ctx, x, y, w, color, width = 2) {
  rect(ctx, x, y - width / 2, w, width, color);
}

export function lineV(ctx, x, y, h, color, width = 2) {
  rect(ctx, x - width / 2, y, width, h, color);
}

export function line(ctx, x0, y0, x1, y1, color, width = 2) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

export function polyline(ctx, pts, color, width = 2, closed = false) {
  if (!pts.length) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (closed) ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function polygon(ctx, pts, color, opts = {}) {
  if (!pts.length) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  if (opts.stroke) {
    ctx.strokeStyle = opts.stroke;
    ctx.lineWidth = opts.width || 2;
    ctx.stroke();
  }
  ctx.restore();
}

export function circle(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function ring(ctx, cx, cy, r, color, width = 2) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function arc(ctx, cx, cy, r, a0, a1, color, width = 2) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, a1);
  ctx.stroke();
  ctx.restore();
}

export function ellipse(ctx, cx, cy, rx, ry, color, rotation = 0) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function ellipseRing(ctx, cx, cy, rx, ry, color, width = 2, rotation = 0) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rotation, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function arrow(ctx, x0, y0, x1, y1, color, opts = {}) {
  const { width = 3, head = 16, both = false } = opts;
  const a = Math.atan2(y1 - y0, x1 - x0);
  const bx = x1 - Math.cos(a) * head * 0.7;
  const by = y1 - Math.sin(a) * head * 0.7;
  line(ctx, x0, y0, bx, by, color, width);
  const spread = 0.42;
  polygon(
    ctx,
    [
      [x1, y1],
      [x1 - Math.cos(a - spread) * head, y1 - Math.sin(a - spread) * head],
      [x1 - Math.cos(a + spread) * head, y1 - Math.sin(a + spread) * head],
    ],
    color
  );
  if (both) {
    const a2 = a + Math.PI;
    line(ctx, x1, y1, x0 + Math.cos(a) * head * 0.7, y0 + Math.sin(a) * head * 0.7, color, width);
    polygon(
      ctx,
      [
        [x0, y0],
        [x0 - Math.cos(a2 - spread) * head, y0 - Math.sin(a2 - spread) * head],
        [x0 - Math.cos(a2 + spread) * head, y0 - Math.sin(a2 + spread) * head],
      ],
      color
    );
  }
}

export function curveArrow(ctx, p0, p1, p2, color, opts = {}) {
  const { width = 3, head = 16, samples = 32 } = opts;
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const u = 1 - t;
    pts.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ]);
  }
  polyline(ctx, pts, color, width);
  const a = Math.atan2(pts[samples][1] - pts[samples - 1][1], pts[samples][0] - pts[samples - 1][0]);
  const spread = 0.42;
  polygon(
    ctx,
    [
      pts[samples],
      [pts[samples][0] - Math.cos(a - spread) * head, pts[samples][1] - Math.sin(a - spread) * head],
      [pts[samples][0] - Math.cos(a + spread) * head, pts[samples][1] - Math.sin(a + spread) * head],
    ],
    color
  );
}

export function dashedLine(ctx, x0, y0, x1, y1, color, opts = {}) {
  const { width = 2, dash = 8, gap = 6 } = opts;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash([dash, gap]);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

export function bezier(ctx, p0, p1, p2, p3, color, opts = {}) {
  const { width = 2, dashed = false, dash = 8, gap = 6, alpha = 1 } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dashed) ctx.setLineDash([dash, gap]);
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
  ctx.stroke();
  ctx.restore();
}

export function cubicPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

export function cubicTangent(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
}

export function panel(ctx, x, y, w, h, opts = {}) {
  const { fill: bg = C.paper, border = C.ink, shadow = C.red, offset = 7, width = 3, alpha = 1 } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.globalAlpha = alpha * 0.75;
    ctx.fillRect(x + offset, y + offset, w, h);
    ctx.globalAlpha = alpha;
  }
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = width;
    ctx.strokeRect(x, y, w, h);
  }
  ctx.restore();
}

const tornCache = new Map();

function tornEdge(seed, length, depth) {
  const key = `${seed}:${length}:${depth}`;
  if (tornCache.has(key)) return tornCache.get(key);
  const rnd = seeded(seed);
  const pts = [];
  const step = 14;
  for (let x = 0; x <= length; x += step) {
    pts.push([x, (rnd() - 0.5) * depth]);
  }
  tornCache.set(key, pts);
  return pts;
}

export function tornPanel(ctx, x, y, w, h, opts = {}) {
  const { fill: bg = C.paper, border = C.ink, seed = 7, shadow = C.red, width = 3, edges = ['top', 'bottom'] } = opts;
  const top = tornEdge(seed, w, 10);
  const bot = tornEdge(seed + 1, w, 10);
  const pts = [];
  if (edges.includes('top')) {
    for (const [px, py] of top) pts.push([x + px, y + py]);
  } else {
    pts.push([x, y], [x + w, y]);
  }
  if (edges.includes('bottom')) {
    for (let i = bot.length - 1; i >= 0; i--) pts.push([x + bot[i][0], y + h + bot[i][1]]);
  } else {
    pts.push([x + w, y + h], [x, y + h]);
  }
  if (shadow) {
    ctx.save();
    ctx.globalAlpha = 0.65;
    polygon(ctx, pts.map(([px, py]) => [px + 6, py + 6]), shadow);
    ctx.restore();
  }
  polygon(ctx, pts, bg, { stroke: border, width });
}

export function tape(ctx, x, y, w, h, angle = -0.2, color = C.yellow) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = C.paper;
  ctx.fillRect(-w / 2 + 4, -h / 2 + 3, w - 8, 2);
  ctx.fillRect(-w / 2 + 4, h / 2 - 5, w - 8, 2);
  ctx.restore();
}

export function stamp(ctx, label, x, y, opts = {}) {
  const { size = 22, color = C.red, angle = -0.12, pad = 12, weight = 800, font = FONT_SANS } = opts;
  ctx.save();
  ctx.font = `${weight} ${size}px ${font}`;
  const tw = ctx.measureText(label).width;
  const w = tw + pad * 2;
  const h = size + pad * 1.2;
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.lineWidth = 1;
  ctx.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 2);
  ctx.restore();
}

export function text(ctx, str, x, y, opts = {}) {
  const {
    color = C.ink,
    size = 24,
    weight = 400,
    align = 'left',
    baseline = 'top',
    font = FONT_SANS,
    alpha = 1,
    letterSpacing = 0,
  } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${letterSpacing}px`;
  ctx.fillText(String(str), x, y);
  ctx.restore();
}

export function textWidth(ctx, str, size = 24, weight = 400, font = FONT_SANS) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${font}`;
  const w = ctx.measureText(String(str)).width;
  ctx.restore();
  return w;
}

export function misprintText(ctx, str, x, y, opts = {}) {
  const { color = C.ink, shadow = C.red, offset = 4, ...rest } = opts;
  text(ctx, str, x + offset, y + offset, { ...rest, color: shadow, alpha: (rest.alpha ?? 1) * 0.8 });
  text(ctx, str, x, y, { ...rest, color });
}

export function revealText(ctx, str, x, y, progress, opts = {}) {
  const { width = 2000, ...rest } = opts;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 4, y - 80, width * clamp(progress), 220);
  ctx.clip();
  text(ctx, str, x, y, rest);
  ctx.restore();
}

const halftoneCache = new Map();

export function halftone(ctx, x, y, w, h, color, opts = {}) {
  const { size = 7, radius = 1.7, alpha = 0.35 } = opts;
  const key = `${color}:${size}:${radius}`;
  let pattern = halftoneCache.get(key);
  if (!pattern) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    g.fillStyle = color;
    g.beginPath();
    g.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
    g.fill();
    pattern = ctx.createPattern(c, 'repeat');
    halftoneCache.set(key, pattern);
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = pattern;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

let grainCanvas = null;

export function grain(ctx, alpha = 0.65) {
  if (!grainCanvas) {
    grainCanvas = document.createElement('canvas');
    grainCanvas.width = W;
    grainCanvas.height = H;
    const g = grainCanvas.getContext('2d');
    const rnd = seeded(20261020);
    for (let i = 0; i < 14000; i++) {
      const a = 0.03 + rnd() * 0.09;
      g.fillStyle = withAlpha(rnd() > 0.7 ? C.paper3 : C.ink, a);
      const s = rnd() > 0.92 ? 2 : 1;
      g.fillRect(Math.floor(rnd() * W), Math.floor(rnd() * H), s, s);
    }
    // A few paper fibres.
    for (let i = 0; i < 140; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const len = 4 + rnd() * 16;
      g.strokeStyle = withAlpha(C.ink, 0.04);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + len, y + (rnd() - 0.5) * 2);
      g.stroke();
    }
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(grainCanvas, 0, 0);
  ctx.restore();
}

export function grid(ctx, x, y, w, h, opts = {}) {
  const { step = 32, color = C.ink, alpha = 0.07, width = 1 } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let xx = x; xx <= x + w; xx += step) {
    ctx.moveTo(xx, y);
    ctx.lineTo(xx, y + h);
  }
  for (let yy = y; yy <= y + h; yy += step) {
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
  }
  ctx.stroke();
  ctx.restore();
}

export function registrationMark(ctx, x, y, color = C.ink, r = 7) {
  ring(ctx, x, y, r, color, 1.5);
  line(ctx, x - r - 4, y, x + r + 4, y, color, 1.5);
  line(ctx, x, y - r - 4, x, y + r + 4, color, 1.5);
}

export function sectionTag(ctx, label, x, y, color = C.red) {
  rect(ctx, x, y + 3, 6, 14, color);
  text(ctx, label, x + 14, y, { size: 16, weight: 800, color: C.ink, letterSpacing: 2 });
}

export function spinArc(ctx, cx, cy, r, start, end, color, opts = {}) {
  const { width = 5, head = 14 } = opts;
  arc(ctx, cx, cy, r, start, end, color, width);
  const a = end;
  const px = cx + Math.cos(a) * r;
  const py = cy + Math.sin(a) * r;
  const tang = a + Math.PI / 2;
  const spread = 0.5;
  polygon(
    ctx,
    [
      [px + Math.cos(tang) * head * 0.35, py + Math.sin(tang) * head * 0.35],
      [px - Math.cos(tang - spread) * head, py - Math.sin(tang - spread) * head],
      [px - Math.cos(tang + spread) * head, py - Math.sin(tang + spread) * head],
    ],
    color
  );
}

// --- 3D ball ---------------------------------------------------------------

function norm3(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function rotateAxis(p, axis, angle) {
  const [x, y, z] = p;
  const [u, v, w] = axis;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const dot = u * x + v * y + w * z;
  return [
    x * c + (v * z - w * y) * s + u * dot * (1 - c),
    y * c + (w * x - u * z) * s + v * dot * (1 - c),
    z * c + (u * y - v * x) * s + w * dot * (1 - c),
  ];
}

const BALL_DOTS = [];
for (let i = 0; i < 6; i++) {
  const lon = (i / 6) * Math.PI * 2;
  BALL_DOTS.push([Math.cos(lon) * 0.82, Math.sin(lon) * 0.82, 0]);
}
BALL_DOTS.push([0, 0.9, 0], [0, -0.9, 0], [0.55, 0, 0.55], [-0.55, 0, -0.55]);

export function ball(ctx, cx, cy, r, opts = {}) {
  const {
    angle = 0,
    axis = [0, 0, 1],
    face = C.paper,
    line: outline = C.ink,
    logo = C.red,
    width = 3,
    shadow = true,
    alpha = 1,
    ghost = false,
  } = opts;
  const ax = norm3(axis);
  ctx.save();
  ctx.globalAlpha = alpha;
  if (shadow) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.16;
    ellipse(ctx, cx + r * 0.3, cy + r * 0.98, r * 0.88, r * 0.18, C.ink);
    ctx.restore();
  }
  if (ghost) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    ring(ctx, cx, cy, r, outline, width);
    ctx.restore();
  } else {
    // Risograph misregistration.
    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    circle(ctx, cx + 3, cy + 3, r, C.red);
    ctx.restore();
    circle(ctx, cx, cy, r, face);
    ring(ctx, cx, cy, r, outline, width);
    // A soft paper highlight.
    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    arc(ctx, cx, cy, r * 0.78, Math.PI * 1.05, Math.PI * 1.55, C.white, Math.max(2, r * 0.07));
    ctx.restore();
  }
  for (const base of BALL_DOTS) {
    const p = rotateAxis(base, ax, angle);
    if (p[2] <= 0.05) continue;
    const px = cx + p[0] * r;
    const py = cy - p[1] * r;
    const dotR = Math.max(1.6, r * 0.085 * (0.7 + p[2] * 0.4));
    ctx.save();
    ctx.globalAlpha = alpha * (0.45 + p[2] * 0.55);
    circle(ctx, px, py, dotR, ghost ? outline : logo);
    ctx.restore();
  }
  ctx.restore();
}

export function paddle(ctx, x, y, angle = 0, opts = {}) {
  const {
    scale = 1,
    face = C.red,
    edge = C.ink,
    handle = C.ink,
    grip = C.paper,
    shadow = true,
    alpha = 1,
    ghost = false,
    label = 'R',
  } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  if (shadow) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.16;
    ellipse(ctx, 12, 10, 44, 56, C.ink, -0.05);
    ctx.restore();
  }
  // Handle
  ctx.fillStyle = handle;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-9, -44);
  ctx.lineTo(9, -44);
  ctx.lineTo(11, 30);
  ctx.lineTo(-11, 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = grip;
  ctx.fillRect(-8, 10, 16, 16);
  ctx.fillStyle = C.yellow;
  ctx.fillRect(-8, 10, 16, 3);
  // Blade
  if (!ghost) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    ctx.fillStyle = C.red;
    ctx.beginPath();
    ctx.ellipse(4, -84, 40, 50, 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = ghost ? 'transparent' : face;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, -88, 40, 50, 0.02, 0, Math.PI * 2);
  if (!ghost) ctx.fill();
  ctx.stroke();
  if (!ghost) {
    ctx.fillStyle = C.paper;
    ctx.globalAlpha = alpha * 0.35;
    ctx.beginPath();
    ctx.ellipse(-10, -100, 14, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = label === 'R' ? C.yellow : C.paper;
    ctx.font = `800 15px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, -86);
  }
  ctx.restore();
}

export function paddleTop(ctx, x, y, angle = 0, opts = {}) {
  const {
    scale = 1,
    face = C.red,
    edge = C.ink,
    handle = C.ink,
    alpha = 1,
    shadow = true,
    ghost = false,
    label = 'R',
  } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  if (shadow) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.16;
    ellipse(ctx, 5, 7, 34, 46, C.ink);
    ctx.restore();
  }
  // Handle points down in local space.
  ctx.fillStyle = handle;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, 28);
  ctx.lineTo(8, 28);
  ctx.lineTo(10, 72);
  ctx.lineTo(-10, 72);
  ctx.closePath();
  if (!ghost) ctx.fill();
  ctx.stroke();
  if (!ghost) {
    ctx.fillStyle = C.yellow;
    ctx.fillRect(-8, 34, 16, 4);
    ctx.fillStyle = C.paper;
    ctx.fillRect(-7, 50, 14, 10);
  }
  // Blade.
  if (!ghost) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.55;
    ctx.fillStyle = C.red;
    ctx.beginPath();
    ctx.ellipse(3, 3, 33, 44, 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = ghost ? 'transparent' : face;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 33, 44, 0.02, 0, Math.PI * 2);
  if (!ghost) ctx.fill();
  ctx.stroke();
  if (!ghost) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = C.paper;
    ctx.beginPath();
    ctx.ellipse(-9, -12, 11, 18, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = label === 'R' ? C.yellow : C.paper;
    ctx.font = `800 14px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 2);
  }
  ctx.restore();
}

export function courtTop(ctx, x, y, w, h, opts = {}) {
  const { fill: bg = C.green, line: ln = C.paper, shadow = true, net = true, center = true } = opts;
  if (shadow) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    rect(ctx, x + 10, y + 10, w, h, C.ink);
    ctx.restore();
  }
  rect(ctx, x, y, w, h, bg);
  ctx.save();
  ctx.strokeStyle = ln;
  ctx.lineWidth = 5;
  ctx.strokeRect(x + 12, y + 12, w - 24, h - 24);
  if (net) {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 4);
    ctx.lineTo(x + w / 2, y + h - 4);
    ctx.stroke();
  }
  if (center) {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + h / 2);
    ctx.lineTo(x + w - 12, y + h / 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function tableSide(ctx, x, y, w, h = 16, opts = {}) {
  const { top = C.green, body = C.green2, line: ln = C.paper } = opts;
  rect(ctx, x, y, w, h, top);
  rect(ctx, x, y + h, w, h * 0.9, body);
  lineH(ctx, x, y + 1, w, ln, 3);
  ctx.save();
  ctx.globalAlpha = 0.4;
  halftone(ctx, x, y + h, w, h * 0.9, C.ink, { size: 8, radius: 1.4, alpha: 0.4 });
  ctx.restore();
}

export function netSide(ctx, x, yTop, yBottom, opts = {}) {
  const { color = C.ink, mesh = C.paper } = opts;
  lineV(ctx, x, yTop, yBottom - yTop, color, 4);
  lineH(ctx, x - 4, yTop, 8, color, 4);
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (let yy = yTop + 6; yy < yBottom; yy += 7) lineH(ctx, x - 1, yy, 2, mesh, 1);
  ctx.restore();
}

export function bigNumber(ctx, value, x, y, opts = {}) {
  const { color = C.ink, shadow = C.red, size = 96, align = 'left', weight = 800 } = opts;
  text(ctx, String(value), x + 5, y + 5, { color: shadow, size, weight, align, font: FONT_MONO });
  text(ctx, String(value), x, y, { color, size, weight, align, font: FONT_MONO });
}
