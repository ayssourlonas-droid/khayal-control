// World 15, Lantern Deep: what the hermit crab (w15-4.js) and the sea turtle (w15-5.js) share. Old brass
// and verdigris, rust, iron, bone-white barnacles, coral, and the pale gold-white of a lantern against the
// deep's teal glow. The crab's helmet is in w15-8.js, its claws and legs in w15-claw.js and its shell in
// w15-whelk.js; the turtle's shell and flippers are in w15-9.js, its chest and lantern in w15-chest.js.
// Every shape is painted once, at load: nothing here runs per frame.
import { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, circle, both, TAU, INK } from './kit.js';
import { hash } from '../sprites.js';

export const BRASS = '#b58a3c'; // old diving brass
export const VERDI = '#3f9c88'; // verdigris, the green that brass grows underwater
export const RUST = '#7a4026'; // iron rust: a dark brown, never a bullet's orange
export const BONE = '#d6c8cc'; // barnacle and shell
export const IRON = '#4a5662'; // chest bands, lantern frame
export const GLASS = '#56d0a4'; // porthole glass
export const WICK = '#fff0c0'; // a lantern's pale gold-white
export const GLOW = '#7af0d8'; // the deep's teal light

// Brass across x (a bright band left of centre) or down y (bright on top), in colour c.
export const brassH = (g, x0, x1, c = BRASS) => lin(g, x0, 0, x1, 0, [[0, shade(c, -0.6)], [0.22, shade(c, 0.6)], [0.5, c], [1, shade(c, -0.62)]]);
export const brassV = (g, y0, y1, c = BRASS) => lin(g, 0, y0, 0, y1, [[0, shade(c, 0.55)], [0.45, c], [1, shade(c, -0.62)]]);

// A domed rivet or bolt head with a glint.
export function rivet(g, x, y, r = 1.2, c = BRASS) {
  circle(g, x, y, r);
  ink(g, rad(g, x, y, 0.1, r * 1.1, [[0, shade(c, 0.6)], [0.6, c], [1, shade(c, -0.55)]], x - r * 0.3, y - r * 0.35), 0.8);
  circle(g, x - r * 0.3, y - r * 0.35, r * 0.3);
  g.fillStyle = rgba('#ffffff', 0.8);
  g.fill();
}

// n rivets on a ring of radius R round (x, y), the first at angle a0.
export function bolts(g, x, y, R, n, r, a0 = 0, c = BRASS) {
  for (let i = 0; i < n; i++) rivet(g, x + Math.cos(a0 + (i * TAU) / n) * R, y + Math.sin(a0 + (i * TAU) / n) * R, r, c);
}

// A barnacle at (x, y), r px across: a ridged white cone seen from above, a dark mouth.
export function barnacle(g, x, y, r) {
  ellipse(g, x, y, r, r * 0.82);
  ink(g, rad(g, x, y, 0.3, r * 1.1, [[0, '#f6f0ea'], [0.6, BONE], [1, shade(BONE, -0.5)]], x - r * 0.3, y - r * 0.4), 0.9);
  for (let i = 0; i < 6; i++) {
    const a = i * 1.047 + 0.3;
    g.beginPath();
    g.moveTo(x + Math.cos(a) * r * 0.4, y + Math.sin(a) * r * 0.32);
    g.lineTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.78);
    line(g, rgba('#3a2f3c', 0.5), 0.5);
  }
  ellipse(g, x, y - r * 0.04, r * 0.36, r * 0.26);
  g.fillStyle = '#1a1420';
  g.fill();
}

// A little colony: n barnacles of mixed size scattered by `seed` within `spread` px of (x, y).
export function barnacles(g, x, y, r, n, seed, spread = r * 1.6) {
  for (let i = 0; i < n; i++) {
    const h = (j) => hash(seed * 211 + i * 17 + j);
    barnacle(g, x + (h(1) - 0.5) * spread * 2, y + (h(2) - 0.5) * spread, r * (0.55 + h(3) * 0.5));
  }
}

// A branching coral sprig from (x, y) growing along `ang`, len px long, w px thick at the foot, in colour c,
// forking `depth` times; the outline is painted under all the colour, tips are lighter beads. Returns the
// tips [[x, y], ...] so a caller can light them.
export function coral(g, x, y, len, ang, c, seed = 1, w = 2.6, depth = 2) {
  const tips = [];
  const grow = (x0, y0, a, ln, wd, d, pass) => {
    const bend = (hash(seed * 31 + d * 7 + Math.round(x0 + y0)) - 0.5) * 0.7;
    const [x1, y1] = [x0 + Math.cos(a + bend) * ln, y0 + Math.sin(a + bend) * ln];
    g.beginPath();
    g.moveTo(x0, y0);
    g.quadraticCurveTo(x0 + Math.cos(a) * ln * 0.55, y0 + Math.sin(a) * ln * 0.55, x1, y1);
    line(g, pass ? (d ? c : shade(c, -0.15)) : INK, pass ? wd : wd + 1.8);
    if (d > 0) {
      grow(x1, y1, a - 0.5, ln * 0.72, wd * 0.74, d - 1, pass);
      grow(x1, y1, a + 0.45, ln * 0.68, wd * 0.7, d - 1, pass);
    } else if (pass) tips.push([x1, y1, wd]);
  };
  grow(x, y, ang, len, w, depth, 0);
  grow(x, y, ang, len, w, depth, 1);
  for (const [tx, ty, wd] of tips) {
    circle(g, tx, ty, wd * 0.7 + 0.4);
    g.fillStyle = shade(c, 0.55);
    g.fill();
  }
  return tips.map(([tx, ty]) => [tx, ty]);
}

// A stain running down from (x, y): rust or verdigris fading as it goes.
export function drip(g, x, y, len, c, a = 0.5, w = 1.6) {
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(x + 0.7, y + len * 0.5, x - 0.2, y + len);
  line(g, lin(g, 0, y, 0, y + len, [[0, rgba(c, a)], [1, rgba(c, 0)]]), w);
}

// A glint on the lights layer: a four-point star in a small cool bloom.
export function glint(l, x, y, r, c = '#d8fbff', a = 1) {
  bloom(l, x, y, r * 1.8, GLOW, 0.4 * a);
  const k = r * 0.16;
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  l.moveTo(x, y - r);
  l.quadraticCurveTo(x + k, y - k, x + r, y);
  l.quadraticCurveTo(x + k, y + k, x, y + r);
  l.quadraticCurveTo(x - k, y + k, x - r, y);
  l.quadraticCurveTo(x - k, y - k, x, y - r);
  l.fillStyle = rgba(c, a);
  l.fill();
  l.restore();
}

export { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, circle, both, TAU, INK };
