// The eyes of The Squall Ray (World 18, Anvil Sky; ray-hull.js paints them over the cloud): a manta's eyes sit on the flanks of its head, well apart, and so do
// these, small, where the wing's root leaves the torso behind the cheek: each a dark socket under a low brow of cloud, and in it a small eye of molten amber
// with a black slit of a pupil and a catchlight, and on the lights layer a ring of gold and a little bloom. They are the only warm thing on the ray and they sit
// far from the mouth and from the iron, so that the front of the ray does not read as a face (the anvil is the crown of its back, the wings' shoulders are
// plain plates, the heart and the mouth are the lit things). They are not parts (nothing hits them). The right eye is painted; the left is its mirror.
// Hull coordinates. Bake-time only.
import { PAL, bloom, lin, line, rad, rgba, ellipse } from './ray-kit.js';

const EYE = [98, 38]; // the right eye's centre

function socket(b) {
  b.save();
  b.translate(...EYE);
  b.rotate(0.3); // the outer corner low: it looks out and forward
  ellipse(b, 0, 0, 11.5, 6.6);
  b.fillStyle = rad(b, 0, 0, 1, 11.5, [[0, '#02040c'], [1, '#0c0f34']]);
  b.fill();
  ellipse(b, 0, 0, 7.4, 4.1);
  b.fillStyle = rad(b, -1.5, -0.8, 0, 7.4, [[0, '#fff0b0'], [0.4, '#ffc94a'], [0.8, '#c8741c'], [1, '#4a1c08']]);
  b.fill();
  b.beginPath(); // the slit pupil: a tall black lens
  b.moveTo(0, -4);
  b.quadraticCurveTo(1.7, 0, 0, 4);
  b.quadraticCurveTo(-1.7, 0, 0, -4);
  b.fillStyle = '#05060c';
  b.fill();
  ellipse(b, -3, -1.5, 1.2, 0.9);
  b.fillStyle = rgba('#ffffff', 0.9);
  b.fill();
  b.restore();
}

function brow(b) {
  b.save();
  b.translate(...EYE);
  b.rotate(0.3);
  b.beginPath();
  b.moveTo(-13, -1.5);
  b.quadraticCurveTo(-1, -12, 13, -4.5);
  b.quadraticCurveTo(0, -6, -13, -1.5);
  b.fillStyle = lin(b, 0, -11, 0, -1.5, [[0, '#4847a8'], [1, '#14123a']]);
  b.fill();
  b.beginPath();
  b.moveTo(-12, -2.2);
  b.quadraticCurveTo(-1, -11, 12, -5.2);
  line(b, rgba(PAL.ice, 0.6), 1);
  b.restore();
}

function glow(l) {
  l.save();
  l.translate(...EYE);
  l.rotate(0.3);
  bloom(l, 0, 0, 15, PAL.yellow, 0.32);
  bloom(l, 0, 0, 6, PAL.white, 0.4);
  ellipse(l, 0, 0, 8, 4.5);
  l.lineWidth = 1.1;
  l.strokeStyle = rgba(PAL.yellow, 0.5);
  l.stroke();
  l.restore();
}

export function eyes(b, l) {
  for (const s of [-1, 1]) {
    for (const g of [b, l]) {
      g.save();
      g.scale(s, 1);
    }
    socket(b);
    brow(b);
    glow(l);
    for (const g of [b, l]) g.restore();
  }
}
