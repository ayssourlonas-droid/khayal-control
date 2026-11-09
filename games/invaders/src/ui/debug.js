// ?debug: a corner readout for measuring on the Pi: the work per frame (sim + fx + draw, what the
// auto-quality scaler judges), the rAF interval (the display's pace) and the quality level.
// createDebug() is null without ?debug; sample(workMs, intervalMs, quality) once per frame.
const WINDOW = 30; // frames averaged per readout

export function createDebug() {
  if (!new URLSearchParams(location.search).has('debug')) return null;
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:12px;bottom:10px;padding:6px 12px;border-radius:8px;'
    + 'background:rgba(8,10,18,0.8);color:#c8ffe0;font:700 16px ui-monospace,monospace;z-index:9;pointer-events:none';
  box.textContent = 'work …';
  document.body.append(box);
  let n = 0;
  let work = 0;
  let interval = 0;
  return {
    sample(workMs, intervalMs, quality) {
      work += workMs;
      interval += intervalMs;
      if (++n < WINDOW) return;
      const w = work / n;
      const f = interval / n;
      const q = quality.level === 1 ? 'full' : 'half';
      box.textContent = `work ${w.toFixed(2)} ms · frame ${f.toFixed(1)} ms (${(1000 / f).toFixed(0)} fps)`
        + ` · quality ${quality.level} ${q} · 1 s work avg ${quality.avg.toFixed(2)} ms`;
      n = 0;
      work = 0;
      interval = 0;
    },
  };
}
