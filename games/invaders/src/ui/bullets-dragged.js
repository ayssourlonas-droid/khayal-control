// A dragged bullet in Anvil Sky (world 18; bullets-view.js hands it here): an enemy homing bullet the ship's flying has pulled 45 degrees
// off its first course (core/collide.js dragBullets, `b.dragged`) now belongs to the ship, and is drawn as theirs: not the rose
// seeker's dark-ringed orb but a bright orb of the ship's own cyan (look.palette.accent) with a white-hot heart, a broken ring of
// jagged electric arcs turning round it, and a comet of four fading lights along the path it has just flown (taken from its own
// velocity), all lit additively in cyan; a dark rim and a dark ground under the arcs keep it readable on the dark indigo and on the
// orange horizon alike. Baked once per colour, a handful of cached draws per bullet, no shadow blur, nothing allocated.
import { INK, cached, glow, rgba, shade, rad } from './sprites.js';
import { arcPath } from './storm-bolt.js';
import { TAU } from '../core/math.js';

const TRAIL = 4;
const BACK = 0.05; // s of its own velocity between one light of the comet and the next

const core = (c) => cached(`dragCore${c}`, 36, 36, (g) => {
  g.fillStyle = 'rgba(2,24,34,0.95)';
  g.beginPath();
  g.arc(18, 18, 12, 0, TAU);
  g.fill();
  g.fillStyle = rad(g, 18, 18, 0, 10, [[0, '#ffffff'], [0.32, '#ffffff'], [0.6, c], [1, shade(c, -0.3)]]);
  g.beginPath();
  g.arc(18, 18, 10, 0, TAU);
  g.fill();
  g.fillStyle = rgba('#ffffff', 0.85);
  g.beginPath();
  g.arc(14.6, 14.4, 2, 0, TAU);
  g.fill();
});

// The ring: three arcs of the circle, each a jagged line of eight kinks, with a dark ground, the colour and a white thread.
const ring = (c) => cached(`dragRing${c}`, 56, 56, (g) => {
  const R = 20;
  for (const [w, style] of [[5, rgba(INK, 0.55)], [2.6, c], [1.1, '#ffffff']]) {
    g.beginPath();
    for (let i = 0; i < 3; i++) {
      const a0 = (i * TAU) / 3 + 0.25;
      const a1 = a0 + 1.55;
      arcPath(g, 28 + Math.cos(a0) * R, 28 + Math.sin(a0) * R, 28 + Math.cos(a1) * R, 28 + Math.sin(a1) * R, 7, 3.2, i * 13 + 4);
    }
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = style;
    g.lineWidth = w;
    g.stroke();
  }
  for (let i = 0; i < 3; i++) { // a spur leaving the head of each arc
    const a = (i * TAU) / 3 + 1.8;
    g.beginPath();
    arcPath(g, 28 + Math.cos(a) * R, 28 + Math.sin(a) * R, 28 + Math.cos(a + 0.1) * (R + 6), 28 + Math.sin(a + 0.1) * (R + 6), 2, 1.6, i + 40);
    g.strokeStyle = rgba(c, 0.9);
    g.lineWidth = 1.4;
    g.stroke();
  }
});

export function warmDragged(look) { // paint the orb, the ring and the light now, so none is baked at the first dragged bullet (warm-storm.js)
  const c = look.palette.accent;
  core(c);
  ring(c);
  glow(c);
}

// One dragged bullet. `m` is the transform the list is drawn under (restored after the turned ring); phase is the bullet's own
// animation offset (bullets-view.js phaseOf); quality below 1 drops the comet.
export function drawDragged(ctx, m, b, look, t, phase, quality) {
  const c = look.palette.accent;
  if (quality >= 1) {
    ctx.globalCompositeOperation = 'lighter';
    for (let k = TRAIL; k >= 1; k--) {
      const r = 16 - k * 2.4;
      ctx.globalAlpha = 0.6 - k * 0.12;
      ctx.drawImage(glow(c), b.x - b.vx * BACK * k - r, b.y - b.vy * BACK * k - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.translate(b.x, b.y);
  ctx.rotate(t * 6 + phase);
  ctx.drawImage(ring(c), -28, -28);
  ctx.setTransform(m);
  const s = 1 + 0.12 * Math.sin(t * 14 + phase);
  const w = 36 * s;
  ctx.drawImage(core(c), b.x - w / 2, b.y - w / 2, w, w);
}
