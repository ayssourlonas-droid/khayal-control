// Cinema: every level whose best run is saved, as a listing of showings (the world's poster, the
// reel, the stars and the box office); Enter plays its trailer, Esc goes back to the title.
// Arrows move through the grid, down from the last row reaches Back.
//   cinemaScreen({ reels: [{ level, run }], play(reel), back(), focusId }) -> screen
// Posters not baked yet show their sky and develop in once they are (posters.js, as the lobby).
import { reelName, worldName } from '../../core/levels.js';
import { TICK } from '../../core/kinds.js';
import { fmt, clock } from '../format.js';
import { MOVE, isConfirm, isBack } from '../keys.js';
import { lookFor } from '../looks/index.js';
import { play as sound } from '../audio.js';
import { h, button, credit, focusItem, shell, starRow, skyCss, developer } from './dom.js';
import { posterFor } from './posters.js';

const COLS = 3;

// A copy of the world's poster: the lobby keeps the original canvas.
function thumb(world) {
  const src = posterFor(world);
  if (!src) return null;
  const c = document.createElement('canvas');
  c.width = 120;
  c.height = 180;
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  c.className = 'showing-canvas';
  return c;
}

function showing(reel, pick) {
  const { level, run } = reel;
  const look = lookFor(level);
  const art = h('span', 'showing-art');
  art.style.background = skyCss(look);
  const c = thumb(level.world);
  if (c) art.append(c);
  const b = button(null, () => pick(reel), 'showing');
  b.dataset.id = level.id;
  b.style.setProperty('--accent', look.palette.accent);
  b.append(art, h('span', 'showing-info',
    h('span', 'showing-world', worldName(level)),
    h('span', 'showing-reel', `${reelName(level)} · ${clock(run.ticks * TICK)}`),
    starRow(run.stars),
    h('span', 'showing-box', h('small', null, 'Box office'), fmt(run.score))));
  b.setAttribute('aria-label', `${worldName(level)}, ${reelName(level)}: play the trailer`);
  return { el: b, art, world: level.world };
}

export function cinemaScreen({ reels, play, back, focusId = null }) {
  const el = shell('cinema');
  const pick = (reel) => {
    sound('select');
    play(reel);
  };
  const tiles = reels.map((r) => showing(r, pick));
  const items = tiles.map((t) => t.el);
  const backBtn = button('Back', () => { sound('back'); back(); }, 'btn');
  const body = items.length
    ? h('div', 'showings', ...items)
    : h('div', 'cinema-empty', h('p', 'cinema-empty-title', 'No trailers yet'),
      h('p', 'sub', 'Clear a level and your best run premieres here, cut as a movie trailer.'));
  el.append(
    h('header', 'marquee', h('span', 'bulbs'), h('h2', 'marquee-title', 'Cinema'), h('span', 'bulbs')),
    h('p', 'sub', 'Your best runs, cut as trailers.'),
    body,
    h('div', 'row', backBtn, h('span', 'hint', items.length ? 'Arrows choose · Enter watch · Esc back' : 'Esc back')), credit());
  for (const it of items) it.addEventListener('focus', () => it.scrollIntoView({ block: 'nearest' }));
  const first = items.find((b) => b.dataset.id === focusId) ?? items[0] ?? backBtn;
  return {
    el, focus: first,
    onKey(code) {
      if (isBack(code)) return backBtn.click(), true;
      const at = document.activeElement;
      if (isConfirm(code)) return (items.includes(at) || at === backBtn ? at : first).click(), true;
      const i = items.indexOf(at);
      const mv = MOVE[code];
      if (!mv) return false;
      const step = mv[0] + COLS * mv[1];
      if (at === backBtn) {
        if (step < 0 && items.length) focusItem(items[Math.min(items.length - 1, items.length - 1 - ((items.length - 1) % COLS))]);
        return true;
      }
      if (i < 0) return focusItem(first), true;
      const j = i + step;
      const lastRow = Math.floor((items.length - 1) / COLS);
      if (j >= items.length && step === COLS) focusItem(Math.floor(i / COLS) < lastRow ? items.at(-1) : backBtn);
      else if (j >= 0 && j < items.length) focusItem(items[j]);
      return true;
    },
    update: developer(tiles, thumb), // a poster that has just been baked develops in
  };
}
