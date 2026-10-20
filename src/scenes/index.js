import { draw as s01 } from './s01_hook.js';
import { draw as s02 } from './s02_dive.js';
import { draw as s03 } from './s03_fetch.js';
import { draw as s04 } from './s04_decode.js';
import { draw as s05 } from './s05_execute.js';
import { draw as s06 } from './s06_writeback.js';
import { draw as s07 } from './s07_outro.js';

export const SCENES = [
  { start: 0, end: 4, draw: s01 },
  { start: 4, end: 10, draw: s02 },
  { start: 10, end: 20, draw: s03 },
  { start: 20, end: 30, draw: s04 },
  { start: 30, end: 42, draw: s05 },
  { start: 42, end: 52, draw: s06 },
  { start: 52, end: 60, draw: s07 },
];
