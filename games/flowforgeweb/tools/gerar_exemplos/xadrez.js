var $=function(i){return document.getElementById(i)};
if(!window.ffChess){(function(){
var C=window.ffChess={};
function snd(n,v){try{if(window.Sons)window.Sons.play(n,v)}catch(e){}} // sons (componente Game Sound), se o projeto tiver
var SYM={K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟︎'};
var PT={K:'R',Q:'D',R:'T',B:'B',N:'C',P:''};
var NOME={Q:'Dama',R:'Torre',B:'Bispo',N:'Cavalo'};
var VAL={P:100,N:320,B:330,R:500,Q:900,K:0};
var KEY='ffChessV1';
var KN=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
var KG=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
var DG=[[-1,-1],[-1,1],[1,-1],[1,1]];
var OR=[[-1,0],[1,0],[0,-1],[0,1]];
function isW(p){return p>='A'&&p<='Z'}
function col(p){return isW(p)?'w':'b'}
function sqName(i){return 'abcdefgh'.charAt(i%8)+(8-(i>>3))}
function startBoard(){var b=[],back='rnbqkbnr',i;for(i=0;i<64;i++)b.push(null);for(i=0;i<8;i++){b[i]=back.charAt(i);b[8+i]='p';b[48+i]='P';b[56+i]=back.charAt(i).toUpperCase()}return b}
function newState(){return{b:startBoard(),t:'w',c:{K:1,Q:1,k:1,q:1},ep:-1,hm:0,fm:1}}

/* ---------- regras ---------- */
function attacked(b,sq,by){
 var r=sq>>3,c=sq&7,i,d,rr,cc,p,L=function(x){return by==='w'?x:x.toLowerCase()};
 var pr=by==='w'?r+1:r-1;
 if(pr>=0&&pr<8){if(c>0&&b[pr*8+c-1]===L('P'))return true;if(c<7&&b[pr*8+c+1]===L('P'))return true}
 for(i=0;i<8;i++){rr=r+KN[i][0];cc=c+KN[i][1];if(rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===L('N'))return true}
 for(i=0;i<8;i++){rr=r+KG[i][0];cc=c+KG[i][1];if(rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===L('K'))return true}
 for(i=0;i<4;i++){rr=r+DG[i][0];cc=c+DG[i][1];while(rr>=0&&rr<8&&cc>=0&&cc<8){p=b[rr*8+cc];if(p){if(p===L('B')||p===L('Q'))return true;break}rr+=DG[i][0];cc+=DG[i][1]}}
 for(i=0;i<4;i++){rr=r+OR[i][0];cc=c+OR[i][1];while(rr>=0&&rr<8&&cc>=0&&cc<8){p=b[rr*8+cc];if(p){if(p===L('R')||p===L('Q'))return true;break}rr+=OR[i][0];cc+=OR[i][1]}}
 return false}
function kingSq(b,t){var k=t==='w'?'K':'k',i;for(i=0;i<64;i++)if(b[i]===k)return i;return -1}
function inCheck(S,t){return attacked(S.b,kingSq(S.b,t),t==='w'?'b':'w')}
function gen(S){
 var b=S.b,t=S.t,out=[],opp=t==='w'?'b':'w',i,p,u,r,c,k,rr,cc,q,to;
 function addP(f,to,cap,lastRank){if(lastRank){['Q','R','B','N'].forEach(function(x){out.push({f:f,t:to,p:x,cap:cap||null})})}else out.push({f:f,t:to,cap:cap||null})}
 for(i=0;i<64;i++){p=b[i];if(!p||col(p)!==t)continue;u=p.toUpperCase();r=i>>3;c=i&7;
  if(u==='P'){
   var dir=t==='w'?-1:1,start=t==='w'?6:1,last=t==='w'?0:7,r1=r+dir;
   if(r1>=0&&r1<8){
    if(!b[r1*8+c]){addP(i,r1*8+c,null,r1===last);if(r===start&&!b[(r+2*dir)*8+c])out.push({f:i,t:(r+2*dir)*8+c,dp:1,cap:null})}
    for(k=-1;k<=1;k+=2){cc=c+k;if(cc<0||cc>7)continue;to=r1*8+cc;q=b[to];
     if(q&&col(q)!==t)addP(i,to,q,r1===last);
     else if(!q&&to===S.ep)out.push({f:i,t:to,ep:1,cap:t==='w'?'p':'P'})}}
  }else if(u==='N'||u==='K'){
   var D=u==='N'?KN:KG;
   for(k=0;k<8;k++){rr=r+D[k][0];cc=c+D[k][1];if(rr<0||rr>7||cc<0||cc>7)continue;to=rr*8+cc;q=b[to];if(!q||col(q)!==t)out.push({f:i,t:to,cap:q||null})}
   if(u==='K'){
    if(t==='w'&&i===60){
     if(S.c.K&&!b[61]&&!b[62]&&b[63]==='R'&&!attacked(b,60,opp)&&!attacked(b,61,opp)&&!attacked(b,62,opp))out.push({f:60,t:62,cs:'K',cap:null});
     if(S.c.Q&&!b[59]&&!b[58]&&!b[57]&&b[56]==='R'&&!attacked(b,60,opp)&&!attacked(b,59,opp)&&!attacked(b,58,opp))out.push({f:60,t:58,cs:'Q',cap:null})}
    if(t==='b'&&i===4){
     if(S.c.k&&!b[5]&&!b[6]&&b[7]==='r'&&!attacked(b,4,opp)&&!attacked(b,5,opp)&&!attacked(b,6,opp))out.push({f:4,t:6,cs:'K',cap:null});
     if(S.c.q&&!b[3]&&!b[2]&&!b[1]&&b[0]==='r'&&!attacked(b,4,opp)&&!attacked(b,3,opp)&&!attacked(b,2,opp))out.push({f:4,t:2,cs:'Q',cap:null})}}
  }else{
   var dirs=u==='B'?DG:(u==='R'?OR:DG.concat(OR));
   for(k=0;k<dirs.length;k++){rr=r+dirs[k][0];cc=c+dirs[k][1];
    while(rr>=0&&rr<8&&cc>=0&&cc<8){to=rr*8+cc;q=b[to];if(q){if(col(q)!==t)out.push({f:i,t:to,cap:q});break}out.push({f:i,t:to,cap:null});rr+=dirs[k][0];cc+=dirs[k][1]}}}}
 return out}
function apply(S,m){
 var b=S.b.slice(),p=b[m.f],t=S.t,cap=b[m.t],c={K:S.c.K,Q:S.c.Q,k:S.c.k,q:S.c.q};
 b[m.f]=null;
 if(m.ep)b[m.t+(t==='w'?8:-8)]=null;
 b[m.t]=m.p?(t==='w'?m.p:m.p.toLowerCase()):p;
 if(m.cs){if(m.t===62){b[63]=null;b[61]='R'}else if(m.t===58){b[56]=null;b[59]='R'}else if(m.t===6){b[7]=null;b[5]='r'}else{b[0]=null;b[3]='r'}}
 if(p==='K'){c.K=0;c.Q=0}if(p==='k'){c.k=0;c.q=0}
 [m.f,m.t].forEach(function(s){if(s===63)c.K=0;if(s===56)c.Q=0;if(s===7)c.k=0;if(s===0)c.q=0});
 return{b:b,t:t==='w'?'b':'w',c:c,ep:m.dp?(m.f+m.t)/2:-1,hm:(p.toUpperCase()==='P'||cap||m.ep)?0:S.hm+1,fm:S.fm+(t==='b'?1:0)}}
function legal(S){var me=S.t,opp=me==='w'?'b':'w';return gen(S).filter(function(m){var n=apply(S,m);return !attacked(n.b,kingSq(n.b,me),opp)})}
function perft(S,d){if(d===0)return 1;var L=legal(S);if(d===1)return L.length;var n=0,i;for(i=0;i<L.length;i++)n+=perft(apply(S,L[i]),d-1);return n}
function fromFen(f){
 var a=f.split(' '),b=[],i,ch,rows=a[0].split('/'),r,c;
 for(r=0;r<8;r++){for(i=0;i<rows[r].length;i++){ch=rows[r].charAt(i);if(ch>='1'&&ch<='8'){for(c=0;c<+ch;c++)b.push(null)}else b.push(ch)}}
 var cs=a[2]||'-';
 return{b:b,t:a[1]==='b'?'b':'w',c:{K:cs.indexOf('K')>=0?1:0,Q:cs.indexOf('Q')>=0?1:0,k:cs.indexOf('k')>=0?1:0,q:cs.indexOf('q')>=0?1:0},
  ep:a[3]&&a[3]!=='-'?(8-(+a[3].charAt(1)))*8+'abcdefgh'.indexOf(a[3].charAt(0)):-1,hm:+(a[4]||0),fm:+(a[5]||1)}}
function san(S,m,L){
 var p=S.b[m.f],u=p.toUpperCase(),s='',cap=S.b[m.t]||m.ep;
 if(m.cs)s=m.cs==='K'?'O-O':'O-O-O';
 else if(u==='P'){if(cap)s+=sqName(m.f).charAt(0)+'x';s+=sqName(m.t);if(m.p)s+='='+PT[m.p]}
 else{s+=PT[u];
  var amb=L.filter(function(x){return !(x.f===m.f&&x.t===m.t&&x.p===m.p)&&S.b[x.f]===p&&x.t===m.t});
  if(amb.length){var sf=amb.some(function(x){return(x.f&7)===(m.f&7)}),sr=amb.some(function(x){return(x.f>>3)===(m.f>>3)});
   if(!sf)s+=sqName(m.f).charAt(0);else if(!sr)s+=sqName(m.f).charAt(1);else s+=sqName(m.f)}
  if(cap)s+='x';s+=sqName(m.t)}
 var n=apply(S,m);if(inCheck(n,n.t))s+=legal(n).length?'+':'#';
 return s}

/* ---------- computador ---------- */
function evalS(S){
 var s=0,i,p,u,r,c,v,cen;
 for(i=0;i<64;i++){p=S.b[i];if(!p)continue;u=p.toUpperCase();r=i>>3;c=i&7;v=VAL[u];cen=7-Math.abs(c-3.5)-Math.abs(r-3.5);
  if(u==='N'||u==='B')v+=cen*6;else if(u==='P')v+=(isW(p)?6-r:r-1)*8+cen*2;else if(u==='Q')v+=cen;
  s+=isW(p)?v:-v}
 return S.t==='w'?s:-s}
function order(L){return L.sort(function(a,b){return((b.cap?VAL[b.cap.toUpperCase()]*10:0)+(b.p?800:0))-((a.cap?VAL[a.cap.toUpperCase()]*10:0)+(a.p?800:0))})}
function search(S,d,a,b){
 var L=legal(S),i,v;
 if(!L.length)return inCheck(S,S.t)?-100000-d:0;
 if(d===0)return evalS(S);
 order(L);
 for(i=0;i<L.length;i++){v=-search(apply(S,L[i]),d-1,-b,-a);if(v>a)a=v;if(a>=b)break}
 return a}
function best(S,depth,noise){
 var L=order(legal(S)),bm=null,bv=-Infinity,i,v;
 for(i=0;i<L.length;i++){v=-search(apply(S,L[i]),depth-1,-Infinity,Infinity)+(Math.random()*2-1)*noise;if(v>bv){bv=v;bm=L[i]}}
 return bm}

/* ---------- partida ---------- */
var G={S:newState(),hist:[],sel:-1,targets:[],flip:false,last:null,over:false,msg:'',thinking:false,legal:null,paused:false,timeMsg:'',cw:0,cb:0,t0:0,scored:false,score:[0,0,0],timer:null};
function modeKind(){var t=($('chessMode')&&$('chessMode').value)||'';if(t.indexOf('Computador x')>=0)return 'pcpc';if(t.indexOf('fácil')>=0)return 'easy';if(t.indexOf('médio')>=0)return 'med';return '2p'}
function cpuTurn(){var k=modeKind();return k==='pcpc'||((k==='easy'||k==='med')&&G.S.t==='b')}
function delay(){var v=($('chessSpeed')&&$('chessSpeed').value)||'';return v.indexOf('Lento')>=0?1000:(v.indexOf('Rápido')>=0?60:380)}
function tcOf(){var v=($('chessTime')&&$('chessTime').value)||'';
 var T={'1 min':[60,0],'3 min + 2 s':[180,2],'5 min':[300,0],'5 min + 3 s':[300,3],'10 min':[600,0],'15 min + 10 s':[900,10],'30 min':[1800,0]};
 var r=T[v];return r?{base:r[0],inc:r[1],up:false}:{base:0,inc:0,up:true}}
function mmss(x){x=Math.max(0,Math.floor(x));var m=Math.floor(x/60),sc=x%60;return(m<10?'0':'')+m+':'+(sc<10?'0':'')+sc}
function now(){return(window.performance&&performance.now)?performance.now():Date.now()}
function lacks(S,c){var pcs=S.b.filter(function(p){return p&&col(p)===c&&p.toUpperCase()!=='K'});return !pcs.length||(pcs.length===1&&'NB'.indexOf(pcs[0].toUpperCase())>=0)}
function keyOf(S){return S.b.map(function(p){return p||'.'}).join('')+S.t+S.c.K+S.c.Q+S.c.k+S.c.q+S.ep}
function autoOn(){return(($('chessAuto')&&$('chessAuto').value)||'').indexOf('sim')>=0}
function legalNow(){if(!G.legal)G.legal=legal(G.S);return G.legal}
function result(){
 if(G.timeMsg)return G.timeMsg;
 var S=G.S,L=legalNow(),w=S.t==='w'?'brancas':'pretas',o=S.t==='w'?'Pretas':'Brancas';
 if(!L.length)return inCheck(S,S.t)?'Xeque-mate! '+o+' vencem.':'Empate por afogamento (rei sem lances).';
 var pcs=S.b.filter(function(p){return p&&p.toUpperCase()!=='K'});
 if(!pcs.length||(pcs.length===1&&'NB'.indexOf(pcs[0].toUpperCase())>=0))return 'Empate por material insuficiente.';
 if(S.hm>=100)return 'Empate pela regra dos 50 lances.';
 if(G.hist.length>=300)return 'Empate por limite de lances (150 jogadas).';
 var k=keyOf(S),n=0;G.hist.forEach(function(h){if(keyOf(h.after)===k)n++});if(n>=3)return 'Empate por repetição de posição.';
 return ''}
function captured(){
 var cw=[],cb=[],mat=0;
 G.hist.forEach(function(h){var c=h.m.cap;if(!c)return;if(isW(c)){cb.push(c.toUpperCase());mat-=VAL[c.toUpperCase()]}else{cw.push(c.toUpperCase());mat+=VAL[c.toUpperCase()]}});
 function show(a){a.sort(function(x,y){return VAL[y]-VAL[x]});return a.map(function(x){return SYM[x]}).join('')||'—'}
 return{w:show(cw),b:show(cb),mat:mat/100}}
C.ui=function(){
 var S=G.S,L=legalNow(),txt;
 G.msg=result();G.over=!!G.msg;
 if(G.over)txt=G.msg;
 else if(G.paused)txt='Partida pausada';
 else{txt='Vez das '+(S.t==='w'?'brancas':'pretas');if(inCheck(S,S.t))txt+=' — Xeque!';if(cpuTurn())txt+=G.thinking?' — computador pensando…':' (computador)'}
 if(G.over&&!G.scored){G.scored=true;snd(/vencem/.test(G.msg)?'win':'blip');var o=/vencem/.test(G.msg)?(/Brancas vencem/.test(G.msg)?0:2):1;G.score[o]++;C.save();if(modeKind()==='pcpc'&&autoOn())setTimeout(function(){if(G.over&&modeKind()==='pcpc'&&autoOn())C.reset(false)},3200)}
 $('chessStatus').textContent=txt;
 var out=[],i;for(i=0;i<G.hist.length;i+=2){out.push((i/2+1)+'. '+G.hist[i].san+(G.hist[i+1]?' '+G.hist[i+1].san:''))}
 var mv=$('chessMoves');mv.value=out.join('\n');mv.scrollTop=mv.scrollHeight;
 var cp=captured();$('chessCaptured').textContent='Brancas capturaram: '+cp.w+'     Pretas capturaram: '+cp.b+(Math.round(cp.mat)?'     Vantagem: '+(cp.mat>0?'brancas +':'pretas +')+Math.abs(Math.round(cp.mat)):'');
 $('chessUndo').disabled=!G.hist.length||G.thinking;
 var pb=$('chessPause');if(pb)pb.textContent=G.paused?'Continuar':'Pausar';
 var sc=$('chessScore');if(sc)sc.textContent='Placar:  Brancas '+G.score[0]+'  •  Empates '+G.score[1]+'  •  Pretas '+G.score[2];
 C.draw();C.drawClocks()}
C.draw=function(){
 var c=$('chessBoard');if(!c)return;var x=c.getContext('2d'),s=c.width/8,f=G.flip,r,cl,i,p,kx;
 var FONT=Math.round(s*0.78)+'px "Segoe UI Symbol","DejaVu Sans","Noto Sans Symbols 2","Apple Symbols",sans-serif';
 x.clearRect(0,0,c.width,c.height);
 var chk=inCheck(G.S,G.S.t)?kingSq(G.S.b,G.S.t):-1;
 for(r=0;r<8;r++)for(cl=0;cl<8;cl++){
  i=f?63-(r*8+cl):r*8+cl;
  x.fillStyle=(r+cl)%2?'#b58863':'#f0d9b5';x.fillRect(cl*s,r*s,s,s);
  if(G.last&&(i===G.last.f||i===G.last.t)){x.fillStyle='rgba(250,220,60,.5)';x.fillRect(cl*s,r*s,s,s)}
  if(i===G.sel){x.fillStyle='rgba(66,165,245,.6)';x.fillRect(cl*s,r*s,s,s)}
  if(i===chk){var g=x.createRadialGradient(cl*s+s/2,r*s+s/2,s*.08,cl*s+s/2,r*s+s/2,s*.6);g.addColorStop(0,'rgba(255,0,0,.85)');g.addColorStop(1,'rgba(255,0,0,0)');x.fillStyle=g;x.fillRect(cl*s,r*s,s,s)}
  x.font='bold '+Math.round(s*.17)+'px sans-serif';x.textAlign='left';x.textBaseline='top';
  x.fillStyle=(r+cl)%2?'#f0d9b5':'#b58863';
  if(r===7)x.fillText('abcdefgh'.charAt(f?7-cl:cl),cl*s+s-Math.round(s*.17)-3,r*s+s-Math.round(s*.17)-4);
  if(cl===0)x.fillText(String(f?r+1:8-r),3,r*s+3)}
 x.textAlign='center';x.textBaseline='middle';x.font=FONT;
 for(r=0;r<8;r++)for(cl=0;cl<8;cl++){
  i=f?63-(r*8+cl):r*8+cl;p=G.S.b[i];if(!p)continue;
  var u=p.toUpperCase(),px=cl*s+s/2,py=r*s+s/2+s*.04;
  if(isW(p)){x.lineWidth=s*.05;x.strokeStyle='#1f2937';x.strokeText(SYM[u],px,py);x.fillStyle='#ffffff';x.fillText(SYM[u],px,py)}
  else{x.lineWidth=s*.03;x.strokeStyle='#f8fafc';x.strokeText(SYM[u],px,py);x.fillStyle='#1f2937';x.fillText(SYM[u],px,py)}}
 G.targets.forEach(function(m){
  var idx=f?63-m.t:m.t,cx=(idx&7)*s+s/2,cy=(idx>>3)*s+s/2;
  x.beginPath();
  if(G.S.b[m.t]||m.ep){x.lineWidth=s*.08;x.strokeStyle='rgba(20,20,20,.35)';x.arc(cx,cy,s*.42,0,Math.PI*2);x.stroke()}
  else{x.fillStyle='rgba(20,20,20,.3)';x.arc(cx,cy,s*.16,0,Math.PI*2);x.fill()}})}
C.play=function(m){
 var S=G.S,L=legalNow(),sn=san(S,m,L),tc=tcOf();
 C.tick();
 var n=apply(S,m);G.hist.push({m:m,san:sn,before:S,after:n,clk:{w:G.cw,b:G.cb}});
 if(!tc.up){if(S.t==='w')G.cw+=tc.inc;else G.cb+=tc.inc}
 G.S=n;G.legal=null;G.sel=-1;G.targets=[];G.last=m;G.t0=now();
 snd(S.b[m.t]||m.ep?'hit':'move');if(inCheck(n,n.t))setTimeout(function(){snd('error')},150);
 C.save();C.ui();C.sched()};
C.sched=function(){
 if(!G.over&&!G.paused&&!G.thinking&&cpuTurn()){G.thinking=true;C.ui();setTimeout(C.cpu,delay())}};
C.cpu=function(){
 if(!G.thinking)return;
 if(G.paused||G.over){G.thinking=false;C.ui();return}
 var k=modeKind(),m=best(G.S,k==='med'?3:(k==='easy'?1:2),k==='easy'?60:(k==='med'?4:30));
 G.thinking=false;if(m)C.play(m);else C.ui()};
C.pick=function(i){
 if(G.over||G.thinking||G.paused||cpuTurn())return;
 var S=G.S,p=S.b[i],L=legalNow();
 if(G.sel>=0&&G.sel!==i){
  var cand=G.targets.filter(function(m){return m.t===i});
  if(cand.length){
   var want='Q',pv=($('chessPromo')&&$('chessPromo').value)||'';
   if(pv.indexOf('Torre')>=0)want='R';else if(pv.indexOf('Bispo')>=0)want='B';else if(pv.indexOf('Cavalo')>=0)want='N';
   var m=cand.filter(function(x){return !x.p||x.p===want})[0]||cand[0];
   C.play(m);return}}
 if(p&&col(p)===S.t){G.sel=i;G.targets=L.filter(function(m){return m.f===i})}else{G.sel=-1;G.targets=[]}
 C.draw()};
C.click=function(ev){
 var c=$('chessBoard'),r=c.getBoundingClientRect();
 var x=(ev.clientX-r.left)*c.width/r.width,y=(ev.clientY-r.top)*c.height/r.height,s=c.width/8;
 var cl=Math.floor(x/s),rw=Math.floor(y/s);if(cl<0||cl>7||rw<0||rw>7)return;
 C.pick(G.flip?63-(rw*8+cl):rw*8+cl)};
C.undo=function(){
 if(G.thinking||!G.hist.length)return;
 C.tick();
 var k=modeKind(),h=G.hist.pop();
 if((k==='easy'||k==='med')&&G.hist.length&&G.hist.length%2===1)h=G.hist.pop();
 if(k==='pcpc')G.paused=true;
 G.timeMsg='';G.scored=false;
 G.cw=h.clk.w;G.cb=h.clk.b;
 G.S=G.hist.length?G.hist[G.hist.length-1].after:newState();G.legal=null;G.sel=-1;G.targets=[];
 G.last=G.hist.length?G.hist[G.hist.length-1].m:null;G.t0=now();C.save();C.ui()};
C.resetClocks=function(){var tc=tcOf();G.cw=G.cb=tc.up?0:tc.base;G.t0=now()};
C.reset=function(ask){
 if(ask&&G.hist.length&&!G.over&&!confirm('Começar uma nova partida? A atual será perdida.'))return;
 G.thinking=false;G.paused=false;G.timeMsg='';G.scored=false;
 G.S=newState();G.hist=[];G.legal=null;G.sel=-1;G.targets=[];G.last=null;C.resetClocks();C.save();C.ui();C.sched()};
C.flip=function(){G.flip=!G.flip;C.save();C.draw();C.drawClocks()};
C.modeChanged=function(){C.save();C.ui();C.sched()};
C.timeChanged=function(){if(G.hist.length&&!G.over&&!confirm('Mudar o tempo reinicia os relógios desta partida. Continuar?')){return}C.resetClocks();G.timeMsg='';C.save();C.ui()};
C.pause=function(){
 if(G.over)return;C.tick();G.paused=!G.paused;G.t0=now();C.save();C.ui();if(!G.paused)C.sched()};
/* ---------- relógio de xadrez analógico ---------- */
function timeoutMsg(loser){var win=loser==='w'?'b':'w',n=win==='w'?'Brancas':'Pretas';return lacks(G.S,win)?'Tempo esgotado — as '+n.toLowerCase()+' não têm material para dar mate: empate.':'Tempo esgotado! '+n+' vencem.'}
C.tick=function(){
 var t=now(),dt=(t-G.t0)/1000;G.t0=t;
 if(!G.hist.length||G.over||G.paused)return false;
 var tc=tcOf(),k=G.S.t;
 if(tc.up){if(k==='w')G.cw+=dt;else G.cb+=dt;return false}
 if(k==='w')G.cw-=dt;else G.cb-=dt;
 if((k==='w'?G.cw:G.cb)<=0){if(k==='w')G.cw=0;else G.cb=0;G.timeMsg=timeoutMsg(k);G.thinking=false;G.sel=-1;G.targets=[];C.ui();return true}
 return false};
C.loop=function(){C.tick();C.drawClocks()};
function dial(cv,secs,up,active,name){
 if(!cv)return;
 var x=cv.getContext('2d'),W=cv.width,cx=W/2,cy=W/2,R=W/2-6,i,a,low=!up&&secs<10,out=!up&&secs<=0;
 x.clearRect(0,0,W,W);
 var g=x.createLinearGradient(0,0,W,W);g.addColorStop(0,'#4a4a4a');g.addColorStop(1,'#0f0f0f');
 x.beginPath();x.arc(cx,cy,R,0,6.2832);x.fillStyle=g;x.fill();
 if(active){x.lineWidth=5;x.strokeStyle='#22c55e';x.beginPath();x.arc(cx,cy,R-2,0,6.2832);x.stroke()}
 x.beginPath();x.arc(cx,cy,R-10,0,6.2832);x.fillStyle=low?'#fbd5d5':'#fbf4e2';x.fill();
 for(i=0;i<60;i++){a=i*Math.PI/30;var big=i%5===0,r1=R-13,r2=R-13-(big?11:5);x.lineWidth=big?2.4:1;x.strokeStyle='#2b2b2b';x.beginPath();x.moveTo(cx+Math.sin(a)*r1,cy-Math.cos(a)*r1);x.lineTo(cx+Math.sin(a)*r2,cy-Math.cos(a)*r2);x.stroke()}
 x.fillStyle='#222';x.font='bold '+Math.round(W*.085)+'px Georgia,serif';x.textAlign='center';x.textBaseline='middle';
 for(i=1;i<=12;i++){a=i*Math.PI/6;x.fillText(String(i),cx+Math.sin(a)*(R-36),cy-Math.cos(a)*(R-36))}
 x.font='bold '+Math.round(W*.065)+'px sans-serif';x.fillStyle='#7c2d12';x.fillText(name,cx,cy+R*.36);
 /* bandeirinha: sobe no último minuto e cai quando o tempo acaba */
 if(!up&&secs<=60){x.save();x.translate(cx,cy-R*.52);x.fillStyle='#dc2626';
  if(out){x.fillRect(-16,-4,32,16);x.fillStyle='#fff';x.font='bold 13px sans-serif';x.fillText('!',0,4)}
  else{x.fillRect(-1,-12,2,16);x.beginPath();x.moveTo(1,-12);x.lineTo(15,-7);x.lineTo(1,-2);x.fill()}
  x.restore()}
 /* o ponteiro avança até as 12:00 exatamente quando o tempo termina (ou parte das 12:00, no modo cronômetro) */
 var D=up?secs%43200:Math.max(0,43200-Math.min(secs,43200))%43200;
 var ah=D/43200*6.2832,am=(D%3600)/3600*6.2832,as=(D%60)/60*6.2832;
 function hand(ang,len,w,col,tail){x.lineWidth=w;x.strokeStyle=col;x.lineCap='round';x.beginPath();x.moveTo(cx-Math.sin(ang)*tail,cy+Math.cos(ang)*tail);x.lineTo(cx+Math.sin(ang)*len,cy-Math.cos(ang)*len);x.stroke()}
 hand(ah,R*.48,7,'#111',8);hand(am,R*.74,4.5,'#111',10);
 if(!out)hand(as,R*.8,1.6,'#c0172a',14);
 x.beginPath();x.arc(cx,cy,6,0,6.2832);x.fillStyle='#c0172a';x.fill();x.beginPath();x.arc(cx,cy,2.2,0,6.2832);x.fillStyle='#fff';x.fill()}
C.drawClocks=function(){
 var tc=tcOf(),run=G.hist.length&&!G.over&&!G.paused;
 dial($('chessClockW'),G.cw,tc.up,run&&G.S.t==='w','BRANCAS');
 dial($('chessClockB'),G.cb,tc.up,run&&G.S.t==='b','PRETAS');
 var lw=$('chessClockWLabel'),lb=$('chessClockBLabel');
 if(lw)lw.textContent='Brancas  '+mmss(G.cw);if(lb)lb.textContent='Pretas  '+mmss(G.cb)};
C.clockClick=function(){C.pause()};
C.save=function(){try{var ix=function(i){return $(i)?$(i).selectedIndex:0};localStorage.setItem(KEY,JSON.stringify({mode:ix('chessMode'),promo:ix('chessPromo'),speed:ix('chessSpeed'),time:ix('chessTime'),auto:ix('chessAuto'),cw:G.cw,cb:G.cb,paused:G.paused,score:G.score,flip:G.flip,moves:G.hist.map(function(h){return[h.m.f,h.m.t,h.m.p||'']})}))}catch(e){}};
C.load=function(){
 var d=null;try{d=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
 if(!d){if($('chessTime'))$('chessTime').value='10 min';C.resetClocks();return}
 var sel=function(i,v){if($(i)&&v>=0&&v<$(i).options.length)$(i).selectedIndex=v};
 sel('chessMode',d.mode);sel('chessPromo',d.promo);sel('chessSpeed',d.speed);sel('chessTime',d.time);sel('chessAuto',d.auto);
 G.flip=!!d.flip;G.paused=!!d.paused;if(d.score&&d.score.length===3)G.score=d.score;
 (d.moves||[]).forEach(function(mv){
  var L=legal(G.S),m=L.filter(function(x){return x.f===mv[0]&&x.t===mv[1]&&(x.p||'')===mv[2]})[0];
  if(!m)return;var sn=san(G.S,m,L),n=apply(G.S,m);G.hist.push({m:m,san:sn,before:G.S,after:n});G.S=n;G.last=m});
 G.legal=null;
 if(typeof d.cw==='number'&&typeof d.cb==='number'){G.cw=d.cw;G.cb=d.cb}else C.resetClocks();
 G.t0=now();
 if(G.hist.length&&!tcOf().up){if(G.cw<=0)G.timeMsg=timeoutMsg('w');else if(G.cb<=0)G.timeMsg=timeoutMsg('b')}
 if(result())G.scored=true};
C.init=function(){C.load();C.ui();C.sched();if(!G.timer)G.timer=setInterval(C.loop,100)};
C.test={clock:function(){return{cw:G.cw,cb:G.cb}},setClock:function(w,b){G.cw=w;G.cb=b;G.t0=now()},fromFen:fromFen,perft:perft,legal:legal,apply:apply,state:function(){return G},setState:function(S){G.S=S;G.legal=null;G.hist=[]},newState:newState,best:best,inCheck:inCheck,kingSq:kingSq};
})();}
