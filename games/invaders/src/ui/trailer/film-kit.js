// What the trailer (player.js) and the blooper (blooper.js) share: their sounds, the skip screen,
// the hand-back of the view and the sound at the end, and one frame of a clip.
//   filmSfx(gain) -> { sfx, quiet }     sfx plays in the 'film' group, hushed together on a skip;
//                                       quiet is sfx at `gain`, for the clip's own events
//   skipScreen(ready, finish) -> { el, onKey }   any key or a click skips, once ready()
//   endFilm(view, hud)                  stop the film's sounds and give the view its HUD back
//   playClip(view, film, clip, dt, anim, quiet, speed = 1) -> anim
//     step the clip by dt, move the drawing clock with its slow motion (times speed) and draw the
//     frame in the film look; returns the new drawing clock
import { play, hush, setBeam, duck } from '../audio.js';
import { eventSounds } from '../sounds.js';
import { drawFrame } from '../view.js';
import { h } from '../screens/dom.js';
import { stepClip } from './reel.js';
import { frameClip } from './draw.js';

export function filmSfx(gain) {
  const sfx = (name, o = {}) => play(name, { ...o, group: 'film' });
  return { sfx, quiet: (name, o) => sfx(name, { ...o, gain }) };
}

export function skipScreen(ready, finish) {
  const el = h('section', 'screen film', h('p', 'film-skip', 'Any key skips'));
  el.addEventListener('pointerdown', () => ready() && finish());
  // an arrow still held from play repeats: not a skip
  return { el, onKey: (code, e) => (!e?.repeat && ready() && finish(), true) };
}

export function endFilm(view, hud) {
  hush('film');
  setBeam(false);
  duck(1);
  if (view) Object.assign(view, { showHud: hud, lift: 0 });
}

export function playClip(view, film, clip, dt, anim, quiet, speed = 1) {
  stepClip(clip, dt, (events, world) => eventSounds(events, world, quiet));
  const at = anim + dt * speed * clip.fx.slow;
  clip.fx.density = view.quality.level;
  view.showHud = false;
  frameClip(view, film);
  drawFrame(view, clip.world, clip.fx, at, film);
  return at;
}
