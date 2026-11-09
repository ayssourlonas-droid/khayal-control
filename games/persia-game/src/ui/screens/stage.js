// The overlay stage (from Barrage): one screen at a time over the canvas, cross-faded, with keyboard
// focus handed to the new screen. A screen is { el, focus?, onKey?(code, event) -> handled, update?(dt) }.
const FADE_MS = 320;

export function createStage(root) {
  let current = null;
  return {
    show(screen) {
      if (current && current !== screen) {
        const old = current.el;
        old.classList.remove('show');
        old.classList.add('leaving');
        setTimeout(() => old !== current?.el && old.remove(), FADE_MS); // unless it came back (resume)
      }
      current = screen;
      if (!screen) {
        document.activeElement?.blur?.();
        return;
      }
      screen.el.classList.remove('leaving');
      if (!screen.el.isConnected) root.append(screen.el);
      void screen.el.offsetWidth; // commit the start state so the fade-in runs
      screen.el.classList.add('show');
      screen.focus?.focus({ preventScroll: true });
    },
    onKey: (code, e) => !!current?.onKey?.(code, e),
    update: (dt) => current?.update?.(dt),
  };
}

let toastTimer = 0;
export function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.append(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1400);
}
