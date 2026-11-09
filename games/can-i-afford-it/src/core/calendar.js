/* ============================================================
   游戏引擎
   ============================================================ */
export const START_Y = 2026, START_M = 11;       // 2026年11月开始第一期
export const ymOf = t => { const k = START_M - 1 + (t - 1); return {y: START_Y + Math.floor(k/12), m: k%12 + 1}; };
export const ymText = t => { const {y,m} = ymOf(t); return `${y}年${m}月`; };
