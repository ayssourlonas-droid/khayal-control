// The Vesper Moth's forewing (World 16, Glass Cathedral; see moth.js): a part (armour) painted once as the LEFT wing and
// mirrored for the right, and the same painting at every pose of the slow wingbeat (moth-frames.js bakes them). The
// wing is a fan of 20 lancet panes in lead (the geometry is moth-wing-geo.js): jewel glass, brightest at the middle of
// each pane and dark at the lead, with the flow of the glass, seeds, a diaper of fine lines in some and a fine mullion
// down the middle of each (the moth's veins); a row of carved stone panes at the root; a gilt knuckle set with an amber
// jewel; a medallion of rings of glass at a node of the cames (the moth's orbicular spot); a fringe of glass scales
// along the pointed-arch margin and a pale rim light on the edge the dawn catches. `pose` 0..1 is the beat: the wing
// swells (a growing scale about its base) and tips up, its glass brightens, a broad sheen slides out along it and a
// wave of light runs out through the rows of panes, so every pose is the whole wing re-painted, crisp. Pose 0 is the
// wing at rest, which the part keeps (and the hull, the poster and the collapse show). The lights carry a soft bloom in
// each pane's colour and the rim.
import { line, rad, rgba, shade, bloom } from './kit.js';
import { came, pane, solder, circle, rng, LEAD, STONE, STONE_M, STONE_L, ROSE, COBALT, AMBER, VIOLET, GOLD, WEAK } from './moth-kit.js';
import { HUB, NV, ROWS, RING, MARGIN, ARCHES, cellPath, cellMid, outline, veinPath, chain } from './moth-wing-geo.js';
import { tuft, shard } from './moth-fur.js';
import { roundel, beads } from './moth-rose.js';

export const TILT = 0.015; // rad the tip rises at the top of the beat (more would lift the lower edge out of the static wing's outline)
export const GROW = [0.1, 0.1]; // how much the wing swells across and up at the top of the beat
const SCHEME = [ // the glass of each pane: row by sector, the dawn's amber and rose at the root, violet, then the cobalt of the night at the margin
  [AMBER, ROSE, AMBER, ROSE, AMBER],
  [ROSE, VIOLET, ROSE, VIOLET, ROSE],
  [VIOLET, COBALT, VIOLET, COBALT, VIOLET],
  [COBALT, VIOLET, COBALT, ROSE, COBALT],
];
const JEWELS = [ROSE, COBALT, AMBER, VIOLET, GOLD];
const lastRing = ROWS + 1;

function fringe(b) {
  const r = rng(11);
  for (let i = 0; i < NV; i++) { // a scale at each cusp, leaning out along the margin's normal
    const [a, c] = [ARCHES[lastRing][Math.max(0, i - 1)].n, ARCHES[lastRing][Math.min(NV - 2, i)].n];
    b.save();
    b.translate(...MARGIN[i]);
    b.rotate(Math.atan2(a[1] + c[1], a[0] + c[0]) + (r() - 0.5) * 0.3);
    b.translate(-3, 0);
    shard(b, i === 0 ? 20 : 13 + r() * 5, i === 0 ? 8 : 6.5, JEWELS[(i + 1) % 5]);
    b.restore();
  }
  ARCHES[lastRing].forEach((a, i) => { // and a small one at each arch's point
    b.save();
    b.translate(...a.apex);
    b.rotate(Math.atan2(a.n[1], a.n[0]) + (r() - 0.5) * 0.3);
    b.translate(-3, 0);
    shard(b, 9 + r() * 4, 4.6, JEWELS[(i + 3) % 5]);
    b.restore();
  });
}

// The root: a row of carved stone lancets under the glass, each with a gilt stud at its heart.
function plate(b) {
  for (let i = 0; i < NV - 1; i++) {
    const m = cellMid(i, 0);
    pane(b, () => cellPath(b, i, 0), i % 2 ? STONE_L : '#6a4c9c', m, 300 + i * 9, 0.1);
    circle(b, m[0] + 3, m[1], 3.2);
    b.fillStyle = LEAD;
    b.fill();
    circle(b, m[0] + 3, m[1], 2.4);
    b.fillStyle = rad(b, m[0] + 3, m[1], 0, 2.4, [[0, '#fff0c0'], [1, '#b8883a']], m[0] + 2.2, m[1] - 0.8);
    b.fill();
  }
}

function glass(b, pose) {
  const s = 0.15 + 0.7 * pose;
  const stop = (v) => Math.min(1, Math.max(0, v));
  const sheen = [128, 20, -130, -10, [[stop(s - 0.2), 'rgba(255,240,230,0)'], [s, `rgba(255,244,228,${0.1 + 0.28 * pose})`], [stop(s + 0.2), 'rgba(255,240,230,0)']]];
  for (let r = 1; r <= ROWS; r++) {
    for (let i = 0; i < NV - 1; i++) {
      const m = cellMid(i, r);
      const dir = Math.atan2(RING[r + 1][i][1] - RING[r][i][1], RING[r + 1][i][0] - RING[r][i][0]);
      pane(b, () => cellPath(b, i, r), SCHEME[r - 1][i], m, 100 + r * 17 + i * 5, 0.3 + 0.6 * pose, dir, sheen);
      b.beginPath(); // the mullion: a fine line down the pane from the notch to the point
      b.moveTo(...ARCHES[r][i].apex);
      b.lineTo(...ARCHES[r + 1][i].apex);
      line(b, rgba(LEAD, 0.5), 1.2);
      b.beginPath();
      b.moveTo(ARCHES[r][i].apex[0] + 0.9, ARCHES[r][i].apex[1] - 0.6);
      b.lineTo(ARCHES[r + 1][i].apex[0] + 0.9, ARCHES[r + 1][i].apex[1] - 0.6);
      line(b, rgba('#ffffff', 0.16), 0.7);
    }
  }
}

function lead(b) {
  const ring = (k, w) => came(b, () => { b.beginPath(); chain(b, k); }, w, 0.45);
  for (let k = 2; k <= ROWS; k++) ring(k, 2.8);
  ring(1, 3.8);
  for (let i = 0; i < NV; i++) came(b, () => { b.beginPath(); veinPath(b, i, 0, 1); }, i === 0 || i === NV - 1 ? 4.4 : 3.4, 0.5);
  came(b, () => outline(b), 4.4, 0.6);
  for (let k = 1; k <= ROWS; k++) for (let i = 1; i < NV - 1; i++) solder(b, ...RING[k][i], 2.1);
}

// The medallion at the node where the third ring crosses the third vein.
function medallion(b, pose) {
  const [x, y] = RING[3][2];
  b.save();
  b.translate(x, y);
  circle(b, 0, 0, 17.5);
  b.fillStyle = LEAD;
  b.fill();
  roundel(b, [[11, 15.5, 14, [VIOLET, ROSE]], [6.5, 11, 10, [AMBER, GOLD]]], [6.5, WEAK, AMBER], 400, 0.5 + 0.5 * pose);
  came(b, () => circle(b, 0, 0, 16.4), 2.4, 0.6);
  beads(b, 10, 18.4, 0.2, 1.3);
  b.restore();
}

// The knuckle at the root: a gilt-ringed stone boss set with an amber jewel over the base of the wing.
function knuckle(b, l, pose) {
  const [x, y] = [137, 18];
  circle(b, x, y + 1.2, 25);
  b.fillStyle = rgba('#000000', 0.4);
  b.fill();
  circle(b, x, y, 25);
  b.fillStyle = LEAD;
  b.fill();
  circle(b, x, y, 23.2);
  b.fillStyle = rad(b, x, y, 6, 25, [[0, STONE_L], [0.55, STONE_M], [1, STONE]], x - 8, y - 10);
  b.fill();
  circle(b, x, y, 19);
  line(b, rgba('#e8c878', 0.85), 2.2);
  circle(b, x, y, 15);
  b.fillStyle = LEAD;
  b.fill();
  circle(b, x, y, 13);
  b.fillStyle = rad(b, x, y, 0, 13, [[0, shade(AMBER, 0.75)], [0.5, AMBER], [1, shade(AMBER, -0.55)]], x - 3.5, y - 4);
  b.fill();
  circle(b, x - 3.6, y - 4.2, 3.1);
  b.fillStyle = rgba('#ffffff', 0.85);
  b.fill();
  beads(b, 8, 21.4, 0.4, 1.5);
  bloom(l, x, y, 42, AMBER, 0.34 + 0.2 * pose);
  const r = rng(77);
  for (let i = 0; i < 6; i++) tuft(b, 170 + r() * 4, 2 + i * 7 + (r() - 0.5) * 3, Math.PI + (r() - 0.5) * 0.4, 22 + r() * 5, 12, 0.55, i % 2 ? STONE_M : STONE, (i - 2.5) * 0.6); // the thorax's fur over its inner edge
}

function rimPath(g) {
  g.beginPath();
  veinPath(g, 0);
  for (let i = 0; i < 2; i++) {
    const a = ARCHES[lastRing][i];
    g.quadraticCurveTo(...a.c1, ...a.apex);
    g.quadraticCurveTo(...a.c2, ...a.q);
  }
}

// The wave of light that runs out through the rows as the wing rises: how much row r glows at beat pose `pose`.
export const wave = (r, pose) => Math.max(0, 1 - Math.abs((r - 1) / (ROWS - 1) - pose) * 3);

function lights(l, pose) {
  for (let r = 1; r <= ROWS; r++) {
    for (let i = 0; i < NV - 1; i++) {
      const [x, y, rr] = cellMid(i, r);
      bloom(l, x, y, Math.min(rr * 1.7, y + 94), SCHEME[r - 1][i], 0.16 + 0.14 * pose + 0.26 * wave(r, pose)); // none reaches above the frame's top, y -94: -152 from the boss's centre
    }
  }
  rimPath(l);
  line(l, rgba('#ff9ad0', 0.2), 6);
  line(l, rgba('#ffd2ec', 0.3), 2.4);
}

// The whole forewing at beat pose `pose`, onto the body b and the lights l (both in the part's own coordinates).
export function paintWing(b, l, pose = 0) {
  for (const g of [b, l]) {
    g.save();
    g.translate(HUB[0], HUB[1]);
    g.rotate(TILT * pose);
    g.scale(1 + GROW[0] * pose, 1 + GROW[1] * pose);
    g.translate(-HUB[0], -HUB[1]);
  }
  fringe(b);
  outline(b);
  b.fillStyle = LEAD;
  b.fill();
  plate(b);
  glass(b, pose);
  lead(b);
  medallion(b, pose);
  rimPath(b);
  line(b, rgba('#ffd2ec', 0.85), 1.3);
  knuckle(b, l, pose);
  lights(l, pose);
  b.restore();
  l.restore();
}

export const wing = (b, l) => paintWing(b, l, 0);
