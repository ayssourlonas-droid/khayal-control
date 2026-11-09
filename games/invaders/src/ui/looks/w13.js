// World 13, Sunset Armada: golden hour over a sea of clouds. A huge low sun burns on the horizon, its rays
// fanning through towering cumulus lit gold and rose, the sky climbing from rose-gold through violet to a
// deep blue overhead. Far off, islands float with waterfalls pouring into the cloud sea, a watchtower on
// one and a whole fleet of airships hull-down in the glare; in the middle distance brass-and-canvas
// airships drift by, their propellers turning and their portholes lit, between floating rocks that carry
// windmills; in front the cloud tops roll, lit from below, with mooring balloons riding on their cables.
// Gulls and flocks of birds cross, a far airship sails over now and then, and the clouds flash with
// cannon fire. The ship's own broadside and escorts (ship-armada.js, react-armada.js) are drawn in the
// same brass and canvas.
// Sunset gold and rose over violet-blue shadows are ours, with cyan as the one cool accent (the boss's
// weak points, the laser); the enemy's shells are a hard crimson with a near-black rim, so they never
// sink into the gold or the rose (test/ui/armada-look.test.js measures it against the whole sky).
export default {
  sky: [[0, '#14185a'], [0.2, '#262a86'], [0.4, '#52409a'], [0.56, '#9a58a0'], [0.7, '#e2788c'], [0.84, '#ffa87a'], [1, '#ffd890']],
  body: 'sunset',
  haze: '#e8808c',
  layers: [
    { kind: 'cloudisles', color: '#2e2260', height: 700, speed: 0.06, roughness: 0.7, rim: '#ffd9a0', haze: 0.3, lamp: '#ffc86a', fleet: '#3a2a6c' },
    { kind: 'airships', color: '#22184a', height: 460, speed: 0.22, roughness: 0.6, rim: '#ffc57a', haze: 0.1, lamp: '#ffd27a', sail: '#e8b878' },
    { kind: 'cloudsea', color: '#5a3a8a', height: 320, speed: 0.55, roughness: 0.6, rim: '#fff0c8', haze: 0 },
  ],
  ambient: [
    { kind: 'wisps', phase: 'sky', n: 9, colors: ['#ffe0b8', '#ffc8a0', '#f4d0e8'], size: [160, 320], speed: 14, alpha: 0.2, maxY: 0.62 },
    { kind: 'spores', phase: 'sky', n: 30, colors: ['#ffe9b0', '#fff6d8'], size: [2.2, 4], speed: 8, alpha: 0.55 },
    { kind: 'gulls', phase: 'mid', n: 5, colors: ['#fff6e8', '#f4e4d0'], size: [22, 34], speed: 38, alpha: 0.9 },
    { kind: 'spores', phase: 'mid', n: 22, colors: ['#ffd27a', '#ffe9b0'], size: [2.4, 4.4], speed: 20, alpha: 0.6 },
    { kind: 'wisps', phase: 'front', n: 5, colors: ['#ffe8d0', '#f8d0c0'], size: [200, 380], speed: 46, alpha: 0.1 },
    { kind: 'spores', phase: 'front', n: 12, colors: ['#ffe9b0', '#ffffff'], size: [2.6, 4.6], speed: 26, alpha: 0.6 },
  ],
  flourish: ['godrays', 'birds', 'farship', 'cannonfire', 'falls', 'flags', 'props', 'tether', 'mist'],
  mist: '#ffb8a0', mistAlpha: 0.12,
  palette: {
    accent: '#ffc15a', shot: '#fff6d0', beam: '#4de3ff', enemy: '#ff2e63', enemyRim: '#14001c',
    alien: { grunt: '#d9a441', diver: '#e6e0f2', gunner: '#d4553a', armored: '#7d8aa0', carrier: '#f1d596' },
    boss: { hull: '#3a2210', plate: '#c8902a', weak: '#4de3ff' },
  },
  bullet: 'orb',
  bunker: { fill: '#8a5a2e', light: '#d8a85a', dark: '#241206', edge: '#ffd890', accent: '#e8d4a0', skin: 'cargo' },
  power: { spread: '#ffd45a', laser: '#4de3ff', rapid: '#ff8a5a', shield: '#8aa8ff', homing: '#e48aff', slow: '#fff0c8', wingmen: '#6af0a0', bomb: '#ff4a5a', life: '#ffffff' },
  music: { mood: 'armada', root: 'G', scale: 'major', bpm: 132 },
  tint: { shade: 'rgba(70,20,40,0.28)', glow: 'rgba(255,180,90,0.08)' }, // the frame in bullet time and the slow power: a rose dusk
};
