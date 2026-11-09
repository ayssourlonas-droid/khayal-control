// Per-world art direction, one data file per world (w1.js .. w18.js), plain data:
//   sky       gradient stops [[at, colour], ...] top to bottom
//   body      what is baked into the sky (sky-bodies.js); haze: colour far layers fade toward
//   layers    3 parallax bands, far to near (parallax.js; kinds in parallax-shapes.js and the files it imports)
//   ambient   particle entries per depth (ambient.js); flourish: animated extras (flourish.js)
//   palette   accent (HUD, engine), shot, beam (laser power), enemy + enemyRim (bullets), alien
//             colours per role (aliens/w1.js .. w12.js paint in them; Neon Rain's darkness glows in
//             them) and boss colours
//   bullet    how enemy bullets are drawn: 'orb' | 'bolt' | 'pixel' (bullets-view.js)
//   bunker    { fill, light, dark, edge, accent?, skin } (skin: a texture in bunker-skins.js)
//   power     tint per pickup kind: every POWERS kind plus bomb and life (shapes per world:
//             pickup-skins.js); music: { mood, root, scale, bpm }
//   heal      true: world 17's healing (heal.js, heal-view.js): the look also carries cleanSky + cleanBody (the clean morning's
//             sky), hazeClean, and per layer colorClean, rimClean, hazeClean and over (a green overlay); the view bakes
//             a smog and a clean twin of the sky and every layer and crossfades them
//   dark      how dark the darkness twist makes the world (screen-view.js; default 0.66)
//   star      'steel' (default) | 'ice': what the shuriken twist's throwing star is made of (bullet-sprites.js)
//   tint      { shade, glow }: the frame's wash in bullet time and the slow power, default Code Rain's green (screen-view.js)
import w1 from './w1.js';
import w2 from './w2.js';
import w3 from './w3.js';
import w4 from './w4.js';
import w5 from './w5.js';
import w6 from './w6.js';
import w7 from './w7.js';
import w8 from './w8.js';
import w9 from './w9.js';
import w10 from './w10.js';
import w11 from './w11.js';
import w12 from './w12.js';
import w13 from './w13.js';
import w14 from './w14.js';
import w15 from './w15.js';
import w16 from './w16.js';
import w17 from './w17.js';
import w18 from './w18.js';

export const LOOKS = [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15, w16, w17, w18].map((look, i) => ({ world: i + 1, ...look }));

export const lookFor = (level) => LOOKS[(level.world ?? 1) - 1] ?? LOOKS[0];
