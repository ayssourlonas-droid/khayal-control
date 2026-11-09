// The blooper: a failed level's last 1.2 s before the fatal hit, re-simulated from the start
// (reel.js) and replayed at 0.3x (about 4 s) in an outtake's look (a warm grade, grain, a running
// timecode); the moment the ship is hit a clapperboard slides in over the wreck and snaps shut:
// CUT! (about 1 s). About 5 s in all (R32), then the failed card (Retry). Any key skips, and a
// skip fades every sound of the blooper at once (R34). Drawn on the game canvas from the screen's
// update(dt), like the trailer, and hands main its view's quality while the outtake rolls (R46).
//   blooperScreen({ canvas, view, level, seed, inputs, take, onDone }) -> screen
import { W, H, hash } from '../sprites.js';
import { reelName, worldName } from '../../core/levels.js';
import { createFilm, stepFilm } from '../../fx/film.js';
import { setBeam, duck } from '../audio.js';
import { armed } from '../screens/dom.js';
import { fastForward, startClip } from './reel.js';
import { blooperSpan } from './cut.js';
import { begin, FONTS } from './draw.js';
import { drawClapper } from './clapper.js';
import { filmSfx, skipScreen, endFilm, playClip } from './film-kit.js';
import { pad2 } from '../format.js';

const SPEED = 0.3;
const CLAP = { slide: 0.25, shut: 0.42, close: 0.08, hold: 1.0 }; // s from the hit: the wreck burns on behind it
const REWIND = 0.4; // s of rewind lines at the start
const OUTTAKE = '#d9a35f'; // the outtake's warm grade
const { sfx, quiet } = filmSfx(0.7);

const timecode = (t) => { // hours:minutes:seconds:frames at 24 frames a second
  const f = Math.floor(t * 24);
  return `${pad2(Math.floor(f / 86400))}:${pad2(Math.floor(f / 1440) % 60)}:${pad2(Math.floor(f / 24) % 60)}:${pad2(f % 24)}`;
};

// VHS-like rewind lines across the frame.
function rewind(ctx, frame, a) {
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 7; i++) {
    ctx.globalAlpha = a * (0.15 + 0.25 * hash(frame * 31 + i));
    ctx.fillRect(0, hash(frame * 7 + i) * H, W, 3 + hash(frame * 13 + i) * 26);
  }
  ctx.globalAlpha = a;
  ctx.font = `900 72px ${FONTS.cond}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('◀◀', 80, 200);
  ctx.globalAlpha = 1;
}

export function blooperScreen({ canvas, view, level, seed, inputs, take = 1, onDone }) {
  const ctx = canvas.getContext('2d');
  const film = createFilm({ level });
  film.tint = OUTTAKE;
  const ready = armed(600);
  const hud = view.showHud;
  const info = { scene: worldName(level).toUpperCase(), take, roll: reelName(level).toUpperCase() };
  let span = null;
  let gen = fastForward(level, seed, inputs, (events, ticks) => {
    span = blooperSpan(events, ticks);
    return span ? [span.start] : [];
  });
  let phase = 'prep';
  let clip = null;
  let clock = 0;
  let anim = performance.now() / 1000; // the drawing clock: ambient rain and sprites slow down too
  let clapT = 0;
  let clapped = false;

  function finish() {
    if (phase === 'done') return;
    phase = 'done';
    endFilm(view, hud);
    onDone();
  }

  function roll(snap) {
    if (!snap) return finish();
    clip = startClip(snap, inputs, { start: span.start, end: span.hit, peak: span.hit }, { seed, speed: SPEED, peakSlow: 0 });
    phase = 'roll';
    sfx('rewind');
    duck(0.4);
  }

  function overlay(frame) {
    ctx.globalAlpha = 0.85 * film.k;
    ctx.fillStyle = '#ffeed6';
    ctx.font = `700 30px ${FONTS.mono}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`OUTTAKE · TAKE ${take}`, 80, 31);
    ctx.textAlign = 'right';
    ctx.fillText(timecode(clip.world.t), W - 80, 31);
    ctx.globalAlpha = 1;
    if (clock < REWIND) rewind(ctx, frame, 1 - clock / REWIND);
  }

  return {
    ...skipScreen(ready, finish),
    quality: () => (phase === 'roll' || phase === 'clap' ? view.quality : null),
    status: () => ({ kind: 'blooper', phase, tick: clip?.world.tick ?? null, hit: span?.hit ?? null, clap: clapped }),
    update(dt) {
      if (phase === 'done') return;
      const frame = Math.floor((clock + dt) * 24);
      if (phase === 'prep') {
        const step = gen.next();
        begin(ctx, canvas);
        rewind(ctx, frame, 1);
        if (step.done) {
          gen = null;
          roll(step.value.snaps.get(span?.start));
        }
        return;
      }
      clock += dt;
      stepFilm(film, dt, true);
      anim = playClip(view, film, clip, dt, anim, quiet, SPEED);
      const w = clip.world;
      setBeam(phase === 'roll' && Boolean(w.ship.beam) && w.state === 'play', w.ship.x);
      overlay(frame);
      if (phase === 'roll' && clip.after > 0) phase = 'clap'; // the hit: no hold, the clapper is the hold
      if (phase !== 'clap') return;
      clapT += dt;
      if (!clapped && clapT >= CLAP.shut) {
        clapped = true;
        setBeam(false);
        sfx('clap');
      }
      ctx.globalAlpha = 0.45 * Math.min(1, clapT / CLAP.slide);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      drawClapper(ctx, {
        k: clapT / CLAP.slide,
        shut: (clapT - CLAP.shut + CLAP.close) / CLAP.close,
        cut: (clapT - CLAP.shut) / 0.2,
      }, info);
      if (clapT >= CLAP.hold) finish();
    },
  };
}
