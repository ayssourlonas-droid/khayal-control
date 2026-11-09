/* 插图：城市天际线、房源外观、头像、小图标。全部用 SVG 现场生成，颜色跟随主题。 */
import { clamp, esc, hashStr, makeRng, r1 } from '../core/util.js';
/* ============================================================
   插图：全部用 SVG 现场生成，颜色走主题变量，深浅色都能看
   ============================================================ */
export let __gid = 0;
export function uid(){ return ++__gid; }

export function windowsGrid(x,y,w,h,cols,rows,rng,lit=0.25,color='var(--b-win)',dim='var(--sky-2)'){
  let s=''; const cw=w/cols, rh=h/rows;
  for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){
    const on = rng()<lit;
    s+=`<rect x="${r1(x+i*cw+cw*0.22)}" y="${r1(y+j*rh+rh*0.25)}" width="${r1(cw*0.56)}" height="${r1(rh*0.5)}" fill="${on?color:dim}" opacity="${on?0.95:0.55}"/>`;
  }
  return s;
}
export function pagoda(x, gy, tiers, w0, th, rng, opt={}){
  let s='', y=gy, w=w0;
  const fill = opt.fill||'var(--b-3)';
  if(opt.base){ s+=`<rect x="${x-w0*0.75}" y="${gy-8}" width="${w0*1.5}" height="8" fill="${fill}"/>`; y-=8; }
  for(let i=0;i<tiers;i++){
    const bw=w*0.72;
    s+=`<rect x="${r1(x-bw/2)}" y="${r1(y-th)}" width="${r1(bw)}" height="${th}" fill="${fill}"/>`;
    const rw=w*(opt.flare||1.15), ry=y-th;
    s+=`<path d="M${r1(x-rw/2)} ${r1(ry+1)} Q${r1(x-rw/2+4)} ${r1(ry-3)} ${r1(x-bw/2)} ${r1(ry-4)} L${r1(x+bw/2)} ${r1(ry-4)} Q${r1(x+rw/2-4)} ${r1(ry-3)} ${r1(x+rw/2)} ${r1(ry+1)} Z" fill="${fill}"/>`;
    y = ry-4; w*= opt.shrink||0.86;
  }
  s+=`<rect x="${x-1}" y="${y-10}" width="2" height="10" fill="${fill}"/>`;
  return s;
}
export function landmark(type, x, gy, rng){
  const F='var(--b-3)';
  switch(type){
    case 'pearl': return `<rect x="${x-2}" y="${gy-128}" width="4" height="128" fill="${F}"/><line x1="${x-14}" y1="${gy}" x2="${x}" y2="${gy-60}" stroke="${F}" stroke-width="4"/><line x1="${x+14}" y1="${gy}" x2="${x}" y2="${gy-60}" stroke="${F}" stroke-width="4"/><circle cx="${x}" cy="${gy-52}" r="13" fill="${F}"/><circle cx="${x}" cy="${gy-104}" r="8" fill="${F}"/><circle cx="${x}" cy="${gy-128}" r="3.5" fill="${F}"/><line x1="${x}" y1="${gy-128}" x2="${x}" y2="${gy-150}" stroke="${F}" stroke-width="1.5"/>`;
    case 'temple': return `<rect x="${x-34}" y="${gy-6}" width="68" height="6" fill="${F}"/><rect x="${x-28}" y="${gy-12}" width="56" height="6" fill="${F}"/><rect x="${x-22}" y="${gy-18}" width="44" height="6" fill="${F}"/>`+
      [0,1,2].map(i=>{ const w=40-i*9, y=gy-18-i*15; return `<rect x="${x-w*0.38}" y="${y-10}" width="${w*0.76}" height="10" fill="${F}"/><path d="M${x-w/2} ${y-9} Q${x} ${y-22} ${x+w/2} ${y-9} Z" fill="${F}"/>`; }).join('')+`<circle cx="${x}" cy="${gy-70}" r="3" fill="var(--b-win)"/>`;
    case 'canton': return `<path d="M${x-15} ${gy} L${x-5} ${gy-72} L${x-10} ${gy-128} L${x+10} ${gy-128} L${x+5} ${gy-72} L${x+15} ${gy} Z" fill="${F}"/><line x1="${x}" y1="${gy-128}" x2="${x}" y2="${gy-160}" stroke="${F}" stroke-width="2"/>`;
    case 'spire': return `<path d="M${x-14} ${gy} L${x-7} ${gy-140} L${x+7} ${gy-140} L${x+14} ${gy} Z" fill="${F}"/><path d="M${x-5} ${gy-140} L${x} ${gy-162} L${x+5} ${gy-140} Z" fill="${F}"/><path d="M${x+22} ${gy} L${x+24} ${gy-96} L${x+36} ${gy-96} L${x+38} ${gy} Z" fill="var(--b-2)"/>`;
    case 'pagoda': return pagoda(x, gy, 5, 30, 11, rng, {base:1, flare:1.25});
    case 'crane': return `<path d="M${x-60} ${gy} Q${x} ${gy-30} ${x+60} ${gy} Z" fill="var(--b-2)"/>` + pagoda(x, gy-18, 5, 36, 10, rng, {base:1, flare:1.45, shrink:0.84});
    case 'goose': return pagoda(x+28, gy, 7, 22, 10, rng, {base:1, flare:1.05, shrink:0.9}) + wall(x-70, gy, 120, 14, F);
    case 'wall': return wall(x-80, gy, 160, 20, F) + `<rect x="${x-18}" y="${gy-34}" width="36" height="14" fill="${F}"/><path d="M${x-26} ${gy-33} Q${x} ${gy-46} ${x+26} ${gy-33} Z" fill="${F}"/><rect x="${x-12}" y="${gy-44}" width="24" height="8" fill="${F}"/><path d="M${x-18} ${gy-43} Q${x} ${gy-54} ${x+18} ${gy-43} Z" fill="${F}"/>`;
    case 'gate': return `<path d="M${x-30} ${gy} L${x-24} ${gy-100} Q${x} ${gy-132} ${x+24} ${gy-100} L${x+30} ${gy} L${x+14} ${gy} L${x+12} ${gy-78} Q${x} ${gy-96} ${x-12} ${gy-78} L${x-14} ${gy} Z" fill="${F}"/>`;
    case 'tvtower': return `<rect x="${x-3}" y="${gy-130}" width="6" height="130" fill="${F}"/><ellipse cx="${x}" cy="${gy-100}" rx="16" ry="7" fill="${F}"/><rect x="${x-9}" y="${gy-112}" width="18" height="10" fill="${F}"/><line x1="${x}" y1="${gy-130}" x2="${x}" y2="${gy-156}" stroke="${F}" stroke-width="1.5"/>`;
    case 'corn': { let s=`<path d="M${x-14} ${gy} L${x-12} ${gy-110} Q${x} ${gy-140} ${x+12} ${gy-110} L${x+14} ${gy} Z" fill="${F}"/>`; for(let i=1;i<10;i++) s+=`<line x1="${x-13}" x2="${x+13}" y1="${gy-i*12}" y2="${gy-i*12}" stroke="var(--sky-2)" stroke-width="1" opacity=".5"/>`; return s; }
    case 'panda': return `<g transform="translate(${x+40} ${gy})">`+
      `<rect x="-58" y="-60" width="3" height="60" fill="var(--tree)"/><rect x="-50" y="-44" width="3" height="44" fill="var(--tree)"/><path d="M-56 -40 l-10 -6 M-48 -30 l9 -7" stroke="var(--tree)" stroke-width="3"/>`+
      `<ellipse cx="0" cy="-16" rx="20" ry="17" fill="var(--panda-w)" stroke="var(--b-3)" stroke-width="1"/><ellipse cx="-14" cy="-6" rx="7" ry="9" fill="var(--panda-k)"/><ellipse cx="14" cy="-6" rx="7" ry="9" fill="var(--panda-k)"/>`+
      `<circle cx="0" cy="-40" r="13" fill="var(--panda-w)" stroke="var(--b-3)" stroke-width="1"/><circle cx="-10" cy="-51" r="5" fill="var(--panda-k)"/><circle cx="10" cy="-51" r="5" fill="var(--panda-k)"/><ellipse cx="-5" cy="-41" rx="3.4" ry="4.2" fill="var(--panda-k)"/><ellipse cx="5" cy="-41" rx="3.4" ry="4.2" fill="var(--panda-k)"/><ellipse cx="0" cy="-34" rx="2" ry="1.3" fill="var(--panda-k)"/></g>`;
    case 'hills': return `<path d="M${x-40} ${gy} L${x-30} ${gy-60} L${x-14} ${gy-60} L${x-14} ${gy-90} L${x+8} ${gy-90} L${x+10} ${gy} Z" fill="${F}"/>` + windowsGrid(x-28,gy-86,34,80,4,10,rng,0.4)+ `<path d="M${x+20} ${gy-12} Q${x+70} ${gy-52} ${x+120} ${gy-12}" fill="none" stroke="${F}" stroke-width="3"/><line x1="${x+20}" y1="${gy-12}" x2="${x+120}" y2="${gy-12}" stroke="${F}" stroke-width="3"/>`+[0,1,2,3,4,5,6].map(i=>`<line x1="${x+34+i*12}" x2="${x+34+i*12}" y1="${gy-12}" y2="${gy-12-Math.sin((i+1)/8*Math.PI)*34}" stroke="${F}" stroke-width="1"/>`).join('');
    case 'hills2': return `<path d="M${x-80} ${gy} Q${x-30} ${gy-70} ${x+30} ${gy-30} Q${x+60} ${gy-16} ${x+90} ${gy} Z" fill="var(--b-2)"/>` + pagoda(x-30, gy-48, 2, 18, 7, rng, {flare:1.5});
    case 'pier': return `<rect x="${x-70}" y="${gy+4}" width="80" height="3" fill="${F}"/>` + `<polygon points="${x+10},${gy+4} ${x+16},${gy-8} ${x+32},${gy-8} ${x+38},${gy+4}" fill="${F}"/><path d="M${x+8} ${gy-8} Q${x+24} ${gy-26} ${x+40} ${gy-8} Z" fill="${F}"/><rect x="${x+23}" y="${gy-30}" width="2" height="6" fill="${F}"/>`;
    case 'light': return `<path d="M${x-8} ${gy} L${x-5} ${gy-58} L${x+5} ${gy-58} L${x+8} ${gy} Z" fill="${F}"/><rect x="${x-7}" y="${gy-66}" width="14" height="8" fill="var(--b-win)"/><path d="M${x-9} ${gy-66} L${x} ${gy-76} L${x+9} ${gy-66} Z" fill="${F}"/><rect x="${x-5}" y="${gy-44}" width="10" height="5" fill="var(--seal)" opacity=".7"/><rect x="${x-6}" y="${gy-24}" width="12" height="5" fill="var(--seal)" opacity=".7"/>`;
    case 'palm': return palm(x-30, gy, 70) + palm(x+10, gy, 56) + palm(x+50, gy, 78);
    case 'snow': return [0,1,2].map(i=>`<rect x="${x-30+i*26}" y="${gy-60-i*12}" width="9" height="${60+i*12}" fill="${F}"/><circle cx="${x-25+i*26}" cy="${gy-72-i*12}" r="8" fill="var(--b-1)" opacity=".8"/><circle cx="${x-19+i*26}" cy="${gy-84-i*12}" r="10" fill="var(--b-1)" opacity=".6"/>`).join('');
    default: return `<rect x="${x-14}" y="${gy-112}" width="28" height="112" fill="${F}"/><rect x="${x+18}" y="${gy-86}" width="22" height="86" fill="var(--b-2)"/>` + windowsGrid(x-12,gy-108,24,104,3,14,rng,0.35);
  }
}
export function wall(x, gy, w, h, F){
  let s=`<rect x="${x}" y="${gy-h}" width="${w}" height="${h}" fill="${F}"/>`;
  for(let i=0;i<w;i+=8) s+=`<rect x="${x+i}" y="${gy-h-4}" width="5" height="4" fill="${F}"/>`;
  return s;
}
export function palm(x, gy, h){
  return `<path d="M${x} ${gy} Q${x+6} ${gy-h/2} ${x+2} ${gy-h}" stroke="var(--b-3)" stroke-width="4" fill="none"/>`+
    [-60,-20,20,60,100,150].map(a=>{ const rad=a*Math.PI/180; const ex=x+2+Math.cos(rad)*24, ey=gy-h+Math.sin(rad)*10+6; return `<path d="M${x+2} ${gy-h} Q${r1((x+2+ex)/2)} ${r1(gy-h-12)} ${r1(ex)} ${r1(ey)}" stroke="var(--tree)" stroke-width="4" fill="none" stroke-linecap="round"/>`; }).join('');
}

export function skylineSVG(city, W=480, H=210){
  const rng = makeRng(hashStr(city.id+'sky'));
  const id = 'g'+uid();
  const gy = H-22;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(city.name)}城市天际线" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky-1)"/><stop offset="1" stop-color="var(--sky-2)"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  s += `<circle cx="${W*0.86}" cy="${H*0.26}" r="16" fill="var(--b-win)" opacity=".55"/>`;
  if(city.land==='hills'||city.land==='hills2'||city.sea) s+=`<path d="M0 ${gy-40} Q${W*0.2} ${gy-90} ${W*0.42} ${gy-50} T${W} ${gy-60} L${W} ${gy} L0 ${gy} Z" fill="var(--b-1)" opacity=".7"/>`;
  // 后排楼
  for(let x=-10;x<W;){ const w=rng.int(18,34), h=rng.int(40,100); s+=`<rect x="${x}" y="${gy-h}" width="${w}" height="${h}" fill="var(--b-1)"/>`; x+=w+rng.int(0,6); }
  // 地标
  const lx = W*0.66;
  s += landmark(city.land, lx, gy, rng);
  // 前排楼（地标两侧留空）
  for(let x=-6;x<W;){
    const w=rng.int(20,40), h=rng.int(26,74);
    if(Math.abs(x+w/2-lx)<52){ x+=w; continue; }
    s+=`<rect x="${x}" y="${gy-h}" width="${w}" height="${h}" fill="var(--b-2)"/>` + windowsGrid(x+2,gy-h+4,w-4,h-8,Math.max(2,Math.floor(w/9)),Math.max(2,Math.floor(h/10)),rng,0.22);
    x+=w+rng.int(2,10);
  }
  if(city.sea){ s+=`<rect x="0" y="${gy}" width="${W}" height="${H-gy}" fill="var(--glass)"/>`; for(let i=0;i<9;i++){ const wx=rng.int(0,W-30); s+=`<path d="M${wx} ${gy+8+rng.int(0,8)} q6 -4 12 0 t12 0" stroke="var(--paper)" stroke-width="1.5" fill="none" opacity=".7"/>`; } }
  else if(city.river||city.lake){ s+=`<rect x="0" y="${gy}" width="${W}" height="${H-gy}" fill="var(--ground)"/><path d="M0 ${gy+8} Q${W*0.3} ${gy+2} ${W*0.55} ${gy+10} T${W} ${gy+8} L${W} ${H} L0 ${H} Z" fill="var(--glass)"/>`; }
  else s+=`<rect x="0" y="${gy}" width="${W}" height="${H-gy}" fill="var(--ground)"/>`;
  if(city.land==='snow'){ for(let i=0;i<40;i++) s+=`<circle cx="${rng.int(0,W)}" cy="${rng.int(4,gy)}" r="${rng.range(0.8,2)}" fill="var(--paper)" opacity=".9"/>`; }
  return s+'</svg>';
}

/* 房源图 */
export function homeSVG(type, seedStr){
  if(['gen4','flat','villa','villa2','resort'].includes(type)) return homeSVGx(type, seedStr);
  const rng = makeRng(hashStr(seedStr));
  const W=360, H=170, gy=H-18, id='h'+uid();
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="房源示意图" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky-1)"/><stop offset="1" stop-color="var(--sky-2)"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  for(let x=0;x<W;){ const w=rng.int(20,40), h=rng.int(30,80); s+=`<rect x="${x}" y="${gy-h}" width="${w}" height="${h}" fill="var(--b-1)" opacity=".8"/>`; x+=w+rng.int(4,12); }
  const tree = (x,sz=1)=>`<rect x="${x-1.5}" y="${gy-14*sz}" width="3" height="${14*sz}" fill="var(--b-3)"/><circle cx="${x}" cy="${gy-18*sz}" r="${9*sz}" fill="var(--tree)"/>`;
  if(type==='old'){
    for(const bx of [40,190]){
      const bw=130, fl=6, fh=17, top=gy-fl*fh;
      s+=`<rect x="${bx}" y="${top}" width="${bw}" height="${fl*fh}" fill="var(--brick)"/><rect x="${bx-3}" y="${top-5}" width="${bw+6}" height="5" fill="var(--brick-2)"/>`;
      for(let f=0;f<fl;f++) for(let c=0;c<5;c++){ const wx=bx+8+c*25, wy=top+4+f*fh; s+=`<rect x="${wx}" y="${wy}" width="14" height="10" fill="${rng()<.3?'var(--b-win)':'var(--glass)'}"/>`; if(rng()<.35) s+=`<rect x="${wx+15}" y="${wy+5}" width="7" height="5" fill="var(--paper)" stroke="var(--b-3)" stroke-width=".6"/>`; }
      s+=`<line x1="${bx+10}" y1="${top+2*fh+14}" x2="${bx+60}" y2="${top+2*fh+14}" stroke="var(--b-3)" stroke-width=".7"/>`+[0,1,2,3].map(i=>`<rect x="${bx+14+i*11}" y="${top+2*fh+14}" width="7" height="9" fill="${['var(--s-buy)','var(--s-inv)','var(--b-win)','var(--paper)'][i]}"/>`).join('');
    }
    s+=tree(20)+tree(345,1.1);
  } else if(type==='tower' || type==='new'){
    const towers = type==='tower' ? [[60,48,120],[150,54,138],[250,48,110]] : [[90,58,140],[210,58,128]];
    for(const [bx,bw,bh] of towers){
      s+=`<rect x="${bx}" y="${gy-bh}" width="${bw}" height="${bh}" fill="${type==='new'?'var(--paper)':'var(--b-2)'}" stroke="var(--b-3)" stroke-width=".6"/>`;
      const rows=Math.floor(bh/6);
      for(let j=0;j<rows;j++){ s+=`<rect x="${bx+4}" y="${gy-bh+4+j*6}" width="${bw-8}" height="3" fill="${type==='new'?'var(--glass)':'var(--sky-2)'}" opacity=".9"/>`; if(rng()<.18) s+=`<rect x="${bx+4+rng.int(0,bw-16)}" y="${gy-bh+4+j*6}" width="8" height="3" fill="var(--b-win)"/>`; }
      s+=`<rect x="${bx+bw/2-6}" y="${gy-bh-8}" width="12" height="8" fill="var(--b-3)"/>`;
    }
    if(type==='new'){ for(let x=14;x<W;x+=34) s+=tree(x,0.8); s+=`<rect x="0" y="${gy-4}" width="${W}" height="4" fill="var(--tree)" opacity=".6"/>`; }
    else s+=tree(20)+tree(330);
  } else if(type==='offplan'){
    const bx=110,bw=90,bh=130,built=78;
    s+=`<rect x="${bx}" y="${gy-built}" width="${bw}" height="${built}" fill="var(--b-2)"/>`;
    for(let j=0;j<built/8;j++) s+=`<rect x="${bx+5}" y="${gy-built+3+j*8}" width="${bw-10}" height="3" fill="var(--sky-2)"/>`;
    for(let j=0;j<(bh-built)/10;j++){ const y=gy-built-(j+1)*10; s+=`<line x1="${bx}" x2="${bx+bw}" y1="${y}" y2="${y}" stroke="var(--b-3)" stroke-width="1.4"/>`; }
    for(let i=0;i<=6;i++) s+=`<line x1="${bx+i*bw/6}" x2="${bx+i*bw/6}" y1="${gy-built}" y2="${gy-bh}" stroke="var(--b-3)" stroke-width="1.2"/>`;
    // 塔吊
    const cx=250; s+=`<line x1="${cx}" y1="${gy}" x2="${cx}" y2="${gy-150}" stroke="var(--warn)" stroke-width="4"/><line x1="${cx-110}" y1="${gy-146}" x2="${cx+40}" y2="${gy-146}" stroke="var(--warn)" stroke-width="3"/><line x1="${cx}" y1="${gy-162}" x2="${cx-100}" y2="${gy-146}" stroke="var(--warn)" stroke-width="1"/><line x1="${cx}" y1="${gy-162}" x2="${cx+36}" y2="${gy-146}" stroke="var(--warn)" stroke-width="1"/><line x1="${cx-70}" y1="${gy-146}" x2="${cx-70}" y2="${gy-110}" stroke="var(--b-3)" stroke-width="1"/><rect x="${cx-76}" y="${gy-110}" width="12" height="8" fill="var(--b-3)"/>`;
    // 围挡
    s+=`<rect x="0" y="${gy-16}" width="${W}" height="16" fill="var(--paper)"/><rect x="0" y="${gy-16}" width="${W}" height="3" fill="var(--seal)"/><text x="${W/2}" y="${gy-4}" text-anchor="middle" font-size="9" fill="var(--seal)" font-weight="700" letter-spacing="2">效果图仅供参考 · 以实际交付为准</text>`;
  } else if(type==='yangfang'){
    for(const bx of [30,140,250]){
      const fl=6; let w=86;
      for(let f=0;f<fl;f++){ const ww=w-(f>3?(f-3)*14:0); const y=gy-(f+1)*15; s+=`<rect x="${bx+(w-ww)/2}" y="${y}" width="${ww}" height="15" fill="var(--paper)" stroke="var(--b-3)" stroke-width=".5"/>`+windowsGrid(bx+(w-ww)/2+2,y+1,ww-4,13,Math.floor(ww/16),1,rng,0.25,'var(--b-win)','var(--glass)'); }
      s+=`<path d="M${bx+16} ${gy-90} L${bx+43} ${gy-104} L${bx+70} ${gy-90} Z" fill="var(--brick-2)"/>`;
    }
    for(let x=10;x<W;x+=26) s+=tree(x,0.7+rng()*0.3);
  } else { // loft 商住公寓
    const bx=50,bw=260,bh=120;
    s+=`<rect x="${bx}" y="${gy-bh}" width="${bw}" height="${bh}" fill="var(--b-2)"/>` + windowsGrid(bx+4,gy-bh+4,bw-8,bh-34,18,9,rng,0.3);
    s+=`<rect x="${bx}" y="${gy-28}" width="${bw}" height="28" fill="var(--paper)"/>`+[0,1,2,3,4].map(i=>`<rect x="${bx+6+i*51}" y="${gy-26}" width="45" height="7" fill="${['var(--seal)','var(--s-inv)','var(--warn)','var(--tree)','var(--b-3)'][i]}"/><rect x="${bx+6+i*51}" y="${gy-16}" width="45" height="14" fill="var(--glass)"/>`).join('');
  }
  s+=`<rect x="0" y="${gy}" width="${W}" height="${H-gy}" fill="var(--ground)"/>`;
  return s+'</svg>';
}

/* 头像：发量、压力、健康都会体现在脸上 */
export function avatarSVG(st){
  const hair = clamp(st.hair,0,100), stress = st.stress, happy = st.happy;
  let s = `<svg viewBox="0 0 72 72" role="img" aria-label="你的状态：发量${Math.round(hair)}，压力${Math.round(stress)}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<path d="M10 72 Q12 52 36 50 Q60 52 62 72 Z" fill="var(--cloth)"/><path d="M30 50 L36 58 L42 50" fill="none" stroke="var(--paper)" stroke-width="2"/>`;
  s += `<circle cx="36" cy="32" r="17" fill="var(--skin)"/>`;
  const n = Math.round(hair/100*26);
  for(let i=0;i<n;i++){
    const a = Math.PI*(1.08 + 0.84*(i+0.5)/Math.max(n,1)); // 头顶 194°~345°
    const x0=36+Math.cos(a)*16, y0=32+Math.sin(a)*16, x1=36+Math.cos(a)*22, y1=32+Math.sin(a)*22-2;
    s+=`<path d="M${r1(x0)} ${r1(y0)} Q${r1((x0+x1)/2+2)} ${r1((y0+y1)/2-3)} ${r1(x1)} ${r1(y1)}" stroke="var(--hair)" stroke-width="${hair>60?3:2.2}" stroke-linecap="round" fill="none"/>`;
  }
  if(n===0) s+=`<path d="M36 15 q4 -8 -1 -12" stroke="var(--hair)" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  if(stress>75){ s+=`<path d="M27 29 l5 4 M32 29 l-5 4 M40 29 l5 4 M45 29 l-5 4" stroke="var(--hair)" stroke-width="1.6" stroke-linecap="round"/>`; }
  else { s+=`<circle cx="29.5" cy="31" r="2" fill="var(--hair)"/><circle cx="42.5" cy="31" r="2" fill="var(--hair)"/>`; }
  if(st.health<55||stress>60) s+=`<path d="M26.5 35.5 q3 2 6 0 M39.5 35.5 q3 2 6 0" stroke="var(--b-3)" stroke-width="1" fill="none"/>`;
  const m = stress>70 ? 'M30 43 Q36 38 42 43' : (happy>60 && stress<45) ? 'M30 40 Q36 46 42 40' : 'M31 42 L41 42';
  s+=`<path d="${m}" stroke="var(--hair)" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  if(stress>55) s+=`<path d="M52 22 q-4 6 0 8 q4 -2 0 -8 Z" fill="var(--s-inv)" opacity=".85"/>`;
  return s+'</svg>';
}

/* 线性小图标 */
export const ICONS = {
  key:'<circle cx="14" cy="20" r="7"/><path d="M21 20h14m-4 0v5m-5-5v4"/>',
  bank:'<path d="M6 16 20 8l14 8M8 16v14m8-14v14m8-14v14m8-14v14M5 32h30"/>',
  up:'<path d="M6 30 16 20l6 6 12-14M26 12h8v8"/>',
  down:'<path d="M6 10l10 10 6-6 12 14M26 28h8v-8"/>',
  heart:'<path d="M20 33S6 24 6 15a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 9-14 18-14 18Z"/>',
  cross:'<rect x="6" y="6" width="28" height="28" rx="4"/><path d="M20 12v16M12 20h16"/>',
  ring:'<circle cx="20" cy="24" r="10"/><path d="M15 9h10l-5 5Z"/>',
  baby:'<circle cx="20" cy="18" r="10"/><path d="M16 17h.01M24 17h.01M17 22q3 2 6 0M14 32q6 -4 12 0"/>',
  warn:'<path d="M20 6 36 33H4Z"/><path d="M20 16v8m0 4v.5"/>',
  coin:'<circle cx="20" cy="20" r="13"/><path d="M15 14l5 6 5-6M14 22h12M14 26h12M20 20v10"/>',
  brief:'<rect x="6" y="13" width="28" height="19" rx="2"/><path d="M15 13V9h10v4M6 21h28"/>',
  phone:'<rect x="12" y="5" width="16" height="30" rx="3"/><path d="M18 30h4"/>',
  wrench:'<path d="M28 6a7 7 0 0 0-8 9L7 28l5 5 13-13a7 7 0 0 0 9-8l-4 4-4-1-1-4Z"/>',
  gift:'<rect x="7" y="16" width="26" height="17"/><path d="M5 12h30v4H5ZM20 12v21M20 12s-6-8-9-4 9 4 9 4 6-8 9-4-9 4-9 4"/>',
  crane:'<path d="M10 34V6m-6 4h28M10 6l18 4M24 10v10"/><rect x="21" y="20" width="6" height="5"/>',
  gavel:'<path d="M18 8l10 10-4 4-10-10ZM21 15 8 28M6 34h16"/>',
  cat:'<path d="M10 34V16l4-8 4 6h4l4-6 4 8v18Z"/><path d="M16 22h.01M24 22h.01M18 27q2 1.5 4 0"/>',
  chart:'<path d="M6 34V6M6 34h28M11 27l7-8 5 4 9-11"/>',
  cal:'<rect x="6" y="9" width="28" height="25" rx="2"/><path d="M6 16h28M13 5v7M27 5v7"/>',
};
export function icon(name, size=40){ return `<svg viewBox="0 0 40 40" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.warn}</svg>`; }
export function bannerSVG(name, tone){
  const rng=makeRng(hashStr(name)); const W=360,H=110,id='bn'+uid();
  const col = tone==='bad'?'var(--warn)':tone==='good'?'var(--seal)':'var(--b-3)';
  let s=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky-1)"/><stop offset="1" stop-color="var(--sky-2)"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  for(let x=0;x<W;){ const w=rng.int(16,32), h=rng.int(20,60); s+=`<rect x="${x}" y="${H-h}" width="${w}" height="${h}" fill="var(--b-1)"/>`; x+=w+rng.int(2,8); }
  s+=`<circle cx="${W/2}" cy="${H/2}" r="36" fill="var(--paper)" stroke="${col}" stroke-width="2"/>`;
  s+=`<g transform="translate(${W/2-22} ${H/2-22}) scale(1.1)" stroke="${col}" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||ICONS.warn}</g>`;
  return s+'</svg>';
}

/* 新户型的外观图 */
export function homeSVGx(type, seedStr){
  const rng = makeRng(hashStr(seedStr)); const W=360,H=170,gy=H-18,id='hx'+uid();
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="房源示意图" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky-1)"/><stop offset="1" stop-color="var(--sky-2)"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  const tree = (x,sz=1)=>`<rect x="${x-1.5}" y="${gy-14*sz}" width="3" height="${14*sz}" fill="var(--b-3)"/><circle cx="${x}" cy="${gy-18*sz}" r="${9*sz}" fill="var(--tree)"/>`;
  if(type==='resort' || type==='villa2') s += `<path d="M0 ${gy-50} Q${W*0.25} ${gy-120} ${W*0.5} ${gy-70} T${W} ${gy-80} L${W} ${gy} L0 ${gy} Z" fill="var(--tree)" opacity=".55"/>`;
  else for(let x=0;x<W;){ const w=rng.int(20,40), h=rng.int(30,80); s+=`<rect x="${x}" y="${gy-h}" width="${w}" height="${h}" fill="var(--b-1)" opacity=".8"/>`; x+=w+rng.int(4,12); }
  if(type==='gen4'){
    for(const bx of [70,200]){ const bw=96, fl=12, fh=10;
      for(let f=0;f<fl;f++){ const y=gy-(f+1)*fh; s+=`<rect x="${bx}" y="${y}" width="${bw}" height="${fh}" fill="var(--paper)" stroke="var(--b-3)" stroke-width=".4"/>`; s+=`<rect x="${bx+4}" y="${y+2}" width="${bw*0.45}" height="${fh-4}" fill="var(--glass)"/>`;
        if(f%2===0){ const gx = bx + (Math.floor(f/2)%2===0 ? bw*0.55 : bw*0.55); s+=`<rect x="${gx}" y="${y-fh+1}" width="${bw*0.4}" height="${fh*2-2}" fill="var(--sky-2)"/>`; for(let k=0;k<3;k++) s+=`<circle cx="${gx+6+k*12}" cy="${y+fh-3}" r="${4+rng()*2}" fill="var(--tree)"/>`; } }
    }
    for(let x=10;x<W;x+=40) s+=tree(x,0.7);
  } else if(type==='flat'){
    const bx=130,bw=90,bh=150; s+=`<rect x="${bx}" y="${gy-bh}" width="${bw}" height="${bh}" fill="var(--glass)"/>`; for(let j=0;j<bh/6;j++) s+=`<line x1="${bx}" x2="${bx+bw}" y1="${gy-bh+j*6}" y2="${gy-bh+j*6}" stroke="var(--paper)" stroke-width=".8" opacity=".8"/>`; for(let i=1;i<4;i++) s+=`<line x1="${bx+i*bw/4}" x2="${bx+i*bw/4}" y1="${gy-bh}" y2="${gy}" stroke="var(--b-3)" stroke-width=".8"/>`;
    s+=`<rect x="${bx+bw+16}" y="${gy-120}" width="44" height="120" fill="var(--b-2)"/><rect x="${bx-60}" y="${gy-100}" width="44" height="100" fill="var(--b-2)"/>`;
    s+=`<ellipse cx="${W/2}" cy="${gy+2}" rx="160" ry="10" fill="var(--tree)" opacity=".7"/>`; for(let x=14;x<W;x+=30) s+=tree(x,0.75);
  } else if(type==='villa'){
    for(let k=0;k<4;k++){ const bx=20+k*82, bw=78; s+=`<rect x="${bx}" y="${gy-72}" width="${bw}" height="72" fill="var(--paper)" stroke="var(--b-3)" stroke-width=".6"/><path d="M${bx-4} ${gy-72} L${bx+bw/2} ${gy-100} L${bx+bw+4} ${gy-72} Z" fill="var(--brick-2)"/>`+windowsGrid(bx+6,gy-66,bw-12,58,3,3,rng,0.3,'var(--b-win)','var(--glass)')+tree(bx+bw-6,0.8); }
  } else if(type==='villa2'){
    s+=`<rect x="0" y="${gy-6}" width="${W}" height="24" fill="var(--glass)"/>`;
    s+=`<rect x="70" y="${gy-60}" width="170" height="54" fill="var(--paper)" stroke="var(--b-3)" stroke-width=".6"/><rect x="110" y="${gy-104}" width="150" height="44" fill="var(--paper)" stroke="var(--b-3)" stroke-width=".6"/><rect x="60" y="${gy-64}" width="190" height="5" fill="var(--b-3)"/><rect x="104" y="${gy-108}" width="164" height="5" fill="var(--b-3)"/><rect x="80" y="${gy-54}" width="150" height="40" fill="var(--glass)"/><rect x="120" y="${gy-98}" width="130" height="32" fill="var(--glass)"/>`;
    for(const x of [30,280,320]) s+=tree(x,1.1);
  } else if(type==='resort'){
    s+=`<rect x="100" y="${gy-56}" width="160" height="56" fill="var(--paper)" stroke="var(--b-3)" stroke-width=".6"/><path d="M88 ${gy-56} L180 ${gy-96} L272 ${gy-56} Z" fill="var(--b-3)"/>`+windowsGrid(110,gy-50,140,40,4,2,rng,0.4,'var(--b-win)','var(--glass)');
    for(let x=8;x<W;x+=24) if(x<90||x>270) s+=tree(x,0.9+rng()*0.3);
  }
  s+=`<rect x="0" y="${gy}" width="${W}" height="${H-gy}" fill="var(--ground)"/>`;
  return s+'</svg>';
}
