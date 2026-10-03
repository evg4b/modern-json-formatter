// v2 soundtrack: 120 BPM four-on-the-floor house in F major, 23s. Music + UI sounds mixed as one piece.
import { writeFileSync } from 'node:fs';

const SR = 48000, DUR = 23, N = SR * DUR, B = 0.5;          // B = one beat
const L = new Float32Array(N), R = new Float32Array(N);       // music bus (gets sidechain)
const KL = new Float32Array(N), KR = new Float32Array(N);     // drums + fx bus (no sidechain)
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1; })();

function add(bus, t0, buf, gain = 1, pan = 0) {
  const [bl, br] = bus, s0 = Math.floor(t0 * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < buf.length; i++) { const j = s0 + i; if (j < 0 || j >= N) continue; bl[j] += buf[i] * gl; br[j] += buf[i] * gr; }
}
const M = [L, R], D = [KL, KR];
function lp(buf, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; for (let i = 0; i < buf.length; i++) { y = (1 - a) * buf[i] + a * y; buf[i] = y; } return buf; }
function hp(buf, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0, px = 0; for (let i = 0; i < buf.length; i++) { y = a * (y + buf[i] - px); px = buf[i]; buf[i] = y; } return buf; }
const saw = (f, t) => 2 * ((f * t) % 1) - 1;

// ---- instruments ----
function stab(ms, len, fc) {           // house chord stab: detuned saws, plucky filter
  const n = Math.floor(len * SR), b = new Float32Array(n);
  for (const m of ms) for (const d of [-0.1, 0, 0.1]) { const f = mtof(m) * Math.pow(2, d / 12);
    for (let i = 0; i < n; i++) b[i] += saw(f, i / SR); }
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] *= Math.min(1, t * 500) * Math.exp(-t * 7) / (ms.length * 3); }
  return lp(lp(b, fc), fc * 1.5);
}
function padv(ms, len, fc0, fc1) {      // pad with filter sweep fc0 → fc1
  const n = Math.floor(len * SR), b = new Float32Array(n);
  for (const m of ms) for (const d of [-0.12, 0.12]) { const f = mtof(m) * Math.pow(2, d / 12);
    for (let i = 0; i < n; i++) b[i] += saw(f, i / SR); }
  let y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, fc = fc0 * Math.pow(fc1 / fc0, t / len), a = Math.exp(-2 * Math.PI * fc / SR);
    y1 = (1 - a) * b[i] + a * y1; y2 = (1 - a) * y1 + a * y2;
    b[i] = y2 * Math.min(1, t / 0.3) * Math.min(1, (len - t) / 0.3) / (ms.length * 2); }
  return b;
}
function sub(m, len) { const n = Math.floor(len * SR), b = new Float32Array(n), f = mtof(m);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = Math.tanh(1.6 * Math.sin(2 * Math.PI * f * t)) * Math.min(1, t * 300) * Math.min(1, (len - t) * 40); } return b; }
function lead(m, len) { const n = Math.floor(len * SR), b = new Float32Array(n), f = mtof(m);
  for (let i = 0; i < n; i++) { const t = i / SR, vib = 1 + 0.004 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t * 4);
    const ph = (f * vib * t) % 1, tri = 4 * Math.abs(ph - 0.5) - 1;
    b[i] = (tri * 0.8 + 0.2 * Math.sin(4 * Math.PI * f * t)) * Math.min(1, t * 200) * Math.exp(-t * 3.2) * Math.min(1, (len - t) * 30); } return lp(b, 5000); }
function kick() { const n = Math.floor(0.4 * SR), b = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, f = 46 + 120 * Math.exp(-t * 35); ph += f / SR; b[i] = Math.tanh(2 * Math.sin(2 * Math.PI * ph) * Math.exp(-t * 7)) + (t < 0.004 ? rnd() * 0.3 : 0); } return b; }
function clap() { const n = Math.floor(0.25 * SR), b = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; let e = Math.exp(-t * 22); for (const o of [0, 0.011, 0.022]) if (t >= o && t < o + 0.01) e = Math.max(e, Math.exp(-(t - o) * 300));
    b[i] = rnd() * e; } return hp(lp(b, 6000), 900); }
function hat(open) { const n = Math.floor((open ? 0.22 : 0.05) * SR), b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = rnd() * Math.exp(-i / SR * (open ? 14 : 70)); return hp(lp(b, 12000), 7000); }
function riser(len) { const n = Math.floor(len * SR), b = new Float32Array(n); let y = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, k = t / len, fc = 400 + 7000 * k * k, a = Math.exp(-2 * Math.PI * fc / SR);
    y = (1 - a) * rnd() + a * y; b[i] = y * k * k * Math.min(1, (len - t) * 40); } return b; }
function crash(len) { const n = Math.floor(len * SR), b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = rnd() * Math.exp(-i / SR * 2.2); return hp(lp(b, 9000), 3000); }
function pop(f0, f1, len = 0.06) { const n = Math.floor(len * SR), b = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, f = f1 + (f0 - f1) * Math.exp(-t * 60); ph += f / SR; b[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 45); } return b; }
function tick() { const n = Math.floor(0.025 * SR), b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = rnd() * Math.exp(-i / SR * 250); return hp(lp(b, 7000), 2500); }
function blip(m, len = 0.18) { const n = Math.floor(len * SR), b = new Float32Array(n), f = mtof(m);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = Math.sin(2 * Math.PI * f * t) * Math.min(1, t * 800) * Math.exp(-t * 18); } return b; }

// ---- arrangement ----
const CH = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60, 64], [46, 50, 53, 57, 60]]; // Fmaj7 Am7 Dm9 Bbmaj9
const ROOT = [41, 45, 38, 46];
const DROP = 2.5, BREAK0 = 11.5, BREAK1 = 13.0, END = 19.5;
const inBody = t => t >= DROP && t < END;
const inBreak = t => t >= BREAK0 && t < BREAK1;

// intro: swelling pad + riser
add(M, 0, padv(CH[0].map(m => m + 12), 2.0, 500, 1800), 0.55);
add(M, 2.0, padv(CH[1].map(m => m + 12), 0.5, 1800, 3000), 0.55);
add(D, 1.3, riser(1.2), 0.2);
// intro hint: soft offbeat stabs
for (let t = 0.25; t < DROP; t += B) add(M, t, stab(CH[Math.floor(t / 2) % 4].map(m => m + 12), 0.25, 1400), 0.22, 0);

for (let beat = 0; beat * B < END; beat++) {
  const t = beat * B, c = Math.floor(t / 2) % 4;
  if (!inBody(t)) continue;
  const brk = inBreak(t);
  if (!brk) add(D, t, kick(), 0.55);
  if (!brk && beat % 2 === 1) add(D, t, clap(), 0.16, 0.05);
  add(D, t + B / 2, hat(true), brk ? 0.03 : 0.055, 0.25);
  for (let k = 0; k < 4; k++) add(D, t + k * B / 4, hat(false), (k % 2 ? 0.025 : 0.015) * (brk ? 0.6 : 1), -0.3);
  // offbeat stab
  add(M, t + B / 2, stab(CH[c].map(m => m + 12), 0.3, brk ? 1100 : 2600), 0.2, (beat % 2 ? 0.15 : -0.15));
  // bass: root on beat, octave on offbeat
  if (!brk) { add(M, t, sub(ROOT[c], B * 0.45), 0.22); add(M, t + B / 2, sub(ROOT[c] + 12, B * 0.4), 0.13); }
}
// break pad under the typing
add(M, BREAK0, padv(CH[3].map(m => m + 12), BREAK1 - BREAK0 + 0.1, 500, 2400), 0.22);
add(D, BREAK1 - 0.9, riser(0.9), 0.12);

// lead hook from 5.0 (8ths, rests marked null), one phrase per chord
const PHR = [[72, null, 69, 72, null, 74, 72, null], [76, null, 72, 74, null, 72, 69, null],
             [74, null, 72, 69, null, 72, 74, 77], [76, null, 74, null, 72, null, 69, null]];
for (let t = 5.0; t < END - 0.01; t += 2) {
  if (t >= BREAK0 - 0.5 && t < BREAK1) continue;
  const c = Math.floor(t / 2) % 4;
  PHR[c].forEach((m, k) => { if (m != null) add(M, t + k * B / 2, lead(m, 0.32), 0.07, 0.1); });
}

// outro: crash + Fmaj9 bloom
add(D, END, kick(), 0.5); add(D, END, crash(3.5), 0.08);
add(M, END, padv([41, 53, 57, 60, 64, 67].map(m => m + 12), DUR - END, 3000, 900), 0.6);
[77, 81, 84, 88].forEach((m, i) => add(M, END + 0.1 + i * 0.09, lead(m, 1.4), 0.05, (i / 3 - 0.5) * 0.7));

// ---- UI sounds (in key, under the music) ----
add(D, 5.75, pop(220, 110, 0.18), 0.12);               // ghost value
add(D, 8.55, pop(220, 110, 0.18), 0.12);
for (const t of [11.4, 14.72, 16.85, 17.5, 18.45]) add(D, t, pop(1400, 700), 0.09);
const Q = '.todos[] | {id, title}';
for (let i = 0; i < Q.length; i++) add(D, 11.7 + (i / Q.length) * 1.3, tick(), 0.05, rnd() * 0.4);
const PENT = [65, 67, 69, 72, 74, 77, 79, 81, 84, 86];
for (let i = 0; i < 10; i++) add(D, 14.75 + i * 0.14, blip(PENT[i] + 12), 0.035, 0.2);
add(D, 19.0, blip(84, 0.4), 0.05); add(D, 19.09, blip(89, 0.5), 0.05);   // download done

// ---- mix: sidechain music to kick grid, short room, master ----
for (let i = 0; i < N; i++) { const t = i / SR;
  if (!inBody(t) || inBreak(t)) continue;
  const ph = (t % B); const g = 1 - 0.55 * Math.exp(-ph / 0.09) * Math.min(1, ph * 400);
  L[i] *= g; R[i] *= g; }
function room(x) { const out = new Float32Array(N);
  for (const [d, g] of [[0.023, 0.5], [0.037, 0.4], [0.053, 0.33], [0.079, 0.25], [0.113, 0.18]]) { const D_ = Math.floor(d * SR * 2.2), buf = new Float32Array(N);
    for (let i = 0; i < N; i++) { buf[i] = x[i] + (i >= D_ ? buf[i - D_] * 0.5 : 0); out[i] += buf[i] * g * 0.12; } }
  return hp(lp(out, 5000), 200); }
const rl = room(L), rr = room(R), dl = room(KL), dr = room(KR);
const pcm = Buffer.alloc(44 + N * 4);
for (let i = 0; i < N; i++) { const t = i / SR, g = Math.min(1, t / 0.05) * Math.min(1, (DUR - t) / 1.2) * 1.25;
  const l = Math.tanh((L[i] + KL[i] + rl[i] + dl[i] * 0.4) * g), r = Math.tanh((R[i] + KR[i] + rr[i] + dr[i] * 0.4) * g);
  pcm.writeInt16LE(Math.round(l * 32000), 44 + i * 4); pcm.writeInt16LE(Math.round(r * 32000), 46 + i * 4); }
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20);
pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34);
pcm.write('data', 36); pcm.writeUInt32LE(N * 4, 40);
writeFileSync('audio.wav', pcm);
console.log('ok');
