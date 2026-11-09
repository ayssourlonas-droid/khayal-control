/* 装修效果图：单点透视的房间场景，按档位和风格换材质、家具和灯具。 */
import { uid } from './scenes.js';
import { roomsOf, styleOf, viewOf } from '../core/renovation.js';
import { esc, hashStr, makeRng, r1 } from '../core/util.js';
import { STYLES } from '../data/index.js';

/* ---------- 透视效果图 ---------- */
export function shade(hex, amt){
  const n = parseInt(hex.slice(1),16); let r=n>>16, g=(n>>8)&255, b=n&255; const f = amt<0?0:255, t=Math.abs(amt);
  r=Math.round(r+(f-r)*t); g=Math.round(g+(f-g)*t); b=Math.round(b+(f-b)*t);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
export const pts = a => a.map(p=>r1(p[0])+','+r1(p[1])).join(' ');
export const poly = (a, fill, ex='') => `<polygon points="${pts(a)}" fill="${fill}" ${ex}/>`;
export function makeCam(B, k=2.3, vpH=0.44, hs=1){
  const vx=(B.x0+B.x1)/2, vy=B.y1-(B.y1-B.y0)*vpH;
  const sc = d => 1/(1 - d*(1-1/k));
  const P = (u,d,h)=>{ const S=sc(d); const x=B.x0+u*(B.x1-B.x0), y=B.y1-h*hs*(B.y1-B.y0); return [vx+(x-vx)*S, vy+(y-vy)*S]; };
  return {B, P, vpH, hs, top:1/hs};
}
export function box(c,u0,u1,d0,d1,h0,h1,col,o={}){
  const P=c.P; let s='';
  if(u1<0.5) s+=poly([P(u1,d0,h0),P(u1,d1,h0),P(u1,d1,h1),P(u1,d0,h1)], o.side||shade(col,-0.13));
  if(u0>0.5) s+=poly([P(u0,d0,h0),P(u0,d1,h0),P(u0,d1,h1),P(u0,d0,h1)], o.side||shade(col,-0.13));
  if(h1*c.hs<c.vpH) s+=poly([P(u0,d0,h1),P(u1,d0,h1),P(u1,d1,h1),P(u0,d1,h1)], o.top||shade(col,0.12));
  if(h0*c.hs>c.vpH) s+=poly([P(u0,d0,h0),P(u1,d0,h0),P(u1,d1,h0),P(u0,d1,h0)], o.bot||shade(col,-0.22));
  if(!o.noFront) s+=poly([P(u0,d1,h0),P(u1,d1,h0),P(u1,d1,h1),P(u0,d1,h1)], o.front||col);
  return s;
}
export const backQ = (c,u0,u1,h0,h1) => [c.P(u0,0,h1),c.P(u1,0,h1),c.P(u1,0,h0),c.P(u0,0,h0)];
export const leftQ = (c,d0,d1,h0,h1) => [c.P(0,d0,h1),c.P(0,d1,h1),c.P(0,d1,h0),c.P(0,d0,h0)];
export const rightQ= (c,d0,d1,h0,h1) => [c.P(1,d0,h1),c.P(1,d1,h1),c.P(1,d1,h0),c.P(1,d0,h0)];
export const floorQ= (c,u0,u1,d0,d1) => [c.P(u0,d0,0),c.P(u1,d0,0),c.P(u1,d1,0),c.P(u0,d1,0)];

export function viewArt(kind, x, y, w, h, rng){
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#C9DCE8"/><rect x="${x}" y="${y+h*0.5}" width="${w}" height="${h*0.5}" fill="#E4ECEF"/>`;
  const by = y+h;
  if(kind==='neighbor'){
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#CDBDA8"/>`;
    for(let i=0;i<4;i++) for(let j=0;j<6;j++){ const wx=x+w*0.06+i*w*0.25, wy=y+h*0.04+j*h*0.17; s+=`<rect x="${r1(wx)}" y="${r1(wy)}" width="${r1(w*0.14)}" height="${r1(h*0.1)}" fill="#7E8E98"/><line x1="${r1(wx-2)}" x2="${r1(wx+w*0.16)}" y1="${r1(wy+h*0.11)}" y2="${r1(wy+h*0.11)}" stroke="#8A7B69" stroke-width="1"/>`; if(rng()<0.4) s+=`<rect x="${r1(wx+w*0.02)}" y="${r1(wy+h*0.11)}" width="${r1(w*0.03)}" height="${r1(h*0.05)}" fill="${rng.pick(['#C0534A','#5B7BA0','#E5D27A','#F2F2F2'])}"/>`; }
    return s;
  }
  if(kind==='snowmtn' || kind==='hills' || kind==='city'){
    const n=7; let d=`M${x} ${by-h*0.36}`;
    for(let i=0;i<=n;i++){ const px=x+w*i/n, py=by-h*(0.42+rng()*0.16); d+=` L${r1(px-w/n/2)} ${r1(py+h*0.08)} L${r1(px)} ${r1(py)}`; }
    d+=` L${x+w} ${by} L${x} ${by} Z`;
    if(kind==='snowmtn'){ s+=`<path d="${d}" fill="#B9C6D2"/>`; for(let i=0;i<=n;i++){ const px=x+w*i/n; s+=`<path d="M${r1(px-w*0.035)} ${r1(by-h*0.47)} L${r1(px)} ${r1(by-h*0.56)} L${r1(px+w*0.035)} ${r1(by-h*0.47)} Z" fill="#F7F9FA" opacity=".9"/>`; } }
    if(kind==='hills'){ s+=`<path d="M${x} ${by-h*0.35} Q${x+w*0.25} ${by-h*0.75} ${x+w*0.5} ${by-h*0.42} T${x+w} ${by-h*0.5} L${x+w} ${by} L${x} ${by} Z" fill="#8FAE8C"/><path d="M${x} ${by-h*0.15} Q${x+w*0.4} ${by-h*0.45} ${x+w} ${by-h*0.2} L${x+w} ${by} L${x} ${by} Z" fill="#6E9270"/>`; return s; }
    for(let i=0;i<9;i++){ const tw=w*rng.range(0.05,0.09), th=h*rng.range(0.15,kind==='city'?0.6:0.35), tx=x+w*i/9; s+=`<rect x="${r1(tx)}" y="${r1(by-th)}" width="${r1(tw)}" height="${r1(th)}" fill="${kind==='city'?'#A3B1BC':'#B2BDC6'}"/>`; }
    return s;
  }
  if(kind==='garden'){ s+=`<rect x="${x}" y="${by-h*0.28}" width="${w}" height="${h*0.28}" fill="#9FBF84"/>`; for(let i=0;i<6;i++){ const tx=x+w*(0.08+i*0.17), r=h*rng.range(0.1,0.17); s+=`<rect x="${r1(tx-1.5)}" y="${r1(by-h*0.28-r*1.6)}" width="3" height="${r1(r*1.6)}" fill="#6D5B47"/><circle cx="${r1(tx)}" cy="${r1(by-h*0.28-r*1.6)}" r="${r1(r)}" fill="${rng.pick(['#6E9A62','#7FAA6E','#5E8A57'])}"/>`; } return s; }
  if(kind==='lake'){ s+=`<path d="M${x} ${by-h*0.45} Q${x+w*0.5} ${by-h*0.6} ${x+w} ${by-h*0.44} L${x+w} ${by-h*0.36} L${x} ${by-h*0.36} Z" fill="#7FA27B"/><rect x="${x}" y="${by-h*0.36}" width="${w}" height="${h*0.36}" fill="#9DBFCD"/>`; for(let i=0;i<5;i++) s+=`<line x1="${r1(x+w*rng())}" x2="${r1(x+w*rng())}" y1="${r1(by-h*rng.range(0.05,0.3))}" y2="${r1(by-h*rng.range(0.05,0.3))}" stroke="#EAF3F6" stroke-width="1.2" opacity=".7"/>`; return s; }
  return s;
}

export function interiorSVG(L, roomIdx, tier, style){
  const rooms = roomsOf(L); const room = rooms[roomIdx]||rooms[0];
  const rng = makeRng(hashStr(L.name+room+tier+style));
  const W=480, H=300, id='in'+uid();
  // 现状：毛坯 / 旧装 / 简装 / 精装（开发商）
  const base = tier==='raw' ? 'bare' : (tier==='none' ? ({'毛坯':'bare','旧装':'dated','简装':'plainOld','精装':'devfin'})[L.deco] : 'done');
  const stKey = base==='done' ? styleOf(tier, style) : 'plain';
  const S = {...STYLES[stKey]};
  if(base==='bare'){ Object.assign(S,{wall:'#A9A8A3', ceil:'#B5B4AF', floor:'concrete', floorC:'#8F8D88'}); }
  if(base==='dated'){ Object.assign(S,{wall:'#E8DEC4', ceil:'#EFE8D6', floor:'dtile', floorC:'#E4E0D6', sofa:'#7A5236', wood:'#7A5236', curtain:'#9FB59A', art:'calendar', light:'tube', tv:'crt', cab:'#D9D2C2', counter:'#C9C2B4'}); }
  if(base==='plainOld'){ Object.assign(S,{wall:'#ECEAE3', floor:'tile', floorC:'#D3CFC4', light:'round', art:'none'}); }
  if(base==='devfin'){ Object.assign(S,{wall:'#F1F0EC', floor:'wood', floorC:'#C7B9A5', light:'down', art:'none'}); }
  if(tier==='light'){ // 刷墙+家电：保留原来地面
    if(L.deco==='旧装') Object.assign(S,{floor:'dtile', floorC:'#E4E0D6'});
    if(L.deco==='精装') Object.assign(S,{floor:'wood', floorC:'#C7B9A5', light:'down'});
  }
  const furnished = !(base==='bare' || base==='devfin');
  const tall = /挑空|空中花园/.test(room), loftTall = /复式/.test(room), wide = /横厅/.test(room), narrow = L.type==='old';
  const B = tall ? {x0:104,x1:376,y0:16,y1:216} : loftTall ? {x0:112,x1:368,y0:24,y1:214} : wide ? {x0:52,x1:428,y0:60,y1:214} : narrow ? {x0:124,x1:356,y0:58,y1:212} : {x0:94,x1:386,y0:50,y1:214};
  const c = makeCam(B, 2.3, tall?0.24:loftTall?0.3:0.44, tall?0.52:loftTall?0.62:1);
  const P = c.P, T = c.top;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(room)}效果图：${esc(S.name)}" xmlns="http://www.w3.org/2000/svg" style="display:block;background:${S.wall}"><defs>
    <linearGradient id="${id}fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient>
    <radialGradient id="${id}glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE9B8" stop-opacity=".75"/><stop offset="1" stop-color="#FFE9B8" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}tv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2B3036"/><stop offset=".55" stop-color="#16191C"/><stop offset="1" stop-color="#2A2F35"/></linearGradient>
  </defs>`;
  // ---- 房间壳 ----
  const isGarden = /空中花园/.test(room);
  s += poly([P(0,0,T),P(1,0,T),P(1,1,T),P(0,1,T)], S.ceil);
  s += poly([P(0,0,0),P(0,1,0),P(0,1,T),P(0,0,T)], shade(S.wall,-0.06));
  s += poly([P(1,0,0),P(1,1,0),P(1,1,T),P(1,0,T)], shade(S.wall,-0.1));
  s += poly(backQ(c,0,1,0,T), S.wall);
  s += poly([P(0,0,0),P(1,0,0),P(1,1,0),P(0,1,0)], S.floorC);
  s += floorTex(c, S, rng);
  s += poly([P(0,0,0),P(1,0,0),P(1,1,0),P(0,1,0)], `url(#${id}fl)`);
  // 墙角线
  s += `<g stroke="#000" stroke-opacity=".08" stroke-width="1" fill="none"><polyline points="${pts([P(0,1,T),P(0,0,T),P(1,0,T),P(1,1,T)])}"/><polyline points="${pts([P(0,1,0),P(0,0,0),P(1,0,0),P(1,1,0)])}"/></g>`;
  if(base==='bare'){ for(let i=0;i<14;i++){ const u=rng(), h=rng()*T; const p=P(u,0,h); s+=`<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="${r1(rng.range(6,22))}" ry="${r1(rng.range(3,9))}" fill="#000" opacity=".05"/>`; } }
  if(base==='dated'){ for(let i=0;i<5;i++){ const p=P(rng(),0,rng.range(0.5,0.95)*T); s+=`<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="${r1(rng.range(8,18))}" ry="${r1(rng.range(5,12))}" fill="#B8A06A" opacity=".18"/>`; } }

  // ---- 按房间画 ----
  const kitchen = /厨|餐厨/.test(room), bedroom = /卧/.test(room);
  if(isGarden) s += gardenScene(c, S, L, base, rng);
  else if(kitchen) s += kitchenScene(c, S, L, base, furnished, rng, room);
  else if(bedroom) s += bedroomScene(c, S, L, base, furnished, rng, room);
  else s += livingScene(c, S, L, base, furnished, rng, room, wide, tall, id);

  // ---- 天花灯 ----
  s += ceilingLights(c, S, base, rng, id, tall);
  // 光感与暗角
  s += `<rect width="${W}" height="${H}" fill="url(#${id}glow)" opacity=".35"/>`;
  s += `<rect x="8" y="${H-26}" width="${base==='done'?118:96}" height="18" rx="3" fill="#000" opacity=".45"/><text x="16" y="${H-13}" font-size="11" fill="#fff" font-weight="600">${base==='bare'?'毛坯现状':base==='dated'?'旧装现状':base==='devfin'?'开发商精装':base==='plainOld'?'原有简装':'效果图 · '+S.name}</text>`;
  return s + '</svg>';
}
export function floorTex(c, S, rng){
  const P=c.P; let s='';
  const line = (a,b,col,w=1,op=1)=>`<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="${col}" stroke-width="${w}" opacity="${op}"/>`;
  if(S.floor==='concrete'){ for(let i=0;i<10;i++){ const p=P(rng(),rng.range(0,0.6),0); s+=`<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="${r1(rng.range(10,40))}" ry="${r1(rng.range(3,10))}" fill="#000" opacity=".06"/>`; } return s; }
  const grid = n => { for(let i=1;i<n;i++) s+=line(P(i/n,0,0),P(i/n,1,0),'#000',0.8,0.12); for(let j=1;j<14;j++){ const d=j*(1/n)*0.55; if(d>1) break; s+=line(P(0,d,0),P(1,d,0),'#000',0.8,0.12); } };
  if(S.floor==='tile') grid(6);
  if(S.floor==='dtile'){ for(let i=1;i<9;i++) s+=line(P(i/9,0,0),P(i/9,1,0),'#A8996F',0.8,0.5); for(let j=1;j<20;j++){ const d=j*0.06; s+=line(P(0,d,0),P(1,d,0),'#A8996F',0.8,0.5); } }
  if(S.floor==='slab') grid(3);
  if(S.floor==='marble'){ grid(4); for(let i=0;i<7;i++){ const a=P(rng(),rng.range(0,0.5),0), b=P(rng(),rng.range(0.1,0.8),0); s+=`<path d="M${r1(a[0])} ${r1(a[1])} Q${r1((a[0]+b[0])/2+rng.range(-30,30))} ${r1((a[1]+b[1])/2)} ${r1(b[0])} ${r1(b[1])}" stroke="#B9B2A7" stroke-width=".8" fill="none" opacity=".6"/>`; } }
  if(S.floor==='wood'){ for(let i=1;i<18;i++) s+=line(P(i/18,0,0),P(i/18,1,0),shade(S.floorC,-0.25),0.7,0.45); for(let i=0;i<40;i++){ const u=Math.floor(rng()*18)/18, d=rng.range(0,0.7); s+=line(P(u,d,0),P(u+1/18,d,0),shade(S.floorC,-0.25),0.6,0.35); } }
  return s;
}
export function windowBack(c, u0,u1,h0,h1, L, S, base, rng, opt={}){
  const a=c.P(u0,0,h1), b=c.P(u1,0,h0); const x=a[0], y=a[1], w=b[0]-a[0], h=b[1]-a[1]; const cid='wv'+uid();
  let s = `<clipPath id="${cid}"><rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"/></clipPath><g clip-path="url(#${cid})">${viewArt(viewOf(L), x, y, w, h, rng)}</g>`;
  const fc = base==='bare' ? '#8E8C87' : base==='dated' ? '#C9C3B4' : (S.light==='lantern' ? S.wood : '#3F4448');
  s += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="none" stroke="${fc}" stroke-width="${opt.thin?2:3.5}"/>`;
  const n = opt.mullions ?? Math.max(1, Math.round(w/70));
  for(let i=1;i<=n;i++){ const mx = x + w*i/(n+1); s+=`<line x1="${r1(mx)}" x2="${r1(mx)}" y1="${r1(y)}" y2="${r1(y+h)}" stroke="${fc}" stroke-width="2"/>`; }
  if(opt.transom) s+=`<line x1="${r1(x)}" x2="${r1(x+w)}" y1="${r1(y+h*0.5)}" y2="${r1(y+h*0.5)}" stroke="${fc}" stroke-width="2"/>`;
  if(base==='dated' && L.type==='old'){ for(let i=0;i<=8;i++){ s+=`<line x1="${r1(x+w*i/8)}" x2="${r1(x+w*i/8)}" y1="${r1(y)}" y2="${r1(y+h)}" stroke="#6E6A62" stroke-width="1.4"/>`; } s+=`<line x1="${r1(x)}" x2="${r1(x+w)}" y1="${r1(y+h*0.5)}" y2="${r1(y+h*0.5)}" stroke="#6E6A62" stroke-width="1.4"/>`; }
  if(base!=='bare' && base!=='devfin' && !opt.noCurtain){ const cw = Math.min(26, w*0.14); for(const cx of [x-cw*0.6, x+w-cw*0.4]){ s+=`<rect x="${r1(cx)}" y="${r1(y-6)}" width="${r1(cw)}" height="${r1(h+12)}" fill="${S.curtain}"/>`; for(let k=1;k<4;k++) s+=`<line x1="${r1(cx+cw*k/4)}" x2="${r1(cx+cw*k/4)}" y1="${r1(y-6)}" y2="${r1(y+h+6)}" stroke="${shade(S.curtain,-0.15)}" stroke-width="1"/>`; } }
  return s;
}
export function artOnWall(c, u0,u1,h0,h1, S, rng){
  const a=c.P(u0,0,h1), b=c.P(u1,0,h0); const x=a[0], y=a[1], w=b[0]-x, h=b[1]-y;
  if(S.art==='none') return '';
  if(S.art==='calendar') return `<rect x="${r1(x+w*0.35)}" y="${r1(y)}" width="${r1(w*0.3)}" height="${r1(h*0.9)}" fill="#F4F1E8" stroke="#B9AF9C"/><rect x="${r1(x+w*0.35)}" y="${r1(y)}" width="${r1(w*0.3)}" height="${r1(h*0.3)}" fill="#C8473D"/><text x="${r1(x+w*0.5)}" y="${r1(y+h*0.7)}" text-anchor="middle" font-size="9" fill="#555">2003</text>`;
  if(S.art==='arch') return `<path d="M${r1(x+w*0.3)} ${r1(y+h)} L${r1(x+w*0.3)} ${r1(y+h*0.45)} A${r1(w*0.2)} ${r1(w*0.2)} 0 0 1 ${r1(x+w*0.7)} ${r1(y+h*0.45)} L${r1(x+w*0.7)} ${r1(y+h)} Z" fill="${shade(S.wall,-0.07)}"/><circle cx="${r1(x+w*0.5)}" cy="${r1(y+h*0.6)}" r="${r1(w*0.07)}" fill="${S.accent}" opacity=".7"/>`;
  let inner='';
  if(S.art==='abstract') inner = `<circle cx="${r1(x+w*0.35)}" cy="${r1(y+h*0.45)}" r="${r1(h*0.22)}" fill="${S.accent}" opacity=".85"/><rect x="${r1(x+w*0.5)}" y="${r1(y+h*0.3)}" width="${r1(w*0.25)}" height="${r1(h*0.45)}" fill="#3E4A57" opacity=".75"/>`;
  if(S.art==='ink') inner = `<path d="M${r1(x+w*0.05)} ${r1(y+h*0.8)} Q${r1(x+w*0.25)} ${r1(y+h*0.25)} ${r1(x+w*0.45)} ${r1(y+h*0.7)} T${r1(x+w*0.95)} ${r1(y+h*0.55)}" stroke="#4A4A48" stroke-width="2" fill="none" opacity=".75"/><path d="M${r1(x+w*0.15)} ${r1(y+h*0.85)} Q${r1(x+w*0.4)} ${r1(y+h*0.45)} ${r1(x+w*0.7)} ${r1(y+h*0.85)}" stroke="#7A7A76" stroke-width="1.4" fill="none" opacity=".6"/><circle cx="${r1(x+w*0.8)}" cy="${r1(y+h*0.25)}" r="${r1(h*0.08)}" fill="${S.accent}" opacity=".8"/>`;
  if(S.art==='gold') inner = `<path d="M${r1(x+w*0.1)} ${r1(y+h*0.8)} L${r1(x+w*0.5)} ${r1(y+h*0.2)} L${r1(x+w*0.9)} ${r1(y+h*0.8)}" stroke="${S.accent}" stroke-width="2" fill="none"/><circle cx="${r1(x+w*0.5)}" cy="${r1(y+h*0.55)}" r="${r1(h*0.15)}" fill="none" stroke="${S.accent}" stroke-width="1.5"/>`;
  if(S.art==='line') inner = `<path d="M${r1(x+w*0.15)} ${r1(y+h*0.7)} C${r1(x+w*0.3)} ${r1(y+h*0.1)} ${r1(x+w*0.6)} ${r1(y+h*0.9)} ${r1(x+w*0.85)} ${r1(y+h*0.3)}" stroke="#2B2A28" stroke-width="1.3" fill="none"/>`;
  const frame = S.art==='gold' ? S.accent : S.art==='ink' ? S.wood : '#2E2E2C';
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="#F7F5F0" stroke="${frame}" stroke-width="2"/>${inner}`;
}
export function plant(c, u, d, size, rng){
  const p = c.P(u, d, 0); const q = c.P(u, d, size); const r = Math.abs(p[1]-q[1]);
  let s = box(c, u-0.025, u+0.025, d-0.03, d+0.03, 0, size*0.28, '#D8D2C6');
  for(let i=0;i<7;i++){ const a=rng.range(-1,1); s+=`<ellipse cx="${r1(q[0]+a*r*0.35)}" cy="${r1(q[1]+r*rng.range(0.1,0.55))}" rx="${r1(r*0.16)}" ry="${r1(r*0.32)}" transform="rotate(${r1(a*40)} ${r1(q[0]+a*r*0.35)} ${r1(q[1]+r*0.35)})" fill="${rng.pick(['#5F8A58','#6E9A62','#4E7A4A'])}"/>`; }
  return s;
}
export function sofa(c, u0, u1, d0, S, rng){
  const col = S.sofa; let s='';
  s += box(c,u0,u1,d0,d0+0.06,0,0.27,shade(col,-0.05));
  s += box(c,u0,u1,d0+0.06,d0+0.2,0,0.13,col);
  s += box(c,u0,u0+0.035,d0,d0+0.2,0,0.19,shade(col,-0.03));
  s += box(c,u1-0.035,u1,d0,d0+0.2,0,0.19,shade(col,-0.03));
  const n = Math.max(2, Math.round((u1-u0)/0.15));
  for(let i=0;i<n;i++){ const a=u0+0.04+i*(u1-u0-0.08)/n, b=a+(u1-u0-0.08)/n-0.01; s+=box(c,a,b,d0+0.06,d0+0.19,0.13,0.155,shade(col,0.06)); }
  const p1=c.P(u0+0.08,d0+0.065,0.2), p2=c.P(u1-0.12,d0+0.065,0.2);
  s += `<rect x="${r1(p1[0])}" y="${r1(p1[1]-8)}" width="16" height="14" rx="3" fill="${S.accent}" transform="rotate(-8 ${r1(p1[0])} ${r1(p1[1])})"/><rect x="${r1(p2[0])}" y="${r1(p2[1]-8)}" width="16" height="14" rx="3" fill="${shade(S.accent,0.35)}" transform="rotate(7 ${r1(p2[0])} ${r1(p2[1])})"/>`;
  return s;
}
export function livingScene(c, S, L, base, furnished, rng, room, wide, tall, id){
  const P=c.P; let s='';
  const bare = base==='bare';
  // 背景墙：窗 + 挂画/电视墙
  if(wide){ s += windowBack(c, 0.03, 0.97, 0.06, 0.94, L, S, base, rng, {mullions:5, noCurtain:true}); }
  else if(tall){ s += windowBack(c, 0.06, 0.58, 0.05*c.top, 0.95*c.top, L, S, base, rng, {mullions:3, transom:true, noCurtain:bare}); }
  else if(/复式/.test(room)){ s += windowBack(c, 0.06, 0.4, 0.25, 1.5, L, S, base, rng, {mullions:2, transom:true}); }
  else s += windowBack(c, 0.06, 0.4, 0.16, 0.86, L, S, base, rng, {});
  if(/复式/.test(room)){ s += box(c,0.55,1,0,0.3,0.9,0.98,'#DAD6CE'); s += poly([P(0.55,0.3,0.98),P(1,0.3,0.98),P(1,0.3,1.3),P(0.55,0.3,1.3)],'rgba(200,225,235,.45)','stroke="#9AA6AE" stroke-width="1"'); s += poly([P(0.55,0,0.98),P(0.55,0.3,0.98),P(0.55,0.3,1.3),P(0.55,0,1.3)],'rgba(200,225,235,.35)'); for(let i=9;i>=0;i--) s+= box(c,0.43,0.54,0.34-i*0.033,0.373-i*0.033,0.098*(i+1)-0.03,0.098*(i+1),S.wood); s += poly([P(0.54,0.37,0),P(0.54,0.04,0.98),P(0.54,0.04,0.93),P(0.54,0.37,-0.05)], shade(S.wood,-0.2)); }
  if(tall && /挑空客厅/.test(room)){ s += box(c,0.64,1,0,0.14,1,1.07,'#E6E2DA'); s += poly([P(0.64,0.14,1.07),P(1,0.14,1.07),P(1,0.14,1.45),P(0.64,0.14,1.45)],'rgba(200,225,235,.45)','stroke="#8D989F" stroke-width="1.2"'); s += poly([P(0.64,0,1.07),P(0.64,0.14,1.07),P(0.64,0.14,1.45),P(0.64,0,1.45)],'rgba(200,225,235,.35)'); if(!bare) for(let i=0;i<12;i++) s+= box(c,0.86,1,0.56-i*0.035,0.595-i*0.035,0,(i+1)/12*1.05,S.wood); }
  if(bare){
    s += poly(leftQ(c,0.2,0.24,0,0.95),'#8D8B86');
    const p=P(0.7,0.25,0), q=P(0.7,0.25,0.62); const lh=p[1]-q[1]; s += `<g stroke="#6B5E4B" stroke-width="2.4"><line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(p[0]+lh*0.22)}" y2="${r1(q[1])}"/><line x1="${r1(p[0]+lh*0.4)}" y1="${r1(p[1])}" x2="${r1(p[0]+lh*0.22)}" y2="${r1(q[1])}"/></g>`;
    s += box(c,0.2,0.25,0.3,0.35,0,0.06,'#D6D0C4') + box(c,0.27,0.32,0.36,0.41,0,0.06,'#C8473D');
    return s;
  }
  if(base==='devfin'){ s += box(c,0,0.04,0.2,0.56,0,0.09,'#E9E6E0'); return s; }
  if(!wide && !tall) s += artOnWall(c, 0.5, 0.86, 0.48, 0.78, S, rng);
  // 电视墙（左墙）
  const tvq = leftQ(c, 0.12, 0.6, 0, 1);
  if(S.tv==='stone') s += poly(leftQ(c,0.14,0.56,0,0.92), '#D7D4CE');
  if(S.tv==='rock'){ s += poly(leftQ(c,0.12,0.6,0,1), '#3B3A37'); for(let i=0;i<4;i++){ const a=P(0,rng.range(0.12,0.6),rng.range(0,1)), b=P(0,rng.range(0.12,0.6),rng.range(0,1)); s+=`<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="#77736C" stroke-width=".8" opacity=".7"/>`; } }
  if(S.tv==='wood'){ s += poly(tvq, S.wood); for(let i=1;i<14;i++){ const d=0.12+i*0.48/14; s+=`<line x1="${r1(P(0,d,0)[0])}" y1="${r1(P(0,d,0)[1])}" x2="${r1(P(0,d,1)[0])}" y2="${r1(P(0,d,1)[1])}" stroke="${shade(S.wood,-0.25)}" stroke-width="1"/>`; } }
  if(S.tv==='grille'){ s += poly(tvq, shade(S.wall,-0.04)); for(let i=0;i<22;i++){ const d=0.12+i*0.48/22; s+=`<line x1="${r1(P(0,d,0.02)[0])}" y1="${r1(P(0,d,0.02)[1])}" x2="${r1(P(0,d,0.98)[0])}" y2="${r1(P(0,d,0.98)[1])}" stroke="${S.wood}" stroke-width="1.6"/>`; } }
  if(S.tv==='panel'){ s += poly(tvq, shade(S.wall,0.04)); for(const [d0,d1] of [[0.14,0.3],[0.32,0.42],[0.44,0.58]]) s+= poly(leftQ(c,d0,d1,0.08,0.9),'none',`stroke="${S.accent}" stroke-width="1.2"`); }
  if(S.tv==='crt'){ s += box(c,0,0.06,0.2,0.48,0,0.18,'#8A5A3A'); s += box(c,0,0.09,0.27,0.4,0.18,0.36,'#5B5550'); s += poly(leftQ(c,0.28,0.39,0.21,0.33),'#3B4A55'); }
  else { s += box(c,0,0.05,0.16,0.56,0,0.11,S.tv==='grille'?S.wood:shade(S.cab,-0.05)); s += poly(leftQ(c,0.2,0.5,0.3,0.56),`url(#${id}tv)`); }
  // 沙发、茶几、地毯
  const su0 = wide?0.36:0.42, su1 = wide?0.86:0.92;
  s += poly(floorQ(c, su0-0.04, su1, 0.2, 0.55), S.rug);
  if(base==='dated'){ s += sofa(c, su0+0.06, su1, 0.02, {...S, sofa:'#7A5236', accent:'#C8B88E'}, rng); s += box(c,0.5,0.76,0.33,0.43,0,0.1,'#9FB6BE',{top:'#BFD3D9'}); }
  else {
    s += sofa(c, su0, su1, 0.02, S, rng);
    if(S.tv==='grille'){ s += box(c,0.52,0.78,0.32,0.43,0,0.09,S.wood); s += box(c,0.6,0.64,0.36,0.39,0.09,0.13,'#E8E2D6'); }
    else if(S.floor==='marble'||S.floor==='slab'){ s += `<ellipse cx="${r1(P(0.64,0.38,0.08)[0])}" cy="${r1(P(0.64,0.38,0.08)[1])}" rx="34" ry="9" fill="${S.accent==='#2B2A28'?'#3A3936':'#E9E3D7'}" stroke="${S.accent}" stroke-width="1.2"/>`; }
    else s += box(c,0.52,0.78,0.32,0.42,0.07,0.095,S.wood) + box(c,0.54,0.56,0.33,0.41,0,0.07,shade(S.wood,-0.2)) + box(c,0.74,0.76,0.33,0.41,0,0.07,shade(S.wood,-0.2));
  }
  if(wide){ // 横厅：餐桌 + 吊灯
    for(const u of [0.1,0.18,0.26]) s += box(c,u-0.025,u+0.025,0.06,0.09,0,0.36,shade(S.sofa,0.2)) + box(c,u-0.025,u+0.025,0.06,0.12,0.16,0.19,shade(S.sofa,0.25));
    s += box(c,0.06,0.3,0.12,0.26,0.27,0.29,S.wood) + box(c,0.07,0.085,0.13,0.25,0,0.27,shade(S.wood,-0.2)) + box(c,0.275,0.29,0.13,0.25,0,0.27,shade(S.wood,-0.2));
    for(const u of [0.12,0.24]) s += box(c,u-0.025,u+0.025,0.29,0.32,0,0.36,shade(S.sofa,0.2)) + box(c,u-0.025,u+0.025,0.25,0.31,0.16,0.19,shade(S.sofa,0.25));
  }
  if(!wide) s += plant(c, 0.95, 0.12, 0.4, rng);
  else s += plant(c, 0.97, 0.3, 0.45, rng);
  if(S.light!=='tube' && !tall && !wide){ const p=P(0.97,0.45,0), q=P(0.97,0.45,0.55); s+=`<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="#2F3236" stroke-width="2"/><path d="M${r1(q[0]-12)} ${r1(q[1]+10)} L${r1(q[0]-6)} ${r1(q[1]-6)} L${r1(q[0]+6)} ${r1(q[1]-6)} L${r1(q[0]+12)} ${r1(q[1]+10)} Z" fill="${S.curtain}"/>`; }
  return s;
}
export function bedroomScene(c, S, L, base, furnished, rng, room){
  const P=c.P; let s='';
  // 左墙窗
  const q = leftQ(c, 0.12, 0.42, 0.22, 0.86); const cid='bw'+uid();
  const xs=q.map(p=>p[0]), ys=q.map(p=>p[1]);
  s += `<clipPath id="${cid}"><polygon points="${pts(q)}"/></clipPath><g clip-path="url(#${cid})">${viewArt(viewOf(L), Math.min(...xs), Math.min(...ys), Math.max(...xs)-Math.min(...xs), Math.max(...ys)-Math.min(...ys), rng)}</g>`;
  s += poly(q,'none',`stroke="${base==='bare'?'#8E8C87':'#4A4E52'}" stroke-width="3"`);
  if(base==='bare'||base==='devfin'){ if(base==='bare'){ const p=c.P(0.6,0.2,0); s+=box(c,0.55,0.62,0.18,0.25,0,0.08,'#D6D0C4'); } return s; }
  if(base!=='bare') { for(const d of [0.08,0.44]){ s += poly(leftQ(c,d,d+0.05,0.18,0.9), S.curtain); } }
  if(S.tv==='grille' || S.tv==='panel' || S.tv==='wood' || S.tv==='rock') s += poly(backQ(c,0.24,0.76,0,0.58), S.tv==='rock'?'#4A4844':S.tv==='panel'?shade(S.wall,0.05):S.tv==='grille'?shade(S.wood,0.35):shade(S.wood,0.3));
  s += artOnWall(c, 0.38, 0.62, 0.62, 0.84, S, rng);
  s += poly(backQ(c,0.3,0.7,0,0.36), shade(S.bed,-0.1));
  s += poly(floorQ(c,0.2,0.82,0.1,0.62), S.rug);
  s += box(c,0.3,0.7,0,0.44,0,0.08,shade(S.wood,0)) + box(c,0.31,0.69,0,0.43,0.08,0.13,'#F4F2EC') + box(c,0.31,0.69,0.15,0.43,0.13,0.15,S.bed,{top:shade(S.bed,0.05)});
  s += box(c,0.34,0.48,0.02,0.08,0.13,0.18,'#FBFAF7') + box(c,0.52,0.66,0.02,0.08,0.13,0.18,'#FBFAF7');
  s += box(c,0.2,0.27,0,0.08,0,0.13,S.wood) + box(c,0.73,0.8,0,0.08,0,0.13,S.wood);
  for(const u of [0.235,0.765]){ const p=P(u,0.04,0.13); s+=`<rect x="${r1(p[0]-5)}" y="${r1(p[1]-16)}" width="10" height="12" rx="2" fill="${S.curtain}"/><line x1="${r1(p[0])}" x2="${r1(p[0])}" y1="${r1(p[1]-4)}" y2="${r1(p[1])}" stroke="#555"/>`; }
  // 衣柜（右墙）
  s += box(c,0.88,1,0.06,0.62,0,0.9, base==='dated'?'#9A6B45':S.cab, {front:shade(base==='dated'?'#9A6B45':S.cab,-0.05)});
  for(let i=1;i<4;i++){ const d=0.06+i*0.56/4; const a=P(0.88,d,0.02), b=P(0.88,d,0.88); s+=`<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="#000" stroke-opacity=".18"/>`; }
  return s;
}
export function kitchenScene(c, S, L, base, furnished, rng, room){
  const P=c.P; let s='';
  s += windowBack(c, 0.36, 0.64, 0.46, 0.84, L, S, base, rng, {mullions:1, noCurtain:true, thin:true});
  if(base==='bare'){ s += poly(backQ(c,0.08,0.1,0,0.9),'#8D8B86') + poly(backQ(c,0.8,0.82,0.3,0.95),'#8D8B86'); return s; }
  const cab = base==='dated' ? '#D9D2C2' : S.cab, top = base==='dated' ? '#BEB6A5' : S.counter;
  if(S.floor!=='dtile') s += poly(backQ(c,0,1,0.32,0.56), shade(S.wall, S.counter==='#3E4245'?-0.03:0.03));
  else for(let i=0;i<12;i++) for(let j=0;j<4;j++){ s += poly(backQ(c,i/12,(i+1)/12,0.32+j*0.06,0.38+j*0.06),'#F0EEE8','stroke="#C9C3B6" stroke-width=".6"'); }
  s += box(c,0,1,0,0.12,0,0.3,cab) + box(c,0,1,0,0.13,0.3,0.33,top);
  for(let i=1;i<8;i++){ const a=P(i/8,0.12,0.02), b=P(i/8,0.12,0.28); s+=`<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="#000" stroke-opacity=".15"/>`; }
  s += box(c,0,0.34,0,0.07,0.58,0.86,cab) + box(c,0.66,1,0,0.07,0.58,0.86,cab);
  // 灶台 + 油烟机
  const h1=P(0.16,0.02,0.86), h2=P(0.3,0.02,0.86), h3=P(0.32,0.08,0.6), h4=P(0.14,0.08,0.6);
  s += poly([h1,h2,h3,h4], base==='dated'?'#BFB9AE':'#3B3E41');
  const z1=P(0.18,0.06,0.335), z2=P(0.27,0.06,0.335); s += `<ellipse cx="${r1(z1[0])}" cy="${r1(z1[1])}" rx="7" ry="2.5" fill="#222"/><ellipse cx="${r1(z2[0])}" cy="${r1(z2[1])}" rx="7" ry="2.5" fill="#222"/>`;
  const sk=P(0.5,0.06,0.335); s += `<rect x="${r1(sk[0]-16)}" y="${r1(sk[1]-3)}" width="32" height="5" rx="2" fill="#9AA2A8"/><path d="M${r1(sk[0])} ${r1(sk[1]-3)} q0 -14 8 -14" stroke="#9AA2A8" stroke-width="2" fill="none"/>`;
  // 冰箱
  s += box(c,0.86,1,0.15,0.32,0,0.72, base==='dated'?'#E7E3DA':'#C9CDD0');
  if(/岛台|餐厨/.test(room) && base!=='dated'){ s += box(c,0.28,0.72,0.34,0.48,0,0.31,shade(S.cab,-0.04)) + box(c,0.27,0.73,0.33,0.49,0.31,0.335,S.counter); for(const u of [0.36,0.5,0.64]) s += box(c,u-0.006,u+0.006,0.53,0.54,0,0.24,'#555') + box(c,u-0.03,u+0.03,0.51,0.56,0.24,0.27,S.sofa); }
  else if(furnished && base!=='dated') s += plant(c, 0.62, 0.05, 0.12, rng);
  return s;
}
export function gardenScene(c, S, L, base, rng){
  const P=c.P; let s='';
  // 空中花园：背墙打开成天空 + 栏杆
  const a=P(0,0,c.top), b=P(1,0,0.0); s += `<g>${viewArt(viewOf(L), a[0], a[1], b[0]-a[0], b[1]-a[1], rng)}</g>`;
  s += poly(backQ(c,0,1,0,0.42), base==='bare' ? 'rgba(160,160,155,.55)' : 'rgba(190,215,225,.45)', `stroke="${base==='bare'?'#8D8B86':'#6E7A80'}" stroke-width="2"`);
  s += poly(backQ(c,0,1,c.top*0.9,c.top), shade(S.wall,-0.05));
  if(base==='bare') return s + box(c,0.4,0.48,0.2,0.26,0,0.06,'#D6D0C4');
  if(S.floor!=='concrete'){ const deck='#A98361'; s += poly([P(0,0,0),P(1,0,0),P(1,1,0),P(0,1,0)], deck); for(let i=1;i<16;i++) s+=`<line x1="${r1(P(0,i*0.05,0)[0])}" y1="${r1(P(0,i*0.05,0)[1])}" x2="${r1(P(1,i*0.05,0)[0])}" y2="${r1(P(1,i*0.05,0)[1])}" stroke="#7F5F43" stroke-width=".8"/>`; }
  for(const [u,d,z] of [[0.07,0.08,0.75],[0.93,0.1,0.7],[0.14,0.4,0.5],[0.86,0.42,0.55],[0.3,0.04,0.4],[0.72,0.04,0.45]]) s += plant(c,u,d,z,rng);
  s += box(c,0.36,0.64,0.16,0.3,0,0.16,S.sofa) + box(c,0.36,0.64,0.16,0.2,0,0.32,shade(S.sofa,-0.05));
  s += box(c,0.43,0.57,0.38,0.48,0,0.14,S.wood);
  return s;
}
export function ceilingLights(c, S, base, rng, id, tall){
  const P=c.P; let s='';
  const T=c.top;
  if(base==='bare'){ const p=P(0.5,0.3,T), q=P(0.5,0.3,T-0.18); return `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="#333" stroke-width="1"/><circle cx="${r1(q[0])}" cy="${r1(q[1]+5)}" r="5" fill="#FFF3C8"/><circle cx="${r1(q[0])}" cy="${r1(q[1]+5)}" r="22" fill="url(#${id}glow)"/>`; }
  const L = S.light;
  if(L==='tube'){ return poly([P(0.4,0.25,T-0.005),P(0.6,0.25,T-0.005),P(0.6,0.29,T-0.005),P(0.4,0.29,T-0.005)],'#F7F7F2','stroke="#BDB8AD"'); }
  if(L==='round'){ const p=P(0.5,0.3,T); return `<ellipse cx="${r1(p[0])}" cy="${r1(p[1]+3)}" rx="34" ry="7" fill="#FBFAF4" stroke="#DCD8CE"/><circle cx="${r1(p[0])}" cy="${r1(p[1]+10)}" r="40" fill="url(#${id}glow)"/>`; }
  if(L==='down'){ for(const [u,d] of [[0.3,0.2],[0.7,0.2],[0.3,0.45],[0.7,0.45],[0.5,0.32]]){ const p=P(u,d,T); s+=`<ellipse cx="${r1(p[0])}" cy="${r1(p[1])}" rx="4" ry="1.6" fill="#FFF8E0"/>`; } return s; }
  if(L==='track'){ const a=P(0.3,0.05,T), b=P(0.3,0.5,T); s+=`<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="#2D2F31" stroke-width="1.6"/>`; for(let i=0;i<4;i++){ const p=P(0.3,0.1+i*0.12,T); s+=`<rect x="${r1(p[0]-2)}" y="${r1(p[1])}" width="4" height="5" fill="#2D2F31"/><circle cx="${r1(p[0])}" cy="${r1(p[1]+16)}" r="12" fill="url(#${id}glow)"/>`; } return s; }
  if(L==='rattan'){ const p=P(0.66,0.3,T), q=P(0.66,0.3,T-0.22); return `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="#7C6248"/><ellipse cx="${r1(q[0])}" cy="${r1(q[1]+10)}" rx="20" ry="13" fill="#C9A577"/><path d="M${r1(q[0]-20)} ${r1(q[1]+10)} h40" stroke="#9E7C55"/><circle cx="${r1(q[0])}" cy="${r1(q[1]+26)}" r="34" fill="url(#${id}glow)"/>`; }
  if(L==='lantern'){ const p=P(0.66,0.3,T), q=P(0.66,0.3,T-0.2); return `<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="#3A2A1E"/><rect x="${r1(q[0]-12)}" y="${r1(q[1])}" width="24" height="26" fill="#F3E3C0" stroke="#4A3628" stroke-width="2"/><line x1="${r1(q[0])}" x2="${r1(q[0])}" y1="${r1(q[1])}" y2="${r1(q[1]+26)}" stroke="#4A3628"/><circle cx="${r1(q[0])}" cy="${r1(q[1]+14)}" r="36" fill="url(#${id}glow)"/>`; }
  if(L==='tray'){ s += poly([P(0.15,0.08,T),P(0.85,0.08,T),P(0.85,0.7,T),P(0.15,0.7,T)], 'none', `stroke="#FFE7A8" stroke-width="3" opacity=".9"`); const p=P(0.66,0.32,T), q=P(0.66,0.32,tall?T*0.55:T-0.22); s+=`<line x1="${r1(p[0])}" y1="${r1(p[1])}" x2="${r1(q[0])}" y2="${r1(q[1])}" stroke="${S.accent}"/>`; for(const r of [16,10]) s+=`<ellipse cx="${r1(q[0])}" cy="${r1(q[1]+6)}" rx="${r}" ry="${r*0.3}" fill="none" stroke="${S.accent}" stroke-width="2"/>`; s+=`<circle cx="${r1(q[0])}" cy="${r1(q[1]+8)}" r="38" fill="url(#${id}glow)"/>`; return s; }
  if(L==='strip'){ for(const u of [0.25,0.75]){ const a=P(u,0,T), b=P(u,0.8,T); s+=`<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="#FFF3D1" stroke-width="2.5"/>`; } return s; }
  return s;
}
