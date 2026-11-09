// The Crimson Count's face and heart (World 10, Hollow Night; the cape is in count-cape.js, the hands
// in count-claw.js, the body, the phases and the bat swarm in count.js): the pale face with burning red
// eyes, and the heart-amulet. Colours come from the look's boss palette (S.pal).
import { path, ink, lin, rad, line, eye, bloom, gloss, neon, rgba, shade, ellipse, both, TAU } from './kit.js';

export const PALE = '#ddd5e6'; // his skin and cuffs
export const BRASS = '#c8a24a';
export const EYE = '#ff2a45';
const INK_HAIR = '#05020a';

// The head, seen front on: slicked black hair to a widow's peak, a long pale face with hollow cheeks,
// sunken sockets with red eyes, a thin nose, a sneer over two fangs, pointed ears.
function head(b, l, p, S) {
  for (const g of [b, l]) g.scale(1.1, 1.1);
  both((s) => { // ears, pointed, the hollow of each in shadow
    path(b, [[s * 31, -12], [s * 49, -31], [s * 43, -2], [s * 34, 7]]);
    ink(b, shade(PALE, -0.25), 2.2);
    path(b, [[s * 34, -10], [s * 44, -24], [s * 40, -3]]);
    b.fillStyle = rgba('#5a2a4a', 0.45);
    b.fill();
  });
  path(b, [[0, 47], [14, 43], [26, 28], [32, 8], [36, -14], [31, -34], [0, -44], [-31, -34], [-36, -14], [-32, 8], [-26, 28], [-14, 43]]);
  ink(b, lin(b, 0, -44, 0, 47, [[0, shade(PALE, 0.22)], [0.5, PALE], [1, shade(PALE, -0.45)]]), 3);
  b.save();
  b.clip();
  both((s) => {
    b.fillStyle = rad(b, s * 25, 17, 0, 22, [[0, rgba('#3a1a58', 0.55)], [1, rgba('#3a1a58', 0)]]); // the cheek hollowed under the bone
    b.fillRect(s * 25 - 22, -5, 44, 44);
    b.fillStyle = rad(b, s * 16, -6, 0, 15, [[0, rgba('#2a0a3a', 0.8)], [0.6, rgba('#2a0a3a', 0.45)], [1, rgba('#2a0a3a', 0)]]); // the socket
    b.fillRect(s * 16 - 15, -21, 30, 30);
    b.fillStyle = rgba('#ffffff', 0.22); // the cheekbone catching the light
    ellipse(b, s * 24, 4, 7, 3, s * 0.6);
    b.fill();
  });
  b.fillStyle = rad(b, 0, -4, 10, 48, [[0, rgba('#000000', 0)], [1, rgba('#1a0a2a', 0.5)]]);
  b.fillRect(-40, -46, 80, 94);
  path(b, [[1, -2], [4, 16], [8, 21], [3, 22]]); // the nose's shadowed side
  b.fillStyle = rgba('#3a1a58', 0.3);
  b.fill();
  for (const y of [-31, -27]) { // lines in the brow
    b.beginPath();
    b.moveTo(-14, y);
    b.quadraticCurveTo(0, y - 3, 14, y);
    line(b, rgba('#3a1a58', 0.2), 1);
  }
  b.restore();
  b.beginPath(); // the hair, back from the forehead to a point
  b.moveTo(-37, -2);
  b.bezierCurveTo(-44, -50, -20, -54, 0, -52);
  b.bezierCurveTo(20, -54, 44, -50, 37, -2);
  b.lineTo(33, -14);
  b.lineTo(25, -35);
  b.lineTo(9, -37);
  b.lineTo(0, -22);
  b.lineTo(-9, -37);
  b.lineTo(-25, -35);
  b.lineTo(-33, -14);
  b.closePath();
  ink(b, lin(b, 0, -54, 0, -10, [[0, '#3a3050'], [1, '#07040c']]), 2.6);
  for (let i = -6; i <= 6; i++) { // strands combed back
    path(b, [[i * 4.6, -50], [i * 6, -38 + Math.abs(i) * 1.7]], true);
    line(b, rgba('#8a7aa8', 0.26), 1);
  }
  b.beginPath();
  b.ellipse(-10, -44, 17, 3.4, -0.18, Math.PI * 1.05, Math.PI * 1.9);
  line(b, rgba('#c8b8e8', 0.4), 1.8); // sheen
  path(b, [[-6, -34], [-10, -24], [-4, -20]]); // a lock fallen over the brow
  ink(b, '#0a0612', 1.4);
  both((s) => {
    path(b, [[s * 6, -4], [s * 20, -17], [s * 31, -15]], true); // the brow, arched sharp
    line(b, INK_HAIR, 3.4);
    ellipse(b, s * 16, -6, 8.4, 4.6);
    ink(b, '#1a0a22', 1.6);
    eye(l, s * 16, -6, 3.2, EYE, 4.4);
    eye(l, s * 16, -6, 1.1, '#ffffff', 2);
    path(b, [[s * 8.4, -3.6], [s * 24, -9]], true);
    line(b, rgba('#ff8a9a', 0.5), 1);
    path(b, [[s * 31, 14], [s * 21, 29]], true); // the jaw's edge
    line(b, rgba('#000000', 0.22), 2.6);
    ellipse(b, s * 3.2, 21, 1.4, 1);
    b.fillStyle = '#2a1030';
    b.fill();
  });
  path(b, [[-1.8, -4], [-3.6, 16], [-8, 21], [0, 24], [8, 21], [3.6, 16], [1.8, -4]]); // a long thin nose
  ink(b, shade(PALE, -0.1), 1.8);
  path(b, [[-1.6, -2], [-3, 14]], true);
  line(b, rgba('#ffffff', 0.3), 1.2);
  b.beginPath(); // the mouth, a sneer: the upper lip lifted over two fangs
  b.moveTo(-13, 31);
  b.quadraticCurveTo(-6, 28.6, 0, 30.4);
  b.quadraticCurveTo(6, 28.6, 13, 31);
  b.quadraticCurveTo(0, 39, -13, 31);
  ink(b, '#4a0e22', 1.4);
  b.beginPath();
  b.moveTo(-9, 35);
  b.quadraticCurveTo(0, 38, 9, 35);
  line(b, rgba('#4a0e22', 0.35), 1.6);
  both((s) => {
    path(b, [[s * 6.8, 31], [s * 4.8, 43], [s * 3.2, 32]]);
    ink(b, '#f4efe8', 1.2);
  });
  ellipse(b, 4.8, 44, 0.9, 1.5);
  b.fillStyle = EYE;
  b.fill();
  path(b, [[-4, 44], [0, 45.6], [4, 44]], true);
  line(b, rgba('#000000', 0.2), 1.4);
  gloss(b, -12, -28, 12, 4, 0.34, -0.2);
  bloom(l, 0, -6, 44, EYE, 0.14);
}

// The heart-amulet: a faceted crimson gem in a thorned brass bezel, hung from a ring.
function heart(b, l, p, S) {
  const { weak } = S.pal;
  const outline = (g, k = 1) => {
    g.beginPath();
    g.moveTo(0, 32 * k - 2);
    g.bezierCurveTo(-52 * k, 2 * k, -36 * k, -40 * k, 0, -17 * k - 2);
    g.bezierCurveTo(36 * k, -40 * k, 52 * k, 2 * k, 0, 32 * k - 2);
  };
  for (let i = 0; i < 12; i++) { // thorns round the bezel
    const a = Math.PI * 0.5 + (i / 12) * TAU;
    const [rx, ry] = [Math.cos(a), Math.sin(a)];
    const r0 = 31 - (Math.abs(Math.cos(a)) < 0.2 && ry < 0 ? 14 : 0);
    path(b, [[rx * r0 - ry * 3, ry * r0 + rx * 3 - 4], [rx * (r0 + 11), ry * (r0 + 11) - 4], [rx * r0 + ry * 3, ry * r0 - rx * 3 - 4]]);
    ink(b, shade(BRASS, -0.3), 1.6);
  }
  outline(b, 1.12);
  ink(b, lin(b, -40, -30, 40, 30, [[0, shade(BRASS, 0.5)], [0.5, BRASS], [1, shade(BRASS, -0.6)]]), 3);
  outline(b);
  ink(b, rad(b, -10, -14, 2, 46, [[0, '#ffb0bc'], [0.25, '#f02a4a'], [0.7, '#9a0c28'], [1, '#3a0412']]), 2.4);
  b.save();
  b.clip();
  for (const [x, y] of [[-30, -10], [-14, -26], [14, -26], [30, -10], [22, 14], [0, 30], [-22, 14]]) { // facets
    path(b, [[0, 2], [x, y]], true);
    line(b, rgba('#ffd0d8', 0.3), 1.2);
  }
  path(b, [[-26, -14], [-10, -24], [0, 2]]);
  b.fillStyle = rgba('#ffffff', 0.16);
  b.fill();
  b.restore();
  ellipse(b, 0, -43, 6, 6.6); // the ring it hangs from
  line(b, INK_HAIR, 5);
  line(b, BRASS, 2.4);
  gloss(b, -16, -14, 8, 3.4, 0.6, -0.6);
  outline(l);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, 0, 0, 0, 38, [[0, rgba('#ff8a9a', 0.9)], [0.5, rgba(weak, 0.55)], [1, rgba(weak, 0.1)]]);
  l.fill();
  l.restore();
  neon(l, weak, 1.5, 0.8);
  eye(l, 0, 2, 5, '#ffe0e6', 5);
  bloom(l, 0, 0, 56, weak, 0.45);
}

export const FACE = { head, heart };
