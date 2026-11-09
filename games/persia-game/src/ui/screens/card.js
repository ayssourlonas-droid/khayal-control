// The title card while a level's art bakes: a film's opening card in the look's sky colours with
// the level's name.
import { h, shell, skyCss } from './dom.js';
import { LOOK } from '../looks/index.js';
import { levelName } from '../format.js';

export function cardScreen(level) {
  const el = shell('card');
  el.style.background = skyCss(LOOK);
  el.style.setProperty('--accent', LOOK.palette.accent);
  el.append(h('div', 'card-body',
    h('h2', 'card-name', levelName(level)),
    h('div', 'card-bar', h('span'))));
  return { el, onKey: () => true };
}
