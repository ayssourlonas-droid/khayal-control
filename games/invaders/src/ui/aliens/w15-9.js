// World 15, Lantern Deep, the sea turtle's shell and ropes (see w15-5.js): a domed carapace seen from a
// little above and in front, sea green gone dark at the edges, a honeycomb of scutes each with its growth
// rings, a ring of marginal scutes round the rim, barnacles and a gloss; and the two ropes that strap the
// chest down, running from under the chest over the shoulders of the shell and knotted at its rim.
// The head, flippers and tail are in w15-flip.js, the chest and the lantern on its pole in w15-chest.js.
import { path, ink, rad, rgba, shade, mix, bloom, line, ellipse, gloss, TAU, INK } from './w15-kit-2.js';
import { barnacles } from './w15-kit-2.js';
import { hash } from '../sprites.js';

const [SY, SRX, SRY] = [-4, 25, 23]; // the shell: centre y, half-width, half-height
const [IRX, IRY] = [20, 18.2]; // the inner ellipse the marginal scutes end at
const HEXES = [[-7, -15], [7, -15], [-14, -3], [0, -3], [14, -3], [-7, 9], [7, 9]]; // centres of the scutes
const ROPE = '#d6c49a';

// A pointy-topped hexagon path of radius r round (x, y), scaled by k.
const hex = (g, x, y, r, k = 1) => path(g, Array.from({ length: 6 }, (_, i) => [x + Math.cos(-Math.PI / 2 + (i * TAU) / 6) * r * k, y + Math.sin(-Math.PI / 2 + (i * TAU) / 6) * r * k]));

// The carapace: lit dome, scutes with growth rings, a ring of marginal scutes.
export function carapace(b, c, l) {
  const base = mix(c, '#12413f', 0.55);
  ellipse(b, 0, SY, SRX, SRY);
  ink(b, rad(b, 0, SY, 2, 31, [[0, shade(base, 0.5)], [0.5, base], [1, shade(base, -0.62)]], -8, -14), 3);
  b.save();
  ellipse(b, 0, SY, SRX - 0.5, SRY - 0.5);
  b.clip();
  b.save();
  ellipse(b, 0, SY, IRX, IRY);
  b.clip();
  HEXES.forEach(([x, y], i) => {
    const tone = shade(base, (hash(i + 40) - 0.5) * 0.34);
    hex(b, x, y, 8.2);
    b.fillStyle = rad(b, x, y, 1, 10, [[0, shade(tone, 0.32)], [0.6, tone], [1, shade(tone, -0.5)]], x - 2.4, y - 3);
    b.fill();
    line(b, rgba('#05180f', 0.95), 1.6);
    for (const [k, a] of [[0.68, 0.55], [0.4, 0.4]]) { // the growth rings
      hex(b, x, y, 8.2, k);
      line(b, rgba(shade(base, 0.55), a), 0.8);
    }
  });
  b.restore();
  for (let k = 0; k < 24; k++) { // the marginal scutes: a seam between each
    const a = (k * TAU) / 24;
    const [ca, sa] = [Math.cos(a), Math.sin(a)];
    path(b, [[ca * IRX, SY + sa * IRY], [ca * (SRX + 1), SY + sa * (SRY + 1)]], true);
    line(b, rgba('#07201e', 0.7), 1.1);
    const a2 = a + TAU / 48;
    path(b, [[Math.cos(a2) * IRX, SY + Math.sin(a2) * IRY], [Math.cos(a2) * (SRX + 1), SY + Math.sin(a2) * (SRY + 1)]], true);
    line(b, rgba(shade(base, 0.5), k % 2 ? 0.16 : 0.08), 3.4);
  }
  b.beginPath();
  b.ellipse(0, SY, IRX, IRY, 0, 0, TAU);
  line(b, rgba('#07201e', 0.85), 1.4);
  b.fillStyle = rad(b, 0, SY + 6, 12, 30, [[0, rgba('#000000', 0)], [1, rgba('#02120e', 0.5)]]); // the dome falls away at its edges
  b.fillRect(-27, SY - 25, 54, 50);
  b.restore();
  gloss(b, -12, -18, 7, 2.6, 0.32, -0.55);
  for (const [x, y] of HEXES) bloom(l, x, y, 3.4, '#7affd8', 0.22); // a faint lamp at the heart of each scute
  barnacles(b, -18, 6, 1.5, 3, 31, 2.4);
  barnacles(b, 17.4, 9, 1.4, 2, 32, 2);
}

// A rope from (x0, y0) to (x1, y1) bowed by `sag`: twisted tan cord outlined in ink, with a mark of the lay.
function cord(b, x0, y0, x1, y1, sag) {
  const [mx, my] = [(x0 + x1) / 2 + sag, (y0 + y1) / 2];
  b.beginPath();
  b.moveTo(x0, y0);
  b.quadraticCurveTo(mx, my, x1, y1);
  line(b, INK, 3.6);
  line(b, ROPE, 2.2);
  for (let i = 1; i < 9; i++) { // the twist
    const t = i / 9;
    const [x, y] = [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1];
    path(b, [[x - 0.9, y - 0.5], [x + 0.9, y + 0.7]], true);
    line(b, rgba('#6a5636', 0.7), 0.8);
  }
}

// The rope each side of the chest, over the shoulder of the shell to a knot at the rim.
export function ropes(b) {
  for (const m of [-1, 1]) {
    cord(b, m * 10, -2, m * 20.6, 9, m * 2.4);
    ellipse(b, m * 20.6, 9.6, 2.5, 2.1);
    ink(b, ROPE, 1.2);
    path(b, [[m * 20.4, 9.6], [m * 21.6, 9.6]], true);
    line(b, rgba('#6a5636', 0.8), 0.8);
  }
}
