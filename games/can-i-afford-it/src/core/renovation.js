/* 装修：档位和风格的价格、工期、每种房子有哪些房间可看。 */
import { RENO, STYLES, TIER_STYLES } from '../data/index.js';

export function planKeyOf(L){ if(L.plan) return L.plan; return {old:'old2', tower: L.area<75?'old2':'t3', new:'new3', offplan: L.area<110?'new3':'yang4', yangfang:'yang4', loft:'loft'}[L.type] || 't3'; }
export function styleOf(tier, style){ const ok = TIER_STYLES[tier]||['plain']; return ok.includes(style) ? style : ok[0]; }
export function renoArea(L){ return L.inner || L.area; }
export function renoCostOf(L, tier, style){ if(!RENO[tier]||tier==='none') return 0; const st = STYLES[styleOf(tier,style)]; return Math.round(renoArea(L)*RENO[tier].per*(tier==='mid'||tier==='lux'?st.mult:1)*(L.renoMult||1)/100)*100; }
export function renoMonthsOf(L, tier){ const m = RENO[tier]?.months||0; return Math.round(m*((L.renoMult||1)>1.2?1.5:1)); }
export function roomsOf(L){
  return ({flat:['横厅','主卧套房','西厨岛台'], villa:['挑空客厅','主卧','餐厨'], villa2:['挑空客厅','主卧','餐厨'], gen4:['客厅','空中花园','主卧'], loft:['复式客厅','夹层卧室','厨房'], resort:['客厅','主卧','餐厨']})[L.type] || ['客厅','卧室','厨房'];
}
export function viewOf(L){ return L.view || ({old:'neighbor', yangfang:'garden', loft:'city'})[L.type] || 'city'; }
