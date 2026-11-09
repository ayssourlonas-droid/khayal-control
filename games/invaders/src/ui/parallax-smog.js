import { smogcity } from './parallax-smog-far.js';
import { smogblocks } from './parallax-smog-mid.js';
import { smogstreet } from './parallax-smog-near.js';

// World 17's parallax painters (registry; the work is in the files it imports). Each is paint(g, w, h, rng, L, out, mode):
// mode 'smog' (the default), 'clean' or 'over' (heal-layers.js).
export const SMOG = { smogcity, smogblocks, smogstreet };
