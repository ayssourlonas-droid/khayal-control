// World 15, Lantern Deep: the invaders are the deep's own creatures, soft bodies that make their own light,
// painted dark and rich so that their glow is small and cool (amber is the enemy's bullets' alone). A lantern
// jellyfish, the first of them, is here; the darting squid is in w15-2.js, the pufferfish that swells to fire
// in w15-3.js, the hermit crab in its old diving helmet in w15-4.js and the lantern-bearing turtle in
// w15-5.js; the jellyfish's tentacles and oral arms are in w15-6.js, the squid's and the puffer's fins and
// eyes in w15-7.js, and what they all share in w15-kit.js. Whatever glows (the lantern organ, the beads of
// light, eyes) is on the lights layer. Sprites face down, toward the ship.
import { diver } from './w15-2.js';
import { gunner } from './w15-3.js';
import { armored } from './w15-4.js';
import { carrier } from './w15-5.js';
import { POSE, LOBES, rimY, lobeX, curtain, arms } from './w15-6.js';
import { rad, lin, rgba, shade, mix, bloom, gloss, line, ellipse, bead, spark, freckles, TAU, PALE, ROSE, VIOLET, ABYSS } from './w15-kit.js';

const BULGE = 3.4; // px, how far each scallop of the lip hangs below its chord
const LANTERN_Y = -8; // the glowing organ's centre, inside the bell

// The lip's scallops, from the right end to the left, the lip moved up by dy; call after a moveTo(W, rim + dy).
function scallops(g, P, dy = 0) {
  const h = P.lip / LOBES;
  for (let k = LOBES - 1; k >= 0; k--) {
    const x = lobeX(P, k);
    g.quadraticCurveTo(x, rimY(P, x) + BULGE * 2 + dy, x - h, rimY(P, x - h) + dy);
  }
}

function dome(g, P) {
  g.beginPath();
  g.moveTo(-P.lip, P.rim);
  g.bezierCurveTo(-P.W * 1.06, P.rim - 19, -P.W * 0.6, P.top, 0, P.top);
  g.bezierCurveTo(P.W * 0.6, P.top, P.W * 1.06, P.rim - 19, P.lip, P.rim);
}

function bell(g, P) {
  dome(g, P);
  scallops(g, P);
  g.closePath();
}

// Radial canals from the lantern out to the lip, swirled a little: [start, control, end] each.
function canalsOf(P) {
  const out = [];
  const n = 11;
  for (let k = 0; k < n; k++) {
    const a = Math.PI * (0.06 + (0.88 * k) / (n - 1));
    const end = [Math.cos(a) * P.W * 0.98, P.rim - Math.sin(a) * (P.rim - P.top) * 0.96];
    const mid = [end[0] * 0.5, (LANTERN_Y + end[1]) / 2];
    const len = Math.hypot(end[0], end[1] - LANTERN_Y);
    out.push([[0, LANTERN_Y], [mid[0] - ((end[1] - LANTERN_Y) / len) * 3, mid[1] + (end[0] / len) * 3], end]);
  }
  return out;
}

function trace(g, [s, c, e]) {
  g.beginPath();
  g.moveTo(...s);
  g.quadraticCurveTo(...c, ...e);
}

// The glowing organ: four rosy horseshoe gonads round a cup of glass, lit from within.
function lantern(b, c) {
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * TAU) / 4;
    ellipse(b, Math.cos(a) * 7.2, LANTERN_Y + Math.sin(a) * 5.6, 4.6, 3, a);
    b.fillStyle = rad(b, Math.cos(a) * 7.2, LANTERN_Y + Math.sin(a) * 5.6, 0, 5, [[0, rgba('#ffd0f0', 0.9)], [1, rgba(mix(ROSE, VIOLET, 0.4), 0.55)]]);
    b.fill();
    line(b, rgba(ABYSS, 0.5), 1);
  }
  ellipse(b, 0, LANTERN_Y, 6.4, 8.4);
  b.fillStyle = rad(b, 0, LANTERN_Y, 0.5, 9.5, [[0, shade(c, 0.9)], [0.3, shade(c, 0.7)], [0.7, c], [1, mix(c, '#0a2a60', 0.55)]]);
  b.fill();
  line(b, '#0a0c16', 1.7);
  gloss(b, -2, LANTERN_Y - 4, 2.6, 1.6, 0.8, -0.5);
}

// A lantern jellyfish: a bell that pulses (wide and relaxed on beat 0, narrow, tall and squeezed on beat 1),
// glass-clear and deep-bodied, lit from the lantern in its middle, with radial canals, ridges of muscle,
// pale warts on the crown, a scalloped lip with a bead of light in every scallop, a curtain of fine
// tentacles and four frilled oral arms.
function grunt(b, l, f, c) {
  const P = POSE[f];
  const canals = canalsOf(P);
  curtain(b, l, f, c);
  arms(b, f, c);
  bell(b, P);
  b.fillStyle = rad(b, 0, LANTERN_Y, 0, P.W * 1.08, [[0, shade(c, 0.62)], [0.28, c], [0.7, mix(c, '#12307a', 0.55)], [1, mix(c, '#1c0e52', 0.8)]]);
  b.fill();
  line(b, '#0a0c16', 3);
  b.save();
  bell(b, P);
  b.clip();
  for (const cn of canals) { // canals: a dark groove with a pale thread in it
    trace(b, cn);
    line(b, rgba(ABYSS, 0.3), 1.8);
    trace(b, cn);
    line(b, rgba(PALE, 0.38), 0.9);
  }
  for (const r of [0.6, 0.84]) { // the muscle ridges round the lip
    b.beginPath();
    b.ellipse(0, P.rim, P.W * r, (P.rim - P.top) * r, 0, Math.PI * 1.03, Math.PI * 1.97);
    line(b, rgba(ABYSS, 0.22), 1.6);
    b.beginPath();
    b.ellipse(0, P.rim + 1.3, P.W * r, (P.rim - P.top) * r, 0, Math.PI * 1.03, Math.PI * 1.97);
    line(b, rgba('#ffffff', 0.13), 1);
  }
  freckles(b, 30, 15, 0, P.rim - 12, P.W * 0.84, 12, [PALE, '#ffffff', c], 0.5, 1.15, 0.5);
  b.fillStyle = lin(b, 0, P.rim - 14, 0, P.rim + 5, [[0, rgba('#0a1450', 0)], [1, rgba('#0a1450', 0.5)]]); // the hollow of the bell, seen through the glass
  b.fillRect(-P.W - 2, P.rim - 14, P.W * 2 + 4, 22);
  b.beginPath(); // the fringe of the lip: a rosy band along the scallops
  b.moveTo(P.lip, P.rim - 2.2);
  scallops(b, P, -2.2);
  line(b, rgba('#d98ce8', 0.92), 4.4);
  b.beginPath();
  b.moveTo(P.lip, P.rim - 4.8);
  scallops(b, P, -4.8);
  line(b, rgba('#ffffff', 0.3), 0.8);
  dome(b, P); // rim light down the right-hand edge
  line(b, lin(b, -P.W, 0, P.W, 0, [[0, rgba(PALE, 0)], [0.5, rgba(PALE, 0)], [1, rgba(PALE, 0.85)]]), 4);
  b.restore();
  lantern(b, c);
  gloss(b, -P.W * 0.38, P.top + 8, P.W * 0.34, 4.6, 0.62, -0.42);
  gloss(b, P.W * 0.5, P.top + 14, 3, 1.4, 0.45, 0.7);
  for (let k = 0; k < LOBES; k++) { // a bead of light in every scallop
    const x = lobeX(P, k);
    bead(b, l, x, rimY(P, x) + 1.4, 1.7, k % 2 ? c : PALE, (k + f) % 2 ? 0.85 : 0.3);
  }
  bloom(l, 0, LANTERN_Y, 28, c, 0.26 + f * 0.08); // the lantern's glow
  spark(l, 0, LANTERN_Y, 3, PALE, 0.6);
  l.save();
  bell(l, P);
  l.clip();
  for (const cn of canals) { // the canals carry a faint light, inside the glass
    trace(l, cn);
    line(l, rgba(PALE, 0.15 + f * 0.05), 1.3);
  }
  l.restore();
}

export default { rate: 2, bob: 3, halo: 0.22, crack: '#bff4ff', grunt, diver, gunner, armored, carrier };
