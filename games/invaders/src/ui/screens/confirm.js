// A confirm card laid over a screen (the lobby's Reset scores): a title, what is about to happen, and
// two buttons, Cancel first and focused (Esc and Backspace are Cancel), then the action, styled as
// the dangerous thing it is. The caller appends `el`, adds 'show' to it and focuses `focus`.
//   confirmCard({ title, text, yes }, onYes, onNo) -> { el, focus, onKey(code) -> handled }
import { h, button, navigate, shell } from './dom.js';
import { isBack } from '../keys.js';

export function confirmCard({ title, text, yes }, onYes, onNo) {
  const el = shell('confirm dim', title);
  const items = [button('Cancel', onNo, 'btn btn-big'), button(yes, onYes, 'btn btn-big btn-danger')];
  el.append(h('p', 'confirm-text', text), h('nav', 'menu menu-row', ...items));
  return { el, focus: items[0], onKey: (code) => (isBack(code) ? (onNo(), true) : navigate(items, code)) };
}
