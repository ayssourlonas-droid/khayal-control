/* 户型平面图：按 data/plans.json 的模板画出房间和面积。 */
import { uid } from './scenes.js';
import { planKeyOf } from '../core/renovation.js';
import { esc, r1, trimZ } from '../core/util.js';
import { PLANS } from '../data/index.js';

export const PLAN_FILL = {living:'#F2E4CE', bed:'#E1E8F0', kitchen:'#F3EAC4', bath:'#D6EBEE', balcony:'#E9ECE7', garden:'#D6E7CC', hall:'#F1EFEA', study:'#E9E1EE', cloak:'#EFE6DC'};
export function floorPlanSVG(L){
  const P = PLANS[planKeyOf(L)];
  const fl = P.floors;
  const units = fl.reduce((s,f)=>s+f.rooms.reduce((a,r)=>a+r[2]*r[3],0),0);
  const k = (L.inner||L.area)*0.82/units;           // 每单位² 对应的 ㎡
  const boxes = fl.map(f=>{ const xs=f.rooms.flatMap(r=>[r[0],r[0]+r[2]]), ys=f.rooms.flatMap(r=>[r[1],r[1]+r[3]]); return {x0:Math.min(...xs), x1:Math.max(...xs), y0:Math.min(...ys), y1:Math.max(...ys)}; });
  const maxW = Math.max(...boxes.map(b=>b.x1-b.x0)), maxH = Math.max(...boxes.map(b=>b.y1-b.y0));
  const cols = fl.length===1 ? 1 : (maxW/maxH < 0.7 ? fl.length : 2); const rows = Math.ceil(fl.length/cols);
  const W = 480, gap = 16, pad = 14, top = fl.length>1 ? 22 : 8;
  const cellW = (W - pad*2 - gap*(cols-1))/cols;
  const s = Math.min(cellW/maxW, (fl.length===1? 300 : 260)/maxH);
  const cellH = maxH*s;
  const H = pad + rows*(cellH+top) + (rows-1)*gap + pad + 6;
  const hatch = 'hatch'+uid();
  let out = `<svg viewBox="0 0 ${W} ${r1(H)}" role="img" aria-label="${esc(L.name)}户型图" xmlns="http://www.w3.org/2000/svg" style="background:#FBFAF6"><defs><pattern id="${hatch}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#9DBF8E" stroke-width="1.2"/></pattern></defs><rect width="${W}" height="${r1(H)}" fill="#FBFAF6"/>`;
  fl.forEach((f,fi)=>{
    const b = boxes[fi]; const c = fi%cols, rr = Math.floor(fi/cols);
    const ox = pad + c*(cellW+gap) + (cellW-(b.x1-b.x0)*s)/2 - b.x0*s, oy = pad + rr*(cellH+top+gap) + top - b.y0*s;
    if(f.name) out += `<text x="${r1(pad + c*(cellW+gap) + cellW/2)}" y="${r1(pad + rr*(cellH+top+gap) + 12)}" text-anchor="middle" font-size="12" font-weight="700" fill="#3A4149">${f.name}</text>`;
    f.rooms.forEach(([x,y,w,h,n,kd])=>{
      const X=ox+x*s, Y=oy+y*s, Ww=w*s, Hh=h*s;
      out += `<rect x="${r1(X)}" y="${r1(Y)}" width="${r1(Ww)}" height="${r1(Hh)}" fill="${PLAN_FILL[kd]||'#EEE'}" stroke="#2E3640" stroke-width="2.4"/>`;
      if(kd==='garden') out += `<rect x="${r1(X+2)}" y="${r1(Y+2)}" width="${r1(Ww-4)}" height="${r1(Hh-4)}" fill="url(#${hatch})" opacity=".55"/>`;
      if(kd==='bed') out += `<rect x="${r1(X+Ww*0.25)}" y="${r1(Y+Hh*0.18)}" width="${r1(Ww*0.5)}" height="${r1(Math.min(Hh*0.5, Ww*0.6))}" rx="2" fill="none" stroke="#9AA6B2" stroke-width="1"/>`;
      if(kd==='bath') out += `<circle cx="${r1(X+Ww*0.7)}" cy="${r1(Y+Hh*0.7)}" r="${r1(Math.min(Ww,Hh)*0.12)}" fill="none" stroke="#8CB3BA" stroke-width="1"/>`;
      const area = w*h*k; const small = Ww<54 || Hh<34;
      let nm = n.length>6 && Ww<130 ? n.replace(/（.*）/,'') : n;
      let fs = Math.min(small?9.5:11.5, (Ww-6)/nm.length); if(fs<7.5){ nm = nm.slice(0, Math.max(1, Math.floor((Ww-6)/7.5))); fs = 7.5; }
      out += `<text x="${r1(X+Ww/2)}" y="${r1(Y+Hh/2-(small?0:2))}" text-anchor="middle" font-size="${r1(fs)}" font-weight="600" fill="#26303A">${esc(nm)}</text>`;
      if(!small) out += `<text x="${r1(X+Ww/2)}" y="${r1(Y+Hh/2+12)}" text-anchor="middle" font-size="10" fill="#6B7580" font-family="IBM Plex Mono,monospace">${trimZ(area.toFixed(1))}㎡</text>`;
    });
    // 外窗：贴着外边线的房间画窗
    f.rooms.forEach(([x,y,w,h,n,kd])=>{
      if(!['living','bed','study','kitchen'].includes(kd)) return;
      const X=ox+x*s, Y=oy+y*s, Ww=w*s, Hh=h*s;
      if(Math.abs(y-b.y0)<1e-6) out += `<rect x="${r1(X+Ww*0.25)}" y="${r1(Y-2.2)}" width="${r1(Ww*0.5)}" height="4.4" fill="#FBFAF6" stroke="#5C8AA8" stroke-width="1"/>`;
      if(Math.abs(y+h-b.y1)<1e-6) out += `<rect x="${r1(X+Ww*0.25)}" y="${r1(Y+Hh-2.2)}" width="${r1(Ww*0.5)}" height="4.4" fill="#FBFAF6" stroke="#5C8AA8" stroke-width="1"/>`;
    });
  });
  out += `<g transform="translate(${W-24} ${r1(H-24)})"><circle r="9" fill="none" stroke="#8A939C"/><path d="M0 -7 L3 2 L0 0 L-3 2 Z" fill="#BC3226"/><text y="-11" text-anchor="middle" font-size="8" fill="#6B7580">N</text></g>`;
  return out + '</svg>';
}
