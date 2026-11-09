// What a level's difficulty d (0..1, levels.js) does to the rules. fireMult multiplies
// ROLES[role].fire; formationSpeed multiplies a wave's own speed; armorBonus is extra hp for armored
// and gunner aliens.
export const scaled = (d) => ({
  bulletSpeed: 260 + 260 * d,
  fireMult: 0.6 + 1.0 * d,
  formationSpeed: 1 + 0.6 * d,
  armorBonus: d > 0.6 ? 1 : 0,
});
