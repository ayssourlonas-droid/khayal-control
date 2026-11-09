// World 9, Tidal Siege: the beast's brood, risen out of the harbour with it. Wet, hard-shelled and
// glowing where the deep has marked them in its own cyan (lights): a crab with snapping claws, a
// manta ray beating its wings, an anglerfish swinging its lure, a turtle-crab under barnacled plate,
// a jellyfish pulsing violet (the last two in w9-2.js). Sprites face down, toward the ship.
import { path, sym, ink, lin, rgba, shade, eye, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { MARK, limb, hide, armored, carrier } from './w9-2.js';

// A crab: a broad shell on stepping legs, two eye stalks, a snapping claw on each arm.
function grunt(b, l, f, c) {
  const dark = shade(c, -0.4);
  both((s) => {
    for (let i = 0; i < 3; i++) {
      const up = (i + f) % 2 ? 5 : 0;
      limb(b, [[s * 11, 7 + i * 3], [s * (22 + i * 2), 8 + i * 6 - up], [s * (26 + i * 3), 18 + i * 6 - up]], dark, 3);
    }
    const [px, py] = [s * 25, -8 - f * 3];
    limb(b, [[s * 15, -1], [px, py]], dark, 5);
    b.save(); // the claw: two fat jaws on one pivot, wider apart on frame 1
    b.translate(px, py);
    b.scale(s, 1);
    for (const d of [-1, 1]) {
      b.rotate(-0.75 + d * (f ? 0.4 : 0.1));
      ellipse(b, 8, 0, 10.5, 4.6);
      ink(b, shade(c, 0.1), 2.4);
      b.rotate(0.75 - d * (f ? 0.4 : 0.1));
    }
    b.restore();
  });
  ellipse(b, 0, 3, 21, 13);
  ink(b, hide(b, c, -10, 16), 3);
  for (const x of [-9, 0, 9]) {
    b.beginPath();
    b.ellipse(x, 4, 5, 8, 0, Math.PI * 1.1, Math.PI * 1.9);
    line(b, rgba('#000000', 0.35), 1.4);
  }
  gloss(b, -8, -3, 9, 3, 0.5, -0.2);
  both((s) => {
    limb(b, [[s * 6, -7], [s * 8, -16]], dark, 2.4);
    ellipse(b, s * 8, -17, 3.6, 3.6);
    ink(b, '#e8f4f0', 1.6);
    eye(l, s * 8, -17, 1.8, MARK, 3.2);
  });
}

// A manta ray: a wide diamond of wing beating up and down, a tail trailing behind, two fins by
// the mouth and a pale underside edge.
function diver(b, l, f, c) {
  const tip = f ? -9 : 7; // the wing tips' height: up, then down
  limb(b, [[0, -16], [f ? 5 : -5, -30], [f ? -3 : 3, -44]], shade(c, -0.5), 3);
  path(b, sym([[0, 24], [8, 20], [26, 8 + tip * 0.4], [42, tip], [24, -6 + tip * 0.3], [10, -16], [0, -18]]));
  ink(b, lin(b, 0, -18, 0, 24, [[0, shade(c, -0.5)], [0.5, c], [1, shade(c, 0.35)]]), 3);
  for (const k of [0.4, 0.7]) { // ribs of the wing
    b.beginPath();
    b.moveTo(0, 6);
    b.quadraticCurveTo(22 * k + 6, 6 + tip * k * 0.6, 42 * k + 6, tip * k * 0.9);
    b.moveTo(0, 6);
    b.quadraticCurveTo(-22 * k - 6, 6 + tip * k * 0.6, -42 * k - 6, tip * k * 0.9);
    line(b, rgba('#000000', 0.3), 1.4);
  }
  both((s) => {
    path(b, [[s * 4, 20], [s * 9, 30], [s * 11, 19]]);
    ink(b, shade(c, -0.3), 2);
    ellipse(b, s * 8, 12, 2.6, 2.6);
    ink(b, '#06121a', 1.4);
    eye(l, s * 8, 12, 1.5, MARK, 3);
  });
  for (const [x, y] of [[-14, 0], [-6, -6], [13, -2], [6, 4], [0, -10]]) { // pale spots on its back
    ellipse(b, x, y, 2, 1.4);
    b.fillStyle = rgba('#e8f4ff', 0.55);
    b.fill();
  }
  bloom(l, 0, 6, 22, MARK, 0.12);
}

// An anglerfish: a round dark body, a mouth full of needles, a stalk arching over its brow with a
// bright bulb that swings side to side, small fins that flutter.
function gunner(b, l, f, c) {
  const sw = f ? 11 : -11;
  both((s) => {
    path(b, [[s * 16, 2], [s * 31, 4 + (f ? -5 : 4)], [s * 20, 12]]);
    ink(b, shade(c, -0.25), 2.2);
  });
  b.beginPath();
  b.moveTo(0, -16);
  b.quadraticCurveTo(sw * 0.4, -38, sw, -33);
  line(b, INK, 4.6);
  b.beginPath();
  b.moveTo(0, -16);
  b.quadraticCurveTo(sw * 0.4, -38, sw, -33);
  line(b, shade(c, 0.1), 2);
  ellipse(b, 0, 2, 21, 19);
  ink(b, hide(b, c, -17, 21), 3);
  b.save();
  ellipse(b, 0, 2, 21, 19);
  b.clip();
  gloss(b, -9, -9, 10, 4, 0.4, -0.5);
  b.restore();
  b.beginPath(); // the mouth, wide at the bottom, teeth hanging in it
  b.ellipse(0, 11, 15, 8, 0, 0, Math.PI);
  b.closePath();
  ink(b, '#14070e', 2);
  b.fillStyle = '#e8f0f0';
  for (let i = -3; i <= 3; i++) {
    path(b, [[i * 4.2 - 1.6, 11.5], [i * 4.2, 11.5 + (i % 2 ? 6 : 4.5) - Math.abs(i) * 0.6], [i * 4.2 + 1.6, 11.5]]);
    b.fill();
  }
  both((s) => {
    ellipse(b, s * 9, -3, 4.2, 4.2);
    ink(b, '#14070e', 1.6);
    eye(l, s * 9, -3, 2, '#ffe27a', 3);
  });
  bloom(l, sw, -33, 22, MARK, 0.65);
  eye(l, sw, -33, 3.6, MARK, 3);
  for (let i = 0; i < 3; i++) eye(l, -10 + i * 10, 17 - (i % 2) * 0.5, 0.8, '#ffffff', 2); // the teeth catching the lure
}

export default { rate: 2, bob: 2, halo: 0.2, crack: MARK, grunt, diver, gunner, armored, carrier };
