var $=function(i){return document.getElementById(i)};
if(!window.ffInvasores){(function(){
/* Invasores do Espaço — jogo de tiro em JavaScript puro e canvas 2D.
   Ondas de invasores que descem e aceleram, 3 tipos com pontuações diferentes, 4 abrigos destrutíveis,
   disco voador bônus, 3 vidas, recorde salvo. Teclado: ← → mover (segure), Espaço/↑ atirar, P pausa.
   Toque: arraste no jogo para mover a nave, toque para atirar (ou use os botões). */
var C=window.ffInvasores={};
function snd(n,v){try{if(window.Sons)window.Sons.play(n,v)}catch(e){}} // sons (componente Game Sound), se o projeto tiver
var W=360,H=480,KEY='ffInvasoresV1',COLS=8,DX=34,DY=28,AW=22,AH=16,SY=448,SH=16,SW=28,SP=230,BLK=4;
var BM={
 A:[['...xx...','..xxxx..','.xxxxxx.','xx.xx.xx','xxxxxxxx','..x..x..','.x.xx.x.','x.x..x.x'],['...xx...','..xxxx..','.xxxxxx.','xx.xx.xx','xxxxxxxx','.x.xx.x.','x......x','.x....x.']],
 B:[['..x.....x..','...x...x...','..xxxxxxx..','.xx.xxx.xx.','xxxxxxxxxxx','x.xxxxxxx.x','x.x.....x.x','...xx.xx...'],['..x.....x..','x..x...x..x','x.xxxxxxx.x','xxx.xxx.xxx','xxxxxxxxxxx','.xxxxxxxxx.','..x.....x..','.x.......x.']],
 C:[['....xxxx....','.xxxxxxxxxx.','xxxxxxxxxxxx','xxx..xx..xxx','xxxxxxxxxxxx','...xx..xx...','..xx.xx.xx..','xx........xx'],['....xxxx....','.xxxxxxxxxx.','xxxxxxxxxxxx','xxx..xx..xxx','xxxxxxxxxxxx','..xxx..xxx..','.xx..xx..xx.','..xx....xx..']]};
var COR={A:'#f0abfc',B:'#67e8f9',C:'#86efac'},PTS={A:30,B:20,C:10};
var SHAPE=['..xxxxxxxxx..','.xxxxxxxxxxx.','xxxxxxxxxxxxx','xxxxxxxxxxxxx','xxxxxxxxxxxxx','xxxxxxxxxxxxx','xxxx.....xxxx','xxx.......xxx'];
var G={state:'play',t:0,px:W/2,keys:{l:0,r:0,f:0},pb:[],ab:[],al:[],gx:0,gy:0,dir:1,total:0,sh:[],ufo:null,nextUfo:14,score:0,lives:3,wave:1,best:0,inv:0,cool:0,shotT:1,banner:0,seed:7,freeze:false,overAt:0,last:0,timer:0,stars:[],flash:0};
function now(){return(window.performance&&performance.now)?performance.now():Date.now()}
function rnd(){G.seed=(G.seed+0x6D2B79F5)|0;var t=Math.imul(G.seed^(G.seed>>>15),1|G.seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}
function best(){try{G.best=+localStorage.getItem(KEY)||0}catch(e){G.best=0}}
function saveBest(){if(G.score>G.best){G.best=G.score;try{localStorage.setItem(KEY,String(G.best))}catch(e){}}}
function alive(){var n=0,i;for(i=0;i<G.al.length;i++)if(G.al[i].on)n++;return n}
function ax(a){return G.gx+a.c*DX}
function ay(a){return G.gy+a.r*DY}
function mkWave(){
 var rows=G.wave>=3?5:4,r,c;G.al=[];
 for(r=0;r<rows;r++)for(c=0;c<COLS;c++)G.al.push({c:c,r:r,t:r===0?'A':(r<3?'B':'C'),on:true});
 G.total=G.al.length;G.gx=(W-((COLS-1)*DX+AW))/2;G.gy=52+Math.min(3,G.wave-1)*14;G.dir=1;G.pb=[];G.ab=[];G.shotT=1.1;G.ufo=null;mkShields()}
function mkShields(){
 var k,r,c;G.sh=[];
 for(k=0;k<4;k++){var x0=Math.round(22+k*(W-44-13*BLK)/3),cells=[];
  for(r=0;r<SHAPE.length;r++)for(c=0;c<SHAPE[r].length;c++)if(SHAPE[r].charAt(c)==='x')cells.push({x:x0+c*BLK,y:376+r*BLK});
  G.sh.push(cells)}}
function hitShield(x,y,w,h,dmg){ // remove blocos tocados; devolve true se tocou
 var k,i,hit=false;
 for(k=0;k<G.sh.length;k++){var cs=G.sh[k];
  for(i=cs.length-1;i>=0;i--){var b=cs[i];
   if(x<b.x+BLK&&x+w>b.x&&y<b.y+BLK&&y+h>b.y){hit=true;cs.splice(i,1);if(dmg){var j;for(j=cs.length-1;j>=0;j--){var o=cs[j];if(Math.abs(o.x-b.x)<=BLK&&Math.abs(o.y-b.y)<=BLK&&rnd()<.55)cs.splice(j,1)}}
    if(!dmg)continue;return true}}}
 return hit}
C.reset=function(){snd('start');G.state='play';G.t=0;G.px=W/2;G.score=0;G.lives=3;G.wave=1;G.inv=0;G.cool=0;G.ufo=null;G.nextUfo=14;G.banner=0;G.overAt=0;G.flash=0;G.keys.l=G.keys.r=G.keys.f=0;G.seed=(Date.now()&0xffff)+1;best();mkWave();C.ui()};
C.fire=function(){
 if(G.state!=='play'||G.cool>0||G.pb.length>=3)return false;
 G.pb.push({x:G.px,y:SY-2});G.cool=.32;snd('laser',.5);return true};
C.nudge=function(d){if(G.state!=='play')return false;G.px=Math.max(SW/2+4,Math.min(W-SW/2-4,G.px+d*26));return true};
C.left=function(){C.nudge(-1)};C.right=function(){C.nudge(1)};
C.pause=function(){if(G.state==='play')G.state='pause';else if(G.state==='pause'){G.state='play';G.last=0}C.ui()};
C.btn=function(n,a){if(typeof C[n]==='function')C[n](a);if(document.activeElement&&document.activeElement.blur&&document.activeElement.tagName==='BUTTON')document.activeElement.blur()};
function over(){snd('lose');G.state='over';G.overAt=now();saveBest();C.ui()}
function loseLife(){snd('explosion');G.lives--;G.inv=1.7;G.flash=.25;if(G.lives<=0){G.lives=0;over()}else C.ui()}
function step(dt){
 var i,j,a,b;
 if(G.state==='wave'){G.banner-=dt;if(G.banner<=0){G.state='play'}return}
 if(G.state!=='play')return;
 G.t+=dt;G.cool=Math.max(0,G.cool-dt);G.inv=Math.max(0,G.inv-dt);G.flash=Math.max(0,G.flash-dt);
 var mv=(G.keys.r?1:0)-(G.keys.l?1:0);if(mv)G.px=Math.max(SW/2+4,Math.min(W-SW/2-4,G.px+mv*SP*dt));
 if(G.keys.f)C.fire();
 // tiros da nave
 for(i=G.pb.length-1;i>=0;i--){b=G.pb[i];b.y-=430*dt;
  if(b.y<-12){G.pb.splice(i,1);continue}
  if(hitShield(b.x-1,b.y,3,10,true)){G.pb.splice(i,1);continue}
  var hitA=false;
  for(j=0;j<G.al.length;j++){a=G.al[j];if(!a.on)continue;var X=ax(a),Y=ay(a);
   if(b.x+1.5>X&&b.x-1.5<X+AW&&b.y<Y+AH&&b.y+10>Y){a.on=false;G.score+=PTS[a.t];hitA=true;snd('hit',.7);C.ui();break}}
  if(hitA){G.pb.splice(i,1);continue}
  if(G.ufo&&b.x>G.ufo.x&&b.x<G.ufo.x+30&&b.y<44&&b.y+10>28){G.score+=G.ufo.pts;snd('powerup');G.ufo=null;G.pb.splice(i,1);C.ui()}}
 // invasores
 var n=alive();
 if(n===0){G.wave++;G.score+=100;snd('win');mkWave();G.state='wave';G.banner=1.4;C.ui();return}
 var sp=Math.min(210,(28+G.wave*5)*(1+(G.total-n)/G.total*3.2)),mn=1e9,mx=-1e9;
 G.gx+=G.dir*sp*dt;
 for(j=0;j<G.al.length;j++){a=G.al[j];if(!a.on)continue;mn=Math.min(mn,ax(a));mx=Math.max(mx,ax(a)+AW)}
 if(mx>W-8&&G.dir>0){G.gx-=mx-(W-8);G.dir=-1;G.gy+=14}else if(mn<8&&G.dir<0){G.gx+=8-mn;G.dir=1;G.gy+=14}
 for(j=0;j<G.al.length;j++){a=G.al[j];if(!a.on)continue;
  hitShield(ax(a),ay(a),AW,AH,false);
  if(ay(a)+AH>=SY-6){over();return}}
 // tiros dos invasores
 G.shotT-=dt;
 if(G.shotT<=0&&G.ab.length<3+Math.floor(G.wave/3)){
  G.shotT=Math.max(.35,1.3-G.wave*.08-(G.total-n)/G.total*.5)*(.6+rnd()*.8);
  var cols=[];for(j=0;j<COLS;j++){var low=null;for(i=0;i<G.al.length;i++)if(G.al[i].on&&G.al[i].c===j&&(!low||G.al[i].r>low.r))low=G.al[i];if(low)cols.push(low)}
  if(cols.length){var s=cols[Math.floor(rnd()*cols.length)];G.ab.push({x:ax(s)+AW/2,y:ay(s)+AH,v:165+Math.min(120,G.wave*12)})}}
 for(i=G.ab.length-1;i>=0;i--){b=G.ab[i];b.y+=b.v*dt;
  if(b.y>H){G.ab.splice(i,1);continue}
  if(hitShield(b.x-1.5,b.y,3,10,true)){G.ab.splice(i,1);continue}
  var cancel=false;for(j=G.pb.length-1;j>=0;j--){var p=G.pb[j];if(Math.abs(p.x-b.x)<5&&p.y<b.y+10&&p.y+10>b.y){G.pb.splice(j,1);cancel=true;break}}
  if(cancel){G.ab.splice(i,1);continue}
  if(G.inv<=0&&b.x+1.5>G.px-SW/2&&b.x-1.5<G.px+SW/2&&b.y+10>SY&&b.y<SY+SH){G.ab.splice(i,1);loseLife();if(G.state==='over')return}}
 // disco voador
 if(G.ufo){G.ufo.x+=G.ufo.v*dt;if(G.ufo.x>W+10||G.ufo.x<-40)G.ufo=null}
 else{G.nextUfo-=dt;if(G.nextUfo<=0){var d=rnd()<.5?1:-1;G.ufo={x:d>0?-32:W+2,v:d*75,pts:[50,100,150,300][Math.floor(rnd()*4)]};G.nextUfo=16+rnd()*14}}
 if(G.score!==G.shown)C.ui()}
C.step=step;
/* ---------- desenho ---------- */
function bitmap(x,g,px,py,s,col){x.fillStyle=col;var r,c;for(r=0;r<g.length;r++)for(c=0;c<g[r].length;c++)if(g[r].charAt(c)==='x')x.fillRect(px+c*s,py+r*s,s,s)}
function draw(){
 var cv=$('iView');if(!cv)return;var x=cv.getContext('2d');if(!x)return;
 x.fillStyle=G.flash>0?'#3b0a14':'#050816';x.fillRect(0,0,W,H);
 var i,a;x.fillStyle='#94a3b8';for(i=0;i<G.stars.length;i++){var s=G.stars[i];x.globalAlpha=s[2];x.fillRect(s[0],s[1],1.5,1.5)}x.globalAlpha=1;
 x.fillStyle='#4ade80';for(i=0;i<G.sh.length;i++)G.sh[i].forEach(function(b){x.fillRect(b.x,b.y,BLK,BLK)});
 var fr=Math.floor(Math.abs(G.gx)/9)&1;
 for(i=0;i<G.al.length;i++){a=G.al[i];if(!a.on)continue;var g=BM[a.t][fr],w=g[0].length*2;bitmap(x,g,Math.round(ax(a)+(AW-w)/2),Math.round(ay(a)),2,COR[a.t])}
 if(G.ufo){x.fillStyle='#f87171';x.fillRect(G.ufo.x+8,28,14,4);x.fillRect(G.ufo.x+3,32,24,6);x.fillRect(G.ufo.x,36,30,5);x.fillStyle='#fecaca';x.fillRect(G.ufo.x+8,35,4,2);x.fillRect(G.ufo.x+18,35,4,2)}
 x.fillStyle='#fde047';G.pb.forEach(function(b){x.fillRect(b.x-1.5,b.y,3,10)});
 x.fillStyle='#fb7185';G.ab.forEach(function(b){x.fillRect(b.x-1.5,b.y,3,5);x.fillRect(b.x-.5+(Math.floor(b.y/6)&1?1:-1),b.y+5,3,5)});
 var blink=G.inv>0&&Math.floor(G.inv*10)%2===0;
 if(G.state!=='over'&&!blink){x.fillStyle='#e2e8f0';x.fillRect(G.px-SW/2,SY+8,SW,8);x.fillRect(G.px-9,SY+3,18,6);x.fillRect(G.px-2,SY-3,4,7);x.fillStyle='#38bdf8';x.fillRect(G.px-4,SY+10,8,3)}
 x.fillStyle='#22c55e';x.fillRect(0,H-4,W,2);
 x.font='bold 12px system-ui,sans-serif';x.textAlign='left';x.fillStyle='#64748b';x.fillText('ONDA '+G.wave,8,16);x.textAlign='right';x.fillText(String(G.score),W-8,16);
 if(G.state==='pause'||G.state==='over'||G.state==='wave'){
  x.fillStyle='rgba(2,6,23,.72)';x.fillRect(40,H/2-62,W-80,112);x.textAlign='center';x.fillStyle='#fff';x.font='bold 30px system-ui,sans-serif';
  x.fillText(G.state==='pause'?'PAUSADO':G.state==='wave'?'ONDA '+G.wave:'FIM DE JOGO',W/2,H/2-18);
  x.font='16px system-ui,sans-serif';x.fillStyle='#cbd5e1';
  x.fillText(G.state==='pause'?'Toque em Continuar':G.state==='wave'?'+100 pontos de bônus':G.score+' pontos'+(G.score>0&&G.score>=G.best?' — novo recorde!':''),W/2,H/2+14);
  if(G.state==='over')x.fillText('Toque em Novo jogo',W/2,H/2+38)}}
C.draw=draw;
C.ui=function(){
 G.shown=G.score;var set=function(i,t){var e=$(i);if(e){e.style.whiteSpace='pre-line';e.style.textAlign='center';e.style.fontWeight='700';e.style.lineHeight='1.35';e.textContent=t}};
 var h='';for(var i=0;i<3;i++)h+=i<G.lives?'♥':'♡';
 set('iScore','PONTOS\n'+G.score);set('iWave','ONDA\n'+G.wave);set('iLives','VIDAS\n'+h);set('iBest','RECORDE\n'+Math.max(G.best,G.score));
 var s=$('iStatus');if(s)s.textContent=G.state==='over'?'Fim de jogo — '+G.score+' pontos':G.state==='pause'?'Pausado':G.state==='wave'?'Onda '+G.wave+' — prepare-se':'Defenda a Terra — onda '+G.wave;
 var p=$('iPause');if(p){p.textContent=G.state==='pause'?'Continuar':'Pausar';p.disabled=G.state==='over'}};
/* ---------- entrada ---------- */
function key(e){
 if(!$('iView'))return;var k=e.key,u=true,dn=e.type==='keydown';
 if(k==='ArrowLeft'||k==='a'||k==='A')G.keys.l=dn?1:0;
 else if(k==='ArrowRight'||k==='d'||k==='D')G.keys.r=dn?1:0;
 else if(k===' '||k==='Spacebar'||k==='ArrowUp'||k==='w'||k==='W'){G.keys.f=dn?1:0;if(dn)C.fire()}
 else if(dn&&(k==='p'||k==='P'||k==='Escape'))C.pause();
 else if(dn&&(k==='Enter'||k==='r'||k==='R')&&G.state==='over'&&now()-G.overAt>550)C.reset();
 else u=false;
 if(u&&e.preventDefault)e.preventDefault()}
function gestures(cv){
 var d=null;cv.style.touchAction='none';
 function gx(e){var r=cv.getBoundingClientRect();return(e.clientX-r.left)/Math.max(1,r.width)*W}
 cv.addEventListener('pointerdown',function(e){d={x:e.clientX,moved:false};try{cv.setPointerCapture(e.pointerId)}catch(_){}if(G.state==='play')G.px=Math.max(SW/2+4,Math.min(W-SW/2-4,gx(e)))});
 cv.addEventListener('pointermove',function(e){if(!d)return;if(Math.abs(e.clientX-d.x)>8)d.moved=true;if(G.state==='play')G.px=Math.max(SW/2+4,Math.min(W-SW/2-4,gx(e)))});
 cv.addEventListener('pointerup',function(){if(d&&!d.moved)C.fire();d=null});
 cv.addEventListener('pointercancel',function(){d=null})}
function loop(){
 var t=now(),dt=G.last?Math.min(.05,(t-G.last)/1000):.016;G.last=t;
 if(!G.freeze)step(dt);draw()}
C.init=function(){
 var cv=$('iView');best();
 if(!G.stars.length){var i;for(i=0;i<60;i++)G.stars.push([Math.random()*W,Math.random()*H,.25+Math.random()*.6])}
 C.reset();
 if(cv&&!cv.__ffi){cv.__ffi=true;gestures(cv)}
 if(!window.__ffInvasoresKeys){window.__ffInvasoresKeys=true;document.addEventListener('keydown',key);document.addEventListener('keyup',key);
  var rel=function(){G.keys.l=G.keys.r=G.keys.f=0};window.addEventListener('blur',rel);
  document.addEventListener('visibilitychange',function(){rel();if(document.hidden&&G.state==='play'){G.state='pause';C.ui()}})}
 if(!G.timer)G.timer=setInterval(loop,16);draw()};
C.test={state:function(){return G},freeze:function(f){G.freeze=!!f;G.last=0},step:step,alive:alive,ax:ax,ay:ay,seed:function(s){G.seed=s},
 kill:function(n){var i,k=0;for(i=0;i<G.al.length&&k<n;i++)if(G.al[i].on){G.al[i].on=false;k++}},
 only:function(c,r){G.al.forEach(function(a){a.on=(a.c===c&&a.r===r)})},
 shoot:function(x,y,v){G.ab.push({x:x,y:y,v:v||170})},shields:function(){return G.sh.map(function(s){return s.length})},
 noShots:function(){G.shotT=1e9},setWave:function(w){G.wave=w;mkWave()},mkShields:mkShields,PTS:PTS};
})()}
