// World 9, Tidal Siege: a harbour at night in a storm, a sea beast rising out of the water. A far
// city with its windows lit, gantry cranes and container stacks under sodium lamps, a dark sea
// breaking in foam, rain and spray on the wind. Sodium orange is ours, the beast's atomic cyan is theirs.
export default {
  sky: [[0, '#03060d'], [0.35, '#071520'], [0.62, '#0c2e35'], [0.84, '#16564f'], [1, '#2b8c7c']],
  body: 'stormsea',
  haze: '#1f6e68',
  layers: [
    { kind: 'skyline', color: '#0a1a26', height: 520, speed: 0.06, roughness: 0.8, neon: false, windows: ['#ffd89a', '#d8f2ec', '#ffb060'], density: 0.15, haze: 0.38 },
    { kind: 'cranes', color: '#050d13', height: 420, speed: 0.22, roughness: 0.7, lamp: '#ffa23a' },
    { kind: 'sea', color: '#020a0f', height: 190, speed: 0.55, roughness: 0.7, rim: '#7fd8cc', foam: '#cdf0ea', lamp: '#ffa23a', haze: 0 },
  ],
  ambient: [
    { kind: 'rain', phase: 'front', n: 140, colors: ['#a8dcd8', '#78b8bc'], size: [14, 24], speed: 1050, alpha: 0.2 },
    { kind: 'sand', phase: 'front', n: 36, colors: ['#d8f4ee', '#9ad8d0'], size: [2.4, 4.2], speed: 520, alpha: 0.2 },
  ],
  flourish: ['sheet', 'mist'],
  mist: '#6fc8bc', mistAlpha: 0.08,
  palette: {
    accent: '#ffb04a', shot: '#fff0c8', beam: '#ffc060', enemy: '#4ff3ff', enemyRim: '#021418',
    alien: { grunt: '#e8664a', diver: '#6ab0d8', gunner: '#5a8470', armored: '#9a9478', carrier: '#c890ff' },
    boss: { hull: '#1f3444', plate: '#8a9690', weak: '#4ff3ff' },
  },
  bullet: 'orb',
  bunker: { fill: '#2f6e6a', light: '#a8e0d8', dark: '#0a1a1e', edge: '#ffb04a', accent: '#a04a2c', skin: 'container' },
  power: { spread: '#ffc15a', laser: '#4ff3ff', rapid: '#ff7a4a', shield: '#7ab8ff', homing: '#e890ff', slow: '#8affb8', bomb: '#ff4a3a', life: '#ffffff' },
  music: { mood: 'monster', root: 'G', scale: 'phrygian', bpm: 96 },
};
