// World 13, Sunset Armada, the balloon gun-pod (see w13.js): a stitched red canvas envelope in a net and
// rigging, a wicker gondola with a ship's lamp, and a swivel gun that hangs below pointing at the ship. The
// burner roars in its throat; on one beat the gun is quiet, on the other it kicks back in a flash of fire.
import { path, ink, lin, rad, rgba, shade, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { BRASS, GOLD, HOT, brass, brassV, rope, rivet, puff, sunlit, glint, halo } from './w13-kit.js';
import { cloth } from './w13-9.js';

// The swivel gun: a barrel with a blunderbuss mouth on a brass ball, aimed down, kicked back when it fires.
function gun(b, f) {
  const [ang, len] = [f ? 0.1 : -0.12, f ? 6.8 : 9];
  b.save();
  b.translate(0, 30.2);
  b.rotate(ang);
  path(b, [[-2.5, 0], [2.5, 0], [2.4, len - 3], [4.5, len + 2.4], [-4.5, len + 2.4], [-2.4, len - 3]]);
  ink(b, lin(b, -4, 0, 4, 0, [[0, shade('#5a6478', 0.4)], [0.4, '#4a5468'], [1, '#161a28']]), 2);
  for (const y of [len * 0.3, len * 0.62]) {
    path(b, [[-2.5, y], [2.5, y]], true);
    line(b, BRASS, 1.6);
  }
  ellipse(b, 0, len + 2.4, 4, 1.3);
  b.fillStyle = '#05060c';
  b.fill();
  b.restore();
  ellipse(b, 0, 30.2, 3.8, 3.8);
  ink(b, rad(b, 0, 30.2, 0.5, 4, [[0, '#fff0c0'], [0.5, BRASS], [1, shade(BRASS, -0.6)]], -1, 29.2), 1.8);
  return [-Math.sin(ang) * (len + 2.4), 30.2 + Math.cos(ang) * (len + 2.4)]; // the muzzle
}

// The fire of a shot at the muzzle (x, y): a ragged star in a bloom, white-hot at the heart.
function flash(l, x, y) {
  bloom(l, x, y, 5.6, HOT, 1);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    const r = i % 2 ? 1.9 : 3.8 + (i % 4 === 0 ? 1 : 0);
    l.lineTo(x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r);
  }
  l.closePath();
  l.fillStyle = rad(l, x, y, 0, 5, [[0, '#ffffff'], [0.5, '#ffd27a'], [1, '#ff8a2a']]);
  l.fill();
  l.restore();
  for (const a of [-0.9, 0, 0.9, 1.6]) { // streaks
    l.beginPath();
    l.moveTo(x, y);
    l.lineTo(x + Math.sin(a) * 7, y + Math.cos(a) * 4);
    l.strokeStyle = rgba('#fff0c0', 0.8);
    l.lineWidth = 0.9;
    l.stroke();
  }
}

// A balloon gun-pod: the gun is quiet on beat 0 and fires on beat 1.
export function gunner(b, l, f, c) {
  cloth(b, l, f, c);
  rope(b, -27, -12, 27, -12, 0, 7, 1.3); // the load ring round the cloth
  ellipse(b, 0, 3.8, 7.6, 2.6); // the throat's brass collar
  ink(b, brass(b, -7.6, 7.6), 1.7);
  path(b, [[-3, 5], [3, 5], [2.4, 11], [-2.4, 11]]); // the burner
  ink(b, brassV(b, 5, 11), 1.5);
  both((m) => {
    rope(b, m * 22, -9, m * 11, 16, m * 1.5, 0, 0.8);
    rope(b, m * 14, -5, m * 5, 16, m * 1, 0, 0.8);
  });
  both((m) => { // ballast sacks hung over the sides
    rope(b, m * 13, 19, m * 18, 25, 0, 0, 1);
    ellipse(b, m * 18.4, 28, 3.6, 4.4);
    ink(b, lin(b, m * 15, 24, m * 21, 32, [[0, '#f0dca0'], [1, '#a88a50']]), 1.6);
    path(b, [[m * 16.6, 24.6], [m * 20.2, 24.6]], true);
    line(b, INK, 1.8);
  });
  path(b, [[-14, 16], [14, 16], [11.6, 30], [-11.6, 30]]); // the gondola
  ink(b, lin(b, -14, 0, 14, 0, [[0, '#d8a060'], [0.5, '#a8743a'], [1, '#5a3a1a']]), 2.4);
  b.save();
  b.clip();
  for (let y = 19; y < 31; y += 3) { // basket weave
    path(b, [[-14, y], [14, y]], true);
    line(b, rgba('#3a2010', 0.5), 0.9);
    for (let xx = -13 + ((y / 3) % 2) * 2; xx < 14; xx += 4) {
      path(b, [[xx, y], [xx, y + 3]], true);
      line(b, rgba('#3a2010', 0.35), 0.8);
    }
  }
  sunlit(b, 24, 31, 0.5);
  b.restore();
  path(b, [[-14.6, 15], [14.6, 15], [14.2, 18.6], [-14.2, 18.6]]); // the brass rail
  ink(b, brassV(b, 15, 19), 1.7);
  for (const xx of [-11, -4, 4, 11]) rivet(b, xx, 16.8, 0.9);
  ellipse(b, 0, 24.4, 3.4, 3.4); // the ship's lamp in a porthole
  ink(b, rad(b, 0, 24.4, 0.4, 3.4, [[0, '#fff0c0'], [0.6, '#e8a040'], [1, '#6a3a10']]), 1.4);
  b.beginPath();
  b.arc(0, 24.4, 3.4, 0, Math.PI * 2);
  line(b, BRASS, 1);
  const [mx, my] = gun(b, f);
  if (f) {
    puff(b, -8.4, 37.6, 2.6);
    puff(b, 9.6, 41.4, 2);
  }
  gloss(b, -8, 20, 4, 1.4, 0.35, -0.2);
  const flame = (k, col, a) => { // the burner's flame leans with the beat
    l.beginPath();
    l.moveTo(-2 * k, 11);
    l.bezierCurveTo(-3.4 * k, 8, -1.6 * k, 4, (f ? 1.6 : -1.6) * k, 0.6 - (f ? 0 : 1.6));
    l.bezierCurveTo(2.6 * k, 4, 3.2 * k, 8, 2 * k, 11);
    l.closePath();
    l.fillStyle = rgba(col, a);
    l.fill();
  };
  l.save();
  l.globalCompositeOperation = 'lighter';
  flame(1, HOT, 0.95);
  flame(0.55, '#fff6d0', 1);
  l.restore();
  bloom(l, 0, 7, 12, HOT, 0.7);
  halo(l, 0, 24.4, 3, 11, GOLD, 0.6);
  glint(l, 0, 24.4, 3, '#fff6d0', 0.9);
  bloom(l, mx, my, 3.6, HOT, f ? 0.5 : 0.35); // an ember in the bore
  if (f) flash(l, mx, my + 0.8);
}
