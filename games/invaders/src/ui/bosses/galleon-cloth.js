// The Thunder Galleon's sailcloth (World 13, Sunset Armada; galleon-sails.js paints a sail with these): a mend,
// the red thunderbolt of a course, the rayed sun of a topsail and the cloths a sail is sewn from, each with
// its stitching. Bake-time only.
import { path, ink, line, lin, rgba, shade } from './kit.js';
import { CREAM, RED, circle } from './galleon-kit.js';
import { IN } from './galleon-rig.js';

const MENDS = [[RED, CREAM], ['#d6b878', '#6a4420'], [RED, CREAM], ['#e8b04a', '#6a3a10']];

// A mend: a slightly crooked piece of cloth, outlined, stitched round the inside.
export function patch(g, x, y, w, h, tilt, kind) {
  const [fill, stitch] = MENDS[kind];
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  g.beginPath();
  g.rect(-w / 2, -h / 2, w, h);
  ink(g, lin(g, 0, -h / 2, 0, h / 2, [[0, shade(fill, 0.25)], [1, shade(fill, -0.3)]]), 1.2);
  g.beginPath();
  g.rect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
  g.setLineDash([2, 1.6]);
  line(g, rgba(stitch, 0.85), 0.8);
  g.setLineDash([]);
  g.restore();
}

// The thunderbolt: a red zigzag with a cream edge and an ink line outside that.
export function bolt(g, x, y, k) {
  const zig = [[0, -17], [11, -17], [4, -3], [12, -3], [-6, 18], [-1, 3], [-9, 3]].map(([bx, by]) => [x + bx * k, y + by * k]);
  path(g, zig);
  line(g, '#1a0a0a', 4.6);
  line(g, CREAM, 3);
  g.fillStyle = RED;
  g.fill();
  path(g, zig.slice(0, 3));
  g.fillStyle = rgba('#ffffff', 0.22);
  g.fill();
}

// A rayed sun: a red disc with a cream ring and twelve rays.
export function sun(g, x, y, r) {
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    path(g, [[x + Math.cos(a - 0.13) * r, y + Math.sin(a - 0.13) * r], [x + Math.cos(a) * r * 1.65, y + Math.sin(a) * r * 1.65], [x + Math.cos(a + 0.13) * r, y + Math.sin(a + 0.13) * r]]);
    g.fillStyle = RED;
    g.fill();
    line(g, '#1a0a0a', 0.9);
  }
  circle(g, x, y, r);
  ink(g, RED, 1.4);
  circle(g, x, y, r * 0.62);
  line(g, CREAM, 1.4);
}

export function cloths(g, t, s, y) {
  for (let k = 0; k <= 11; k++) { // each cloth a shade of its own, the seams stitched either side
    const [u0, u1] = [k / 11, (k + 1) / 11];
    const pos = (u, row) => s * (IN + ((row ? t.foot : t.top) - IN) * u);
    if (k < 11) {
      path(g, [[pos(u0, 0), y], [pos(u1, 0), y], [pos(u1, 1), y + t.h], [pos(u0, 1), y + t.h]]);
      g.fillStyle = rgba(k % 2 ? '#ffffff' : '#5a3a1c', 0.07);
      g.fill();
    }
    path(g, [[pos(u0, 0), y], [pos(u0, 1), y + t.h]], true);
    line(g, rgba('#5a3a1c', 0.5), 1.3);
    g.save();
    g.translate(1.6, 0);
    g.setLineDash([2.4, 2]);
    line(g, rgba('#6a4420', 0.55), 0.7);
    g.restore();
    g.setLineDash([]);
  }
}

