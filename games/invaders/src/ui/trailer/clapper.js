// The blooper's clapperboard, drawn on the canvas: a slate with the scene (the world), the take and
// the roll (the reel), its striped stick snapping shut, then CUT! chalked across it.
//   drawClapper(ctx, { k, shut, cut }, { scene, take, roll })
//     k: slide in 0..1 · shut: 0 open .. 1 closed · cut: 0..1 the CUT! stamp
import { W } from '../sprites.js';
import { clamp, easeOut } from '../../core/math.js';
import { FONTS } from './draw.js';

const BW = 820;
const BH = 470;
const BAR = 70;
const CHALK = '#f2eee4';
const SLATE = '#151519';

function stripes(ctx, y, h, flip = false) { // flip: the stick's stripes mirror the slate's, chevrons when shut
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y, BW, h);
  ctx.clip();
  ctx.fillStyle = CHALK;
  ctx.fillRect(0, y, BW, h);
  ctx.fillStyle = SLATE;
  for (let x = -h; x < BW; x += 128) {
    ctx.beginPath();
    const [a, b] = flip ? [y, y + h] : [y + h, y];
    ctx.moveTo(x, a);
    ctx.lineTo(x + 64, a);
    ctx.lineTo(x + 64 + h, b);
    ctx.lineTo(x + h, b);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = CHALK;
  ctx.lineWidth = 4;
  ctx.strokeRect(0, y, BW, h);
}

function write(ctx, s, x, y, size, color, weight = 800, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONTS.cond}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function cell(ctx, label, value, x, y, w) {
  write(ctx, label, x + 22, y + 24, 22, 'rgba(242,238,228,0.55)', 700);
  write(ctx, value, x + 22, y + 62, 40, CHALK);
  ctx.strokeStyle = 'rgba(242,238,228,0.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, 92);
}

export function drawClapper(ctx, { k, shut, cut }, info) {
  ctx.save();
  ctx.translate(W / 2 - BW / 2, 360 + (1 - easeOut(k)) * 860);
  ctx.rotate(-0.05);
  ctx.globalAlpha = 1;
  ctx.fillStyle = SLATE;
  ctx.fillRect(0, 0, BW, BH);
  stripes(ctx, 0, BAR);
  cell(ctx, 'SCENE', info.scene, 0, BAR, BW * 0.62);
  cell(ctx, 'TAKE', String(info.take), BW * 0.62, BAR, BW * 0.38);
  cell(ctx, 'ROLL', info.roll, 0, BH - 92, BW * 0.62);
  cell(ctx, 'PROD.', 'INVADERS', BW * 0.62, BH - 92, BW * 0.38);
  ctx.strokeStyle = CHALK;
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, BW, BH);
  if (cut > 0) {
    const s = 1.7 - 0.7 * easeOut(cut);
    ctx.save();
    ctx.translate(BW / 2, BAR + 92 + (BH - BAR - 184) / 2);
    ctx.rotate(-0.04);
    ctx.scale(s, s);
    ctx.globalAlpha = clamp(cut * 3, 0, 1);
    write(ctx, 'CUT!', 0, 6, 150, CHALK, 900, 'center');
    ctx.restore();
  }
  ctx.translate(0, -4); // the stick, hinged at its left end on the top of the slate
  ctx.rotate(-0.55 * (1 - easeOut(shut)));
  ctx.translate(0, -BAR);
  stripes(ctx, 0, BAR, true);
  ctx.restore();
}
