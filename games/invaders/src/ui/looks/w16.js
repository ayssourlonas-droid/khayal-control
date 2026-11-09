// World 16, Glass Cathedral: a vast stained-glass cathedral, half ruined and open to a dawn sky. A deep dawn (indigo
// to plum to a rose horizon, dark enough that every bullet and alien reads on it) seen through the broken vault
// (sky-bodies-8.js); far off, the nave's stained lancets, the great rose window in the west front, a belfry and a
// free-standing window frame (parallax-glass.js); nearer, columns, flying buttresses and chandeliers
// (parallax-glass-mid.js); in front, a floor of shattered glass, candle stands and a stump of carved arch
// (parallax-glass-near.js). Shafts of coloured light, patches of window light, glass doves, the bell, the turning
// fans of the rose window and swaying chandeliers (flourish-glass.js, -2.js); dust, glints and candle sparks
// (ambient-8.js). Everything is dim beside a bullet, and the sprites are baked up front (warm-glass-env.js).
// Everything that lives here is glass, lead and stone: rose, cobalt, amber and violet jewel light on pale stone; the
// enemy's bullets are an acid lime with a deep-green rim, which nothing in the cathedral wears.
export default {
  sky: [[0, '#0b0830'], [0.18, '#170f4a'], [0.4, '#301868'], [0.6, '#63267a'], [0.78, '#a03a7c'], [1, '#cc5c7a']],
  body: 'glassvault',
  haze: '#6a2a7a',
  mist: '#d889a8', mistAlpha: 0.07, // the generic low mist (flourish.js): a faint rose bank over the floor
  layers: [
    { kind: 'glassnave', color: '#33264f', height: 700, speed: 0.06, roughness: 0.6, rim: '#ffa4b4', haze: 0.3 },
    { kind: 'glasscolumns', color: '#150e2a', height: 460, speed: 0.22, roughness: 0.6, rim: '#c0688a', haze: 0.12 },
    { kind: 'glassfloor', color: '#0b0719', height: 320, speed: 0.55, roughness: 0.6, rim: '#6a4a8a', haze: 0 },
  ],
  ambient: [
    { kind: 'dustmotes', phase: 'sky', n: 40, colors: ['#ffe0b8', '#ffc4d4', '#cfe0ff'], size: [1.2, 2.6], speed: 9, alpha: 0.3, maxY: 0.72, additive: true },
    { kind: 'dustmotes', phase: 'mid', n: 22, colors: ['#ffe0b8', '#ffc4d4'], size: [1.4, 2.8], speed: 12, alpha: 0.26, maxY: 0.8, additive: true },
    { kind: 'glassglints', phase: 'mid', n: 14, colors: ['#8ab4ff', '#ff9ec0', '#c4a8ff', '#ffd9a0'], size: [8, 15], speed: 14, alpha: 0.34 },
    { kind: 'glassglints', phase: 'front', n: 5, colors: ['#8ab4ff', '#ff9ec0', '#c4a8ff'], size: [6, 10], speed: 20, alpha: 0.24 },
    { kind: 'candlesparks', phase: 'front', n: 6, colors: ['#ffb070', '#ff9a68'], size: [1.6, 2.6], speed: 0, alpha: 0.36 },
  ],
  flourish: ['glassshafts', 'rosefan', 'glassdoves', 'belfry', 'chandeliers', 'mist', 'lightpatches'],
  palette: {
    accent: '#6fd8ff', shot: '#fff2d0', beam: '#9ad0ff', enemy: '#9cff3a', enemyRim: '#0e2a00',
    alien: { grunt: '#ff5fa2', diver: '#4fa8ff', gunner: '#ffb04a', armored: '#a47cff', carrier: '#ffe27a' },
    boss: { hull: '#1c1440', plate: '#7a5ca8', weak: '#ffe9b0' },
  },
  bullet: 'orb',
  bunker: { fill: '#8a7a96', light: '#e8dcec', dark: '#1a1224', edge: '#ffc0d8', accent: '#6fa8ff', skin: 'glass' },
  power: { spread: '#ffd45a', laser: '#ff8ad8', rapid: '#ff9a5a', shield: '#8aa8ff', homing: '#ffa0e0', slow: '#ffe6b8', mirror: '#bfe8ff', bomb: '#ff4a5a', life: '#9affc8' },
  music: { mood: 'glass', root: 'B', scale: 'melodic', bpm: 63 }, // a glass harmonica and a choir in 6/8 (sound-data.js glass)
  tint: { shade: 'rgba(50,20,90,0.3)', glow: 'rgba(255,170,220,0.08)' }, // the frame in bullet time and the slow power: a rose-violet dusk
};
