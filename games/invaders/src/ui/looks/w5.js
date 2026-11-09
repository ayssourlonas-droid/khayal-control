// World 5, Hive: a biomechanical cavern, ribs of bone overhead, columns and chitin spires, a clutch
// of eggs on the floor, spores and mist, acid dripping (destroyed armored aliens leave acid).
export default {
  sky: [[0, '#020604'], [0.5, '#06120e'], [0.8, '#0c241c'], [1, '#163628']],
  body: 'hive',
  haze: '#2a5a44',
  layers: [
    { kind: 'ribs', color: '#11211a', height: 760, speed: 0.05, roughness: 0.7, haze: 0.25 },
    { kind: 'spires', color: '#0a1712', height: 470, speed: 0.2, roughness: 0.7 },
    { kind: 'eggs', color: '#050b08', height: 190, speed: 0.55, roughness: 0.5, glow: '#9aff6a', haze: 0 },
  ],
  ambient: [
    { kind: 'spores', phase: 'front', n: 60, colors: ['#9ad67a', '#c8ffa8', '#5affb0'], size: [2, 4], speed: 18, alpha: 0.7 },
  ],
  flourish: ['drips', 'mist'],
  mist: '#5a9a7a', mistAlpha: 0.16,
  palette: {
    accent: '#9ad67a', shot: '#d8f0ff', beam: '#c8ff6a', enemy: '#c8ff3a', enemyRim: '#0a1a04',
    alien: { grunt: '#8aa898', diver: '#c8c2a8', gunner: '#9ad67a', armored: '#5a6a62', carrier: '#d8ff6a' },
    boss: { hull: '#0e1814', plate: '#3a4a42', weak: '#c8ff3a' },
  },
  bullet: 'orb',
  bunker: { fill: '#2a3a30', light: '#6a8a72', dark: '#0c1610', edge: '#b8ff9a', skin: 'resin' },
  power: { spread: '#d8f0ff', laser: '#c8ff6a', rapid: '#ffd27a', shield: '#7ad8ff', homing: '#ff8ad8', slow: '#b8a8ff', bomb: '#ff7a3a', life: '#ff5a8a' },
  music: { mood: 'dread drones', root: 'C#', scale: 'locrian', bpm: 66 },
};
