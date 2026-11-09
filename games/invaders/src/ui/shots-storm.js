// The broadside's shots in Anvil Sky (world 18; lasers-view.js hands them here instead of to shots-armada.js's cannon balls):
// every side shot is a crackling ARC BOLT flying out of the ship's flank along x (p.broadside is -1 or 1): a jagged line of
// the ship's cyan about seventy pixels long with a white-hot thread, a pale-yellow spur and a couple of forks, a ball of
// light at its head, and two fainter copies of itself behind it that crackle on, so it reads as lightning thrown sideways.
// A dark under-stroke keeps it readable on the bright orange of the horizon. Each bolt is baked in six shapes and both
// directions, and a shot flickers between them by the clock; everything is cached, nothing is allocated per frame, no
// shadow blur. The muzzle flash is fx (fx/react-storm.js).
import { cached, glow, star, hash, rgba } from './sprites.js';
import { arcPath, strokeBolt } from './storm-bolt.js';

const W = 92;
const H = 44;
const HEAD = 80; // x of the bolt's head in a bolt flying right
const TAIL = 8;
const VARIANTS = 6;
const GAP = 26; // px between a bolt and the faint copy behind it
const YELLOW = '#fff2a8';

// One bolt flying right (dir 1) or left (dir -1), shape `v`, in the colour c.
const bolt = (dir, v, c) => cached(`stormArc${dir}${v}${c}`, W, H, (g) => {
  if (dir < 0) {
    g.translate(W, 0);
    g.scale(-1, 1);
  }
  const mid = H / 2;
  const seed = v * 17 + 5;
  g.beginPath();
  arcPath(g, TAIL, mid, HEAD, mid, 9, 6.5, seed);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = 'rgba(10,12,22,0.5)'; // a dark ground for the bright sky
  g.lineWidth = 10;
  g.stroke();
  g.beginPath();
  arcPath(g, TAIL + 6, mid, HEAD, mid, 7, 4, seed + 3); // the pale spur, a second path woven round the first
  g.strokeStyle = rgba(YELLOW, 0.8);
  g.lineWidth = 1;
  g.stroke();
  for (let k = 0; k < 2; k++) { // two forks leaving the line
    const x = 22 + hash(seed + k * 9) * 38;
    const side = hash(seed + k * 5 + 1) < 0.5 ? -1 : 1;
    g.beginPath();
    arcPath(g, x, mid, x + 12 + hash(seed + k) * 10, mid + side * (10 + hash(seed + k + 2) * 6), 3, 3, seed + k * 11);
    g.strokeStyle = rgba(c, 0.85);
    g.lineWidth = 1.5;
    g.stroke();
  }
  g.beginPath();
  arcPath(g, TAIL, mid, HEAD, mid, 9, 6.5, seed);
  strokeBolt(g, c, rgba(c, 0.36), '#ffffff', 1.35);
});

const sets = new Map(); // colour -> [dir -1 shapes, dir 1 shapes]
function boltsOf(c) {
  let s = sets.get(c);
  if (!s) {
    s = [-1, 1].map((dir) => Array.from({ length: VARIANTS }, (_, v) => bolt(dir, v, c)));
    sets.set(c, s);
  }
  return s;
}

export function warmStormShots(look) { // paint the bolts and the glows now, so none is baked at the first side shot (warm-storm.js)
  const c = look.palette.accent;
  boltsOf(c);
  glow(c);
  glow(YELLOW);
  star('#ffffff');
}

// Every side shot in `shots`, with its trail, drawn about its own place.
export function drawArcBolts(ctx, shots, t, look) {
  const c = look.palette.accent;
  const sets2 = boltsOf(c);
  const frame = Math.floor(t * 24);
  for (const p of shots) {
    const dir = p.broadside;
    if (!dir) continue;
    const set = sets2[dir > 0 ? 1 : 0];
    const v = (frame + (p.y | 0) + (dir > 0 ? 3 : 0)) % VARIANTS;
    const left = p.x + dir * 6 - (dir > 0 ? HEAD : W - HEAD);
    const top = p.y - H / 2;
    ctx.globalAlpha = 0.16;
    ctx.drawImage(set[(v + 4) % VARIANTS], left - dir * GAP * 2, top);
    ctx.globalAlpha = 0.34;
    ctx.drawImage(set[(v + 2) % VARIANTS], left - dir * GAP, top);
    ctx.globalAlpha = 1;
    ctx.drawImage(set[v], left, top);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.4;
    ctx.drawImage(glow(c), p.x - dir * 30 - 50, p.y - 17, 100, 34); // the light the bolt throws along its own length
    ctx.globalAlpha = 0.9;
    ctx.drawImage(glow(c), p.x + dir * 6 - 19, p.y - 19, 38, 38);
    ctx.globalAlpha = 0.85;
    ctx.drawImage(glow(YELLOW), p.x + dir * 6 - 10, p.y - 10, 20, 20);
    ctx.globalAlpha = 0.55 + 0.4 * Math.sin(t * 61 + p.y);
    ctx.drawImage(star('#ffffff'), p.x + dir * 6 - 12, p.y - 12, 24, 24); // the head's flicker
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1;
}
