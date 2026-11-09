// World 17's sky bodies (registry): smogsky (h 0, a low heavy smog with a dull coin of a sun, sky-bodies-9-smog.js) and
// cleansky (h 1, a fresh morning with a bright sun, white cumulus and thin cirrus, sky-bodies-9-clean.js). Each paints once
// over the gradient the builder filled (look.sky, look.cleanSky); heal-view.js crossfades the two by alpha. They share the
// sun's place (SUN, sky-bodies-9-kit.js).
import { smogsky } from './sky-bodies-9-smog.js';
import { cleansky } from './sky-bodies-9-clean.js';
import { SUN } from './sky-bodies-9-kit.js';

export { SUN };
export const BODIES9 = { smogsky, cleansky };
