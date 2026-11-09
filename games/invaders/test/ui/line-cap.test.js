import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installCanvas, sink } from './dom-kit.js';

// The round-capped strokes of the sky (W7 tracers, W8 lensed stars and photon ring, W12 constellations) and every stroke
// of Sunset Armada's sky, water, propellers and balloons (W13) must leave the
// context's lineCap as they found it, or later strokes (the HUD's power ring) inherit round caps. Ember Carnival's
// (W14) fireworks, rides, strings and ambient, and Lantern Deep's (W15) water, creatures, maelstrom and powers must leave every piece of the context's state as they found it.
installCanvas();
const { FLOURISH2 } = await import('../../src/ui/flourish-2.js');
const { AMBIENT2 } = await import('../../src/ui/ambient-2.js');
const { FLOURISH6 } = await import('../../src/ui/flourish-6.js');
const { FLOURISH8 } = await import('../../src/ui/flourish-8.js');
const { FLOURISH9 } = await import('../../src/ui/flourish-9.js');
const { AMBIENT5 } = await import('../../src/ui/ambient-5.js');
const { FLOURISH10 } = await import('../../src/ui/flourish-10.js');
const { FLOURISH11 } = await import('../../src/ui/flourish-11.js');
const { AMBIENT6 } = await import('../../src/ui/ambient-6.js');
const { paintBloom, drawBloom } = await import('../../src/ui/burst-view.js');
const { paintFuse, drawShells } = await import('../../src/ui/shell-view.js');
const { FLOURISH12 } = await import('../../src/ui/flourish-12.js');
const { FLOURISH13 } = await import('../../src/ui/flourish-13.js');
const { FLOURISH_SWAY } = await import('../../src/ui/flourish-deep-sway.js');
const { FLOURISH_MAELSTROM } = await import('../../src/ui/flourish-maelstrom.js');
const { AMBIENT7 } = await import('../../src/ui/ambient-7.js');
const { drawPearls } = await import('../../src/ui/ship-deep.js');
const { drawTridents } = await import('../../src/ui/shots-deep.js');
const { drawBubble } = await import('../../src/ui/bubble-view.js');
const { LOOKS } = await import('../../src/ui/looks/index.js');
const { buildLayers } = await import('../../src/ui/parallax.js');

const context = () => new Proxy({ lineCap: 'butt' }, {
  get: (o, k) => (k in o ? o[k] : () => sink),
  set: (o, k, v) => ((o[k] = v), true),
});
const level = { world: 8, index: 1, waves: [] };
const layers = buildLayers(LOOKS[12], 5);
const env = (t) => ({ v: { look: LOOKS[12], layers, cache: {} }, world: { ship: { x: 960 } }, t });
const armada = { // Sunset Armada: the shafts, the gulls, the far ship, the cannon fire, the falls, the propellers, the balloons, the wisps and the ambient gulls
  godrays: (ctx) => FLOURISH8.godrays.sky(ctx, env(3)),
  birds: (ctx) => FLOURISH8.birds.sky(ctx, env(3.5)),
  farship: (ctx) => FLOURISH8.farship.sky(ctx, env(40)),
  cannonfire: (ctx) => FLOURISH8.cannonfire.far(ctx, env(7.2), -160, 380),
  falls: (ctx) => FLOURISH9.falls.far(ctx, env(3), -160, 380),
  props: (ctx) => FLOURISH9.props.mid(ctx, env(3), -160, 620),
  tether: (ctx) => FLOURISH9.tether.near(ctx, env(3)),
  wisps: (ctx) => AMBIENT5.wisps(ctx, { n: 9, speed: 14, size: [160, 320], alpha: 0.2, colors: ['#ffe0b8'] }, 3, 0),
  gulls: (ctx) => AMBIENT5.gulls(ctx, { n: 5, speed: 38, size: [22, 34], alpha: 0.9, colors: ['#fff6e8'] }, 3),
};

const deepLayers = buildLayers(LOOKS[14], 5);
const denv = (t) => ({ v: { look: LOOKS[14], layers: deepLayers, cache: {} }, world: { ship: { x: 960 }, well: { x: 960, y: 300 }, level }, t, quality: 1 });
const deepShip = { alive: true, x: 900, y: 800, power: { kind: 'pearls', left: 5 } };
const deep = { // Lantern Deep: the shafts, the whale, the school, the jellyfish, the caustics, the kelp and the reef, the maelstrom, the ambient, the pearls, the trident and the bubble
  shafts: (ctx) => FLOURISH12.shafts.sky(ctx, denv(3)),
  leviathan: (ctx) => FLOURISH12.leviathan.sky(ctx, denv(30)),
  school: (ctx) => FLOURISH13.school.mid(ctx, denv(9), -160, 620),
  jellydrift: (ctx) => FLOURISH13.jellydrift.mid(ctx, denv(5), -160, 620),
  caustics: (ctx) => FLOURISH13.caustics.near(ctx, denv(4)),
  kelpsway: (ctx) => FLOURISH_SWAY.kelpsway.mid(ctx, denv(4), -160, 620),
  reefsway: (ctx) => FLOURISH_SWAY.reefsway.near(ctx, denv(4)),
  maelstrom: (ctx) => FLOURISH_MAELSTROM.maelstrom.near(ctx, denv(4)),
  marinesnow: (ctx) => AMBIENT7.marinesnow(ctx, { n: 56, speed: 14, size: [1.6, 3.4], alpha: 0.45, colors: ['#bfeaff', '#8fd8f0'] }, 3, 0),
  minnows: (ctx) => AMBIENT7.minnows(ctx, { n: 10, speed: 30, size: [8, 14], alpha: 0.4, colors: ['#8fd8f0'], maxY: 0.6 }, 3, 0),
  deepbubbles: (ctx) => AMBIENT7.deepbubbles(ctx, { n: 26, speed: 46, size: [4, 12], alpha: 0.32, colors: ['#bff4ff'] }, 3, 0),
  pearls: (ctx) => drawPearls(ctx, deepShip, LOOKS[14], 3, 0.8),
  fading: (ctx) => drawPearls(ctx, { ...deepShip, power: { kind: 'pearls', left: 0.1 } }, LOOKS[14], 3, 1),
  tridents: (ctx) => drawTridents(ctx, [{ x: 700, y: 500, vx: 0, vy: -1100, trident: true, pierced: [1, 2] }], 3),
  bubble: (ctx) => drawBubble(ctx, { x: 1100, y: 420, wx: 960, wy: 300, a0: 0.4, d0: 150, turns: 1.6, size: 11, color: '#5af0ff', seed: 7, life: 0.2, max: 0.6, r: 40 }),
  popped: (ctx) => drawBubble(ctx, { x: 1100, y: 420, wx: 960, wy: 300, a0: 0.4, d0: 150, turns: 1.6, size: 11, color: '#5af0ff', seed: 7, life: 0.05, max: 0.6, r: 10 }),
};

const carnivalLayers = buildLayers(LOOKS[13], 5);
const cenv = (t) => ({ v: { look: LOOKS[13], layers: carnivalLayers, cache: {} }, world: { ship: { x: 960 } }, t, quality: 1 });
const carnival = { // Ember Carnival: the shows, the searchlights, the lake, the coaster, the wheel, the strings, the balloons, the confetti and the lanterns
  fireworks: (ctx) => FLOURISH10.fireworks.sky(ctx, cenv(8.4)),
  rockets: (ctx) => FLOURISH10.rockets.sky(ctx, cenv(6.2)),
  sweep: (ctx) => FLOURISH10.sweep.sky(ctx, cenv(3)),
  reflect: (ctx) => FLOURISH10.fireworks.far(ctx, cenv(8.4), -160, 380),
  coaster: (ctx) => FLOURISH11.coaster.far(ctx, cenv(2.5), -160, 380),
  wheel: (ctx) => FLOURISH11.wheel.mid(ctx, cenv(4), -160, 620),
  strings: (ctx) => FLOURISH11.strings.near(ctx, cenv(3)),
  balloons: (ctx) => FLOURISH11.balloons.near(ctx, cenv(3)),
  confetti: (ctx) => AMBIENT6.confetti(ctx, { n: 22, speed: 40, size: [6, 11], alpha: 0.85, colors: ['#ff3fa0', '#ffc233'] }, 3, 0),
  lanterns: (ctx) => AMBIENT6.lanterns(ctx, { n: 7, speed: 16, size: [18, 28], alpha: 0.9, colors: ['#ffb04a', '#ff8a5a'] }, 3),
  // and the fireworks twist: the flower's painter and its drawing, the fuse's painter and the shells' lit fuses
  bloomPaint: (ctx) => paintBloom(ctx, '#ff3fa0', '#ff9ad0', 1),
  bloom: (ctx) => drawBloom(ctx, { x: 800, y: 400, r: 120, color: '#ff3fa0', life: 0.3, max: 0.85 }),
  fusePaint: (ctx) => paintFuse(ctx),
  shells: (ctx) => drawShells(ctx, [{ id: 1, role: 'gunner', shell: true, x: 600, y: 300 }], LOOKS[13], 2, (a) => ({ x: a.x, y: a.y, rot: 0.3, f: 1 })),
};

test('the sky\'s round-capped strokes leave lineCap at butt', () => {
  const world = { well: { x: 960, y: 300 }, level };
  const runs = {
    tracers: (ctx) => FLOURISH2.tracers.sky(ctx, { t: 0.2, world }),
    lens: (ctx) => FLOURISH2.lens.near(ctx, { t: 1, world }),
    lensed: (ctx) => AMBIENT2.lensed(ctx, { n: 20, speed: 1, size: [1, 3], alpha: 0.5, colors: ['#ffffff'] }, 1, 0, 0, world),
    constellation: (ctx) => FLOURISH6.constellation.sky(ctx, { t: 7 }),
    ...armada,
    ...carnival,
    ...deep,
  };
  for (const [name, run] of Object.entries(runs)) {
    const ctx = context();
    run(ctx);
    assert.equal(ctx.lineCap, 'butt', name);
  }
});

// A context that keeps the state a painter may change, with a real save and restore, and hands everything else to the sink.
const stateful = () => {
  const state = { lineCap: 'butt', lineJoin: 'miter', lineWidth: 1, strokeStyle: '#000000', fillStyle: '#000000', globalAlpha: 1, globalCompositeOperation: 'source-over' };
  const stack = [];
  return new Proxy(state, {
    get: (o, k) => (k === 'save' ? () => stack.push({ ...o }) : k === 'restore' ? () => Object.assign(o, stack.pop()) : k in o ? o[k] : () => sink),
    set: (o, k, v) => ((o[k] = v), true),
  });
};

test("Ember Carnival's flourishes and ambient leave the line caps and joins, widths, colours, alpha and blend mode as they found them", () => {
  for (const [name, run] of Object.entries(carnival)) {
    const ctx = stateful();
    const before = { ...ctx };
    run(ctx);
    assert.deepEqual({ ...ctx }, before, name);
  }
});

test("Lantern Deep's flourishes, ambient, pearls, trident and bubble leave the line caps and joins, widths, colours, alpha and blend mode as they found them", () => {
  for (const [name, run] of Object.entries(deep)) {
    const ctx = stateful();
    const before = { ...ctx };
    run(ctx);
    assert.deepEqual({ ...ctx }, before, name);
  }
});

// The Lantern Leviathan (W15's boss; bosses/angler*.js): its live pass is drawn by the game in 'lighter' and must leave
// every piece of the context as it found it, in every phase and in both passes; and each of its painters, run on a pair
// of contexts, leaves the blend mode and alpha of both at their defaults (a painter's save and restore are paired).
test("the Lantern Leviathan's live pass and painters leave the context's state as they found it", async () => {
  const { BOSS_ART, painterFor } = await import('../../src/ui/bosses/bake.js');
  const { BOSS_DEFS } = await import('../../src/core/bosses-data.js');
  const art = BOSS_ART.angler;
  const def = BOSS_DEFS.find((d) => d.kind === 'angler');
  const boss = (phase) => ({ x: 0, y: 0, phase, parts: def.parts.map((p) => ({ ...p, x: p.dx, y: p.dy })) });
  for (const phase of [0, 1, 2]) {
    for (const own of [false, true]) {
      const ctx = stateful();
      ctx.globalCompositeOperation = 'lighter';
      const before = { ...ctx };
      art.live(ctx, boss(phase), 14, 1, own, 9);
      assert.deepEqual({ ...ctx }, before, `live, phase ${phase}, own ${own}`);
    }
  }
  const S = { def, pal: { hull: '#07182a', plate: '#2a4a6a', weak: '#9af4ff' }, W: 820, H: 460, pad: 60 };
  const painters = [['hull', (b, l) => art.hull(b, l, S)], ...art.rage.filter(Boolean).map((r, i) => [`rage ${i}`, (b, l) => r(l, S)]), ...def.parts.map((p) => [p.id, (b, l) => painterFor(art, p.id)[0](b, l, p, S)])];
  for (const [name, paint] of painters) {
    const [b, l] = [stateful(), stateful()];
    paint(b, l);
    for (const ctx of [b, l]) assert.deepEqual([ctx.globalAlpha, ctx.globalCompositeOperation], [1, 'source-over'], `${name} leaves alpha and the blend mode alone`);
  }
});
