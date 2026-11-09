// The Crystal Wyrm's live extras (World 11, Aurora Kingdom; wyrm.js runs them): frost breath curling out
// of the maw, the eyes and gems burning, the crest flaring, light running out along the frill, snow
// blown off the glacier and, in the last phase, a blizzard of crystal shards circling the head. In boss
// coordinates; cached sprites only, nothing allocated per frame. The mist and the shards are opaque and
// drawn only in the boss's own pass (`own`): the darkness pass runs again over the aliens.
import { glow, soft, star, hash, cached, lin } from '../sprites.js';
import { TAU, smooth } from '../../core/math.js';
import { alive, glowAt } from './parts.js';
import { EYE } from './wyrm-head.js';
import { SPIKES, BASE_Y } from './wyrm-crest.js';
import { FIN_TIPS, HEAD } from './wyrm-body.js';
import { GREEN, VIOLET } from './wyrm-ice.js';

const spot = [0, 0, 0, 0]; // scratch for puff() and orbit(): no allocation per frame
const BREATH = 14;
const SHARDS = 32;
const ICE = '#5ad0ff';

// A shard of ice 40 px across, turned to one of eight angles: a long prism, translucent, lit on one face.
const frames = [];
const shardFrame = (n) => (frames[n & 7] ??= cached('wyrmShard' + (n & 7), 40, 40, (g) => {
  g.translate(20, 20);
  g.rotate(((n & 7) * Math.PI) / 8);
  const pts = [[0, -18], [6, -7], [6, 7], [0, 18], [-6, 7], [-6, -7]];
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fillStyle = lin(g, -6, -18, 6, 18, [[0, '#f4fcff'], [0.5, '#8ad0ff'], [1, '#3a78c8']]);
  g.fill();
  g.fillStyle = 'rgba(10,58,120,0.35)';
  g.beginPath();
  g.moveTo(0, -18);
  g.lineTo(6, -7);
  g.lineTo(6, 7);
  g.lineTo(0, 18);
  g.fill();
  g.strokeStyle = 'rgba(10,28,60,0.9)';
  g.lineWidth = 1.6;
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.7)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, -17);
  g.lineTo(0, 17);
  g.stroke();
}));

// Frost breath: puffs leaving the maw straight at the viewer, swelling as they come and drifting out to
// the sides and up in curls, a mist (own pass) with a cold light in it; and a little snow lifting off
// the glacier.
function puff(i, t, ph) { // where puff i is, in the scratch array: its offset from the mouth, its radius, how much of its life is left
  const u = (t * (0.34 + ph * 0.06) + i / BREATH) % 1;
  const side = i % 2 ? 1 : -1;
  spot[0] = side * (6 + 78 * u) + Math.sin(u * 7 + i * 1.7) * 9 * u;
  spot[1] = 18 - 46 * u + Math.cos(u * 6 + i) * 6 * u;
  spot[2] = 12 + 58 * u;
  spot[3] = 1 - u;
  return spot;
}

function breath(ctx, b, t, k, own) {
  const m = alive(b, 'maw');
  const ph = b.phase;
  const [ox, oy] = m ? [m.x - b.x, m.y - b.y] : [0, 0];
  if (own) {
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; m && i < BREATH; i++) {
      const [x, y, r, life] = puff(i, t, ph);
      ctx.globalAlpha = life * (0.5 + ph * 0.07) * Math.min(1, (1 - life) * 9);
      ctx.drawImage(soft('#e8f8ff'), ox + x - r, oy + y - r * 0.7, r * 2, r * 1.4);
    }
    for (let i = 0; i < 8; i++) { // snow lifting off the ice
      const u = (t * 0.1 + hash(i + 5)) % 1;
      ctx.globalAlpha = Math.sin(u * Math.PI) * 0.22;
      ctx.drawImage(soft('#eef8ff'), -330 + hash(i) * 660 + Math.sin(t * 0.5 + i) * 18 - 30, 84 - u * 70, 60, 36);
    }
  }
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; m && i < BREATH; i += 2) {
    const [x, y, r, life] = puff(i, t, ph);
    ctx.globalAlpha = k * life * (0.3 + ph * 0.05);
    ctx.drawImage(glow('#9fe0ff'), ox + x - r, oy + y - r, r * 2, r * 2);
  }
}

// The eyes and the gems, brighter with every phase; a flare turning in each gem from the second on.
function burn(ctx, b, t, k) {
  const ph = b.phase;
  const head = alive(b, 'head');
  for (let s = -1; head && s <= 1; s += 2) {
    const a = k * (0.2 + ph * 0.1) * (0.85 + 0.15 * Math.sin(t * 7 + s));
    glowAt(ctx, b, head, EYE, s * 31, -12, 16 + ph * 4, a);
    glowAt(ctx, b, head, '#ffffff', s * 31, -12, 6, a * 0.8);
  }
  for (const id of ['gemL', 'gemR']) {
    const g = alive(b, id);
    if (!g) continue;
    const s = id === 'gemL' ? 1 : -1;
    const pulse = 0.5 + 0.5 * Math.sin(t * (2.6 + ph * 1.4) + (s < 0 ? Math.PI : 0));
    glowAt(ctx, b, g, ICE, 0, 0, 58 + 14 * pulse + ph * 16, k * (0.3 + 0.12 * pulse + ph * 0.16));
    glowAt(ctx, b, g, '#ffffff', 0, 0, 13 + 6 * pulse, k * (0.4 + 0.2 * pulse));
    if (ph > 0) {
      ctx.save();
      ctx.translate(g.x - b.x, g.y - b.y);
      ctx.rotate(t * 0.7 * s);
      ctx.globalAlpha = k * 0.28 * ph;
      ctx.drawImage(star('#bff4ff'), -54, -54, 108, 108);
      ctx.restore();
    }
  }
}

// The crest flaring in the later phases: every spike's tip alight, a flash running along the row.
function flare(ctx, b, t, k) {
  const crest = alive(b, 'crest');
  if (!crest || b.phase < 1) return;
  SPIKES.forEach((s, i) => {
    const a = k * (0.16 + 0.2 * (0.5 + 0.5 * Math.sin(t * 5 - i * 0.7))) * b.phase;
    glowAt(ctx, b, crest, '#bff4ff', s.x + Math.sin(s.lean) * s.h, BASE_Y - Math.cos(s.lean) * s.h + 3, 16 + 4 * b.phase, a);
  });
}

// Light running out along each fin of the frill, aurora green and violet by turns.
function frill(ctx, t, k, ph) {
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < FIN_TIPS.length; i++) {
      const u = (t * (0.25 + ph * 0.12) + i * 0.17) % 1;
      const [tx, ty] = FIN_TIPS[i];
      ctx.globalAlpha = k * Math.sin(u * Math.PI) * 0.65;
      ctx.drawImage(glow((i + (s > 0 ? 1 : 0)) % 2 ? GREEN : VIOLET), s * (HEAD[0] + (tx - HEAD[0]) * u) - 10, HEAD[1] + (ty - HEAD[1]) * u - 10, 20, 20);
    }
  }
}

// Shard j of the blizzard at time t, grown e (0..1) of the way out: its offset from the circle's
// centre and its size, in one scratch array. Each has an orbit, a speed and a direction of its own.
function orbit(j, t, e) {
  const rx = (150 + hash(j * 3) * 210) * e;
  const a = hash(j * 3 + 1) * TAU + t * (0.4 + hash(j * 3 + 2) * 0.8) * (j % 2 ? 1 : -1);
  spot[0] = Math.cos(a) * rx;
  spot[1] = Math.sin(a) * rx * (0.3 + hash(j + 70) * 0.14);
  spot[2] = (0.8 + hash(j + 60) * 0.8) * (1 + Math.sin(a) * 0.22);
  return spot;
}

// The blizzard: shards of ice on wide orbits round the head and maw, spiralling out of them when the
// phase begins (`since`), tumbling as they go, with a glint on each and snow whipped round with them.
function blizzard(ctx, b, t, k, own, since) {
  if (b.phase < 2) return;
  const head = b.parts.find((p) => p.id === 'head'); // alive or a wreck, the storm keeps its place
  const e = smooth((t - since) / 2.4);
  const [cx, cy] = [head.x - b.x, head.y - b.y + 40];
  if (own) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = e;
    for (let j = 0; j < SHARDS; j++) {
      const [x, y, s] = orbit(j, t, e);
      ctx.drawImage(shardFrame(Math.floor(t * (2 + hash(j + 80) * 3) + j)), cx + x - 20 * s, cy + y - 20 * s, 40 * s, 40 * s);
    }
  }
  ctx.globalCompositeOperation = 'lighter';
  for (let j = 0; j < SHARDS; j++) {
    const [x, y, s] = orbit(j, t, e);
    ctx.globalAlpha = k * e * 0.5;
    ctx.drawImage(glow('#bff4ff'), cx + x - 14 * s, cy + y - 14 * s, 28 * s, 28 * s);
    if (j % 2) { // snow in the same wind, faster and wider
      const a = hash(j * 5) * TAU + t * (1.1 + hash(j) * 0.9) * (j % 4 ? 1 : -1);
      const r = (110 + hash(j * 7) * 260) * e;
      ctx.globalAlpha = k * e * 0.5;
      ctx.drawImage(soft('#ffffff'), cx + Math.cos(a) * r - 4, cy + Math.sin(a) * r * 0.34 - 4, 8, 8);
    }
  }
}

export function live(ctx, b, t, k, own, since) {
  breath(ctx, b, t, k, own);
  burn(ctx, b, t, k);
  flare(ctx, b, t, k);
  if (b.phase > 0) frill(ctx, t, k, b.phase);
  blizzard(ctx, b, t, k, own, since);
  ctx.globalAlpha = 1;
}
