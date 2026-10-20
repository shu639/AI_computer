import path from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { ROOT } from './serve.mjs';

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const FPS = Number(arg('fps', 30));
const DURATION = Number(arg('duration', 120));
const FRAMES = path.join(ROOT, 'out', 'frames');
const VIDEO = path.resolve(ROOT, arg('video', 'out/pingpong-spin-120s.mp4'));

const candidates = [
  process.env.FFMPEG_PATH,
  path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
  path.join(ROOT, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe'),
  'ffmpeg',
].filter(Boolean);
const ffmpeg = candidates.find((p) => p === 'ffmpeg' || existsSync(p));

const checks = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
}

const frames = existsSync(FRAMES) ? readdirSync(FRAMES).filter((f) => f.endsWith('.png')) : [];
const expectedFrames = Math.round(DURATION * FPS);
check(`frames = ${expectedFrames}`, frames.length === expectedFrames, `found ${frames.length}`);
check('video exists', existsSync(VIDEO), VIDEO);

if (existsSync(VIDEO)) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', VIDEO], { encoding: 'utf8' });
  const s = `${r.stderr || ''}${r.stdout || ''}`;
  const dm = s.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const actual = dm ? Number(dm[1]) * 3600 + Number(dm[2]) * 60 + Number(dm[3]) : NaN;
  check(`duration ${DURATION}s`, Number.isFinite(actual) && Math.abs(actual - DURATION) < 0.12, dm ? dm[0] : 'not found');
  check('resolution 1920x1080', /1920x1080/.test(s));
  check(`frame rate ${FPS}fps`, new RegExp(`${FPS} fps`).test(s));
  check('pixel format yuv420p', /yuv420p/.test(s));
  check('audio 48kHz stereo', /48000 Hz, stereo/.test(s));
  check('audio codec aac', /Audio: aac/.test(s));
}

const ok = checks.every((c) => c.ok);
console.log(ok ? 'QA PASS' : 'QA FAIL');
process.exit(ok ? 0 : 1);
