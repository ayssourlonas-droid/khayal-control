// More flourishes (contract in flourish.js): lightning bolts from the fx flashes, heat shimmer,
// acid drips, the burning war's horizon (blasts, tracer fire, gunship searchlights) and the photon
// ring that turns round the well.
import { W, rgba, hash, glow, soft, lighter, normal, makeCanvas, lin } from './sprites.js';
import { makeRng } from '../core/rng.js';
import { WELL } from '../core/kinds.js';
import { wellLight } from './sky-bodies-2.js';
import { TAU } from '../core/math.js';

// A bolt for every lightning flash, seeded by its birth so it holds still while it lives.
function bolt(ctx, { fx }) {
  for (const f of fx.flashes) {
    if (f.tag !== 'lightning') continue;
    const k = f.life / f.max;
    const birth = fx.time - (f.max - f.life);
    const rng = makeRng(Math.floor(birth * 997));
    const paths = [[]];
    let x = 200 + rng() * (W - 400);
    for (let y = 0; y < 720; y += 26 + rng() * 22) {
      x += (rng() - 0.5) * 80;
      paths[0].push([x, y]);
      if (rng() < 0.14) paths.push([[x, y], [x + (rng() - 0.5) * 180, y + 90], [x + (rng() - 0.5) * 240, y + 180]]);
    }
    lighter(ctx);
    for (const [w, a] of [[14, 0.15], [5, 0.5], [2, 1]]) {
      ctx.lineWidth = w;
      ctx.strokeStyle = rgba('#d8e4ff', a * k);
      for (const p of paths) {
        ctx.beginPath();
        for (const [px, py] of p) ctx.lineTo(px, py);
        ctx.stroke();
      }
    }
    normal(ctx);
  }
}

// Heat rising off the sand: faint wavering bands over the horizon.
function shimmer(ctx, { t }) {
  lighter(ctx);
  for (let i = 0; i < 7; i++) {
    ctx.globalAlpha = 0.045 + 0.03 * Math.sin(t * 1.7 + i * 1.3);
    ctx.drawImage(soft('#ffd8a0'), -200 + Math.sin(t * 0.6 + i) * 40, 640 + i * 24, W + 400, 18);
  }
  normal(ctx);
}

// Drops of acid falling from the vault, glowing as they fall.
function drips(ctx, { t }) {
  lighter(ctx);
  for (let i = 0; i < 14; i++) {
    const period = 2.5 + hash(i + 400) * 3;
    const tau = (t / period + hash(i + 401)) % 1;
    const x = hash(i + 70) * W;
    const y = 60 + 260 * hash(i + 71) + tau * tau * 1100;
    ctx.globalAlpha = 0.7 * (1 - tau);
    ctx.drawImage(glow('#b8ff5a'), x - 7, y - 10, 14, 20);
  }
  normal(ctx);
}

// Far explosions on the burning horizon, on a timetable.
function blasts(ctx, { t }) {
  lighter(ctx);
  for (let lane = 0; lane < 3; lane++) {
    const period = 2.3 + lane * 0.7;
    const slot = Math.floor(t / period);
    const lt = t - slot * period;
    if (lt > 1.4) continue;
    const x = 100 + hash(slot * 7 + lane) * (W - 200);
    const y = 700 + hash(slot * 7 + lane + 1) * 120;
    const k = lt < 0.12 ? lt / 0.12 : Math.max(0, 1 - (lt - 0.12) / 1.3);
    ctx.globalAlpha = k * 0.8;
    ctx.drawImage(glow('#ffb04a'), x - 160, y - 140, 320, 280);
    ctx.drawImage(glow('#fff0c0'), x - 40 - lt * 20, y - 40 - lt * 60, 80 + lt * 40, 80);
  }
  normal(ctx);
}

// Bursts of tracer fire across the murk: blue from one side, red from the other.
function tracers(ctx, { t }) {
  lighter(ctx);
  ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const period = 1.6 + hash(i + 500) * 1.8;
    const lt = (t / period + hash(i + 501)) % 1;
    if (lt > 0.35) continue;
    const blue = i % 2 === 0;
    const sx = blue ? hash(i + 502) * W * 0.4 : W - hash(i + 502) * W * 0.4;
    const sy = 780 + hash(i + 503) * 120;
    const ang = (blue ? -0.55 : -2.6) + (hash(i + 504) - 0.5) * 0.5;
    const d = (lt / 0.35) * 1300;
    const x = sx + Math.cos(ang) * d;
    const y = sy + Math.sin(ang) * d;
    ctx.strokeStyle = blue ? 'rgba(120,180,255,0.7)' : 'rgba(255,80,60,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(ang) * 90, y - Math.sin(ang) * 90);
    ctx.stroke();
  }
  ctx.lineCap = 'butt'; // the default again: later strokes (the HUD's power ring) must not inherit it
  normal(ctx);
}

function cone(color) {
  const c = makeCanvas(420, 1100);
  const g = c.getContext('2d');
  g.fillStyle = lin(g, 0, 0, 0, 1100, [[0, rgba(color, 0.5)], [1, rgba(color, 0)]]);
  g.beginPath();
  g.moveTo(200, 0);
  g.lineTo(0, 1100);
  g.lineTo(420, 1100);
  g.lineTo(220, 0);
  g.fill();
  return c;
}

// Searchlights from unseen gunships above, sweeping the field.
function gunships(ctx, { v, t }) {
  v.cache.cone ??= cone('#dfe8ff');
  lighter(ctx);
  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.translate(460 + i * 1000 + Math.sin(t * 0.13 + i) * 200, -40);
    ctx.rotate(Math.sin(t * 0.37 + i * 2.4) * 0.45);
    ctx.globalAlpha = 0.16;
    ctx.drawImage(v.cache.cone, -210, 0);
    ctx.restore();
  }
  normal(ctx);
}

// The photon ring round the well: bright arcs that turn, brightest on the approaching side (faint
// on the boss level, where the Singularity is the black hole to watch: wellLight).
function lens(ctx, { world, t }) {
  const c = world.well ?? WELL;
  const k = wellLight(world.level);
  lighter(ctx);
  ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + t * 0.7;
    const side = 0.55 + 0.45 * Math.cos(a + 0.6);
    ctx.strokeStyle = rgba(i % 3 ? '#ffe8c0' : '#ffffff', 0.5 * side * k);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 86, 80, 0, a, a + 0.4);
    ctx.stroke();
  }
  const pulse = (t * 0.5) % 1;
  ctx.strokeStyle = rgba('#b8a8ff', 0.25 * (1 - pulse) * k);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, 90 + pulse * 240, (90 + pulse * 240) * 0.9, 0, 0, TAU);
  ctx.stroke();
  ctx.lineCap = 'butt';
  normal(ctx);
}

export const FLOURISH2 = {
  bolt: { sky: bolt }, shimmer: { near: shimmer }, drips: { near: drips }, blasts: { sky: blasts },
  tracers: { sky: tracers }, gunships: { near: gunships }, lens: { near: lens },
};
