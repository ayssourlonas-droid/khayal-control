// Pause: Resume / Restart / Level select / Title. Esc or P resumes.
import { h, button, credit, navigate, shell } from './dom.js';

export function pauseScreen({ label, resume, restart, select, title }) {
  const el = shell('pause dim', 'Paused');
  const items = [
    button('Resume', resume, 'btn btn-big'), button('Restart', restart, 'btn btn-big'),
    button('Level select', select, 'btn btn-big'), button('Title', title, 'btn btn-big'),
  ];
  el.append(h('p', 'sub', label), h('nav', 'menu', ...items), h('p', 'hint', 'Esc resume · M sound'), credit());
  return {
    el, focus: items[0],
    onKey: (code) => (code === 'Escape' || code === 'KeyP' ? (resume(), true) : navigate(items, code)),
  };
}
