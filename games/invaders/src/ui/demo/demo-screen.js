// The demo's overlay (from Barrage's): a caption panel with key caps that light while the autopilot
// "presses" them, progress dots, and a foot line. The watch shows the director's captions; the try
// shows one "your turn" card that fades after a few seconds.
//   demoScreen({ skip }) -> screen with update(dt) plus watch(director, world, input) and yourTurn()
import { h, shell, replayClass } from '../screens/dom.js';
import { CAPTIONS } from './script.js';

const TRY_SHOW = 5.5; // s the "your turn" card stays

const cap = (label) => {
  const k = h('kbd', 'key', label);
  k.dataset.key = label;
  return k;
};

// "Fire with {Space}." -> text with key caps.
function rich(el, text) {
  el.replaceChildren(...text.split(/(\{[^}]+\})/).filter(Boolean)
    .map((part) => (part[0] === '{' ? cap(part.slice(1, -1)) : part)));
  return el;
}

// What the ship is doing, as the keys a player would hold.
function litKeys(world, input) {
  const s = world.ship;
  const out = [];
  if (s.vx < -120) out.push('←', 'A');
  if (s.vx > 120) out.push('→', 'D');
  if (s.vy < -120) out.push('↑', 'W');
  if (s.vy > 120) out.push('↓', 'S');
  if (input?.fire) out.push('Space');
  if (input?.bomb || world.ship.bombHeld) out.push('B', 'Shift');
  return out;
}

export function demoScreen({ skip }) {
  const el = shell('demo');
  const kicker = h('span', 'demo-kicker');
  const title = h('h2', 'demo-title');
  const dots = h('div', 'demo-dots', ...CAPTIONS.map(() => h('i')));
  const text = h('p', 'demo-text');
  const foot = h('p', 'demo-foot');
  const panel = h('div', 'demo-cap', h('div', 'demo-head', h('div', 'demo-name', kicker, title), dots), text, foot);
  el.append(panel);
  let shown = -1;
  let lit = '';
  let tryLeft = 0;

  function show(kick, cls, head, body, footText) {
    kicker.textContent = kick;
    kicker.className = `demo-kicker ${cls}`;
    title.textContent = head;
    rich(text, body);
    rich(foot, footText);
    panel.classList.remove('gone');
    replayClass(panel, 'pop');
  }

  return {
    el,
    onKey(code) {
      if (tryLeft <= 0 && shown >= 0 && (code === 'Enter' || code === 'NumpadEnter' || code === 'Tab')) {
        skip();
        return true;
      }
      return false; // play keys reach the game; Esc pauses
    },
    watch(d, world, input) {
      if (d.caption !== shown) {
        shown = d.caption;
        const c = CAPTIONS[shown];
        show('Watch', 'show', c.title, c.text, '{Enter} skip to your turn  ·  {Esc} pause');
        [...dots.children].forEach((dot, i) => { dot.className = i < shown ? 'past' : i === shown ? 'now' : ''; });
      }
      const keys = litKeys(world, input).join(' ');
      if (keys === lit) return;
      lit = keys;
      for (const k of text.querySelectorAll('.key')) k.classList.toggle('lit', keys.split(' ').includes(k.dataset.key));
    },
    yourTurn() {
      shown = -1;
      tryLeft = TRY_SHOW;
      [...dots.children].forEach((dot) => { dot.className = 'past'; });
      show('Your turn', 'try', 'Same level, your hands',
        'Fly with {←}{↑}{↓}{→} or the mouse, hold {Space} to fire, {B} to bomb.', '{Esc} pause  ·  {M} sound');
    },
    update(dt) {
      if (tryLeft <= 0) return;
      tryLeft -= dt;
      if (tryLeft <= 0) panel.classList.add('gone');
    },
  };
}
