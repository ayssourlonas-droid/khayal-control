// The Grand Grimoire's crown (World 12, Starlit Archive; see grimoire.js): the gilded headband at the top
// of the spine, a bar of gold arched over the spread and set with amber, a fleuron rising at the
// centre and a lower one either side, pendants and pearls along its lower edge, filigree scrolled
// between the jewels. 260 x 40 for the hit box, the fleurons rising to just under its top edge (y -158 in
// boss coordinates: the HUD ends at 96 and the boss rests at 260).
import { path, ink, line, lin, rad, rgba, shade, neon, bloom, eye, both, ellipse } from './kit.js';
import { GOLD, GILT, GOLD_D, AMBER, gilt, metal, curl } from './grimoire-kit.js';

export const GEMS = [[-96, 9], [-50, 6], [0, 5], [50, 6], [96, 9]]; // the amber jewels along the band, the middle one largest
export const FLEURS = [[0, 19], [-46, 16], [46, 16], [-88, 11], [88, 11], [-122, 7], [122, 7]]; // x and height of each fleuron
export const arch = (x) => 11 - (x / 130) ** 2 * 7; // the band's top edge: higher at the centre, lower at the ends

// A fleur-de-lis of gold, its foot at (x, y), `h` tall.
function fleur(b, x, y, h) {
  const w = h * 0.62;
  path(b, [[x, y - h], [x + w * 0.26, y - h * 0.62], [x + w * 0.16, y - h * 0.3], [x, y], [x - w * 0.16, y - h * 0.3], [x - w * 0.26, y - h * 0.62]]);
  ink(b, lin(b, x, y - h, x, y, [[0, GILT], [1, GOLD_D]]), 1.5);
  both((s) => { // the two outer petals curling out and down
    b.beginPath();
    b.moveTo(x, y - h * 0.34);
    b.bezierCurveTo(x + s * w * 0.9, y - h * 0.6, x + s * w * 0.9, y - h * 0.9, x + s * w * 0.4, y - h * 0.92);
    b.bezierCurveTo(x + s * w * 0.6, y - h * 0.7, x + s * w * 0.3, y - h * 0.5, x, y - h * 0.18);
    ink(b, lin(b, x, y - h, x, y, [[0, GILT], [1, GOLD]]), 1.3);
  });
}

// An amber jewel in a gold bezel, r wide: the facets cut across it, a spark in the corner.
function jewel(b, l, x, y, r) {
  ellipse(b, x, y, r + 2.2, r * 0.8 + 2.2);
  ink(b, metal(b, y - r, y + r), 1.6);
  ellipse(b, x, y, r, r * 0.8);
  ink(b, rad(b, x, y, 0, r, [[0, '#fff0b0'], [0.45, AMBER], [1, '#7a3a06']], x - r * 0.3, y - r * 0.3), 1.2);
  path(b, [[x - r * 0.5, y], [x, y - r * 0.5], [x + r * 0.5, y], [x, y + r * 0.5]]);
  line(b, rgba('#ffffff', 0.35), 0.8);
  ellipse(l, x, y, r, r * 0.8);
  l.fillStyle = rad(l, x, y, 0, r, [[0, rgba('#fff6d0', 0.8)], [0.5, rgba(AMBER, 0.55)], [1, rgba(AMBER, 0.15)]]);
  l.fill();
  bloom(l, x, y, r * 3, AMBER, 0.3);
}

export function crown(b, l) {
  b.beginPath(); // the band
  b.moveTo(-128, 20);
  for (let x = -128; x <= 128; x += 8) b.lineTo(x, arch(x) - 9 + 8);
  for (let x = 128; x >= -128; x -= 8) b.lineTo(x, arch(x) + 11);
  b.closePath();
  ink(b, metal(b, -6, 20, GOLD), 3);
  b.beginPath();
  for (let x = -122; x <= 122; x += 8) b.lineTo(x, arch(x) - 5);
  gilt(b, 1.2, 0.9);
  for (let x = -120; x <= 120; x += 12) { // pendants and pearls hung along the lower edge
    const y = arch(x) + 11;
    path(b, [[x - 4, y - 1], [x + 4, y - 1], [x, y + 7 - Math.abs(x) * 0.018]]);
    ink(b, shade(GOLD, -0.1), 1.2);
    ellipse(b, x, y + 8.5 - Math.abs(x) * 0.018, 1.8, 1.8);
    b.fillStyle = '#fff6e0';
    b.fill();
  }
  for (const [x, y] of GEMS.slice(0, 2).concat(GEMS.slice(3))) { // filigree scrolls between the jewels
    both((s) => {
      b.beginPath();
      curl(b, x + s * 16, y + 2, 5.4, s, 1.5);
      line(b, rgba(GOLD_D, 0.9), 2.2);
      line(b, rgba(GILT, 0.9), 1);
    });
  }
  for (const [x, h] of FLEURS) fleur(b, x, arch(x) - 8, h);
  GEMS.forEach(([x, y], i) => jewel(b, l, x, y, i === 2 ? 7.5 : 4.6));
  l.beginPath(); // the band's upper rim, thin in light
  for (let x = -126; x <= 126; x += 8) l.lineTo(x, arch(x) - 8);
  neon(l, GILT, 0.9, 0.3);
  eye(l, 0, arch(0) - 24, 1.7, '#fff0c0', 4);
  for (const x of [-46, 46]) eye(l, x, arch(x) - 19, 1.4, '#fff0c0', 3.4);
}
