// Rings of glass (World 16, Glass Cathedral; the Vesper Moth, moth.js): the one idea behind the rose window of the
// thorax (moth-heart.js), the eyespots of the hindwings (moth-spot.js) and the round medallion on each forewing. A
// band is a ring cut into segments, each a pane of jewel glass between lead spokes; a window is bands one inside the
// other round a bright hub. Everything is drawn about (0, 0) in the current transform, so a scale makes it an ellipse.
// Bake-time only.
import { rad, rgba, shade } from './kit.js';
import { came, pane, solder, circle, rng, LEAD, TAU } from './moth-kit.js';

// A ring from r0 to r1 in n panes alternating `cols`, the first at angle `rot`; the lead round it and between its panes.
export function band(g, r0, r1, n, cols, seed, lum = 0.6, rot = 0) {
  const da = TAU / n;
  const rm = (r0 + r1) / 2;
  for (let k = 0; k < n; k++) {
    const [a0, a1] = [rot + k * da, rot + (k + 1) * da];
    const am = (a0 + a1) / 2;
    const build = () => {
      g.beginPath();
      g.arc(0, 0, r1, a0, a1);
      g.arc(0, 0, r0, a1, a0, true);
      g.closePath();
    };
    pane(g, build, cols[k % cols.length], [Math.cos(am) * rm, Math.sin(am) * rm, Math.hypot(r1 - r0, rm * da) * 0.6], seed + k, lum, am + Math.PI / 2);
  }
  came(g, () => {
    g.beginPath();
    for (let k = 0; k < n; k++) {
      const a = rot + k * da;
      g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    }
  }, 2.2, 0.35);
  for (const r of [r0, r1]) came(g, () => { circle(g, 0, 0, r); }, r === r1 ? 2.8 : 2.4, 0.4);
}

// A round window: bands from the outside in, `rings` = [[r0, r1, n, [colours]], ...], then the hub: a lens of hot glass
// r wide, white at its heart, in a lead ring, with a glint.
export function roundel(g, rings, hub, seed, lum = 0.6) {
  rings.forEach(([r0, r1, n, cols], i) => band(g, r0, r1, n, cols, seed + i * 31, lum, (i * TAU) / (n * 2)));
  const [r, hot, mid] = hub;
  circle(g, 0, 0, r + 1.6);
  g.fillStyle = LEAD;
  g.fill();
  circle(g, 0, 0, r);
  g.fillStyle = rad(g, 0, 0, 0, r, [[0, '#ffffff'], [0.4, hot], [0.8, mid], [1, shade(mid, -0.45)]], -r * 0.2, -r * 0.25);
  g.fill();
  circle(g, -r * 0.3, -r * 0.34, r * 0.24);
  g.fillStyle = rgba('#ffffff', 0.85);
  g.fill();
  came(g, () => { circle(g, 0, 0, r + 1.6); }, 1.8, 0.4);
  const q = rng(seed + 5);
  for (let k = 0; k < 6; k++) { // seeds of light in the hub
    const a = q() * TAU;
    circle(g, Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, 0.7);
    g.fillStyle = rgba('#ffffff', 0.55);
    g.fill();
  }
}

// n solder beads on a ring of radius r.
export function beads(g, n, r, rot = 0, s = 1.7) {
  for (let k = 0; k < n; k++) solder(g, Math.cos(rot + (k * TAU) / n) * r, Math.sin(rot + (k * TAU) / n) * r, s);
}
