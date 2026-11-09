// The seabed under the drowned kingdom (far layer of Lantern Deep, see parallax-deep.js): three ridges, the
// farthest paler in the haze, the nearest in the layer colour, each a long slope running down to the right,
// with its crest feathered so the layer's rim of light (parallax.js) lies on it faintly, and the sea's
// growth standing on the crests: kelp strands, sea fans, tube sponges and boulders.
import { rgba } from './sprites.js';
import { waves, profile } from './parallax-kit.js';
import { ABYSS, GREEN, CORAL, PALE } from './parallax-deep-kit.js';

// The top edges (layer y at x) of the back, far and near ridges.
export function ridges(rng, w) {
  const [a, b, c] = [waves(rng, 3, 0.0049), waves(rng, 3, 0.0037), waves(rng, 4, 0.0041)];
  return {
    back: (x) => 352 + 14 * a(x) + 18 * (x / w),
    far: (x) => 390 + 20 * b(x) + 34 * (x / w),
    near: (x) => 446 + 22 * c(x) + 46 * (x / w),
  };
}

// A ridge filled to the foot of the layer: its first 8 px are laid down in four faint coats, so the crest
// is soft and the rim it throws is dim.
export function slope(g, w, h, top, color) {
  g.fillStyle = color;
  g.globalAlpha = 0.22;
  for (const k of [0, 2, 4, 6]) profile(g, w, h, (x) => top(x) + k, 6);
  g.globalAlpha = 1;
  profile(g, w, h, (x) => top(x) + 8, 6);
}

// Streaks of darker sediment down a slope and a few pale ripples of sand.
export function streaks(g, rng, w, top, n) {
  g.save();
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = rng() * (w - 90);
    const y = top(x) + 14 + rng() * 40;
    g.strokeStyle = rgba(i % 3 ? ABYSS : PALE, i % 3 ? 0.22 : 0.05);
    g.lineWidth = 1 + rng() * 2.4;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 18, y + 3 + rng() * 5, x + 30 + rng() * 50, y + 8 + rng() * 6);
    g.stroke();
  }
  g.restore();
}

// Strands of kelp standing up from (x, y): len tall, leaning and swaying.
function kelp(g, rng, x, y, len, color) {
  g.beginPath();
  for (let i = 0; i < 4; i++) {
    const [sx, l, lean] = [x + i * 2.6, len * (0.55 + rng() * 0.6), (rng() - 0.5) * 22];
    g.moveTo(sx, y + 3);
    g.bezierCurveTo(sx + lean, y - l * 0.35, sx - lean * 0.6, y - l * 0.7, sx + lean * 0.9, y - l);
  }
  g.strokeStyle = color;
  g.stroke();
}

// A sea fan: a fork of twigs spreading from a stalk, its tips beaded.
function fan(g, rng, x, y, len, color) {
  g.beginPath();
  g.moveTo(x, y + 2);
  g.lineTo(x, y - len * 0.3);
  for (let i = -3; i <= 3; i++) {
    g.moveTo(x, y - len * 0.3);
    g.quadraticCurveTo(x + i * len * 0.12, y - len * 0.65, x + i * len * 0.25, y - len * (0.8 + rng() * 0.2));
  }
  g.strokeStyle = color;
  g.stroke();
}

// A tube sponge: three open tubes of different heights.
function tubes(g, rng, x, y, len, color) {
  g.fillStyle = color;
  for (const dx of [-5, 0, 5]) {
    const hgt = len * (0.4 + rng() * 0.6);
    g.beginPath();
    g.moveTo(x + dx - 2.4, y + 2);
    g.lineTo(x + dx - 1.8, y - hgt);
    g.lineTo(x + dx + 1.8, y - hgt);
    g.lineTo(x + dx + 2.4, y + 2);
    g.fill();
  }
}

// Growth along a crest: a group about every 30 px, of a kind picked by luck. Kelp and fans are drawn thin and at
// 0.6 alpha (their rim of light would be loud at full strength); tints are the layer colour's.
export function growth(g, rng, w, top, colors, scale = 1) {
  g.save();
  g.lineCap = 'round';
  g.lineWidth = 1.3;
  g.globalAlpha = 0.6;
  for (let x = 10 + rng() * 20; x < w - 10; x += 22 + rng() * 34) {
    const [y, r, c] = [top(x) + 5, rng(), colors[Math.floor(rng() * colors.length)]];
    if (r < 0.45) kelp(g, rng, x, y, (34 + rng() * 60) * scale, c);
    else if (r < 0.7) fan(g, rng, x, y, (22 + rng() * 22) * scale, c);
    else if (r < 0.85) tubes(g, rng, x, y, (14 + rng() * 12) * scale, c);
    else {
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(x, y + 1, (7 + rng() * 9) * scale, (4 + rng() * 5) * scale, 0, Math.PI, 0);
      g.fill();
    }
  }
  g.restore();
}

// The colours growth comes in for a layer colour: sea green, coral rose, a little violet.
export const GROWTH = (tint) => [tint(GREEN, 0.2), tint(CORAL, 0.22), tint(GREEN, 0.12), tint('#b27cff', 0.2)];
