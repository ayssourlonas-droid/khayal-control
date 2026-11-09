// Particle pool. A particle is plain data a renderer can draw as-is:
//   x y vx vy   position (world px, y down) and velocity (px/s)
//   life max    seconds left and total seconds, so life / max is the fade
//   size grow   radius in px and its change per second
//   color       css colour string
//   kind        'spark' | 'smoke' | 'debris' | 'ember' | 'dust' | 'acid' | 'shard' (a sliver of glass) | 'page' (a loose sheet)
//   gravity     px/s^2 added to vy (negative rises)
//   drag        fraction of velocity lost per second (exponential)
//   additive    draw with 'lighter'
export const MAX_PARTICLES = 600;

export function makeParticle(p) {
  const life = p.life ?? 1;
  return {
    x: 0, y: 0, vx: 0, vy: 0, size: 2, grow: 0, color: '#fff', kind: 'spark',
    gravity: 0, drag: 0, additive: false, ...p, life, max: life,
  };
}

// Add a particle made from `p`; the oldest go first when the pool is full.
export function addParticle(fx, p) {
  if (fx.particles.length >= MAX_PARTICLES) fx.particles.shift();
  fx.particles.push(makeParticle(p));
}

export function stepParticles(list, dt) {
  let n = 0;
  for (const p of list) {
    p.life -= dt;
    if (p.life <= 0) continue;
    const damp = p.drag ? Math.exp(-p.drag * dt) : 1;
    p.vx *= damp;
    p.vy = p.vy * damp + p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.size = Math.max(0, p.size + p.grow * dt);
    list[n++] = p;
  }
  list.length = n;
}
