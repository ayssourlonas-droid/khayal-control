// More flourishes (contract in flourish.js): Hollow Night's bats and witch crossing the harvest moon,
// and the thunder that throws the castle into black relief against a lightning-white sky.
import { W, rgba, hash, glow, soft, cached, byColor, lin, lighter, normal } from './sprites.js';
import { MOON } from './sky-bodies-3.js';
import { TAU } from '../core/math.js';

const INK = '#05020b';

// One bat, wings up, level and down (frames 0-2), 64 x 40, the body at (32, 22).
const paintBat = (frame) => cached('bat' + frame, 64, 40, (g) => {
  const tip = [4, 17, 33][frame];
  g.fillStyle = INK;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(32 + s * 3, 19);
    g.quadraticCurveTo(32 + s * 16, tip - 5, 32 + s * 29, tip);
    g.quadraticCurveTo(32 + s * 25, tip + 9, 32 + s * 21, tip + 6); // the scalloped trailing edge
    g.quadraticCurveTo(32 + s * 18, tip + 14, 32 + s * 13, tip + 9);
    g.quadraticCurveTo(32 + s * 9, tip + 17, 32 + s * 5, 28);
    g.fill();
  }
  g.beginPath();
  g.ellipse(32, 23, 4, 7, 0, 0, TAU);
  g.moveTo(28.5, 15);
  g.lineTo(27, 7);
  g.lineTo(31, 13);
  g.moveTo(35.5, 15);
  g.lineTo(37, 7);
  g.lineTo(33, 13);
  g.ellipse(32, 15, 3.4, 3.4, 0, 0, TAU);
  g.fill();
});

const WING = [0, 1, 2, 1];
const bat = byColor(paintBat); // by frame, not colour: a bare Map get, so a flock builds no key
export const batBeat = (n) => bat(WING[n & 3]); // the bat on wing-beat n; also the Count's swarm (bosses/count.js)

const SLOWEST = 250; // px/s, the slowest bat of the flock; the others add up to 60 more
const GONE = (W + 170) / SLOWEST + 8 * 0.17 + 0.5; // s into the flight after which every bat is across: W + 170 px at SLOWEST, the last one 8 x 0.17 + 0.5 s late

// A flock of nine crossing the moon from one side, now and then, each bat flapping to its own beat.
function bats(ctx, { t }) {
  const PERIOD = 17;
  const slot = Math.floor(t / PERIOD);
  const lt = t - slot * PERIOD - 1.5;
  if (lt < 0 || lt > GONE || hash(slot * 5) > 0.7) return;
  const dir = hash(slot * 5 + 1) < 0.5 ? 1 : -1;
  const y0 = MOON.y + (hash(slot * 5 + 2) - 0.5) * 120;
  for (let i = 0; i < 9; i++) {
    const age = lt - i * 0.17 - hash(slot * 17 + i) * 0.5;
    const v = SLOWEST + hash(i + 90) * 60;
    const x = dir > 0 ? -80 + age * v : W + 80 - age * v;
    if (x < -90 || x > W + 90) continue;
    const s = 0.75 + hash(i + 91) * 0.65;
    const y = y0 + Math.sin(age * 1.7 + i) * 34 + (hash(i + 92) - 0.5) * 150;
    ctx.drawImage(batBeat(Math.floor(t * 9 + i * 1.7)), x - 32 * s, y - 22 * s, 64 * s, 40 * s);
  }
}

// A witch on her broom, facing right, 240 x 130, hat tip at the left: cloak and hair streaming back,
// a boot dangling, a cat riding the tail.
const witch = () => cached('witch', 240, 130, (g) => {
  g.fillStyle = INK;
  g.strokeStyle = INK;
  g.lineCap = 'round';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(40, 98);
  g.lineTo(206, 76);
  g.stroke();
  for (let i = 0; i < 9; i++) { // the bristles, splayed
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(52, 97 - i * 0.3);
    g.quadraticCurveTo(30, 98 + (i - 4) * 4, 4 + (i % 2) * 8, 84 + i * 3.6);
    g.stroke();
  }
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(58, 96);
  g.lineTo(59, 100);
  g.stroke();
  g.beginPath(); // the cloak
  g.moveTo(138, 54);
  g.quadraticCurveTo(110, 56, 92, 84);
  g.lineTo(84, 92);
  g.lineTo(96, 88);
  g.lineTo(100, 98);
  g.lineTo(112, 90);
  g.lineTo(124, 94);
  g.quadraticCurveTo(138, 84, 152, 70);
  g.closePath();
  g.fill();
  g.beginPath(); // a leg bent over the handle and its boot, toe curled
  g.moveTo(130, 88);
  g.lineTo(142, 104);
  g.lineTo(138, 116);
  g.lineTo(152, 120);
  g.lineTo(150, 124);
  g.lineTo(130, 120);
  g.lineTo(128, 102);
  g.closePath();
  g.fill();
  g.beginPath(); // the arm reaching for the handle
  g.moveTo(148, 58);
  g.quadraticCurveTo(168, 66, 176, 80);
  g.stroke();
  g.beginPath(); // head, hooked nose and the hat
  g.arc(156, 42, 9, 0, TAU);
  g.moveTo(162, 40);
  g.lineTo(172, 47);
  g.lineTo(163, 48);
  g.fill();
  g.beginPath();
  g.ellipse(154, 34, 24, 5.5, -0.12, 0, TAU);
  g.moveTo(142, 33);
  g.quadraticCurveTo(138, 12, 118, 8);
  g.quadraticCurveTo(100, 4, 94, 18); // the tip bent back
  g.quadraticCurveTo(116, 16, 128, 34);
  g.lineTo(166, 32);
  g.lineTo(150, 4);
  g.fill();
  g.lineWidth = 3;
  for (const [y, k] of [[44, 1], [50, 0.7], [56, 1.2]]) { // hair in the wind
    g.beginPath();
    g.moveTo(148, y - 4);
    g.quadraticCurveTo(128, y + 4 * k, 110, y + 14 * k);
    g.stroke();
  }
  g.beginPath(); // the cat
  g.ellipse(80, 90, 9, 7, 0, 0, TAU);
  g.moveTo(76, 84);
  g.lineTo(74, 72);
  g.lineTo(80, 80);
  g.moveTo(86, 84);
  g.lineTo(88, 72);
  g.lineTo(90, 82);
  g.arc(82, 80, 6, 0, TAU);
  g.fill();
  g.beginPath();
  g.moveTo(72, 92);
  g.quadraticCurveTo(54, 94, 58, 76);
  g.stroke();
});

// Rarely, a witch crosses the moon in a high arc, a trail of green witch-fire behind her broom.
function witchFlight(ctx, { t }) {
  const PERIOD = 41;
  const slot = Math.floor(t / PERIOD);
  const lt = t - slot * PERIOD - 9;
  if (lt < 0 || lt > 7.5 || hash(slot * 7 + 3) > 0.55) return;
  const u = lt / 7.5;
  const dir = hash(slot * 7 + 4) < 0.5 ? 1 : -1;
  const x = dir > 0 ? -150 + u * (W + 300) : W + 150 - u * (W + 300);
  const y = MOON.y - 20 - Math.sin(u * Math.PI) * 90 + Math.sin(t * 2.6) * 7;
  const tilt = Math.cos(u * Math.PI) * 0.12 * -dir + Math.sin(t * 2.6) * 0.03;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(dir * 0.85, 0.85);
  ctx.drawImage(witch(), -120, -62);
  ctx.restore();
  lighter(ctx);
  for (let i = 0; i < 9; i++) { // sparks fall away behind the bristles
    const k = i / 9;
    ctx.globalAlpha = 0.8 * (1 - k);
    const r = 11 * (1 - k * 0.6);
    ctx.drawImage(glow('#7dff5a'), x - dir * (118 + i * 24) - r, y + 30 + Math.sin(t * 7 + i * 1.9) * 6 + k * 26 - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 0.9 * (0.7 + 0.3 * Math.sin(t * 19));
  const ex = x - dir * 38 * 0.85; // the cat's eyes, two yellow points on its head (sprite x 82)
  for (const s of [-1, 1]) ctx.drawImage(glow('#ffe14a'), ex + s * 3.4 - 5, y + 14 - 5, 10, 10);
  normal(ctx);
}

// The sky behind the silhouettes, a bruised white from the horizon up, for each lightning flash: it
// flickers (a strong strike, a stutter, a second glow) and dies away.
const wash = () => cached('thunder', 4, 256, (g, w, h) => {
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, rgba('#a8a0ff', 0.55)], [0.6, rgba('#e0d4ff', 0.85)], [1, rgba('#fff2e0', 1)]]);
  g.fillRect(0, 0, w, h);
});

function thunder(ctx, { fx, quality }) {
  for (const f of fx.flashes) {
    if (f.tag !== 'lightning') continue;
    const age = f.max - f.life;
    const k = (age < 0.08 ? 1 : age < 0.12 ? 0.3 : 0.85) * Math.min(1, f.life / 0.1);
    lighter(ctx);
    ctx.globalAlpha = k * (0.25 + 0.4 * f.alpha);
    ctx.drawImage(wash(), 0, 0, W, 800);
    ctx.globalAlpha = k * 0.3;
    if (!(quality < 1)) ctx.drawImage(soft('#e8e0ff'), MOON.x - 700, 120, 1400, 800); // the moon's glow is as many pixels again as the wash: half quality goes without
    normal(ctx);
  }
}

export const FLOURISH4 = { bats: { sky: bats }, witch: { sky: witchFlight }, thunder: { sky: thunder } };
