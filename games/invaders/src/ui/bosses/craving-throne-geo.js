// The shape of the Craving's throne, the colossal ashtray (World 17, Ash to Air; the painters are craving-throne*.js and the tray part
// craving-tray.js, which share these numbers so the rim, the wall and the ember bed meet exactly). Boss coordinates (the origin is the
// boss's centre, y down), seen from the front and a little from above, as a round glazed bowl: the mouth is an ellipse, so the FRONT
// RIM is the lower arc of it, sagging down at the middle (y 76) and rising to both ends (y 34); round the mouth a thick rolled lip;
// under the lip the wall bellies out and CURVES IN to a smaller, rounded base that sits on a short foot ring. Nothing here is drawn;
// it only answers "where is the edge at x" or "at y".
//   RIM    the rim's outer edge (the ellipse the top face starts at); MOUTH the inner edge (where the bowl begins)
//   LIP    how far the rolled lip's front face drops below the rim's outer edge
//   BASE   the bowl's rounded bottom (half width, and how deep its front arc is), FOOT the ring it stands on
import { clamp } from '../../core/math.js';

export const RIM = { cx: 0, cy: 34, rx: 276, ry: 42 };
export const MOUTH = { cx: 0, cy: 31, rx: 242, ry: 33 };
export const LIP = 20;
export const BASE = { rx: 122, y: 148, d: 13 }; // the belly's lowest silhouette: half width 122 at y 148, its front arc dipping to 161
export const FOOT = { rx: 96, y: 158, d: 11 }; // the foot ring's front arc dips to 169
export const WALL_TOP = 54; // y where the wall starts to curve in (the lip's bottom at the ends)

const root = (x, rx) => Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));

export const rimFront = (x) => RIM.cy + RIM.ry * root(x, RIM.rx); // the rim's outer edge, front arc
export const mouthFront = (x) => MOUTH.cy + MOUTH.ry * root(x, MOUTH.rx);
export const lipBottom = (x) => rimFront(x) + LIP;
export const baseBottom = (x) => BASE.y + BASE.d * root(x, BASE.rx); // the belly's front arc along the bottom
export const footBottom = (x) => FOOT.y + FOOT.d * root(x, FOOT.rx);

// The wall's side profile: half width at y, round: 276 where the lip ends, falling in an ellipse arc to 122 at y 148.
export const profile = (y) => {
  const t = clamp((y - WALL_TOP) / (BASE.y - WALL_TOP), 0, 1);
  return RIM.rx * Math.sqrt(1 - (1 - (BASE.rx / RIM.rx) ** 2) * t * t);
};

// A path along the xs, f(x) for each, left to right (a polyline appended to the current path).
export function along(g, f, x0, x1, step = 8) {
  for (let x = x0; x <= x1 + 0.01; x += step) g.lineTo(x, f(x));
}

// The belly: the lip's lower edge across, the right profile down, the rounded bottom back along its front arc, the left profile up.
export function wallPath(g) {
  g.beginPath();
  g.moveTo(-RIM.rx, lipBottom(-RIM.rx));
  along(g, lipBottom, -RIM.rx, RIM.rx);
  for (let y = WALL_TOP; y <= BASE.y; y += 6) g.lineTo(profile(y), y);
  for (let x = BASE.rx; x >= -BASE.rx - 0.01; x -= 6) g.lineTo(x, baseBottom(x));
  for (let y = BASE.y; y >= WALL_TOP; y -= 6) g.lineTo(-profile(y), y);
  g.closePath();
}

// The foot ring under the belly: a short flared ring, mostly hidden by the belly's roundness.
export function footPath(g) {
  g.beginPath();
  g.moveTo(-FOOT.rx, FOOT.y - 12);
  g.lineTo(FOOT.rx, FOOT.y - 12);
  g.lineTo(FOOT.rx + 4, FOOT.y);
  for (let x = FOOT.rx; x >= -FOOT.rx - 0.01; x -= 6) g.lineTo(x, footBottom(x));
  g.lineTo(-FOOT.rx - 4, FOOT.y);
  g.closePath();
}

// The rim's top face: the ring between the outer and inner ellipses.
export function ringPath(g) {
  g.beginPath();
  g.ellipse(RIM.cx, RIM.cy, RIM.rx, RIM.ry, 0, 0, Math.PI * 2);
  g.moveTo(MOUTH.cx + MOUTH.rx, MOUTH.cy);
  g.ellipse(MOUTH.cx, MOUTH.cy, MOUTH.rx, MOUTH.ry, 0, 0, Math.PI * 2, true);
}
