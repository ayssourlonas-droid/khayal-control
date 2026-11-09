// The pickup skin. A pickup must read as "catch me", so the falling capsule keeps its dark middle,
// coloured rim, pulse and turning dashes (pickups-view.js); the skin is its rim and icons, in the
// sprites' phosphor pixels.
//   frame(g, color)        the capsule's rim, centred, inside a 60 x 60 sprite (baked)
//   ICONS[kind](g, color)  the icon for a pickup kind, centred, about 30 px across; also drawn by
//                          the HUD every frame, so plain fills only

// A ring of phosphor pixels round a dark middle, 4 px cells.
export function frame(g, color) {
  for (let i = -7; i <= 7; i++) {
    for (let j = -7; j <= 7; j++) {
      const d = Math.hypot(i, j);
      if (d >= 6.7) continue;
      g.fillStyle = d >= 5.6 ? color : 'rgba(8,10,20,0.9)';
      g.fillRect(i * 4 - 2, j * 4 - 2, 4, 4);
    }
  }
}

// 7 x 7 pixel icons, 4 px cells.
const PIX = {
  spread: ['x..x..x', '.x.x.x.', '..xxx..', '...x...', '...x...', '..xxx..', '.......'],
  laser: ['...x...', '..xxx..', '..xxx..', '..xxx..', '..xxx..', '..xxx..', '...x...'],
  rapid: ['...x...', '..x.x..', '.x...x.', '...x...', '..x.x..', '.x...x.', '.......'],
  shield: ['..xxx..', '.x...x.', 'x.....x', 'x.....x', 'x.....x', '.x...x.', '..xxx..'],
  bomb: ['.....xx', '....x..', '..xxx..', '.xxxxx.', '.xxxxx.', '.xxxxx.', '..xxx..'],
};
const pixel = (rows) => (g, color) => {
  g.fillStyle = color;
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch === 'x' && g.fillRect(x * 4 - 14, y * 4 - 14, 4, 4)));
};

export const ICONS = Object.fromEntries(Object.entries(PIX).map(([k, rows]) => [k, pixel(rows)]));
