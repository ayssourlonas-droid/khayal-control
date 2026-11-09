// Each level's par time in seconds (R66): twice what the autopilot takes to clear it when it is never
// hit, rounded up to 5 s. The round's speed multiplier is measured against it (scoring.js speedOf).
// scripts/pars.mjs writes this table; test/core/pars.test.js checks that it is current.
export const PARS = {
  'w1-1': 30, 'w1-2': 65, 'w1-3': 80, 'w1-4': 100, 'w1-5': 65,
  'w2-1': 40, 'w2-2': 40, 'w2-3': 60, 'w2-4': 50, 'w2-5': 100,
  'w3-1': 35, 'w3-2': 70, 'w3-3': 60, 'w3-4': 95, 'w3-5': 70,
  'w4-1': 60, 'w4-2': 65, 'w4-3': 65, 'w4-4': 145, 'w4-5': 60,
  'w5-1': 30, 'w5-2': 65, 'w5-3': 65, 'w5-4': 75, 'w5-5': 60,
  'w6-1': 40, 'w6-2': 60, 'w6-3': 60, 'w6-4': 45, 'w6-5': 75,
  'w7-1': 60, 'w7-2': 75, 'w7-3': 105, 'w7-4': 70, 'w7-5': 65,
  'w8-1': 35, 'w8-2': 60, 'w8-3': 55, 'w8-4': 90, 'w8-5': 100,
  'w9-1': 50, 'w9-2': 60, 'w9-3': 60, 'w9-4': 35, 'w9-5': 80,
  'w10-1': 50, 'w10-2': 50, 'w10-3': 55, 'w10-4': 65, 'w10-5': 85,
  'w11-1': 55, 'w11-2': 105, 'w11-3': 95, 'w11-4': 110, 'w11-5': 90,
  'w12-1': 40, 'w12-2': 75, 'w12-3': 70, 'w12-4': 50, 'w12-5': 90,
  'w13-1': 40, 'w13-2': 70, 'w13-3': 45, 'w13-4': 75, 'w13-5': 60,
  'w14-1': 40, 'w14-2': 75, 'w14-3': 55, 'w14-4': 60, 'w14-5': 105,
  'w15-1': 35, 'w15-2': 105, 'w15-3': 50, 'w15-4': 85, 'w15-5': 90,
  'w16-1': 45, 'w16-2': 90, 'w16-3': 70, 'w16-4': 60, 'w16-5': 80,
  'w17-1': 35, 'w17-2': 85, 'w17-3': 70, 'w17-4': 85, 'w17-5': 70,
  'w18-1': 65, 'w18-2': 55, 'w18-3': 90, 'w18-4': 55, 'w18-5': 85,
};
export const DEFAULT_PAR = 60; // s, for a level with no entry (the tests' own levels)
export const parOf = (level) => PARS[level.id] ?? DEFAULT_PAR;
