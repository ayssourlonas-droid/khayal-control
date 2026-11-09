// The maelstrom of Lantern Deep (world 15): world 8's well, which pulls every bullet in and swallows it, is a slow
// whirlpool of bubbles and light here. Over the well (world.well) lie a pale halo; three spiral arms turning at
// their own speeds, the middle one the other way; the dark throat with its thin bright lip; the funnel and two comet
// arcs that turn inside and round it; and a stream of small bubbles that circle in along the whirl, quickening and
// shrinking as they near the lip, brightening, and vanish into it. It is meant to read at a glance as the thing in
// the sky that eats bullets: brighter and more purposeful than the backdrop's drifting bubbles, but nothing amber
// and nothing as loud as a bullet. On a boss level it dims (wellLight), as world 8's black hole does. The pieces
// are baked in flourish-maelstrom-sprites.js; everything here is a pure function of t, so nothing jumps.
import { glow, soft, hash, lighter, normal } from './sprites.js';
import { WELL } from '../core/kinds.js';
import { TAU } from '../core/math.js';
import { wellLight } from './sky-bodies-2.js';
import { LIP, BUBBLE_COLORS } from '../fx/react-maelstrom.js';
import { ARMS, R_IN, THROAT, arm, throat, funnel, lipArc } from './flourish-maelstrom-sprites.js';
import { bubble } from './flourish-maelstrom-bubble.js';

const R_OUT = 232; // px from the centre at which a bubble enters the whirl (the outer arm's reach)
const BUBBLES = 26; // bubbles on their way in (half as many when the frame rate struggles)
const PERIOD = [6, 10]; // s a bubble takes from the rim of the whirl to the lip
const QUICKEN = 1.8; // r = LIP + (R_OUT - LIP) * (1 - u ** QUICKEN): they gain speed as they fall
const FLOW_WIND = 0.32; // how tightly their path winds: they turn ln(R_IN / r) / FLOW_WIND radians on the way in, clockwise
const STREAMS = 5; // lanes of the flow
const BUB_SIZE = [20, 7]; // px a bubble is drawn across at the rim and at the lip (its ring is two thirds of that)
const BUB_ALPHA = 0.85;
const HALO = [[170, 0.2], [270, 0.08]]; // radius and brightness of the pale and the teal halo
const BREATH = 0.15; // how much the halo swells and ebbs, about every six seconds
const FUNNEL_SPIN = 0.9; // radians a second the funnel and the lip's arcs turn (clockwise)
const LIP_SPIN = 1;
const THROAT_ALPHA = 0.5; // the throat's share of its opacity that stays on a boss level (the rest follows wellLight)

const colorOf = (h) => BUBBLE_COLORS[h < 0.15 ? 3 : h < 0.55 ? 2 : h < 0.8 ? 0 : 1]; // mostly teal and aqua, a little violet

// Each bubble's constants, from hash(i): its lap time, where in the lap it starts, the lane it follows, its size and colour.
export const FLOW = Array.from({ length: BUBBLES }, (_, i) => ({
  period: PERIOD[0] + (PERIOD[1] - PERIOD[0]) * hash(i + 500),
  phase: (i + 0.6 * hash(i + 501)) / BUBBLES,
  base: (i % STREAMS) * (TAU / STREAMS) + (hash(i + 502) - 0.5) * 0.5,
  scale: 0.75 + 0.5 * hash(i + 503),
  color: colorOf(hash(i + 504)),
}));

const where = { u: 0, r: 0, x: 0, y: 0, d: 0, alpha: 0 };

// Bubble b at time t round the centre c: u runs 0 to 1 over its lap; r falls from the rim to the lip, faster as it goes;
// its angle follows the flow's spiral; it fades in at the rim, brightens as it nears the lip and fades out into it.
// Fills and returns one shared object (the next call overwrites it).
export function flowAt(b, t, c) {
  const lap = t / b.period + b.phase;
  const u = lap - Math.floor(lap);
  const r = LIP + (R_OUT - LIP) * (1 - u ** QUICKEN);
  const a = b.base - Math.log(r / R_IN) / FLOW_WIND;
  where.u = u;
  where.r = r;
  where.x = c.x + Math.cos(a) * r;
  where.y = c.y + Math.sin(a) * r;
  where.d = (BUB_SIZE[0] + (BUB_SIZE[1] - BUB_SIZE[0]) * u) * b.scale;
  where.alpha = BUB_ALPHA * Math.min(1, u / 0.1) * (0.4 + 0.6 * u) * Math.min(1, (1 - u) / 0.06);
  return where;
}

// Draw sprite s turned by angle about (x, y), centred, at alpha a.
function turned(ctx, s, x, y, angle, a) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = a;
  ctx.drawImage(s, -s.width / 2, -s.height / 2);
  ctx.restore();
}

function near(ctx, { world, t, quality }) {
  const c = world.well ?? WELL;
  const k = wellLight(world.level);
  lighter(ctx);
  const breath = 1 - BREATH + BREATH * Math.sin(t * 1.05);
  ctx.globalAlpha = HALO[0][1] * k * breath;
  ctx.drawImage(glow('#9af4ff'), c.x - HALO[0][0], c.y - HALO[0][0], HALO[0][0] * 2, HALO[0][0] * 2);
  ctx.globalAlpha = HALO[1][1] * k * breath;
  ctx.drawImage(soft('#3de8d0'), c.x - HALO[1][0], c.y - HALO[1][0], HALO[1][0] * 2, HALO[1][0] * 2);
  ARMS.forEach((a, i) => turned(ctx, arm(i), c.x, c.y, t * a.spin, a.alpha * k));
  ctx.globalCompositeOperation = 'source-over'; // the throat is dark, not light
  ctx.globalAlpha = THROAT_ALPHA + (1 - THROAT_ALPHA) * k;
  ctx.drawImage(throat(), c.x - THROAT / 2, c.y - THROAT / 2);
  lighter(ctx);
  turned(ctx, funnel(), c.x, c.y, t * FUNNEL_SPIN, 0.8 * k);
  turned(ctx, lipArc(), c.x, c.y, t * LIP_SPIN, (0.65 + 0.2 * Math.sin(t * 2.3)) * k);
  for (let i = 0; i < FLOW.length; i += quality < 1 ? 2 : 1) {
    const b = FLOW[i];
    const w = flowAt(b, t, c);
    ctx.globalAlpha = w.alpha * k;
    ctx.drawImage(bubble(b.color), w.x - w.d / 2, w.y - w.d / 2, w.d, w.d);
  }
  normal(ctx);
}

export const FLOURISH_MAELSTROM = { maelstrom: { near } };

// Paint every sprite the maelstrom draws, so none is baked mid-fight.
export function warmMaelstrom() {
  ARMS.forEach((_, i) => arm(i));
  throat();
  funnel();
  lipArc();
  for (const color of BUBBLE_COLORS) {
    bubble(color);
    glow(color);
  }
  glow('#ffffff');
  glow('#9af4ff');
  soft('#3de8d0');
}
