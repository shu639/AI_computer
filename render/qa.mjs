import path from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const FRAMES = path.join(ROOT, 'out', 'frames');
const VIDEO = path.join(ROOT, 'out', 'ai-chip-60s.mp4');

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
check('frames = 1800', frames.length === 1800, `found ${frames.length}`);
check('video exists', existsSync(VIDEO), VIDEO);

if (existsSync(VIDEO)) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', VIDEO], { encoding: 'utf8' });
  const s = `${r.stderr || ''}${r.stdout || ''}`;
  check('duration 60s', /Duration: 00:01:00\.00/.test(s));
  check('resolution 1920x1080', /1920x1080/.test(s));
  check('frame rate 30fps', /30 fps/.test(s));
  check('pixel format yuv420p', /yuv420p/.test(s));
  check('audio 48kHz stereo', /48000 Hz, stereo/.test(s));
  check('audio codec aac', /Audio: aac/.test(s));
}

const ok = checks.every((c) => c.ok);
console.log(ok ? 'QA PASS' : 'QA FAIL');
process.exit(ok ? 0 : 1);
