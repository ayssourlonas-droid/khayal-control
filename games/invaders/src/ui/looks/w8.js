// World 8, Event Horizon: a black hole above the formation with its disk lensed into a halo, bent
// starlight, a frozen planet's limb below. Its gravity well bends every bullet (the twist).
export default {
  sky: [[0, '#010104'], [0.6, '#03040e'], [1, '#0c1024']],
  body: 'blackhole',
  haze: '#3a5aa8',
  layers: [
    { kind: 'limb', color: '#14264a', height: 300, speed: 0.04, roughness: 0, rim: '#8fb8ff', haze: 0.35 },
    { kind: 'ice', color: '#0a1428', height: 230, speed: 0.2, roughness: 0.7 },
    { kind: 'ice', color: '#03060e', height: 150, speed: 0.55, roughness: 0.6, haze: 0 },
  ],
  ambient: [
    { kind: 'lensed', phase: 'sky', n: 90, colors: ['#ffffff', '#cfe0ff', '#ffe8c8'], size: [1, 2.2], speed: 0.5, alpha: 0.8, additive: true },
    { kind: 'twinkle', phase: 'sky', n: 40, colors: ['#ffffff', '#cfe0ff'], size: [4, 7], speed: 0, alpha: 0.9, maxY: 0.7 },
  ],
  flourish: ['lens', 'shooting'],
  palette: {
    accent: '#8fb8ff', shot: '#e8f0ff', beam: '#ffd28a', enemy: '#ffb36a', enemyRim: '#1a0a02',
    alien: { grunt: '#c8d8ff', diver: '#8fb8ff', gunner: '#ffd28a', armored: '#6a7aa8', carrier: '#fff0c8' },
    boss: { hull: '#0a0c18', plate: '#3a4a7a', weak: '#ffd28a' },
  },
  bullet: 'orb',
  bunker: { fill: '#3a5a8a', light: '#c8e0ff', dark: '#14203a', edge: '#e8f4ff', skin: 'ice' },
  power: { spread: '#ffd28a', laser: '#8fb8ff', rapid: '#ffb36a', shield: '#c8a8ff', homing: '#ff7ab8', slow: '#e8f4ff', bomb: '#ff7a4a', life: '#7affb0' },
  music: { mood: 'organ swell', root: 'A', scale: 'lydian', bpm: 60 },
};
