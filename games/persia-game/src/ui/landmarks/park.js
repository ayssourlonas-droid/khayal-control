// What a landmark's park is planted with (qabus-park.js, ferdowsi-garden.js), in blocks (kit.js): the
// pine and the cypress, and the lamp post. Rows come from the painter's `row`, counted up from its
// ground. Tones: t y e the trees, dark, lit and their lit edge; k the dark, g G the lamps.

// A pine `tall` blocks high on the plain, column x: a bare trunk, then a flat crown, lit down its left.
export function pine({ box, row, rng }, x, tall) {
  const trunk = Math.round(tall * 0.5);
  box(x, row(trunk - 1), 1, trunk, 'k');
  const crown = tall - trunk;
  const half = Math.round(tall * 0.45);
  for (let j = 0; j < crown; j++) {
    const k = (j + 0.5) / crown; // 0 at the crown's foot, 1 at its top
    const hw = Math.max(2, Math.round(half * Math.sqrt(1 - (2 * k - 1) ** 2) * (k < 0.5 ? 1 : 0.75 + 0.5 * (1 - k))));
    box(x - hw, row(trunk + j), hw * 2 + 1, 1, 't');
    for (let i = -hw; i <= hw; i++) if (rng() < (i < 0 ? 0.2 : 0.04) * k) box(x + i, row(trunk + j), 1, 1, 'y');
    box(x - hw, row(trunk + j), 1, 1, 'e');
  }
}

// A cypress `tall` blocks high, up to `half` blocks either side of column x: a dark flame, lit down its left.
export function cypress({ box, row }, x, tall, half) {
  for (let j = 0; j < tall; j++) {
    const t = j / (tall - 1); // 0 at its foot, 1 at its tip
    const hw = t > 0.97 ? 0 : Math.max(1, Math.round(half * Math.sin(Math.min(1, (1 - t) * 1.6) * (Math.PI / 2)) ** 0.7));
    box(x - hw, row(j), hw * 2 + 1, 1, 't');
    box(x - hw, row(j), 1, 1, 'y');
  }
}

// A lamp post's shaft and lantern at column x: the lantern on block row `top` under its dark cap, the
// shaft `tall` blocks down from it. The light it throws is set before the ground is painted.
export function lampPost({ box }, x, top, tall) {
  box(x, top + 1, 1, tall, 'k');
  box(x - 1, top, 3, 1, 'g');
  box(x, top, 1, 1, 'G');
  box(x - 1, top - 1, 3, 1, 'k');
}
