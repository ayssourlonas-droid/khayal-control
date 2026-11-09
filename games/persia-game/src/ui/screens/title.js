// Title: the logo over a live autopilot battle, and the main menu.
//   titleScreen({ items: [{ label, place, art, pick }], nowShowing }) -> screen
// items is the menu in order, one card per level: its picture (`art`, a canvas) over its name and
// its place; nowShowing names the backdrop's level. The arrows walk the cards in order, left and right
// round the whole list, up and down between its rows.
import { h, button, credit, link, navigate, shell } from './dom.js';
import { play } from '../audio.js';

// What the game keeps and sends (it sends nothing; the scores and the sound setting stay in localStorage), and what its host keeps.
const privacy = () => h('p', 'privacy', 'Privacy: no account, no cookies, no tracking. Everything the game saves stays in this browser. ',
  link(null, 'https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection',
    'The host, GitHub Pages, logs visitors’ IP addresses for security.'));

const PER_ROW = 5; // the cards wrap five to a row (.level-cards, css/screens.css)

export function titleScreen({ items, nowShowing }) {
  const el = shell('title');
  const word = 'PERSIA';
  const logo = h('h1', 'logo',
    h('span', 'logo-glow', word), h('span', 'logo-chroma c1', word), h('span', 'logo-chroma c2', word),
    h('span', 'logo-text', word), h('span', 'logo-shine', word));
  const cards = items.map((it) => {
    const face = h('span', 'card-face', it.art, h('span', 'card-number', it.label), h('span', 'card-place', it.place));
    return button(face, () => { play('select'); it.pick(); }, 'btn level-card');
  });
  const menu = h('nav', 'menu menu-row level-cards', ...cards);
  const hint = h('p', 'hint', 'Enter play · M sound');
  const now = nowShowing ? h('p', 'now-showing', h('span', null, 'Now showing'), ` ${nowShowing}`) : null;
  el.append(h('div', 'title-stack', logo, menu), now, hint, credit(), privacy());
  return { el, focus: cards[0], onKey: (code) => navigate(cards, code, PER_ROW) };
}
