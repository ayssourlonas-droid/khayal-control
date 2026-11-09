// The camera is shake only: the world is a fixed 1920x1080 frame, so nothing pans or zooms.
// fx.shake is the amplitude in px; fx.shakeX / fx.shakeY the offset to translate by this frame.
const DECAY = 5; // exp rate per second
const MIN = 0.1; // px, below this the shake snaps to 0
const MAX = 40; // px, however many blasts stack up

export function addShake(fx, amount) {
  fx.shake = Math.min(MAX, Math.max(fx.shake, amount));
}

// Real frame time, not slow-motion time: a shake that outlasts the blast would feel mushy.
export function stepShake(fx, dt) {
  fx.shake *= Math.exp(-DECAY * dt);
  if (fx.shake < MIN) fx.shake = 0;
  fx.shakeX = fx.shake ? fx.shake * Math.sin(fx.time * 71) : 0;
  fx.shakeY = fx.shake ? fx.shake * Math.cos(fx.time * 53) : 0;
}
