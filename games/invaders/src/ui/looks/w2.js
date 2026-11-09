// World 2, Neon Rain: a megacity at night under smog, rain, towers of lit windows, neon strips,
// billboards, flying traffic and searchlights. The world is dark (the twist): only neon carries.
export default {
  sky: [[0, '#04030b'], [0.4, '#110a24'], [0.7, '#331040'], [0.88, '#6a1a4e'], [1, '#a83a62']],
  body: 'megacity',
  haze: '#8a2a6a',
  layers: [
    { kind: 'skyline', color: '#1a1030', height: 640, speed: 0.06, roughness: 1, windows: ['#ffd8a0', '#7ff6ff', '#ff9ad8'], density: 0.22 },
    { kind: 'skyline', color: '#0e0a1c', height: 460, speed: 0.22, roughness: 0.9, windows: ['#ffe9a8', '#7ff6ff', '#ff7ad8'], density: 0.18, signs: true, neon: ['#ff4fd8', '#2ef2ff', '#ffb02e'] },
    { kind: 'rooftops', color: '#06040c', height: 230, speed: 0.55, roughness: 0.8, windows: ['#ffd8a0', '#7ff6ff'], neon: ['#ff4fd8', '#2ef2ff'] },
  ],
  ambient: [
    { kind: 'rain', phase: 'front', n: 220, colors: ['#9ff6ff', '#ffa8e0'], size: [16, 30], speed: 1300, alpha: 0.3 },
  ],
  flourish: ['searchlights', 'bolt', 'flares', 'cars', 'holo', 'mist'],
  mist: '#c070c0', mistAlpha: 0.1,
  palette: {
    accent: '#2ef2ff', shot: '#bff8ff', beam: '#ff4fd8', enemy: '#ff4fd8', enemyRim: '#200418',
    alien: { grunt: '#2ef2ff', diver: '#ff4fd8', gunner: '#ffb02e', armored: '#9a7aff', carrier: '#fff27a' },
    boss: { hull: '#141026', plate: '#3a2a5a', weak: '#ff4fd8' },
  },
  bullet: 'orb',
  bunker: { fill: '#2e2e40', light: '#7a7a9a', dark: '#0e0e16', edge: '#ff4fd8', accent: '#7ff6ff', skin: 'kiosk' },
  power: { spread: '#2ef2ff', laser: '#ff4fd8', rapid: '#ffb02e', shield: '#9a7aff', homing: '#a8ff4a', slow: '#3a7aff', bomb: '#ff5a3a', life: '#ffffff' },
  music: { mood: 'noir synth pads', root: 'D', scale: 'phrygian', bpm: 84 },
};
