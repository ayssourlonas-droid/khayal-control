// World 17, Ash to Air: a city choked by smoke, healing as you win. At h 0 (heal.js) the sky is a low brown-grey smog with a
// dull coin of a sun, ash falls like grey snow, the skyline is grey and colossal cigarettes stand among the towers like
// chimneys, smoking. As h rises the smog thins and lifts, the sky turns blue and the sun brightens, the ash stops, the
// cigarettes go out and crumble, and green comes back (trees, lawns, flowers, kites, birds); at 1 it is a clean, bright
// morning. Every sky and layer is baked twice, a smog and a clean twin (`cleanSky`, `cleanBody`, `colorClean`, `hazeClean`,
// `rimClean`), and the view only crossfades them (heal-view.js, heal-layers.js); a layer with `over` also has a green
// overlay that fades in. Sky: sky-bodies-9.js (smogsky, cleansky). Layers (parallax-smog*.js): far smogcity (the skyline and
// the giant cigarettes' stumps), mid smogblocks (older blocks, water towers, dead trees, empty billboards), near smogstreet
// (kerbs, gutters of butts, a park fence). Flourishes (flourish-smog*.js) and ambient (ambient-9.js) read the healing through
// stage() (heal.js). The enemy's bullets are a hot magenta with a dark violet rim: nothing in a brown smog, a blue morning or
// a green park is that colour, and the backdrop's embers and ash stay far quieter than a bullet.
export default {
  heal: true,
  sky: [[0, '#2a2321'], [0.22, '#3b312b'], [0.5, '#5c4733'], [0.78, '#8c6a3e'], [1, '#b08648']],
  body: 'smogsky',
  cleanSky: [[0, '#2f8ddb'], [0.3, '#5fb3ef'], [0.62, '#a6dbf8'], [0.85, '#d6efff'], [1, '#f2fbf2']],
  cleanBody: 'cleansky',
  haze: '#8a6a44', hazeClean: '#cde6f6',
  mist: '#b08a58', mistAlpha: 0.06,
  layers: [
    { kind: 'smogcity', color: '#3a302b', colorClean: '#6f8ba6', height: 700, speed: 0.06, roughness: 0.6, rim: '#c89a64', rimClean: '#ffffff', haze: 0.34, hazeClean: 0.22, over: true },
    { kind: 'smogblocks', color: '#262020', colorClean: '#4f6a80', height: 460, speed: 0.22, roughness: 0.6, rim: '#9a7650', rimClean: '#e8f6ff', haze: 0.14, hazeClean: 0.08, over: true },
    { kind: 'smogstreet', color: '#16120f', colorClean: '#3a4a52', height: 320, speed: 0.55, roughness: 0.6, rim: '#5a4a3c', rimClean: '#d4e4ea', haze: 0, hazeClean: 0, over: true },
  ],
  ambient: [
    { kind: 'ashfall', phase: 'sky', n: 60, colors: ['#e2dacd', '#c4baae', '#f0e8dc'], size: [2.8, 6], speed: 46, alpha: 0.4, maxY: 1 },
    { kind: 'ashfall', phase: 'mid', n: 56, colors: ['#e2dacd', '#c4baae'], size: [3, 6.4], speed: 58, alpha: 0.36, maxY: 1 },
    { kind: 'smokewisps', phase: 'mid', n: 9, colors: ['#8c7a68', '#a89480'], size: [180, 380], speed: 14, alpha: 0.16, maxY: 0.8 },
    { kind: 'pollen', phase: 'mid', n: 28, colors: ['#fff0b8', '#fdf4dc', '#d8f0c0'], size: [1.4, 2.8], speed: 12, alpha: 0.4, maxY: 0.86, additive: true },
    { kind: 'ashfall', phase: 'front', n: 14, colors: ['#e2dacd'], size: [3.6, 7], speed: 70, alpha: 0.26, maxY: 1 },
  ],
  flourish: ['smokeroll', 'cigarettes', 'sunbeams', 'skybirds', 'kites', 'smogbank'],
  palette: {
    accent: '#6fffc4', shot: '#fff6d8', beam: '#aef0ff', enemy: '#ff3fd2', enemyRim: '#2a0034',
    alien: { grunt: '#ff7a30', diver: '#ffd070', gunner: '#ffb24a', armored: '#c0793c', carrier: '#f4efe2' },
    boss: { hull: '#2e2826', plate: '#8c7e72', weak: '#ffb347' },
  },
  bullet: 'orb',
  bunker: { fill: '#dfe9e2', light: '#ffffff', dark: '#34503c', edge: '#4fd98c', accent: '#a9ecc8', skin: 'filter' },
  power: { spread: '#ffd45a', laser: '#7ae8ff', rapid: '#ff9a5a', shield: '#8aa8ff', homing: '#c9a2ff', slow: '#ffe6b8', bomb: '#ff4a5a', life: '#7aff9a' }, // no pink: the bullets are magenta
  music: { mood: 'breath', root: 'D#', scale: 'major', bpm: 122 }, // a clear morning to dance to: an electric piano over four on the floor and a choir (sound-data.js breath)
  tint: { shade: 'rgba(70,52,32,0.3)', glow: 'rgba(255,214,150,0.08)' }, // the frame in bullet time and the slow power: a smog-amber dusk
};
