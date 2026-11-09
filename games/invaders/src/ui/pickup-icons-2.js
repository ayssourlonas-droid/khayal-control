// Pickup icons of worlds 5-8 (see pickup-skins.js): plain paths, drawn by the HUD every frame too.
import { TAU } from '../core/math.js';
import { line as stroke } from './sprites.js';
import { FAN } from './pickup-icons.js';

// fan(draw) draws one of the spread's prongs at each FAN angle.
const fan = (draw) => {
  for (const a of FAN) draw(a);
};

export const ICONS2 = {
  5: {
    spread(g, color) { // three thorns
      g.fillStyle = color;
      fan((a) => {
        const [s, c] = [Math.sin(a), Math.cos(a)];
        g.beginPath();
        g.moveTo(s * 26, 12 - c * 26);
        g.lineTo(c * 4, 12 + s * 4);
        g.lineTo(-c * 4, 12 - s * 4);
        g.closePath();
        g.fill();
      });
    },
    laser(g, color) { // an acid stream
      g.beginPath();
      for (let y = -15; y <= 15; y += 2) g.lineTo(Math.sin(y * 0.45) * 4, y);
      stroke(g, color, 5);
      stroke(g, '#ffffff', 1.4);
    },
    shield(g, color) { // a cell: membrane and nucleus
      g.beginPath();
      g.arc(0, 0, 14, 0, TAU);
      stroke(g, color, 3.4);
      g.fillStyle = color;
      g.beginPath();
      g.arc(3, -2, 5, 0, TAU);
      g.fill();
    },
  },
  6: {
    laser(g, color) { // a falling column of code
      g.fillStyle = color;
      for (let i = 0; i < 6; i++) g.fillRect(-3 + (i % 2) * 2, -15 + i * 5, 5 - (i % 2) * 2, 3.4);
      g.fillStyle = '#ffffff';
      g.fillRect(-2.5, 11, 5, 4);
    },
    spread(g, color) { // three streams
      g.fillStyle = color;
      fan((a) => {
        for (let i = 1; i < 5; i++) g.fillRect(Math.sin(a) * i * 6 - 2, 12 - Math.cos(a) * i * 6 - 2, 4, 4);
      });
    },
    rapid(g, color) { // >> turned to point up
      g.beginPath();
      for (const y of [-2, 9]) {
        g.moveTo(-10, y);
        g.lineTo(0, y - 10);
        g.lineTo(10, y);
      }
      stroke(g, color, 4);
    },
  },
  7: {
    spread(g, color) { // three tracer rounds
      fan((a) => {
        g.save();
        g.translate(Math.sin(a) * 14, 10 - Math.cos(a) * 14);
        g.rotate(a);
        g.fillStyle = color;
        g.fillRect(-2.6, -6, 5.2, 12);
        g.beginPath();
        g.arc(0, -6, 2.6, Math.PI, 0);
        g.fill();
        g.restore();
      });
    },
    laser(g, color) { // a plasma bolt in its rings
      g.fillStyle = color;
      g.beginPath();
      g.ellipse(0, 0, 5, 15, 0, 0, TAU);
      g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.ellipse(0, 0, 2, 11, 0, 0, TAU);
      g.fill();
      g.beginPath();
      for (const y of [-6, 6]) g.ellipse(0, y, 9, 2.6, 0, 0, TAU);
      stroke(g, color, 1.6);
    },
    shield(g, color) { // an armour plate
      g.beginPath();
      for (let i = 0; i < 6; i++) g.lineTo(Math.cos(i * TAU / 6) * 14, Math.sin(i * TAU / 6) * 14);
      g.closePath();
      stroke(g, color, 3.4);
      g.beginPath();
      g.moveTo(-7, 0);
      g.lineTo(7, 0);
      stroke(g, color, 2);
    },
  },
  8: {
    spread(g, color) { // three rays bent by gravity
      g.beginPath();
      fan((a) => {
        g.moveTo(0, 12);
        g.quadraticCurveTo(Math.sin(a) * 6 + 8, 0, Math.sin(a) * 22, 12 - Math.cos(a) * 24);
      });
      stroke(g, color, 3.4);
    },
    laser(g, color) { // a beam through a lens of light
      g.beginPath();
      g.moveTo(0, -15);
      g.lineTo(0, 15);
      stroke(g, color, 5);
      stroke(g, '#ffffff', 1.6);
      g.beginPath();
      g.ellipse(0, 0, 11, 4, 0, 0, TAU);
      stroke(g, color, 2);
    },
    shield(g, color) { // an orbit
      g.beginPath();
      g.ellipse(0, 0, 15, 6, -0.4, 0, TAU);
      stroke(g, color, 2.6);
      g.fillStyle = color;
      g.beginPath();
      g.arc(0, 0, 5, 0, TAU);
      g.fill();
    },
  },
};
