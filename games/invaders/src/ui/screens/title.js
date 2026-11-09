// Title: the logo over a live autopilot battle in a random world, and the main menu.
//   titleScreen({ items: [{ label, pick }], nowShowing }) -> screen
// items is the menu in order (Play, Watch then try, Cinema); nowShowing names the backdrop's world.
import { h, button, credit, link, navigate, shell } from './dom.js';
import { play } from '../audio.js';
import { LEVELS, WORLDS } from '../../core/levels.js';

// What the game keeps and sends (it sends nothing; scores, runs and settings stay in localStorage), and what its host keeps.
const privacy = () => h('p', 'privacy', 'Privacy: no account, no cookies, no tracking. Everything the game saves stays in this browser. ',
  link(null, 'https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection',
    'The host, GitHub Pages, logs visitors’ IP addresses for security.'));

export function titleScreen({ items, nowShowing }) {
  const el = shell('title');
  const word = 'INVADERS';
  const logo = h('h1', 'logo',
    h('span', 'logo-glow', word), h('span', 'logo-chroma c1', word), h('span', 'logo-chroma c2', word),
    h('span', 'logo-text', word), h('span', 'logo-shine', word));
  const tag = h('p', 'tagline', `${WORLDS.length} worlds · ${LEVELS.length} levels · one pilot`);
  const buttons = items.map((it) => button(it.label, () => { play('select'); it.pick(); }, 'btn btn-big'));
  const menu = h('nav', 'menu', ...buttons);
  const hint = h('p', 'hint', '↑ ↓ choose · Enter select · M sound');
  const now = nowShowing ? h('p', 'now-showing', h('span', null, 'Now showing'), ` ${nowShowing}`) : null;
  el.append(h('div', 'title-stack', logo, tag, menu), now, hint, credit(), privacy());
  return { el, focus: buttons[0], onKey: (code) => navigate(buttons, code) };
}
