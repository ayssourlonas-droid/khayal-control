import { clamp, damp, direction, distance, segmentBox, type Vec3 } from './math';
import {
  bridgeWidth,
  groundHeight,
  riverAt,
  sectorEntities,
  SECTOR_LENGTH,
  MAX_SCORE,
  EXTRA_LIFE_SCORE,
  MAX_LIVES,
  difficultyAt,
  channelAt,
  type Entity,
} from './world';
export interface InputFrame {
  roll: number;
  pitch: number;
  throttle: number;
  fire: boolean;
  missile: boolean;
  boost: boolean;
}
export const NEUTRAL: InputFrame = {
  roll: 0,
  pitch: 0,
  throttle: 0,
  fire: false,
  missile: false,
  boost: false,
};
export type Phase = 'title' | 'playing' | 'paused' | 'crashed' | 'lost' | 'won';
export interface Player {
  pos: Vec3;
  previous: Vec3;
  speed: number;
  yaw: number;
  pitch: number;
  roll: number;
  health: number;
  fuel: number;
  lives: number;
  missiles: number;
  boost: number;
  invulnerable: number;
}
export interface Bullet {
  id: number;
  pos: Vec3;
  previous: Vec3;
  velocity: Vec3;
  life: number;
  enemy: boolean;
  missile: boolean;
  target: number | null;
}
export interface GameEvent {
  kind: 'shot' | 'missile' | 'explosion' | 'hit' | 'refuel' | 'checkpoint' | 'warning';
  pos: Vec3;
  size: number;
}
export interface FlightSave {
  version: 1;
  seed: number;
  sector: number;
  score: number;
  kills: number;
  elapsed: number;
  lives: number;
  fuel: number;
  health: number;
  missiles: number;
  boost: number;
  nextLifeScore: number;
}
export function isFlightSave(value: unknown): value is FlightSave {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const range = (key: string, min: number, max: number, integer = false) =>
    typeof v[key] === 'number' &&
    Number.isFinite(v[key]) &&
    Number(v[key]) >= min &&
    Number(v[key]) <= max &&
    (!integer || Number.isInteger(v[key]));
  return (
    v.version === 1 &&
    range('seed', 0, 0xffffffff, true) &&
    range('sector', 0, 100000, true) &&
    range('score', 0, MAX_SCORE - 1, true) &&
    range('kills', 0, 10000000, true) &&
    range('elapsed', 0, 1e8) &&
    range('lives', 1, MAX_LIVES, true) &&
    range('fuel', 0.001, 100) &&
    range('health', 1, 100) &&
    range('missiles', 0, 4, true) &&
    range('boost', 0, 100) &&
    range('nextLifeScore', EXTRA_LIFE_SCORE, MAX_SCORE + EXTRA_LIFE_SCORE, true)
  );
}
export class Simulation {
  phase: Phase = 'title';
  player: Player;
  entities: Entity[] = [];
  bullets: Bullet[] = [];
  events: GameEvent[] = [];
  sector = 0;
  score = 0;
  kills = 0;
  time = 0;
  elapsed = 0;
  checkpointScore = 0;
  checkpointKills = 0;
  bridgeDestroyed = false;
  refueling = false;
  message = '';
  lockId: number | null = null;
  seed: number;
  private fireCooldown = 0;
  private missileCooldown = 0;
  private nextId = 1;
  private refuelSound = 0;
  private nextLifeScore = EXTRA_LIFE_SCORE;
  private savedCheckpoint: FlightSave | null = null;
  constructor(seed = 0xd517a) {
    this.seed = seed;
    this.player = this.freshPlayer(3);
  }
  private freshPlayer(lives: number): Player {
    const d = this.sector * SECTOR_LENGTH + 65;
    const pos = { x: riverAt(d).center, y: 28, z: -d };
    return {
      pos,
      previous: { ...pos },
      speed: 64,
      yaw: 0,
      pitch: 0,
      roll: 0,
      health: 100,
      fuel: 100,
      lives,
      missiles: 4,
      boost: 100,
      invulnerable: 2,
    };
  }
  start() {
    this.sector = 0;
    this.score = 0;
    this.kills = 0;
    this.checkpointScore = 0;
    this.checkpointKills = 0;
    this.elapsed = 0;
    this.time = 0;
    this.nextLifeScore = EXTRA_LIFE_SCORE;
    this.loadCheckpoint(3);
    this.savedCheckpoint = this.captureCheckpoint();
  }
  private loadCheckpoint(lives: number) {
    this.time = 0;
    this.player = this.freshPlayer(lives);
    this.entities = sectorEntities(this.sector, this.seed);
    this.bullets = [];
    this.events = [];
    this.bridgeDestroyed = false;
    this.fireCooldown = 0;
    this.missileCooldown = 0;
    this.refuelSound = 0;
    this.lockId = null;
    this.refueling = false;
    this.score = this.checkpointScore;
    this.kills = this.checkpointKills;
    this.message = '';
    this.phase = 'playing';
  }
  pause() {
    if (this.phase === 'playing') this.phase = 'paused';
  }
  resume() {
    if (this.phase === 'paused') this.phase = 'playing';
  }
  retry() {
    if (this.phase === 'crashed') {
      this.loadCheckpoint(this.player.lives);
      this.savedCheckpoint = this.captureCheckpoint();
    }
  }
  private captureCheckpoint(): FlightSave {
    const p = this.player;
    return {
      version: 1,
      seed: this.seed,
      sector: this.sector,
      score: this.checkpointScore,
      kills: this.checkpointKills,
      elapsed: this.elapsed,
      lives: p.lives,
      fuel: p.fuel,
      health: p.health,
      missiles: p.missiles,
      boost: p.boost,
      nextLifeScore: this.nextLifeScore,
    };
  }
  checkpoint(): FlightSave | null {
    if (!this.savedCheckpoint || this.phase === 'won' || this.phase === 'lost') return null;
    const replacement = this.phase === 'crashed' ? this.freshPlayer(this.player.lives) : null;
    return {
      ...this.savedCheckpoint,
      ...(replacement
        ? {
            fuel: replacement.fuel,
            health: replacement.health,
            missiles: replacement.missiles,
            boost: replacement.boost,
          }
        : {}),
      lives: this.player.lives,
      elapsed: this.elapsed,
      nextLifeScore: this.nextLifeScore,
    };
  }
  restore(save: unknown) {
    if (!isFlightSave(save)) return false;
    this.seed = save.seed;
    this.sector = save.sector;
    this.checkpointScore = save.score;
    this.checkpointKills = save.kills;
    this.elapsed = save.elapsed;
    this.nextLifeScore = save.nextLifeScore;
    this.loadCheckpoint(save.lives);
    Object.assign(this.player, {
      fuel: save.fuel,
      health: save.health,
      missiles: save.missiles,
      boost: save.boost,
    });
    this.savedCheckpoint = { ...save };
    return true;
  }
  awardScore(points: number) {
    if (this.phase !== 'playing' || !Number.isFinite(points) || points <= 0) return;
    this.score = Math.min(MAX_SCORE, this.score + Math.floor(points));
    while (this.score >= this.nextLifeScore) {
      this.player.lives = Math.min(MAX_LIVES, this.player.lives + 1);
      this.nextLifeScore += EXTRA_LIFE_SCORE;
    }
    if (this.score === MAX_SCORE) {
      this.phase = 'won';
      this.message = 'One million points. You reached the end of the river.';
      this.events.push({ kind: 'checkpoint', pos: { ...this.player.pos }, size: 1 });
    }
  }
  damagePlayer(amount: number, cause = 'Aircraft destroyed') {
    if (this.phase !== 'playing') return;
    this.player.health = Math.max(0, this.player.health - amount);
    this.events.push({ kind: 'hit', pos: { ...this.player.pos }, size: 1 });
    if (this.player.health === 0) {
      this.player.lives--;
      this.phase = this.player.lives > 0 ? 'crashed' : 'lost';
      this.message = cause;
      this.events.push({ kind: 'explosion', pos: { ...this.player.pos }, size: 16 });
    }
  }
  private target() {
    const p = this.player;
    const forward = direction(p.yaw, p.pitch);
    let best = 0.975;
    let chosen: Entity | undefined;
    for (const e of this.entities) {
      if (!e.active || e.kind === 'fuel') continue;
      const dx = e.pos.x - p.pos.x,
        dy = e.pos.y - p.pos.y,
        dz = e.pos.z - p.pos.z,
        d = Math.hypot(dx, dy, dz);
      if (d < 15 || d > 420) continue;
      const dot = (dx * forward.x + dy * forward.y + dz * forward.z) / d;
      if (dot > best) {
        best = dot;
        chosen = e;
      }
    }
    return chosen;
  }
  step(dt: number, input: InputFrame) {
    if (this.phase !== 'playing') return;
    this.time += dt;
    this.elapsed += dt;
    this.events = [];
    this.refueling = false;
    const p = this.player;
    p.previous = { ...p.pos };
    p.invulnerable = Math.max(0, p.invulnerable - dt);
    p.roll = damp(p.roll, clamp(input.roll, -1, 1) * 0.95, 5, dt);
    p.yaw = clamp(p.yaw + Math.sin(p.roll) * 0.68 * dt, -0.85, 0.85);
    if (Math.abs(input.roll) < 0.06) p.yaw = damp(p.yaw, 0, 0.4, dt);
    p.pitch = damp(p.pitch, clamp(input.pitch, -1, 1) * 0.5, 3.5, dt);
    const boosting = input.boost && p.boost > 0;
    p.speed = damp(p.speed, boosting ? 108 : 64 + clamp(input.throttle, -1, 1) * 23, 2.2, dt);
    p.boost = clamp(p.boost + (boosting ? -30 : 17) * dt, 0, 100);
    const forward = direction(p.yaw, p.pitch);
    p.pos.x += forward.x * p.speed * dt;
    p.pos.y = Math.min(96, p.pos.y + forward.y * p.speed * dt);
    p.pos.z += forward.z * p.speed * dt;
    p.fuel = Math.max(0, p.fuel - dt * (boosting ? 2.5 : 0.82));
    const ground = groundHeight(p.pos.x, -p.pos.z);
    if (p.pos.y < ground + 1.6) {
      this.damagePlayer(200, ground === 0 ? 'Impact with the river' : 'Impact with canyon terrain');
      return;
    }
    if (p.fuel === 0) {
      this.damagePlayer(200, 'Fuel exhausted');
      return;
    }
    const target = this.target();
    this.lockId = target?.id ?? null;
    this.fireCooldown -= dt;
    this.missileCooldown -= dt;
    this.refuelSound -= dt;
    if (input.fire && this.fireCooldown <= 0) {
      this.fireCooldown = 0.105;
      this.shoot(false, target);
    }
    if (input.missile && this.missileCooldown <= 0 && p.missiles > 0) {
      this.missileCooldown = 0.7;
      p.missiles--;
      this.shoot(true, target);
    }
    for (const e of this.entities) {
      if (!e.active) continue;
      e.previous = { ...e.pos };
      const dist = distance(p.pos, e.pos);
      if (e.kind === 'fuel') {
        if (Math.abs(p.pos.x - e.pos.x) < 15 && Math.abs(p.pos.z - e.pos.z) < 20 && p.pos.y < 23) {
          p.fuel = clamp(p.fuel + 46 * dt, 0, 100);
          p.health = clamp(p.health + 7 * dt, 0, 100);
          this.refueling = true;
          if (this.refuelSound <= 0) {
            this.events.push({ kind: 'refuel', pos: { ...p.pos }, size: 1 });
            this.refuelSound = 0.25;
          }
        }
        continue;
      }
      const difficulty = difficultyAt(this.sector);
      if (e.kind === 'helicopter' || e.kind === 'boat') {
        const channel = channelAt(-e.pos.z).find(
          (c) => e.originX >= c.left && e.originX <= c.right,
        );
        if (channel)
          e.pos.x = clamp(
            e.originX +
              Math.sin(this.time * (e.kind === 'boat' ? 0.5 : 0.8) + e.phase) *
                (e.kind === 'boat' ? 4 + difficulty * 5 : 10),
            channel.left + 7,
            channel.right - 7,
          );
      }
      if (e.kind === 'jet') {
        const speed = 140 + difficulty * 65,
          river = riverAt(-e.pos.z);
        const launchDistance = ((river.width / 2 + 90) / speed) * p.speed;
        if (p.pos.z - e.pos.z < launchDistance && p.pos.z - e.pos.z > 0) e.crossing = true;
        if (e.crossing) {
          e.pos.x += e.travelDirection * speed * dt;
          if ((e.pos.x - river.center) * e.travelDirection > river.width / 2 + 170)
            e.active = false;
        }
        e.pos.y = Math.max(e.flightAltitude, groundHeight(e.pos.x, -e.pos.z) + 7);
      }
      e.cooldown -= dt;
      if (e.kind !== 'jet' && e.pos.z < p.pos.z && dist < 290 && dist > 35 && e.cooldown <= 0) {
        e.cooldown = 3.5 - difficulty * 1.7;
        // Aim at an intercept using the velocity observed this step. Projectiles
        // keep this direction after launch, so changing course still dodges them.
        const velocity = {
          x: (p.pos.x - p.previous.x) / dt,
          y: (p.pos.y - p.previous.y) / dt,
          z: (p.pos.z - p.previous.z) / dt,
        };
        const offset = { x: p.pos.x - e.pos.x, y: p.pos.y - e.pos.y, z: p.pos.z - e.pos.z };
        const a = velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2 - 100 ** 2;
        const b = 2 * (offset.x * velocity.x + offset.y * velocity.y + offset.z * velocity.z);
        const c = offset.x ** 2 + offset.y ** 2 + offset.z ** 2;
        const discriminant = b * b - 4 * a * c;
        const times =
          Math.abs(a) < 0.001
            ? Math.abs(b) > 0.001
              ? [-c / b]
              : []
            : discriminant >= 0
              ? [(-b - Math.sqrt(discriminant)) / (2 * a), (-b + Math.sqrt(discriminant)) / (2 * a)]
              : [];
        const intercept = Math.min(...times.filter((t) => t > 0 && t < 4));
        const lead = Number.isFinite(intercept) ? intercept : 0;
        const target = {
          x: offset.x + velocity.x * lead,
          y: offset.y + velocity.y * lead,
          z: offset.z + velocity.z * lead,
        };
        const length = Math.hypot(target.x, target.y, target.z) || 1;
        const aim = { x: target.x / length, y: target.y / length, z: target.z / length };
        this.bullets.push({
          id: this.nextId++,
          pos: { ...e.pos },
          previous: { ...e.pos },
          velocity: { x: aim.x * 100, y: aim.y * 100, z: aim.z * 100 },
          life: 4,
          enemy: true,
          missile: false,
          target: null,
        });
      }
      if (e.kind === 'bridge') {
        const span = bridgeWidth(-e.pos.z);
        const deck = { x: e.pos.x, y: 11.5, z: e.pos.z };
        if (segmentBox(p.previous, p.pos, deck, { x: span / 2 + 3, y: 2.5, z: 8 }) !== null) {
          this.damagePlayer(200, 'Impact with the bridge deck');
          return;
        }
        for (const offset of [-45, -25, 0, 25, 45]) {
          for (const zOffset of [-3.5, 3.5])
            if (
              segmentBox(
                p.previous,
                p.pos,
                { x: e.pos.x + (offset * span) / 110, y: 5.7, z: e.pos.z + zOffset },
                { x: (1.3 * span) / 110 + 3, y: 6.9, z: 4.4 },
              ) !== null
            ) {
              this.damagePlayer(200, 'Impact with a bridge support');
              return;
            }
        }
      }
      if (
        p.invulnerable === 0 &&
        segmentBox(
          {
            x: p.previous.x - e.previous.x,
            y: p.previous.y - e.previous.y,
            z: p.previous.z - e.previous.z,
          },
          { x: p.pos.x - e.pos.x, y: p.pos.y - e.pos.y, z: p.pos.z - e.pos.z },
          { x: 0, y: 0, z: 0 },
          {
            x: e.half.x + 3,
            y: e.half.y + 1.2,
            z: e.half.z + 3,
          },
        ) !== null
      ) {
        this.damagePlayer(200, 'Collision with an enemy');
        return;
      }
    }
    this.stepBullets(dt);
    if (this.phase !== 'playing') return;
    const end = (this.sector + 1) * SECTOR_LENGTH;
    if (-p.pos.z >= end) {
      if (!this.bridgeDestroyed) {
        this.damagePlayer(200, 'Bridge control tower missed. Use missiles on the marked target.');
        return;
      }
      this.awardScore(500);
      if (this.phase !== 'playing') return;
      this.sector++;
      this.checkpointScore = this.score;
      this.checkpointKills = this.kills;
      // Advance continuously. Fuel and damage persist; only a lost aircraft grants a fresh tank.
      this.entities = sectorEntities(this.sector, this.seed);
      this.bullets = [];
      this.time = 0;
      this.bridgeDestroyed = false;
      this.lockId = null;
      this.player.missiles = Math.min(4, this.player.missiles + 2);
      this.savedCheckpoint = this.captureCheckpoint();
      this.events.push({ kind: 'checkpoint', pos: { ...this.player.pos }, size: 1 });
    }
  }
  private shoot(missile: boolean, target?: Entity) {
    const p = this.player;
    let f = direction(p.yaw, p.pitch);
    if (target) {
      const d = distance(target.pos, p.pos);
      f = {
        x: (target.pos.x - p.pos.x) / d,
        y: (target.pos.y - p.pos.y) / d,
        z: (target.pos.z - p.pos.z) / d,
      };
    }
    const pos = { x: p.pos.x + f.x * 8, y: p.pos.y + f.y * 8, z: p.pos.z + f.z * 8 };
    this.bullets.push({
      id: this.nextId++,
      pos,
      previous: { ...pos },
      velocity: {
        x: f.x * (missile ? 165 : 380),
        y: f.y * (missile ? 165 : 380),
        z: f.z * (missile ? 165 : 380),
      },
      life: missile ? 4 : 1.8,
      enemy: false,
      missile,
      target: missile ? (target?.id ?? null) : null,
    });
    this.events.push({ kind: missile ? 'missile' : 'shot', pos: { ...pos }, size: 1 });
  }
  private stepBullets(dt: number) {
    for (const b of this.bullets) {
      b.previous = { ...b.pos };
      b.life -= dt;
      if (b.missile && b.target !== null) {
        const e = this.entities.find((e) => e.id === b.target && e.active);
        if (e) {
          const d = distance(e.pos, b.pos);
          if (d > 0.01) {
            b.velocity.x = damp(b.velocity.x, ((e.pos.x - b.pos.x) / d) * 185, 6, dt);
            b.velocity.y = damp(b.velocity.y, ((e.pos.y - b.pos.y) / d) * 185, 6, dt);
            b.velocity.z = damp(b.velocity.z, ((e.pos.z - b.pos.z) / d) * 185, 6, dt);
          }
        }
      }
      b.pos.x += b.velocity.x * dt;
      b.pos.y += b.velocity.y * dt;
      b.pos.z += b.velocity.z * dt;
      if (b.enemy) {
        if (
          this.player.invulnerable === 0 &&
          segmentBox(
            {
              x: b.previous.x - this.player.previous.x,
              y: b.previous.y - this.player.previous.y,
              z: b.previous.z - this.player.previous.z,
            },
            {
              x: b.pos.x - this.player.pos.x,
              y: b.pos.y - this.player.pos.y,
              z: b.pos.z - this.player.pos.z,
            },
            { x: 0, y: 0, z: 0 },
            { x: 3.5, y: 2, z: 4.5 },
          ) !== null
        ) {
          b.life = 0;
          this.damagePlayer(17, 'Enemy fire');
          this.player.invulnerable = 0.35;
        }
        continue;
      }
      let closest: Entity | undefined;
      let first = Infinity;
      for (const e of this.entities) {
        if (!e.active) continue;
        const t = segmentBox(
          {
            x: b.previous.x - e.previous.x,
            y: b.previous.y - e.previous.y,
            z: b.previous.z - e.previous.z,
          },
          { x: b.pos.x - e.pos.x, y: b.pos.y - e.pos.y, z: b.pos.z - e.pos.z },
          { x: 0, y: 0, z: 0 },
          e.half,
        );
        if (t !== null && t < first) {
          first = t;
          closest = e;
        }
      }
      if (closest) {
        b.life = 0;
        closest.health -= b.missile ? 125 : 22;
        this.events.push({
          kind: 'explosion',
          pos: { ...b.pos },
          size: closest.health <= 0 ? (closest.kind === 'bridge' ? 25 : 11) : 2,
        });
        if (closest.health <= 0) {
          closest.active = false;
          this.kills++;
          this.awardScore(
            closest.kind === 'bridge'
              ? 1000
              : closest.kind === 'jet'
                ? 200
                : closest.kind === 'fuel'
                  ? 50
                  : 100,
          );
          if (closest.kind === 'bridge') this.bridgeDestroyed = true;
        }
      }
    }
    this.bullets = this.bullets.filter((b) => b.life > 0 && b.pos.y > 0).slice(-160);
  }
}
