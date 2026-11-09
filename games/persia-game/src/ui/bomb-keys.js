// How to drop a bomb, drawn beside the HUD's BOMBS label: a key cap with B and a mouse with its right
// button lit, or, once a touch has been seen, a tap mark (a fingertip in a ring). It is part of the HUD,
// not help text: no words, about the label's cap height, in the label's colour.
//   bombKeys(ctx, x, y, touch)   x is the left end of the hint's 26 px slot, y its vertical middle
import { roundRect } from './sprites.js';
import { TAU } from '../core/math.js';
import { DIM, text } from './hud-kit.js';

const LIT = 'rgba(255,255,255,0.95)';
const CAP_H = 12; // a little over the label's cap height (11 px)

function keyCap(ctx, x, y) {
  roundRect(ctx, x + 0.75, y - CAP_H / 2 + 0.75, CAP_H - 1.5, CAP_H - 1.5, 3);
  ctx.stroke();
  text(ctx, 'B', x + CAP_H / 2, y + 0.5, 10, DIM, 'center', 900);
}

// A mouse seen from above, its right button filled.
function mouse(ctx, x, y) {
  const w = 9;
  const top = y - CAP_H / 2;
  ctx.fillStyle = LIT;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, top + 1);
  ctx.lineTo(x + w - 1, top + 1);
  ctx.lineTo(x + w - 1, top + 5);
  ctx.lineTo(x + w / 2, top + 5);
  ctx.closePath();
  ctx.fill();
  roundRect(ctx, x + 0.75, top + 0.75, w - 1.5, CAP_H - 1.5, 3.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 1, top + 5.5);
  ctx.lineTo(x + w - 1, top + 5.5);
  ctx.moveTo(x + w / 2, top + 1);
  ctx.lineTo(x + w / 2, top + 5.5);
  ctx.stroke();
}

function tapMark(ctx, cx, cy) {
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = LIT;
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, TAU);
  ctx.fill();
}

export function bombKeys(ctx, x, y, touch) {
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = DIM;
  if (touch) tapMark(ctx, x + 13, y);
  else {
    keyCap(ctx, x, y);
    mouse(ctx, x + CAP_H + 5, y);
  }
}
