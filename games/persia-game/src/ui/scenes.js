// What the game loop runs and draws: a scene is a session (session.js) with its view, the source of
// its inputs and what its events do besides effects.
//   { mode, level, view, session, source(world), onEvents?(events, input), sound, voice? }
//   mode 'backdrop' (the title's autopilot battle, silent, no HUD, no voice) | 'play'
//   runScene(sc, dt, t, step)   one frame: step it (unless frozen), then draw it. The voice is
//   stepped with the scene, so a paused screen holds its lines.
import { autopilot } from '../core/autopilot.js';
import { createSession, stepSession } from './session.js';
import { createView, drawFrame } from './view.js';
import { readInput } from './input.js';
import { eventSounds } from './sounds.js';
import { play, setBeam } from './audio.js';

const seed = () => crypto.getRandomValues(new Uint32Array(1))[0];
const BACKDROP_AGAIN = 2.5; // s after the backdrop battle ends before it starts over

export function backdropScene(canvas, level) {
  const view = createView(canvas, level);
  view.showHud = false;
  return { mode: 'backdrop', level, view, session: createSession(level, seed()), source: autopilot, sound: false };
}

// A level played with the keys and the mouse, or flown by `pilot` (?debug&auto).
export function playScene(canvas, level, input, { pilot = null, onEvent = null, voice }) {
  const v = createView(canvas, level);
  const session = createSession(level);
  return {
    mode: 'play', level, view: v, session, sound: true, voice,
    source: pilot ?? (() => readInput(input, v)),
    onEvents(events) {
      eventSounds(events, session.world, play);
      voice.hear(events);
      if (onEvent) for (const e of events) onEvent(e);
    },
  };
}

export function runScene(sc, dt, t, step) {
  const { session, view } = sc;
  if (step) {
    stepSession(session, dt, sc.source, sc.onEvents);
    sc.voice?.update(dt);
  }
  if (sc.mode === 'backdrop' && session.over > BACKDROP_AGAIN) {
    sc.session = createSession(sc.level, seed()); // the same level: no bake
  }
  view.named = sc.voice?.saying();
  drawFrame(view, sc.session.world, sc.session.fx, t);
  const ship = sc.session.world.ship;
  if (sc.sound) setBeam(step && ship.beam && sc.session.world.state === 'play', ship.x);
}
