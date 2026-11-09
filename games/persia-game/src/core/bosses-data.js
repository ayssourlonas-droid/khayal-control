import { boss, weak, armor, atk, minion, phase, faceFight } from './bosses-kit.js';

// The boss: a giant angry cat head. Its parts are where the picture needs them: the brow plate
// carrying the ears on top, a paw reaching out at each side, and the weak points underneath, two
// eyes and the mouth. The layout keeps a clear column to some weak part from below at every moment
// of the fight (the boss tests check it tick by tick), and when the last weak part falls the plates
// crack open to be shot at full strength (boss-phase.js), so there is always something to aim at.

const giant = boss('giant', 'Giant', 'cat', 240, { w: 640, h: 220 }, [
  armor('brow', 0, -60, 240, 80, 8),
  armor('pawL', -240, 10, 150, 70, 6),
  armor('pawR', 240, 10, 150, 70, 6),
  weak('eyeL', -110, 50, 80, 60, 44),
  weak('eyeR', 110, 50, 80, 60, 44),
  weak('mouth', 0, 70, 90, 70, 70),
], [
  phase(0.65, 'sway', [
    atk('aimed', 2.2, 'mouth', { speed: 0.8 }),
    atk('fan', 4.2, 'eyeL', { count: 3, spread: 0.6 }),
    atk('fan', 4.2, 'eyeR', { count: 3, spread: 0.6 }),
  ]),
  phase(0.3, 'sway', [
    atk('fan', 3.2, 'mouth', { count: 5, spread: 0.9 }),
    atk('ring', 6, 'mouth', { count: 12 }),
    atk('aimed', 2.6, 'eyeL'),
    atk('aimed', 2.6, 'eyeR'),
  ], { rate: 1.2, minions: [minion('cat', 3, 10, 'mouth')] }),
  phase(0, 'charge', [
    atk('ring', 4.5, 'mouth', { count: 16, speed: 0.8 }),
    atk('fan', 3, 'eyeL', { count: 5, spread: 0.8 }),
    atk('fan', 3, 'eyeR', { count: 5, spread: 0.8 }),
    atk('laser', 8, 'mouth'),
  ], { rate: 1.4, minions: [minion('cat', 3, 9, 'mouth'), minion('rabbit', 1, 16, 'brow')] }),
]);

// Level 2's boss: a giant mouse head. Its great round ears and the snout between its eyes are
// armour; the eyes and the buck-toothed mouth are weak, and the mouth keeps pouring out mice.
const giantMouse = boss('giant-mouse', 'Giant Mouse', 'mouse', 240, { w: 600, h: 290 }, [
  armor('earL', -200, -75, 150, 130, 6),
  armor('earR', 200, -75, 150, 130, 6),
  armor('snout', 0, 45, 110, 60, 8),
  weak('eyeL', -95, 0, 80, 60, 44),
  weak('eyeR', 95, 0, 80, 60, 44),
  weak('mouth', 0, 100, 90, 70, 70),
], [
  phase(0.65, 'sway', [
    atk('aimed', 2, 'mouth', { speed: 0.9 }),
    atk('fan', 4.4, 'eyeL', { count: 3, spread: 0.5 }),
    atk('fan', 4.4, 'eyeR', { count: 3, spread: 0.5 }),
  ], { minions: [minion('mouse', 2, 9, 'mouth')] }),
  phase(0.3, 'sway', [
    atk('fan', 3, 'mouth', { count: 5, spread: 0.8 }),
    atk('aimed', 2.4, 'eyeL'),
    atk('aimed', 2.4, 'eyeR'),
  ], { rate: 1.3, minions: [minion('mouse', 4, 8, 'mouth')] }),
  phase(0, 'charge', [
    atk('ring', 4.2, 'mouth', { count: 14, speed: 0.85 }),
    atk('fan', 3, 'eyeL', { count: 5, spread: 0.8 }),
    atk('fan', 3, 'eyeR', { count: 5, spread: 0.8 }),
    atk('laser', 8, 'mouth'),
  ], { rate: 1.5, minions: [minion('mouse', 5, 7, 'mouth'), minion('rabbit', 1, 15, 'snout')] }),
]);

// The giant fish, face on: the dorsal crest on top and a pectoral fin spread at each side are its
// plates; the round eyes and the pouting mouth burn, and the fish pour from the mouth. A rabbit leaves
// the crest in every phase, not only the last, so level 3's fight brings power-ups all the way.
const giantFish = boss('giant-fish', 'Giant Fish', 'fish', 270, { w: 640, h: 300 }, [
  armor('crest', 0, -115, 220, 70, 8),
  armor('finL', -250, 20, 140, 110, 6),
  armor('finR', 250, 20, 140, 110, 6),
  weak('eyeL', -110, -10, 80, 60, 44),
  weak('eyeR', 110, -10, 80, 60, 44),
  weak('mouth', 0, 85, 120, 70, 70),
], faceFight('fish', 'mouth', 'crest'));

// Level 4's giant bird, face on, wings spread: each wing and the crest of head feathers are its
// plates; the round eyes and the open beak burn, and the birds pour from the beak. A rabbit leaves the
// crest in every phase, as the fish's does.
const giantBird = boss('giant-bird', 'Giant Bird', 'bird', 270, { w: 640, h: 300 }, [
  armor('crest', 0, -115, 160, 70, 8),
  armor('wingL', -240, 0, 160, 150, 6),
  armor('wingR', 240, 0, 160, 150, 6),
  weak('eyeL', -80, -20, 70, 60, 44),
  weak('eyeR', 80, -20, 70, 60, 44),
  weak('beak', 0, 75, 90, 90, 70),
], faceFight('bird', 'beak', 'crest'));

// Level 5's giant cow, face on: each horn and the curl of hair between them are its plates; the round
// eyes and the wide mouth under the pink muzzle burn, and the cows pour from the mouth. A rabbit
// leaves the curl in every phase, as the bird's leaves its crest.
const giantCow = boss('giant-cow', 'Giant Cow', 'cow', 270, { w: 640, h: 300 }, [
  armor('hornL', -235, -80, 150, 140, 6),
  armor('hornR', 235, -80, 150, 140, 6),
  armor('curl', 0, -110, 80, 80, 8),
  weak('eyeL', -90, -20, 80, 60, 44),
  weak('eyeR', 90, -20, 80, 60, 44),
  weak('mouth', 0, 112, 120, 60, 70),
], faceFight('cow', 'mouth', 'curl'));

// Level 6's giant dog, face on: each floppy ear and the black nose are its plates; the round eyes and
// the barking mouth under the pale muzzle burn, and the dogs pour from the mouth. A rabbit leaves the
// nose in every phase, as the cow's leaves its curl.
const giantDog = boss('giant-dog', 'Giant Dog', 'dog', 270, { w: 640, h: 300 }, [
  armor('earL', -210, 0, 100, 220, 6),
  armor('earR', 210, 0, 100, 220, 6),
  armor('nose', 0, 10, 100, 60, 8),
  weak('eyeL', -90, -40, 80, 60, 44),
  weak('eyeR', 90, -40, 80, 60, 44),
  weak('mouth', 0, 105, 120, 70, 70),
], faceFight('dog', 'mouth', 'nose'));

// Level 7's giant horse, face on: each pointed ear and the forelock between them are its plates; the
// wide-set eyes and the muzzle with its flared nostrils burn, and the horses pour from the muzzle. A
// rabbit leaves the forelock in every phase.
const giantHorse = boss('giant-horse', 'Giant Horse', 'horse', 270, { w: 640, h: 300 }, [
  armor('earL', -80, -115, 60, 70, 6),
  armor('earR', 80, -115, 60, 70, 6),
  armor('forelock', 0, -75, 60, 70, 8),
  weak('eyeL', -92, -10, 80, 60, 44),
  weak('eyeR', 92, -10, 80, 60, 44),
  weak('mouth', 0, 100, 120, 80, 70),
], faceFight('horse', 'mouth', 'forelock'));

// Level 8's giant lion, face on: each round ear and the crown of the mane between them are its plates;
// the eyes and the roaring jaws under the broad nose burn, and the lions pour from the jaws. A rabbit
// leaves the crown in every phase, and the fight is the dog's and the horse's.
const giantLion = boss('giant-lion', 'Giant Lion', 'lion', 270, { w: 640, h: 300 }, [
  armor('earL', -195, -100, 80, 80, 6),
  armor('earR', 195, -100, 80, 80, 6),
  armor('crown', 0, -120, 150, 50, 8),
  weak('eyeL', -92, -10, 80, 60, 44),
  weak('eyeR', 92, -10, 80, 60, 44),
  weak('mouth', 0, 84, 140, 80, 70),
], faceFight('lion', 'mouth', 'crown'));

// Level 9's giant camel, face on: each small ear and the shaggy tuft on the crown between them are its
// plates; the heavy-lidded eyes and the split-lipped jaws burn, and the camels pour from the jaws. The
// hump behind the head is drawn, not a part. A rabbit leaves the tuft in every phase, and the fight is
// the lion's.
const giantCamel = boss('giant-camel', 'Giant Camel', 'camel', 270, { w: 640, h: 300 }, [
  armor('earL', -125, -100, 60, 60, 6),
  armor('earR', 125, -100, 60, 60, 6),
  armor('tuft', 0, -88, 100, 60, 8),
  weak('eyeL', -92, -10, 80, 60, 44),
  weak('eyeR', 92, -10, 80, 60, 44),
  weak('mouth', 0, 100, 110, 80, 70),
], faceFight('camel', 'mouth', 'tuft'));

// Level 10's giant fox, face on: each tall ear and the russet crown between them are its plates; the
// eyes and the jaws under the black nose burn, and the foxes pour from the jaws. A rabbit leaves the
// crown in every phase, and the fight is the camel's.
const giantFox = boss('giant-fox', 'Giant Fox', 'fox', 270, { w: 640, h: 300 }, [
  armor('earL', -112, -95, 60, 110, 6),
  armor('earR', 112, -95, 60, 110, 6),
  armor('crown', 0, -92, 140, 60, 8),
  weak('eyeL', -92, -22, 80, 60, 44),
  weak('eyeR', 92, -22, 80, 60, 44),
  weak('mouth', 0, 114, 110, 70, 70),
], faceFight('fox', 'mouth', 'crown'));

export const BOSS_DEFS = [giant, giantMouse, giantFish, giantBird, giantCow, giantDog, giantHorse, giantLion, giantCamel, giantFox];

const BY_KIND = new Map(BOSS_DEFS.map((d) => [d.kind, d]));

// The static definition of a boss kind (the world keeps only the kind and the live part state).
export const bossDef = (kind) => BY_KIND.get(kind);
