// The Vesper Moth's rage layers (World 16, Glass Cathedral; moth.js hands them to the boss cache): extra hull lights
// that fade in with a phase, art only (the core sends the divers from the wings). The hover phase spreads the wings
// and sets the eyespots blazing: a great halo of white-gold round each and a rose aura on the hindwings. The orbit
// phase beats the wings and lights the whole moth: an aura of violet and rose round the forewings, the thorax
// haloed, and the dawn itself rising behind it, with rays from the heart. Boss coordinates (the layer's origin is the
// boss's centre); nothing above y -158.
import { line, rgba, bloom } from './kit.js';
import { TAU, WEAK, GOLD, ROSE, VIOLET, AMBER } from './moth-kit.js';

export const rage = [
  null,
  (l) => {
    for (const s of [-1, 1]) {
      bloom(l, s * 200, 86, 130, WEAK, 0.26);
      bloom(l, s * 190, 90, 130, ROSE, 0.14);
      bloom(l, s * 200, 82, 70, '#ffffff', 0.18);
    }
  },
  (l) => {
    for (const s of [-1, 1]) {
      bloom(l, s * 245, -58, 96, VIOLET, 0.2);
      bloom(l, s * 230, -50, 100, ROSE, 0.12);
      bloom(l, s * 200, 86, 130, AMBER, 0.14);
    }
    bloom(l, 0, -10, 140, WEAK, 0.16);
    bloom(l, 0, 50, 180, GOLD, 0.1);
    l.save();
    l.translate(0, -10);
    for (let k = 0; k < 14; k++) { // rays from the heart, through the thorax's fur
      const a = (k * TAU) / 14 + 0.2;
      l.beginPath();
      l.moveTo(Math.cos(a) * 50, Math.sin(a) * 36);
      l.lineTo(Math.cos(a) * 120, Math.sin(a) * 86);
      line(l, rgba(WEAK, 0.09), 4);
    }
    l.restore();
  },
];
