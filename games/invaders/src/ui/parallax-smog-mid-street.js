// The street furniture and the gaps of World 17's mid layer: wooden utility poles (a tapering pole, a crossarm with glass
// insulators, a diagonal brace, one with a transformer can) joined by wires that sag across the gaps and over the
// roofs; the bus shelter (a slim roof on posts, glass panels with a glint, a bench, a blank info panel, a stop pole
// with a plain round disc); and the vacant lot, where a house was pulled down: the torn party wall it leaves with the
// ghosts of floors (patches of old wallpaper, a fireplace and its chimney breast, rows of joist holes), a heap of rubble
// with bricks, beams and a barrel, and a hoarding of plain boards along the front. Nothing is lettered. The palette
// colours everything, so smog and morning share every shape.
import { box, poly, fade, strokes, speckle, seeded, wire } from './parallax-smog-kit.js';
import { rgba } from './sprites.js';

export function pole(g, P, x, base, h, can = false) {
  const top = base - h;
  poly(g, [[x - 3.2, base], [x - 2, top], [x + 2, top], [x + 3.4, base]]);
  g.fillStyle = P.wood;
  g.fill();
  box(g, P.woodHi, x + 1, top, 1, h, 0.4);
  box(g, P.edge, x + 1.6, top, 0.9, h, P.edgeA * 0.6);
  box(g, P.wood, x - 17, top + 8, 34, 3.4); // crossarm
  box(g, P.edge, x - 17, top + 8, 34, 0.9, P.edgeA * 0.6);
  strokes(g, P.wood, 1.6, [[x - 11, top + 28, x - 3, top + 11], [x + 11, top + 28, x + 3, top + 11]]);
  for (const ix of [-14, 0, 14]) {
    box(g, P.trim, x + ix - 1.4, top + 3, 2.8, 5.6);
    box(g, P.edge, x + ix + 0.5, top + 3, 0.9, 5, P.edgeA * 0.7);
  }
  if (can) {
    box(g, P.iron, x + 4, top + 34, 11, 19);
    box(g, P.edge, x + 13, top + 34, 1.4, 19, P.edgeA * 0.7);
    box(g, P.trim, x + 3, top + 32, 13, 3);
  }
  return [[x - 14, top + 3], [x, top + 3], [x + 14, top + 3]];
}

// Three wires from the arms of one pole to the next, sagging by their own amounts.
export function wires(g, P, a, b, sag) {
  for (let i = 0; i < 3; i++) wire(g, rgba(P.iron, 0.8), a[i][0], a[i][1], b[i][0], b[i][1], sag + i * 1.6 - 2, 1.1);
}

export function shelter(g, P, x, base) {
  const [w, h] = [84, 52];
  fade(g, x, base - h, w, h, [[0, rgba(P.glassTop, 0.95)], [1, rgba(P.glassBot, 0.95)]]);
  poly(g, [[x + 12, base - 6], [x + 42, base - h + 2], [x + 54, base - h + 2], [x + 24, base - 6]]); // a glint across the glass
  g.fillStyle = rgba(P.glint, P.glintA * 0.9);
  g.fill();
  box(g, P.iron, x - 2, base - h - 5, w + 8, 5); // roof
  box(g, P.edge, x - 2, base - h - 5, w + 8, 1.2, P.edgeA * 0.8);
  box(g, P.dust, x - 2, base - h - 6, w + 8, 1.2, P.dustA);
  for (const px of [x, x + w - 2]) box(g, P.iron, px, base - h, 3, h);
  box(g, P.edge, x + w, base - h, 1, h, P.edgeA * 0.7);
  box(g, P.iron, x + 10, base - 17, 46, 3); // the bench
  box(g, P.iron, x + 12, base - 14, 2.4, 14);
  box(g, P.iron, x + 52, base - 14, 2.4, 14);
  box(g, P.iron, x + w + 12, base - h, 3, h + 24, 1); // the stop pole and its plain disc
  g.save();
  g.beginPath();
  g.arc(x + w + 13.5, base - h - 5, 9, 0, 6.3);
  g.fillStyle = P.panel;
  g.fill();
  g.strokeStyle = P.iron;
  g.lineWidth = 1.6;
  g.stroke();
  g.restore();
  box(g, P.iron, x + 62, base - 46, 17, 28); // the info panel: blank
  box(g, P.panel, x + 64, base - 44, 13, 24);
  box(g, P.panelB, x + 64, base - 36, 13, 5, 0.4);
}

// A heap of rubble on the ground y at x, w wide: a mound, bricks and boards poking out, a barrel.
function rubble(g, P, r, x, y, w) {
  poly(g, [[x, y], [x + w * 0.18, y - 18], [x + w * 0.4, y - 34], [x + w * 0.62, y - 26], [x + w * 0.8, y - 14], [x + w, y]]);
  g.fillStyle = P.walls[1];
  g.fill();
  speckle(g, r, x, y - 34, w, 34, 180, [P.shade, P.edge, P.dust], 0.4, 2.4);
  for (let i = 0; i < 28; i++) {
    const u = r();
    g.save();
    g.translate(x + 6 + u * (w - 14), y - 4 - r() * 28 * Math.sin(u * 3.1));
    g.rotate((r() - 0.5) * 1.2);
    box(g, P.brickWalls[i % 3], -4.5, -2, 9, 4.2);
    box(g, P.edge, -4.5, -2, 9, 0.9, P.edgeA * 0.7);
    g.restore();
  }
  strokes(g, P.wood, 3.4, [[x + w * 0.28, y - 14, x + w * 0.58, y - 42], [x + w * 0.46, y - 12, x + w * 0.86, y - 28]]);
  strokes(g, rgba(P.edge, P.edgeA * 0.8), 0.9, [[x + w * 0.29, y - 15.6, x + w * 0.59, y - 43.6]]);
  box(g, P.iron, x + w * 0.7, y - 28, 12, 17); // a barrel
  box(g, P.edge, x + w * 0.7 + 10, y - 28, 1.4, 17, P.edgeA * 0.7);
  box(g, P.trim, x + w * 0.7 - 1, y - 23, 14, 1.4, 0.6);
  box(g, P.trim, x + w * 0.7 - 1, y - 16, 14, 1.4, 0.6);
}

// What is left of the house: a torn wall of three floors, the roof's steps cut into its top, a chimney stack on the high end.
function ghost(g, P, r, x, base) {
  const [w, top] = [70, base - 232];
  poly(g, [[x, base], [x, top + 12], [x + 8, top + 8], [x + 12, top - 6], [x + 22, top + 14], [x + 28, top + 40], [x + 38, top + 36], [x + 44, top + 62], [x + 54, top + 58], [x + 60, top + 90], [x + w, top + 96], [x + w, base]]);
  g.fillStyle = P.walls[0];
  g.fill();
  g.save();
  g.clip();
  speckle(g, r, x, top - 10, w, base - top, 260, [P.shade, P.edge, P.dust], 0.2);
  for (let k = 0; k < 3; k++) {
    const y = top + 52 + k * 50;
    const c = [P.panelB, P.board, P.walls[4]][k];
    box(g, c, x + 4, y, 36, 40, 0.55); // faded wallpaper, a stripe at a time
    for (let sx = x + 6; sx < x + 40; sx += 6) box(g, P.shade, sx, y, 1, 40, 0.15);
    box(g, P.iron, x + 46, y + 22, 13, 18, 0.8); // the fireplace under its mantel
    box(g, P.trim, x + 44, y + 19, 17, 3.4, 0.9);
    box(g, P.shade, x + 42, y - 30, 20, 70, 0.14); // the chimney breast
    for (let jx = x + 3; jx < x + w; jx += 8) box(g, P.iron, jx, y + 41, 4.4, 3.4, 0.85); // joist holes
    box(g, P.sill, x, y + 44, w, 2.4, 0.6);
  }
  strokes(g, rgba(P.shade, 0.5), 5, [[x + 6, base - 4, x + 34, top + 100]]); // the ghost of a stair
  fade(g, x, top, w, base - top, [[0, rgba(P.shade, 0)], [0.6, rgba(P.shade, P.shadeA * 0.4)], [1, rgba(P.shade, P.shadeA)]]);
  box(g, P.edge, x + w - 1.4, top + 90, 1.4, base - top, P.edgeA * 0.7);
  g.restore();
  box(g, P.walls[0], x + 2, top - 24, 12, 32); // the stack
  box(g, P.edge, x + 12, top - 24, 1.6, 32, P.edgeA * 0.8);
  box(g, P.trim, x, top - 27, 16, 4);
}

// The vacant lot between x0 and x1 on the ground y: the torn wall, the rubble, a chain-link fence along the front.
export function lot(g, P, x0, x1, base) {
  const r = seeded(77);
  ghost(g, P, r, x0 + 2, base);
  rubble(g, P, r, x0 + 70, base, x1 - x0 - 76);
  const mesh = [];
  for (let x = x0 + 2; x < x1 - 14; x += 9) mesh.push([x, base - 26, x + 13, base], [x + 13, base - 26, x, base]);
  strokes(g, rgba(P.iron, 0.34), 0.7, mesh);
  strokes(g, P.iron, 1.8, [[x0 + 2, base - 27, x1 - 2, base - 27]]);
  for (let x = x0 + 2; x <= x1; x += 44) box(g, P.iron, x, base - 31, 2.2, 31);
}
