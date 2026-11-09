// The little friendly craft that lead the breath (world 17): white hulls with green trim, leaf-shaped wings and a green leaf
// on a white roundel, no guns and no faces, their vapour streaming below as they climb. Each is two cached sprites per frame:
// the body (the painted craft and its vapour, source-over, breath-craft-parts.js) and a light layer (drawn with 'lighter': the
// engine's blue-white glow, a glint on the nose or the wingtips and one on the roundel). Two frames, the wings' tilt and the
// engine's flicker. Baked at CRAFT_SS (2) times the size they are shown at: the craft's hull middle is at ORIGIN in
// design units (42, 46), and the sprite is CRAFT_W x CRAFT_H of those, so breath-view.js draws it at `scale` times that, with
// ORIGIN at the craft's place. Painted once on first use; warmBreathFx bakes them ahead of the fight (cache keys `breathCraft`).
import { cached, rad, rgba } from './sprites.js';
import { leaves, hull, canopy, emblem, nozzle } from './breath-craft-parts.js';
import { vapour } from './breath-craft-vapour.js';

export const CRAFT_W = 84;
export const CRAFT_H = 166;
export const CRAFT_SS = 2;
export const ORIGIN = [42, 46];

// A four-point twinkle at (x, y), r long in its rays, white, with a soft glow round it.
export function glint(g, x, y, r, a = 1) {
  g.beginPath();
  g.arc(x, y, r * 0.8, 0, Math.PI * 2);
  g.fillStyle = rad(g, x, y, 0, r * 0.8, [[0, rgba('#ffffff', 0.6 * a)], [1, rgba('#ffffff', 0)]]);
  g.fill();
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const rr = i % 2 ? r * 0.13 : r;
    g.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
  }
  g.closePath();
  g.fillStyle = rgba('#ffffff', 0.95 * a);
  g.fill();
}

function frame(g, f, painter) {
  g.save();
  g.scale(CRAFT_SS, CRAFT_SS);
  g.translate(ORIGIN[0], ORIGIN[1]);
  g.lineJoin = 'round';
  painter(g, f);
  g.restore();
}

function body(g, f) {
  vapour(g, f);
  leaves(g, f);
  hull(g);
  canopy(g);
  emblem(g);
  nozzle(g);
}

// What glows: the engine (a blue-white blob that stretches down along the vapour; smaller in the second frame), a glint on the
// nose or, in the other frame, on both wingtips, one on the roundel and the canopy's.
function lights(g, f) {
  g.save();
  g.translate(0, 32);
  g.scale(1, 1.4);
  const r = f ? 11.5 : 14;
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.fillStyle = rad(g, 0, 0, 0, r, [[0, rgba('#e8ffff', 0.8)], [0.3, rgba('#b4f2ff', 0.42)], [0.65, rgba('#86dcf0', 0.14)], [1, rgba('#86dcf0', 0)]]);
  g.fill();
  g.restore();
  glint(g, -4.5, 2.5, f ? 4.5 : 6.5, 0.9);
  glint(g, 0, 29.6, 3.6, 0.8);
  if (f) {
    glint(g, -33.5, 8, 5.5, 0.9);
    glint(g, 33.5, 8, 4.5, 0.7);
  } else {
    glint(g, 0, -33.5, 8.5, 1);
  }
}

export const craftBody = (f) => cached(`breathCraft${f}`, CRAFT_W * CRAFT_SS, CRAFT_H * CRAFT_SS, (g) => frame(g, f, body));
export const craftLights = (f) => cached(`breathCraftLights${f}`, CRAFT_W * CRAFT_SS, CRAFT_H * CRAFT_SS, (g) => frame(g, f, lights));
