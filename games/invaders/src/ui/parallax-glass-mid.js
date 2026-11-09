// The mid layer of Glass Cathedral: the nave's stonework standing nearer, dark against the lit far cathedral. A column
// with the stumps of the vault's ribs still springing from it, a flying buttress, a free-standing window frame
// whose tracery holds no glass, two pairs of columns each spanned by a pointed rib (a chandelier hangs from the
// crown of each, swaying in flourish-glass-2.js, found through its sign { chandelier, x, y, len, ph }), a snapped
// column with its drum fallen beside it, fallen stone along the floor, and a few very faint coloured lights where
// the glass throws its colour on the stone. Nothing here is bright: this layer lies behind the player's zone. The
// pieces are in parallax-glass-mid-parts.js; the far layer is parallax-glass.js's. See parallax-shapes.js for the
// painter contract.
import { profile, waves } from './parallax-kit.js';
import { rubble } from './parallax-glass-ruin.js';
import { column, span, frame, buttress } from './parallax-glass-mid-parts.js';
import { lamp, JEWEL } from './parallax-glass-kit.js';

const FLOOR = 0.8; // the floor's mean height in the layer, of its height

// Two columns of height h with a rib between them, and a chandelier's sign under its crown.
function bay(g, out, rng, L, x0, x1, floor, h) {
  column(g, rng, L, x0, floor(x0), 56, h, {});
  column(g, rng, L, x1, floor(x1), 56, h, {});
  const crown = span(g, L, x0 + 6, x1 - 6, floor(x0) - h + 24, 11);
  out.signs.push({ chandelier: true, x: (x0 + x1) / 2, y: crown - 2, len: 128 + rng() * 30, ph: rng() });
}

function glasscolumns(g, w, h, rng, L, out) {
  const wave = waves(rng, 3, 0.005);
  const floor = (x) => h * FLOOR + 4 * wave(x);
  g.save();
  g.fillStyle = L.color;
  column(g, rng, L, 130, floor(130), 60, 268, { ribs: [0.4, 0.28] });
  buttress(g, rng, L, 560, floor(560), 280, 128, 1);
  frame(g, rng, L, 880, floor(880), 70, 262);
  bay(g, out, rng, L, 1070, 1290, floor, 240);
  column(g, rng, L, 1490, floor(1490), 62, 250, { broken: 104 });
  g.fillStyle = L.color;
  g.fillRect(1530, floor(1530) - 24, 46, 24); // the drum that fell
  g.fillRect(1580, floor(1580) - 15, 30, 15);
  buttress(g, rng, L, 1720, floor(1720), 262, 130, -1);
  bay(g, out, rng, L, 1930, 2150, floor, 236);
  g.fillStyle = L.color;
  rubble(g, rng, L, 160, w - 100, floor(900));
  profile(g, w, h, floor);
  for (const [x, y, r, c, a] of [[190, 250, 120, JEWEL.rose, 0.06], [880, 230, 130, JEWEL.sapphire, 0.06], [1180, 260, 150, JEWEL.amber, 0.05], [2040, 250, 130, JEWEL.amethyst, 0.06]]) lamp(out, x, y, r, c, 'steady', 0, a);
  g.restore();
}

export const MID = { glasscolumns };
