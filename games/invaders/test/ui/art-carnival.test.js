import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUNKER } from '../../src/core/bunkers.js';
import { installCanvas, recorder } from './dom-kit.js';
import { tracker } from './galleon-track.js';
import { rgb } from '../../src/ui/sprites.js';

// Ember Carnival's sprites, sky, bunkers and pickup rim (art.test.js and the other art-*.test.js have the other
// worlds'): every sprite fits its canvas, the baked sky hangs its bursts and its crescent, the booth skin is a
// stall of striped boards under a rail of bulbs, and warming bakes everything the live art draws.
installCanvas(64);
const made = [];
const stand = document.createElement;
// Every canvas now made is one that follows what is drawn into it, so a sprite's extent can be read off.
document.createElement = (...a) => {
  const T = tracker();
  const c = { ...stand(...a), getContext: () => T.ctx, T };
  made.push(c);
  return c;
};
const { LOOKS } = await import('../../src/ui/looks/index.js');
const sprites = await import('../../src/ui/flourish-carnival-sprites.js');
const rides = await import('../../src/ui/flourish-carnival-rides.js');
const { lantern, scrap, LANTERN } = await import('../../src/ui/ambient-6.js');
const { SKINS } = await import('../../src/ui/bunker-skins.js');
const { FRAMES } = await import('../../src/ui/pickup-skins.js');
const { BODIES } = await import('../../src/ui/sky-bodies.js');
const { HANGING, MOON } = await import('../../src/ui/sky-bodies-6.js');
const { buildLayers } = await import('../../src/ui/parallax.js');
const { drawFlourishes } = await import('../../src/ui/flourish.js');
const { drawAmbient } = await import('../../src/ui/ambient.js');
const { warmCarnival } = await import('../../src/ui/warm-carnival.js');

const look = LOOKS[13];
const { BLOOM, HUES, KINDS } = sprites;
const inside = (c, pad = 0) => c.T.bounds.x0 >= -pad && c.T.bounds.y0 >= -pad && c.T.bounds.x1 <= c.width + pad && c.T.bounds.y1 <= c.height + pad;
const dims = (c) => `${c.width}x${c.height}: ${['x0', 'y0', 'x1', 'y1'].map((k) => Math.round(c.T.bounds[k])).join(',')}`;

test('every burst sprite fits its canvas: no spark, trail or glow is cut off, the willow hangs lowest, and nothing reaches past the reach it claims', () => {
  for (const kind of KINDS) {
    for (const hue of HUES) {
      const c = sprites.bloom(kind, hue);
      assert.ok(inside(c), `${kind} ${hue}: ${dims(c)}`);
      assert.deepEqual([c.width, c.height], [BLOOM.w, BLOOM.h]);
      const b = c.T.bounds;
      assert.ok(BLOOM.cx - b.x0 <= BLOOM.r + 13 && b.x1 - BLOOM.cx <= BLOOM.r + 13 && BLOOM.cy - b.y0 <= BLOOM.r + 13, `${kind}: the sparks' reach, ${dims(c)}`);
      if (kind !== 'willow') assert.ok(b.y1 - BLOOM.cy <= BLOOM.r + 13, `${kind} does not droop`);
    }
  }
  const [rays, fall] = [sprites.bloom('chrys', HUES[0]).T.bounds, sprites.bloom('willow', HUES[0]).T.bounds];
  assert.ok(fall.y1 > rays.y1, `the willow hangs below the chrysanthemum: ${Math.round(fall.y1)} against ${Math.round(rays.y1)}`);
});

test('the bulb, the beam, the wheel, a gondola, a coaster car, the balloons, a lantern and a scrap of confetti each fit their canvas', () => {
  const all = [
    sprites.bulbSprite('#ffe9a0'), sprites.beamSprite('#7ff4ff'), rides.wheelSprite(), rides.cabin('#ff3fa0'), rides.car('#ffc86a'),
    rides.cluster(0), rides.cluster(3), scrap('#ff3fa0'),
  ];
  for (const c of all) assert.ok(inside(c, 1), dims(c));
  assert.ok(inside(lantern('#ffb04a'), 5), dims(lantern('#ffb04a'))); // the ribs' control points reach past the paper, which clips them
  assert.deepEqual([rides.wheelSprite().width, rides.wheelSprite().height], [rides.WHEEL_BOX, rides.WHEEL_BOX]);
  assert.deepEqual([lantern('#ffb04a').width, lantern('#ffb04a').height], [LANTERN.w, LANTERN.h]);
  const cab = rides.cabin('#ff3fa0').T.bounds;
  assert.ok(cab.x0 <= rides.CABIN.px && cab.x1 >= rides.CABIN.px && cab.y0 <= rides.CABIN.py, 'the gondola hangs from its pin');
  const wheel = rides.wheelSprite().T.bounds;
  assert.ok(Math.abs((wheel.x0 + wheel.x1) / 2 - rides.WHEEL_BOX / 2) < 3 && Math.abs((wheel.y0 + wheel.y1) / 2 - rides.WHEEL_BOX / 2) < 3, 'the hub is in the middle, so it turns about its own centre');
});

test("the baked sky draws six faded bursts high up, a crescent moon and the fair's glow, and leaves the context as it found it", () => {
  assert.equal(look.body, 'carnival');
  assert.equal(typeof BODIES.carnival, 'function');
  const { ctx, calls } = recorder();
  BODIES.carnival(ctx, look);
  const blooms = calls.filter(([k, img]) => k === 'drawImage' && made.some((c) => c === img && c.width === BLOOM.w));
  assert.equal(blooms.length, HANGING.length, 'a sprite for every hanging burst');
  assert.ok(blooms.every((c) => c.alpha < 0.5), 'faint: they are what is left of the evening');
  assert.ok(HANGING.every(([x, y, , , s]) => y - 170 * s >= -90 && y < 420 && x > 0 && x < 1920), 'high up and in the frame');
  assert.ok(calls.some(([k, rule]) => k === 'fill' && rule === 'evenodd'), 'the crescent is a disc less a disc');
  assert.ok(MOON.y < 200 && MOON.r < 45, 'a slim moon, high');
  assert.equal(ctx.globalAlpha, 1);
  assert.equal(ctx.globalCompositeOperation, 'source-over');
});

test("Ember Carnival's bunkers are fairground stalls: a rail of bulbs, gold trim, boards striped red and cream with dark joints and nails, a counter", () => {
  assert.equal(look.bunker.skin, 'booth');
  const P = {};
  for (const k of ['fill', 'light', 'dark', 'edge', 'accent']) P[k] = rgb(look.bunker[k]);
  const seen = new Map();
  const rows = [];
  let hearts = 0;
  for (let y = 0; y < BUNKER.h; y++) {
    let dark = 0;
    for (let x = 0; x < BUNKER.w; x++) {
      const [c, k] = SKINS.booth(x, y, BUNKER.w, BUNKER.h, P);
      assert.ok(Number.isFinite(k) && k >= -1 && k <= 1, `k at ${x},${y}`);
      const name = Object.entries(P).find(([, v]) => v === c)?.[0];
      assert.ok(name, `a colour of the look at ${x},${y}`);
      seen.set(name, (seen.get(name) ?? 0) + 1);
      if (name === 'dark') dark++;
      if (y < 9 && name === 'light') hearts++;
    }
    rows.push(dark);
  }
  assert.ok(seen.get('accent') > 400, `${seen.get('accent')} px of gold: bulbs, trim, counter edge`);
  assert.ok(seen.get('light') > 1500 && seen.get('fill') > 1500, 'cream and red boards both in quantity');
  assert.ok(seen.get('dark') > 700, `${seen.get('dark')} px of sockets, joints and shadow`);
  assert.ok(hearts >= 16 * 6, `${hearts} px of hot glass across the sixteen bulbs`);
  const joint = (x) => Array.from({ length: 30 }, (_, i) => SKINS.booth(x, 14 + i, BUNKER.w, BUNKER.h, P)[0] === P.dark).filter(Boolean).length;
  assert.ok([10, 20, 70, 150].every((x) => joint(x) >= 20), 'a dark joint between every pair of boards');
  const stripe = (x) => SKINS.booth(x, 36, BUNKER.w, BUNKER.h, P)[0];
  assert.notEqual(stripe(14), stripe(24), 'neighbouring boards differ');
  assert.equal(stripe(14), stripe(34), 'and alternate');
  assert.ok(rows[0] > BUNKER.w * 0.9 && rows[8] > BUNKER.w * 0.7 && rows.slice(0, 9).every((n) => n > BUNKER.w * 0.25), 'the rail is dark socket with a bulb every ten px');
});

test("Ember Carnival's pickup rim is a marquee ring: sixteen bulbs, a glass and a glint each, on a brass ring, round a dark middle", () => {
  const { ctx, calls } = recorder();
  FRAMES[14](ctx, '#ffd45a');
  assert.equal(calls.filter(([k]) => k === 'createRadialGradient').length, 16, 'a glass for each bulb');
  assert.ok(calls.filter(([k]) => k === 'arc').length >= 1 + 3 + 16 * 3, 'the middle, the ring in three passes, a socket, a glass and a glint for each bulb');
  assert.ok(calls.filter(([k]) => k === 'fill').length >= 1 + 48);
  assert.ok(Object.keys(FRAMES).length >= 14, 'one rim for every world');
});

test('warmCarnival bakes every large sprite the live art draws: a long run of flourishes and ambient then makes no new one', () => {
  const layers = buildLayers(look, 5);
  const before = made.length;
  warmCarnival(look);
  assert.ok(made.length - before >= 10, `${made.length - before} sprites baked ahead of the fight`);
  const warmed = made.length;
  for (let t = 0; t < 200; t += 1.3) {
    const { ctx } = recorder();
    const env = { v: { look, layers, cache: {} }, world: { level: {}, ship: { x: 960, y: 900 } }, fx: { flashes: [], time: t }, t, quality: 1 };
    for (const phase of ['sky', 'far', 'mid', 'near', 'front']) drawFlourishes(ctx, env, phase, -160, 400);
    for (const phase of ['sky', 'mid', 'front']) drawAmbient(ctx, look, phase, { t, drift: 0, wind: 0, world: {} });
  }
  const late = made.slice(warmed).filter((c) => c.width * c.height > 10000);
  assert.deepEqual(late.map((c) => `${c.width}x${c.height}`), [], 'nothing big is painted once the fight is on');
  const now = made.length;
  warmCarnival({ ...look, world: 13 });
  assert.equal(made.length, now, 'another world bakes nothing here');
});
