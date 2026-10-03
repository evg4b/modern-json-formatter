// v3: sound effects only (no music), 27s, synced to index.html timings.
import { writeFileSync } from 'node:fs';

const SR = 48000, DUR = 27, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const rnd = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1; })();
function add(t0, buf, gain = 1, pan = 0) {
  const s0 = Math.floor(t0 * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < buf.length; i++) { const j = s0 + i; if (j < 0 || j >= N) continue; L[j] += buf[i] * gl; R[j] += buf[i] * gr; }
}
function lp(b, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; for (let i = 0; i < b.length; i++) { y = (1 - a) * b[i] + a * y; b[i] = y; } return b; }
function hp(b, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0, px = 0; for (let i = 0; i < b.length; i++) { y = a * (y + b[i] - px); px = b[i]; b[i] = y; } return b; }

// sweep noise: fc from f0 to f1, bell-shaped envelope
function whoosh(len, f0, f1) { const n = Math.floor(len * SR), b = new Float32Array(n); let y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, k = t / len, fc = f0 * Math.pow(f1 / f0, k), a = Math.exp(-2 * Math.PI * fc / SR);
    y1 = (1 - a) * rnd() + a * y1; y2 = (1 - a) * y1 + a * y2; b[i] = y2 * Math.sin(Math.PI * k) ** 2; } return b; }
function click() { const n = Math.floor(0.05 * SR), b = new Float32Array(n);     // mouse click: tick + body
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = rnd() * Math.exp(-t * 900) * 0.8 + Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 300) * 0.5 + Math.sin(2 * Math.PI * 520 * t) * Math.exp(-t * 120) * 0.4; }
  return hp(b, 300); }
function key(v = 1) { const n = Math.floor(0.07 * SR), b = new Float32Array(n), f = 260 + 60 * v;  // keyboard key
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = rnd() * Math.exp(-t * 500) * 0.7 + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 90) * 0.6 + rnd() * Math.exp(-Math.max(0, t - 0.025) * 700) * (t > 0.025 ? 0.25 : 0); }
  return lp(hp(b, 150), 7000); }
function pop(f0, f1, len = 0.09) { const n = Math.floor(len * SR), b = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, f = f1 + (f0 - f1) * Math.exp(-t * 50); ph += f / SR; b[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 35) * Math.min(1, t * 2000); } return b; }
function thud() { const n = Math.floor(0.3 * SR), b = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, f = 70 + 90 * Math.exp(-t * 25); ph += f / SR; b[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 12) + rnd() * Math.exp(-t * 200) * 0.2; } return lp(b, 2000); }
function chime(m, len = 1.2) { const n = Math.floor(len * SR), b = new Float32Array(n), f = mtof(m);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = Math.min(1, t * 1500) * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3) + 0.2 * Math.sin(2 * Math.PI * f * 3 * t) * Math.exp(-t * 9)); } return b; }
function tick(f = 3000) { const n = Math.floor(0.02 * SR), b = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 350); } return b; }

// hook: response lands
add(0.12, pop(900, 1500, 0.12), 0.25);
add(0.2, tick(2400), 0.12);
// melt + cascade
add(2.2, whoosh(0.7, 300, 6000), 0.5);
for (let i = 0; i < 18; i++) add(2.85 + i * 0.05, tick(2600 + i * 60), 0.05, (i % 2 ? 0.3 : -0.3));
add(3.1, pop(600, 900, 0.1), 0.15);                         // toolbar in
// big numbers / key order
add(4.75, whoosh(0.8, 2000, 300), 0.3);
add(5.75, thud(), 0.45); add(5.76, tick(1800), 0.1);
add(7.4, whoosh(0.85, 800, 3000), 0.25);
add(8.5, thud(), 0.45); add(8.51, tick(1800), 0.1);
add(10.4, whoosh(0.8, 3000, 800), 0.25);
// links: ⌘ down, click, new tab, ⌘ up, zoom out
add(11.85, key(0), 0.55, -0.2);
add(12.4, click(), 0.55, 0.1);
add(12.5, pop(700, 1200, 0.12), 0.3, 0.4); add(12.62, pop(1000, 1600, 0.1), 0.2, 0.4);
add(12.95, key(0.5), 0.35, -0.2);
add(13.15, whoosh(0.7, 2500, 600), 0.22);
// formatted ⇄ raw
add(14.28, click(), 0.55, 0.3); add(14.3, whoosh(0.3, 1500, 5000), 0.18, 0.2);
add(15.53, click(), 0.55, 0.3); add(15.55, whoosh(0.3, 5000, 1500), 0.18, 0.2);
// jq
add(16.98, click(), 0.55, 0.2);
const Q = '.todos[] | {id, title}';
for (let i = 0; i < Q.length; i++) add(17.25 + (i / Q.length) * 1.3 + rnd() * 0.012, key(Math.abs(rnd())), Q[i] === ' ' ? 0.32 : 0.24, rnd() * 0.3);
add(18.6, key(0.2), 0.4);                                     // enter
add(18.65, whoosh(0.5, 600, 4000), 0.2);
for (let i = 0; i < 12; i++) add(18.72 + i * 0.045, tick(2800 + i * 50), 0.04, (i % 2 ? 0.3 : -0.3));
// fold
add(20.32, click(), 0.5, -0.4);
for (let i = 0; i < 10; i++) { add(20.35 + i * 0.14, click(), 0.22, -0.4); add(20.36 + i * 0.14, pop(500 + i * 60, 400 + i * 60, 0.06), 0.12, -0.4); }
// download
add(22.4, click(), 0.55, 0.5); add(22.45, pop(800, 1100, 0.08), 0.18, 0.5);
add(23.3, click(), 0.55, 0.5);
add(23.85, chime(84, 0.9), 0.14, 0.4); add(23.95, chime(89, 1.1), 0.14, 0.4);
// outro
add(24.3, whoosh(0.8, 300, 3000), 0.35);
add(24.7, pop(300, 900, 0.25), 0.35);
[77, 81, 84, 89].forEach((m, i) => add(24.95 + i * 0.07, chime(m, 2.2), 0.09, (i / 3 - 0.5) * 0.6));

// small room, then peak-normalise
function room(x) { const out = new Float32Array(N);
  for (const [d, g] of [[0.019, 0.5], [0.031, 0.4], [0.047, 0.3], [0.071, 0.2]]) { const D = Math.floor(d * SR * 2), buf = new Float32Array(N);
    for (let i = 0; i < N; i++) { buf[i] = x[i] + (i >= D ? buf[i - D] * 0.45 : 0); out[i] += buf[i] * g * 0.1; } }
  return hp(lp(out, 6000), 250); }
const rl = room(L), rr = room(R);
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i] + rl[i]), Math.abs(R[i] + rr[i]));
const g = 0.89 / peak;
const pcm = Buffer.alloc(44 + N * 4);
for (let i = 0; i < N; i++) { pcm.writeInt16LE(Math.round((L[i] + rl[i]) * g * 32767), 44 + i * 4); pcm.writeInt16LE(Math.round((R[i] + rr[i]) * g * 32767), 46 + i * 4); }
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20);
pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34);
pcm.write('data', 36); pcm.writeUInt32LE(N * 4, 40);
writeFileSync('audio.wav', pcm);
console.log('ok');
