// Drawing the fx state (src/fx) in world space (adapted from Barrage): particles by kind, shockwave
// rings by kind, local flashes, and floating score text. Pure reads of fx; nothing is changed here.
// Full-frame flashes and tints are screen-view.js.
import { INK, rgba, glow, soft } from './sprites.js';
import { HUD_BOTTOM } from '../core/kinds.js';
import { flashK } from '../fx/fx.js';
import { TAU } from '../core/math.js';
import { localText } from './format.js';
import { FONT } from './hud-kit.js';

function plain(ctx, p) {
  const f = p.life / p.max;
  const s = p.size;
  if (p.kind === 'smoke') {
    ctx.globalAlpha = f * 0.55;
    ctx.drawImage(soft(p.color), p.x - s * 1.4, p.y - s * 1.4, s * 2.8, s * 2.8);
    return;
  }
  ctx.globalAlpha = Math.min(1, f * 3);
  ctx.fillStyle = p.color;
  if (p.kind === 'debris') { // tumbling chips: the box turns with the particle's age
    const a = (p.max - p.life) * 9 + p.vx * 0.01;
    const w = s * (0.6 + 0.4 * Math.abs(Math.cos(a)));
    ctx.fillRect(p.x - w / 2, p.y - s / 2, w, s);
    return;
  }
  ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
}

function hot(ctx, p) {
  const f = p.life / p.max;
  ctx.globalAlpha = f;
  if (p.kind === 'spark') {
    ctx.strokeStyle = p.color;
    ctx.lineWidth = Math.max(1, p.size);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
    ctx.stroke();
    return;
  }
  const r = p.size * 4;
  ctx.drawImage(glow(p.color), p.x - r, p.y - r, r * 2, r * 2);
}

function rings(ctx, fx) {
  for (const r of fx.rings) {
    const f = r.life / r.max;
    const inward = r.kind === 'charge';
    const a = inward ? 1 - f * 0.5 : f;
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(r.color, 0.25 * a);
    ctx.lineWidth = r.width * 1.5 + 18 * a;
    ctx.beginPath();
    ctx.arc(r.x, r.y, Math.max(1, r.r), 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = rgba(r.color, 0.9 * a);
    ctx.lineWidth = Math.max(1.5, r.width * a);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
}

function flashes(ctx, fx) {
  ctx.globalCompositeOperation = 'lighter';
  for (const f of fx.flashes) {
    if (f.full) continue;
    const k = flashK(f);
    ctx.globalAlpha = Math.min(1, k * f.alpha);
    ctx.drawImage(glow(f.color), f.x - f.r * 1.6, f.y - f.r * 1.6, f.r * 3.2, f.r * 3.2);
    ctx.drawImage(glow('#ffffff'), f.x - f.r * 0.6, f.y - f.r * 0.6, f.r * 1.2, f.r * 1.2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Pop-ups never rise above this line, so the HUD (panels end at HUD_BOTTOM) never covers one. Those held
// at the line would pile up on it (a top row shot away at once), so each is pushed below any held one
// it would overlap: a small stack of at most STACK rows; past that they overlap as they fade.
export const POPUP_MIN_Y = HUD_BOTTOM + 54;
const STACK = 3;
const ROW = 34; // px a stacked row takes at scale 1 (the text is 30 px)
const halfWidth = (p) => 9 * p.scale * p.text.length; // about half the text's width (30 px font)

// Would pop-up i, drawn at y, overlap a held one placed before it?
function overlaps(popups, out, i, y) {
  const p = popups[i];
  for (let j = 0; j < i; j++) {
    const q = popups[j];
    if (q.y >= POPUP_MIN_Y) continue;
    if (Math.abs(out[j] - y) < (ROW * (p.scale + q.scale)) / 2 && Math.abs(q.x - p.x) < halfWidth(p) + halfWidth(q)) return true;
  }
  return false;
}

// The y each pop-up is drawn at, in list order, written into `out` (reused: no allocation per frame).
export function popupYs(popups, out = []) {
  out.length = popups.length;
  for (let i = 0; i < popups.length; i++) {
    const p = popups[i];
    let y = Math.max(POPUP_MIN_Y, p.y);
    for (let row = 1; p.y < POPUP_MIN_Y && row < STACK && overlaps(popups, out, i, y); row++) y += ROW * p.scale;
    out[i] = y;
  }
  return out;
}

const ys = [];

export function drawPopups(ctx, fx, level) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  popupYs(fx.popups, ys);
  for (let i = 0; i < fx.popups.length; i++) {
    const p = fx.popups[i];
    const age = p.max - p.life;
    const pop = 1 + Math.max(0, 1 - age / 0.18) * 0.6;
    ctx.globalAlpha = Math.min(1, (p.life / p.max) * 2.5);
    ctx.font = `900 ${Math.round(30 * p.scale * pop)}px ${FONT}`;
    const text = p.points ? localText(level, 'score', p.text) : p.text;
    ctx.lineWidth = 7;
    ctx.strokeStyle = INK;
    ctx.strokeText(text, p.x, ys[i]);
    ctx.fillStyle = p.color;
    ctx.fillText(text, p.x, ys[i]);
  }
  ctx.globalAlpha = 1;
}

// World space, over the ships and bullets.
export function drawFx(ctx, fx) {
  for (const p of fx.particles) if (!p.additive) plain(ctx, p);
  ctx.globalCompositeOperation = 'lighter';
  for (const p of fx.particles) if (p.additive) hot(ctx, p);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  flashes(ctx, fx);
  rings(ctx, fx);
}
