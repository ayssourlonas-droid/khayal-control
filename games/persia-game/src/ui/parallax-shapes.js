// Silhouette painters for the parallax layers, one per layer kind (adapted from Barrage); a level's
// landmark has its own (landmarks/). Each fills `g` (w x h, the band standing on the frame's bottom)
// in the layer colour; `rng` is seeded, `lights` collects the glows that pulse on top
// ({ x, y, r, color, ph, a }), in px.
import { profile, ridgeTop } from './parallax-kit.js';
import { persepolis } from './landmarks/persepolis.js';
import { siosepol } from './landmarks/siosepol.js';
import { hafez } from './landmarks/hafez.js';
import { azadi } from './landmarks/azadi.js';
import { pasargadae } from './landmarks/pasargadae.js';
import { yazd } from './landmarks/yazd.js';
import { milad } from './landmarks/milad.js';
import { naqsh } from './landmarks/naqsh.js';
import { qabus } from './landmarks/qabus.js';
import { ferdowsi } from './landmarks/ferdowsi.js';

// A flat floor whose top is one glowing line.
function ground(g, w, h, rng, L, lights) {
  g.fillRect(0, h * 0.3, w, h);
  g.fillStyle = L.line;
  g.fillRect(0, h * 0.3, w, 4);
  for (let x = 40; x < w; x += 180 + rng() * 120) lights.push({ x, y: h * 0.3 + 2, r: 34, color: L.line, ph: rng(), a: 0.5 });
}

const PAINTERS = {
  mountains: (g, w, h, rng, L) => profile(g, w, h, ridgeTop(rng, w, h, L.roughness)),
  ground,
  persepolis,
  siosepol,
  hafez,
  azadi,
  pasargadae,
  yazd,
  milad,
  naqsh,
  qabus,
  ferdowsi,
};

export function paintLayer(g, w, h, rng, L, lights) {
  g.fillStyle = L.color;
  PAINTERS[L.kind](g, w, h, rng, L, lights);
}
