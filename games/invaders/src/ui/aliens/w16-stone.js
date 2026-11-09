// World 16, Glass Cathedral, the gargoyle's carved stone (see w16-4.js): the head with its heavy brow, glowing
// eyes, snout and fangs, a jewel in the forehead; two pointed ears and two horns that curl out and up; round
// stone limbs shaded like cylinders (a dark
// edge, the body colour, a lighter stripe upper-left) and the claws that end them. Stone is pale violet-grey,
// grained lightly and rimmed with dawn on its upper-left edges; the face is kept smooth so the game's cracks
// read. Lights: the eyes and the forehead jewel.
import { path, ink, lin, rad, rgba, shade, mix, bez, line, ellipse, circle, stoneFill, grain, star4, eye, spark, LEAD, SLATE, DAWN } from './w16-kit.js';

// A round limb of stone from (x0, y0) to (x1, y1), w thick: cylinder shading by three passes of line.
export function limb(g, x0, y0, x1, y1, w, c) {
  for (const [dx, dy, k, ww] of [[0, 0, 0, w + 2.6], [0.3, 0.4, -0.2, w], [-0.5, -0.6, 0.12, w * 0.7], [-1, -1.4, 0.45, w * 0.28]]) {
    g.beginPath();
    g.moveTo(x0 + dx, y0 + dy);
    g.lineTo(x1 + dx, y1 + dy);
    line(g, k === 0 ? LEAD : k < 0 ? mix(c, SLATE, 0.6) : k < 0.2 ? c : rgba(shade(c, k), 0.8), ww);
  }
}

// n claws fanning from (x, y), pointing along angle a (radians, y down), len long, spread apart by gap.
export function claws(g, x, y, a, n, len, gap, c) {
  for (let i = 0; i < n; i++) {
    const aa = a + (i - (n - 1) / 2) * gap;
    const [cx, cy, nx, ny] = [Math.cos(aa), Math.sin(aa), -Math.sin(aa), Math.cos(aa)];
    const [bx, by] = [x + cx * 3, y + cy * 3];
    path(g, [[bx + nx * 2.7, by + ny * 2.7], [x + cx * len, y + cy * len], [bx - nx * 2.7, by - ny * 2.7]]);
    ink(g, lin(g, bx - nx * 2, by - ny * 2, bx + nx * 2, by + ny * 2, [[0, shade(c, 0.6)], [1, mix(c, LEAD, 0.4)]]), 1.3);
  }
}

const HY = -20; // the head's centre

// A horn on side m from the brow curling out and up, tapering to a point, ringed.
function horn(g, m, c) {
  const outer = bez([m * 4.6, HY - 9], [m * 8, HY - 18], [m * 20, HY - 15], [m * 23, HY - 24], 12);
  const inner = bez([m * 12.4, HY - 6], [m * 15.6, HY - 11], [m * 20, HY - 10.6], [m * 23, HY - 24], 12);
  path(g, [...outer, ...inner.toReversed()]);
  ink(g, lin(g, m * 6, HY - 8, m * 22, HY - 24, [[0, shade(c, 0.4)], [0.5, c], [1, mix(c, SLATE, 0.8)]]), 2.2);
  for (const t of [3, 6, 9]) { // rings round the horn
    g.beginPath();
    g.moveTo(...outer[t]);
    g.lineTo(...inner[t]);
    line(g, rgba(LEAD, 0.4), 1);
  }
  path(g, outer.slice(1, 9), true);
  line(g, rgba(DAWN, m < 0 ? 0.7 : 0.3), 0.9);
}

// A pointed ear on side m behind the head.
function ear(g, m, c) {
  path(g, [[m * 10, HY - 4], [m * 21, HY - 12], [m * 18.4, HY + 4], [m * 12, HY + 3]]);
  ink(g, lin(g, m * 10, HY - 12, m * 20, HY + 4, [[0, shade(c, 0.3)], [1, mix(c, SLATE, 0.6)]]), 2);
  path(g, [[m * 12.4, HY - 3], [m * 18, HY - 8], [m * 16.4, HY + 1]]);
  g.fillStyle = rgba(LEAD, 0.4);
  g.fill();
}

// The head, upright and facing us: horns and ears behind it, a heavy brow, narrowed eyes that glow, a broad snout
// and a wide mouth with fangs; f makes the eyes burn brighter.
export function head(b, l, f, c, stone) {
  for (const m of [-1, 1]) {
    ear(b, m, stone);
    horn(b, m, stone);
  }
  b.beginPath();
  b.moveTo(-12.6, HY - 6);
  b.bezierCurveTo(-9, HY - 13, 9, HY - 13, 12.6, HY - 6);
  b.bezierCurveTo(14.8, HY + 2, 11.4, HY + 10, 6, HY + 12.4);
  b.lineTo(-6, HY + 12.4);
  b.bezierCurveTo(-11.4, HY + 10, -14.8, HY + 2, -12.6, HY - 6);
  b.closePath();
  ink(b, stoneFill(b, -14, HY - 13, 14, HY + 12, stone), 2.8);
  b.save();
  b.clip();
  grain(b, 34, 41, 0, HY, 13, 12, 0.2);
  for (const m of [-1, 1]) { // the brow: two heavy bones slanting down toward the nose, shadowed under
    path(b, [[m * 15.4, HY - 9], [m * 0.3, HY - 4.4], [m * 0.3, HY - 0.2], [m * 14.6, HY - 3.4]]);
    b.fillStyle = lin(b, 0, HY - 8, 0, HY - 0.4, [[0, shade(stone, 0.2)], [0.65, mix(stone, SLATE, 0.35)], [1, mix(stone, LEAD, 0.6)]]);
    b.fill();
    path(b, [[m * 15.4, HY - 3.4], [m * 0.3, HY - 0.2]], true);
    line(b, rgba(LEAD, 0.75), 1.4);
    path(b, [[m * 13, HY - 8.4], [m * 3, HY - 4.8]], true);
    line(b, rgba(DAWN, m < 0 ? 0.5 : 0.2), 0.9);
  }
  b.restore();
  for (const m of [-1, 1]) { // eyes, narrowed under the brow, slanting down toward the nose
    ellipse(b, m * 5.4, HY + 1.4, 3.6, 2, -m * 0.34);
    b.fillStyle = LEAD;
    b.fill();
    ellipse(b, m * 5.4, HY + 1.4, 2.6, 1.3, -m * 0.34);
    b.fillStyle = rad(b, m * 5.4, HY + 1.4, 0, 2.7, [[0, '#ffffff'], [0.5, shade(c, 0.6)], [1, c]]);
    b.fill();
    eye(l, m * 5.4, HY + 1.4, 1.4, c, 2.6 + f * 1.8);
  }
  path(b, [[-1.8, HY - 1], [1.8, HY - 1], [3.2, HY + 5], [-3.2, HY + 5]]); // the nose
  ink(b, stoneFill(b, -3, HY - 1, 3, HY + 5, shade(stone, 0.12)), 1.3);
  for (const m of [-1, 1]) {
    ellipse(b, m * 1.3, HY + 4, 0.8, 1.1);
    b.fillStyle = LEAD;
    b.fill();
  }
  b.beginPath(); // the mouth, wide and dark, with the fangs in it
  b.moveTo(-8.4, HY + 6.6);
  b.quadraticCurveTo(0, HY + 9.4, 8.4, HY + 6.6);
  b.quadraticCurveTo(0, HY + 12.6, -8.4, HY + 6.6);
  b.closePath();
  ink(b, LEAD, 1.2);
  for (const [x, up] of [[-4.4, 0], [4.4, 0], [-7, 1], [7, 1]]) { // upper fangs hang, lower tusks rise
    const [y0, y1] = up ? [HY + 9.2, HY + 6.4] : [HY + 7.6, HY + 11.2];
    path(b, [[x - 1.3, y0], [x + 1.3, y0], [x, y1]]);
    ink(b, '#efe8f6', 0.9);
  }
  star4(b, -8.4, HY - 9.6, 2.2, '#ffffff', 0.55);
  circle(b, 0, HY - 7.4, 1.9); // a jewel set in the forehead
  ink(b, rad(b, 0, HY - 7.4, 0.1, 2, [[0, '#ffffff'], [0.4, shade(c, 0.3)], [1, mix(c, '#12082a', 0.55)]], -0.5, HY - 8), 1);
  spark(l, 0, HY - 7.4, 0.8, c, 0.8);
}
