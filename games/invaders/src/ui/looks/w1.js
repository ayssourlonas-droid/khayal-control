// World 1, Arcade Origin: deep space through a CRT, a pixel planet, a block city on a green ground
// line, phosphor glow. Data only (the shape is described in looks/index.js).
export default {
  sky: [[0, '#02030c'], [0.55, '#070a24'], [0.85, '#1a0f3e'], [1, '#3a1252']],
  body: 'arcade',
  haze: '#4a2a8a',
  layers: [
    { kind: 'blocks', color: '#160f38', height: 330, speed: 0.08, roughness: 0.7, lights: ['#3affc8', '#ff5ad8', '#ffe066'] },
    { kind: 'blocks', color: '#0c0822', height: 210, speed: 0.25, roughness: 0.6, lights: ['#5dff8a', '#ff5ad8'] },
    { kind: 'ground', color: '#05040e', height: 70, speed: 0.6, roughness: 0, line: '#5dff8a', rim: '#5dff8a', haze: 0 },
  ],
  ambient: [
    { kind: 'twinkle', phase: 'sky', n: 60, colors: ['#ffffff', '#9ad8ff', '#ffb8f0'], size: [2, 4], speed: 0, alpha: 1, pixel: true },
    { kind: 'scanlines', phase: 'screen', n: 0, colors: [], size: [0, 0], alpha: 0.55 },
  ],
  flourish: ['shooting'],
  palette: {
    accent: '#5dff8a', shot: '#c8ffe0', beam: '#5dff8a', enemy: '#ff5ad8', enemyRim: '#1a0420',
    alien: { grunt: '#e8fff0', diver: '#3affc8', gunner: '#ff5ad8', armored: '#ffd23a', carrier: '#ff4f6a' },
    boss: { hull: '#1a1640', plate: '#8a7aff', weak: '#ff5ad8' },
  },
  bullet: 'pixel',
  bunker: { fill: '#2cff6a', light: '#b8ffd0', dark: '#0a6a2a', edge: '#eaffef', skin: 'phosphor' },
  power: { spread: '#ffd23a', laser: '#ff5ad8', rapid: '#3affc8', shield: '#7aa8ff', homing: '#a06aff', slow: '#e8f4ff', bomb: '#ff6a3a', life: '#8aff3a' },
  music: { mood: 'chiptune march', root: 'E', scale: 'minor', bpm: 120 },
};
