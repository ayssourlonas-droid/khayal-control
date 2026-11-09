// The Thunder Galleon's bridge (World 13, Sunset Armada; see galleon.js): the stern castle, a taller cabin
// standing over the hull's middle. A pitched roof of brass shingles with the mainmast coming up through
// it between two aether lamps, a cornice, five tall arched windows glowing warm, a balcony whose top rail
// is a glass tube of aether over a carved panel with a gilded thunderbolt between two volutes, and stern
// lanterns hung at its corners. A weak point, 160 x 90 for the hit
// box; WINDOWS are where the captain stands (live, galleon-fx.js).
import { path, ink, line, lin, rgba, shade, bloom, eye, neon, both } from './kit.js';
import { BRASS_L, BRASS_D, TEAK_L, IRON, WARM, roundX, metalV, planks, stud, studRow } from './galleon-kit.js';
import { window, lantern } from './galleon-glass.js';

export const WINDOWS = [[-56, 9, 28], [-28, 9, 30], [0, 11, 36], [28, 9, 30], [56, 9, 28]]; // centre x, half width, height; all end at y +14
const TOP = -42; // the ridge

// The pitched roof: shingles in staggered rows of scallops, a bright ridge, a deep lip with studs.
function roof(b, plate) {
  path(b, [[-92, -17], [-90, -22], [-62, TOP], [62, TOP], [90, -22], [92, -17]]);
  ink(b, lin(b, 0, TOP, 0, -17, [[0, shade(plate, 0.45)], [0.6, plate], [1, shade(plate, -0.5)]]), 2.8);
  b.save();
  b.clip();
  for (let r = 0; r < 4; r++) {
    for (let x = -100 + (r % 2) * 6; x < 100; x += 12) {
      b.beginPath();
      b.arc(x, TOP + 4 + r * 6, 6.4, 0, Math.PI);
      line(b, rgba('#000000', 0.5), 1.4);
      b.beginPath();
      b.arc(x, TOP + 3 + r * 6, 6.4, 0.3, Math.PI - 0.3);
      line(b, rgba('#fff0b0', 0.4), 0.9);
    }
  }
  b.restore();
  path(b, [[-60, TOP + 1.6], [60, TOP + 1.6]], true);
  line(b, rgba('#fff4c8', 0.7), 1.4);
  b.fillStyle = metalV(b, -22, -15, BRASS_D); // the lip
  b.fillRect(-92, -21, 184, 5);
  studRow(b, -86, -18.5, 86, -18.5, 23, 1.3);
}

// An aether lamp on the roof: a brass post carrying a cyan crystal.
function lamp(b, l, x, weak) {
  b.fillStyle = metalV(b, TOP - 6, TOP + 6, BRASS_L);
  b.fillRect(x - 2, TOP - 1, 4, 10);
  path(b, [[x, TOP - 12], [x + 4.4, TOP - 5.5], [x, TOP + 1], [x - 4.4, TOP - 5.5]]);
  ink(b, lin(b, x - 4, 0, x + 4, 0, [[0, '#8af0ff'], [0.5, weak], [1, '#1a7a98']]), 1.4);
  eye(l, x, TOP - 5.5, 2.6, weak, 4.4);
}

// The wall: teak planks in a tapering frame, a brass cornice with dentils above the windows.
function wall(b, plate) {
  path(b, [[-82, 45], [-71, -17], [71, -17], [82, 45]]);
  ink(b, '#3a2210', 3);
  b.save();
  b.clip();
  planks(b, -84, -17, 84, 46, '#3a2210', 13, 7);
  both((s) => {
    b.fillStyle = roundX(b, -1, 6, TEAK_L); // the corner post
    b.fillRect(s > 0 ? 66 : -72, -17, 6, 63);
  });
  b.restore();
  path(b, [[-82, 45], [-71, -17], [71, -17], [82, 45]]);
  line(b, '#0a0c16', 2.6);
  b.fillStyle = metalV(b, -17, -10, plate);
  b.fillRect(-73, -17, 146, 6);
  for (let x = -70; x < 70; x += 6) { // dentils
    b.fillStyle = rgba('#3a2208', 0.6);
    b.fillRect(x, -10.6, 3, 3);
  }
}

// A volute: a spiral of gilt turning inward from a tail that trails off toward -x (s mirrors it).
function volute(b, x, y, r, s) {
  b.save();
  b.translate(x, y);
  b.scale(s, 1);
  b.beginPath();
  for (let i = 0; i <= 30; i++) {
    const a = (i / 30) * Math.PI * 2.6 + 1;
    const rr = r * (1 - 0.82 * (i / 30));
    b[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr);
  }
  b.lineTo(-r * 1.5, r * 1.05);
  line(b, '#2a1406', 4.6);
  line(b, BRASS_D, 3.2);
  line(b, '#e0a838', 2.2);
  line(b, rgba('#fff4c0', 0.7), 0.8);
  stud(b, 0, 0, 1.8, BRASS_L);
  b.restore();
}

// The carved panel under the balcony: a gilded thunderbolt between two volutes.
function emblem(b) {
  volute(b, -36, 37, 8, -1);
  volute(b, 36, 37, 8, 1);
  const zig = [[0, -9], [6, -9], [2, -1.6], [6.6, -1.6], [-3.4, 9.6], [-0.6, 1.8], [-5, 1.8]].map(([x, y]) => [x, 37 + y]);
  path(b, zig);
  b.lineJoin = 'round';
  line(b, '#2a1406', 3.4);
  ink(b, lin(b, 0, 28, 0, 47, [[0, BRASS_L], [1, BRASS_D]]), 0.8);
}

// The balcony: a gilt rail over turned balusters on a plank, the rail's glass tube alight on `l`.
function balcony(b, l, plate, weak) {
  b.fillStyle = metalV(b, 24, 31, plate);
  b.fillRect(-84, 26, 168, 5);
  line(b, '#0a0c16', 1.6);
  for (let x = -76; x <= 76; x += 7.6) {
    b.fillStyle = roundX(b, x - 1.6, x + 1.6, BRASS_L);
    b.beginPath();
    b.roundRect(x - 1.6, 16, 3.2, 10, 1.4);
    b.fill();
    b.fillStyle = rgba('#000000', 0.55);
    b.fillRect(x + 1.4, 16, 0.8, 10);
  }
  path(b, [[-84, 15.5], [84, 15.5]], true);
  line(b, '#05080e', 6);
  line(b, '#bff6ff', 3.6);
  line(b, rgba(weak, 0.8), 2);
  path(l, [[-84, 15.5], [84, 15.5]], true);
  neon(l, weak, 1.6, 0.8);
  studRow(b, -80, 15.5, 80, 15.5, 9, 1.6, IRON);
}

export function bridge(b, l, p, S) {
  const { plate, weak } = S.pal;
  b.fillStyle = roundX(b, -7, 7, TEAK_L); // the mast's foot coming down through the roof
  b.fillRect(-7, -48, 14, 8);
  wall(b, plate);
  for (const [x, hw, h] of WINDOWS) window(b, l, x - hw, 14 - h, hw * 2, h);
  both((s) => {
    for (let i = 0; i < 2; i++) { // pilasters between the windows
      const x = s * (14 + i * 28);
      b.fillStyle = metalV(b, -14, 14, BRASS_D);
      b.fillRect(x - 1.8, -15, 3.6, 30);
    }
  });
  balcony(b, l, plate, weak);
  roof(b, plate);
  b.fillStyle = metalV(b, TOP, TOP + 7, plate); // the collar where the mast goes through
  b.beginPath();
  b.roundRect(-10, TOP - 3, 20, 7, 2);
  b.fill();
  line(b, '#0a0c16', 1.8);
  both((s) => {
    lamp(b, l, s * 42, weak);
    lantern(b, l, s * 80, 16, 1.5); // the stern lanterns, hung from the corners
  });
  emblem(b);
  bloom(l, 0, -2, 110, WARM, 0.1);
  bloom(l, 0, 15, 90, weak, 0.1);
}
