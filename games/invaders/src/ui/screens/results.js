// The end of a cleared level: the kicker (world and reel), CLEARED, the stars stamping in one by
// one, the score counting up with how it came about (the tally, tally.js: time against par and the
// speed multiplier, the bombs and lives still held, and the medal for a clear without a power-up;
// none when tally is missing), the best (or NEW BEST; no line when best is null, as in the demo), the
// rank this clear raised the pilot to (promoted), and Next / Retry / Select.
//   resultsScreen({ label, title, score, stars, tally?, promoted?, best, newBest }, { next?, retry, select })
//     tally     the world's tally { time, par, speed, bombBonus, lifeBonus, medal, ... }
//     promoted  the name of the new rank, when the clear's medal raised it
// The buttons wait a moment (armed) so fire-button mashing at the clear cannot skip the card, and
// the fire key waits for the count-up and the stars (endKeys).
import { h, button, credit, shell, starRow, armed, endKeys } from './dom.js';
import { play } from '../audio.js';
import { easeOut } from '../../core/math.js';
import { fmt } from '../format.js';
import { tallyLines } from './tally.js';

const COUNT_TIME = 1.1; // s the score takes to count up
const STAR_AT = [0.55, 0.85, 1.15]; // s each star stamps in
const STAMP = 0.5; // s a star's stamp animation lasts (screens.css)

export function resultsScreen(o, act) {
  const ready = armed();
  const go = (fn) => () => ready() && fn();
  const el = shell('results dim won');
  const stars = starRow(o.stars, 'stars stars-big');
  const score = h('span', 'result-score', '0');
  const best = o.newBest
    ? h('p', 'result-best new', 'New best!')
    : o.best && h('p', 'result-best', `Best ${fmt(o.best.score)}`);
  const promo = o.promoted ? h('p', 'result-promo', `Promoted to ${o.promoted}`) : null;
  const tally = o.tally && h('div', 'result-tally',
    ...tallyLines(o.tally).map((l) => h('p', 'tally-line', l)),
    o.tally.medal && h('p', 'tally-line tally-medal', h('i', 'medal'), 'Medal · no powers'));
  const items = [];
  if (act.next) items.push(button(act.nextLabel ?? 'Next', go(act.next), 'btn btn-big'));
  items.push(button(act.retryLabel ?? 'Retry', go(act.retry), 'btn btn-big'));
  items.push(button(act.selectLabel ?? 'Select', go(act.select), 'btn btn-big'));
  el.append(
    h('div', 'banner',
      h('p', 'banner-kicker', o.label),
      h('h2', 'banner-title', o.title ?? 'Cleared'),
      stars,
      h('p', 'result-line', h('span', 'result-cap', 'Score'), score),
      tally,
      best,
      promo),
    h('nav', 'menu menu-row', ...items), credit());
  let t = 0;
  let stamped = 0;
  let revealed = false;
  const settle = Math.max(COUNT_TIME, o.stars ? STAR_AT[o.stars - 1] + STAMP : 0);
  return {
    el, focus: items[0],
    onKey: endKeys(items, ready, () => t >= settle),
    update(dt) {
      if (t > COUNT_TIME + 2) return;
      t += dt;
      const k = Math.min(1, t / COUNT_TIME);
      score.textContent = fmt(o.score * easeOut(k));
      if (k < 1) play('count');
      while (stamped < o.stars && t >= STAR_AT[stamped]) {
        stamped += 1;
        stars.children[stamped - 1].classList.add('stamp');
        play('star', { n: stamped });
      }
      if (t >= COUNT_TIME && !revealed) { // the count is done: the news slams in, with one fanfare
        revealed = true;
        for (const news of [o.newBest ? best : null, promo]) news?.classList.add('shown');
        if (o.newBest || promo) play('best');
      }
    },
  };
}
