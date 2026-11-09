// The church of World 17's mid layer, the one tall landmark of the older streets: a long nave of stone with buttresses and
// three lancet windows under a slate roof, and beside it a square tower of three stages (a blank clock dial, a belfry of
// louvred openings, four corner pinnacles) crowned by an octagonal spire with two small spire windows, a weathervane
// cross and a ball. The spire's left facets are in the shade and the right ones catch the edge light; its dust (the
// ash) lies on every ledge. Standing on `yb`, the nave at x, the tower beside it, the spire's tip at y `tip`. The wall and the
// slates are the palette's; ivy and the leaves are the 'over' pass's (parallax-smog-mid-green.js). Nothing is lettered:
// the dial has ticks and two hands, no numerals.
import { box, poly, fade, speckle, strokes, seeded } from './parallax-smog-kit.js';
import { rgba } from './sprites.js';
import { lancet } from './parallax-smog-mid-window.js';

export const CHURCH = { x: 520, nave: 150, tower: 60, top: 190, belfry: 102, tip: 12 }; // layer px

function stone(g, P, r, x, y, w, h) {
  box(g, P.walls[3], x, y, w, h);
  speckle(g, r, x, y, w, h, Math.floor(w * h / 24), [P.shade, P.edge, P.dust], 0.2);
  for (let yy = y + 9; yy < y + h; yy += 9) box(g, P.shade, x, yy, w, 0.8, 0.12);
  fade(g, x, y, w, h, [[0, rgba(P.shade, 0.28)], [0.25, rgba(P.shade, 0)], [0.85, rgba(P.edge, 0)], [1, rgba(P.edge, P.edgeA * 0.5)]], true);
  box(g, P.edge, x + w - 1.4, y, 1.4, h, P.edgeA * 0.8);
}

function nave(g, P, r, c, yb) {
  const [x, w, y] = [c.x, c.nave, c.top];
  poly(g, [[x - 5, y + 2], [x + 14, y - 34], [x + w - 6, y - 34], [x + w + 4, y + 2]]); // roof
  g.fillStyle = P.roof;
  g.fill();
  for (let yy = y - 30; yy < y; yy += 4) box(g, P.shade, x + (yy - y) * -0.1 + 4, yy, w - 8, 0.9, 0.32);
  box(g, P.trim, x + 12, y - 36, w - 18, 3);
  box(g, P.edge, x + 12, y - 36, w - 18, 1, P.edgeA * 0.8);
  box(g, P.dust, x - 5, y + 1, w + 9, 1.2, P.dustA);
  strokes(g, rgba(P.edge, P.edgeA * 0.7), 1, [[x + w + 4, y + 2, x + w - 6, y - 34]]);
  stone(g, P, r, x, y, w, yb - y);
  box(g, P.trim, x - 3, y - 1, w + 6, 5);
  box(g, P.edge, x - 3, y - 1, w + 6, 1.2, P.edgeA * 0.8);
  box(g, P.shade, x, y + 4, w, 4, 0.3);
  for (const bx of [x + 2, x + 52, x + 100, x + w - 8]) { // buttresses, stepped
    box(g, P.walls[3], bx, y + 8, 9, yb - y - 8);
    box(g, P.trim, bx - 1, y + 54, 11, 3);
    box(g, P.edge, bx + 8, y + 8, 1.2, yb - y - 8, P.edgeA * 0.8);
    box(g, P.shade, bx, y + 8, 2.5, yb - y - 8, 0.2);
  }
  for (const wx of [x + 28, x + 76, x + 124]) lancet(g, P, wx, y + 30, 10, 62);
}

function belfry(g, P, c, x, w) {
  for (const lx of [x + w * 0.3, x + w * 0.7]) {
    const [hw, y0] = [6, c.belfry + 10];
    poly(g, [[lx - hw - 2, y0 + 38], [lx - hw - 2, y0 + 10], [lx, y0 - 5], [lx + hw + 2, y0 + 10], [lx + hw + 2, y0 + 38]]);
    g.fillStyle = P.trim;
    g.fill();
    poly(g, [[lx - hw, y0 + 38], [lx - hw, y0 + 10], [lx, y0 - 3], [lx + hw, y0 + 10], [lx + hw, y0 + 38]]);
    g.fillStyle = P.glassBot;
    g.fill();
    for (let yy = y0 + 4; yy < y0 + 38; yy += 4) box(g, P.trim, lx - hw, yy, hw * 2, 1.2, 0.8); // louvres
  }
}

function spire(g, P, c, x, w) {
  const [cx, yb] = [x + w / 2, c.belfry];
  poly(g, [[x - 2, yb], [cx - 3, c.tip + 14], [cx, c.tip + 6], [cx + 3, c.tip + 14], [x + w + 2, yb]]);
  g.fillStyle = P.roof;
  g.fill();
  poly(g, [[cx, c.tip + 6], [cx + 3, c.tip + 14], [x + w + 2, yb], [cx + 6, yb]]);
  g.fillStyle = rgba(P.edge, P.edgeA * 0.55); // the lit facet
  g.fill();
  poly(g, [[x - 2, yb], [cx - 3, c.tip + 14], [cx - 1, c.tip + 8], [x + 8, yb]]);
  g.fillStyle = rgba(P.shade, 0.35);
  g.fill();
  for (let yy = c.tip + 24; yy < yb; yy += 5) box(g, P.shade, cx - (yy - c.tip) * 0.34, yy, (yy - c.tip) * 0.68, 0.9, 0.25);
  for (const [yy, d] of [[c.tip + 52, 1], [c.tip + 74, -1]]) { // spire windows
    const sx = cx + d * 7;
    poly(g, [[sx - 5, yy + 11], [sx - 5, yy + 4], [sx, yy - 2], [sx + 5, yy + 4], [sx + 5, yy + 11]]);
    g.fillStyle = P.roof;
    g.fill();
    box(g, P.glassBot, sx - 2.4, yy + 3, 4.8, 8);
  }
  strokes(g, P.iron, 1.6, [[cx, c.tip + 8, cx, c.tip - 6], [cx - 4, c.tip - 2, cx + 4, c.tip - 2], [cx, c.tip + 1, cx + 5, c.tip + 2]]);
  g.beginPath();
  g.arc(cx, c.tip + 6, 2.2, 0, 6.3);
  g.fillStyle = P.trim;
  g.fill();
  for (const px of [x - 2, x + w - 4]) { // corner pinnacles
    box(g, P.walls[3], px, c.belfry - 14, 6, 16);
    poly(g, [[px - 1, c.belfry - 14], [px + 3, c.belfry - 28], [px + 7, c.belfry - 14]]);
    g.fillStyle = P.roof;
    g.fill();
  }
}

export function church(g, P, yb) {
  const [c, r] = [CHURCH, seeded(90)];
  nave(g, P, r, c, yb);
  const [x, w] = [c.x + c.nave, c.tower];
  stone(g, P, r, x, c.belfry, w, yb - c.belfry);
  belfry(g, P, c, x, w);
  box(g, P.trim, x - 3, c.belfry + 50, w + 6, 4);
  box(g, P.edge, x - 3, c.belfry + 50, w + 6, 1.2, P.edgeA * 0.7);
  box(g, P.dust, x - 3, c.belfry + 49, w + 6, 1.2, P.dustA);
  const [dx, dy] = [x + w / 2, c.belfry + 80]; // the clock dial: a blank face, ticks and two hands
  g.beginPath();
  g.arc(dx, dy, 13, 0, 6.3);
  g.fillStyle = P.trim;
  g.fill();
  g.beginPath();
  g.arc(dx, dy, 11, 0, 6.3);
  g.fillStyle = P.panel;
  g.fill();
  const ticks = [];
  for (let i = 0; i < 12; i++) ticks.push([dx + Math.cos(i * 0.5236) * 8.6, dy + Math.sin(i * 0.5236) * 8.6, dx + Math.cos(i * 0.5236) * 10.4, dy + Math.sin(i * 0.5236) * 10.4]);
  strokes(g, P.iron, 0.9, ticks);
  strokes(g, P.iron, 1.5, [[dx, dy, dx + 1, dy - 7.4], [dx, dy, dx + 5, dy + 2]]);
  spire(g, P, c, x, w);
  box(g, P.shade, x, c.belfry + 50, 3, yb - c.belfry - 50, 0.2);
}
