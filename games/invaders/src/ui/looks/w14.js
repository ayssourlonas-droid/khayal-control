// World 14, Ember Carnival: a night fair on the edge of a lake during its fireworks festival. The sky climbs
// from a rose glow over the midway through plum and indigo to near black overhead, a slim moon behind
// drifting smoke, firework bursts hanging high up. Far off, the shore's hills carry a roller coaster whose
// lit track a little car runs along, rockets climbing from the shore and the lake holding the bursts; in the
// middle distance a Ferris wheel turns with its spokes chasing, big-top tents flying pennants and a
// helter-skelter tower; in front the midway: string lights swaying between poles, game booths under marquee
// bulbs and balloons tied to them. Embers, confetti and sky lanterns drift on the air, firework shows go
// up (chrysanthemum, willow, ring), rockets rise on their trails and a searchlight sweeps. The invaders are
// clockwork toys stuffed with powder (aliens/w14*.js); a shell burns a fuse (shell-view.js) and goes off
// in its own colour (react-carnival.js, burst-view.js).
// Indigo, plum and the fairground's gold are ours, with magenta, mint and violet from the fireworks; cyan is
// the one cool accent (the boss's weak points, the laser); the enemy's bullets are an acid lime with a
// near-black rim, which no firework colour of the burst table (react-carnival.js HUES) matches.
export default {
  sky: [[0, '#04011a'], [0.24, '#0b0536'], [0.5, '#1f0f56'], [0.7, '#471868'], [0.86, '#7a2670'], [1, '#b0386c']],
  body: 'carnival',
  haze: '#5a2a78',
  layers: [
    { kind: 'farshore', color: '#0a0522', height: 700, speed: 0.06, roughness: 0.7, rim: '#ff86cc', haze: 0.24, lamp: '#ffd27a', track: '#ffe0a0' },
    { kind: 'midway', color: '#070319', height: 460, speed: 0.22, roughness: 0.6, rim: '#ffa0d8', haze: 0.12, lamp: '#ffd27a', bulb: '#ffe9a0' },
    { kind: 'booths', color: '#03010e', height: 320, speed: 0.55, roughness: 0.6, rim: '#ffd890', haze: 0, bulb: '#ffe9a0' },
  ],
  ambient: [
    { kind: 'twinkle', phase: 'sky', n: 40, colors: ['#ffffff', '#ffe9b0', '#cfd8ff'], size: [4, 8], speed: 0, alpha: 0.85, maxY: 0.55 },
    { kind: 'wisps', phase: 'sky', n: 8, colors: ['#8a5aa8', '#6a3a8a', '#b070b0'], size: [220, 400], speed: 12, alpha: 0.2, maxY: 0.6 },
    { kind: 'lanterns', phase: 'sky', n: 7, colors: ['#ffb04a', '#ff8a5a', '#ffd27a'], size: [18, 28], speed: 16, alpha: 0.9 },
    { kind: 'embers', phase: 'mid', n: 26, colors: ['#ffb14a', '#ffd27a', '#ff7a3a'], size: [2.4, 4.4], speed: 26, alpha: 0.7 },
    { kind: 'confetti', phase: 'mid', n: 22, colors: ['#ff3fa0', '#ffc233', '#4de3ff', '#a77bff', '#4be08a'], size: [6, 11], speed: 40, alpha: 0.85 },
    { kind: 'embers', phase: 'front', n: 12, colors: ['#ffd27a', '#ffffff'], size: [2.6, 4.6], speed: 34, alpha: 0.6 },
    { kind: 'confetti', phase: 'front', n: 8, colors: ['#ff3fa0', '#ffc233', '#4de3ff'], size: [9, 15], speed: 70, alpha: 0.6 },
  ],
  flourish: ['sweep', 'rockets', 'fireworks', 'coaster', 'flags', 'wheel', 'strings', 'balloons', 'mist'],
  mist: '#8a3a8a', mistAlpha: 0.1,
  palette: {
    accent: '#ffc233', shot: '#fff6d8', beam: '#5cf0ff', enemy: '#d8ff3a', enemyRim: '#1c0030',
    alien: { grunt: '#4be08a', diver: '#ff3fa0', gunner: '#ffc233', armored: '#ff6a3a', carrier: '#a77bff' },
    boss: { hull: '#2a0f48', plate: '#e8b23a', weak: '#5cf0ff' },
  },
  bullet: 'orb',
  bunker: { fill: '#c8352e', light: '#f6ead2', dark: '#2a0a28', edge: '#ffd890', accent: '#ffc233', skin: 'booth' },
  power: { spread: '#ffd45a', laser: '#5cf0ff', rapid: '#ff8a5a', shield: '#8aa8ff', homing: '#e48aff', slow: '#fff0c8', bomb: '#ff4a5a', life: '#ffffff' },
  music: { mood: 'carnival', root: 'A#', scale: 'mixolydian', bpm: 156 }, // a calliope waltz (sound-data.js carnival)
  tint: { shade: 'rgba(60,10,70,0.3)', glow: 'rgba(255,150,220,0.08)' }, // the frame in bullet time and the slow power: a magenta dusk
};
