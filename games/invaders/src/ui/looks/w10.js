// World 10, Hollow Night: a haunted hill on Halloween night under a huge harvest moon. A gothic castle
// on its crag, twisted dead trees round a crooked belfry, a graveyard of iron fences and tilted
// headstones with jack-o'-lanterns lit on the ground, leaves tumbling and will-o'-wisps drifting, bats
// and now and then a witch crossing the moon. The world is dark (the twist, Neon Rain's), but
// moonlit (`dark`): the lanterns, the castle's windows, the ghosts' eyes and the Count's red heart
// burn brightest.
// Pumpkin orange and witch-fire green on violet black are ours; blood-rose is the enemy's.
export default {
  sky: [[0, '#05030d'], [0.35, '#0e0720'], [0.6, '#231040'], [0.82, '#4a1c50'], [1, '#8a3a28']],
  body: 'harvestmoon',
  haze: '#3c1a58',
  layers: [
    { kind: 'castle', color: '#140a24', height: 760, speed: 0.06, roughness: 0.8, rim: '#a8522c', haze: 0.22, window: ['#ffb347', '#ffd27a', '#ff9a3a'] },
    { kind: 'deadwood', color: '#0b0618', height: 430, speed: 0.22, roughness: 0.7, rim: '#4a2a5a', lamp: '#7dff5a', window: '#ff9a3a' },
    { kind: 'graveyard', color: '#04020a', height: 190, speed: 0.55, roughness: 0.6, rim: '#3a2a52', haze: 0, lamp: '#ff8a1e' },
  ],
  ambient: [
    { kind: 'embers', phase: 'mid', n: 26, colors: ['#7dff5a', '#b8ff9a', '#4aff8a'], size: [3, 6], speed: 20, alpha: 0.75 },
    { kind: 'petals', phase: 'mid', n: 24, colors: ['#d9701c', '#a84a14', '#7a3a14', '#e8a030'], size: [12, 18], speed: 64, alpha: 0.78 },
    { kind: 'petals', phase: 'front', n: 8, colors: ['#d9701c', '#8a3c14', '#e8a030'], size: [14, 20], speed: 82, alpha: 0.7 },
  ],
  flourish: ['thunder', 'bats', 'witch', 'bolt', 'mist'],
  mist: '#6a5a9c', mistAlpha: 0.11,
  palette: {
    accent: '#ff8a1e', shot: '#f4ffd8', beam: '#8dff3a', enemy: '#ff2e5e', enemyRim: '#1a0010',
    alien: { grunt: '#d6f5e0', diver: '#b8304a', gunner: '#ff8a1e', armored: '#8a6a48', carrier: '#7dff4a' },
    boss: { hull: '#120818', plate: '#8a1430', weak: '#ff2a45' },
  },
  bullet: 'orb',
  bunker: { fill: '#5a5470', light: '#aaa4c4', dark: '#14101e', edge: '#ff9a2e', accent: '#4a7a3a', skin: 'gravestone' },
  power: { spread: '#ffb02e', laser: '#8dff3a', rapid: '#ff6a2a', shield: '#9a8aff', homing: '#ff6ad8', slow: '#4ad8ff', bomb: '#ff3a3a', life: '#ffffff' },
  music: { mood: 'gothic', root: 'D', scale: 'harmonic', bpm: 112 },
  dark: 0.38, // moonlit, not Neon Rain's black: the night's detail stays in view
};
