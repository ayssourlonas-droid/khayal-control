// Number and time formats shared by the screens and the trailer (DOM-free).
//   fmt(n)      12,345 (rounded)        pad2(n)  07        clock(secs)  m:ss, whole seconds, from 0
export const fmt = (n) => Math.round(n).toLocaleString('en-US');
export const pad2 = (n) => String(n).padStart(2, '0');
export function clock(secs) {
  const s = Math.max(0, Math.floor(secs));
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}
