// Tiny DOM helpers shared by the screens (from Barrage): element building, focusable buttons, and
// arrow-key navigation over a list or grid that keeps mouse hover and keyboard focus in step.
import { play } from '../audio.js';
import { MOVE, isConfirm } from '../keys.js';
import { MAX_STARS } from '../../core/scoring.js';
import { prune } from '../../core/util.js';

export function h(tag, cls, ...kids) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  for (const k of kids) if (k != null && k !== false) el.append(k);
  return el;
}

// Restart a CSS animation class: remove it, force a reflow, add it back.
export function replayClass(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

export function focusItem(el) {
  if (!el || el === document.activeElement) return;
  el.focus({ preventScroll: true });
  play('move');
}

export function button(label, onPick, cls = 'btn') {
  const b = h('button', cls, label);
  b.type = 'button';
  b.addEventListener('click', () => onPick());
  b.addEventListener('pointerenter', () => focusItem(b));
  return b;
}

// A link that opens in a new tab and keeps out of the keys' way: the arrows move among a screen's buttons, and Tab skips it.
export function link(cls, href, ...kids) {
  const a = h('a', cls, ...kids);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener';
  a.tabIndex = -1;
  return a;
}

// The author's credit, in the corner of every screen that is not play (title, lobby, cinema, results, failed, pause).
export const credit = () => link('credit', 'https://cocode.dk', 'Babak Bandpey · cocode.dk');

// Move focus among `items` (elements in reading order) with the arrows; `cols` > 1 is a grid.
// A plain list (cols 1) wraps around and takes left/right as well, for menus laid out in a row.
// Enter / Space pick the focused item. Returns true when the key was handled.
export function navigate(items, code, cols = 1) {
  const i = items.indexOf(document.activeElement);
  const mv = MOVE[code];
  if (mv) {
    if (i < 0) return focusItem(items[0]), true; // focus went astray: start over at the top
    let j = i + mv[0] + mv[1] * cols;
    if (cols === 1) j = (j + items.length) % items.length;
    if (j >= 0 && j < items.length) focusItem(items[j]);
    return true;
  }
  if (isConfirm(code)) {
    const el = items.includes(document.activeElement) ? document.activeElement : items[0];
    el.click();
    return true;
  }
  return false;
}

// A screen shell: <section class="screen {cls}"> with an optional heading.
export function shell(cls, title) {
  const el = h('section', `screen ${cls}`);
  if (title) el.append(h('h2', 'screen-title', title));
  return el;
}

// Stars as glyphs: n filled of MAX_STARS, each a span the CSS lights.
export function starRow(n, cls = 'stars') {
  return h('span', cls, ...Array.from({ length: MAX_STARS }, (_, i) => h('i', i < n ? 'on' : null, '★')));
}

// A guard for end-of-level cards: fire-button mashing at the end must not skip them.
export function armed(ms = 450) {
  const shown = performance.now();
  return () => performance.now() - shown >= ms;
}

// An end card's keys (results, failed): nothing until the card is `ready` (armed); then, until it
// has `settled` (its count-up and stars played out), the fire key and the repeats of a key still held
// from the fight are swallowed too, so fire mashing cannot skip the card and a held arrow cannot spin
// the focus. Enter confirms as soon as the card is armed. -> the screen's onKey
export function endKeys(items, ready, settled) {
  return (code, e) => !ready() || (!settled() && (code === 'Space' || Boolean(e?.repeat))) || navigate(items, code);
}

// A screen's update() for poster tiles ({ art, world }) that may still be baking (posters.js): each
// canvas goes in, and develops, once canvasOf(world) has one.
export function developer(tiles, canvasOf) {
  const waiting = tiles.filter((t) => !t.art.querySelector('canvas'));
  return () => prune(waiting, (t) => {
    const canvas = canvasOf(t.world);
    if (!canvas) return true;
    t.art.prepend(canvas);
    t.art.classList.add('develop');
    return false;
  });
}

// A world's sky as a CSS background: its gradient stops, top to bottom.
export const skyCss = (look) => `linear-gradient(180deg, ${look.sky.map(([s, c]) => `${c} ${s * 100}%`).join(', ')})`;
