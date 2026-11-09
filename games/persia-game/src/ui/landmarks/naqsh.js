// Naqsh-e Jahan at night, the parallax layer kind 'naqsh' (parallax-shapes.js has the painter
// contract), painted in PIXEL-sized blocks (kit.js): in the middle the Shah Mosque, its great
// turquoise dome on a tiled drum over the portal and the twin minarets (naqsh-mosque.js,
// naqsh-dome.js); to one side Ali Qapu, the tall block whose porch stands on slim wooden columns
// under a flat roof (naqsh-palace.js); and across the whole width the two-storey arcades with a
// lamp in each lit arch, and the long pool in front with their lights and the dome's standing in it
// (naqsh-square.js). The layer brings L.lit, L.ink, L.glow, L.lamp, L.brick, L.pool, L.tree, L.tile
// and L.turq; the mud brick and the tile are Yazd's (yazd-brick.js). Rows are counted from F, the
// pool's far edge, the arcades' foot.
import { PIXEL, mix } from '../sprites.js';
import { scene } from './kit.js';
import { tones } from './yazd-brick.js';
import { mosque, PORTAL } from './naqsh-mosque.js';
import { palace, PALACE } from './naqsh-palace.js';
import { arcades, pool } from './naqsh-square.js';

const UNDER = 20; // blocks from the arcades' foot down to the band's foot: 6 of pool show, the ground hides 14

export function naqsh(g, w, h, rng, L, lights) {
  const tone = {
    ...tones(L),
    V: L.turq, X: mix(L.turq, '#ffffff', 0.4), Y: mix(L.turq, L.ink, 0.45), Z: mix(L.turq, L.ink, 0.72),
    q: mix(L.lamp, L.glow, 0.5), p: mix(L.pool, L.ink, 0.5),
  };
  const art = scene(g, w, h, rng, L, lights, tone, UNDER);
  art.palace = art.mid + PALACE.at;
  art.stands = [[art.palace - PALACE.half, art.palace + PALACE.half], [art.mid - PORTAL.half, art.mid + PORTAL.half]]; // where the arcades are hidden
  g.save();
  g.scale(PIXEL, PIXEL);
  art.box(0, art.F, art.BW, UNDER, '-');
  const bays = arcades(art);
  mosque(art);
  palace(art);
  pool(art, bays);
  g.restore();
}
