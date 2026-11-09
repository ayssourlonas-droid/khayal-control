// World 11, Aurora Kingdom: a kingdom of ice under the polar night, the aurora burning over it. Glacier
// peaks and an ice castle whose spires and pale-gold windows take the aurora's light, ice cliffs and a
// fleet of tall ships locked in the ice with a lantern still burning on two, floes on black water
// shimmering green and violet, a frozen lighthouse sweeping its beam through the haze. Snow falls,
// ice glitters, a squall crosses now and then. The aurora (flourish 'aurora') is the show; the cliffs'
// rims and the water echo its light as it moves. The shuriken twist is drawn as shards of ice.
// Aurora green and violet on polar blue are ours; amber is the ship's, hot coral the enemy's.
export default {
  sky: [[0, '#010309'], [0.28, '#030a22'], [0.55, '#06204a'], [0.8, '#0a4872'], [1, '#157a86']],
  body: 'polarnight',
  haze: '#2a78a8',
  layers: [
    { kind: 'glacier', color: '#0a2038', height: 680, speed: 0.06, roughness: 0.8, rim: '#bfe6ff', haze: 0.26, window: ['#ffe9a8', '#ffd98a', '#fff3c8'], tip: '#9affd6' },
    { kind: 'icefleet', color: '#06182c', height: 430, speed: 0.22, roughness: 0.7, rim: '#9affd0', lamp: '#ffb04a', haze: 0.16 },
    { kind: 'floes', color: '#02060f', height: 340, speed: 0.55, roughness: 0.6, rim: '#7ad0ff', lamp: '#ffe6a0', haze: 0 },
  ],
  ambient: [
    { kind: 'twinkle', phase: 'sky', n: 56, colors: ['#ffffff', '#cfe8ff', '#d8ffe8'], size: [4, 8], speed: 0, alpha: 0.9, maxY: 0.62 },
    { kind: 'snow', phase: 'sky', n: 56, colors: ['#cfe6ff', '#ffffff'], size: [1.6, 2.6], speed: 30, alpha: 0.5 },
    { kind: 'spores', phase: 'mid', n: 20, colors: ['#cfeaff', '#d8fff0'], size: [2, 3.4], speed: 14, alpha: 0.45 },
    { kind: 'snow', phase: 'mid', n: 38, colors: ['#e8f4ff', '#ffffff', '#bfe0ff'], size: [2.4, 4.4], speed: 52, alpha: 0.62 },
    { kind: 'flakes', phase: 'front', n: 10, colors: ['#ffffff', '#d8efff'], size: [20, 34], speed: 72, alpha: 0.5 },
    { kind: 'twinkle', phase: 'front', n: 16, colors: ['#ffffff', '#bff4ff', '#d8ffe8'], size: [4, 9], speed: 0, alpha: 0.85, maxY: 0.97 },
  ],
  flourish: ['aurora', 'shooting', 'lighthouse', 'auroraglint', 'mist', 'squall'],
  mist: '#8ab8e8', mistAlpha: 0.09,
  palette: {
    accent: '#ffb84a', shot: '#fff3d0', beam: '#58ffc0', enemy: '#ff5a28', enemyRim: '#1a0600',
    alien: { grunt: '#a8f0ff', diver: '#eef2ff', gunner: '#9a8cff', armored: '#7a98b8', carrier: '#4ff0c0' },
    boss: { hull: '#12304a', plate: '#8ac8f0', weak: '#c8f8ff' },
  },
  bullet: 'orb',
  star: 'ice', // the shuriken twist's shards (bullet-sprites.js): translucent faceted ice, not steel
  bunker: { fill: '#3f7fb4', light: '#cdeeff', dark: '#0b2540', edge: '#bff4ff', accent: '#f4fbff', skin: 'glacier' },
  power: { spread: '#ffd45a', laser: '#5affc0', rapid: '#ff7a4a', shield: '#6ab0ff', homing: '#d070ff', slow: '#aef4ff', bomb: '#ff4a5a', life: '#ffffff' },
  music: { mood: 'aurora', root: 'E', scale: 'lydian', bpm: 84 },
};
