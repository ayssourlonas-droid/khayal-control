// A shell in Ember Carnival (world 14) is any toy stuffed with powder, and it says so at a glance: a lit fuse
// sprouts from the top of it, fizzing, with sparks flicking off the tip, and a faint glow shows through the
// body as if the powder were burning inside. It is drawn on top of the alien's own sprite, for any role
// (aliens/index.js calls drawShells after the lights), turning with the alien when it leans into a swoop.
// Everything is a cached sprite: the fuse (opaque), a glow shaped like each role's own body (its hit-flash
// silhouette filled with a radial burn, added with 'lighter'), and the glow and star sprites for the spark.
// The plug sits at the alien's `shellAt[role]` (aliens/w14.js), a spot in sprite coordinates.
import { cached, makeCanvas, glow, star, rgba, rad, lin, hash, INK } from './sprites.js';
import { TAU } from '../core/math.js';
import { art, roleSprites, ROLE_LIST } from './aliens/bake.js';
import { LOOKS } from './looks/index.js';

export const FUSE = { w: 36, h: 44 }; // the fuse sprite at scale 1, baked at twice that
export const PLUG = { x: 18, y: 40 }; // where the fuse enters the toy, in the sprite
export const TIP = { x: 4, y: -31 }; // the burning end, from the plug
const AT = { grunt: [0, -34], diver: [0, -36], gunner: [0, -36], armored: [0, -38], carrier: [0, -34] }; // until the alien's art says
const HOT = '#ffb54a';
const SPARK = '#ffd070';

export const anchor = (look, role) => art(look).shellAt?.[role] ?? AT[role];

// The fuse: a brass collar with two rivets, a twisted hemp cord curling up, its last stretch charred.
export function paintFuse(g) {
  g.save();
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const cord = () => {
    g.beginPath();
    g.moveTo(18, 36);
    g.bezierCurveTo(9, 28, 27, 20, 22, 9);
  };
  cord();
  g.lineWidth = 5.6;
  g.strokeStyle = INK;
  g.stroke();
  cord();
  g.lineWidth = 3.8;
  g.strokeStyle = '#ffe6a8';
  g.stroke();
  cord();
  g.lineWidth = 3.8;
  g.setLineDash([1.2, 1.8]); // the twist of the strands
  g.strokeStyle = rgba('#8a5a28', 0.5);
  g.stroke();
  g.setLineDash([]);
  g.beginPath();
  g.moveTo(22.4, 13);
  g.lineTo(22, 9);
  g.lineWidth = 3.8;
  g.strokeStyle = '#2a1a10';
  g.stroke();
  g.beginPath();
  g.rect(11.5, 33.5, 13, 8);
  g.fillStyle = lin(g, 0, 33, 0, 42, [[0, '#ffe9a0'], [0.4, '#c8902a'], [1, '#6a4410']]);
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = INK;
  g.stroke();
  g.fillStyle = '#fff0c0';
  for (const x of [14.4, 21.6]) {
    g.beginPath();
    g.arc(x, 37.5, 0.9, 0, TAU);
    g.fill();
  }
  g.lineCap = 'butt'; // gives back what it set (see burst-view.js paintBloom)
  g.lineJoin = 'miter';
  g.restore();
}
const fuse = () => cached('shellFuse', FUSE.w * 2, FUSE.h * 2, (g) => {
  g.scale(2, 2);
  paintFuse(g);
});

// The glow through one role's body on one beat: the body's hit-flash silhouette filled with a burn, white-hot at
// the heart and the role's colour toward the rim.
const inners = new WeakMap();
function inner(look, role, f) {
  const set = roleSprites(look, role);
  let beats = inners.get(set);
  if (!beats) inners.set(set, (beats = []));
  if (beats[f]) return beats[f];
  const [w, h] = [set.flash[f].width, set.flash[f].height];
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  g.fillStyle = rad(g, w / 2, h * 0.55, 0, w * 0.5, [[0, rgba('#fff6d8', 0.95)], [0.3, rgba(look.palette.alien[role], 0.8)], [1, rgba(look.palette.alien[role], 0.22)]]);
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(set.flash[f], 0, 0);
  return (beats[f] = c);
}

// Every shell in `aliens`, on top of what drawAliens drew. at(a) says where its sprite is drawn: { x, y, rot, f }
// (position with the bob, lean, beat). Leaves the context normal.
export function drawShells(ctx, aliens, look, t, at) {
  const f = fuse();
  for (const a of aliens) { // the fuses, opaque
    if (!a.shell) continue;
    const s = at(a);
    const [ax, ay] = anchor(look, a.role);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.drawImage(f, ax - PLUG.x, ay - PLUG.y, FUSE.w, FUSE.h);
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const a of aliens) { // the burn inside, the fizz at the tip and its sparks, additive
    if (!a.shell) continue;
    const s = at(a);
    const [ax, ay] = anchor(look, a.role);
    const set = roleSprites(look, a.role);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    const beat = Math.sin(t * 6 + a.id * 1.3);
    ctx.globalAlpha = 0.2 + 0.08 * beat;
    ctx.drawImage(glow(HOT), -50, -50, 100, 100); // a warm haze round the toy
    ctx.globalAlpha = 0.52 + 0.2 * beat;
    ctx.drawImage(inner(look, a.role, s.f), -set.size / 2, -set.size / 2, set.size, set.size);
    ctx.restore();
    const [lx, ly] = [ax + TIP.x, ay + TIP.y];
    const [c, n] = [Math.cos(s.rot), Math.sin(s.rot)];
    const [wx, wy] = [s.x + lx * c - ly * n, s.y + lx * n + ly * c];
    const k = 0.72 + 0.28 * hash(Math.floor(t * 24) + a.id * 7);
    ctx.globalAlpha = 0.9 * k;
    ctx.drawImage(glow(HOT), wx - 30 * k, wy - 30 * k, 60 * k, 60 * k);
    ctx.globalAlpha = k;
    ctx.drawImage(star('#fff0c0'), wx - 17 * k, wy - 17 * k, 34 * k, 34 * k);
    for (let i = 0; i < 3; i++) { // three sparks leaving the tip, each its own heading, thrown up and falling
      const ph = t * 4.5 + i / 3 + a.id * 0.37;
      const u = ph % 1;
      const ang = -Math.PI / 2 + (hash(Math.floor(ph) * 3 + i + a.id * 5) - 0.5) * 2.6;
      ctx.globalAlpha = (1 - u) * 0.9;
      ctx.drawImage(glow(SPARK), wx + Math.cos(ang) * u * 26 - 5, wy + Math.sin(ang) * u * 26 + u * u * 14 - 5, 10, 10);
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Paint every sprite the shells draw, so none is baked mid-fight (warm-carnival.js).
export function warmShells(look = LOOKS[13]) {
  fuse();
  glow(HOT);
  glow(SPARK);
  star('#fff0c0');
  for (const role of ROLE_LIST) for (const f of [0, 1]) inner(look, role, f);
}
