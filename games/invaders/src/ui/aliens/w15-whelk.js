// World 15, Lantern Deep, the hermit crab's shell (see w15-4.js): a big spiral shell, dusty lavender bone,
// riding the crab's back and standing up behind the helmet. Three whorls wind out from a knob at the centre
// to a flared lip; each whorl is ribbed, a groove and its shadow run along the spiral, and the whole thing
// is crusted with barnacles and a few coral sprigs whose tips glow faintly and sway from one beat to the next.
import { ink, rad, rgba, shade, bloom, line, circle } from './w15-kit-2.js';
import { barnacles, coral } from './w15-kit-2.js';

const SHELL = '#b9aac8';
const AT = [4, -24, 0.3]; // where the spiral's centre stands (x, y) and how far the shell is turned
const [R0, R1, TURNS] = [1.2, 17.5, 3]; // the spiral grows from R0 to R1 over TURNS turns
const K = Math.log(R1 / R0) / (TURNS * Math.PI * 2);
const spiral = (a) => {
  const r = R0 * Math.exp(K * a);
  return [Math.cos(a) * r, Math.sin(a) * r];
};
const END = TURNS * Math.PI * 2;

// The whole shell as one outline: the spiral out to its lip, then straight back to the knob.
function outline(b) {
  b.beginPath();
  b.moveTo(0, 0);
  for (let a = 0.4; a <= END + 0.001; a += 0.12) b.lineTo(...spiral(a));
  b.closePath();
}

function shell(b) {
  outline(b);
  ink(b, rad(b, 0, 0, 1, 24, [[0, shade(SHELL, 0.6)], [0.5, SHELL], [1, shade(SHELL, -0.62)]], -7, -9), 2.8);
  b.save();
  outline(b);
  b.clip();
  for (let a = 0.9; a <= END - Math.PI * 2; a += 0.34) { // a rib across each whorl, from one groove to the next
    const [x0, y0] = spiral(a);
    const [x1, y1] = spiral(a + Math.PI * 2 - 0.3);
    b.beginPath();
    b.moveTo(x0 * 1.04, y0 * 1.04);
    b.lineTo(x1 * 0.94, y1 * 0.94);
    line(b, rgba('#2c2036', 0.3), 0.9);
    b.beginPath();
    b.moveTo(x0 * 1.04 + 0.7, y0 * 1.04 - 0.5);
    b.lineTo(x1 * 0.94 + 0.7, y1 * 0.94 - 0.5);
    line(b, rgba('#ffffff', 0.2), 0.6);
  }
  for (const [w, c, dx, dy] of [[5, rgba('#1c1226', 0.2), 0, 0], [1.9, rgba('#150e1c', 0.9), 0, 0], [0.9, rgba('#ffffff', 0.4), 0.9, -0.9]]) { // the groove, its shadow and a lit lip
    b.beginPath();
    for (let a = Math.PI * 2; a <= END; a += 0.12) {
      const [x, y] = spiral(a);
      a === Math.PI * 2 ? b.moveTo(x + dx, y + dy) : b.lineTo(x + dx, y + dy);
    }
    line(b, c, w);
  }
  b.restore();
  for (let a = 1.2; a < END - Math.PI * 2 - 0.2; a += 0.55) { // the painted dashes across the whorls
    const [x0, y0] = spiral(a);
    const [x1, y1] = spiral(a + Math.PI * 2);
    b.beginPath();
    b.moveTo(x0 + (x1 - x0) * 0.42, y0 + (y1 - y0) * 0.42);
    b.lineTo(x0 + (x1 - x0) * 0.6, y0 + (y1 - y0) * 0.6);
    line(b, rgba('#5a3a78', 0.42), 1.3);
  }
  circle(b, 0, 0, 1.3); // the knob at the centre of the spiral
  ink(b, shade(SHELL, 0.2), 0.8);
}

// The shell for beat f; its lights are the tips of the coral growing on it.
export function whelk(b, l, f) {
  const sway = f ? 0.12 : -0.1;
  for (const g of [b, l]) {
    g.save();
    g.translate(AT[0], AT[1]);
    g.rotate(AT[2]);
  }
  shell(b);
  barnacles(b, 9, -4, 1.9, 3, 22, 3.4);
  barnacles(b, -10, -9, 1.7, 3, 21, 2.6);
  const tips = [
    ...coral(b, 14.4, -5, 6.2, -0.7 + sway, '#35b09a', 9, 2, 2),
  ];
  for (const [x, y] of tips) bloom(l, x, y, 3.2 + (f ? 0.6 : 0), '#d8f4ff', 0.3);
  for (const g of [b, l]) g.restore();
}
