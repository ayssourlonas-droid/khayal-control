// World 7, Iron Dawn: a war that never ended, a red sun through the smoke, ruined towers burning,
// rubble with red eyes in it, tracer fire, searchlights from above, embers and ash.
export default {
  sky: [[0, '#060608'], [0.4, '#191315'], [0.7, '#43201a'], [0.88, '#8e3a1a'], [1, '#e2662a']],
  body: 'warfire',
  haze: '#a2401a',
  layers: [
    { kind: 'ruins', color: '#2a1818', height: 560, speed: 0.06, roughness: 0.8, haze: 0.3 },
    { kind: 'ruins', color: '#150c0c', height: 380, speed: 0.22, roughness: 0.7 },
    { kind: 'rubble', color: '#080505', height: 210, speed: 0.55, roughness: 0.6, eyes: 6, haze: 0 },
  ],
  ambient: [
    { kind: 'embers', phase: 'front', n: 70, colors: ['#ff8a3a', '#ffb04a', '#ff5a1a'], size: [1.5, 3], speed: 80, alpha: 1 },
    { kind: 'ash', phase: 'front', n: 50, colors: ['#5a4a48', '#3a302e'], size: [2, 3], speed: 40, alpha: 0.7 },
  ],
  flourish: ['blasts', 'tracers', 'gunships'],
  palette: {
    accent: '#ff3a2a', shot: '#7ab8ff', beam: '#7ab8ff', enemy: '#ff4a2a', enemyRim: '#1a0402',
    alien: { grunt: '#a8b0c0', diver: '#c8d0e0', gunner: '#e8ecf4', armored: '#6a7080', carrier: '#ff6a3a' },
    boss: { hull: '#1c1c22', plate: '#6a7080', weak: '#ff2a1a' },
  },
  bullet: 'bolt',
  bunker: { fill: '#4a4446', light: '#8a8288', dark: '#1c1818', edge: '#ff8a4a', accent: '#8a5a48', skin: 'rubble' },
  power: { spread: '#ffb347', laser: '#7ab8ff', rapid: '#ff6a3a', shield: '#8ad8ff', homing: '#d890ff', slow: '#5a8aff', bomb: '#ff3a2a', life: '#7aff7a' },
  music: { mood: 'industrial pulse', root: 'F', scale: 'minor', bpm: 96 },
};
