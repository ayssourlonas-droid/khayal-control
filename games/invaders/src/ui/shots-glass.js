// The mirror twin's shots in the Glass Cathedral (lasers-view.js hands them here): each ship shot marked `mirror`
// (core/ship.js) is a slim bolt of glass, not a streak: a long thin crystal, pointed at both ends, its left face
// pale and its right face a little deeper, a white thread along its middle and a rim that runs through the
// rainbow, with a short train of three hairline streaks (rose, ice, gold) fanning out behind it the way light
// splits when it leaves a prism, and a glint at the tip. It flies point first along its own velocity. The ship's own
// shots are the ship's warm streaks, so the twin's read apart at once: cooler, slimmer, glassier. The muzzle flash
// is fx (fx/react-glass.js).
import { rgba, cached, lin, glow, star } from './sprites.js';
import { prism, poly, LEAD, PRISM } from './glass-kit.js';

const BOLT = { w: 32, h: 80, cx: 16, cy: 20 }; // the sprite's size and where the shot's own place is in it (its heart)
const TRAIN = { w: 28, h: 120 };
const LEN = [-18, 28]; // the crystal's tip and its tail, from the heart

// The crystal: a long hexagon, widest at a third of the way, 7 px across.
const crystal = () => cached('glassBolt', BOLT.w, BOLT.h, (g) => {
  g.translate(BOLT.cx, BOLT.cy);
  g.lineJoin = 'round';
  const hex = [[0, LEN[0]], [3.6, -8], [3.4, 6], [0, LEN[1]], [-3.4, 6], [-3.6, -8]];
  poly(g, hex);
  g.fillStyle = rgba(LEAD, 0.55); // a dark ground under the panes, so the glass holds against a pale shaft
  g.fill();
  g.lineWidth = 3.4;
  g.strokeStyle = rgba(LEAD, 0.55);
  g.stroke();
  poly(g, [[0, LEN[0]], [-3.6, -8], [-3.4, 6], [0, LEN[1]]]); // the left face, lit
  g.fillStyle = lin(g, 0, LEN[0], 0, LEN[1], [[0, '#ffffff'], [0.5, '#d8f4ff'], [1, '#9ac4ff']]);
  g.fill();
  poly(g, [[0, LEN[0]], [3.6, -8], [3.4, 6], [0, LEN[1]]]); // the right face, deeper
  g.fillStyle = lin(g, 0, LEN[0], 0, LEN[1], [[0, '#e8f8ff'], [0.5, '#9ac8ff'], [1, '#6a8ad8']]);
  g.fill();
  poly(g, hex);
  g.lineWidth = 1.4;
  g.strokeStyle = prism(g, 0, LEN[0], 0, LEN[1]);
  g.stroke();
  g.lineWidth = 1.1; // the white thread
  g.strokeStyle = rgba('#ffffff', 0.95);
  g.beginPath();
  g.moveTo(0, LEN[0] + 3);
  g.lineTo(0, LEN[1] - 4);
  g.stroke();
  g.lineWidth = 0.7; // and one cross-cut
  g.strokeStyle = rgba('#ffffff', 0.55);
  g.beginPath();
  g.moveTo(-3.5, -1);
  g.lineTo(3.5, -1);
  g.stroke();
});

// What a bolt leaves behind: three hairlines that part as they fall away, rose, ice and gold, fading.
const train = () => cached('glassBoltTrain', TRAIN.w, TRAIN.h, (g) => {
  g.translate(TRAIN.w / 2, 0);
  g.lineCap = 'round';
  for (const [c, dx, a] of [[PRISM[0], -1, 0.8], [PRISM[2], 0, 0.95], [PRISM[1], 1, 0.8]]) {
    g.strokeStyle = lin(g, 0, 0, 0, TRAIN.h, [[0, rgba(c, a)], [0.5, rgba(c, a * 0.35)], [1, rgba(c, 0)]]);
    g.lineWidth = dx ? 1.3 : 2;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(dx * 7, TRAIN.h);
    g.stroke();
  }
});

export function warmGlassShots() { // paint the crystal, the train and the glows now, so none is baked at the first shot (warm-glass.js)
  crystal();
  train();
  glow('#bfe8ff');
  glow('#ffffff');
  star('#ffffff');
}

// Every mirror shot in `shots`, drawn about its own place, rotated to fly point first.
export function drawMirrorShots(ctx, shots, t) {
  for (const p of shots) {
    if (!p.mirror) continue;
    const v = Math.hypot(p.vx, p.vy) || 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(p.vx / v, -p.vy / v)); // 0 flies straight up
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.75;
    ctx.drawImage(train(), -TRAIN.w / 2, 6, TRAIN.w, TRAIN.h);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(glow('#bfe8ff'), -22, -30, 44, 60); // the halo
    ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 29 + p.x);
    ctx.drawImage(glow('#ffffff'), -9, -22, 18, 26);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(crystal(), -BOLT.cx, -BOLT.cy, BOLT.w, BOLT.h);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.5 + 0.4 * Math.max(0, Math.sin(t * 17 + p.x * 0.05)); // a glint at the tip
    ctx.drawImage(star('#ffffff'), -9, -29, 18, 18);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
