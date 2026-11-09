// World 18, Anvil Sky: a dogfight inside a thunderstorm at dusk. A deck of heavy cloud covers the sky, lumps of it lit from within by a cold
// lilac light, with a slit of clear sky low on the right and a small orange sun burning in it (sky-bodies-10.js stormdusk). Along the horizon
// stand five towers of cumulonimbus with flat ANVIL tops and hanging pouches, rising out of a sea of cloud, lit from inside (parallax-storm-anvil.js
// stormanvils); nearer, broken cloud pillars with rain hanging between them (stormpillars), and in front the dark heaving deck of the storm
// (stormdeck). Rain streaks in three depths and the small sparks of St. Elmo's fire (ambient-10.js), and flourishes (flourish-storm.js): sheet
// lightning that lights the sky and the struck tower from inside, forked bolts, rain curtains sweeping by, shafts of the sun's orange fanning up
// under the deck and rags of dark cloud torn across it by the gale. The palette is cold slate and indigo with warm orange only at the
// horizon and amber on the hornets; the ship is electric cyan, the lightning is yellow-white, and the enemy's bullets are a hot rose with a
// near-black rim, which nothing in the storm wears. A homing bullet the chase has turned (b.dragged, R67) takes the ship's cyan.
export default {
  sky: [[0, '#070b1c'], [0.2, '#101a38'], [0.42, '#233459'], [0.62, '#4b4a6e'], [0.78, '#8a5a63'], [0.9, '#d0743a'], [1, '#f0a040']],
  body: 'stormdusk',
  haze: '#4a4f78',
  mist: '#7a86b8', mistAlpha: 0.07, // the generic low mist (flourish.js): a faint cold bank over the deck
  layers: [
    { kind: 'stormanvils', color: '#161d3a', height: 700, speed: 0.06, roughness: 0.6, rim: '#7a8cd0', haze: 0.24, glow: '#bcd0ff' },
    { kind: 'stormpillars', color: '#0e1328', height: 460, speed: 0.22, roughness: 0.6, rim: '#7080c0', haze: 0.12, glow: '#a8c0ff' },
    { kind: 'stormdeck', color: '#070a16', height: 320, speed: 0.55, roughness: 0.6, rim: '#3c486f', haze: 0 },
  ],
  ambient: [
    { kind: 'stormrain', phase: 'sky', n: 70, colors: ['#9fb4e8', '#7f94c8'], size: [34, 70], speed: 780, alpha: 0.2, maxY: 1 },
    { kind: 'stormrain', phase: 'mid', n: 56, colors: ['#bccdf4', '#9fb4e8'], size: [40, 84], speed: 900, alpha: 0.26, maxY: 1 },
    { kind: 'staticglints', phase: 'mid', n: 16, colors: ['#e8f4ff', '#bcd8ff', '#fff2b0'], size: [2, 5], speed: 24, alpha: 0.4, maxY: 0.9, additive: true },
    { kind: 'stormrain', phase: 'front', n: 20, colors: ['#dce6ff'], size: [60, 110], speed: 1200, alpha: 0.2, maxY: 1 },
  ],
  flourish: ['stormsheet', 'stormbolts', 'stormcurtains', 'stormsun', 'stormgusts', 'mist'],
  palette: {
    accent: '#5cf0ff', shot: '#e8ffff', beam: '#ffe34a', enemy: '#ff3860', enemyRim: '#1a0008',
    alien: { grunt: '#ffb21e', diver: '#e4eeff', gunner: '#d98a4a', armored: '#7f8caa', carrier: '#ead9ae' },
    boss: { hull: '#222a40', plate: '#7584a8', weak: '#ffe14a' },
  },
  bullet: 'orb',
  bunker: { fill: '#4a4f66', light: '#9aa4c0', dark: '#161a28', edge: '#ffb066', accent: '#5c6684', skin: 'rubble' }, // the level has none: iron rubble if one is ever set
  power: { spread: '#ffd45a', laser: '#7ae8ff', rapid: '#ff9a5a', shield: '#8aa8ff', homing: '#c9a2ff', slow: '#ffe6b8', sideguns: '#bfeaff', bomb: '#ff4a5a', life: '#7aff9a' },
  music: { mood: 'anvil', root: 'G#', scale: 'bright', bpm: 108 }, // struck iron bars and a heavy beat in a major pentatonic (sound-data.js anvil)
  tint: { shade: 'rgba(16,24,64,0.34)', glow: 'rgba(170,200,255,0.08)' }, // the frame in bullet time and the slow power: a storm-blue dusk
};
