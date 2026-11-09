// A failed level: SHOT DOWN, how far the run got (the wave, or what the giant had left), and
// Retry / Title.
//   failedScreen({ score, world }, { retry, title }) -> screen
import { h, button, credit, shell, armed, endKeys, scoreSpan } from './dom.js';
import { levelName } from '../format.js';
import { bossDef } from '../../core/bosses-data.js';
import { waveNumber } from '../../core/levels.js';

const SETTLE = 1100; // ms the fire key and held-key repeats are ignored once the card is up

function progress(world) {
  const b = world.boss;
  if (b) return `The ${bossDef(b.kind).name.toLowerCase()} held at ${Math.ceil((100 * b.hp) / b.maxHp)} %`;
  const { level } = world;
  return `Wave ${waveNumber(level, world.wave)} of ${waveNumber(level, level.waves.length)}`;
}

export function failedScreen(o, act) {
  const ready = armed();
  const go = (fn) => () => ready() && fn();
  const el = shell('results dim lost');
  const items = [button('Retry', go(act.retry), 'btn btn-big'), button('Title', go(act.title), 'btn btn-big')];
  el.append(
    h('div', 'banner',
      h('p', 'banner-kicker', levelName(o.world.level)),
      h('h2', 'banner-title', 'Shot down'),
      h('p', 'result-line', h('span', 'result-cap', 'Score'), scoreSpan(o.world.level, o.score)),
      h('p', 'result-best', progress(o.world))),
    h('nav', 'menu menu-row', ...items), credit());
  return { el, focus: items[0], onKey: endKeys(items, ready, armed(SETTLE)) };
}
