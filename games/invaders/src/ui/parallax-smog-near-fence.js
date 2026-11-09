// The park fence of World 17's near layer: a low plinth wall of stone blocks with a coping, iron railings above it (a
// round bar every 11 px with a spear-point finial and a collar, a rail near the top and one near the foot, a thicker post
// every fourth bar with a ball), a bar or two missing or bent, and the stone piers that end each section with a cap and a ball. The
// earth behind the railings (a band of bare soil with dry tufts: the park, until the green returns) is `earth`. All of it
// is dark and low in contrast (the iron is near-black with a thin light edge); the player's bullets are read against it.
import { box, poly, strokes, speckle } from './parallax-smog-kit.js';
import { rgba, mix, rad } from './sprites.js';
import { Y, FENCE, SECTIONS, PIERS } from './parallax-smog-near-plan.js';

export function earth(g, P, r, w) {
  box(g, P.soil, 0, Y.soil, w, Y.pave - Y.soil);
  speckle(g, r, 0, Y.soil, w, Y.pave - Y.soil, 500, [P.joint, P.tuft, P.edge], 0.22, 2);
  const blades = [];
  for (let x = 0; x < w; x += 6 + r() * 9) {
    const [y, h, lean] = [Y.soil + 3 + r() * 6, 7 + r() * 12, (r() - 0.5) * 8];
    blades.push([x, y, x + lean, y - h], [x + 2, y, x + 2 + lean * 1.4, y - h * 0.8], [x - 2, y, x - 2 + lean * 0.5, y - h * 0.7]);
  }
  strokes(g, rgba(P.tuft, 0.8), 1, blades);
}

function plinth(g, P, r, x0, x1) {
  const [y, h] = [FENCE.base, FENCE.plinth];
  box(g, P.plinth, x0, y, x1 - x0, h);
  for (let x = x0 + r() * 30; x < x1; x += 44 + r() * 30) box(g, P.joint, x, y + 3, 1.1, h - 3, 0.7);
  box(g, P.plinthHi, x0 - 1, y - 1, x1 - x0 + 2, 4); // coping
  box(g, P.edge, x0 - 1, y - 1, x1 - x0 + 2, 1.1, P.edgeA * 0.7);
  box(g, P.joint, x0, y + 3, x1 - x0, 1.1, 0.5);
}

export function railings(g, P, r, x0, x1) {
  plinth(g, P, r, x0, x1);
  const [top, base] = [FENCE.top, FENCE.base];
  const bars = [];
  const tips = [];
  const posts = [];
  let i = 0;
  for (let x = x0 + 6; x < x1 - 3; x += 11, i++) {
    const d = r();
    if (d < 0.05) continue; // a bar gone
    const lean = d < 0.1 ? (r() - 0.5) * 16 : 0; // a bar bent
    if (i % 4 === 0) posts.push([x, base, x, top - 2]);
    else tips.push([x + lean, top + 4]);
    bars.push([x, base, x + lean, top + 4]);
  }
  strokes(g, P.iron, 2.6, bars);
  strokes(g, P.iron, 4.2, posts);
  strokes(g, rgba(P.ironHi, 0.55), 0.9, bars.map(([a, b, c, d]) => [a + 1.2, b, c + 1.2, d]));
  box(g, P.iron, x0, top + 14, x1 - x0, 3.4); // rails
  box(g, P.iron, x0, base - 14, x1 - x0, 3.4);
  box(g, P.ironHi, x0, top + 14, x1 - x0, 0.9, 0.55);
  box(g, P.ironHi, x0, base - 14, x1 - x0, 0.9, 0.55);
  g.fillStyle = P.iron;
  for (const [x, y] of tips) { // spear points with a collar
    poly(g, [[x - 3.4, y + 3], [x, y - 9], [x + 3.4, y + 3]]);
    g.fill();
    g.fillRect(x - 3.2, y + 3, 6.4, 2);
  }
  for (const [x, , , y] of posts) {
    g.beginPath();
    g.arc(x, y - 3, 3.6, 0, 6.3);
    g.fill();
  }
  strokes(g, rgba(P.ironHi, 0.55), 0.9, posts.map(([a, b, c, d]) => [a + 1.6, b, c + 1.6, d]));
}

export function pier(g, P, x) {
  const [w, y, top] = [34, FENCE.base + FENCE.plinth, FENCE.top - 30];
  box(g, P.plinth, x - w / 2, top, w, y - top);
  for (let yy = top + 12; yy < y; yy += 12) box(g, P.joint, x - w / 2, yy, w, 1.1, 0.6);
  box(g, P.plinthHi, x - w / 2 - 4, top - 5, w + 8, 7); // the cap
  box(g, P.edge, x - w / 2 - 4, top - 5, w + 8, 1.2, P.edgeA * 0.7);
  box(g, P.plinthHi, x - w / 2 - 3, y - 12, w + 6, 12); // the base
  box(g, P.edge, x + w / 2 - 1.4, top + 2, 1.4, y - top - 2, P.edgeA * 0.55);
  box(g, P.joint, x - w / 2, top + 2, 4, y - top - 2, 0.25);
  g.beginPath();
  g.arc(x, top - 13, 10, 0, 6.3);
  g.fillStyle = rad(g, x, top - 13, 0, 11, [[0, mix(P.plinth, P.edge, P.edgeA * 0.5)], [0.6, P.plinth], [1, mix(P.plinth, '#000000', 0.4)]], x + 4, top - 17);
  g.fill();
  box(g, P.joint, x - 5, top - 4, 10, 1.2, 0.6);
}

export function fence(g, P, r) {
  for (const [a, b] of SECTIONS) railings(g, P, r, a, b);
  for (const x of PIERS) pier(g, P, x);
}
