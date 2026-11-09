// The parade, once the giant has fallen: the level's animals walk right to left along a line below
// the middle, in the pack's order, one every PARADE_STEP, and each is named as it crosses the middle
// (the voice, queued at the cue, says it and shows its word above the line). Then the results.
//   PARADE_LEAD  s before the first animal crosses the middle    PARADE_STEP  s between animals
//   PARADE_SPEED world px/s, right to left                       PARADE_TAIL  s after the last cue
//   paradeX(t, i) -> the x of animal i at t s, on a 1920-wide line
//   paradeCues(t0, t1, n) -> the indices of the animals that cross the middle in (t0, t1]
//   paradeScreen({ species, look, voice, onDone }) -> a stage screen; species: their pack lines. onDone fires PARADE_TAIL after
//   the last cue; a fresh key after SKIP_AFTER (dom.js) clears the voice and fires it at once.
import { h, shell, crossed, skippable } from './dom.js';
import { WIDTH, MID_X } from '../../core/kinds.js';
import { glow, lighter, normal, addGlow } from '../sprites.js';
import { PARADE_SCALE, speciesSprites } from '../aliens/bake.js';
import { HALO } from '../aliens/animals.js';
import { HALO_R, blit } from '../aliens/index.js';

export const PARADE_LEAD = 0.8;
export const PARADE_STEP = 1.4;
export const PARADE_SPEED = 480;
export const PARADE_TAIL = 1.6;

const LINE_H = 320; // px, the line's canvas height; its width is the world's
const STRIDE = 3; // frames a second: the walk's step
const HOP = 6; // px the animals lift on the step

const crossAt = (i) => PARADE_LEAD + i * PARADE_STEP;
export const paradeX = (t, i) => MID_X - PARADE_SPEED * (t - crossAt(i));

export function paradeCues(t0, t1, n) {
  const cues = [];
  for (let i = 0; i < n; i++) if (crossed(crossAt(i), t0, t1)) cues.push(i);
  return cues;
}

// Each animal as it is drawn in play (aliens/index.js), twice the size: its halo, body and lights.
function drawLine(ctx, look, ids, t) {
  ctx.clearRect(0, 0, WIDTH, LINE_H);
  const f = Math.floor(t * STRIDE) & 1;
  const y = LINE_H / 2 - f * HOP;
  ids.forEach((id, i) => {
    const x = paradeX(t, i);
    const set = speciesSprites(look, id, PARADE_SCALE);
    addGlow(ctx, glow(look.palette.alien[id]), x, y, HALO_R * PARADE_SCALE, HALO);
    blit(ctx, set.body[f], set, x, y);
    lighter(ctx);
    blit(ctx, set.lights[f], set, x, y);
    normal(ctx);
  });
}

export function paradeScreen({ species, look, voice, onDone }) {
  const el = shell('parade');
  el.style.setProperty('--accent', look.palette.accent); // the floor's glow (screens.css)
  const canvas = h('canvas', 'parade-line');
  canvas.width = WIDTH;
  canvas.height = LINE_H;
  el.append(canvas);
  const ctx = canvas.getContext('2d');
  const ids = species.map((s) => s.id);
  const end = crossAt(ids.length - 1) + PARADE_TAIL;
  let t = 0;
  let done = false;
  const finish = () => {
    done = true;
    onDone();
  };
  return {
    el,
    onKey(code, e) {
      if (!done && skippable(t, e)) {
        voice.clear();
        finish();
      }
      return true; // the parade keeps every key from the game
    },
    update(dt) {
      if (done) return;
      const t0 = t;
      t += dt;
      for (const i of paradeCues(t0, t, ids.length)) voice.queue(species[i]);
      drawLine(ctx, look, ids, t);
      if (t >= end) finish();
    },
  };
}
