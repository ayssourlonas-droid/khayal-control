// The towers of the drowned kingdom (far layer of Lantern Deep, see parallax-deep.js): a tall shaft in a
// stone the sea has furred, a corbelled gallery under a roof that is a cone, an onion dome, a flat
// crenellated top or a broken stump, windows in rows (a few still lit), belt courses, buttresses at the
// foot, a tiny stair on some, coral on every ledge and weed hanging from the gallery. spire() is the same
// idea in thin pale silhouette, for the skyline far behind. Every roof's tip is a sign for the live art.
import { rgba } from './sprites.js';
import { TAU } from '../core/math.js';
import { PALE, CORAL, GREEN, ABYSS, poly, tint, windows, wash, crenels, crust, weed, moss, barnacles, stairs } from './parallax-deep-kit.js';

// The roof's outline as a path (so it can be washed with the shaft): sits on a gallery at y0, hw half-wide, rh tall.
function roofPath(c, roof, x, y0, hw, rh, jag) {
  c.moveTo(x - hw, y0);
  if (roof === 'cone') {
    c.quadraticCurveTo(x - hw * 0.3, y0 - rh * 0.42, x, y0 - rh);
    c.quadraticCurveTo(x + hw * 0.3, y0 - rh * 0.42, x + hw, y0);
  } else if (roof === 'onion') { // a neck, a bulge wider than the gallery, an ogee up to the tip
    c.bezierCurveTo(x - hw * 2.1, y0 - rh * 0.1, x - hw * 0.8, y0 - rh * 0.62, x, y0 - rh);
    c.bezierCurveTo(x + hw * 0.8, y0 - rh * 0.62, x + hw * 2.1, y0 - rh * 0.1, x + hw, y0);
  } else if (roof === 'broken') {
    jag.forEach(([u, v]) => c.lineTo(x - hw + u * hw * 2, y0 - v));
    c.lineTo(x + hw, y0);
  } else {
    c.lineTo(x + hw, y0);
  }
  c.closePath();
}

// A tower with its foot at (x, base), w wide at the foot, h tall to the gallery; roof is 'cone', 'onion',
// 'flat' or 'broken'. o.odds: the chance a window is lit; o.stair puts a flight of steps on the left flank.
export function tower(g, out, rng, L, x, base, w, h, roof, o = {}) {
  const [hw, top] = [w / 2, base - h];
  const gw = hw * 0.84 + 4; // the gallery is wider than the shaft under it
  const rh = o.rh ?? (roof === 'onion' ? w * 1.15 : roof === 'cone' ? w * 1.9 : 0);
  const jag = Array.from({ length: 7 }, (_, i) => [i / 6, 6 + rng() * 26 * (i % 2 ? 0.5 : 1)]);
  const build = (c) => {
    poly(c, [[x - hw, base], [x - hw * 0.84, top + 12], [x - gw, top + 12], [x - gw, top], [x + gw, top], [x + gw, top + 12], [x + hw * 0.84, top + 12], [x + hw, base]]);
    if (roof !== 'flat') roofPath(c, roof, x, top, gw, rh, jag);
  };
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  for (const s of [-1, 1]) { // buttresses at the foot
    poly(g, [[x + s * (hw + 9), base], [x + s * hw * 0.97, base - h * 0.2], [x + s * hw * 0.9, base]]);
    g.fill();
  }
  if (roof === 'flat') crenels(g, x - gw, x + gw, top, 7, 4, 6);
  wash(g, build, [x - gw - 12, top - rh - 8, x + gw + 12, base], undefined, 0.3);
  g.fillStyle = rgba(ABYSS, 0.3); // belt courses
  for (let y = top + 40; y < base - 20; y += 46) g.fillRect(x - hw * 0.8, y, w * 0.8, 1.4);
  const xs = w > 26 ? [-hw * 0.38, hw * 0.38] : [0];
  windows(g, out, rng, L, x, xs, top + 24, base - 26, o.pitch ?? 25, 3.6, 7, o.odds ?? 0.06);
  g.fillStyle = rgba(ABYSS, 0.7); // the door
  g.fillRect(x - 3, base - 12, 6, 12);
  if (o.stair) {
    g.fillStyle = L.color;
    stairs(g, x - hw - 28, base, 7, 4, 4);
  }
  const coral = tint(L, CORAL, 0.3);
  crust(g, rng, x - gw, x + gw, top, coral);
  crust(g, rng, x - hw, x + hw, base - 2, tint(L, GREEN, 0.22));
  moss(g, rng, x - gw, x + gw, top + 12, tint(L, GREEN, 0.28));
  weed(g, rng, x - gw + 2, top + 13, 22 + rng() * 30, Math.floor(gw / 3), tint(L, GREEN, 0.3));
  barnacles(g, rng, x - hw, top + 20, x + hw, base, Math.round(h / 8));
  if (roof === 'cone' || roof === 'onion') { // a finial, a ball on a pin
    const tip = top - rh;
    g.fillStyle = L.color;
    g.fillRect(x - 0.7, tip - 10, 1.4, 11);
    g.beginPath();
    g.arc(x, tip - 11, 1.8, 0, TAU);
    g.fill();
    crust(g, rng, x - gw, x - 2, top - 2, coral);
    out.signs.push({ spire: true, x, y: tip - 12 });
  } else {
    out.signs.push({ spire: true, x, y: top - 6 });
  }
}

// A far, pale tower for the skyline: a tapering shaft with a belt, a gallery, a roof (cone, onion or crenellated),
// often a little turret beside it, and a few pin-prick windows. `color` is the haze-washed tone of the farthest
// ridge. The tall ones are never flat-topped: they would pass for pillars.
export function spire(g, rng, x, base, w, h, color) {
  const [hw, top] = [w / 2, base - h];
  const kind = h > 120 ? rng() * 0.8 : rng();
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x - hw, base);
  g.lineTo(x - hw * 0.72, top + 6);
  g.lineTo(x - hw * 1.05, top + 6);
  g.lineTo(x - hw * 1.05, top);
  if (kind < 0.5) { // a cone with concave sides
    g.quadraticCurveTo(x - hw * 0.3, top - w * 1.2, x, top - w * 3.2);
    g.quadraticCurveTo(x + hw * 0.3, top - w * 1.2, x + hw * 1.05, top);
  } else if (kind < 0.8) { // an onion
    g.bezierCurveTo(x - hw * 2.2, top - w * 0.2, x - hw * 0.8, top - w * 1.2, x, top - w * 2.4);
    g.bezierCurveTo(x + hw * 0.8, top - w * 1.2, x + hw * 2.2, top - w * 0.2, x + hw * 1.05, top);
  } else { // crenellated
    for (let c = -hw * 1.05; c < hw * 0.9; c += w * 0.45) {
      g.lineTo(x + c, top);
      g.lineTo(x + c, top - 5);
      g.lineTo(x + c + w * 0.25, top - 5);
      g.lineTo(x + c + w * 0.25, top);
    }
    g.lineTo(x + hw * 1.05, top);
  }
  g.lineTo(x + hw * 1.05, top + 6);
  g.lineTo(x + hw * 0.72, top + 6);
  g.lineTo(x + hw, base);
  g.closePath();
  g.fill();
  g.fillRect(x - hw * 1.08, base - h * 0.55, w * 1.08, 3); // the belt
  if (rng() < 0.55) { // a turret beside it
    const [tx, th] = [x + (rng() < 0.5 ? -1 : 1) * w * 0.85, h * (0.4 + rng() * 0.2)];
    g.fillRect(tx - w * 0.22, base - th, w * 0.44, th);
    g.beginPath();
    g.moveTo(tx - w * 0.3, base - th);
    g.lineTo(tx, base - th - w * 1.3);
    g.lineTo(tx + w * 0.3, base - th);
    g.fill();
  }
  g.fillStyle = rgba(PALE, 0.12);
  for (let i = 0; i < 3; i++) if (rng() < 0.6) g.fillRect(x - 0.8, top + 12 + i * 20 + rng() * 8, 1.6, 3.6);
}
