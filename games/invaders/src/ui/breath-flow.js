// The wind of the breath (world 17): swooping, tapering flow lines, some ending in a little curl, drawn into two baked sprites.
// The FLOW tile (1280 x 240, seamless sideways) is the swirling streaks that run through the band of air at their own pace,
// pale blue and white, a few sky blue so they still show on the bright morning. The WAKE veil (480 x 640, drawn stretched
// to the width of the field) is the clean air the front leaves behind it: a pale blue-white wash, brightest just below the
// front and gone about 600 px down, with long faint streaks in it that the stretch turns into wind. Painted once on first
// use (cache keys `breathFlow`, `breathWake`); nothing here runs per frame.
import { cached, lin, rgba, hash } from './sprites.js';
import { TAU } from '../core/math.js';

export const FLOW_W = 1280;
export const FLOW_H = 240;
export const WAKE_W = 480;
export const WAKE_H = 640;

// One flow line from (x, y), len px long: it heads along +x, weaves by `amp` radians and, when `curl` > 0, rolls up into a small
// curl at its end; w px wide in the middle, tapering to points. Drawn three times (x, x - W, x + W) so a tile stays seamless.
export function swoosh(g, x, y, len, amp, curl, w, color, a, W, phase = 0) {
  const N = 22;
  const px = [];
  let [cx, cy] = [0, 0];
  for (let i = 0; i <= N; i++) {
    px.push(cx, cy);
    const u = i / N;
    const ang = amp * Math.sin(u * Math.PI * 1.3 + phase) + curl * u ** 3 * TAU * 0.55;
    cx += (Math.cos(ang) * len) / N;
    cy += (Math.sin(ang) * len) / N;
  }
  g.fillStyle = rgba(color, a);
  for (const dx of [0, -W, W]) {
    g.beginPath();
    for (let side = 0; side < 2; side++) {
      for (let k = 0; k <= N; k++) {
        const i = side ? N - k : k;
        const j = Math.min(N, i + 1);
        const j0 = Math.max(0, i - 1);
        let [tx, ty] = [px[j * 2] - px[j0 * 2], px[j * 2 + 1] - px[j0 * 2 + 1]];
        const tl = Math.hypot(tx, ty) || 1;
        [tx, ty] = [tx / tl, ty / tl];
        const half = (w / 2) * Math.sin(Math.PI * (0.04 + 0.92 * (i / N))) ** 0.75 * (side ? -1 : 1);
        g.lineTo(x + dx + px[i * 2] - ty * half, y + px[i * 2 + 1] + tx * half);
      }
    }
    g.closePath();
    g.fill();
  }
}

const FLOW_COLORS = ['#ffffff', '#e2f5ff', '#9fd8f5', '#ffffff', '#c8ecff'];

export const flowTile = () => cached('breathFlow', FLOW_W, FLOW_H, (g) => {
  g.save();
  for (let i = 0; i < 20; i++) {
    const r = (j) => hash(i * 17 + j * 5 + 401);
    const x = (i / 20) * FLOW_W + r(1) * 40;
    const y = 16 + r(2) * (FLOW_H - 70);
    const curl = r(3) > 0.62 ? 0.6 + r(4) * 0.7 : 0;
    const tone = Math.floor(r(5) * FLOW_COLORS.length);
    swoosh(g, x, y, 150 + r(6) * 280, 0.1 + r(7) * 0.16, curl, 2.4 + r(8) * 3.4, FLOW_COLORS[tone], tone === 2 ? 0.55 : 0.8, FLOW_W, r(9) * 6);
  }
  g.restore();
});

export const wakeSprite = () => cached('breathWake', WAKE_W, WAKE_H, (g) => {
  g.save();
  g.fillStyle = lin(g, 0, 0, 0, WAKE_H, [[0, rgba('#dff3ff', 0.4)], [0.08, rgba('#d4eeff', 0.32)], [0.3, rgba('#c4e6fa', 0.17)], [0.65, rgba('#b8dcf4', 0.06)], [1, rgba('#b8dcf4', 0)]]);
  g.fillRect(0, 0, WAKE_W, WAKE_H);
  for (let i = 0; i < 38; i++) {
    const r = (j) => hash(i * 13 + j * 7 + 77);
    const y = 6 + r(1) ** 1.7 * (WAKE_H - 60);
    swoosh(g, r(2) * WAKE_W, y, 90 + r(3) * 220, 0.03 + r(4) * 0.05, 0, 2 + r(5) * 6, r(6) > 0.5 ? '#ffffff' : '#e6f6ff', 0.07 + r(7) * 0.12 * (1 - y / WAKE_H), WAKE_W, r(8) * 6);
  }
  g.restore();
});
