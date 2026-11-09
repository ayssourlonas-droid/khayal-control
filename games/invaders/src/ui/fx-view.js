// Drawing the fx state (src/fx) in world space (adapted from Barrage): particles by kind, shockwave
// rings by kind, local flashes, and floating score text. Pure reads of fx; nothing is changed here.
// Full-frame flashes, glitch slices and tints are screen-view.js.
import { INK, rgba, glow, soft } from './sprites.js';
import { pageSprite } from './ambient-4.js';
import { drawBloom } from './burst-view.js';
import { drawBubble } from './bubble-view.js';
import { drawMend, drawScatter } from './mending-fx-view.js';
import { drawLeaf, drawTwinkle } from './breath-fx-view.js';
import { drawArc } from './arc-fx-view.js';
import { HUD_BOTTOM } from '../core/kinds.js';
import { flashK } from '../fx/fx.js';
import { TAU } from '../core/math.js';

function plain(ctx, p) {
  const f = p.life / p.max;
  const s = p.size;
  if (p.kind === 'smoke' || p.kind === 'dust') {
    ctx.globalAlpha = f * (p.kind === 'smoke' ? 0.55 : 0.6);
    ctx.drawImage(soft(p.color), p.x - s * 1.4, p.y - s * 1.4, s * 2.8, s * 2.8);
    return;
  }
  ctx.globalAlpha = Math.min(1, f * 3);
  ctx.fillStyle = p.color;
  if (p.kind === 'shard') { // a sliver of glass: a thin triangle turning as it falls, a bright edge on it
    const a = (p.max - p.life) * 11 + p.vx * 0.02;
    const [c, d] = [Math.cos(a) * s * 1.7, Math.sin(a) * s * 1.7];
    ctx.beginPath();
    ctx.moveTo(p.x + c, p.y + d);
    ctx.lineTo(p.x - d * 0.45, p.y + c * 0.45);
    ctx.lineTo(p.x - c * 0.7, p.y - d * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
    return;
  }
  if (p.kind === 'page') { // a loose sheet turning over as it flies (Starlit Archive's blink)
    const a = (p.max - p.life) * 9 + p.vx * 0.01;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(a * 0.7);
    ctx.scale((s / 20) * Math.cos(a * 1.3), s / 20);
    ctx.drawImage(pageSprite(p.color), -16, -20);
    ctx.restore();
    return;
  }
  if (p.kind === 'leaf') { // a leaf riding the breath's air (world 17): breath-fx-view.js
    drawLeaf(ctx, p);
    return;
  }
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
  if (p.kind === 'twinkle') { // a four-point star where a bullet was wiped (world 17)
    drawTwinkle(ctx, p);
    return;
  }
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
    if (r.kind === 'bloom') { // a firework burst (world 14): its own baked flower, burst-view.js
      drawBloom(ctx, r);
      continue;
    }
    if (r.kind === 'mend' || r.kind === 'scatter') { // glass flying together or apart (world 16): the mending's rings, mending-fx-view.js
      (r.kind === 'mend' ? drawMend : drawScatter)(ctx, r);
      continue;
    }
    if (r.kind === 'arc') { // electric arcs (world 18): jagged bolts that crackle out of a point, arc-fx-view.js
      drawArc(ctx, r);
      continue;
    }
    if (r.kind === 'bubble') { // a bullet the maelstrom swallowed (world 15): a bubble spiralling down and popping, bubble-view.js
      drawBubble(ctx, r);
      continue;
    }
    const f = r.life / r.max;
    const inward = r.kind === 'lens' || r.kind === 'charge';
    const a = inward ? 1 - f * 0.5 : f;
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(r.color, 0.25 * a);
    ctx.lineWidth = r.width * 1.5 + 18 * a;
    ctx.beginPath();
    ctx.arc(r.x, r.y, Math.max(1, r.r), 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = rgba(r.kind === 'lens' ? '#ffffff' : r.color, 0.9 * a);
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

export function drawPopups(ctx, fx) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  popupYs(fx.popups, ys);
  for (let i = 0; i < fx.popups.length; i++) {
    const p = fx.popups[i];
    const age = p.max - p.life;
    const pop = 1 + Math.max(0, 1 - age / 0.18) * 0.6;
    ctx.globalAlpha = Math.min(1, (p.life / p.max) * 2.5);
    ctx.font = `900 ${Math.round(30 * p.scale * pop)}px system-ui, sans-serif`;
    ctx.lineWidth = 7;
    ctx.strokeStyle = INK;
    ctx.strokeText(p.text, p.x, ys[i]);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, ys[i]);
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
