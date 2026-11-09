// Persia's night, in pixels: a blood-red moon low over a mountain and, under it, each level's
// landmark: Persepolis's ruins on their terrace with fire bowls burning, Si-o-se-pol's lit arches
// over the river, Hafez's pavilion among cypresses, the Azadi Tower over Tehran, the Tomb of Cyrus
// floodlit on its plain, Yazd's windcatchers over lamplit mud brick, the Milad Tower over Tehran's
// night, the Shah Mosque's turquoise dome over Naqsh-e Jahan's pool, Gonbad-e Qabus's brick tower
// floodlit on its green mound, or the Tomb of Ferdowsi's white stone floodlit over its pool. A black
// ground with an amber line, stars and a CRT's scanlines; brass in a Persian mode.
// Data only (the shape is described in looks/index.js).
const FAR = { kind: 'mountains', color: '#2c1c48', height: 420, speed: 0.06, roughness: 0.5 };
const GROUND = { kind: 'ground', color: '#05030a', height: 80, speed: 0.6, roughness: 0, line: '#ffb03a', rim: '#ffb03a', haze: 0 };
const STONE = { color: '#22123a', lit: '#74365e', rim: '#9a4a6a', ink: '#150a20', speed: 0.22 }; // the landmarks' stone

export default {
  sky: [[0, '#05030f'], [0.5, '#120a2e'], [0.82, '#3a1240'], [1, '#6a1e3a']],
  body: 'redmoon',
  haze: '#5a2a6a',
  landmarks: {
    persepolis: [FAR, { kind: 'persepolis', ...STONE, height: 460, fire: '#ff7a2a', flame: '#ffd36a' }, GROUND],
    siosepol: [{ ...FAR, height: 560 }, { kind: 'siosepol', ...STONE, height: 360, glow: '#c8782a', lamp: '#ffd36a',
      water: '#0a0818', tree: '#120a24' }, GROUND],
    hafez: [{ ...FAR, height: 520 }, { kind: 'hafez', ...STONE, height: 488, glow: '#c8782a', lamp: '#ffd36a', tree: '#120a24',
      fruit: '#ff8a2a', dome: '#24404a', rib: '#4a7a7a', tile: '#1e6a7a', tomb: '#d8c8b8' }, GROUND],
    azadi: [{ ...FAR, height: 500 }, { kind: 'azadi', ...STONE, height: 560, glow: '#c8782a', lamp: '#ffd36a',
      tower: '#6e6488', towerLit: '#b4aac8' }, GROUND],
    pasargadae: [{ ...FAR, height: 440 }, { kind: 'pasargadae', ...STONE, height: 600, glow: '#c8782a', lamp: '#ffd36a',
      stone: '#e8d2a8', haze: 0.08 }, GROUND],
    yazd: [{ ...FAR, height: 460 }, { kind: 'yazd', ...STONE, height: 600, glow: '#c8782a', lamp: '#ffd36a',
      brick: '#d8a05c', pool: '#c4d0ec', tree: '#120a24', tile: '#1e6a7a', haze: 0.1 }, GROUND],
    milad: [{ ...FAR, height: 560 }, { kind: 'milad', ...STONE, height: 888, glow: '#c8782a', lamp: '#ffd36a',
      tower: '#6e6488', towerLit: '#b4aac8', red: '#ff3a2a', haze: 0.08 }, GROUND],
    naqsh: [{ ...FAR, height: 480 }, { kind: 'naqsh', ...STONE, height: 560, glow: '#c8782a', lamp: '#ffd36a',
      brick: '#d8a05c', pool: '#c4d0ec', tree: '#120a24', tile: '#1e6a7a', turq: '#2ab9b0', haze: 0.08 }, GROUND],
    qabus: [{ ...FAR, height: 480 }, { kind: 'qabus', ...STONE, height: 592, glow: '#c8782a', lamp: '#ffd36a',
      brick: '#e2bf7c', tile: '#f0dcae', tree: '#0e3a2a', grass: '#2a6e3a', roof: '#964a2e', haze: 0.08 }, GROUND],
    ferdowsi: [{ ...FAR, height: 560 }, { kind: 'ferdowsi', ...STONE, height: 480, glow: '#c8782a', lamp: '#ffd36a',
      stone: '#f7f3ea', shade: '#5f6488', tree: '#0e3a2a', grass: '#2a6e3a', water: '#0a0a24', haze: 0.08 }, GROUND],
  },
  ambient: [
    { kind: 'twinkle', phase: 'sky', n: 60, colors: ['#ffffff', '#ffe0b8', '#c8b8ff'], alpha: 1 },
    { kind: 'scanlines', phase: 'screen', alpha: 0.5 },
  ],
  flourish: ['shooting'],
  palette: {
    accent: '#ffb03a', shot: '#c8ffe0', beam: '#5dff8a', enemy: '#ff5ad8', enemyRim: '#1a0420',
    alien: { dog: '#e8d0a8', cat: '#ff9a3a', bird: '#3affc8', fish: '#5ab8ff', horse: '#c88a5a', cow: '#f4f4f4', rabbit: '#ff7ac8', mouse: '#7c7698', lion: '#e8a838', camel: '#a8925a', fox: '#d04c1c' },
    boss: { hull: '#2a1430', plate: '#ff9a3a', weak: '#ffe14a' },
  },
  bullet: 'pixel',
  power: { spread: '#ffd23a', laser: '#ff5ad8', rapid: '#3affc8', shield: '#7aa8ff', bomb: '#ff6a3a' },
  music: { mood: 'desert brass', root: 'D', scale: 'homayoun', bpm: 112 },
};
