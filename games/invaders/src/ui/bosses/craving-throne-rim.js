// The rim of the Craving's throne (World 17, Ash to Air; geometry craving-throne-geo.js, assembled by craving-hull.js): the ashtray's
// rolled lip, glazed ceramic gone grey (lighter and glossier than the smoke above it, so the bowl separates from the figure). The TOP
// FACE is the ring round the mouth, dark at the back and pale at the front where the sky lights it, a soft sheen lying along its left,
// its inner edge dark with a warm line along it (the coals in the bowl, on the lights layer); the LIP is the thick rolled front face
// under it, pale on top and rounding away to dark underneath, with a glossy specular streak running along its upper third; four
// cigarette RESTS are cut into it (a groove across the top face, a scoop out of the lip, a lit edge on the right of each, a snubbed
// butt lying in three of them). Soot and grain on everything, thumb-marks pressed into the roll. topFace(b, l, front): the ring's back
// half goes behind the smoke body, its front half and the lip in front of it. Boss coordinates. Bake-time only.
import { grain, line, lin, path, rgba, rng, streaks, ellipse, SOOT, ASH, COAL } from './craving-pkit.js';
import { RIM, MOUTH, LIP, rimFront, ringPath, along } from './craving-throne-geo.js';
import { cig } from './craving-pcig.js';
import { stub } from './craving-throne-bowl.js';


export function topFace(b, l, front) {
  const r = rng(81);
  b.save();
  b.beginPath();
  b.rect(-RIM.rx - 8, front ? RIM.cy : RIM.cy - RIM.ry - 4, RIM.rx * 2 + 16, front ? RIM.ry + 6 : RIM.ry + 4);
  b.clip();
  ringPath(b);
  b.fillStyle = lin(b, 0, RIM.cy - RIM.ry, 0, RIM.cy + RIM.ry, [[0, '#4a423c'], [0.45, '#6c6258'], [1, '#b0a494']]);
  b.fill();
  b.save();
  ringPath(b);
  b.clip();
  b.fillStyle = lin(b, -RIM.rx, 0, RIM.rx, 0, [[0, 'rgba(0,0,0,0.5)'], [0.2, 'rgba(0,0,0,0)'], [0.36, 'rgba(255,248,236,0.16)'], [0.6, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.5)']]);
  b.fillRect(-RIM.rx, RIM.cy - RIM.ry, RIM.rx * 2, RIM.ry * 2);
  grain(b, -RIM.rx, RIM.cy - RIM.ry, RIM.rx * 2, RIM.ry * 2, 1.2);
  streaks(b, r, -270, 270, RIM.cy - 20, RIM.cy + RIM.ry, 36, SOOT, 0.4, 0.8);
  b.restore();
  ringPath(b);
  line(b, SOOT, 2.2);
  b.beginPath();
  b.ellipse(MOUTH.cx, MOUTH.cy, MOUTH.rx, MOUTH.ry, 0, 0, Math.PI * 2);
  line(b, rgba(SOOT, 0.9), 3.2); // the mouth's dark inner edge
  b.beginPath();
  b.ellipse(RIM.cx, RIM.cy, RIM.rx - 2, RIM.ry - 2, 0, 0.1, Math.PI - 0.1);
  line(b, rgba(ASH[4], 0.5), 1.8); // the lit outer arc
  b.beginPath();
  b.ellipse(RIM.cx, RIM.cy, (RIM.rx + MOUTH.rx) / 2, (RIM.ry + MOUTH.ry) / 2, 0, Math.PI * 0.58, Math.PI * 0.88);
  line(b, 'rgba(255,248,236,0.28)', 5); // the sheen along the left
  b.beginPath();
  b.ellipse(RIM.cx, RIM.cy, (RIM.rx + MOUTH.rx) / 2, (RIM.ry + MOUTH.ry) / 2, 0, Math.PI * 0.62, Math.PI * 0.84);
  line(b, 'rgba(255,252,245,0.4)', 1.6);
  b.restore();
  if (front) { // the coals' warm line along the front of the mouth, on the lights
    l.save();
    const fade = (a) => lin(l, -170, 0, 170, 0, [[0, rgba(COAL[3], 0)], [0.3, rgba(COAL[3], a)], [0.7, rgba(COAL[3], a)], [1, rgba(COAL[3], 0)]]);
    l.beginPath();
    l.ellipse(MOUTH.cx, MOUTH.cy, MOUTH.rx - 1, MOUTH.ry - 1, 0, 0.1, Math.PI - 0.1);
    line(l, fade(0.16), 7);
    l.beginPath();
    l.ellipse(MOUTH.cx, MOUTH.cy, MOUTH.rx - 1, MOUTH.ry - 1, 0, 0.1, Math.PI - 0.1);
    line(l, fade(0.2), 1.4);
    l.restore();
  }
}

function scallops(b) { // the cast skirt of the lip: a row of rounded tabs hanging under it, as on a pressed-metal ashtray, scalloping the silhouette
  const N = 26;
  for (let k = 0; k < N; k++) {
    const [xa, xb] = [RIM.rx * Math.cos((k * Math.PI) / N), RIM.rx * Math.cos(((k + 1) * Math.PI) / N)];
    const [ya, yb] = [rimFront(xa) + LIP - 3, rimFront(xb) + LIP - 3];
    const depth = 3 + 7 * Math.sin(((k + 0.5) * Math.PI) / N); // shallower toward the ends, where the rim turns away
    b.beginPath();
    b.moveTo(xa, ya);
    b.bezierCurveTo(xa - (xa - xb) * 0.1, ya + depth * 1.35, xb + (xa - xb) * 0.1, yb + depth * 1.35, xb, yb);
    b.closePath();
    b.fillStyle = lin(b, 0, ya - 2, 0, ya + depth, [[0, '#8a7e72'], [0.5, '#5a5048'], [1, '#2e2722']]);
    b.fill();
    line(b, rgba(SOOT, 0.85), 1.4);
    path(b, [[xa - (xa - xb) * 0.2, ya + depth * 0.5], [(xa + xb) / 2, (ya + yb) / 2 + depth * 0.9]], true);
    line(b, 'rgba(240,232,220,0.25)', 1);
  }
}

export function lipFace(b) { // the rolled lip: its front face under the rim's outer edge
  const r = rng(82);
  b.beginPath();
  b.moveTo(-RIM.rx, rimFront(-RIM.rx));
  along(b, rimFront, -RIM.rx, RIM.rx);
  for (let x = RIM.rx; x >= -RIM.rx - 0.01; x -= 8) b.lineTo(x, rimFront(x) + LIP);
  b.closePath();
  b.fillStyle = lin(b, 0, 34, 0, 98, [[0, '#e2d8c8'], [0.2, '#b4a898'], [0.55, '#7c7064'], [1, '#3a322c']]); // a rolled cylinder: pale on top, rounding away to dark
  b.fill();
  b.save();
  b.clip();
  b.fillStyle = lin(b, -RIM.rx, 0, RIM.rx, 0, [[0, 'rgba(0,0,0,0.55)'], [0.28, 'rgba(0,0,0,0)'], [0.7, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)']]);
  b.fillRect(-RIM.rx, 34, RIM.rx * 2, 74);
  grain(b, -RIM.rx, 34, RIM.rx * 2, 74, 1);
  streaks(b, r, -270, 270, 40, 100, 30, SOOT, 0.4, 0.9);
  b.restore();
  for (let k = 1; k < 44; k++) { // thumb-marks pressed into the roll, closer together toward the ends
    const x = RIM.rx * Math.cos((k * Math.PI) / 44);
    const y = rimFront(x) + LIP * 0.52;
    path(b, [[x, y - 5], [x, y + 5]], true);
    line(b, rgba(SOOT, 0.4), 2.4);
    path(b, [[x + 1.8, y - 4], [x + 1.8, y + 4]], true);
    line(b, rgba('#ffffff', 0.14), 1.1);
  }
  const pts = [];
  for (let x = -RIM.rx; x <= RIM.rx; x += 10) pts.push([x, rimFront(x) + 3]);
  const fade = (a, w) => lin(b, -RIM.rx, 0, RIM.rx, 0, [[0, `rgba(255,250,240,${a * 0.2})`], [0.2, `rgba(255,250,240,${a * 0.75})`], [0.45, `rgba(255,250,240,${a})`], [0.8, `rgba(255,250,240,${a * 0.4})`], [1, `rgba(255,250,240,0)`]]);
  path(b, pts.map(([x, y]) => [x, y + 3]), true);
  line(b, fade(0.22, 0), 8); // the glossy specular streak along the upper third of the roll: a soft body and a hard core
  path(b, pts.map(([x, y]) => [x, y + 2.4]), true);
  line(b, fade(0.75, 0), 2.2);
  path(b, pts.map(([x, y]) => [x, y + LIP - 2]), true);
  line(b, rgba(SOOT, 0.85), 3);
  scallops(b);
}

const PHI = [26, 48].map((d) => (d * Math.PI) / 180); // where the rests lie round the ellipse, from the end (0) toward the front (90 degrees)
const onE = (E, phi, side) => [side * E.rx * Math.cos(phi), E.cy + E.ry * Math.sin(phi)];

// A cigarette rest: a groove across the ring along the radius (nearly level at the ends, since the ellipse is flat), a scoop out of
// the lip where it leaves the rim, and (when `cigarette`) a lit cigarette lying in it with its burning end hanging out over the edge.
function rest(b, l, phi, side, cigarette, seed) {
  const [I, O] = [onE(MOUTH, phi, side), onE(RIM, phi, side)];
  const len = Math.hypot(O[0] - I[0], O[1] - I[1]);
  const u = [(O[0] - I[0]) / len, (O[1] - I[1]) / len];
  const n = [-u[1], u[0]];
  const at = (p, k, w) => [p[0] + u[0] * k + n[0] * w, p[1] + u[1] * k + n[1] * w];
  const [a, c, d, e] = [at(I, -2, 8), at(O, 5, 11), at(O, 5, -11), at(I, -2, -8)];
  path(b, [a, c, d, e]);
  b.fillStyle = lin(b, I[0], I[1], O[0], O[1], [[0, '#2a231e'], [1, '#6a5f54']]);
  b.fill();
  line(b, rgba(SOOT, 0.7), 1.4);
  path(b, [a, c], true);
  line(b, rgba(SOOT, 0.9), 2); // the far wall of the groove is in shadow
  path(b, [e, d], true);
  line(b, 'rgba(240,232,220,0.45)', 1.2); // the near wall catches the light
  const [ox, oy] = [O[0] + u[0] * 4, O[1] + u[1] * 4];
  b.beginPath(); // the scoop in the lip
  b.moveTo(ox - 12, oy - 1);
  b.lineTo(ox - 10, oy + 9);
  b.quadraticCurveTo(ox, oy + 17, ox + 10, oy + 9);
  b.lineTo(ox + 12, oy - 1);
  b.closePath();
  b.fillStyle = lin(b, 0, oy, 0, oy + 16, [[0, '#2a231e'], [1, '#7a6f64']]);
  b.fill();
  line(b, rgba(SOOT, 0.8), 1.4);
  path(b, [[ox + 12, oy], [ox + 10, oy + 9], [ox + 3, oy + 14]], true);
  line(b, 'rgba(240,232,220,0.4)', 1.1);
  if (!cigarette) {
    stub(b, l, at(I, 6, 0)[0], at(I, 6, 0)[1] - 2, Math.atan2(u[1], u[0]), 16, rng(seed));
    return;
  }
  const F = at(I, -16, 0);
  for (const g of [b, l]) {
    g.save();
    g.translate(F[0], F[1]);
    g.rotate(Math.atan2(u[0], -u[1]));
  }
  cig(b, l, { L: len + 36, w: 11, kind: 'lit', seed, glow: 0.4 });
  b.restore();
  l.restore();
}

export const RESTS = PHI.flatMap((p) => [-1, 1].map((s) => Math.round(s * RIM.rx * Math.cos(p))));
export const rests = (b, l) => {
  PHI.forEach((p, k) => [-1, 1].forEach((s, j) => rest(b, l, p, s, k === 0, 500 + k * 7 + j * 3)));
};
