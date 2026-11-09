// World 15, Lantern Deep, the hermit crab's diving helmet (see w15-4.js): an old riveted brass dome gone green
// at the seams, a bolted ring and a corrugated breastplate under it, a round porthole of green-tinted glass
// with the crab's eyes on their stalks looking out, rust streaks, glints. The porthole glows faintly from
// inside; the eyes turn and bob from one beat to the next. The lamp port, hose, valve, coral and barnacles are
// in w15-hose.js.
import { path, ink, lin, rad, rgba, shade, mix, bloom, eye, gloss, line, ellipse, circle, INK } from './w15-kit-2.js';
import { BRASS, VERDI, RUST, GLASS, brassH, brassV, rivet, bolts, drip, glint } from './w15-kit-2.js';
import { sidePort, hose, crown } from './w15-hose.js';

const [DY, RX, RY] = [-3, 17.5, 16.5]; // the dome: centre y, half-width, half-height
const [PY, PR] = [-2, 8.2]; // the porthole: centre y, glass radius

// The dome: lit brass, verdigris blooming at the foot, a rim band along the crown, scratches, a gloss.
function dome(b) {
  ellipse(b, 0, DY, RX, RY);
  ink(b, rad(b, 0, DY, 1, 23, [[0, shade(BRASS, 0.72)], [0.3, shade(BRASS, 0.2)], [0.62, BRASS], [1, shade(BRASS, -0.65)]], -6, -12), 3);
  b.save();
  ellipse(b, 0, DY, RX, RY);
  b.clip();
  for (const [x, y, rx, ry, a] of [[8, 9, 11, 6, 0.5], [-12, 8, 7, 5, 0.4], [14, -4, 4, 9, 0.32], [-3, -17, 9, 3, 0.28]]) {
    ellipse(b, x, y, rx, ry);
    b.fillStyle = rad(b, x, y, 0, Math.max(rx, ry), [[0, rgba(VERDI, a)], [1, rgba(VERDI, 0)]]);
    b.fill();
  }
  b.fillStyle = brassV(b, -2, 14, '#000000');
  b.globalAlpha = 0.42;
  b.fillRect(-19, -2, 38, 17);
  b.globalAlpha = 1;
  b.beginPath(); // the rim band inset along the crown
  b.ellipse(0, DY + 0.6, RX - 3, RY - 3, 0, 3.55, 5.87);
  line(b, rgba('#000000', 0.5), 1.8);
  b.beginPath();
  b.ellipse(0, DY, RX - 3, RY - 3, 0, 3.55, 5.87);
  line(b, rgba(shade(BRASS, 0.6), 0.8), 1);
  for (let i = 0; i < 6; i++) rivet(b, Math.cos(3.7 + i * 0.4) * (RX - 3), DY + Math.sin(3.7 + i * 0.4) * (RY - 3), 1, BRASS);
  for (const [x, y, x2, y2] of [[-11, -1, -8, 2], [7, -11, 10, -9], [-4, -15, -1, -14.5]]) { // scratches
    path(b, [[x, y], [x2, y2]], true);
    line(b, rgba('#ffffff', 0.28), 0.7);
  }
  b.restore();
  gloss(b, -8.4, -12, 6, 2.8, 0.6, -0.65);
}

// The neck ring with its bolts and the corrugated breastplate that flares under it, rust running down.
function neck(b) {
  path(b, [[-17.5, 8.5], [17.5, 8.5], [20.5, 11.5], [20.5, 15.5], [-20.5, 15.5], [-20.5, 11.5]]);
  ink(b, brassH(b, -20.5, 20.5, shade(BRASS, -0.08)), 2.6);
  const plate = () => {
    b.beginPath();
    b.moveTo(-20, 15);
    b.lineTo(20, 15);
    b.bezierCurveTo(22.4, 17.6, 23.4, 20.6, 23, 24);
    b.quadraticCurveTo(0, 28.6, -23, 24);
    b.bezierCurveTo(-23.4, 20.6, -22.4, 17.6, -20, 15);
    b.closePath();
  };
  plate();
  ink(b, brassH(b, -23.4, 23.4, mix(BRASS, VERDI, 0.1)), 2.6);
  b.save();
  plate();
  b.clip();
  for (let i = -5; i <= 5; i++) { // the corrugations: a soft groove with a light lip beside it
    path(b, [[i * 3.9, 15], [i * 4.4, 28]], true);
    line(b, rgba('#000000', 0.34), 1.7);
    path(b, [[i * 3.9 + 1.6, 15], [i * 4.4 + 1.7, 28]], true);
    line(b, rgba(shade(BRASS, 0.6), 0.5), 1);
  }
  b.fillStyle = lin(b, 0, 15, 0, 28, [[0, rgba('#000000', 0)], [1, rgba('#06120c', 0.34)]]);
  b.fillRect(-27, 15, 54, 14);
  b.restore();
  b.beginPath(); // the hem: a bright rolled edge with a row of rivets
  b.moveTo(-22.4, 23.4);
  b.quadraticCurveTo(0, 28, 22.4, 23.4);
  line(b, rgba(shade(BRASS, 0.5), 0.7), 1.4);
  for (let i = 1; i < 8; i++) rivet(b, -22.4 + i * 5.6, 24.2 + 1.7 * Math.sin((i / 8) * Math.PI), 0.8, shade(BRASS, -0.1));
  for (let x = -17; x <= 17; x += 4.25) rivet(b, x, 12.2, 0.85, shade(BRASS, -0.15));
  for (const [x, len] of [[-13, 7], [-5, 5], [4, 8], [13, 6]]) drip(b, x, 14.4, len, RUST, 0.7, 1.8);
}

// The porthole: a bolted bezel, green glass, the crab's face inside, two eyes on stalks that look to one
// side and then the other, a sheen across the glass. Its glow is on the lights layer.
function porthole(b, l, f, c) {
  circle(b, 0, PY, 11.8);
  ink(b, rad(b, 0, PY, 3, 13, [[0, shade(BRASS, 0.25)], [0.6, BRASS], [1, shade(BRASS, -0.55)]], -4, -6), 2.4);
  circle(b, 0, PY, 9.2);
  line(b, rgba('#000000', 0.55), 1.3);
  bolts(b, 0, PY, 10.5, 8, 1, 0.39);
  b.save();
  circle(b, 0, PY, PR);
  b.clip();
  b.fillStyle = rad(b, 0, PY, 1, 9.5, [[0, '#0f5a50'], [0.6, '#08363a'], [1, '#031a1e']]);
  b.fillRect(-10, -11, 20, 18);
  const look = f ? 0.9 : -0.9;
  for (const [m, bob] of [[-1, f ? -0.9 : 0.5], [1, f ? 0.5 : -0.9]]) {
    const [ex, ey] = [m * 3.5 + look * 0.5, -3.7 + bob];
    b.beginPath();
    b.moveTo(m * 1.4, 9);
    b.quadraticCurveTo(m * 2.6, 2.4, ex, ey + 1.2);
    line(b, INK, 2.4);
    line(b, shade(c, -0.3), 1.1);
    circle(b, ex, ey, 2.4);
    ink(b, rad(b, ex, ey, 0.2, 2.6, [[0, '#fffafc'], [0.7, '#ffd8e6'], [1, shade(c, -0.2)]], ex - 0.7, ey - 0.7), 0.8);
    circle(b, ex + look * 0.8, ey + 0.5, 1.25);
    b.fillStyle = '#160810';
    b.fill();
  }
  path(b, [[-9, 1], [-2, -11], [3, -11], [-6, 3]]); // the sheen
  b.fillStyle = rgba('#ffffff', 0.13);
  b.fill();
  b.restore();
  b.beginPath();
  b.arc(0, PY, PR - 0.8, 3.5, 4.7);
  line(b, rgba('#e8fff6', 0.7), 1.1);
  l.save(); // the lit glow behind the glass: strongest at the rim, so the eyes stay dark against it
  l.globalCompositeOperation = 'lighter';
  circle(l, 0, PY, PR);
  l.fillStyle = rad(l, 0, PY, 3, 9, [[0, rgba(GLASS, 0.04)], [0.7, rgba(GLASS, 0.2)], [1, rgba(GLASS, 0.42)]]);
  l.fill();
  l.restore();
  bloom(l, 0, PY, 22, GLASS, 0.15);
  for (const [m, bob] of [[-1, f ? -0.9 : 0.5], [1, f ? 0.5 : -0.9]]) eye(l, m * 3.5 + look * 0.5 - 0.9, -3.7 + bob - 0.95, 0.5, '#ffffff', 2);
}

// The helmet, drawn over the shell and the crab's shoulders: dome, neck, porthole, port, hose and crown.
export function helmet(b, l, f, c) {
  dome(b);
  neck(b);
  porthole(b, l, f, c);
  sidePort(b, l);
  hose(b, f);
  crown(b, f);
  glint(l, f ? 6 : -9, f ? -13 : -12.6, f ? 2 : 2.4, '#d8fbff', 0.75);
  glint(l, f ? -9 : 9, f ? 9 : 10, 1.6, '#c8f4ff', 0.5);
}
