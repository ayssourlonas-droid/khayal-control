// The Tesla coil on top of World 18's thunder turret (w18-turret.js): three porcelain insulators, a copper-wound secondary
// coil, a polished terminal and a curved prong each side. Its arcs are on the lights layer: from the terminal to each prong
// tip, one bright and one faint on each beat, and a streamer reaching up from the terminal.
import { path, ink, rad, rgba, shade, line, circle, bez, INK, IRON, STEEL, COPPER_L, PORCELAIN, VIOLET, SPARK, rivet, glare, bolt, jag, round } from './w18-kit.js';

const TIP = [17, -35]; // where a prong ends (the right one)
const TOP = [0, -37.5]; // the terminal's centre

// A prong: a rod curving up and out from the stack, ending in a ball.
function prong(b, s, c) {
  const pts = bez([s * 8, -20], [s * 14, -22], [s * 19, -26], [s * TIP[0], TIP[1]], 10);
  path(b, pts, true);
  line(b, INK, 4);
  line(b, shade(IRON, 0.1), 2.2);
  path(b, pts.slice(0, 8).map(([x, y]) => [x - s * 0.5, y - 0.6]), true);
  line(b, rgba(STEEL, 0.7), 0.8);
  circle(b, s * TIP[0], TIP[1], 2.6);
  ink(b, rad(b, s * TIP[0] - 0.8, TIP[1] - 0.8, 0, 3, [[0, '#ffffff'], [0.4, COPPER_L], [1, shade(c, -0.5)]]), 1.6);
}

function stack(b) {
  for (const [y, w] of [[-14, 10], [-18, 8.2], [-22, 6.4]]) { // insulator discs, the widest at the bottom
    b.beginPath();
    b.rect(-w, y - 4, w * 2, 4.4);
    ink(b, round(b, -w, w, PORCELAIN, 0.42), 1.8);
    b.beginPath();
    b.moveTo(-w + 1.4, y - 3);
    b.lineTo(w * 0.2, y - 3);
    line(b, rgba('#ffffff', 0.8), 0.8);
  }
}

function winding(b, c) {
  b.beginPath();
  b.rect(-5, -35, 10, 11);
  ink(b, round(b, -5, 5, shade(c, -0.45), 0.45), 2);
  b.save();
  b.beginPath();
  b.rect(-5, -35, 10, 11);
  b.clip();
  for (let y = -34.4; y < -24; y += 1.5) { // the wire, turn by turn
    b.beginPath();
    b.moveTo(-5, y);
    b.quadraticCurveTo(0, y + 1, 5, y);
    line(b, rgba(COPPER_L, 0.75), 0.7);
    b.beginPath();
    b.moveTo(-5, y + 0.8);
    b.quadraticCurveTo(0, y + 1.8, 5, y + 0.8);
    line(b, rgba('#1a0a04', 0.55), 0.7);
  }
  b.restore();
}

function terminal(b, c) {
  circle(b, TOP[0], TOP[1], 5.4);
  ink(b, rad(b, -1.6, TOP[1] - 1.8, 0, 7.2, [[0, '#ffffff'], [0.3, COPPER_L], [0.7, c], [1, shade(c, -0.7)]]), 2.4);
}

function arcs(l, f) {
  for (const s of [-1, 1]) {
    const strong = (s > 0) === Boolean(f); // the right prong takes the strong arc on beat 1, the left on beat 0
    const pts = jag((f ? 30 : 40) + s * 3, s * 3.6, TOP[1] - 2, s * TIP[0], TIP[1] - 1, strong ? 6 : 4, strong ? 5 : 3);
    bolt(l, pts, strong ? VIOLET : '#8a78e0', strong ? 2 : 1, strong ? 1 : 0.55);
    glare(l, s * TIP[0], TIP[1], strong ? 2.2 : 1.2, VIOLET, strong ? 1 : 0.6);
  }
  const reach = f ? 4 : -4;
  bolt(l, jag(77 + (f ? 1 : 0), 0, TOP[1] - 4, reach, TOP[1] - 9, 3, 3), SPARK, 1, 0.85); // a streamer off the top
  bolt(l, jag(83, 0, TOP[1] - 4, -reach * 1.5, TOP[1] - 10, 3, 2.4), VIOLET, 1, 0.6);
  glare(l, TOP[0], TOP[1], f ? 3.4 : 2.4, VIOLET, 0.85);
}

export function coilTop(b, l, f, c) {
  prong(b, -1, c);
  prong(b, 1, c);
  stack(b);
  winding(b, c);
  terminal(b, c);
  rivet(b, -6.4, -17.4, 0.8, COPPER_L);
  rivet(b, 6.4, -17.4, 0.8, COPPER_L);
  arcs(l, f);
}
