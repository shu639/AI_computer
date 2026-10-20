import { draw as s01 } from './s01_hook.js';
import { draw as s02 } from './s02_dive.js';

export const SCENES = [
  { start: 0, end: 4, draw: s01 },
  { start: 4, end: 10, draw: s02 },
];
