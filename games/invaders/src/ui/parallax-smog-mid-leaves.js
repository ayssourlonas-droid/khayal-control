// The green that comes back to World 17's mid layer (the 'over' pass, parallax-smog-mid-green.js): leaf blobs (a few
// overlapping circles, so a cluster reads as foliage and not a ball), the crown of a tree grown by parallax-smog-mid-tree.js
// (clusters at the twig tips and limbs in three passes: shade, body, sun side; then bright leaves on top), a shrub, a
// patch of ivy (small leaves on a few wandering stems, denser at the foot), and a sprinkle of flowers. Greens are fresh
// and a little muted; flowers are cream, soft yellow and pale blue, tiny: never the bullets' hot pink. Each takes an rng.
import { seeded } from './parallax-smog-kit.js';
import { rgba, mix } from './sprites.js';

export const LEAF = { dark: '#1f4a2c', mid: '#2f6a3a', lit: '#4c9446', hi: '#86c566', warm: '#a8d070' };
export const BLOOM = ['#f4f0e0', '#f2d77a', '#9ab8e8'];

export function blob(g, r, x, y, s, c, a) {
  g.fillStyle = rgba(c, a);
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const [dx, dy, rr] = [(r() - 0.5) * s * 1.1, (r() - 0.5) * s * 0.8, s * (0.42 + r() * 0.3)];
    g.moveTo(x + dx + rr, y + dy);
    g.arc(x + dx, y + dy, rr, 0, 6.3);
  }
  g.fill();
}

// Three passes over the spots [[x, y, size, tone]]: a shadow below, the body, the sunlit side up and to the right.
function layers(g, r, spots) {
  for (const [x, y, s] of spots) blob(g, r, x - 2, y + s * 0.28, s * 1.05, LEAF.dark, 0.95);
  for (const [x, y, s] of spots) blob(g, r, x, y, s, LEAF.mid, 0.95);
  for (const [x, y, s] of spots) blob(g, r, x + s * 0.22, y - s * 0.24, s * 0.7, LEAF.lit, 0.92);
  for (const [x, y, s, k] of spots) if (k < 0.7) blob(g, r, x + s * 0.34, y - s * 0.38, s * 0.4, mix(LEAF.hi, LEAF.warm, k), 0.85);
  g.fillStyle = rgba(LEAF.hi, 0.7);
  for (const [x, y, s] of spots) g.fillRect(x + (r() - 0.3) * s, y - r() * 0.9 * s, 2.2, 1.6);
}

// The crown of the tree t (parallax-smog-mid-tree.js): clusters at its twig tips and along its limbs.
export function crown(g, t, scale = 1) {
  const r = seeded(t.seed + 500);
  const limbs = t.segs.filter((s) => s[5] >= 2 && s[5] <= 4).map(([x0, y0, x1, y1, , d]) => [(x0 + x1) / 2, (y0 + y1) / 2, d]);
  layers(g, r, [...t.tips, ...limbs].map(([x, y]) => [x, y, (11 + r() * 10) * scale, r()]));
}

// A shrub standing on y at x, w wide and h tall.
export function shrub(g, r, x, y, w, h) {
  const n = Math.max(2, Math.round(w / 9));
  const spots = [];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const s = h * (0.5 + 0.4 * Math.sin(u * 3.1) + r() * 0.15);
    spots.push([x + u * w, y - s * 0.55, s * 0.62, r()]);
  }
  layers(g, r, spots);
}

// Ivy over a wall patch: n leaves scattered in the box, denser toward its foot, on a few wandering stems.
export function ivyPatch(g, r, x, y, w, h) {
  g.save();
  g.strokeStyle = rgba(LEAF.dark, 0.9);
  g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i < 4; i++) {
    let [px, py] = [x + r() * w, y + h];
    g.moveTo(px, py);
    for (let k = 0; k < 7; k++) {
      px += (r() - 0.5) * 10;
      py -= h / 7;
      g.lineTo(Math.min(x + w, Math.max(x, px)), py);
    }
  }
  g.stroke();
  const tones = [LEAF.dark, LEAF.mid, LEAF.mid, LEAF.lit, LEAF.hi];
  for (let i = 0, n = Math.floor((w * h) / 14); i < n; i++) {
    const u = r() ** 0.8;
    const side = (r() + r() + r()) / 3; // leaves thin toward the sides and the top
    g.fillStyle = rgba(tones[Math.floor(r() * tones.length)], 0.95);
    g.beginPath();
    g.ellipse(x + side * w, y + h - u * h * (0.5 + 0.5 * Math.sin(side * 3.1)), 3.4, 2.1, r() * 3.1, 0, 6.3);
    g.fill();
  }
  g.restore();
}

// n small flowers at random places in the box (2 px dots in cream, soft yellow or pale blue).
export function flowers(g, r, x, y, w, h, n) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = rgba(BLOOM[Math.floor(r() * BLOOM.length)], 0.9);
    g.fillRect(x + r() * w, y + r() * h, 2, 2);
  }
}
