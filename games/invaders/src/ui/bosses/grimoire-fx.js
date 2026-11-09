// The Grand Grimoire's live extras (World 12, Starlit Archive; grimoire.js runs them): glints crawling
// along the gold script, the sigil-eye's pupil wandering and its runes turning, ink gathering on each
// quill's nib and falling, the crown and the clasp's stone burning, twinkles along the page edges, a leaf
// turning across the spread now and then and ghost leaves fanning out from the pages in the later
// phases (the leaf and the storm of torn pages of the last phase are grimoire-storm.js). In boss
// coordinates; cached sprites only, nothing allocated per frame. The pupil is opaque and drawn only in
// the boss's own pass (`own`): the darkness pass runs again over the aliens.
import { glow, soft, star, hash } from '../sprites.js';
import { alive, glowAt } from './parts.js';
import { LINES, AMBER } from './grimoire-kit.js';
import { GEMS } from './grimoire-crown.js';
import { NIB } from './grimoire-quill.js';
import { GEM_AT } from './grimoire-clasp.js';
import { TEAL, ghost, pupil, runes } from './grimoire-sprites.js';
import { PAGES, turning, storm } from './grimoire-storm.js';

const QUILLS = [['quillL', 1], ['quillR', -1]];
const NIB_TIP = [NIB[0] + 4.7, NIB[1] + 10]; // where the ink hangs from, in the quill's frame

// Gold glints crawling along the ruled lines, a streak of light behind each: the script being written.
function crawl(ctx, b, t, k) {
  const ph = b.phase;
  for (const [id, m] of PAGES) {
    const p = alive(b, id);
    if (!p) continue;
    const [cx, cy] = [p.x - b.x, p.y - b.y];
    if (ph > 0) { // the script burning brighter in the later phases: every ruled line in faint light
      ctx.globalAlpha = k * 0.13 * ph;
      for (const { y, x0, x1 } of LINES) ctx.drawImage(soft('#ffcc55'), cx + Math.min(m * x0, m * x1) - 6, cy + y - 5, Math.abs(x1 - x0) + 12, 10);
    }
    for (let i = 0; i < LINES.length; i++) {
      const c = t * (0.3 + 0.1 * ph) + i * 0.173 + (m > 0 ? 0 : 0.41);
      if (hash(Math.floor(c) * 7 + i + m * 40) < 0.3 - ph * 0.1) continue;
      const u = c % 1;
      const { y, x0, x1 } = LINES[i];
      const x = cx + m * (x0 + (x1 - x0) * u);
      const a = k * Math.sin(Math.PI * u) * (0.55 + 0.12 * ph);
      ctx.globalAlpha = a * 0.55;
      ctx.drawImage(soft('#ffcc55'), x - m * 22 - 26, cy + y - 4, 52, 6);
      ctx.globalAlpha = a;
      ctx.drawImage(glow('#ffd470'), x - 12, cy + y - 13, 24, 24);
    }
  }
}

// Twinkles along the fore-edges, where the leaves' gilt catches the light.
function edges(ctx, b, t, k) {
  for (const [id, m] of PAGES) {
    const p = alive(b, id);
    if (!p) continue;
    for (let j = 0; j < 5; j++) {
      const a = Math.max(0, Math.sin(t * (1.3 + j * 0.21) + j * 2.4 + m)) ** 8;
      ctx.globalAlpha = k * a * 0.9;
      ctx.drawImage(star('#fff0c0'), p.x - b.x - m * (128 + (j % 2) * 3) - 9, p.y - b.y - 88 + j * 40 + hash(j + 30) * 14 - 9, 18, 18);
    }
  }
}

// The ghost leaves of the later phases: pages in gold light fanning out from each page block and
// fluttering, three in the second phase and five in the last, each tipped a little further out.
function ghosts(ctx, b, t, k) {
  if (b.phase < 1) return;
  const n = b.phase > 1 ? 5 : 3;
  for (const [id, m] of PAGES) {
    const p = alive(b, id);
    if (!p) continue;
    for (let j = 0; j < n; j++) {
      ctx.save();
      ctx.translate(p.x - b.x, p.y - b.y);
      ctx.scale(m, 1);
      ctx.translate(-127, 98); // tipped out about the foot of the fore-edge
      ctx.rotate(-(0.026 + 0.015 * j + 0.012 * Math.sin(t * (1.1 + 0.27 * j) + j * 1.7 + m)));
      ctx.translate(127, -98);
      ctx.globalAlpha = k * (0.78 - j * 0.1) * (0.75 + 0.25 * Math.sin(t * 2.2 + j * 1.3));
      ctx.drawImage(ghost(), -135, -125);
      ctx.restore();
    }
  }
}

// The eye: the runes turning in the wheel, a breathing light, the pupil (own pass) wandering over the iris.
function watch(ctx, b, t, k, own) {
  const e = alive(b, 'eye');
  if (!e) return;
  const ph = b.phase;
  const [ex, ey] = [e.x - b.x, e.y - b.y];
  glowAt(ctx, b, e, TEAL, 0, 1, 66 + 8 * Math.sin(t * 2.1) + ph * 10, k * (0.2 + 0.07 * ph + 0.04 * Math.sin(t * 2.1)));
  ctx.save();
  ctx.translate(ex, ey);
  ctx.rotate(t * (0.32 + 0.14 * ph));
  ctx.globalAlpha = k * (0.6 + 0.1 * ph);
  ctx.drawImage(runes(), -56, -56);
  ctx.restore();
  const px = ex + Math.sin(t * 0.9) * 8.5 + Math.sin(t * 2.3) * 1.6;
  const py = ey + 1 + Math.sin(t * 0.6 + 1) * 3;
  if (own) {
    ctx.globalCompositeOperation = 'source-over';
    const w = 0.78 + 0.22 * Math.sin(t * 1.7);
    ctx.globalAlpha = 1;
    ctx.drawImage(pupil(), px - 12 * w, py - 24, 24 * w, 48);
    ctx.globalCompositeOperation = 'lighter';
  }
  ctx.globalAlpha = k * 0.5;
  ctx.drawImage(glow('#ffffff'), px - 3 - 5, py - 7 - 5, 10, 10);
}

// Ink swelling on each nib, then falling a little and fading; gold dust circling the points as they write.
function quills(ctx, b, t, k) {
  for (const [id, m] of QUILLS) {
    const q = alive(b, id);
    if (!q) continue;
    const [nx, ny] = [q.x - b.x + m * NIB_TIP[0], q.y - b.y + NIB_TIP[1] + 4];
    glowAt(ctx, b, q, TEAL, m * (NIB_TIP[0] + 2), NIB_TIP[1] + 4, 20 + 4 * Math.sin(t * 3 + m), k * 0.38);
    for (let j = 0; j < 2; j++) {
      const u = (t * 0.45 + j * 0.5 + (m > 0 ? 0 : 0.21)) % 1;
      const fall = Math.max(0, (u - 0.4) / 0.6);
      const s = (u < 0.4 ? 0.4 + 0.6 * (u / 0.4) : 1 - fall * 0.4) * (b.phase > 0 ? 1.15 : 1);
      ctx.globalAlpha = k * (1 - fall * fall);
      ctx.drawImage(glow(TEAL), nx - 7 * s, ny + fall * fall * 24 - 7 * s, 14 * s, 14 * s);
      ctx.globalAlpha = k * (1 - fall) * 0.8;
      ctx.drawImage(glow('#ffffff'), nx - 2.4, ny + fall * fall * 24 - 2.4, 4.8, 4.8);
    }
    for (let j = 0; j < 3; j++) {
      const a = t * 2.1 + j * 2.1 + m;
      ctx.globalAlpha = k * 0.55 * Math.max(0, Math.sin(t * 3.3 + j * 2));
      ctx.drawImage(star('#ffe08a'), nx - m * 6 + Math.cos(a) * (10 + j * 5) - 5, ny - 8 + Math.sin(a) * (4 + j * 2) - 5, 10, 10);
    }
  }
}

// The crown's jewels glowing (all five flaring from the second phase) and a glint sweeping its band;
// the clasp's stone pulsing, a flare turning in it from the second phase.
function jewels(ctx, b, t, k) {
  const ph = b.phase;
  const c = alive(b, 'crown');
  if (c) {
    GEMS.forEach(([x, y], i) => {
      if (i % 2 && ph < 1) return;
      glowAt(ctx, b, c, AMBER, x, y, (i === 2 ? 22 : 15) + 3 * Math.sin(t * 2.4 + i), k * (0.28 + 0.07 * ph + 0.07 * Math.sin(t * 2.4 + i)));
    });
    const u = (t * 0.3) % 1;
    ctx.globalAlpha = k * Math.sin(Math.PI * u) * 0.8;
    ctx.drawImage(star('#fff0c0'), c.x - b.x - 112 + 224 * u - 11, c.y - b.y + 4 - 11, 22, 22);
  }
  const g = alive(b, 'clasp');
  if (!g) return;
  const pulse = 0.5 + 0.5 * Math.sin(t * (2.4 + ph * 1.2));
  glowAt(ctx, b, g, TEAL, GEM_AT[0], GEM_AT[1], 40 + 8 * pulse + ph * 10, k * (0.3 + 0.12 * pulse + ph * 0.1));
  glowAt(ctx, b, g, '#ffffff', GEM_AT[0], GEM_AT[1], 9 + 4 * pulse, k * (0.4 + 0.2 * pulse));
  if (ph > 0) {
    ctx.save();
    ctx.translate(g.x - b.x + GEM_AT[0], g.y - b.y + GEM_AT[1]);
    ctx.rotate(t * 0.7);
    ctx.globalAlpha = k * 0.26 * ph;
    ctx.drawImage(star('#9afff0'), -46, -46, 92, 92);
    ctx.restore();
  }
}

export function live(ctx, b, t, k, own, since) {
  crawl(ctx, b, t, k);
  edges(ctx, b, t, k);
  ghosts(ctx, b, t, k);
  watch(ctx, b, t, k, own);
  quills(ctx, b, t, k);
  jewels(ctx, b, t, k);
  turning(ctx, b, t, own);
  storm(ctx, b, t, k, own, since);
  ctx.globalAlpha = 1;
}
