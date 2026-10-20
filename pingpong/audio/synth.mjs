// Procedural SFX for the 120s spin explainer. No samples, no continuous BGM.
// Every sound is an event; silence between events is intentional.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SR = 48000;
const DUR = 120;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let seed = 0x51a7c0de;
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
    wave = 'triangle',
    vol = 0.08,
    pan = 0,
    duty = 0.5,
    attack = 0.006,
    decay = 0.05,
    sustain = 0.55,
    release = 0.08,
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
  const { wave = 'sine', vol = 0.06, pan = 0, duty = 0.5 } = opts;
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
    const env = Math.min(1, p * 6) * Math.min(1, (1 - p) * 3);
    const s = v * env * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

function addNoise(start, dur, vol = 0.04, opts = {}) {
  const { pan = 0, decay = 0.05, attack = 0.002 } = opts;
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + dur) * SR));
  const [gl, gr] = panGains(pan);
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    const env = Math.min(1, tt / attack) * Math.exp(-tt / decay);
    const s = noise() * env * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

function addKick(start, vol = 0.14, freq = 58) {
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + 0.24) * SR));
  let phase = 0;
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    const f = freq * Math.exp(-tt * 14) + 38;
    phase += f / SR;
    const env = Math.exp(-tt * 9);
    const s = Math.sin(2 * Math.PI * phase) * env * vol;
    L[i] += s;
    R[i] += s;
  }
}

function sfx(name, t, param = 0) {
  switch (name) {
    case 'paper':
      addNoise(t, 0.28, 0.05, { decay: 0.09, pan: param });
      addTone(t, 0.18, 240, { wave: 'triangle', vol: 0.018, pan: param, release: 0.1 });
      break;
    case 'pock':
      addNoise(t, 0.04, 0.11, { decay: 0.012 });
      addTone(t, 0.08, 190 + param * 25, { wave: 'triangle', vol: 0.09, release: 0.05 });
      addTone(t + 0.008, 0.05, 520 + param * 40, { wave: 'square', vol: 0.025, duty: 0.18, release: 0.03 });
      break;
    case 'tick':
      addNoise(t, 0.025, 0.07, { decay: 0.008 });
      addTone(t, 0.045, 1250 + param * 120, { wave: 'square', vol: 0.028, duty: 0.2, release: 0.02 });
      break;
    case 'bounce':
      addNoise(t, 0.05, 0.08, { decay: 0.018 });
      addTone(t, 0.1, 320 + param * 50, { wave: 'triangle', vol: 0.07, release: 0.06 });
      addTone(t + 0.01, 0.07, 880 + param * 70, { wave: 'sine', vol: 0.03, release: 0.04 });
      break;
    case 'brush':
      addNoise(t, 0.16, 0.055, { decay: 0.045, pan: param });
      addTone(t, 0.12, 740 + param * 60, { wave: 'triangle', vol: 0.035, release: 0.08 });
      break;
    case 'squeak':
      addGlide(t, 0.16, 720, 1180, { wave: 'sine', vol: 0.045, pan: param });
      addNoise(t, 0.12, 0.03, { decay: 0.05, pan: param });
      break;
    case 'air':
      addNoise(t, 0.9, 0.04, { decay: 0.35, attack: 0.12, pan: param });
      addGlide(t, 0.8, 140, 90, { wave: 'sine', vol: 0.018, pan: param });
      break;
    case 'whoosh':
      addNoise(t, 0.5, 0.05, { decay: 0.18, attack: 0.04, pan: param });
      addGlide(t, 0.45, 420, 120, { wave: 'sine', vol: 0.035, pan: param });
      break;
    case 'stamp':
      addNoise(t, 0.07, 0.08, { decay: 0.02 });
      addKick(t, 0.1, 70);
      addTone(t, 0.09, 150, { wave: 'square', vol: 0.035, duty: 0.2, release: 0.05 });
      break;
    case 'blip':
      addTone(t, 0.07, 900 + param * 80, { wave: 'square', vol: 0.035, duty: 0.22, release: 0.03 });
      break;
    case 'chime':
      [880, 1108.73, 1318.51].forEach((f, i) => {
        addTone(t + i * 0.09, 0.2, f, { wave: 'triangle', vol: 0.055, release: 0.1 });
      });
      break;
    case 'lowchime':
      [220, 329.63, 440].forEach((f, i) => {
        addTone(t + i * 0.12, 0.9, f, { wave: 'triangle', vol: 0.045, release: 0.4 });
      });
      break;
    case 'final':
      [220, 329.63, 440, 554.37].forEach((f, i) => {
        addTone(t + i * 0.03, 2.6, f, {
          wave: 'triangle',
          vol: 0.05,
          attack: 0.02,
          decay: 0.2,
          sustain: 0.7,
          release: 0.8,
        });
      });
      break;
    default:
      break;
  }
}

// --- Event timeline ---------------------------------------------------------
// Title card
sfx('paper', 0.15, -0.2);
sfx('stamp', 1.2);
sfx('chime', 1.45);

// Hook
sfx('tick', 2.0);
sfx('pock', 2.35, 0);
sfx('whoosh', 2.7, 0.2);
sfx('tick', 4.2);
sfx('whoosh', 5.8, -0.1);
sfx('paper', 7.55, 0);

// Axis
sfx('blip', 8.35, 0);
sfx('lowchime', 10.6);
sfx('paper', 12.8, -0.2);
sfx('blip', 13.15, 0);
sfx('blip', 13.45, 1);
sfx('blip', 13.75, 2);
sfx('tick', 17.4);
sfx('tick', 18.0);
sfx('paper', 20.0, 0.2);

// Friction
sfx('pock', 25.0, 1);
sfx('squeak', 27.6, 0.1);
sfx('brush', 30.2, 0.1);
sfx('brush', 32.8, -0.2);
sfx('brush', 33.4, 0.2);
sfx('stamp', 35.7);
sfx('tick', 38.4);
sfx('paper', 40.0, 0);

// Air
sfx('air', 42.6, -0.2);
sfx('air', 45.0, 0.2);
sfx('whoosh', 47.8, 0);
sfx('stamp', 50.4);
sfx('blip', 53.0, 1);
sfx('blip', 56.0, 0);
sfx('blip', 58.6, 1);
sfx('blip', 61.2, 2);
sfx('paper', 63.55, 0);

// Bounce
sfx('bounce', 64.8, 0);
sfx('bounce', 67.4, 0);
sfx('pock', 69.8, 1);
sfx('tick', 72.4);
sfx('bounce', 75.2, 2);
sfx('tick', 77.8);
sfx('tick', 80.2);
sfx('chime', 82.3);
sfx('paper', 83.55, 0);

// Read & return
sfx('blip', 84.6, 0);
sfx('tick', 86.6);
sfx('tick', 87.1);
sfx('tick', 87.6);
sfx('brush', 89.2, -0.2);
sfx('whoosh', 91.6, 0.2);
sfx('pock', 94.2, 0);
sfx('pock', 96.8, 1);
sfx('brush', 99.6, 0);
sfx('chime', 101.8);
sfx('paper', 103.55, 0);

// Outro
sfx('lowchime', 104.5);
sfx('air', 106.8, 0);
sfx('bounce', 109.4, 0);
sfx('chime', 112.0);
sfx('blip', 114.8, 0);
sfx('final', 116.8);

// --- Mix and write ----------------------------------------------------------
let peak = 0;
for (let i = 0; i < N; i++) {
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = peak > 0 ? 0.8 / peak : 1;

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
