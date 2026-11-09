// Where the trailer, the blooper and Cinema join the game (installed once by main). The end of a
// level (flow.js) goes through here: a clear (whose run flow.js saved at the clear when it beats the
// level's saved run, or there is none: runs.js) plays its trailer and then the results; a failure plays the blooper and
// then the failed card. A run a ?debug hook changed (tainted) no longer replays to what was seen, so
// it goes straight to its card. Cinema hangs off the title menu: its listing, then a trailer in its
// world's sound and music, then back to the listing with the menu's music again (R34).
//   installTrailers(router, { stage, canvas })   sets flow.cleared, flow.failed and router.goCinema
import { store } from '../storage.js';
import { lookFor } from '../looks/index.js';
import { setWorld, musicLook } from '../music.js';
import { toast } from '../screens/stage.js';
import { cinemaScreen } from '../screens/cinema.js';
import { cinemaReels } from './runs.js';
import { trailerScreen } from './player.js';
import { blooperScreen } from './blooper.js';

export function installTrailers(r, { stage, canvas }) {
  const { app, flow } = r;
  const takes = new Map(); // level id -> failures this session: the blooper's TAKE

  const roll = (screen) => {
    app.screen = 'trailer';
    app.film = screen;
    stage.show(screen);
  };
  const after = (fn) => () => {
    app.film = null;
    fn();
  };

  flow.cleared = (o) => {
    const results = after(() => {
      flow.showResults(o);
      if (o.saved === 'saved') toast('Your trailer is now showing in the Cinema');
    });
    const rec = o.recording;
    if (rec.tainted || !rec.ticks) return results();
    roll(trailerScreen({
      canvas, view: o.view, level: o.level, seed: rec.seed, inputs: rec.inputs,
      result: { stars: o.stars, score: o.score, newBest: o.newBest && o.mode === 'play' },
      onDone: results,
    }));
  };

  flow.failed = (o) => {
    const take = (takes.get(o.level.id) ?? 0) + 1;
    takes.set(o.level.id, take);
    const rec = o.recording;
    const card = after(() => flow.showFailed(o));
    if (rec.tainted || !rec.ticks) return card();
    roll(blooperScreen({ canvas, view: o.view, level: o.level, seed: rec.seed, inputs: rec.inputs, take, onDone: card }));
  };

  r.goCinema = (focusId = null) => {
    r.leave('cinema');
    app.film = null;
    stage.show(cinemaScreen({
      reels: cinemaReels(store), focusId, back: r.goTitle,
      play({ level, run }) {
        r.leave('trailer');
        const menu = musicLook();
        setWorld(lookFor(level));
        roll(trailerScreen({
          canvas, level, seed: run.seed, inputs: run.inputs,
          result: { stars: run.stars, score: run.score, newBest: false },
          onDone: after(() => {
            setWorld(menu); // the listing plays what the menu played
            r.goCinema(level.id);
          }),
        }));
      },
    }));
  };
}
