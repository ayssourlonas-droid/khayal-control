// The spellbook of World 12 thrown open (w12-2.js has it shut): red boards flung wide, leaves fanned up out
// of the spread, a seal burning on the gutter and a bolt gathering at the spine's foot.
import { path, ink, lin, rgba, shade, eye, bloom, line, ellipse, both } from './kit.js';
import { GOLD, GILT, PAPER, BRONZE, rrect, script } from './w12-kit.js';

// A leaf of the open book, written over and lit toward the gutter: the main page lies on its board with its
// spine edge at x = 0 and its far edge s * 36 away; a fanned one is a tapering feather of paper hinged at the
// spine's foot and raised a radians.
function leaf(g, s, a, seed, len = 0) {
  g.save();
  if (a) {
    const e = s * len;
    g.translate(s * 2, 14);
    g.rotate(-s * a);
    g.beginPath();
    g.moveTo(0, -9);
    g.quadraticCurveTo(e * 0.55, -17, e * 1.04, 0);
    g.quadraticCurveTo(e * 0.55, 14, 0, 9);
    g.closePath();
    ink(g, lin(g, 0, 0, e, 0, [[0, shade(PAPER, -0.4 + a * 0.1)], [1, shade(PAPER, 0.05 + a * 0.04)]]), 2.4);
    g.save();
    g.clip();
    for (let i = 0; i < 3; i++) script(g, s > 0 ? 6 : -len, s > 0 ? len : -6, -5 + i * 5.6, rgba('#5a3a1a', 0.6), 0.9, seed + i);
    g.restore();
  } else {
    g.translate(0, 24);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(0, -48);
    g.quadraticCurveTo(s * 20, -54, s * 36, -48);
    g.lineTo(s * 37, -2);
    g.quadraticCurveTo(s * 20, 3, 0, 0);
    g.closePath();
    ink(g, lin(g, 0, 0, s * 36, 0, [[0, shade(PAPER, -0.3)], [0.4, shade(PAPER, 0.05)], [1, shade(PAPER, 0.15)]]), 2.4);
    g.save();
    g.clip();
    for (let i = 0; i < 6; i++) script(g, s > 0 ? 4 : -33, s > 0 ? 33 - (i % 3) * 3 : -4, -38 + i * 7, rgba('#5a3a1a', 0.7), 1, seed + i);
    g.fillStyle = '#7a2a20'; // an illuminated capital at the head of the page, gilt-framed
    g.fillRect(s * 4 - (s < 0 ? 8 : 0), -46, 8, 8);
    g.strokeStyle = GILT;
    g.lineWidth = 0.9;
    g.strokeRect(s * 4 - (s < 0 ? 8 : 0), -46, 8, 8);
    g.restore();
  }
  g.restore();
}

// The book thrown open: red boards flung wide, leaves fanned up out of the spread like the feathers of a
// wing, a seal of runes burning on the gutter, and at the foot of the spine the bolt it gathers to fire.
export function flung(b, l, hide) {
  for (const g of [b, l]) g.translate(0, -4); // up, so the bolt's glow ends inside the sprite
  both((s) => {
    path(b, [[s * 1, -29], [s * 44, -37], [s * 47, 27], [s * 1, 32]]);
    ink(b, lin(b, 0, 0, s * 47, 0, [[0, shade(hide, -0.45)], [1, shade(hide, 0.1)]]), 3);
    path(b, [[s * 40, -33], [s * 43, 25]], true);
    line(b, rgba(GILT, 0.9), 1.4);
  });
  both((s) => {
    leaf(b, s, 1.25, 20, 56);
    leaf(b, s, 0.85, 30, 52);
    leaf(b, s, 0.45, 40, 44);
  });
  both((s) => leaf(b, s, 0, s > 0 ? 3 : 11));
  rrect(b, -2.4, -30, 4.8, 58, 2);
  ink(b, lin(b, -2, 0, 2, 0, [[0, shade(hide, -0.6)], [0.5, shade(hide, -0.3)], [1, shade(hide, -0.6)]]), 1.8);
  path(b, [[-5, 30], [5, 30], [3.4, 37], [-3.4, 37]]); // the spine's foot, a bronze nozzle the spell leaves by
  ink(b, lin(b, -5, 0, 5, 0, [[0, shade(BRONZE, 0.4)], [1, shade(BRONZE, -0.5)]]), 2);
  ellipse(l, 0, -5, 12, 12);
  line(l, rgba(GOLD, 0.8), 1.4);
  ellipse(l, 0, -5, 7.4, 7.4);
  line(l, rgba(GOLD, 0.5), 1);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    path(l, [[Math.cos(a) * 12, -5 + Math.sin(a) * 12], [Math.cos(a) * 17, -5 + Math.sin(a) * 17]], true);
    line(l, rgba(GOLD, 0.7), 1.2);
  }
  eye(l, 0, -5, 3.4, '#ffffff', 5.4);
  path(l, [[-1, -30], [-1, 28]], true); // the gutter glows with it
  line(l, rgba(GOLD, 0.4), 2);
  for (let i = 0; i < 5; i++) { // sparks thrown off by the bolt
    const a = 0.4 + i * 0.58;
    path(l, [[Math.cos(a) * 5, 40 + Math.sin(a) * 2], [Math.cos(a) * 11, 40 + Math.sin(a) * 4.4]], true);
    line(l, rgba('#ffffff', 0.7), 1);
  }
  eye(l, 0, 40, 3.6, '#ffffff', 3.2);
  bloom(l, 0, 40, 11, '#ffb040', 0.7);
  bloom(l, 0, -4, 46, GOLD, 0.2);
}
