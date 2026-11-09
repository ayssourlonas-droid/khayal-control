// The trailer's first and last frames. The film leader counts down while the run is re-simulated
// (8 to 3, a sweep round each number, the flicker of a print); the final card is the world as a film
// title in its own typography under an anamorphic streak, the stars as the critics' and the score
// as the box office, counting up, stamped RECORD on a new best, over a billing line.
//   drawLeader(ctx, n, frac, frame)        frac: 0..1 round the current number
//   drawFinal(ctx, fin, art, style, t, secs)   fin: cards.js finalCard; art: bakeCard([fin.title], style, k)
import { W, H, hash, glow } from '../sprites.js';
import { clamp, smooth, TAU } from '../../core/math.js';
import { FONTS } from './draw.js';
import { fmt } from '../format.js';
import { REVEAL, bloom } from './reveal.js';

const STAR_AT = [1.0, 1.18, 1.36];
const COUNT = [1.2, 2.1]; // s the box office counts up
const RECORD_AT = 2.25;

export function drawLeader(ctx, n, frac, frame) {
  const flick = 0.88 + 0.12 * hash(frame * 13 + 1);
  const cx = W / 2;
  const cy = H / 2;
  ctx.fillStyle = '#1c1a15';
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.55 * flick;
  ctx.fillStyle = '#4a4436';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, 1200, -Math.PI / 2, -Math.PI / 2 + frac * TAU);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.85 * flick;
  ctx.strokeStyle = '#ebe3cf';
  ctx.lineWidth = 6;
  for (const r of [340, 290]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.stroke();
  }
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, H);
  ctx.stroke();
  ctx.fillStyle = '#f4ecda';
  ctx.font = `700 400px ${FONTS.cond}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), cx, cy + 16);
  ctx.globalAlpha = 0.5 * hash(frame * 7 + 3); // a hair or a scratch on the print
  ctx.fillStyle = '#f4ecda';
  ctx.fillRect(hash(frame) * W, 0, 2, H);
  ctx.globalAlpha = 1;
}

function text(ctx, s, x, y, size, { weight = 700, track = 0.3, color = '#fff', alpha = 1, font = FONTS.cond } = {}) {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.letterSpacing = `${(size * track).toFixed(1)}px`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x + (size * track) / 2, y); // centre the ink, not the trailing spacing
  ctx.letterSpacing = '0px';
}

function stamp(ctx, x, y, t) {
  const k = clamp((t - RECORD_AT) / 0.18, 0, 1);
  if (k <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.12);
  ctx.scale(1.9 - 0.9 * k, 1.9 - 0.9 * k);
  ctx.globalAlpha = k;
  ctx.fillStyle = '#ffd24a';
  ctx.fillRect(-130, -34, 260, 68);
  ctx.strokeStyle = '#1a1205';
  ctx.lineWidth = 4;
  ctx.strokeRect(-122, -26, 244, 52);
  text(ctx, 'RECORD', 0, 2, 40, { weight: 900, track: 0.3, color: '#1a1205', alpha: k });
  ctx.restore();
}

export function drawFinal(ctx, fin, art, style, t, secs) {
  const out = 1 - smooth((t - (secs - 0.35)) / 0.35);
  const ty = 430;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.32 * out * smooth(t / 0.5);
  ctx.drawImage(bloom(style.glow), W / 2 - 1000, ty - 330, 2000, 660);
  const sk = smooth((t - 0.1) / 0.7);
  ctx.globalAlpha = 0.5 * sk * out;
  ctx.drawImage(bloom('#ffffff'), W / 2 - 1100 * sk, ty - 2, 2200 * sk, 4); // the anamorphic streak
  ctx.globalAlpha = 0.3 * sk * out;
  ctx.drawImage(bloom(style.glow), W / 2 - 1000 * sk, ty - 40, 2000 * sk, 80);
  ctx.globalCompositeOperation = 'source-over';
  REVEAL[style.reveal](ctx, art, style, t, out, ty - art.h / 2, secs);
  text(ctx, fin.kicker, W / 2, 290, 30, { color: style.kicker ?? style.glow, track: 0.5, alpha: smooth((t - 0.2) / 0.4) * out });
  ctx.globalAlpha = 0.35 * smooth((t - 0.6) / 0.4) * out;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(W / 2 - 1, 640, 2, 150);
  for (let i = 0; i < 3; i++) {
    const k = clamp((t - STAR_AT[i]) / 0.16, 0, 1);
    if (k <= 0) continue;
    const x = 720 + (i - 1) * 104;
    const on = i < fin.stars;
    const sc = on ? 1.8 - 0.8 * k : 1;
    if (on) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.7 * k * out;
      ctx.drawImage(glow('#ffb23a'), x - 70, 690 - 70, 140, 140);
      ctx.globalCompositeOperation = 'source-over';
    }
    text(ctx, '★', x, 692, 84 * sc, { font: FONTS.sans, track: 0, color: on ? '#ffd24a' : 'rgba(255,255,255,0.22)', alpha: k * out });
  }
  text(ctx, 'THE CRITICS', 720, 768, 24, { color: 'rgba(255,255,255,0.7)', alpha: smooth((t - 0.9) / 0.3) * out });
  const c = smooth((t - COUNT[0]) / (COUNT[1] - COUNT[0]));
  if (t >= COUNT[0]) text(ctx, fmt(fin.value * c), 1200, 692, 84, { weight: 800, track: 0.04, alpha: out });
  text(ctx, fin.label, 1200, 768, 24, { color: fin.record ? '#ffd24a' : 'rgba(255,255,255,0.7)', alpha: smooth((t - 1.1) / 0.3) * out });
  if (fin.record) stamp(ctx, 1290, 596, t);
  text(ctx, fin.billing, W / 2, 884, 22, { weight: 600, track: 0.32, color: 'rgba(255,255,255,0.55)', alpha: smooth((t - 1.6) / 0.6) * out });
  ctx.globalAlpha = 1;
}
