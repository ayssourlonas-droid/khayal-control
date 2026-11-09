// The two flights of glass the mending's fx rings carry (fx/react-glass.js adds them, fx-view.js hands them here; each
// is ONE ring of kind 'mend' or 'scatter' that draws itself from its age, so no particle is spent and the cap is never
// touched):
//   'mend'     the stand-up. The sixteen pieces of the wreck (mending-view.js) fly together from exactly where the cloud
//              left them (same seed, age = WRECK_TIME), spiralling in faster and faster, each with a short glint of its
//              own colour behind it; as they arrive a flash of coloured light blooms over the gargoyle and a rainbow
//              ring opens round it.
//   'scatter'  a wreck shot down. The pieces fly out of the cloud, tumbling and falling, each flashing a glint as it
//              turns, fading as they go, behind a quick white flash.
// A ring is { x, y, seed, life, max, color }: u = 1 - life / max is its age as a share of its life. Cached sprites only.
import { glow, star, hash } from './sprites.js';
import { smooth, TAU } from '../core/math.js';
import { WRECK_TIME } from '../core/twists-2.js';
import { PIECES, pieceAt, drawPiece } from './mending-view.js';
import { GLASSES } from './shard-sprites.js';
import { PRISM } from './glass-kit.js';

const at = { x: 0, y: 0, z: 0, rot: 0, scale: 1 };
const tint = (i) => (PIECES[i].kind === 'chip' ? '#d8f4ff' : GLASSES[PIECES[i].color]);

export function drawMend(ctx, r) {
  const u = 1 - r.life / r.max;
  const k = u < 0.8 ? (u / 0.8) ** 2 : 1; // the flight accelerates
  const gone = 1 - smooth((u - 0.78) / 0.15);
  const flash = smooth((u - 0.62) / 0.2) * (1 - smooth((u - 0.86) / 0.14));
  for (let i = 0; i < PIECES.length; i++) {
    pieceAt(i, r.seed, WRECK_TIME, at);
    const turn = -k * 1.5; // it spirals in
    const [c, s] = [Math.cos(turn), Math.sin(turn)];
    const f = 1 - k;
    const [x, y] = [r.x + (at.x * c - at.y * s) * f, r.y + (at.x * s + at.y * c) * f];
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.5 * gone * Math.min(1, k * 4);
    ctx.drawImage(glow(tint(i)), x - 11, y - 11, 22, 22);
    if (k > 0.05) { // a glint trailing behind, where it was a moment ago
      const g = Math.max(0, k - 0.12);
      ctx.globalAlpha *= 0.6;
      ctx.drawImage(glow(tint(i)), r.x + at.x * (1 - g) - 7, r.y + at.y * (1 - g) - 7, 14, 14);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = gone;
    drawPiece(ctx, i, x, y, at.rot + k * 6, at.scale * (1 - 0.5 * k));
  }
  ctx.globalCompositeOperation = 'lighter';
  if (flash > 0) {
    ctx.save();
    ctx.globalAlpha = flash;
    ctx.drawImage(glow('#ffe9b0'), r.x - 100, r.y - 100, 200, 200);
    ctx.drawImage(glow('#ffffff'), r.x - 56, r.y - 56, 112, 112);
    const open = smooth((u - 0.7) / 0.3);
    ctx.lineWidth = 2.4;
    PRISM.forEach((c, j) => { // a rainbow ring: the colours a little apart
      ctx.strokeStyle = c;
      ctx.globalAlpha = flash * 0.8;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 14 + 78 * open + j * 3.5, 0, TAU);
      ctx.stroke();
    });
    for (let j = 0; j < 6; j++) {
      const a = j * (TAU / 6) + hash(r.seed + j) * 2;
      ctx.globalAlpha = flash * 0.9;
      ctx.drawImage(star('#ffffff'), r.x + Math.cos(a) * 36 * flash - 9, r.y + Math.sin(a) * 36 * flash - 9, 18, 18);
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

export function drawScatter(ctx, r) {
  const u = 1 - r.life / r.max;
  const fly = 1 - (1 - u) ** 2.2;
  const fade = 1 - smooth((u - 0.55) / 0.45);
  const burst = Math.max(0, 1 - u / 0.2);
  for (let i = 0; i < PIECES.length; i++) {
    pieceAt(i, r.seed, r.age ?? 0.9, at);
    const a = Math.atan2(at.y, at.x) + hash(i + 40) * 0.8 - 0.4;
    const v = 70 + hash(i * 3 + 5) * 150;
    const [x, y] = [r.x + at.x + Math.cos(a) * v * fly, r.y + at.y + Math.sin(a) * v * fly * 0.8 + 260 * u * u];
    ctx.globalAlpha = fade;
    drawPiece(ctx, i, x, y, at.rot + u * (5 + hash(i) * 8), at.scale * (1 - 0.3 * u));
    const glint = Math.sin(u * 26 + i * 2.3);
    if (glint <= 0.55) continue; // flashes as it turns to the light
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(1, (glint - 0.55) * 4) * fade;
    ctx.drawImage(star('#ffffff'), x - 9, y - 9, 18, 18);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (burst > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = burst;
    ctx.drawImage(glow('#ffffff'), r.x - 60, r.y - 60, 120, 120);
    ctx.drawImage(glow(r.color), r.x - 90, r.y - 90, 180, 180);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1;
}
