// The end of a cleared level, after the parade: the kicker (the level's name), VICTORY, the stars
// stamping in one by one, the score counting up, the best (or NEW BEST), and Next (when there is a
// next level, focused) / Again / Title.
//   resultsScreen({ level, score, stars, best, newBest }, { next?, again, title }) -> screen
// The buttons wait a moment (armed) so fire-button mashing at the clear cannot skip the card, and
// the fire key waits for the count-up and the stars (endKeys).
import { h, button, credit, shell, starRow, armed, endKeys, scoreSpan } from './dom.js';
import { play } from '../audio.js';
import { easeOut } from '../../core/math.js';
import { scoreText, levelName } from '../format.js';

const COUNT_TIME = 1.1; // s the score takes to count up
const STAR_AT = [0.55, 0.85, 1.15]; // s each star stamps in
const STAMP = 0.5; // s a star's stamp animation lasts (screens.css)

export function resultsScreen(o, act) {
  const ready = armed();
  const go = (fn) => () => ready() && fn();
  const el = shell('results dim won');
  const stars = starRow(o.stars, 'stars stars-big');
  const score = scoreSpan(o.level, 0);
  const best = o.newBest
    ? h('p', 'result-best new', 'New best!')
    : h('p', 'result-best', `Best ${scoreText(o.level, o.best.score)}`);
  const items = [
    ...(act.next ? [button('Next', go(act.next), 'btn btn-big')] : []),
    button('Again', go(act.again), 'btn btn-big'), button('Title', go(act.title), 'btn btn-big'),
  ];
  el.append(
    h('div', 'banner',
      h('p', 'banner-kicker', levelName(o.level)),
      h('h2', 'banner-title', 'Victory'),
      stars,
      h('p', 'result-line', h('span', 'result-cap', 'Score'), score),
      best),
    h('nav', 'menu menu-row', ...items), credit());
  let t = 0;
  let stamped = 0;
  const settle = Math.max(COUNT_TIME, o.stars ? STAR_AT[o.stars - 1] + STAMP : 0);
  return {
    el, focus: items[0],
    onKey: endKeys(items, ready, () => t >= settle),
    update(dt) {
      if (t > COUNT_TIME + 2) return;
      t += dt;
      const k = Math.min(1, t / COUNT_TIME);
      score.textContent = scoreText(o.level, o.score * easeOut(k));
      if (k < 1) play('count');
      while (stamped < o.stars && t >= STAR_AT[stamped]) {
        stamped += 1;
        stars.children[stamped - 1].classList.add('stamp');
        play('star', { n: stamped });
      }
      if (o.newBest && t >= COUNT_TIME && !best.classList.contains('shown')) {
        best.classList.add('shown');
        play('best');
      }
    },
  };
}
