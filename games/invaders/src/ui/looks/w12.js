// World 12, Starlit Archive: a library at the edge of the universe, where every star is a book. Shelf
// towers rise like cathedral spires into an indigo nebula, a great domed reading hall with a rose window
// among them and a spiral galaxy turning overhead; golden constellation lines draw themselves from star
// to star across the sky. In the middle distance islands of stacked books float with reading lamps lit,
// ladders and rope bridges between them and a brass orrery turning; in front, the gallery's marble
// balustrade with candles guttering, open books and pools of ink that hold the stars. Pages drift on the
// air, gold motes and candle embers rise, paper cranes cross now and then, a comet, a gust of loose
// pages. The glitch twist is drawn in the library's idiom (react-ink.js, screen-view.js): pages and gold
// dust, a page turning across the frame, bullet time as warm sepia.
// Indigo, warm gold and parchment are ours, with one teal accent (the boss's weak points, the laser, the
// moth's wings); a hot rose-red is the enemy's, so it never hides in the gold.
export default {
  sky: [[0, '#02021a'], [0.3, '#080a34'], [0.58, '#161458'], [0.82, '#33236a'], [1, '#5e3f78']],
  body: 'archive',
  haze: '#3a2c82',
  layers: [
    { kind: 'stacks', color: '#0b0a30', height: 700, speed: 0.06, roughness: 0.8, rim: '#8d86e6', haze: 0.22, window: ['#ffd98a', '#ffe9b0', '#ffc66a'], rose: '#ffd27a', accent: '#4af0d8' },
    { kind: 'isles', color: '#08071f', height: 460, speed: 0.22, roughness: 0.7, rim: '#e8b860', lamp: '#ffd27a', haze: 0.14 },
    { kind: 'gallery', color: '#04030f', height: 320, speed: 0.55, roughness: 0.6, rim: '#f2dca0', flame: '#ffb54a', haze: 0 },
  ],
  ambient: [
    { kind: 'twinkle', phase: 'sky', n: 64, colors: ['#ffffff', '#ffe9b0', '#cfd8ff'], size: [4, 8], speed: 0, alpha: 0.9, maxY: 0.66 },
    { kind: 'spores', phase: 'sky', n: 26, colors: ['#ffd27a', '#fff0c0'], size: [2, 3.6], speed: 10, alpha: 0.5 },
    { kind: 'pages', phase: 'mid', n: 14, colors: ['#efe0b4', '#d9c38a', '#f6ecd0'], size: [16, 24], speed: 40, alpha: 0.8 },
    { kind: 'embers', phase: 'mid', n: 22, colors: ['#ffb14a', '#ffd27a', '#ff9a3a'], size: [2.4, 4.4], speed: 26, alpha: 0.7 },
    { kind: 'pages', phase: 'front', n: 6, colors: ['#efe0b4', '#d9c38a'], size: [20, 28], speed: 70, alpha: 0.4 },
    { kind: 'spores', phase: 'front', n: 12, colors: ['#ffd27a', '#fff6d6'], size: [2.6, 4.4], speed: 18, alpha: 0.6 },
  ],
  flourish: ['galaxy', 'constellation', 'comet', 'cranes', 'orrery', 'inkglint', 'pageturn', 'gust', 'mist'],
  mist: '#6a5ac8', mistAlpha: 0.1,
  palette: {
    accent: '#ffd27a', shot: '#fff4d6', beam: '#4af0d8', enemy: '#ff3a5c', enemyRim: '#1c0008',
    alien: { grunt: '#8a7cff', diver: '#f2e6c8', gunner: '#b04a38', armored: '#b98a42', carrier: '#4af0d8' },
    boss: { hull: '#2a190c', plate: '#b98a42', weak: '#4af0d8' },
  },
  bullet: 'orb',
  bunker: { fill: '#6a3a22', light: '#d8a85a', dark: '#1c0e08', edge: '#f0cf7a', accent: '#f2e2b8', skin: 'tomes' },
  power: { spread: '#ffd45a', laser: '#4af0d8', rapid: '#ff8a5a', shield: '#8aa8ff', homing: '#e48aff', slow: '#f4e8c0', bomb: '#ff4a5a', life: '#ffffff' },
  music: { mood: 'archive', root: 'D', scale: 'dorian', bpm: 116 },
  tint: { shade: 'rgba(58,32,4,0.3)', glow: 'rgba(255,190,80,0.08)' }, // the frame in bullet time and the slow power: warm sepia-gold (screen-view.js)
};
