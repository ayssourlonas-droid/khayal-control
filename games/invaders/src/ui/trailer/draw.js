// The trailer's title cards on the canvas, in each world's typography (face, weight, tracking, ink,
// glow), each arriving its own way (reveal.js). A card's text is baked once with its glow
// (shadowBlur only at bake time, never per frame) and drawn each frame through its reveal.
//   begin(ctx, canvas)   a black frame in world space (1920 x 1080, letterboxed)
//   TYPE[world - 1]      the world's style          FONTS: the font stacks
//   bakeCard(lines, style, scale?) -> art { canvas, rows, h, size }
//   drawCard(ctx, art, style, t, secs)   t: seconds into the card
import { W, H, makeCanvas, lin } from '../sprites.js';
import { smooth } from '../../core/math.js';
import { REVEAL, bloom } from './reveal.js';

export const FONTS = {
  cond: '"Bahnschrift", "DejaVu Sans Condensed", "Liberation Sans Narrow", "Arial Narrow", sans-serif',
  sans: '"DejaVu Sans", "Segoe UI", system-ui, sans-serif',
  serif: '"DejaVu Serif", Georgia, "Times New Roman", serif',
  mono: '"DejaVu Sans Mono", "Liberation Mono", Consolas, monospace',
};

export const TYPE = [
  { font: FONTS.mono, weight: 700, size: 78, track: 0.14, ink: '#e6fff8', glow: '#3affc8', reveal: 'crt' },
  { font: FONTS.cond, weight: 400, size: 92, track: 0.32, ink: '#ffe9fb', glow: '#ff4fd8', reveal: 'flicker' },
  { font: FONTS.cond, weight: 800, size: 96, track: 0.24, ink: '#fff0d2', glow: '#ffa63a', reveal: 'push' },
  { font: FONTS.serif, weight: 700, size: 84, track: 0.1, ink: '#f7efe4', glow: '#e0393f', reveal: 'wipe', kicker: '#f7efe4' },
  { font: FONTS.sans, weight: 300, size: 68, track: 0.46, ink: '#e2f2dc', glow: '#8fd46a', reveal: 'breathe' },
  { font: FONTS.mono, weight: 700, size: 66, track: 0.02, ink: '#c4ffd4', glow: '#33ff66', reveal: 'type', prefix: '> ' },
  { font: FONTS.cond, weight: 900, size: 104, track: 0.08, ink: 'chrome', glow: '#ff5a2a', reveal: 'slam' },
  { font: FONTS.sans, weight: 200, size: 70, track: 0.5, ink: '#f4f7ff', glow: '#8fb8ff', reveal: 'drift' },
  { font: FONTS.cond, weight: 900, size: 110, track: 0.18, ink: '#d8f4ef', glow: '#22d0c0', reveal: 'slam' },
  { font: FONTS.serif, weight: 700, size: 88, track: 0.14, ink: '#efe4ff', glow: '#a35cff', reveal: 'flicker' },
  { font: FONTS.sans, weight: 100, size: 72, track: 0.44, ink: '#eafff8', glow: '#6dffc4', reveal: 'breathe' },
  { font: FONTS.serif, weight: 400, size: 86, track: 0.15, ink: '#fff3d0', glow: '#ffd45e', reveal: 'drift' },
  { font: FONTS.serif, weight: 900, size: 92, track: 0.12, ink: '#fff1e2', glow: '#ff9a6a', reveal: 'push' },
  { font: FONTS.cond, weight: 800, size: 96, track: 0.15, ink: '#fbe8ff', glow: '#e062ff', reveal: 'flicker' },
  { font: FONTS.cond, weight: 300, size: 102, track: 0.3, ink: '#dcfdff', glow: '#2cc4e6', reveal: 'breathe' },
  { font: FONTS.serif, weight: 400, size: 88, track: 0.24, ink: '#ffeefa', glow: '#d95fc4', reveal: 'push' },
  { font: FONTS.sans, weight: 800, size: 78, track: 0.2, ink: '#fff6e0', glow: '#58b8f0', reveal: 'breathe' },
  { font: FONTS.cond, weight: 900, size: 100, track: 0.2, ink: '#f2f6ff', glow: '#ffae42', reveal: 'slam' },
];

const MAX_W = 1640;
const FADE_OUT = 0.16;

// A clip is framed 2 : 1 rather than the cards' 2.39 : 1, and the field drawn higher, so the ship
// (down to y 1040) stays above the lower bar and the formation's top rows below the upper one.
// Call after stepFilm, before drawFrame.
const CLIP_BARS = 0.44; // of the full bar: about 60 px
const LIFT = 44;
export function frameClip(view, film) {
  const e = film.letterbox;
  film.letterbox = e * CLIP_BARS;
  view.lift = LIFT * e; // always less than the lower bar, so nothing under the field shows
}

export function begin(ctx, canvas) {
  const s = Math.min(canvas.width / W, canvas.height / H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(s, 0, 0, s, (canvas.width - W * s) / 2, (canvas.height - H * s) / 2);
}

function inkOf(g, style, row, size) {
  if (style.ink !== 'chrome') return style.ink;
  return lin(g, 0, row.y - size * 0.5, 0, row.y + size * 0.5, [
    [0, '#ffffff'], [0.42, '#cfd8e2'], [0.5, '#46505c'], [0.6, '#98a6b4'], [1, '#f4f8fc'],
  ]);
}

export function bakeCard(lines, style, scale = 1) {
  const text = lines.map((l) => (style.prefix ?? '') + l);
  const g0 = makeCanvas(4, 4).getContext('2d');
  let size = style.size * scale;
  const widest = () => {
    g0.font = `${style.weight} ${size}px ${style.font}`;
    g0.letterSpacing = `${(size * style.track).toFixed(1)}px`;
    return Math.max(...text.map((l) => g0.measureText(l).width));
  };
  const wide = widest();
  if (wide > MAX_W) size *= MAX_W / wide;
  const lineH = Math.round(size * 1.32);
  const pad = Math.round(size * 0.7);
  const canvas = makeCanvas(W, text.length * lineH + 2 * pad);
  const g = canvas.getContext('2d');
  g.font = `${style.weight} ${size}px ${style.font}`;
  g.letterSpacing = `${(size * style.track).toFixed(1)}px`;
  g.textBaseline = 'middle';
  const rows = text.map((l, i) => {
    const w = g.measureText(l).width - size * style.track; // the last letter's spacing is not ink
    const prefix = [...Array(l.length + 1).keys()].map((k) => g.measureText(l.slice(0, k)).width);
    return { text: l, x0: Math.round((W - w) / 2), y: pad + lineH * (i + 0.5), w, prefix, top: pad + lineH * i, h: lineH };
  });
  g.shadowColor = style.glow;
  g.fillStyle = style.glow;
  for (const [blur, alpha] of [[size * 0.55, 0.85], [size * 0.16, 1]]) {
    g.shadowBlur = blur;
    g.globalAlpha = alpha;
    for (const r of rows) g.fillText(r.text, r.x0, r.y);
  }
  g.shadowBlur = 0;
  g.globalAlpha = 1;
  for (const r of rows) {
    g.fillStyle = inkOf(g, style, r, size);
    g.fillText(r.text, r.x0, r.y);
  }
  return { canvas, rows, h: canvas.height, size };
}


export function drawCard(ctx, art, style, t, secs) {
  const out = 1 - smooth((t - (secs - FADE_OUT)) / FADE_OUT);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.2 * out * smooth(t / 0.4);
  ctx.drawImage(bloom(style.glow), W / 2 - 900, H / 2 - 360, 1800, 720);
  ctx.globalCompositeOperation = 'source-over';
  REVEAL[style.reveal](ctx, art, style, t, out, H / 2 - art.h / 2, secs);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
