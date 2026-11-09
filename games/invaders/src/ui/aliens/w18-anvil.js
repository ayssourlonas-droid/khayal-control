// World 18, Anvil Sky, the armoured role (see w18.js): THE ANVIL-PLATED HULK, the world's namesake, a heavy riveted iron anvil
// hovering on two jets. Flat steel face, a long horn to the left, a blocky heel to the right, a waisted body and a wide
// base, in weathered blue-grey iron with a bright edge on every upper-left bevel; bolted plates and straps; a face-plate
// on the waist with two angry slits that burn forge-orange, vents in the base that leak the same heat, and a horn tip
// still glowing from the fire. Its damage (cracks.js) splits across the plate. Lights: the eyes, the vents, the horn tip,
// the jets. The jets, the heat and the eyes flicker with the beat.
import { path, ink, lin, rgba, shade, bloom, line, bez, INK, IRON, IRON_D, STEEL, FORGE, rivets, scuff, glare, metal } from './w18-kit.js';
import { jets, faceplate, base } from './w18-anvil-parts.js';

// The anvil's outline, clockwise from the top left of its face.
const OUTLINE = [
  [-20, -29], [27, -29], [32, -28], [32, -17],
  ...bez([32, -17], [26, -14], [16, -12], [13, -7], 6).slice(1),
  [12, 9], [14, 13], [18, 17], [29, 18], [29, 29], [-29, 29], [-29, 18], [-18, 17], [-14, 13], [-12, 9], [-12, -6],
  ...bez([-12, -6], [-22, -9], [-34, -13], [-45, -22], 8).slice(1),
  ...bez([-45, -22], [-38, -26], [-30, -28.6], [-20, -29], 6).slice(1),
];

function trace(g) {
  path(g, OUTLINE);
}

function body(b, c) {
  trace(b);
  b.fillStyle = lin(b, -30, -30, 30, 30, [[0, shade(IRON, 0.35)], [0.45, IRON], [1, IRON_D]]);
  b.fill();
  b.save();
  trace(b);
  b.clip();
  b.fillStyle = lin(b, 0, -30, 0, -21, [[0, rgba(STEEL, 0.95)], [1, rgba(STEEL, 0)]]); // the face catches the sky
  b.fillRect(-46, -30, 80, 10);
  b.fillStyle = lin(b, 0, 18, 0, 30, [[0, rgba('#000000', 0)], [1, rgba('#000000', 0.5)]]); // the base sits in its own shadow
  b.fillRect(-30, 18, 60, 12);
  b.beginPath(); // the horn: a bright edge along its top, dark under it
  b.moveTo(-20, -28.4);
  b.bezierCurveTo(-30, -28, -38, -26, -44.4, -22.4);
  line(b, rgba('#ffffff', 0.6), 1.2);
  b.beginPath();
  b.moveTo(-12.4, -6);
  b.bezierCurveTo(-24, -9.4, -34, -13.6, -44, -21.6);
  line(b, rgba('#000000', 0.5), 1.8);
  for (const [x0, y0, x1, y1] of [[-8, -29, -8, -24], [3, -29, 3, -24], [18, -29, 18, -24], [24, -29, 24, -17]]) { // joints in the plate of the face
    b.beginPath();
    b.moveTo(x0, y0);
    b.lineTo(x1, y1);
    line(b, rgba('#05060c', 0.55), 1);
  }
  scuff(b, 26, 11, 0, -4, 30, 24, 0.22);
  b.restore();
  trace(b);
  line(b, INK, 3.2);
  b.beginPath(); // the bright bevel of the whole top edge
  b.moveTo(-19.6, -28.2);
  b.lineTo(26.4, -28.2);
  line(b, rgba('#ffffff', 0.7), 1);
  rivets(b, -4, -26, 22, -26, 5, 1, STEEL);
}

// The bolted straps round the waist, and the plates on the heel and the horn's root.
function straps(b) {
  for (const x of [-13.4, 13.4]) {
    b.beginPath();
    b.rect(x - 2.6, -9, 5.2, 21);
    ink(b, metal(b, x - 3, -9, x + 3, 12, IRON_D), 1.8);
    rivets(b, x, -6, x, 9, 3, 1, STEEL);
  }
  b.beginPath();
  b.moveTo(18, -26);
  b.lineTo(30, -26);
  b.lineTo(30, -19);
  b.lineTo(18, -19);
  b.closePath();
  ink(b, metal(b, 18, -26, 30, -19, IRON), 1.8);
  rivets(b, 20.4, -22.5, 27.6, -22.5, 2, 1, STEEL);
}

export function armored(b, l, f, c) {
  b.translate(3, -2);
  l.translate(3, -2);
  jets(b, l, f);
  body(b, c);
  base(b, l, f);
  straps(b);
  faceplate(b, l, f);
  glare(l, -43.6, -22.4, f ? 1.4 : 2, FORGE, 0.7); // the horn's tip, still hot from the fire
  bloom(l, -38, -23.4, 11, FORGE, f ? 0.2 : 0.32);
}
