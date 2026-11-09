// World 3, Twin Suns: a desert planet at the double sunset, mesas, dunes over a sunken giant hull,
// domed huts; sand on the gusts (the twist pushes every bullet sideways).
export default {
  sky: [[0, '#1c2848'], [0.32, '#46598a'], [0.6, '#c4866e'], [0.78, '#f0aa66'], [1, '#ffd49a']],
  body: 'twinsuns',
  haze: '#f2b47a',
  layers: [
    { kind: 'mesas', color: '#8a5866', height: 430, speed: 0.06, roughness: 0.8, haze: 0.5 },
    { kind: 'wreck', color: '#c48450', height: 300, speed: 0.22, roughness: 0.7 },
    { kind: 'huts', color: '#6e4128', height: 170, speed: 0.55, roughness: 0.6, haze: 0.05 },
  ],
  ambient: [
    { kind: 'sand', phase: 'front', n: 70, colors: ['#ffe0b0', '#f0c080'], size: [2, 5], speed: 60, alpha: 0.4 },
  ],
  flourish: ['shimmer'],
  palette: {
    accent: '#ffb347', shot: '#ff6a4a', beam: '#ff5a3a', enemy: '#7aff6a', enemyRim: '#06200a',
    alien: { grunt: '#e8d0a8', diver: '#ff8a4a', gunner: '#c8d8e8', armored: '#8a9aa8', carrier: '#ffd23a' },
    boss: { hull: '#3a3e48', plate: '#8a9aa8', weak: '#ff6a3a' },
  },
  bullet: 'bolt',
  bunker: { fill: '#c8955a', light: '#f2c890', dark: '#6a4224', edge: '#ffe0b0', skin: 'sandstone' },
  power: { spread: '#ffb347', laser: '#ff4a3a', rapid: '#7ad0ff', shield: '#8affc8', homing: '#d890ff', slow: '#4aa0c8', bomb: '#ff6a3a', life: '#c8ff5a' },
  music: { mood: 'desert brass', root: 'C', scale: 'dorian', bpm: 100 },
};
