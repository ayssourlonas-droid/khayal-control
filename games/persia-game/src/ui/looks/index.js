// The game's art direction, one data file (persia.js), plain data:
//   sky       gradient stops [[at, colour], ...] top to bottom
//   body      what is baked into the sky (sky-bodies.js); haze: colour far layers fade toward
//   landmarks { [a level's landmark]: 3 parallax bands, far to near } (parallax.js; kinds in
//             parallax-shapes.js)
//   ambient   particle entries per depth (ambient.js); flourish: animated extras (flourish.js)
//   palette   accent (HUD, engine), shot, beam (laser power), enemy + enemyRim (bullets), alien
//             colours per species (aliens/animals.js paints in them) and boss colours
//   bullet    how enemy bullets are drawn: 'pixel' (bullets-view.js)
//   power     tint per pickup kind (pickup-skins.js); music: { mood, root, scale, bpm }
export { default as LOOK } from './persia.js';
