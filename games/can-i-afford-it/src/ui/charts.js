/* 图表：折线图和堆叠柱状图，按容器宽度绘制，支持悬停查看数值。 */
import { clamp, esc, r1, wan, yuan } from '../core/util.js';
import { $$ } from './dom.js';
/* ============================================================
   图表（SVG，按容器实际宽度绘制，悬停显示数值）
   ============================================================ */
export const charts = { list: [] };
export function niceStep(range, count){ const raw = range/count; const p = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw/p; return (f<1.5?1:f<3?2:f<7?5:10)*p; }
export function lineChart(el, opt){
  if(!el) return;
  const draw = ()=>{
    const {series, band, xLabel, height=260, compact, xTick} = opt; const fmt = opt.fmt || wan;
    const W = Math.max(280, el.clientWidth||600), H = height;
    const m = {l:compact?46:58, r:compact?10:14, t:14, b:compact?22:30};
    const n = series[0].data.length; if(n<2){ el.innerHTML=''; return; }
    const vals = series.flatMap(s=>s.data).concat(band?band.flatMap(b=>[b.lo,b.hi]):[]).concat(compact||opt.zero===false?[]:[0]);
    let lo = Math.min(...vals), hi = Math.max(...vals);
    const step = niceStep((hi-lo)||1, compact?3:5); lo = Math.floor(lo/step)*step; hi = Math.ceil(hi/step)*step; if(hi===lo) hi = lo+step;
    const x = i => m.l + i/(n-1)*(W-m.l-m.r), y = v => m.t + (hi-v)/(hi-lo)*(H-m.t-m.b);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${opt.label || series.map(s=>s.name).join(' 与 ')+'的净资产走势'}">`;
    s += '<g class="grid">'; for(let v=lo; v<=hi+step/2; v+=step){ s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${r1(y(v))}" y2="${r1(y(v))}" ${Math.abs(v)<step/1e6?'style="stroke:var(--ink-2);stroke-opacity:.6"':''}/>`; } s+='</g>';
    s += '<g class="axis">'; for(let v=lo; v<=hi+step/2; v+=step){ s+=`<text x="${m.l-8}" y="${r1(y(v))+4}" text-anchor="end">${fmt(Math.abs(v)<step/1e6?0:v)}</text>`; }
    const ticks = []; const want = compact?3:Math.min(6, Math.floor((W-m.l-m.r)/90));
    if(xTick){ for(let i=0;i<n;i++) if(xTick(i)) ticks.push(i); } else { for(let k=0;k<=want;k++) ticks.push(Math.round(k*(n-1)/want)); }
    const tickSet = [...new Set(ticks)];
    tickSet.forEach(i=>{ s+=`<text x="${r1(x(i))}" y="${H-8}" text-anchor="${i===0?'start':i===n-1?'end':'middle'}">${esc(xLabel(i,true))}</text>`; });
    s += '</g>';
    if(band){ const c = series[1].color; let d = band.map((b,i)=>`${i?'L':'M'}${r1(x(i))} ${r1(y(b.hi))}`).join(' '); d += ' ' + band.slice().reverse().map((b,j)=>`L${r1(x(n-1-j))} ${r1(y(b.lo))}`).join(' ') + ' Z'; s+=`<path d="${d}" fill="${c}" fill-opacity=".14" stroke="none"/>`; }
    series.forEach(se=>{ const d = se.data.map((v,i)=>`${i?'L':'M'}${r1(x(i))} ${r1(y(v))}`).join(' '); s+=`<path d="${d}" fill="none" stroke="${se.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" ${se.dash?'stroke-dasharray="5 4"':''}/>`; const lv=se.data[n-1]; s+=`<circle cx="${r1(x(n-1))}" cy="${r1(y(lv))}" r="4" fill="${se.color}" stroke="var(--paper)" stroke-width="2"/>`; });
    if(!compact && opt.endLabels!==false){ // 末端直接标注
      const ends = series.map(se=>({se, yy:y(se.data[n-1])})).sort((a,b)=>a.yy-b.yy);
      for(let k=1;k<ends.length;k++) if(ends[k].yy-ends[k-1].yy<16) ends[k].yy = ends[k-1].yy+16;
      ends.forEach(e=>{ s+=`<text class="lbl" x="${r1(x(n-1)-8)}" y="${r1(e.yy-8)}" text-anchor="end">${esc(e.se.name)} ${fmt(e.se.data[n-1])}</text>`; });
    }
    s += `<line class="xh" x1="0" x2="0" y1="${m.t}" y2="${H-m.b}" stroke="var(--ink-2)" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>`;
    series.forEach((se,k)=>{ s+=`<circle class="hd hd${k}" r="4.5" fill="${se.color}" stroke="var(--paper)" stroke-width="2" visibility="hidden"/>`; });
    s += `<rect x="${m.l}" y="${m.t}" width="${W-m.l-m.r}" height="${H-m.t-m.b}" fill="transparent" class="hit"/></svg><div class="tip" hidden></div>`;
    el.innerHTML = s;
    const svg = el.querySelector('svg'), tip = el.querySelector('.tip'), xh = el.querySelector('.xh');
    const move = ev=>{
      const rect = svg.getBoundingClientRect(); const px = (ev.clientX-rect.left)*(W/rect.width);
      const i = clamp(Math.round((px-m.l)/(W-m.l-m.r)*(n-1)),0,n-1);
      xh.setAttribute('x1',x(i)); xh.setAttribute('x2',x(i)); xh.setAttribute('visibility','visible');
      series.forEach((se,k)=>{ const c=el.querySelector('.hd'+k); c.setAttribute('cx',x(i)); c.setAttribute('cy',y(se.data[i])); c.setAttribute('visibility','visible'); });
      tip.hidden=false;
      tip.innerHTML = `<div class="small" style="margin-bottom:4px"><b>${esc(xLabel(i,false))}</b></div>` + series.map(se=>`<div class="tr"><span><span class="sw" style="background:${se.color}"></span> ${esc(se.name)}</span><span>${fmt(se.data[i])}</span></div>`).join('') + (series.length===2?`<div class="tr muted"><span>差额</span><span>${fmt(series[0].data[i]-series[1].data[i])}</span></div>`:'') + (band?`<div class="tr muted"><span>投资中间一半</span><span>${wan(band[i].lo)}~${wan(band[i].hi)}</span></div>`:'');
      const top = Math.min(...series.map(se=>y(se.data[i])));
      const left = clamp(x(i)*(rect.width/W), 80, rect.width-80);
      tip.style.left = left+'px'; tip.style.top = Math.max(0, top*(rect.height/H)-10)+'px';
    };
    const leave = ()=>{ tip.hidden=true; xh.setAttribute('visibility','hidden'); $$('.hd',el).forEach(c=>c.setAttribute('visibility','hidden')); };
    svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move); svg.addEventListener('pointerleave', leave);
  };
  draw(); charts.list.push(draw);
}
export function barChart(el, opt){
  if(!el) return;
  const draw = ()=>{
    const {rows, height=220} = opt;
    const W = Math.max(280, el.clientWidth||600), H = height, m={l:52,r:8,t:12,b:26};
    const n = rows.length; const hi0 = Math.max(...rows.map(r=>r.a+r.b),1); const step = niceStep(hi0,4); const hi = Math.ceil(hi0/step)*step;
    const bw = (W-m.l-m.r)/n; const y = v => m.t + (1-v/hi)*(H-m.t-m.b);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="每年还款中本金和利息的构成">`;
    s+='<g class="grid">'; for(let v=0; v<=hi+step/2; v+=step) s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${r1(y(v))}" y2="${r1(y(v))}"/>`; s+='</g><g class="axis">';
    for(let v=0; v<=hi+step/2; v+=step) s+=`<text x="${m.l-8}" y="${r1(y(v))+4}" text-anchor="end">${wan(v)}</text>`;
    rows.forEach((r,i)=>{ const yr=i+1; if(yr===1 || (yr%5===0 && (n-yr>=2 || yr===n)) || (yr===n && n%5!==0 && n-Math.floor(n/5)*5>=2)) s+=`<text x="${r1(m.l+bw*(i+0.5))}" y="${H-8}" text-anchor="middle">${yr}</text>`; });
    s+=`<text x="${W-m.r}" y="${m.t+2}" text-anchor="end">单位：年</text>`;
    s+='</g>';
    rows.forEach((r,i)=>{
      const w = Math.max(2, bw-2), x0 = m.l + i*bw + 1;
      const yA = y(r.a), yB = y(r.a+r.b);
      s+=`<rect x="${r1(x0)}" y="${r1(yA)}" width="${r1(w)}" height="${r1(Math.max(0,H-m.b-yA))}" fill="var(--s-inv)"/>`;
      if(r.b>0) s+=`<rect x="${r1(x0)}" y="${r1(yB)}" width="${r1(w)}" height="${r1(Math.max(0,yA-yB-1.5))}" fill="var(--s-buy)" rx="${Math.min(3,w/3)}"/>`;
      s+=`<rect x="${r1(m.l+i*bw)}" y="${m.t}" width="${r1(bw)}" height="${H-m.t-m.b}" fill="transparent" data-i="${i}"/>`;
    });
    s+='</svg><div class="tip" hidden></div>';
    el.innerHTML = s;
    const svg = el.querySelector('svg'), tip = el.querySelector('.tip');
    const show = ev=>{ const t = ev.target.closest('[data-i]'); if(!t){ tip.hidden=true; return; } const i=+t.dataset.i, r=rows[i]; const rect=svg.getBoundingClientRect();
      tip.hidden=false; tip.innerHTML=`<div class="small" style="margin-bottom:4px"><b>${esc(r.label)}</b></div><div class="tr"><span><span class="sw" style="background:var(--s-inv)"></span> 本金</span><span>${yuan(r.a)}</span></div><div class="tr"><span><span class="sw" style="background:var(--s-buy)"></span> 利息</span><span>${yuan(r.b)}</span></div>`;
      tip.style.left = clamp((m.l+bw*(i+0.5))*(rect.width/W), 80, rect.width-80)+'px'; tip.style.top = Math.max(0,y(r.a+r.b)*(rect.height/H)-8)+'px'; };
    svg.addEventListener('pointermove', show); svg.addEventListener('pointerdown', show); svg.addEventListener('pointerleave', ()=>tip.hidden=true);
  };
  draw(); charts.list.push(draw);
}
export let _rz; window.addEventListener('resize', ()=>{ clearTimeout(_rz); _rz=setTimeout(()=>charts.list.forEach(f=>{ try{f();}catch(e){} }),150); });
