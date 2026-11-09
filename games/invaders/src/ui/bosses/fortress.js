// World 3, Twin Suns: the Star fortress. A long armoured battle station seen from below, pale
// painted metal lit cold from the sky and hot from the two suns underneath (the aliens' light). A
// dish emitter on its upper deck, radiator fins balancing it, two blast shields flanking a deep
// trench cut up into its belly, and orange-hot gun turrets at its ends (the weak points). The trench
// ends in a sealed reactor port; in the last phase its doors slide apart, the trench lights run
// toward it and the port burns open: the one place to finish it.
import { path, sym, ink, lin, rad, line, eye, bloom, rgba, shade, rrect, plate, rivetRect, seams, slats, muzzle, cone, TAU } from './kit.js';
import { glow, hash } from '../sprites.js';

const SUN = '#ffb070';
const HOT = '#ff6a3a';
const GREEN = '#7aff6a';
const CYAN = '#8ad8ff';
const METAL = '#8a9aa8';

const paint = (g, c, top, bot) => lin(g, 0, top, 0, bot, [[0, shade(c, 0.4)], [0.4, c], [0.85, shade(c, -0.4)], [1, shade(SUN, -0.3)]]);
const SLAB = [[0, -128], [292, -128], [366, -52], [376, 40], [330, 104], [0, 104]];

function sunRim(g, pts, a = 0.8) {
  path(g, pts, true);
  line(g, rgba(SUN, a), 2);
}

function hull(b, l) {
  path(b, sym(SLAB));
  ink(b, paint(b, '#5a6070', -128, 104), 3.5);
  seams(b, [[[-366, -52], [366, -52]], [[-376, 10], [376, 10]], [[-290, -90], [290, -90]]]);
  for (let x = -340; x <= 340; x += 40) seams(b, [[[x, -128 + (Math.abs(x) > 290 ? 60 : 0)], [x, -52]]], 0.3, 1.2);
  for (let i = 0; i < 46; i++) {
    const x = (hash(i * 3 + 1) - 0.5) * 680;
    const y = -120 + hash(i * 3 + 2) * 210;
    if (Math.abs(x) < 60 && y > -40) continue;
    b.fillStyle = rgba(hash(i) < 0.5 ? '#000000' : '#ffffff', 0.1 + 0.12 * hash(i * 9));
    b.fillRect(x, y, 6 + 18 * hash(i * 5), 4 + 8 * hash(i * 7));
  }
  rrect(b, 110, -122, 190, 62, 4);
  ink(b, paint(b, '#4a505e', -122, -60), 2.5);
  slats(b, 110, -122, 190, 62, 19, 0.7, 2);
  for (let x = 130; x < 300; x += 46) eye(l, x, -122, 1.6, '#ff3a2a', 3);
  // The trench: a slot cut up into the belly, walls stepped with ledges.
  path(b, [[-48, 104], [-48, -30], [-30, -44], [30, -44], [48, -30], [48, 104]]);
  b.fillStyle = lin(b, -48, 0, 48, 0, [[0, '#0e1016'], [0.2, '#262a34'], [0.5, '#12141a'], [0.8, '#262a34'], [1, '#0e1016']]);
  b.fill();
  line(b, '#0a0c16', 3);
  for (let y = -30; y < 100; y += 14) seams(b, [[[-46, y], [-36, y]], [[36, y], [46, y]]], 0.6, 2);
  l.fillStyle = rgba(CYAN, 0.8);
  for (let y = -96; y <= -64; y += 16) for (let x = -280; x <= 280; x += 14) if (hash(x * 7 + y) < 0.55) l.fillRect(x, y, 5, 3);
  sunRim(b, [[-376, 40], [-330, 104], [330, 104], [376, 40]]);
  for (const s of [-1, 1]) for (const y of [-10, 20]) eye(l, s * 372, y, 4, SUN, 3);
}

// The dish emitter: a concave bowl in a heavy ring, ribbed, a green focusing crystal at its heart.
function dish(b, l) {
  path(b, [[40, 30], [70, 62], [40, 62]]);
  ink(b, paint(b, '#5a6070', 30, 62), 2.5);
  b.beginPath();
  b.ellipse(0, -4, 76, 56, 0, 0, TAU);
  ink(b, paint(b, METAL, -60, 52), 3.5);
  b.beginPath();
  b.ellipse(0, -4, 62, 44, 0, 0, TAU);
  b.fillStyle = rad(b, 0, 8, 4, 70, [[0, '#c8d0d8'], [0.5, '#6a7480'], [1, '#2a2e38']], 0, 20);
  b.fill();
  line(b, '#0a0c16', 2.5);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    path(b, [[Math.cos(a) * 10, -4 + Math.sin(a) * 8], [Math.cos(a) * 60, -4 + Math.sin(a) * 42]], true);
    line(b, rgba('#000000', 0.35), 1.4);
  }
  b.beginPath();
  b.ellipse(0, -4, 30, 21, 0, 0, TAU);
  line(b, rgba('#000000', 0.4), 1.4);
  muzzle(b, l, 0, -4, 9, GREEN);
  bloom(l, 0, -4, 60, GREEN, 0.25);
  sunRim(b, [[-60, 30], [0, 52], [60, 30]], 0.7);
}

// A blast shield (drawn as the left one): layered plates with chamfered corners, rivets, a row
// of ports and the suns' hot rim along its belly.
function shield(b, l, p) {
  const w = p.w;
  const h = p.h;
  path(b, [[-w / 2 + 18, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2 + 6, h / 2], [-w / 2, h / 2 - 22], [-w / 2, -h / 2 + 18]]);
  ink(b, paint(b, METAL, -h / 2, h / 2), 3.5);
  plate(b, -w / 2 + 14, -h / 2 + 14, w - 28, 40, 5, shade(METAL, -0.15), 2.5);
  plate(b, -w / 2 + 14, -h / 2 + 60, w - 28, h - 74, 5, shade(METAL, -0.05), 2.5);
  rivetRect(b, -w / 2 + 14, -h / 2 + 60, w - 28, h - 74, 22, 1.8);
  seams(b, [[[-w / 2 + 50, -h / 2 + 14], [-w / 2 + 50, -h / 2 + 54]], [[w / 2 - 50, -h / 2 + 14], [w / 2 - 50, -h / 2 + 54]]]);
  for (let x = -w / 2 + 26; x < w / 2 - 20; x += 16) {
    b.fillStyle = '#10141c';
    b.fillRect(x, -h / 2 + 30, 8, 6);
    l.fillStyle = rgba(CYAN, 0.75);
    l.fillRect(x + 1, -h / 2 + 31, 6, 4);
  }
  sunRim(b, [[-w / 2 + 6, h / 2], [w / 2, h / 2]]);
}

// A gun turret (drawn as the left one): a domed housing with its power cell burning orange through
// vents, twin barrels angled down and out, muzzles hot.
function turret(b, l) {
  for (const dx of [-14, 2]) {
    path(b, [[dx - 6, 4], [dx - 18, 38], [dx - 8, 40], [dx + 4, 6]]);
    ink(b, paint(b, '#4a505e', 4, 40), 2.5);
    eye(l, dx - 13, 39, 3, HOT, 2.5);
  }
  b.beginPath();
  b.ellipse(0, -2, 44, 26, 0, Math.PI, 0);
  b.lineTo(44, 10);
  b.lineTo(-44, 10);
  b.closePath();
  ink(b, paint(b, METAL, -28, 10), 3);
  rrect(b, -24, -14, 48, 16, 6);
  ink(b, '#1a0c08', 2.5);
  for (let x = -18; x <= 14; x += 8) {
    l.fillStyle = rgba(HOT, 0.95);
    l.fillRect(x, -11, 4, 10);
  }
  bloom(l, 0, -6, 46, HOT, 0.55);
  eye(l, 0, -6, 4, '#ffe0c0', 3);
  sunRim(b, [[-44, 10], [44, 10]]);
}

// The reactor port, sealed: two heavy doors meeting in the trench, hazard chevrons on their edges.
function port(b, l, p) {
  const w = p.w;
  const h = p.h;
  rrect(b, -w / 2, -h / 2, w, h, 6);
  ink(b, paint(b, '#6a7280', -h / 2, h / 2), 3);
  for (const s of [-1, 1]) {
    for (let y = -h / 2 + 8; y < h / 2 - 8; y += 14) {
      path(b, [[s * 2, y], [s * 10, y + 7], [s * 2, y + 14]], true);
      line(b, s < 0 ? '#e8b030' : '#1a1a1a', 3);
    }
    rivetRect(b, s < 0 ? -w / 2 : 0, -h / 2, w / 2, h, 20, 1.6);
  }
  path(b, [[0, -h / 2], [0, h / 2]], true);
  line(b, '#06080c', 3);
}

// The port open: rings stepping down into a white-hot reactor.
function portOpen(b, l, p) {
  rrect(b, -p.w / 2, -p.h / 2, p.w, p.h, 6);
  ink(b, '#14080a', 3);
  l.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    for (const [g, c, w] of [[b, rgba(shade(HOT, -0.3), 0.8), 2.5], [l, rgba(i > 2 ? '#ffe0a0' : HOT, 0.4 + i * 0.12), 2]]) {
      g.beginPath();
      g.ellipse(0, 0, 30 - i * 5, 40 - i * 7, 0, 0, TAU);
      line(g, c, w);
    }
  }
  l.globalCompositeOperation = 'source-over';
  eye(l, 0, 0, 12, '#ffd0a0', 4);
  bloom(l, 0, 0, 70, HOT, 0.7);
}

// The trench lit for the run: lamps down both walls, the floor glowing toward the port.
function trenchLights(l) {
  for (let y = -26; y < 100; y += 12) {
    for (const s of [-1, 1]) eye(l, s * 42, y, 2, y < 10 ? '#ffd0a0' : HOT, 2.6);
  }
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = lin(l, 0, -40, 0, 104, [[0, rgba(HOT, 0.05)], [0.6, rgba(HOT, 0.25)], [1, rgba(SUN, 0.4)]]);
  l.fillRect(-40, -40, 80, 144);
  l.restore();
}

export default {
  pad: 50,
  hull,
  parts: { dish, plate: shield, turret, core: port },
  opened: { core: portOpen },
  rage: [null, (l) => bloom(l, -190, -74, 120, GREEN, 0.35), trenchLights],
  // The run: lights racing down each trench wall toward the open port, and the port venting a cone
  // of reactor light down at the player while it lives.
  live(ctx, b, t, k) {
    if (b.phase !== 2) return;
    const core = b.parts.find((p) => p.id === 'core');
    if (core && core.hp > 0) {
      ctx.save();
      ctx.translate(0, 96);
      ctx.scale(1, -1); // the cone's narrow end up, at the port
      ctx.globalAlpha = k * (0.35 + 0.15 * Math.sin(t * 6));
      ctx.drawImage(cone(HOT), -70, -420, 140, 420);
      ctx.restore();
    }
    for (let i = 0; i < 3; i++) {
      const y = -30 + (((t * 1.4 + i / 3) % 1) * 120);
      ctx.globalAlpha = 0.9 * k;
      for (const s of [-1, 1]) ctx.drawImage(glow('#ffe0b0'), s * 42 - 14, y - 14, 28, 28);
    }
    ctx.globalAlpha = 1;
  },
};
