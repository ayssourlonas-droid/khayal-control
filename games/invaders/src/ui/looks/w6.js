// World 6, Code Rain: black and green, glyphs falling through the dark, data towers, the frame
// glitching when aliens blink between slots; near misses drop into bullet time.
export default {
  sky: [[0, '#000200'], [0.6, '#001006'], [1, '#00200d']],
  body: 'code',
  haze: '#0a5a2a',
  layers: [
    { kind: 'towers', color: '#021a0c', height: 660, speed: 0.05, roughness: 0.8, glyph: '#33ff66', glow: 0.7, haze: 0.2 },
    { kind: 'towers', color: '#010e07', height: 420, speed: 0.2, roughness: 0.7, glyph: '#5dff8a', glow: 1 },
    { kind: 'mountains', color: '#000603', height: 150, speed: 0.55, roughness: 0.2, rim: '#0aa83a', haze: 0 },
  ],
  ambient: [
    { kind: 'glyphs', phase: 'mid', n: 30, colors: ['#22e05a', '#e8fff0'], size: [18, 26], speed: 260, alpha: 0.75, additive: true },
    { kind: 'glyphs', phase: 'front', n: 6, colors: ['#1aa848', '#c8ffd8'], size: [26, 30], speed: 380, alpha: 0.22, additive: true },
  ],
  flourish: [],
  palette: {
    accent: '#33ff66', shot: '#d8ffe0', beam: '#33ff66', enemy: '#9aff7a', enemyRim: '#001a06',
    alien: { grunt: '#33ff66', diver: '#a8ffb8', gunner: '#e8fff0', armored: '#1aa84a', carrier: '#d8ff3a' },
    boss: { hull: '#021a0c', plate: '#0a5a2a', weak: '#e8fff0' },
  },
  bullet: 'orb',
  bunker: { fill: '#063a18', light: '#33ff66', dark: '#011a08', edge: '#a8ffc0', skin: 'data' },
  power: { spread: '#a8ffb8', laser: '#33ff66', rapid: '#e8fff0', shield: '#3affc8', homing: '#c08aff', slow: '#4ab0ff', bomb: '#ff6a3a', life: '#ffe14a' },
  music: { mood: 'minimal techno', root: 'A', scale: 'minor', bpm: 128 },
};
