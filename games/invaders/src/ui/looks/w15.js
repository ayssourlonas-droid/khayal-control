// World 15, Lantern Deep: the deep sea under a sunken kingdom. Pale light comes down from a surface nobody can
// see, in slow shafts that sway across a water column going from faint blue to blue-black, and marine snow
// sinks through it. Far off, the drowned kingdom's spires stand on a ridge with a few windows still lit, and
// the bones of a giant whale lie across the slope; in the middle distance kelp forests sway between coral
// arches and a sunken ship; in front, the reef: anemones, glowing tube worms, sea grass and a carved stone arch
// hung with lanterns. Everything that lives this deep makes its own light. Bubbles rise, small fish wheel in a
// school, jellyfish drift up, caustics ripple, a whale glides far off, and a maelstrom turns overhead (the
// gravity twist of world 8, re-skinned: a whirlpool of bubbles and light that swallows a bullet as a bubble
// spiralling in).
// Teal and violet bioluminescence are ours, with the lanterns' warm gold; the enemy's bullets are an amber orange
// with a near-black rim, which nothing living in the deep wears (the aliens are teal, violet, lime, rose and
// green); the pearls and the trident (the world's two powers) are pearl-white and aqua.
export default {
  sky: [[0, '#0d4468'], [0.14, '#0a3558'], [0.34, '#07243f'], [0.6, '#041528'], [0.82, '#030d1d'], [1, '#02071a']],
  body: 'deepsea',
  haze: '#0e5a78',
  layers: [
    { kind: 'sunkenkingdom', color: '#04101f', height: 700, speed: 0.06, roughness: 0.7, rim: '#4fd8e8', haze: 0.32, lamp: '#ffd27a', bone: '#0c2a3e' },
    { kind: 'kelpwood', color: '#03111c', height: 460, speed: 0.22, roughness: 0.6, rim: '#38d6b8', haze: 0.14, lamp: '#7af0d0', kelp: '#0a3a3a' },
    { kind: 'reef', color: '#020a14', height: 320, speed: 0.55, roughness: 0.6, rim: '#3fb8a6', haze: 0, lamp: '#ffd27a', glow: '#3df2d0' },
  ],
  ambient: [
    { kind: 'marinesnow', phase: 'sky', n: 56, colors: ['#bfeaff', '#8fd8f0', '#d8f4ff'], size: [1.6, 3.4], speed: 14, alpha: 0.45 },
    { kind: 'minnows', phase: 'sky', n: 10, colors: ['#8fd8f0', '#b8ecff'], size: [8, 14], speed: 30, alpha: 0.4, maxY: 0.6 },
    { kind: 'deepbubbles', phase: 'mid', n: 26, colors: ['#bff4ff', '#8ae8ff'], size: [4, 12], speed: 46, alpha: 0.32 },
    { kind: 'marinesnow', phase: 'mid', n: 30, colors: ['#bfeaff', '#d8f4ff'], size: [2, 4], speed: 20, alpha: 0.4 },
    { kind: 'deepbubbles', phase: 'front', n: 8, colors: ['#bff4ff'], size: [7, 16], speed: 64, alpha: 0.26 },
    { kind: 'marinesnow', phase: 'front', n: 10, colors: ['#d8f4ff', '#ffffff'], size: [2.6, 5], speed: 30, alpha: 0.32 },
  ],
  flourish: ['shafts', 'leviathan', 'school', 'jellydrift', 'caustics', 'kelpsway', 'reefsway', 'maelstrom'],
  palette: {
    accent: '#3df2d0', shot: '#eafcff', beam: '#d08aff', enemy: '#ff9d2e', enemyRim: '#240a00',
    alien: { grunt: '#3de8d0', diver: '#b27cff', gunner: '#c6f26a', armored: '#ff6f9c', carrier: '#4fd68a' },
    boss: { hull: '#07182a', plate: '#2a4a6a', weak: '#9af4ff' },
  },
  bullet: 'orb',
  bunker: { fill: '#3a6a74', light: '#b8e8e0', dark: '#06161c', edge: '#7af0d8', accent: '#ff7a9a', skin: 'reef' },
  power: { spread: '#ffd45a', laser: '#d08aff', rapid: '#ff8a5a', shield: '#8aa8ff', homing: '#ff8ad0', slow: '#d0f0ff', pearls: '#ffd8f0', trident: '#5af0ff', bomb: '#ff4a5a', life: '#9affc8' },
  music: { mood: 'abyss', root: 'F#', scale: 'pentatonic', bpm: 54 }, // a whale's call over a giant's heart (sound-data.js abyss)
  tint: { shade: 'rgba(0,40,70,0.3)', glow: 'rgba(80,220,255,0.08)' }, // the frame in bullet time and the slow power: a deeper teal
};
