// The trailer of a run. A film leader counts down while the run is re-simulated (reel.js, one slice
// a frame, so nothing stalls); then the cut (cut.js): clips of the run in the world's film look
// with slow motion on each peak, title cards in the world's voice between them (cards.js,
// draw.js), and the final card. Sound: the clips' own effects over the world's music bed, a braam
// under every card, a riser into the title and its impact. Any key (or a click) skips, and the
// skip (or the end) fades every sound the trailer started within 0.1 s (R34).
// A stage screen that draws on the game canvas from its update(dt): the screen it runs under
// ('trailer') is one the game loop neither steps nor draws. quality() hands main the view's auto
// quality while the cut plays (R46: main feeds it the frame's work; not during the leader's bakes).
//   trailerScreen({ canvas, view?, level, seed, inputs, result: { stars, score, newBest }, onDone }) -> screen
//   view: the level's baked view after play; Cinema passes none and it is baked in the leader.
import { W, H } from '../sprites.js';
import { TICK } from '../../core/kinds.js';
import { finished } from '../../core/util.js';
import { createFilm, stepFilm } from '../../fx/film.js';
import { lookFor } from '../looks/index.js';
import { warmAliens } from '../aliens/bake.js';
import { warmBoss } from '../bosses/bake.js';
import { createView } from '../view.js';
import { drawFilm } from '../film-view.js';
import { setBeam, duck } from '../audio.js';
import { armed } from '../screens/dom.js';
import { fastForward, startClip, clipDone, HOLD } from './reel.js';
import { cutClips, timeline } from './cut.js';
import { statsOf, cardsFor, finalCard } from './cards.js';
import { TYPE, begin, bakeCard, drawCard } from './draw.js';
import { drawLeader, drawFinal } from './draw-final.js';
import { filmSfx, skipScreen, endFilm, playClip } from './film-kit.js';

const LEADER_MIN = 1.2; // s: the leader counts 8 to 3 at least this slowly
const FLASH = 0.12; // s of white cutting into a clip
const RISER = 1.3; // s the riser builds before the final card
const { sfx, quiet } = filmSfx(0.8);

export function trailerScreen({ canvas, view: given = null, level, seed, inputs, result, onDone }) {
  const ctx = canvas.getContext('2d');
  const style = TYPE[(level.world - 1) % TYPE.length];
  const film = createFilm({ level });
  const ready = armed(600);
  let view = given;
  const hud = view?.showHud ?? false;
  let phase = 'leader';
  let clock = 0;
  let anim = performance.now() / 1000; // the drawing clock, slowed with the slow motion
  let progress = 0;
  let n = 0;
  let segs = null;
  let seg = -1;
  let segT = 0;
  let clip = null;
  let pass = null;
  let fin = null;
  let finArt = null;
  let riser = false;
  let cards = 0;
  const arts = new Map();

  function* prepare() {
    if (!view) {
      const look = lookFor(level);
      warmAliens(look);
      yield 0;
      warmBoss(look, level.boss);
      yield 0;
      view = createView(canvas, level);
      yield 0;
    }
    let clips = [];
    pass = yield* fastForward(level, seed, inputs, (events, ticks) => (clips = cutClips(events, ticks)).map((c) => c.start));
    const stats = statsOf(pass.events, pass.ticks);
    segs = timeline(clips.filter((c) => pass.snaps.has(c.start)), cardsFor(level.world, stats));
    fin = finalCard({ level, stats, ...result });
    for (const s of segs) {
      if (s.type !== 'card') continue;
      arts.set(s, bakeCard(s.lines, style));
      yield 1;
    }
    finArt = bakeCard([fin.title], style, 1.7);
  }
  let gen = prepare();

  function finish() {
    if (phase === 'done') return;
    phase = 'done';
    endFilm(view, hud);
    onDone();
  }

  function next() {
    seg += 1;
    segT = 0;
    setBeam(false);
    const s = segs[seg];
    if (!s) return finish();
    if (s.type === 'clip') {
      clip = startClip(pass.snaps.get(s.start), inputs, s, { seed });
      if (seg > 0) sfx('whoosh');
      duck(1);
      return;
    }
    clip = null;
    sfx(s.type === 'final' ? 'impact' : 'braam', { n: cards++ });
    duck(s.type === 'final' ? 0.8 : 0.55);
  }

  function leader(frame) {
    if (gen) {
      const step = gen.next();
      if (step.done) gen = null;
      else progress = step.value;
    }
    const shown = Math.min(gen ? progress : 1, clock / LEADER_MIN);
    const num = 8 - Math.min(5, Math.floor(shown * 6));
    if (num !== n) sfx('tick');
    n = num;
    begin(ctx, canvas);
    drawLeader(ctx, n, (shown * 6) % 1, frame);
    drawFilm(ctx, film, view?.quality.level);
    if (!gen && clock >= LEADER_MIN) {
      sfx('pop');
      phase = 'play';
      next();
    }
  }

  // The real seconds left in the last clip, roughly: the riser should peak on the cut.
  function left(s) {
    const w = clip.world;
    if (finished(w)) return HOLD - clip.after;
    return ((s.end - w.tick) * TICK) / clip.fx.slow + (s.end >= inputs.length ? HOLD : 0);
  }

  function drawClip(s, dt) {
    anim = playClip(view, film, clip, dt, anim, quiet);
    const w = clip.world;
    if (!riser && s === segs.findLast((x) => x.type === 'clip') && left(s) <= RISER) {
      riser = true;
      sfx('riser');
    }
    setBeam(Boolean(w.ship.beam) && w.state === 'play', w.ship.x);
    if (segT < FLASH) {
      ctx.globalAlpha = 0.45 * (1 - segT / FLASH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    if (clipDone(clip)) next();
  }

  return {
    ...skipScreen(ready, finish),
    quality: () => (phase === 'play' ? view.quality : null),
    status: () => ({
      kind: 'trailer', phase, seg, type: segs?.[seg]?.type ?? null, cut: segs?.map((s) => s.type) ?? null,
      tick: clip?.world.tick ?? null, line: segs?.[seg]?.lines?.join(' ') ?? null,
    }),
    update(dt) {
      if (phase === 'done') return;
      clock += dt;
      stepFilm(film, dt, true);
      const frame = Math.floor(clock * 24);
      if (phase === 'leader') return leader(frame);
      segT += dt;
      const s = segs[seg];
      if (s.type === 'clip') return drawClip(s, dt);
      begin(ctx, canvas);
      if (s.type === 'card') drawCard(ctx, arts.get(s), style, segT, s.secs);
      else drawFinal(ctx, fin, finArt, style, segT, s.secs);
      drawFilm(ctx, film, view.quality.level);
      if (segT >= s.secs) next();
    },
  };
}
