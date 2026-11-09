// The eleven animals, angry and a little absurd, as crisp pixel sprites on a CRT: every cell a lit
// phosphor dot with an afterglow, the eyes and lights burning. Every one but the rabbit glares from
// under lit red brows. The whole formation steps in time; frame 2 is the snarl, the beat, the claws.
// Exports RATE, HALO and PAINTERS, a painter per species id (bake.js bakes them).
// Original bitmaps, at most 11 cells wide (no wider than the hit): X body, h highlight, d shadow,
// k ink (sockets, mouths, nostrils), w teeth and claws, b lit brow, o lit eye, y lit cat's eye,
// p lit lips, nose and tongue, a beak, n horn, m muzzle, r lit nose ring, c lit core, s lit spit,
// e the lion's dark mane (and its nose), u the camel's hump, A the fox's lit amber eyes.
import { pixels, phosphor, shade } from './kit.js';

const PX = 5;

const ROWS = {
  dog: [[ // ears hanging, a patch over one eye, teeth bared
    '..XXXXXXX..', 'ddbbXXXbbdd', 'ddXXbXbdddd', 'ddkoXXXokdd', 'dd.XhhhX.dd', 'dd.hkkkh.dd',
    'dd.hhkhh.dd', '.d.kwkwk.d.', '...XXXXX...',
  ], [ // ears flapping out, snapping
    '..XXXXXXX..', 'ddbbXXXbbdd', 'ddXXbXbdddd', 'ddkoXXXokdd', 'd..XhhhX..d', '...hkkkh...',
    '...hhkhh...', '...wkkkw...', '...XwpwX...',
  ]],
  cat: [[ // ears back, slit eyes, fangs
    'X.........X', 'XX.......XX', 'XhX.....XhX', 'XXXXXXXXXXX', 'bbXXXXXXXbb', 'XXbbXXXbbXX',
    'XykyXXXykyX', 'XXXXXpXXXXX', '.XXXwkwXXX.', '..XXXXXXX..', '.XX.....XX.', '...........',
  ], [ // arched and bristling, hissing, claws out
    'X.........X', 'XX.......XX', 'XhX.....XhX', 'XXXXXXXXXXX', 'bbXXXXXXXbb', 'XXbbXXXbbXX',
    'XykyXXXykyX', 'XXXXXpXXXXX', 'XXXwkkkwXXX', 'X.XXXXXXX.X', '.XX.....XX.', 'w.w.....w.w',
  ]],
  bird: [[ // diving beak-first, wings up
    'X.........X', 'XX..hhh..XX', 'XXX.XXX.XXX', '.XXXXXXXXX.', '..bbXXXbb..', '..XXbXbXX..',
    '..koXXXok..', '...XXXXX...', '....aaa....', '.....a.....',
  ], [ // wings down
    '...........', '....hhh....', '....XXX....', '..XXXXXXX..', '.XbbXXXbbX.', 'XXXXbXbXXXX',
    'X.koXXXok.X', 'X..XXXXX..X', '....aaa....', '.....a.....',
  ]],
  fish: [[ // standing on its tail, lips puckered
    '...XXdXX...', '..bbXXXbb..', '.XXXbXbXXX.', '.XkoXXXokX.', 'dXXXXXXXXXd', 'dXXXpppXXXd',
    '.XXXpkpXXX.', '..XhXhXhX..', '...XhXhX...', '....XXX....', '...ddddd...', '..dd.d.dd..',
  ], [ // fins up, spitting
    '...XXdXX...', '..bbXXXbb..', 'dXXXbXbXXXd', 'dXkoXXXokXd', '.XXXpppXXX.', '.XXpkkkpXX.',
    '.XXXpppXXX.', '..XhXsXhX..', '...XhshX...', '....XXX....', '...ddddd...', '..dd.d.dd..',
  ]],
  horse: [[ // a long face, ears pinned, nostrils flared
    '..X.....X..', '..XXdddXX..', '.bbXdddXbb.', '.XXbXdXbXX.', '.koXXXXXok.', '..XXXhXXX..',
    '...XXhXX...', '...XXhXX...', '..XdddddX..', '..dkkdkkd..', '...ddddd...',
  ], [ // rearing, hooves up
    '..X.....X..', '..XXdddXX..', '.bbXdddXbb.', '.XXbXdXbXX.', '.koXXXXXok.', 'k.XXXhXXX.k',
    'X..XXhXX..X', 'XX.XXhXX.XX', '.XXdddddXX.', '.dkkkdkkkd.', '...ddddd...',
  ]],
  cow: [[ // horned, plated, a ring through its nose
    'n.........n', 'nn.XXXXX.nn', '.nnXdddXnn.', '.XdddddddX.', '.bbdhdhdbb.', 'XXXbXXXbXXX',
    'XkoXXXXXokX', '.XmmmmmmmX.', '.mmkmmmkmm.', '..mmmrmmm..', '....r.r....', '.....r.....',
  ], [ // snorting, the ring swinging
    'n.........n', 'nn.XXXXX.nn', '.nnXdddXnn.', '.XdddddddX.', '.bbdhdhdbb.', 'XXXbXXXbXXX',
    'XkoXXXXXokX', '.XmmmmmmmX.', '.mmkmmmkmm.', '..mmmmrmm..', '.....r.r...', '......r....',
  ]],
  rabbit: [[ // huge ears, hugging the core it drops
    '..XX...XX..', '..XhX.XhX..', '..XhX.XhX..', '..XhX.XhX..', '...XXXXX...', '..XXXXXXX..',
    '..XkXXXkX..', '...XXkXX...', '..XcccccX..', '.hXccoccXh.', '..XcccccX..', '...XX.XX...',
  ], [ // an ear flops, the core pulses
    '..XX.....XX', '..XhX...XhX', '..XhX..XhX.', '..XhX.XhX..', '...XXXXX...', '..XXXXXXX..',
    '..XkXXXkX..', '...XXkXX...', '..XcccccX..', '.hXcooocXh.', '..XcccccX..', '...XX.XX...',
  ]],
  mouse: [[ // round ears up, brows down, buck teeth
    '.XXX...XXX.', 'XmmmX.XmmmX', 'XmmmX.XmmmX', '.XXXXXXXXX.', 'XbbXXXXXbbX', 'XXXbbXbbXXX',
    'XXkoXXXokXX', 'wXXXXhXXXXw', '.wwXXpXXww.', '..XXkkkXX..', '...XwkwX...', '....XXX....',
  ], [ // ears flared, whiskers up, squeaking
    'XXX.....XXX', 'XmmX...XmmX', 'XmmmX.XmmmX', '.XXXXXXXXX.', 'XbbXXXXXbbX', 'XXXbbXbbXXX',
    'XXkoXXXokXX', '.wXXXhXXXw.', 'w.XXXpXXX.w', '..XkwkwkX..', '...XpppX...', '....XXX....',
  ]],
  lion: [[ // round ears over a dark mane, a golden face, a broad dark nose, fangs
    '.XXX...XXX.', '.XdXeeeXdX.', '.eeeeeeeee.', 'eebbXXXbbee', 'eeXbbXbbXee', 'eekoXXXokee',
    'eeXXeeeXXee', 'eeXhhkhhXee', 'eeXXwkwXXee', '.eeeXXXeee.', '..eeeeeee..', '...e.e.e...',
  ], [ // ears laid back, the mane flared, roaring
    'e.e.eee.e.e', 'eXXeeeeeXXe', 'eeeeeeeeeee', 'eebbXXXbbee', 'eeXbbXbbXee', 'eekoXXXokee',
    'eeXXeeeXXee', 'eeXwkkkwXee', 'eeXkkpkkXee', 'eeeXwkwXeee', '.eeeXXXeee.', '..e.e.e.e..',
  ]],
  camel: [[ // the hump's dome between small ears, heavy lids over the eyes, a split upper lip
    '....uhu....', '.X.uuuuu.X.', '.XuuuuuuuX.', '.bbXXXXXbb.', '.XbbXXXbbX.', '.dddXXXddd.',
    '.XkoXXXokX.', '..XXXXXXX..', '...XXhXX...', '..XkXXXkX..', '.XdddkdddX.', '..XXdddXX..',
  ], [ // ears flat, the lips peeled back, spitting
    '....uhu....', '.XX.uuu.XX.', '.XuuuuuuuX.', '.bbXXXXXbb.', '.XbbXXXbbX.', '.dddXXXddd.',
    '.XkoXXXokX.', '..XXXXXXX..', '...XXhXX...', '..XkXXXkX..', '.XdkssskdX.', '..XXdsdXX..',
  ]],
  fox: [[ // tall black-backed ears, brows slanted down to amber eyes, white cheeks, a pointed muzzle
    '.k.......k.', 'kwk.....kwk', 'kwwk...kwwk', 'kXwXXXXXwXk', '.XbbXXXbbX.', '.XXbbXbbXX.',
    'XkAkXXXkAkX', 'wwXXXXXXXww', '.wwwXXXwww.', '..wwkkkww..', '...wwkww...', '....www....',
  ], [ // ears flat, the lips peeled back, fangs bared
    '...........', 'k.........k', 'kwk.....kwk', 'kwwXXXXXwwk', '.XbbXXXbbX.', '.XXbbXbbXX.',
    'XkAkXXXkAkX', 'wwXXXXXXXww', '.wwwXXXwww.', '..wkkkkkw..', '...kwkwk...', '....kkk....',
  ]],
};

const cells = (c) => ({
  X: c, h: shade(c, 0.55), d: shade(c, -0.45), k: '#1a0a2a', e: '#7a3416', u: shade(c, -0.25), A: ['#ffb03a', true], w: '#fff8e8', m: '#ffb0c4',
  b: ['#ff1428', true], o: ['#ffffff', true], y: ['#ffe14a', true], p: ['#ff5a8a', true],
  a: '#ffb03a', n: '#e0c890', r: ['#ffd23a', true], c: ['#ffe14a', true], s: ['#c8f4ff', true],
});

const painter = (rows) => (b, l, f, c) => {
  pixels(b, l, rows[f], PX, cells(c));
  phosphor(b, l, 0.45, 4);
};

export const RATE = 1.5; // frames/s: the whole formation steps in time
export const HALO = 0.3; // alpha of an alien's halo
export const PAINTERS = Object.fromEntries(Object.entries(ROWS).map(([id, rows]) => [id, painter(rows)]));
