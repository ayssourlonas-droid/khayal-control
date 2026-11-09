// The coals of the Craving's tray (World 17, Ash to Air; see craving-tray.js): one lump of coal, and one smouldering butt. A lump is a
// crooked polygon filled hot at its heart (white-gold to orange) and dark red at its edge, crusted over part of its face with grey
// ash, a bright crack through it, a dark edge and a pale lit corner; on the lights layer its heart glows. A butt is a snubbed
// cigarette lying in the heap, cream and grey, its filter tan, its burning end a dull orange ring. Tray coordinates (the part's centre
// is the origin). Bake-time only.
import { grain, heat, line, lin, path, rad, rgba, ellipse, SOOT, COAL } from './craving-pkit.js';

// A lump at (x, y), `s` big, hotness 0..1 (the crust covers the cooler ones).
export function coal(b, l, x, y, s, hot, r) {
  const n = 7;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.5;
    pts.push([x + Math.cos(a) * s * (0.72 + r() * 0.4), y + Math.sin(a) * s * (0.55 + r() * 0.35)]);
  }
  const outline = () => {
    b.beginPath();
    pts.forEach(([px, py], i) => (i ? b.lineTo(px, py) : b.moveTo(px, py)));
    b.closePath();
  };
  outline();
  const ramp = hot > 0.78 ? [COAL[5], COAL[4], COAL[3], COAL[1], COAL[0]] : hot > 0.45 ? [COAL[4], COAL[3], COAL[2], COAL[1], COAL[0]] : [COAL[3], COAL[2], COAL[1], COAL[0], SOOT];
  b.fillStyle = rad(b, x, y, 1, s, [[0, ramp[0]], [0.3, ramp[1]], [0.6, ramp[2]], [0.85, ramp[3]], [1, ramp[4]]], x - s * 0.1, y - s * 0.15);
  b.fill();
  b.save();
  outline();
  b.clip();
  if (hot < 0.85) { // a crust of grey ash over the cooler part, the heat showing through its cracks
    const cover = 0.12 + 0.75 * (1 - hot);
    const edge = y - s + 2 * s * cover;
    b.beginPath();
    b.moveTo(x - s * 1.2, y - s * 1.2);
    b.lineTo(x + s * 1.2, y - s * 1.2);
    for (let i = 5; i >= 0; i--) b.lineTo(x - s * 1.2 + (i * s * 2.4) / 5, edge + (r() - 0.5) * s * 0.55);
    b.closePath();
    b.fillStyle = lin(b, 0, y - s, 0, y + s, [[0, '#5a524b'], [0.5, '#3a322e'], [1, '#1f1a17']]);
    b.fill();
    grain(b, x - s * 1.2, y - s * 1.2, s * 2.4, s * 2.4, 1.2);
    path(b, [[x - s * 1.2, edge], [x - s * 0.4, edge + (r() - 0.5) * 3], [x + s * 0.5, edge + (r() - 0.5) * 3], [x + s * 1.2, edge]], true);
    line(b, rgba(COAL[3], 0.85), 1.1);
    for (let k = 0; k < 2; k++) {
      const [cx, cy] = [x + (r() - 0.5) * s * 1.2, y - s * 0.7 + r() * s * 0.4];
      path(b, [[cx, cy], [cx + (r() - 0.5) * s * 0.6, cy + s * 0.35], [cx + (r() - 0.5) * s * 0.7, edge]], true);
      line(b, rgba(COAL[3], 0.7), 0.9);
    }
  }
  b.restore();
  outline();
  line(b, rgba(SOOT, 0.7), 1.2);
  path(b, [pts[4], pts[5], pts[6]], true);
  line(b, rgba(COAL[4], 0.45 * hot), 1);
  heat(l, x, y, s * 1.4, COAL[3], 0.04 + 0.3 * hot * hot);
  if (hot > 0.6) heat(l, x, y, s * 0.8, COAL[5], 0.3 * hot);
}

// A smouldering butt at (x, y) at angle a, len long.
export function butt(b, l, x, y, a, len) {
  b.save();
  b.translate(x, y);
  b.rotate(a);
  b.fillStyle = lin(b, 0, -5, 0, 5, [[0, '#d6ccb8'], [0.55, '#a09686'], [1, '#4a423b']]);
  b.beginPath();
  b.roundRect(0, -5, len, 10, 2);
  b.fill();
  b.fillStyle = '#c99a5e';
  b.fillRect(len - 9, -4.6, 9, 9.2);
  b.fillStyle = rgba(SOOT, 0.65);
  b.fillRect(0, -5, len * 0.3, 10);
  ellipse(b, 1, 0, 3, 5.2);
  b.fillStyle = lin(b, -3, 0, 3, 0, [[0, COAL[1]], [0.5, COAL[4]], [1, COAL[2]]]);
  b.fill();
  b.beginPath();
  b.roundRect(0, -5, len, 10, 2);
  line(b, rgba(SOOT, 0.85), 1.1);
  b.restore();
  heat(l, x + Math.cos(a), y + Math.sin(a), 12, COAL[4], 0.55);
}
