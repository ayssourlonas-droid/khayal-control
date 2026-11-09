// The trident's shots in Lantern Deep (lasers-view.js hands them here): each ship shot marked `trident` (core/ship.js)
// is a glowing three-pronged bolt, not a streak: a barbed head of aqua-white light fringed in violet, its shaft
// trailing a long wake of aqua light with a few rings of bubbles rising out of it. It flies point first along its
// own velocity, and burns brighter for every alien or boss part it has run through (`pierced`). The spark where it
// passes through each one is fx (fx/react-deep.js). The ship's other shots are the ship's own streaks.
import { INK, rgba, cached, lin, glow, star } from './sprites.js';
import { TAU } from '../core/math.js';

const AQUA = '#5af0ff';
const VIOLET = '#9a7cff';
const HEAD = { w: 40, h: 60, cx: 20, cy: 17 }; // the head's size on the screen and where its middle (the shot's place) is in it

// A tine as a lance from base (x, by) up to tip (x, ty), w wide at the base; barbs are [y, side] pairs hooking inward.
function tine(g, x, by, ty, w, barbs) {
  const pts = [[x, by + 4], [x - w / 2, by], [x - w / 2, ty + 14], [x, ty], [x + w / 2, ty + 14], [x + w / 2, by]];
  g.moveTo(...pts[0]);
  for (const p of pts.slice(1)) g.lineTo(...p);
  g.closePath();
  for (const [y, side] of barbs) {
    const e = x + side * w / 2;
    g.moveTo(e, y - 5);
    g.lineTo(e + side * 5.5, y + 1);
    g.lineTo(e, y + 6);
    g.closePath();
  }
}

// The head, 80 x 120 (shown at half that), tip up: a middle tine, two outer tines on a curved yoke, a short shaft.
const head = () => cached('deepTridentHead', 80, 120, (g) => {
  g.lineJoin = 'round';
  const outline = () => {
    g.beginPath();
    tine(g, 40, 56, 4, 7, [[24, -1], [24, 1]]);
    tine(g, 14, 42, 12, 6, [[26, 1]]);
    tine(g, 66, 42, 12, 6, [[26, -1]]);
    g.moveTo(37, 112);
    g.lineTo(43, 112);
    g.lineTo(42, 52);
    g.lineTo(38, 52);
    g.closePath();
  };
  outline();
  g.lineWidth = 9;
  g.strokeStyle = rgba(VIOLET, 0.55); // the violet fringe
  g.stroke();
  g.beginPath(); // the yoke
  g.moveTo(14, 42);
  g.quadraticCurveTo(40, 70, 66, 42);
  g.lineCap = 'round';
  g.lineWidth = 11;
  g.strokeStyle = rgba(VIOLET, 0.55);
  g.stroke();
  g.lineWidth = 8;
  g.strokeStyle = INK;
  g.stroke();
  g.lineWidth = 5;
  g.strokeStyle = lin(g, 14, 0, 66, 0, [[0, '#2a9ac8'], [0.5, '#c8ffff'], [1, '#2a9ac8']]);
  g.stroke();
  outline();
  g.lineWidth = 3;
  g.strokeStyle = INK;
  g.stroke();
  g.fillStyle = lin(g, 0, 4, 0, 112, [[0, '#ffffff'], [0.22, '#b8fbff'], [0.5, '#4fe0f2'], [1, '#1a78a8']]);
  g.fill();
  g.lineWidth = 1.4;
  g.strokeStyle = rgba('#ffffff', 0.9); // the white-hot line down each tine
  g.beginPath();
  for (const [x, y0, y1] of [[40, 8, 54], [14, 16, 40], [66, 16, 40]]) {
    g.moveTo(x, y0);
    g.lineTo(x, y1);
  }
  g.stroke();
});

const ring = () => cached('deepTridentRing', 16, 16, (g) => {
  g.lineWidth = 1.4;
  g.strokeStyle = rgba('#d8fbff', 0.9);
  g.beginPath();
  g.arc(8, 8, 5.4, 0, TAU);
  g.stroke();
  g.fillStyle = rgba('#ffffff', 0.9);
  g.fillRect(5.4, 4.6, 1.8, 1.4);
});

export function warmTrident() { // paint the head, the ring and the glows now, so none is baked at the first shot (warm-deep.js)
  head();
  ring();
  glow(AQUA);
  glow('#ffffff');
  star('#ffffff');
}

// Every trident shot in `shots`, drawn about its own place, rotated to fly head first.
export function drawTridents(ctx, shots, t) {
  for (const p of shots) {
    if (!p.trident) continue;
    const v = Math.hypot(p.vx, p.vy) || 1;
    const lit = Math.min(1, (p.pierced?.length ?? 0) / 2); // 0 .. 1: brighter for each alien run through
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(p.vx / v, -p.vy / v)); // 0 flies straight up
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.5;
    ctx.drawImage(glow(AQUA), -11, 8, 22, 140); // the wake, behind the head
    ctx.globalAlpha = 0.85;
    ctx.drawImage(glow('#ffffff'), -4, 6, 8, 64);
    for (let k = 0; k < 4; k++) { // rings of bubbles, leaving the wake and drifting aside as they fall behind
      const u = ((t * 1.7 + k * 0.25 + p.x * 0.013) % 1 + 1) % 1;
      ctx.globalAlpha = 0.7 * (1 - u);
      ctx.drawImage(ring(), (k % 2 ? 1 : -1) * (4 + u * 9) - 8, 22 + u * 110, 16 * (1 - u * 0.4), 16 * (1 - u * 0.4));
    }
    ctx.globalAlpha = 0.8 + 0.2 * lit + 0.08 * Math.sin(t * 31 + p.x);
    ctx.drawImage(glow(AQUA), -38, -40, 76, 76); // the halo
    ctx.globalAlpha = 0.42 + 0.4 * lit;
    ctx.drawImage(glow('#ffffff'), -20, -24, 40, 40);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(head(), -HEAD.cx, -HEAD.cy, HEAD.w, HEAD.h);
    if (lit > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.85 * lit;
      ctx.drawImage(star('#ffffff'), -17, -33, 34, 34); // a flare at the tip of the middle tine
    }
    ctx.restore();
  }
}
