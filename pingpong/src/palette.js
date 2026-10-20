// RISO sports-editorial palette. Five inks on warm paper.
export const W = 960;
export const H = 540;
export const OUT_SCALE = 2; // canvas is 1920x1080, drawing coordinates are 960x540

export const C = {
  paper: '#f3e7d3',
  paper2: '#e8d6b7',
  paper3: '#dcc7a4',
  ink: '#1b2a33',
  ink2: '#40525a',
  ink3: '#6d7b80',
  red: '#d9482b',
  red2: '#a8321f',
  green: '#1e6b57',
  green2: '#14483c',
  blue: '#2d6e8e',
  blue2: '#1d4c63',
  yellow: '#e8b04b',
  white: '#fff9ec',
};

export const INKS = [C.ink, C.red, C.green, C.blue, C.yellow];

export function withAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
