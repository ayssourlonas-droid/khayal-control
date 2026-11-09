// World 13, Sunset Armada, the glider's crew (see w13-2.js): the gull that is its figurehead, with a red
// spot on its beak, the scarf that streams back from the cockpit, and the pilot in goggles.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both } from './kit.js';
import { BRASS, GOLD, HOT, RED } from './w13-kit.js';

// The gull's head on the prow, seen from above: round and white, a gold ring round each dark eye and a
// hooked yellow beak with the red spot. The beak shuts on one beat and cries out on the other.
export function gull(b, l, f, c) {
  ellipse(b, 0, 32, 6.2, 5.8);
  ink(b, rad(b, 0, 32, 1, 7.6, [[0, '#ffffff'], [0.55, c], [1, shade(c, -0.4)]], -2, 29.8), 2);
  both((m) => {
    ellipse(b, m * 3.9, 31, 2, 2);
    ink(b, '#ffd27a', 1.2);
    ellipse(b, m * 3.9, 31.5, 1, 1.1);
    b.fillStyle = '#0c0c14';
    b.fill();
    ellipse(b, m * 3.9, 31, 2.4, 2.4);
    line(b, rgba(HOT, 0.9), 0.7);
    eye(l, m * 3.5, 30.6, 0.5, '#ffffff', 3);
  });
  path(b, [[-3.6, 35.4], [3.6, 35.4], [1.2, 44.6], [0, 46], [-1.2, 44.6]]); // the beak
  ink(b, lin(b, 0, 35, 0, 47, [[0, '#ffd668'], [0.7, '#f0a830'], [1, '#c8741c']]), 1.6);
  if (f) { // open: the red inside of the mouth shows
    path(b, [[-1.8, 37.2], [1.8, 37.2], [0.6, 43], [-0.6, 43]]);
    ink(b, '#7a1414', 0.8);
    path(b, [[0, 38.2], [0, 41.8]], true);
    line(b, '#ff8a7a', 0.8);
  } else {
    ellipse(b, 0, 42, 1.2, 1.6); // the spot
    b.fillStyle = RED;
    b.fill();
  }
  path(b, [[-1.4, 36.8], [-0.2, 43.6]], true);
  line(b, rgba('#ffffff', 0.5), 0.8);
  gloss(b, -2.4, 29.4, 2.6, 1.4, 0.6, -0.4);
}

// The scarf: a coral ribbon streaming back from the cockpit, waving left on one beat and right on the other.
export function scarf(b, s) {
  const [tx, ty] = [s * 9, -27];
  b.beginPath();
  b.moveTo(-2.4, 0);
  b.bezierCurveTo(-s * 4, -9, s * 5, -14, tx - 2.4, ty);
  b.lineTo(tx + s * 2.4, ty - 4);
  b.lineTo(tx + 2.4, ty + 1.6);
  b.lineTo(tx + 3, ty - 5.4);
  b.bezierCurveTo(s * 8 + 3, -14, -s * 2 + 2.4, -9, 2.4, 0);
  b.closePath();
  ink(b, lin(b, 0, 0, tx, ty, [[0, shade(RED, -0.1)], [1, '#ff9a6a']]), 1.8);
  b.beginPath();
  b.moveTo(0, -2);
  b.bezierCurveTo(-s * 1.5, -9, s * 4, -13, tx, ty + 1);
  line(b, rgba('#ffffff', 0.4), 0.8);
}

// The pilot in his open cockpit: a leather cap, brass goggles with a glint in each lens, a smirk.
export function pilot(b, l) {
  ellipse(b, 0, 5, 8.4, 9.2);
  ink(b, rad(b, 0, 5, 2, 10, [[0, '#2a1a14'], [1, '#6a4a30']]), 2);
  path(b, [[-6, 8], [6, 8], [5, 12.4], [-5, 12.4]]); // his shoulders in a leather jacket
  ink(b, '#6a4426', 1.5);
  ellipse(b, 0, 6.2, 5.3, 5.5);
  ink(b, '#f0c8a0', 1.7);
  b.beginPath(); // the cap
  b.ellipse(0, 6.2, 5.5, 5.7, 0, Math.PI * 1.04, Math.PI * 1.96);
  b.lineTo(5.6, 8.8);
  b.lineTo(-5.6, 8.8);
  b.closePath();
  ink(b, lin(b, -5, 0, 5, 8, [[0, '#8a5a34'], [1, '#3e2614']]), 1.7);
  path(b, [[0, 0.8], [0, 3.6]], true);
  line(b, rgba('#000000', 0.5), 0.9);
  both((m) => { // goggles: a brass rim round a teal lens
    ellipse(b, m * 2.9, 6.6, 2.8, 2.8);
    ink(b, rad(b, m * 2.9, 6.6, 0.4, 3, [[0, '#d8f4f2'], [0.6, '#2a9ab0'], [1, '#0c4a5c']], m * 2.3, 6), 1.5);
    b.beginPath();
    b.arc(m * 2.9, 6.6, 2.8, 0, Math.PI * 2);
    line(b, BRASS, 0.9);
    eye(l, m * 2.1, 5.9, 0.8, '#ffffff', 3.4);
    bloom(l, m * 2.9, 6.6, 7, GOLD, 0.3);
  });
  path(b, [[-1.6, 11], [1.8, 10.6]], true); // a smirk
  line(b, '#5a2a18', 0.9);
}
