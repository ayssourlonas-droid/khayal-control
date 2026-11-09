// The kingdom's spans (far layer of Lantern Deep, see parallax-deep.js): an aqueduct marching down the near
// slope on round arches, two of them fallen and a pier snapped, with teal glows in a few of the openings
// and weed hanging in the rest; and a stone bridge on the far ridge, collapsed in the middle: two stubs of
// deck with half an arch under each, a slab dangling, rubble below, one lantern still alight on the left stub.
import { rgba } from './sprites.js';
import { TEAL, GREEN, CORAL, ABYSS, SURFACE, PALE, poly, lamp, tint, wash, crust, weed, moss, barnacles } from './parallax-deep-kit.js';

const PIER = 11; // an aqueduct pier's width

// n arches of `span` px from x0, the deck running from deck0 to deck1 (layer y of its top), the piers down to
// ground(x). `fallen` are the indexes of arches that have come down.
export function aqueduct(g, out, rng, L, x0, n, span, deck0, deck1, ground, fallen) {
  const deck = (x) => deck0 + ((deck1 - deck0) * (x - x0)) / (n * span);
  const r = (span - PIER) / 2;
  const spring = (i) => deck(x0 + (i + 0.5) * span) + 13 + r;
  const build = (c) => {
    for (let i = 0; i < n; i++) {
      const [xl, xr] = [x0 + i * span, x0 + (i + 1) * span];
      c.rect(xl, deck(xl), span, 9); // the deck
      if (fallen.includes(i)) continue;
      c.moveTo(xl + PIER / 2, spring(i));
      c.arc((xl + xr) / 2, spring(i), r, Math.PI, 0);
      c.lineTo(xr - PIER / 2, deck(xr) + 9);
      c.lineTo(xl + PIER / 2, deck(xl) + 9);
      c.closePath();
    }
  };
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  for (let i = 0; i <= n; i++) { // the piers; the one between the fallen arches is snapped short
    const [px, top] = [x0 + i * span, spring(Math.min(i, n - 1))];
    const snapped = fallen.includes(i) && fallen.includes(i - 1);
    const hgt = ground(px) + 10 - top;
    g.fillStyle = L.color;
    g.fillRect(px - PIER / 2, snapped ? top + hgt * 0.45 : top - 2, PIER, snapped ? hgt * 0.55 : hgt);
    barnacles(g, rng, px - PIER / 2, top + 6, px + PIER / 2, ground(px), 3);
  }
  wash(g, build, [x0, deck0 - 8, x0 + n * span, deck1 + 64], undefined, 0.3);
  g.strokeStyle = rgba(PALE, 0.2); // the arch rings, catching what light there is
  g.lineWidth = 1.4;
  for (let i = 0; i < n; i++) {
    if (fallen.includes(i)) continue;
    g.beginPath();
    g.arc(x0 + (i + 0.5) * span, spring(i), r, Math.PI, 0);
    g.stroke();
  }
  g.fillStyle = L.color;
  const [coral, green] = [tint(L, CORAL, 0.3), tint(L, GREEN, 0.28)];
  for (let i = 0; i < n; i++) {
    const [xl, cx] = [x0 + i * span, x0 + (i + 0.5) * span];
    g.fillStyle = L.color;
    g.fillRect(xl + 2, deck(xl) - 4, span - 7, 4); // the parapet, stepped in blocks
    crust(g, rng, xl, xl + span, deck(xl) - 3, coral);
    moss(g, rng, xl, xl + span, deck(xl) + 9, green);
    g.fillStyle = L.color;
    if (fallen.includes(i)) { // rubble where the arch was
      for (let k = 0; k < 7; k++) g.fillRect(cx - span / 2 + rng() * span, ground(cx) - 3 - rng() * 5, 4 + rng() * 6, 3 + rng() * 4);
    } else if (i % 3 === 1) {
      lamp(out, cx, spring(i) - r * 0.5, 26, TEAL, 'pulse', rng(), 0.2); // a faint teal glow in the opening
    } else {
      weed(g, rng, cx - 8, deck(cx) + 10, 12 + rng() * 14, 5, green, 3);
    }
  }
}

// The broken bridge with its left abutment at x and its deck at y: an open-spandrel arch, the deck held up on
// the ring by slim struts, fallen in the middle: two stubs of deck, a half ring under each, an abutment pier at
// each end, a slab dangling from the right stub, rubble on the ground, one lantern still alight on the left.
// The ring is 130 px in radius with its centre 140 below y: put y about 125 above the ground and its feet sink in.
export function bridge(g, out, rng, L, x, y, ground) {
  const [cx, R] = [x + 150, 130];
  const cy = y + 10 + R;
  const ring = (a0, a1) => Array.from({ length: 17 }, (_, k) => [cx + R * Math.cos(a0 + ((a1 - a0) * k) / 16), cy + R * Math.sin(a0 + ((a1 - a0) * k) / 16)]);
  const sides = [ // from the springing up to the break; the deck stub runs from the edge to the tip
    { a0: Math.PI, a1: Math.PI + 0.82, edge: x, tip: x + 98 },
    { a0: Math.PI * 2, a1: Math.PI * 2 - 0.58, edge: x + 300, tip: x + 234 },
  ];
  const [coral, green] = [tint(L, CORAL, 0.3), tint(L, GREEN, 0.3)];
  g.save();
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const { a0, a1, edge, tip } of sides) {
    const pts = ring(a0, a1);
    const [lo, hi, dir] = [Math.min(edge, tip), Math.max(edge, tip), Math.sign(tip - edge)];
    g.fillStyle = L.color;
    g.strokeStyle = L.color;
    g.fillRect(lo, y, hi - lo, 9); // the deck stub, with a parapet and the pier under its end
    g.fillRect(lo, y - 4, hi - lo, 4);
    g.fillRect(Math.min(edge, edge + dir * 16), y, 16, ground(edge) + 14 - y);
    g.lineWidth = 3; // the struts from the ring up to the deck
    g.beginPath();
    pts.forEach(([px, py], k) => {
      if (k % 2) return;
      g.moveTo(px, py);
      g.lineTo(px, y + 9);
    });
    g.stroke();
    g.lineWidth = 7; // the ring, a paler band than the deck, cut across by its voussoirs
    g.strokeStyle = tint(L, SURFACE, 0.3);
    g.beginPath();
    pts.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.stroke();
    g.lineWidth = 1;
    g.strokeStyle = rgba(ABYSS, 0.5);
    g.beginPath();
    pts.forEach(([px, py]) => {
      const [nx, ny] = [(px - cx) / R, (py - cy) / R];
      g.moveTo(px - nx * 3.5, py - ny * 3.5);
      g.lineTo(px + nx * 3.5, py + ny * 3.5);
    });
    g.stroke();
    g.fillStyle = L.color;
    poly(g, [[tip, y + 9], [tip - dir * 42, y + 32], [tip - dir * 39, y + 40], [tip + dir * 2, y + 18]]); // a slab dangling from the stub
    g.fill();
    crust(g, rng, lo, hi, y - 4, coral);
    weed(g, rng, tip, y + 10, 34, 6, green, -dir * 3);
    barnacles(g, rng, lo, y + 10, hi, ground(edge), 10);
  }
  g.restore();
  g.fillStyle = L.color;
  for (let k = 0; k < 10; k++) g.fillRect(x + 100 + rng() * 130, ground(x + 160) - rng() * 8, 4 + rng() * 8, 3 + rng() * 4);
  g.fillRect(x + 14, y - 22, 1.6, 18); // a lantern post on the left stub, still alight
  g.fillRect(x + 11, y - 26, 7.6, 4);
  lamp(out, x + 15, y - 20, 9, L.lamp, 'flicker', rng(), 0.42);
}
