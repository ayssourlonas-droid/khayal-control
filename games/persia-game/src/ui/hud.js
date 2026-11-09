// Heads-up display in the 1920 x 1080 frame, sized like Barrage's to read from across a room:
// score and combo (top left; the meter pulses at x4 and burns at x8), the wave counter or the boss's
// health bar (top centre), lives and bombs (top right) and the power-up's timer ring beside them.
// Every panel sits in the band y 16..HUD_BOTTOM (96), above the formation's top row.
// hud = the view's HUD state { lag } (the boss bar's trailing damage).
import { W, rgba, shade, glow } from './sprites.js';
import { approach, clamp, TAU } from '../core/math.js';
import { COMBO_WINDOW, COMBO_MAX } from '../core/scoring.js';
import { POWER_TIME, BOMB_MAX } from '../core/powerups.js';
import { LIVES } from '../core/ship.js';
import { ENTER } from '../core/boss-move.js';
import { bossDef } from '../core/bosses-data.js';
import { scoreText, hudLabel, waveText, localText, levelName, bossName, showsPersian } from './format.js';
import { HUD_BOTTOM } from '../core/kinds.js';
import { TOP, PH, STOCK_W, STOCK_X, BOMBS_DX, DIM, panel, text, label, word, shipIcon, bombIcon } from './hud-kit.js';
import { drawIcon } from './pickups-view.js';
import { bombKeys } from './bomb-keys.js';
import { touchSeen } from './input.js';

const CAP = TOP + 22; // caption row
const MAIN = TOP + 55; // big number row
// The combo number: its ink centre (0.07 em above the 'middle' line it is drawn on) sits halfway
// between the caption's ink (to y 41) and the timer bar (from y 88), so at the x8 pulse (x1.14) it
// keeps 8 px clear of each (6 px of the Persian word's lowest dots, which reach to y 46).
const COMBO_MID = 64.5;
const COMBO_SIZE = 36;
// The score's, the lives' and the combo's Persian labels all have an alef: it stands as tall as the caps
// of the labels beside it; larger crowds the score's 46px number under it.
const ALEF_WORD_SIZE = 18;
// The bombs' Persian label has no alef to match to the caps: at this size its body fills the band the
// caps of BOMBS filled, standing on their baseline, and the hint stays a clear 36 px to its right.
const BOMBS_WORD_SIZE = 24;
// A panel's caption (hudLabel): the pack's word, or a spaced label, at `x` by `align`.
function caption(ctx, level, key, x, size, align = 'left') {
  const { text: s, persian } = hudLabel(level, key);
  if (persian) word(ctx, s, x, CAP, size, DIM, align);
  else label(ctx, s, x, CAP, align);
}

let shown = { n: NaN, level: null, text: '' }; // the score as last formatted, and for which level
function score(ctx, world) {
  if (world.score !== shown.n || world.level !== shown.level) {
    shown = { n: world.score, level: world.level, text: scoreText(world.level, world.score) };
  }
  panel(ctx, 32, TOP, 360, PH);
  caption(ctx, world.level, 'score', 56, ALEF_WORD_SIZE);
  text(ctx, shown.text, 54, MAIN, 46, '#ffffff', 'left', 900);
}

function combo(ctx, world, t) {
  const { mult, timer } = world.combo;
  const hotK = mult >= COMBO_MAX ? 2 : mult >= 4 ? 1 : 0;
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
  caption(ctx, world.level, 'combo', x + 75, ALEF_WORD_SIZE, 'center');
  const pulse = hotK ? 1 + (hotK === 2 ? 0.14 : 0.09) * Math.abs(Math.sin(t * (hotK === 2 ? 12 : 8))) : 1;
  ctx.save();
  ctx.translate(x + 75, COMBO_MID);
  ctx.scale(pulse, pulse); // about the number's own centre, so it grows toward both neighbours alike
  text(ctx, localText(world.level, 'combo', `×${mult}`), 0, COMBO_SIZE * 0.07, COMBO_SIZE, color, 'center', 900);
  ctx.restore();
  const f = clamp(timer / COMBO_WINDOW, 0, 1);
  if (mult > 1 && f > 0) {
    ctx.fillStyle = color;
    ctx.fillRect(x + 14, HUD_BOTTOM - 8, 122 * f, 4);
  }
}

function wave(ctx, world, look) {
  panel(ctx, W / 2 - 150, TOP, 300, PH);
  label(ctx, levelName(world.level).toUpperCase(), W / 2, CAP, 'center', look.palette.accent);
  const line = waveText(world.level, world.wave);
  if (showsPersian(world.level, 'waveWord')) word(ctx, line, W / 2, MAIN, 32, '#ffffff');
  else text(ctx, line, W / 2, MAIN, 32, '#ffffff', 'center', 900);
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
  const ink = shade(look.palette.boss.weak, 0.4);
  const name = bossName(world.level, def);
  if (showsPersian(world.level, 'boss')) word(ctx, name, W / 2, CAP, 22, ink);
  else label(ctx, name, W / 2, CAP, 'center', ink);
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
  const k = clamp(s.power.left / POWER_TIME, 0, 1);
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
  drawIcon(ctx, s.power.kind, color);
  ctx.restore();
}

function stock(ctx, world, look, t) {
  const s = world.ship;
  const x = STOCK_X;
  panel(ctx, x, TOP, STOCK_W, PH);
  caption(ctx, world.level, 'lives', x + 24, ALEF_WORD_SIZE);
  caption(ctx, world.level, 'bombs', x + BOMBS_DX, BOMBS_WORD_SIZE);
  bombKeys(ctx, x + 250, CAP, touchSeen());
  for (let i = 0; i < LIVES; i++) shipIcon(ctx, x + 38 + i * 38, MAIN + 2, look.palette.accent, i < s.lives);
  for (let i = 0; i < BOMB_MAX; i++) bombIcon(ctx, x + 186 + i * 36, MAIN + 2, look.power.bomb, i < s.bombs);
  if (s.power) ring(ctx, s, look, x - 58, TOP + PH / 2, t);
}

export function drawHud(ctx, world, look, hud, t) {
  ctx.textBaseline = 'middle';
  score(ctx, world);
  combo(ctx, world, t);
  if (world.boss) bossBar(ctx, world, look, hud);
  else wave(ctx, world, look);
  stock(ctx, world, look, t);
}
