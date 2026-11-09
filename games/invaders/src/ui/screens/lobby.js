// Level select as a cinema lobby: every world has the same card, its poster (the boss fight, rendered by the game)
// over a strip with the world's difficulty and five reels showing best stars and best score (lobby-card.js). The cards
// stand in world order, eight to a row, a new world taking the next empty slot (lobby-nav.js rowsOf); a partly
// filled last row is left-aligned on the same columns, its rail ending at its last card. The page scrolls, header and
// all (the marquee, the star total, the rank); Back and Reset scores stand in a bar fixed to the bottom of the screen,
// with the key hint. Every reel is open from the start.
// Keys (lobby-nav.js): left/right change world within a row (same reel), up/down change reel and run on into the
// row below or above (at the column last chosen by left/right or the pointer, so down and up undo each other even
// across a short last row), down from the last row's last reel reaches Back, Enter plays, Esc goes back. In the bar
// left/right move between Back and Reset scores, up returns to the last reel, Enter picks. A key that moves
// the focus scrolls the page the least that shows the whole card above the bar (the first row scrolls to the top),
// smoothly, or at once under prefers-reduced-motion; the pointer focuses and never scrolls, or the page would chase
// the mouse. The wheel scrolls. Reset scores asks first (confirm.js, laid over the lobby: Cancel is focused, Esc
// cancels) and then calls reset(). The mouse focuses what it moves over, a reel or a poster (which stands for its
// first reel not played yet), and plays on click; a page that scrolls under a still pointer moves no focus.
// Under the title: the star total, and the pilot's rank with the medals it is read from.
//   lobbyScreen({ best, start(level), back(), reset(), focusId }) -> screen   best: storage allBest()
// The lobby opens scrolled to the card of focusId (the level just played), and tells posters.js which rows are in
// view so those posters bake first; posters not baked yet show their sky and develop in as soon as they are ready (update).
import { LEVELS, WORLDS } from '../../core/levels.js';
import { play } from '../audio.js';
import { h, button, credit, focusItem, navigate, shell, developer } from './dom.js';
import { MOVE, isConfirm, isBack } from '../keys.js';
import { confirmCard } from './confirm.js';
import { medalCount } from '../storage.js';
import { rankOf } from '../../core/ranks.js';
import { MAX_STARS } from '../../core/scoring.js';
import { posterFor, prefer } from './posters.js';
import { PER_ROW, rowsOf, step } from './lobby-nav.js';
import { cardOf } from './lobby-card.js';

const RESET_TEXT = 'This resets the best score, stars and medal of every level. '
  + 'Your saved trailers stay in Cinema. It cannot be undone.';
const calm = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

export function lobbyScreen({ best, start, back, reset, focusId = 'w1-1' }) {
  const el = shell('lobby');
  el.style.setProperty('--cols', String(PER_ROW)); // the grid's columns and the bar's width (lobby.css)
  const cols = WORLDS.map((w) => cardOf(w, best, start));
  const rows = rowsOf(cols.length);
  const shelves = rows.map((row) => {
    const shelf = h('div', 'posters', ...row.map((i) => cols[i].el));
    shelf.style.setProperty('--filled', String(row.length)); // the rail ends at the last card
    return shelf;
  });
  const total = Object.values(best).reduce((n, b) => n + b.stars, 0);
  const medals = medalCount(best);
  let ask = null; // the open Reset scores card
  const backBtn = button('Back', () => { play('back'); back(); }, 'btn');
  const resetBtn = button('Reset scores', () => {
    play('select');
    ask = confirmCard({ title: 'Reset scores?', text: RESET_TEXT, yes: 'Reset' }, () => { play('select'); reset(); }, () => {
      play('back');
      ask.el.remove();
      ask = null;
      resetBtn.focus({ preventScroll: true });
    });
    el.append(ask.el);
    void ask.el.offsetWidth; // commit the start state so the fade-in runs
    ask.el.classList.add('show');
    ask.focus.focus({ preventScroll: true });
  }, 'btn');
  const bar = [backBtn, resetBtn]; // left to right
  const page = h('div', 'lobby-scroll',
    h('header', 'marquee', h('span', 'bulbs'), h('h2', 'marquee-title', 'Now showing'), h('span', 'bulbs')),
    h('p', 'sub', `${WORLDS.length} worlds, ${LEVELS.length} reels. Every one is open. `,
      h('span', 'lobby-total', `★ ${total} / ${LEVELS.length * MAX_STARS}`),
      h('span', 'lobby-rank', `Rank ${rankOf(medals).name} · ${medals} / ${LEVELS.length} medals`)),
    ...shelves);
  el.append(page, h('div', 'lobby-bar', backBtn, resetBtn, credit(),
    h('span', 'hint', h('span', null, '← → world · ↑ ↓ reel'), h('span', null, 'Enter play · Esc back'))));

  const grid = cols.map((c) => c.reels);
  const at = new Map(grid.flatMap((reels, w) => reels.map((r, i) => [r, [w, i]]))); // reel element -> [world, reel]
  const first = grid.flat().find((r) => r.dataset.id === focusId) ?? grid[0][0];
  let lastReel = first; // up from the bar lands here
  // The column up and down aim for in the next row (a short last row clamps it, and the goal outlives that): the one
  // last chosen by left or right, else that of the card the focus was on when the keys took over. `landed` is the world
  // the keys last put the focus on; a focus anywhere else (the pointer, Tab) is a fresh start, with a goal of its own.
  let goal;
  let landed;
  // The least scroll that shows world w's whole card above the bar (the page's scroll-padding); the first row's
  // goes to the top, so its marquee shows with it. It works from layout sizes, which ignore the card's 0.5rem lift:
  // that transform is still running when the key lands, and scrollIntoView, measuring the lifted card, left the page
  // 7 px off and nudged it on the next key. Called on every move: it does nothing while the card is in view.
  const reveal = (w) => {
    const behavior = calm() ? 'instant' : 'smooth';
    if (rows[0].includes(w)) return page.scrollTo({ top: 0, behavior });
    const card = cols[w].el;
    const pad = globalThis.getComputedStyle?.(page);
    const top = card.offsetTop - (parseFloat(pad?.scrollPaddingTop) || 0);
    const low = card.offsetTop + card.offsetHeight + (parseFloat(pad?.scrollPaddingBottom) || 0) - page.clientHeight;
    if (page.scrollTop > top) page.scrollTo({ top, behavior });
    else if (page.scrollTop < low) page.scrollTo({ top: low, behavior });
  };
  // The pointer focuses what it moves over (a reel, or a poster: its pick()). Only a pointer that moved counts: when
  // the wheel scrolls the page, reels pass under a still pointer, and a hover per reel would hop the focus, tick the
  // move sound and lift each card in turn.
  const hover = (to) => (e) => {
    if (!e.movementX && !e.movementY) return;
    landed = null;
    focusItem(to());
  };
  for (const c of cols) {
    for (const r of c.reels) r.addEventListener('pointermove', hover(() => r));
    c.art.addEventListener('pointermove', hover(c.pick));
  }
  const goto = (reel) => {
    focusItem(reel);
    reveal(at.get(reel)[0]);
  };
  // Tell the baker which posters are in view (posters.js prefer), by the rows that cross the page's window.
  const inView = () => {
    const top = page.scrollTop;
    const end = top + page.clientHeight;
    prefer(shelves.flatMap((s, i) => (s.offsetTop + s.offsetHeight > top && s.offsetTop < end ? rows[i].map((j) => cols[j].world) : [])));
  };
  page.addEventListener('scroll', inView);
  const developed = developer(cols, posterFor); // a poster that has just been baked develops in
  return {
    el, focus: first,
    shown() { // attached and laid out: open on the card of focusId, centred where the page allows (layout sizes, not the screen's fade-in scale)
      const card = cols[at.get(first)[0]].el;
      page.scrollTo({ top: card.offsetTop - (page.clientHeight - card.offsetHeight) / 2, behavior: 'instant' });
      inView();
    },
    onKey(code) {
      if (ask) return ask.onKey(code), true; // the card is modal
      if (isBack(code)) return backBtn.click(), true;
      const active = document.activeElement;
      const move = MOVE[code];
      if (bar.includes(active)) {
        if (move?.[1] < 0) goto(lastReel);
        else navigate(bar, code, bar.length); // one row: left and right move along it, no wrap; Enter picks
        return true;
      }
      if (!at.has(active)) return goto(lastReel), true;
      if (move) {
        lastReel = active;
        const [w] = at.get(active);
        if (w !== landed) goal = w % PER_ROW; // its column in its row
        const to = step(at.get(active), move, rows, grid[0].length, goal);
        if (to) {
          landed = to[0];
          if (move[0]) goal = landed % PER_ROW; // left and right choose the column
        }
        return to ? goto(grid[to[0]][to[1]]) : focusItem(backBtn), true;
      }
      if (isConfirm(code)) return active.click(), true;
      return false;
    },
    update: developed,
  };
}
