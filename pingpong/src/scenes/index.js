import { draw as s01 } from './s01_hook.js';
import { draw as s02 } from './s02_axis.js';
import { draw as s03 } from './s03_friction.js';
import { draw as s04 } from './s04_air.js';
import { draw as s05 } from './s05_bounce.js';
import { draw as s06 } from './s06_read.js';
import { draw as s07 } from './s07_outro.js';

export const SCENES = [
  { start: 0, end: 8, draw: s01 },
  { start: 8, end: 22, draw: s02 },
  { start: 22, end: 42, draw: s03 },
  { start: 42, end: 64, draw: s04 },
  { start: 64, end: 84, draw: s05 },
  { start: 84, end: 104, draw: s06 },
  { start: 104, end: 120, draw: s07 },
];
