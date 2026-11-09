// The pieces of Glass Cathedral's near layer (parallax-glass-near.js): shards of stained glass lying on the floor in dim
// jewel colours (flat slivers, a few standing ones, a fallen pane still in its lead, a scatter over the flags in front),
// an iron candle stand with a dish of candles and small warm flames, and pools of coloured light. The stump of
// carved stone is in parallax-glass-near-stump.js. This layer lies behind the player's zone: it is the darkest,
// nothing in it is bright or sharp-edged enough to pass for a bullet, and its flames are small, warm and dim.
// Deterministic from `rng`.
import { rgba, mix, rad } from './sprites.js';
import { TAU } from '../core/math.js';
import { lamp, JEWEL, LEAD } from './parallax-glass-kit.js';

const DIM = [JEWEL.ruby, JEWEL.sapphire, JEWEL.amethyst, JEWEL.amber, JEWEL.emerald, JEWEL.rose, JEWEL.cobalt];

// A shard lying on the floor at (x, fy): a thin quadrilateral at a slight angle, in a jewel dimmed toward the floor.
function sliver(g, rng, L, x, fy, c) {
  const [len, th, a] = [10 + rng() * 26, 2 + rng() * 4, (rng() - 0.5) * 0.5];
  const [ux, uy] = [Math.cos(a) * len, Math.sin(a) * len];
  g.beginPath();
  g.moveTo(x, fy - th);
  g.lineTo(x + ux * 0.8, fy - th + uy - rng() * 2);
  g.lineTo(x + ux, fy + uy * 0.4);
  g.lineTo(x + ux * 0.2, fy + th * 0.3);
  g.closePath();
  g.fillStyle = rgba(mix(L.color, c, 0.5), 0.78);
  g.fill();
  g.strokeStyle = rgba('#ffffff', 0.1);
  g.lineWidth = 0.9;
  g.beginPath();
  g.moveTo(x, fy - th);
  g.lineTo(x + ux * 0.8, fy - th + uy);
  g.stroke();
}

// A cluster of n shards round x on the floor, and now and then one standing, leaning, a sharp triangle.
export function shards(g, rng, L, x, floor, n, spread, standing = 0) {
  for (let i = 0; i < n; i++) {
    const sx = x + (rng() - 0.5) * spread;
    sliver(g, rng, L, sx, floor(sx) + rng() * 8, DIM[Math.floor(rng() * DIM.length)]);
  }
  for (let i = 0; i < standing; i++) {
    const [sx, h, lean] = [x + (rng() - 0.5) * spread * 0.7, 14 + rng() * 22, (rng() - 0.5) * 18];
    const fy = floor(sx) + 3;
    g.beginPath();
    g.moveTo(sx - 5, fy);
    g.lineTo(sx + lean, fy - h);
    g.lineTo(sx + 6 + rng() * 3, fy);
    g.closePath();
    g.fillStyle = rgba(mix(L.color, DIM[Math.floor(rng() * DIM.length)], 0.42), 0.8);
    g.fill();
    g.strokeStyle = rgba('#ffffff', 0.12);
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(sx - 5, fy);
    g.lineTo(sx + lean, fy - h);
    g.stroke();
  }
}

// Shards strewn over the flags of the floor in front: n flat slivers between y0 and y1, foreshortened (a few px thick), tilted a
// little, in jewels dimmed toward the floor; the further from the horizon the larger.
export function strewn(g, rng, L, w, y0, y1, n) {
  for (let i = 0; i < n; i++) {
    const [x, u] = [rng() * w, rng()];
    const y = y0 + (y1 - y0) * u;
    const k = 0.6 + u * 0.9;
    const [len, th, a] = [(7 + rng() * 17) * k, (1.6 + rng() * 2.6) * k, (rng() - 0.5) * 0.7];
    const c = DIM[Math.floor(rng() * DIM.length)];
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len * 0.7, y - th + a * 6);
    g.lineTo(x + len, y + th * 0.3);
    g.lineTo(x + len * 0.3, y + th);
    g.closePath();
    g.fillStyle = rgba(mix(L.color, c, 0.38), 0.72);
    g.fill();
  }
}

// A pane that fell whole and leans on a block: a slanted rectangle of dim lozenges in lead.
export function pane(g, rng, L, x, fy, w, h, c) {
  g.save();
  g.translate(x, fy);
  g.rotate(-0.26);
  g.fillStyle = L.color;
  g.fillRect(-w / 2 - 3, -h - 3, w + 6, h + 3);
  g.beginPath();
  g.rect(-w / 2, -h, w, h);
  g.clip();
  g.fillStyle = rgba(mix(L.color, c, 0.42), 0.9);
  g.fillRect(-w / 2, -h, w, h);
  g.strokeStyle = rgba(LEAD, 0.75);
  g.lineWidth = 1;
  g.beginPath();
  for (let i = -h; i < w + h; i += 12) {
    g.moveTo(-w / 2 + i, -h);
    g.lineTo(-w / 2 + i - h, 0);
    g.moveTo(-w / 2 + i - h, -h);
    g.lineTo(-w / 2 + i, 0);
  }
  g.stroke();
  g.restore();
}

// An iron candle stand at x on the floor y: three splayed feet, a stem with two knops, a shallow dish and `n` candles
// with a small flame each. One dim warm light over the whole dish.
export function stand(g, out, rng, L, x, y, h, n = 4) {
  const top = y - h;
  g.save();
  g.strokeStyle = '#06030f';
  g.lineCap = 'round';
  g.lineWidth = 3;
  g.beginPath();
  for (const dx of [-16, 0, 16]) {
    g.moveTo(x + dx * 0.9, y + (dx ? 0 : 3));
    g.quadraticCurveTo(x + dx * 0.4, y - h * 0.18, x, y - h * 0.46);
  }
  g.moveTo(x, y - h * 0.46);
  g.lineTo(x, top + 4);
  g.stroke();
  g.fillStyle = '#06030f';
  for (const k of [0.62, 0.78]) {
    g.beginPath();
    g.arc(x, y - h * k, 3.6, 0, TAU);
    g.fill();
  }
  g.beginPath();
  g.moveTo(x - 24, top - 4);
  g.quadraticCurveTo(x, top + 10, x + 24, top - 4);
  g.lineTo(x + 20, top - 7);
  g.quadraticCurveTo(x, top + 2, x - 20, top - 7);
  g.closePath();
  g.fill();
  g.restore();
  for (let i = 0; i < n; i++) {
    const [cx, ch] = [x + (i - (n - 1) / 2) * 11, 12 + rng() * 9];
    g.fillStyle = rgba('#c8b0b8', 0.5);
    g.fillRect(cx - 2, top - 6 - ch, 4, ch);
    g.beginPath();
    g.moveTo(cx - 1.6, top - 6 - ch);
    g.quadraticCurveTo(cx - 2.4, top - 11 - ch, cx, top - 16 - ch);
    g.quadraticCurveTo(cx + 2.4, top - 11 - ch, cx + 1.6, top - 6 - ch);
    g.fillStyle = rgba('#ffaa66', 0.62);
    g.fill();
  }
  lamp(out, x, top - 20, 22, '#ffa860', 'flicker', rng(), 0.24);
}

// A light of coloured glass lying on the floor as a soft pool: very faint.
export function pool(g, x, y, w, c, a) {
  g.save();
  g.globalAlpha = a;
  g.fillStyle = rad(g, x, y, 0, w / 2, [[0, rgba(c, 0.9)], [1, rgba(c, 0)]]);
  g.translate(x, y);
  g.scale(1, 0.16);
  g.beginPath();
  g.arc(0, 0, w / 2, 0, TAU);
  g.translate(-x, -y);
  g.fill();
  g.restore();
}
