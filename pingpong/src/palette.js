// Sweetie 16 palette, fixed for the whole film.
export const W = 320;
export const H = 180;

export const PALETTE_HEX = [
  '#1a1c2c', '#5d275d', '#b13e53', '#ef7d57',
  '#ffcd75', '#a7f070', '#38b764', '#257179',
  '#29366f', '#3b5dc9', '#41a6f6', '#73eff7',
  '#f4f4f4', '#94b0c2', '#566c86', '#333c57',
];

export const C = {
  ink: PALETTE_HEX[0],
  plum: PALETTE_HEX[1],
  red: PALETTE_HEX[2],
  orange: PALETTE_HEX[3],
  yellow: PALETTE_HEX[4],
  lime: PALETTE_HEX[5],
  green: PALETTE_HEX[6],
  teal: PALETTE_HEX[7],
  navy: PALETTE_HEX[8],
  blue: PALETTE_HEX[9],
  sky: PALETTE_HEX[10],
  cyan: PALETTE_HEX[11],
  white: PALETTE_HEX[12],
  silver: PALETTE_HEX[13],
  slate: PALETTE_HEX[14],
  charcoal: PALETTE_HEX[15],
};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const RGB = PALETTE_HEX.map(hexToRgb);

// 32x32x32 nearest-colour lookup table. Quantising every frame keeps the
// whole film at <=16 colours and removes browser text antialiasing.
const LUT = new Uint8Array(32768 * 3);

for (let r = 0; r < 32; r++) {
  for (let g = 0; g < 32; g++) {
    for (let b = 0; b < 32; b++) {
      const R = (r << 3) | 4;
      const G = (g << 3) | 4;
      const B = (b << 3) | 4;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < RGB.length; i++) {
        const dr = R - RGB[i][0];
        const dg = G - RGB[i][1];
        const db = B - RGB[i][2];
        const d = dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      const o = ((r << 10) | (g << 5) | b) * 3;
      LUT[o] = RGB[best][0];
      LUT[o + 1] = RGB[best][1];
      LUT[o + 2] = RGB[best][2];
    }
  }
}

export function quantize(ctx, w = W, h = H) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const o = (((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)) * 3;
    d[i] = LUT[o];
    d[i + 1] = LUT[o + 1];
    d[i + 2] = LUT[o + 2];
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
