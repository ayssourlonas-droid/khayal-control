// World 8, Event Horizon: the Singularity. A black hole that fights: a perfect black shadow ringed
// by a thin gold photon ring, the far side of its accretion disk bent up over it and under it by its
// own gravity, the near disk streaming out left and right as burning bands, polar jets of blue-white
// plasma, and two cracked moons being torn apart in its pull (weak points burn gold). The darkened
// sky round it carries an Einstein ring of bent starlight; the disk turns, faster as it rages, and
// heats from gold toward white-blue.
import { path, lin, rad, line, eye, bloom, rgba, shade, TAU } from './kit.js';
import { cached, hash, star } from '../sprites.js';

const GOLD = '#ffd28a';
const HOT = '#fff0c8';
const BLUE = '#8fb8ff';
const ORANGE = '#ffb36a';

function ring(l, rx, ry, c, w, a, from = 0, to = TAU) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  for (const [k, al] of [[4, 0.12], [2, 0.3], [1, 1]]) {
    l.beginPath();
    l.ellipse(0, 0, rx, ry, 0, from, to);
    l.lineWidth = w * k;
    l.strokeStyle = rgba(c, a * al);
    l.stroke();
  }
  l.restore();
}

function hull(b, l) {
  b.fillStyle = rad(b, 0, 10, 0, 260, [[0, 'rgba(0,0,4,0.95)'], [0.45, 'rgba(2,2,10,0.72)'], [1, 'rgba(2,2,10,0)']]);
  b.fillRect(-300, -250, 600, 520);
  l.save();
  l.translate(0, 10);
  ring(l, 180, 172, '#c8d8ff', 1.2, 0.35);
  for (let i = 0; i < 40; i++) {
    const a = hash(i * 3) * TAU;
    const r = 150 + 90 * hash(i * 7);
    l.beginPath();
    l.ellipse(0, 0, r, r * 0.96, 0, a, a + 0.12 + 0.25 * hash(i));
    l.lineWidth = 1.2;
    l.strokeStyle = rgba(i % 4 ? '#c8d8ff' : HOT, 0.5);
    l.stroke();
  }
  ring(l, 290, 52, ORANGE, 2, 0.25);
  l.restore();
}

// The black hole: a hard shadow filling the hit box, ringed by a thick white-gold photon ring, the
// far disk lensed into arcs above and below, a dark skirt round it hiding the sky's own (faint)
// hole; nothing glows inside the shadow, so it is the one black disc that reads as the target (R29).
const SHADOW = 57;
function core(b, l) {
  b.beginPath();
  b.arc(0, 0, SHADOW + 16, 0, TAU);
  b.fillStyle = rad(b, 0, 0, SHADOW, SHADOW + 16, [[0, 'rgba(0,0,0,0.9)'], [1, 'rgba(0,0,0,0)']]);
  b.fill();
  b.beginPath();
  b.arc(0, 0, SHADOW, 0, TAU);
  b.fillStyle = '#000000';
  b.fill();
  l.save();
  l.globalCompositeOperation = 'lighter';
  for (const s of [-1, 1]) {
    l.beginPath();
    l.ellipse(0, s * 8, 78, 68, 0, s < 0 ? Math.PI : 0, s < 0 ? TAU : Math.PI);
    l.lineWidth = 10;
    l.strokeStyle = lin(l, -78, 0, 78, 0, [[0, rgba(HOT, 0.9)], [0.5, rgba(GOLD, 0.6)], [1, rgba(ORANGE, 0.35)]]);
    l.stroke();
  }
  l.restore();
  ring(l, SHADOW + 4, SHADOW + 4, GOLD, 3.2, 1);
  ring(l, SHADOW + 2, SHADOW + 2, '#ffffff', 1.8, 1);
  bloom(l, -44, 0, 70, HOT, 0.35);
  l.save();
  l.globalCompositeOperation = 'destination-out';
  l.beginPath();
  l.arc(0, 0, SHADOW, 0, TAU);
  l.fill();
  l.restore();
}

// The near disk (drawn as the left one): a burning band thinning outward, hotter near the hole.
function disk(b, l, p) {
  const w = p.w;
  const band = [[w / 2, -14], [-w / 2 + 30, -6], [-w / 2, 0], [-w / 2 + 30, 6], [w / 2, 16]];
  path(b, band);
  b.fillStyle = lin(b, -w / 2, 0, w / 2, 0, [[0, '#14182e'], [0.6, '#3a2a3a'], [1, '#5a3a20']]);
  b.fill();
  line(b, rgba('#000000', 0.6), 2);
  l.save();
  l.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const y = -10 + i * 2.6;
    path(l, [[w / 2 - 4, y * 1.1], [-w / 2 + 20 + 40 * hash(i), y * 0.5]], true);
    l.lineWidth = 1.6 + (i % 3);
    l.strokeStyle = lin(l, -w / 2, 0, w / 2, 0, [[0, rgba(ORANGE, 0)], [0.5, rgba(GOLD, 0.45)], [1, rgba(HOT, 0.95)]]);
    l.stroke();
  }
  l.restore();
  bloom(l, w / 2 - 10, 2, 46, HOT, 0.5);
}

// A polar jet: a column of plasma with bright knots; the south jet burns gold-hot (weak), the north
// one cold blue (armour).
const jetOf = (c, hot) => (b, l, p) => {
  const h = p.h / 2;
  const dir = c === BLUE ? -1 : 1;
  path(b, [[-8, -dir * h], [8, -dir * h], [20, dir * h], [-20, dir * h]]);
  b.fillStyle = lin(b, 0, -dir * h, 0, dir * h, [[0, rgba(shade(c, -0.5), 0.9)], [1, rgba(shade(c, -0.8), 0.4)]]);
  b.fill();
  l.save();
  l.globalCompositeOperation = 'lighter';
  for (const [w, a] of [[30, 0.18], [14, 0.4], [5, 0.9]]) {
    path(l, [[0, -dir * h], [0, dir * h]], true);
    l.lineWidth = w;
    l.strokeStyle = lin(l, 0, -dir * h, 0, dir * h, [[0, rgba(hot, a)], [1, rgba(c, a * 0.2)]]);
    l.stroke();
  }
  l.restore();
  for (let i = 0; i < 4; i++) eye(l, 0, dir * (-h + 18 + i * 26), 3 - i * 0.4, hot, 2.6);
};

// A moon being torn apart: grey rock, a dark night side, glowing gold cracks.
function moon(b, l) {
  b.beginPath();
  b.arc(0, 0, 30, 0, TAU);
  b.fillStyle = rad(b, 0, 0, 2, 32, [[0, '#a8a8b8'], [0.7, '#5a5a6a'], [1, '#14141c']], -10, -10);
  b.fill();
  line(b, '#06060c', 3);
  for (let i = 0; i < 5; i++) {
    b.beginPath();
    b.arc(-10 + 22 * hash(i), -8 + 20 * hash(i * 3), 3 + 4 * hash(i * 5), 0, TAU);
    b.fillStyle = rgba('#000000', 0.25);
    b.fill();
  }
  const cracks = [[[22, -14], [6, -2], [12, 10], [-4, 22]], [[6, -2], [-12, -6], [-24, 4]]];
  for (const c of cracks) {
    path(b, c, true);
    line(b, '#140a04', 3);
    path(l, c, true);
    l.save();
    l.globalCompositeOperation = 'lighter';
    l.lineWidth = 2;
    l.strokeStyle = rgba(GOLD, 0.95);
    l.stroke();
    l.restore();
  }
  bloom(l, 8, 4, 40, GOLD, 0.35);
}

// The disk's swirl: streaks round a hole, cached once, drawn flattened and turning.
const swirl = () => cached('singularitySwirl', 256, 256, (g) => {
  g.translate(128, 128);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) {
    const r = 46 + 80 * hash(i * 7);
    const a = hash(i * 3) * TAU;
    g.beginPath();
    g.arc(0, 0, r, a, a + 0.4 + 0.8 * hash(i));
    g.lineWidth = 1 + 2 * hash(i * 5);
    g.strokeStyle = rgba(r < 80 ? HOT : i % 3 ? GOLD : ORANGE, 0.25 + 0.35 * (1 - (r - 46) / 80));
    g.stroke();
  }
});

const flare = (a, c) => (l) => {
  bloom(l, 0, 14, 300, c, a);
  ring(l, 290, 52, c, 3, a * 1.6);
};

export default {
  pad: 70,
  hull,
  parts: { core, disk, jetN: jetOf(BLUE, '#e8f0ff'), jet: jetOf(GOLD, HOT), moon },
  rage: [null, flare(0.18, GOLD), flare(0.28, BLUE)],
  // The disk turning (faster each phase), and bent starlight sliding round the ring.
  live(ctx, b, t, k) {
    ctx.save();
    ctx.translate(0, 14);
    ctx.scale(1, 0.2);
    ctx.rotate(t * (0.5 + 0.35 * b.phase));
    ctx.globalAlpha = k * 0.75;
    ctx.drawImage(swirl(), -300, -300, 600, 600);
    ctx.restore();
    for (let i = 0; i < 4; i++) {
      const a = t * 0.4 + (i / 4) * TAU;
      const r = 8 + 6 * Math.sin(t * 2 + i);
      ctx.globalAlpha = k * 0.8;
      ctx.drawImage(star(i % 2 ? HOT : '#c8d8ff'), Math.cos(a) * 180 - r, 10 + Math.sin(a) * 172 - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  },
};
