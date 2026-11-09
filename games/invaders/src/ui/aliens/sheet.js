// dev.html?sheet=w4: one world's art on its own sky, for judging it by eye (not shipped UI).
//   two big rows    every role, frame 0 then frame 1, baked at BIG x so the detail is real
//   a 1:1 strip     per role: frame 0, frame 1, the hit flash, cracked 1, cracked 2, as in the game
//   the last row    a bunker fresh and carved, the eight pickups, the saucer and the wreck (if any); world 14's
//                   five shells instead; world 15's pearls and trident (the two powers' pickups, the ship with its
//                   pearls and three trident shots); world 16's mirror pickup, three wrecks of the mending at
//                   three ages and the twin's glass bolts
//   dev.html?sheet=w16scene&t=7 (&twin=1)  and  ?sheet=w16boss&phase=1&hurt=wingL:0.5: a whole frame of the look and
//                   the boss at rest (sheet-scene.js)
import { clamp } from '../../core/math.js';
import { WORLDS } from '../../core/levels.js';
import { POWERS, POWERS_15, POWERS_16 } from '../../core/kinds.js';
import { W, H } from '../sprites.js';
import { createBunker, hitBunker, BUNKER } from '../../core/bunkers.js';
import { LOOKS } from '../looks/index.js';
import { buildSky } from '../sky.js';
import { label } from '../hud-kit.js';
import { drawBunkers } from '../bunkers-view.js';
import { drawPickups } from '../pickups-view.js';
import { roleSprites, extraSprites, ROLE_LIST } from './bake.js';
import { cracked } from './cracks.js';
import { drawShells } from '../shell-view.js';
import { drawShip } from '../ship-view.js';
import { drawTridents } from '../shots-deep.js';
import { drawScene } from './sheet-scene.js';
import { drawMending } from '../mending-view.js';
import { drawMirrorShots } from '../shots-glass.js';
import { WRECK_TIME } from '../../core/twists-2.js';
import { breathSheet } from './sheet-breath.js';

const BIG = 2.6;

function put(g, set, img, f, x, y, lights = true) {
  const s = set.size * set.scale;
  g.drawImage(img, x - s / 2, y - s / 2, s, s);
  if (!lights) return;
  g.globalCompositeOperation = 'lighter';
  g.drawImage(set.lights[f], x - s / 2, y - s / 2, s, s);
  g.globalCompositeOperation = 'source-over';
}

function bunkers(g, look) {
  const fresh = createBunker(70, 905, BUNKER.w, BUNKER.h);
  const carved = createBunker(260, 905, BUNKER.w, BUNKER.h);
  for (const [x, y, r] of [[300, 905, 8], [312, 915, 6], [380, 930, 10], [345, 960, 5], [400, 905, 7]]) {
    hitBunker(carved, x, y, r);
  }
  drawBunkers(g, { bunkers: [fresh, carved] }, look);
}

// World 14: every role as a shell (a lit fuse and a glow through the body), 1:1, in the saucer and wreck slots.
function shells(g, look) {
  const list = ROLE_LIST.map((role, k) => ({ id: k + 1, role, shell: true, x: 1370 + k * 108, y: 950 }));
  for (const a of list) {
    const set = roleSprites(look, a.role);
    put(g, set, set.body[0], 0, a.x, a.y);
  }
  drawShells(g, list, look, 1.3, (a) => ({ x: a.x, y: a.y, rot: 0, f: 0 }));
  label(g, 'SHELLS', 1370, 1010);
}

// World 15: the ship with its three pearls and, ahead of it, trident shots (the last two have run through two aliens).
function powers(g, look) {
  const ship = { alive: true, lives: 3, invuln: 0, x: 1760, y: 950, vx: 0, vy: 0, power: { kind: 'pearls', left: 5 } };
  drawShip(g, { ship }, look, 1.3);
  const bolt = (x, y, n) => ({ x, y, vx: 0, vy: -1100, trident: true, pierced: Array.from({ length: n }, (_, i) => i) });
  drawTridents(g, [bolt(1500, 1000, 0), bolt(1560, 1000, 2), bolt(1620, 1000, 4)], 1.3);
  label(g, 'PEARLS · TRIDENT', 1740, 1060);
}

// World 16: three wrecks of the mending at three ages (just fallen, hanging, about to stand), and the twin's glass bolts.
function glass(g, look) {
  [0.5, 1.4, 1.95].forEach((age, k) => drawMending(g, { x: 1500 + k * 150, y: 930, left: WRECK_TIME - age, slot: { row: k, col: 2 } }, look, 1.3 + k));
  const shot = (x, y) => ({ x, y, vx: 0, vy: -1400, mirror: true });
  drawMirrorShots(g, [shot(1850, 960), shot(1890, 920)], 1.3);
  label(g, 'WRECKS · MIRROR BOLTS', 1440, 1000);
}

export function drawSheet(canvas, id) {
  const n = clamp(parseInt(String(id).replace(/\D/g, ''), 10) || 1, 1, LOOKS.length);
  const look = LOOKS[n - 1];
  canvas.width = W;
  canvas.height = H;
  if (/scene|boss/.test(String(id))) return drawScene(canvas, n, /boss/.test(String(id))); // the whole look in one frame (sheet-scene.js)
  const g = canvas.getContext('2d');
  g.drawImage(buildSky(look), 0, 0);
  label(g, `W${n} · ${WORLDS[n - 1].name.toUpperCase()} · ALIEN SHEET`, 40, 44, 'left', look.palette.accent);
  ROLE_LIST.forEach((role, i) => {
    const cx = 192 + i * 384;
    const big = roleSprites(look, role, BIG);
    put(g, big, big.body[0], 0, cx, 240);
    put(g, big, big.body[1], 1, cx, 530);
    label(g, role.toUpperCase(), cx, 92, 'center');
    const one = roleSprites(look, role);
    const strip = [[one.body[0], 0], [one.body[1], 1], [one.flash[0], 0], [cracked(one, 0, 1), 0], [cracked(one, 0, 2), 0]];
    strip.forEach(([img, f], k) => put(g, one, img, f, cx - 136 + k * 68, 760, k !== 2));
  });
  label(g, 'FRAME 0 (×2.6)', 40, 392);
  label(g, 'FRAME 1', 40, 690);
  label(g, '1:1 · FRAME 0 · FRAME 1 · FLASH · CRACK 1 · CRACK 2', 40, 830);
  bunkers(g, look);
  const pickups = [...(look.world === 15 ? POWERS_15 : look.world === 16 ? POWERS_16 : POWERS), 'bomb', 'life'].map((kind, k) => ({ kind, x: 560 + k * 92, y: 935 }));
  drawPickups(g, { pickups }, look, 0.3);
  [['saucer', 1340], ['wreck', 1520]].forEach(([name, x]) => {
    const s = extraSprites(look, name, 1.5);
    if (s) put(g, s, s.body[0], 0, x, 935);
  });
  if (look.world === 14) shells(g, look);
  if (look.world === 15) powers(g, look);
  if (look.world === 16) glass(g, look);
  if (look.world === 17) breathSheet(g); // the breath's craft, air and wake (sheet-breath.js)
  label(g, 'BUNKERS · PICKUPS · SAUCER · WRECK', 40, 1060);
}
