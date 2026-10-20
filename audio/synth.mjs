// Procedural chiptune score + sound effects for the 60s explainer.
// No samples, no external assets: everything is synthesized into out/mix.wav.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SR = 48000;
const DUR = 60;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let seed = 0x12345678;
function noise() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 0xffffffff) * 2 - 1;
}

function panGains(pan) {
  const a = ((pan + 1) * Math.PI) / 4;
  return [Math.cos(a), Math.sin(a)];
}

function addTone(start, dur, freq, opts = {}) {
  const {
    wave = 'square',
    vol = 0.1,
    pan = 0,
    duty = 0.5,
    attack = 0.005,
    decay = 0.04,
    sustain = 0.6,
    release = 0.06,
    vibrato = 0,
  } = opts;
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + dur) * SR));
  if (s1 <= s0) return;
  const [gl, gr] = panGains(pan);
  let phase = 0;
  const inc = freq / SR;
  const relStart = Math.max(attack + decay, dur - release);
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    let env;
    if (tt < attack) env = tt / attack;
    else if (tt < attack + decay) env = 1 - (1 - sustain) * ((tt - attack) / decay);
    else env = sustain;
    if (tt > relStart) env *= clamp(1 - (tt - relStart) / release, 0, 1);
    env = clamp(env, 0, 1);
    const vib = vibrato ? 1 + vibrato * Math.sin(2 * Math.PI * 6 * tt) : 1;
    phase += inc * vib;
    const p = phase % 1;
    let v = 0;
    if (wave === 'square') v = p < duty ? 1 : -1;
    else if (wave === 'triangle') v = 4 * Math.abs(p - 0.5) - 1;
    else if (wave === 'saw') v = 2 * p - 1;
    else if (wave === 'sine') v = Math.sin(2 * Math.PI * p);
    const s = v * env * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

function addGlide(start, dur, f0, f1, opts = {}) {
  const { wave = 'saw', vol = 0.08, pan = 0, duty = 0.5 } = opts;
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + dur) * SR));
  if (s1 <= s0) return;
  const [gl, gr] = panGains(pan);
  let phase = 0;
  for (let i = s0; i < s1; i++) {
    const p = (i - s0) / (s1 - s0);
    const f = f0 * Math.pow(f1 / f0, p);
    phase += f / SR;
    const ph = phase % 1;
    const v = wave === 'square' ? (ph < duty ? 1 : -1) : wave === 'sine' ? Math.sin(2 * Math.PI * ph) : 2 * ph - 1;
    const env = Math.min(1, p * 8) * Math.min(1, (1 - p) * 4);
    const s = v * env * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

function addNoise(start, dur, vol = 0.05, opts = {}) {
  const { pan = 0, decay = 0.05 } = opts;
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + dur) * SR));
  const [gl, gr] = panGains(pan);
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    const env = Math.exp(-tt / decay);
    const s = noise() * env * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

function addKick(start, vol = 0.18) {
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + 0.22) * SR));
  let phase = 0;
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    const f = 120 * Math.exp(-tt * 18) + 42;
    phase += f / SR;
    const env = Math.exp(-tt * 10);
    const s = Math.sin(2 * Math.PI * phase) * env * vol;
    L[i] += s;
    R[i] += s;
  }
}

function sfx(name, t, param = 0) {
  switch (name) {
    case 'click':
      addNoise(t, 0.025, 0.12, { decay: 0.008 });
      addTone(t, 0.03, 1600 + param * 120, { wave: 'square', vol: 0.04, duty: 0.2, release: 0.01 });
      break;
    case 'send':
      addNoise(t, 0.04, 0.14, { decay: 0.012 });
      addTone(t, 0.09, 660, { wave: 'square', vol: 0.08, duty: 0.25, release: 0.03 });
      addTone(t + 0.05, 0.08, 990, { wave: 'triangle', vol: 0.06, release: 0.03 });
      break;
    case 'blip':
      addTone(t, 0.06, 880 + param * 110, { wave: 'square', vol: 0.07, duty: 0.25, release: 0.02 });
      break;
    case 'chime':
      [880, 1108.73, 1318.51].forEach((f, i) => {
        addTone(t + i * 0.085, 0.16, f, { wave: 'triangle', vol: 0.09, release: 0.08 });
      });
      break;
    case 'sweep':
      addGlide(t, 6.0, 260, 45, { wave: 'saw', vol: 0.06 });
      addNoise(t, 6.0, 0.035, { decay: 2.5 });
      break;
    case 'heart':
      addKick(t, 0.12);
      break;
    case 'step':
      addNoise(t, 0.05, 0.05, { decay: 0.02 });
      addTone(t, 0.05, 180, { wave: 'square', vol: 0.03, duty: 0.25, release: 0.02 });
      break;
    case 'chest':
      addNoise(t, 0.25, 0.1, { decay: 0.08 });
      addGlide(t, 0.4, 220, 660, { wave: 'square', vol: 0.06 });
      break;
    case 'card':
      [659.25, 880, 1174.66].forEach((f, i) => {
        addTone(t + i * 0.06, 0.18, f, { wave: 'triangle', vol: 0.07, release: 0.08 });
      });
      break;
    case 'flip':
      addNoise(t, 0.06, 0.08, { decay: 0.02 });
      addTone(t, 0.08, 520, { wave: 'square', vol: 0.05, duty: 0.3, release: 0.03 });
      break;
    case 'relay':
      addNoise(t, 0.03, 0.07, { decay: 0.01 });
      addTone(t, 0.04, 1200, { wave: 'square', vol: 0.04, duty: 0.2, release: 0.01 });
      break;
    case 'charge':
      addGlide(t, 1.6, 180, 720, { wave: 'square', vol: 0.05 });
      break;
    case 'hit':
      addNoise(t, 0.12, 0.14, { decay: 0.04 });
      addTone(t, 0.1, 150, { wave: 'square', vol: 0.09, duty: 0.25, release: 0.05 });
      break;
    case 'level':
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        addTone(t + i * 0.07, 0.16, f, { wave: 'square', vol: 0.07, duty: 0.25, release: 0.06 });
      });
      break;
    case 'uparp':
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
        addTone(t + i * 0.08, 0.2, f, { wave: 'triangle', vol: 0.06, release: 0.1 });
      });
      break;
    case 'type':
      addTone(t, 0.035, 1000 + (param % 5) * 80, { wave: 'square', vol: 0.035, duty: 0.2, release: 0.01 });
      break;
    case 'final':
      [220, 329.63, 440, 554.37].forEach((f, i) => {
        addTone(t, 2.4, f, { wave: 'triangle', vol: 0.05, attack: 0.02, decay: 0.2, sustain: 0.7, release: 0.6 });
      });
      break;
    default:
      break;
  }
}

// --- SFX timeline -----------------------------------------------------------
sfx('click', 0.55, 0);
sfx('click', 0.85, 1);
sfx('click', 1.15, 2);
sfx('send', 1.6);
sfx('blip', 2.0, 0);
sfx('blip', 2.3, 1);
sfx('blip', 2.6, 2);
sfx('chime', 3.2);
for (let t = 4.0; t < 10.0; t += 0.8) sfx('heart', t);
sfx('sweep', 4.0);
for (let t = 10.2; t < 14.8; t += 0.4) sfx('step', t);
sfx('chest', 15.0);
sfx('card', 15.6);
sfx('flip', 20.1);
sfx('flip', 21.0);
sfx('relay', 22.0);
sfx('flip', 23.5);
sfx('relay', 25.0);
sfx('relay', 27.0);
sfx('charge', 36.4);
sfx('hit', 33.8);
sfx('hit', 35.0);
sfx('hit', 36.2);
sfx('level', 39.2);
sfx('uparp', 42.0);
for (let t = 47.5; t < 48.7; t += 0.09) sfx('type', t, Math.round((t * 100) % 5));
sfx('final', 52.0);

// --- BGM sequencer ----------------------------------------------------------
const BPM = 78;
const STEP = 60 / BPM / 4; // 16th note
const CHORDS = [
  [57, 60, 64], // Am
  [53, 57, 60], // F
  [48, 52, 55], // C
  [55, 59, 62], // G
];
const ROOTS = [45, 41, 36, 43];
const MELODY = [69, 72, 76, 79, 76, 72, 69, 67, 65, 69, 72, 76, 74, 71, 67, 64];

const steps = Math.ceil(DUR / STEP);
for (let i = 0; i < steps; i++) {
  const t = i * STEP;
  if (t >= DUR) break;
  const bar = Math.floor(i / 16);
  const s = i % 16;
  const chord = CHORDS[bar % 4];
  const root = ROOTS[bar % 4];

  if (t < 4) {
    // Intro: a single pulsing note every quarter.
    if (s % 4 === 0) addTone(t, STEP * 3.5, NOTE(chord[0] + 12), { wave: 'triangle', vol: 0.055, release: 0.2 });
  } else if (t < 10) {
    // Dive: low drone and a slow pulse.
    if (s % 8 === 0) addTone(t, STEP * 7, NOTE(root - 12), { wave: 'triangle', vol: 0.075, release: 0.3 });
    if (s % 8 === 4) addTone(t, STEP * 3, NOTE(chord[2] + 12), { wave: 'sine', vol: 0.035, release: 0.2 });
  } else if (t < 42) {
    // Main groove.
    if (s === 0 || s === 8) {
      addTone(t, STEP * 3, NOTE(root - 12), { wave: 'triangle', vol: 0.1, release: 0.12 });
      addKick(t, 0.13);
    }
    if (s === 4 || s === 12) addNoise(t, 0.08, 0.04, { decay: 0.035 });
    if (s % 2 === 0) {
      addNoise(t, 0.02, 0.018, { decay: 0.008 });
      addTone(t, STEP * 1.4, NOTE(chord[(s / 2) % 3] + 12), {
        wave: 'square',
        vol: 0.038,
        duty: 0.25,
        release: 0.04,
      });
    }
    if (s % 4 === 0) {
      addTone(t, STEP * 2.2, NOTE(MELODY[(bar * 4 + s / 4) % 16]), {
        wave: 'square',
        vol: 0.05,
        duty: 0.5,
        release: 0.08,
      });
    }
  } else if (t < 52) {
    // Write-back: brighter, more forward motion.
    if (s % 4 === 0) {
      addTone(t, STEP * 3, NOTE(root - 12), { wave: 'triangle', vol: 0.085, release: 0.12 });
      if (s === 0 || s === 8) addKick(t, 0.1);
    }
    if (s % 2 === 0) {
      addTone(t, STEP * 1.6, NOTE(chord[(s / 2) % 3] + 24), {
        wave: 'sine',
        vol: 0.04,
        release: 0.06,
      });
    }
    if (s % 4 === 0) {
      addTone(t, STEP * 2.5, NOTE(MELODY[(bar * 4 + s / 4 + 4) % 16] + 12), {
        wave: 'triangle',
        vol: 0.045,
        release: 0.1,
      });
    }
  } else {
    // Outro: sustained chord and sparse melody.
    if (s === 0) {
      chord.forEach((n) => addTone(t, STEP * 14, NOTE(n), {
        wave: 'triangle',
        vol: 0.032,
        attack: 0.03,
        sustain: 0.75,
        release: 0.8,
      }));
    }
    if (s % 4 === 0) {
      addTone(t, STEP * 3, NOTE(MELODY[(bar * 4 + s / 4) % 16] + 12), {
        wave: 'square',
        vol: 0.038,
        duty: 0.25,
        release: 0.2,
      });
    }
  }
}

// --- Mix and write ----------------------------------------------------------
let peak = 0;
for (let i = 0; i < N; i++) {
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = peak > 0.85 ? 0.85 / peak : 1;

const outDir = path.resolve(import.meta.dirname, '..', 'out');
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'mix.wav');
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);

for (let i = 0; i < N; i++) {
  const l = clamp(Math.round(L[i] * gain * 32767), -32768, 32767);
  const r = clamp(Math.round(R[i] * gain * 32767), -32768, 32767);
  buf.writeInt16LE(l, 44 + i * 4);
  buf.writeInt16LE(r, 46 + i * 4);
}
writeFileSync(outFile, buf);
console.log(`wrote ${outFile} (${DUR}s, ${SR}Hz stereo, peak ${peak.toFixed(3)}, gain ${gain.toFixed(3)})`);
