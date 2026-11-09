// The Vesper Moth's heart (World 16, Glass Cathedral; see moth.js): a weak part 150 x 100, the rose window set in the
// thorax like a brooch. A gilded stone brooch spreads across the box, pointed at both ends and studded with a cobalt
// and a rose jewel; in it a round window in a gilt ring beaded with solder: eight lancet petals of hot gold glass, pale
// at their hearts and amber toward the lead, between them eight small jewels in the spandrels, and a hub of rose and
// amber cells round a white-hot lens. Everything else on the moth is dark, so this is what the eye goes to. The lights
// carry a halo in the weak colour, a glow in every petal and the hub's blaze; the window's light slowly turns in live
// (moth-light.js). The rose's geometry (HEART) is shared with that.
import { line, lin, rad, rgba, shade, bloom } from './kit.js';
import { came, pane, circle, curve, solder, LEAD, STONE, ROSE, COBALT, AMBER, GOLD, WEAK, TAU } from './moth-kit.js';
import { band, beads } from './moth-rose.js';

export const HEART = { R: 47, petals: 8, r0: 15, rs: 31, rt: 39.5 };
const GILT = [[0, '#fff0c0'], [0.35, '#e8c470'], [0.7, '#9a7430'], [1, '#4a3414']];
const BROOCH = [[-74, 1], [-62, -8], [-44, -13], [0, -15], [44, -13], [62, -8], [74, 1], [62, 10], [44, 14], [0, 16], [-44, 14], [-62, 10]];

function brooch(b) {
  curve(b, BROOCH);
  b.fillStyle = LEAD;
  b.fill();
  b.save();
  curve(b, BROOCH.map(([x, y]) => [x * 0.985, y * 0.8]));
  b.fillStyle = lin(b, 0, -15, 0, 16, GILT);
  b.fill();
  b.clip();
  b.beginPath();
  for (let x = -70; x < 70; x += 6) { // engraved scrolls along the band
    b.moveTo(x, 4);
    b.quadraticCurveTo(x + 3, -1, x + 6, 4);
  }
  line(b, rgba('#4a3414', 0.45), 0.9);
  b.restore();
  curve(b, BROOCH);
  line(b, LEAD, 2.6);
  for (const [s, c] of [[-1, COBALT], [1, ROSE]]) { // a jewel at each end
    const x = s * 61;
    circle(b, x, 0.5, 8.4);
    b.fillStyle = LEAD;
    b.fill();
    circle(b, x, 0, 7);
    b.fillStyle = rad(b, x, 0, 0, 7, [[0, shade(c, 0.7)], [0.45, c], [1, shade(c, -0.55)]], x - 2, -2.4);
    b.fill();
    circle(b, x - 2.2, -2.4, 1.7);
    b.fillStyle = rgba('#ffffff', 0.9);
    b.fill();
    circle(b, x, 0, 8.2);
    line(b, rgba('#e8c878', 0.8), 1.2);
  }
}

function frame(b) {
  const R = HEART.R;
  circle(b, 0, 0.8, R + 2);
  b.fillStyle = rgba('#000000', 0.5);
  b.fill();
  circle(b, 0, 0, R + 1.6);
  b.fillStyle = LEAD;
  b.fill();
  circle(b, 0, 0, R);
  b.fillStyle = rad(b, 0, 0, 30, R, [[0, '#9a7430'], [0.5, '#e8c470'], [1, '#6a4a1c']], -8, -12);
  b.fill();
  circle(b, 0, 0, 41.2);
  b.fillStyle = LEAD;
  b.fill();
  beads(b, 24, 44.2, 0.1, 1.5);
  circle(b, 0, 0, R - 0.5);
  line(b, rgba('#fff0c0', 0.55), 1);
}

function petal(b, k) {
  const { petals, r0, rs, rt } = HEART;
  const am = (k * TAU) / petals;
  b.save();
  b.rotate(am);
  const w = (r) => r * Math.tan(TAU / petals / 2) * 0.93;
  const build = () => {
    b.beginPath();
    b.moveTo(r0, -w(r0));
    b.lineTo(rs, -w(rs));
    b.quadraticCurveTo(rs + (rt - rs) * 0.5, -w(rs) * 0.8, rt, 0);
    b.quadraticCurveTo(rs + (rt - rs) * 0.5, w(rs) * 0.8, rs, w(rs));
    b.lineTo(r0, w(r0));
    b.closePath();
  };
  pane(b, build, k % 2 ? AMBER : GOLD, [26, 0, 17], 900 + k * 7, 1, 0);
  came(b, build, 2.4, 0.4);
  b.restore();
}

export function heart(b, l) {
  brooch(b);
  frame(b);
  circle(b, 0, 0, 41);
  b.fillStyle = shade(STONE, -0.4);
  b.fill();
  for (let k = 0; k < HEART.petals; k++) petal(b, k);
  for (let k = 0; k < HEART.petals; k++) { // the jewels between the petals' tips
    const a = ((k + 0.5) * TAU) / HEART.petals;
    const [x, y] = [Math.cos(a) * 36.5, Math.sin(a) * 36.5];
    circle(b, x, y, 4.4);
    b.fillStyle = LEAD;
    b.fill();
    circle(b, x, y, 3.3);
    b.fillStyle = rad(b, x, y, 0, 3.3, [[0, shade(k % 2 ? COBALT : ROSE, 0.7)], [0.5, k % 2 ? COBALT : ROSE], [1, shade(k % 2 ? COBALT : ROSE, -0.5)]], x - 1, y - 1);
    b.fill();
  }
  band(b, 9.5, HEART.r0, 8, [ROSE, AMBER], 950, 0.9, TAU / 16);
  circle(b, 0, 0, 10);
  b.fillStyle = LEAD;
  b.fill();
  circle(b, 0, 0, 8.4);
  b.fillStyle = rad(b, 0, 0, 0, 8.4, [[0, '#ffffff'], [0.45, '#fff6d8'], [0.85, WEAK], [1, GOLD]], -1.8, -2);
  b.fill();
  circle(b, -2.6, -2.8, 2);
  b.fillStyle = rgba('#ffffff', 0.9);
  b.fill();
  bloom(l, 0, 0, 92, WEAK, 0.5);
  bloom(l, 0, 0, 40, '#ffffff', 0.55);
  for (let k = 0; k < HEART.petals; k++) {
    const a = (k * TAU) / HEART.petals;
    bloom(l, Math.cos(a) * 26, Math.sin(a) * 26, 22, k % 2 ? AMBER : GOLD, 0.36);
  }
  for (const [s, c] of [[-1, COBALT], [1, ROSE]]) bloom(l, s * 61, 0, 22, c, 0.4);
  circle(l, 0, 0, 40);
  line(l, rgba('#fff0c0', 0.25), 1.6);
}
