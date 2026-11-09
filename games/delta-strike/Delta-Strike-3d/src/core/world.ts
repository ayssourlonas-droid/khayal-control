import { clamp, random, type Vec3 } from './math';
export const SECTOR_LENGTH = 2400;
export const MAX_SCORE = 1_000_000;
export const EXTRA_LIFE_SCORE = 10_000;
export const MAX_LIVES = 9;
const REGIONS = [
  { name: 'The river mouth', color: 0x9d805d },
  { name: 'Twin channels', color: 0x86906b },
  { name: 'Sandstone narrows', color: 0xb08060 },
  { name: 'The island chain', color: 0x718068 },
  { name: 'Enemy heartland', color: 0x986e55 },
  { name: 'The upper delta', color: 0x778775 },
];
export const difficultyAt = (sector: number) => 1 - Math.exp(-Math.max(0, sector) / 18);
export function sectorInfo(sector: number) {
  const region = REGIONS[Math.floor(sector / 5) % REGIONS.length];
  return {
    ...region,
    code: 'BRIDGE / ' + String(sector + 1).padStart(3, '0'),
    brief: 'Choose your channel. Keep fuel in reserve. Clear the next bridge.',
  };
}
export type EntityKind = 'boat' | 'helicopter' | 'jet' | 'fuel' | 'bridge';
export interface Entity {
  id: number;
  kind: EntityKind;
  pos: Vec3;
  previous: Vec3;
  originX: number;
  half: Vec3;
  health: number;
  maxHealth: number;
  cooldown: number;
  phase: number;
  active: boolean;
  travelDirection: number;
  crossing: boolean;
  flightAltitude: number;
}
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
function islandProfile(d: number) {
  const sector = Math.max(0, Math.floor(d / SECTOR_LENGTH));
  const t = (d - sector * SECTOR_LENGTH) / SECTOR_LENGTH;
  const ranges =
    sector % 3 === 2
      ? [
          [0.2, 0.43],
          [0.57, 0.77],
        ]
      : [[0.24, 0.59]];
  for (const [start, end] of ranges) {
    if (t <= start || t >= end) continue;
    const shape = smooth(start, start + 0.06, t) * (1 - smooth(end - 0.06, end, t));
    return {
      halfWidth: (24 + difficultyAt(sector) * 15 + (sector % 3) * 3) * shape,
      offset: Math.sin(d * 0.004 + sector) * 6,
      height: 40 + 8 * Math.sin(sector * 1.3) ** 2,
    };
  }
  return null;
}
export function riverAt(d: number) {
  const sector = Math.max(0, Math.floor(d / SECTOR_LENGTH)),
    t = (d - sector * SECTOR_LENGTH) / SECTOR_LENGTH;
  const difficulty = difficultyAt(sector);
  const narrow = smooth(0.64, 0.7, t) * (1 - smooth(0.81, 0.87, t));
  const fork = islandProfile(d);
  return {
    center: Math.sin(d * 0.0023) * 49 + Math.sin(d * 0.0062) * 14 + Math.sin(d * 0.00041) * 25,
    width:
      126 +
      Math.sin(d * 0.003 + 0.6) * 20 -
      narrow * (28 + difficulty * 20) +
      (fork?.halfWidth ?? 0) * 1.65,
  };
}
export function islandAt(d: number) {
  const profile = islandProfile(d);
  if (!profile || profile.halfWidth < 0.01) return null;
  return {
    center: riverAt(d).center + profile.offset,
    halfWidth: profile.halfWidth,
    height: profile.height,
  };
}
export function channelAt(d: number): Array<{ left: number; right: number }> {
  const river = riverAt(d),
    left = river.center - river.width / 2,
    right = river.center + river.width / 2,
    island = islandAt(d);
  return island
    ? [
        { left, right: island.center - island.halfWidth },
        { left: island.center + island.halfWidth, right },
      ]
    : [{ left, right }];
}
export function groundHeight(x: number, d: number) {
  const r = riverAt(d),
    bank = Math.abs(x - r.center) - r.width / 2;
  if (bank >= 0)
    return (
      8 +
      Math.min(1, bank / 34) * 31 +
      (Math.sin(d * 0.013 + x * 0.021) * 0.5 + 0.5) * Math.min(bank * 0.18, 19)
    );
  const island = islandAt(d);
  if (island) {
    const inland = island.halfWidth - Math.abs(x - island.center);
    if (inland > 0) return Math.min(island.height, inland * 3.5);
  }
  return 0;
}
export const bridgeWidth = (distance: number) => riverAt(distance).width + 6;
export function sectorEntities(sector: number, seed: number): Entity[] {
  const rng = random(seed + sector * 7919),
    difficulty = difficultyAt(sector),
    entities: Entity[] = [];
  let n = 0;
  const add = (kind: EntityKind, d: number, x: number, y: number, travelDirection = 1) => {
    const half =
      kind === 'bridge'
        ? { x: 11, y: 14, z: 6 }
        : kind === 'boat'
          ? { x: 4, y: 4, z: 9 }
          : kind === 'fuel'
            ? { x: 12, y: 12, z: 15 }
            : { x: 6, y: 4, z: 6 };
    const health = kind === 'bridge' ? 220 : kind === 'boat' ? 55 : 44;
    const pos = { x, y, z: -d };
    entities.push({
      id: sector * 1000 + n++,
      kind,
      pos,
      previous: { ...pos },
      originX: x,
      half,
      health,
      maxHealth: health,
      cooldown: 2 + rng() * 3,
      phase: rng() * Math.PI * 2,
      active: true,
      travelDirection,
      crossing: false,
      flightAltitude: y,
    });
  };
  const count = 13 + Math.floor(difficulty * 15);
  for (let i = 0; i < count; i++) {
    const d = sector * SECTOR_LENGTH + 330 + i * (1760 / count) + rng() * 30;
    const kind: EntityKind = i % 5 === 3 ? 'jet' : i % 3 === 1 ? 'helicopter' : 'boat';
    const channels = channelAt(d),
      channel = channels[i % channels.length];
    const x = channel.left + 10 + rng() * Math.max(1, channel.right - channel.left - 20);
    if (kind === 'jet') {
      const dir = i % 2 === 0 ? 1 : -1;
      const river = riverAt(d);
      add(kind, d, river.center - dir * (river.width / 2 + 90), 28 + rng() * 9, dir);
    } else add(kind, d, x, kind === 'boat' ? 3 : 22 + rng() * 9, i % 2 === 0 ? 1 : -1);
  }
  const fuelCount = sector < 12 ? 4 : 3;
  for (let i = 0; i < fuelCount; i++) {
    const d = sector * SECTOR_LENGTH + 450 + i * (1620 / (fuelCount - 1));
    const channels = channelAt(d);
    const preferred = channels[(sector + i) % channels.length];
    add('fuel', d, (preferred.left + preferred.right) / 2, 11);
    if (channels.length === 2 && sector % 4 === 0) {
      const other = channelAt(d + 45)[(sector + i + 1) % channels.length];
      if (other) add('fuel', d + 45, (other.left + other.right) / 2, 11);
    }
  }
  const bridgeD = (sector + 1) * SECTOR_LENGTH - 190;
  add('bridge', bridgeD, riverAt(bridgeD).center, 19);
  return entities;
}
