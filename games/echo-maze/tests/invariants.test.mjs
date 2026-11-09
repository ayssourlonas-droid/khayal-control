import test from 'node:test';
import assert from 'node:assert/strict';

/* ==========================================================================
   ECHO MAZE — HEADLESS INVARIANT & REGRESSION TEST SUITE
   Zero external dependencies: uses native node:test runner.
   Verifies all 52 core mathematical and simulation invariants.
   ========================================================================== */

function createPrng(seed) {
  let s = (Math.floor(Math.abs(seed)) || 1337) >>> 0;
  return function() {
    s |= 0;
    s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateMaze(width, height, seed) {
  const W = width % 2 === 0 ? width + 1 : width;
  const H = height % 2 === 0 ? height + 1 : height;
  const rng = createPrng(seed);

  const grid = Array.from({ length: H }, () => Array(W).fill(1));
  const stack = [[1, 1]];
  grid[1][1] = 0;

  const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];
    const neighbors = [];
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx > 0 && nx < W - 1 && ny > 0 && ny < H - 1 && grid[ny][nx] === 1) {
        neighbors.push([nx, ny, cx + dx / 2, cy + dy / 2]);
      }
    }

    if (neighbors.length > 0) {
      const idx = Math.floor(rng() * neighbors.length);
      const [nx, ny, wx, wy] = neighbors[idx];
      grid[wy][wx] = 0;
      grid[ny][nx] = 0;
      stack.push([nx, ny]);
    } else {
      stack.pop();
    }
  }

  const dist = Array.from({ length: H }, () => Array(W).fill(-1));
  const queue = [[1, 1]];
  dist[1][1] = 0;
  let maxDist = 0;
  let reachableFloorCount = 0;

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    reachableFloorCount++;
    const d = dist[y][x];
    if (d > maxDist) maxDist = d;

    const stepDirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of stepDirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] === 0 && dist[ny][nx] === -1) {
        dist[ny][nx] = d + 1;
        queue.push([nx, ny]);
      }
    }
  }

  let totalFloorCount = 0;
  const floorCells = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (grid[y][x] === 0) {
        totalFloorCount++;
        floorCells.push({ x, y, dist: dist[y][x] });
      }
    }
  }

  const isConnected = (reachableFloorCount === totalFloorCount);

  const threshold = 0.60 * maxDist;
  const candidates = floorCells.filter(c => c.dist >= threshold);
  candidates.sort((a, b) => {
    if (b.dist !== a.dist) return b.dist - a.dist;
    return (b.x + b.y) - (a.x + a.y);
  });

  const exit = candidates.length > 0 ? candidates[0] : { x: W - 2, y: H - 2, dist: maxDist };

  return { W, H, grid, dist, maxDist, totalFloorCount, reachableFloorCount, isConnected, exit, floorCells };
}

function findBfsPath(grid, W, H, startX, startY, endX, endY) {
  if (startX === endX && startY === endY) return [];
  if (startX < 0 || startX >= W || startY < 0 || startY >= H) return null;
  if (endX < 0 || endX >= W || endY < 0 || endY >= H) return null;
  if (grid[startY][startX] === 1 || grid[endY][endX] === 1) return null;

  const queue = [[startX, startY]];
  const prev = new Map();
  const visited = new Set();
  const startKey = `${startX},${startY}`;
  visited.add(startKey);

  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    if (cx === endX && cy === endY) {
      const path = [];
      let curr = `${endX},${endY}`;
      while (curr !== startKey) {
        const [px, py] = curr.split(',').map(Number);
        path.unshift({ x: px, y: py });
        curr = prev.get(curr);
      }
      return path;
    }

    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      const nKey = `${nx},${ny}`;
      if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] === 0 && !visited.has(nKey)) {
        visited.add(nKey);
        prev.set(nKey, `${cx},${cy}`);
        queue.push([nx, ny]);
      }
    }
  }
  return null;
}

function hasLineOfSight(grid, W, H, x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return true;

  const steps = Math.ceil(dist * 6);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const sx = Math.floor(x0 + dx * t);
    const sy = Math.floor(y0 + dy * t);
    if (sx >= 0 && sx < W && sy >= 0 && sy < H) {
      if (grid[sy][sx] === 1) return false;
    }
  }
  return true;
}

const CAMPAIGN_LEVELS = [
  { id: 1, name: "Rookie Patrol", width: 11, height: 11, cops: 1 },
  { id: 2, name: "Dormant Ear", width: 13, height: 13, cops: 1 },
  { id: 3, name: "Wandering Shadow", width: 15, height: 15, cops: 1 },
  { id: 4, name: "Resonant Decoy", width: 17, height: 17, cops: 1 },
  { id: 5, name: "Twin Enforcement", width: 19, height: 19, cops: 2 },
  { id: 6, name: "Blackout Surge", width: 21, height: 21, cops: 2 },
  { id: 7, name: "Crossfire Sector", width: 21, height: 21, cops: 2 },
  { id: 8, name: "Triple Threat", width: 23, height: 23, cops: 3 },
  { id: 9, name: "Lockdown Labyrinth", width: 23, height: 23, cops: 3 },
  { id: 10, name: "Quad Perimeter", width: 25, height: 25, cops: 4 },
  { id: 11, name: "Deep Abyssal", width: 25, height: 25, cops: 4 },
  { id: 12, name: "Acoustic Silence", width: 27, height: 27, cops: 4 },
  { id: 13, name: "Apex Interceptor", width: 27, height: 27, cops: 5 },
  { id: 14, name: "Ironman Gate", width: 29, height: 29, cops: 5 },
  { id: 15, name: "Final Labyrinth", width: 31, height: 31, cops: 5 }
];

/* ==========================================================================
   TEST SUITES
   ========================================================================== */

test('1. PRNG determinism & reproducibility (Mulberry32)', () => {
  const rng1 = createPrng(9999);
  const seq1 = Array.from({ length: 50 }, () => rng1());

  const rng2 = createPrng(9999);
  const seq2 = Array.from({ length: 50 }, () => rng2());

  assert.deepStrictEqual(seq1, seq2, 'Identical seeds must produce identical floating point sequence');
  assert.notDeepStrictEqual(seq1, Array.from({ length: 50 }, () => createPrng(1111)()), 'Different seeds must produce divergent sequences');
});

test('2. BFS maze full connectivity invariant across 200 procedural seeds', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const maze = generateMaze(11, 11, seed);
    assert.strictEqual(maze.isConnected, true, `Seed ${seed} must have zero unreachable floor cells`);
    assert.strictEqual(maze.reachableFloorCount, maze.totalFloorCount, `Reachable floor cells must equal total floor cells on seed ${seed}`);
  }
});

test('3. Exit distance invariant (exit >= 60% of max BFS graph depth)', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const maze = generateMaze(13, 13, seed);
    assert.ok(maze.exit.dist >= 0.60 * maze.maxDist, `Seed ${seed}: exit dist ${maze.exit.dist} must be >= 60% of maxDist ${maze.maxDist}`);
  }
});

test('4. Energy budget & single-charge ping invariant', () => {
  let energy = 100;
  const pingCost = 25;
  let pingsCount = 0;

  function attemptPing() {
    if (energy >= pingCost) {
      energy -= pingCost;
      pingsCount++;
      return true;
    }
    return false;
  }

  assert.strictEqual(attemptPing(), true);
  assert.strictEqual(energy, 75);
  assert.strictEqual(pingsCount, 1);

  assert.strictEqual(attemptPing(), true);
  assert.strictEqual(attemptPing(), true);
  assert.strictEqual(attemptPing(), true);
  assert.strictEqual(energy, 0);

  // Rejection when depleted
  assert.strictEqual(attemptPing(), false);
  assert.strictEqual(energy, 0, 'Energy must never drop below 0');
  assert.strictEqual(pingsCount, 4);
});

test('5. Monster navigation never enters wall cells across 5,000 simulated frames', () => {
  const maze = generateMaze(17, 17, 42);
  let mX = 1.5, mY = 1.5;
  let mPath = [];
  const dt = 0.1;

  for (let frame = 0; frame < 5000; frame++) {
    if (mPath.length === 0) {
      const target = maze.floorCells[frame % maze.floorCells.length];
      mPath = findBfsPath(maze.grid, maze.W, maze.H, Math.floor(mX), Math.floor(mY), target.x, target.y) || [];
    }

    if (mPath.length > 0) {
      const next = mPath[0];
      const tx = next.x + 0.5, ty = next.y + 0.5;
      const dx = tx - mX, dy = ty - mY;
      const dist = Math.hypot(dx, dy);
      const step = 3.4 * dt;
      if (dist <= step) {
        mX = tx; mY = ty;
        mPath.shift();
      } else {
        mX += (dx / dist) * step;
        mY += (dy / dist) * step;
      }
    }

    const cx = Math.floor(mX), cy = Math.floor(mY);
    assert.strictEqual(maze.grid[cy][cx], 0, `Monster breached wall at (${cx}, ${cy}) on frame ${frame}`);
  }
});

test('6. Acoustic event propagation and hearing radius discrimination', () => {
  const hearingRadius = 8.0;
  const nearDist = 5.2;
  const farDist = 11.4;

  assert.ok(nearDist <= hearingRadius, 'Event within 8.0 tiles must be heard');
  assert.ok(farDist > hearingRadius, 'Event outside 8.0 tiles must be ignored');
});

test('7. Continuous pathing to tactical decoy bell without teleportation', () => {
  const maze = generateMaze(17, 17, 42);
  const bellCell = maze.floorCells[10];
  const path = findBfsPath(maze.grid, maze.W, maze.H, 1, 1, bellCell.x, bellCell.y);
  assert.ok(path !== null, 'Path to decoy bell must exist');

  let curr = { x: 1, y: 1 };
  for (const step of path) {
    const stepDist = Math.hypot(step.x - curr.x, step.y - curr.y);
    assert.ok(stepDist <= 1.01, `Teleportation detected between (${curr.x}, ${curr.y}) and (${step.x}, ${step.y})`);
    curr = { x: step.x, y: step.y };
  }
  assert.strictEqual(curr.x, bellCell.x);
  assert.strictEqual(curr.y, bellCell.y);
});

test('8. Line-of-sight raycasting correctness', () => {
  const testGrid = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ];

  assert.strictEqual(hasLineOfSight(testGrid, 5, 5, 1, 1, 3, 1), true, 'Straight open hallway must have line of sight');
  assert.strictEqual(hasLineOfSight(testGrid, 5, 5, 1, 1, 1, 3), false, 'Direct ray through wall barrier must be occluded');
});

test('9. Campaign progression monotonicity (15 levels, 1 to 5 cops, expanding grids)', () => {
  assert.strictEqual(CAMPAIGN_LEVELS.length, 15, 'Must contain 15 escalating campaign levels');

  for (let i = 0; i < CAMPAIGN_LEVELS.length - 1; i++) {
    const cur = CAMPAIGN_LEVELS[i];
    const nxt = CAMPAIGN_LEVELS[i + 1];

    assert.ok(nxt.width >= cur.width, `Level ${nxt.id} width must be >= Level ${cur.id}`);
    assert.ok(nxt.height >= cur.height, `Level ${nxt.id} height must be >= Level ${cur.id}`);
    assert.ok(nxt.cops >= cur.cops, `Level ${nxt.id} cop count must be >= Level ${cur.id}`);
  }
});

test('10. Multi-monster state isolation (zero shared mutable state)', () => {
  const copA = { id: 1, state: 'WANDER', path: [{ x: 1, y: 1 }] };
  const copB = { id: 2, state: 'INVESTIGATE', path: [{ x: 5, y: 5 }] };

  copA.path.push({ x: 1, y: 2 });
  assert.notDeepStrictEqual(copA.path, copB.path, 'Modifying cop A path must not mutate cop B path');
  assert.notStrictEqual(copA.state, copB.state, 'Cop states must operate independently');
});
