// World 4, Ronin Moon: ink-brush peaks under a blood moon, crooked pines, a temple gate and a
// pagoda, lanterns, blossoms on the wind. Enemy shots are big slow throwing stars (the twist).
export default {
  sky: [[0, '#0a0607'], [0.45, '#1c0b0e'], [0.75, '#421616'], [1, '#7a2e22']],
  body: 'redmoon',
  haze: '#9a3a2e',
  layers: [
    { kind: 'ink', color: '#4a2224', height: 560, speed: 0.05, roughness: 0.75, mist: 0.1, haze: 0.3 },
    { kind: 'pines', color: '#1e0c0e', height: 380, speed: 0.2, roughness: 0.6 },
    { kind: 'gate', color: '#080405', height: 260, speed: 0.55, roughness: 0.5, haze: 0 },
  ],
  ambient: [
    { kind: 'petals', phase: 'front', n: 46, colors: ['#ffb8c8', '#ffd8e0', '#ff8aa8'], size: [8, 14], speed: 55, alpha: 0.9 },
  ],
  flourish: ['mist'],
  mist: '#c08080', mistAlpha: 0.12,
  palette: {
    accent: '#ff4a4a', shot: '#f2ece0', beam: '#ff4a4a', enemy: '#ff5a4a', enemyRim: '#140608',
    alien: { grunt: '#e8dcc8', diver: '#ff5a5a', gunner: '#c8a86a', armored: '#7a7a8a', carrier: '#ffd23a' },
    boss: { hull: '#1a1012', plate: '#5a2a26', weak: '#ff4a4a' },
  },
  bullet: 'orb',
  bunker: { fill: '#b8382a', light: '#f0805a', dark: '#2a0a08', edge: '#ffcfa0', accent: '#1c1012', skin: 'shrine' },
  power: { spread: '#e8e8f0', laser: '#ff4a4a', rapid: '#ffd27a', shield: '#ffb0c8', homing: '#c08aff', slow: '#7aa8d8', bomb: '#ff6a3a', life: '#6aff9a' },
  music: { mood: 'koto and taiko', root: 'D', scale: 'in', bpm: 72 },
};
