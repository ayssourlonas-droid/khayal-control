// Heads-up display in the 1920 x 1080 frame, sized like Barrage's to read from across a room:
// score and combo (top left; the meter pulses at x4 and burns at x8), the wave counter or the boss's
// health bar (top centre), lives and bombs (top right; three slots each, past three one icon and ×n) and
// the power-up's timer ring beside them, with the power waiting in the reserve (R53) as a smaller ring
// and its seconds to the ring's left.
// Every panel sits in the band y 16..HUD_BOTTOM (96), above the formation's top row.
// hud = the view's HUD state { lag } (the boss bar's trailing damage).
import { W, rgba, shade, glow } from './sprites.js';
import { approach, clamp, TAU } from '../core/math.js';
import { COMBO_WINDOW, COMBO_MAX, COMBO_HOT } from '../core/scoring.js';
import { powerTime } from '../core/powerups.js';
import { LIVES } from '../core/ship.js';
import { ENTER } from '../core/boss-move.js';
import { bossDef } from '../core/bosses-data.js';
import { worldName } from '../core/levels.js';
import { fmt } from './format.js';
import { HUD_BOTTOM } from '../core/kinds.js';
import { panel, text, label, shipIcon, bombIcon, stockRow } from './hud-kit.js';
import { drawIcon } from './pickups-view.js';

const TOP = 16;
const PH = HUD_BOTTOM - TOP; // panel height
const CAP = TOP + 22; // caption row
const MAIN = TOP + 55; // big number row
// The combo number: its ink centre (0.07 em above the 'middle' line it is drawn on) sits halfway
// between the caption's ink (to y 41) and the timer bar (from y 88), so at the x8 pulse (x1.14) it
// keeps 8 px clear of each.
const COMBO_MID = 64.5;
const COMBO_SIZE = 36;
const BOMB_SLOTS = 3; // the bombs shown as slots; more are one icon and a count (lives: LIVES)

let shown = { n: NaN, text: '' }; // the score as last formatted
function score(ctx, world) {
  if (world.score !== shown.n) shown = { n: world.score, text: fmt(world.score) };
  panel(ctx, 32, TOP, 360, PH);
  label(ctx, 'SCORE', 56, CAP);
  text(ctx, shown.text, 54, MAIN, 46, '#ffffff', 'left', 900);
}

function combo(ctx, world, t) {
  const { mult, timer } = world.combo;
  const hotK = mult >= COMBO_MAX ? 2 : mult >= COMBO_HOT ? 1 : 0;
  const x = 404;
  if (hotK === 2) { // burning: flames licking up round the meter
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const fl = 0.6 + 0.4 * Math.sin(t * 17 + i * 2.1);
      ctx.globalAlpha = 0.5 * fl;
      ctx.drawImage(glow(i % 2 ? '#ff5a1a' : '#ffb03a'), x - 10 + i * 26, TOP - 18 - fl * 26, 44, 90);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  const color = hotK === 2 ? '#ff6a2a' : hotK === 1 ? '#ffe14a' : mult > 1 ? '#ffffff' : 'rgba(255,255,255,0.4)';
  panel(ctx, x, TOP, 150, PH, hotK ? rgba(color, 0.95) : undefined);
  label(ctx, 'COMBO', x + 75, CAP, 'center');
  const pulse = hotK ? 1 + (hotK === 2 ? 0.14 : 0.09) * Math.abs(Math.sin(t * (hotK === 2 ? 12 : 8))) : 1;
  ctx.save();
  ctx.translate(x + 75, COMBO_MID);
  ctx.scale(pulse, pulse); // about the number's own centre, so it grows toward both neighbours alike
  text(ctx, `×${mult}`, 0, COMBO_SIZE * 0.07, COMBO_SIZE, color, 'center', 900);
  ctx.restore();
  const f = clamp(timer / COMBO_WINDOW, 0, 1);
  if (mult > 1 && f > 0) {
    ctx.fillStyle = color;
    ctx.fillRect(x + 14, HUD_BOTTOM - 8, 122 * f, 4);
  }
}

function wave(ctx, world, look) {
  const total = world.level.waves?.length ?? 0;
  const name = worldName(world.level);
  panel(ctx, W / 2 - 150, TOP, 300, PH);
  label(ctx, name.toUpperCase(), W / 2, CAP, 'center', look.palette.accent);
  text(ctx, `WAVE ${Math.max(1, world.wave)} / ${total}`, W / 2, MAIN, 32, '#ffffff', 'center', 900);
}

function bossBar(ctx, world, look, hud) {
  const b = world.boss;
  const def = bossDef(b.kind);
  const fill = (b.hp / b.maxHp) * clamp(1 - b.enter / ENTER, 0, 1);
  hud.lag = approach(hud.lag ?? fill, fill, 0.004);
  if (hud.lag < fill) hud.lag = fill;
  const bw = 700;
  const x = W / 2 - bw / 2;
  const y = TOP + 40;
  panel(ctx, x - 24, TOP, bw + 48, PH, rgba(look.palette.boss.weak, 0.7));
  label(ctx, def.name.toUpperCase(), W / 2, CAP, 'center', shade(look.palette.boss.weak, 0.4));
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(x, y, bw, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(x, y, bw * hud.lag, 24);
  const gr = ctx.createLinearGradient(0, y, 0, y + 24);
  gr.addColorStop(0, shade(look.palette.boss.weak, 0.35));
  gr.addColorStop(1, shade(look.palette.boss.weak, -0.25));
  ctx.fillStyle = gr;
  ctx.fillRect(x, y, bw * fill, 24);
  ctx.fillStyle = 'rgba(8,10,18,0.9)';
  for (const p of def.phases) if (p.until > 0) ctx.fillRect(x + bw * p.until - 2, y - 4, 4, 32);
}

function ring(ctx, s, look, cx, cy, t) {
  const color = look.power[s.power.kind];
  const k = clamp(s.power.left / powerTime(s.power.kind), 0, 1);
  const warn = s.power.left < 2 && Math.floor(t * 8) % 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 39, 0, TAU);
  ctx.fillStyle = 'rgba(8,10,18,0.7)';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, 33, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = warn ? '#ffffff' : color;
  ctx.beginPath();
  ctx.arc(cx, cy, 33, -Math.PI / 2, -Math.PI / 2 + TAU * k);
  ctx.stroke();
  ctx.save();
  ctx.translate(cx, cy);
  drawIcon(ctx, s.power.kind, color, look.world);
  ctx.restore();
}

// The power waiting its turn: a ring in its own tint, as full as the time it has left, with that time.
// It does not tick while it waits, so it never flashes.
function reserve(ctx, s, look, cx, cy) {
  const { kind, left } = s.reserve;
  const color = look.power[kind];
  ctx.beginPath();
  ctx.arc(cx, cy, 27, 0, TAU);
  ctx.fillStyle = 'rgba(8,10,18,0.7)';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(left / powerTime(kind), 0, 1));
  ctx.stroke();
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.6, 0.6);
  drawIcon(ctx, kind, color, look.world);
  ctx.restore();
  label(ctx, 'NEXT', cx - 36, CAP, 'right');
  text(ctx, `${Math.ceil(left)}s`, cx - 36, MAIN, 30, '#ffffff', 'right', 900);
}

function stock(ctx, world, look, t) {
  const s = world.ship;
  const x = W - 32 - 300;
  panel(ctx, x, TOP, 300, PH);
  label(ctx, 'LIVES', x + 24, CAP);
  label(ctx, 'BOMBS', x + 172, CAP);
  stockRow(ctx, s.lives, LIVES, x + 38, MAIN + 2, 38, shipIcon, look.palette.accent);
  stockRow(ctx, s.bombs, BOMB_SLOTS, x + 186, MAIN + 2, 36, bombIcon, look.power.bomb);
  if (!s.power) return;
  ring(ctx, s, look, x - 58, TOP + PH / 2, t);
  if (s.reserve) reserve(ctx, s, look, x - 134, TOP + PH / 2);
}

export function drawHud(ctx, world, look, hud, t) {
  ctx.textBaseline = 'middle';
  score(ctx, world);
  combo(ctx, world, t);
  if (world.boss) bossBar(ctx, world, look, hud);
  else wave(ctx, world, look);
  stock(ctx, world, look, t);
}
