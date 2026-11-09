var $=function(i){return document.getElementById(i)};
if(!window.ffBlocos){(function(){
/* Blocos Empilhados — quebra-cabeça de peças que caem (7 formas), em JavaScript puro e canvas 2D.
   Teclado: ← → mover, ↑ ou X girar, ↓ descer, Espaço queda direta, P pausar. Toque: arraste para mover,
   toque para girar, deslize rápido para baixo para a queda direta (ou use os botões). */
var C=window.ffBlocos={};
function snd(n,v){try{if(window.Sons)window.Sons.play(n,v)}catch(e){}} // sons (componente Game Sound), se o projeto tiver
var W=10,H=20,CS=30,KEY='ffBlocosV1';
var BASE={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1],[0,0,0]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
var COR={I:'#22d3ee',O:'#facc15',T:'#a78bfa',S:'#4ade80',Z:'#f87171',J:'#60a5fa',L:'#fb923c'};
var TIPOS='IOTSZJL'.split('');
var PTS=[0,100,300,500,800];
function rot(m){return m[0].map(function(_,i){return m.map(function(r){return r[i]}).reverse()})}
var SHAPES={};TIPOS.forEach(function(t){var a=[BASE[t]],i;for(i=1;i<4;i++)a.push(rot(a[i-1]));SHAPES[t]=a});
var G={b:[],p:null,next:null,bag:[],score:0,lines:0,level:1,state:'play',acc:0,t0:0,flash:null,best:0,msg:'',queue:null};
function now(){return(window.performance&&performance.now)?performance.now():Date.now()}
function empty(){var b=[],r;for(r=0;r<H;r++)b.push(new Array(W).fill(''));return b}
function bagNext(){
 if(G.queue&&G.queue.length)return G.queue.shift();
 if(!G.bag.length){G.bag=TIPOS.slice();var i,j,t;for(i=G.bag.length-1;i>0;i--){j=Math.floor(Math.random()*(i+1));t=G.bag[i];G.bag[i]=G.bag[j];G.bag[j]=t}}
 return G.bag.pop()}
function make(t){var m=SHAPES[t][0];return{t:t,r:0,x:Math.floor((W-m.length)/2),y:t==='I'?-1:0}}
function cells(p,r,x,y){var m=SHAPES[p.t][r===undefined?p.r:r],out=[],i,j;x=x===undefined?p.x:x;y=y===undefined?p.y:y;
 for(i=0;i<m.length;i++)for(j=0;j<m[i].length;j++)if(m[i][j])out.push([x+j,y+i]);return out}
function hit(p,r,x,y){var c=cells(p,r,x,y),i;for(i=0;i<c.length;i++){var cx=c[i][0],cy=c[i][1];if(cx<0||cx>=W||cy>=H)return true;if(cy>=0&&G.b[cy][cx])return true}return false}
function ghostY(){var y=G.p.y;while(!hit(G.p,G.p.r,G.p.x,y+1))y++;return y}
function best(){try{var o=JSON.parse(localStorage.getItem(KEY)||'{}');G.best=o.best||0}catch(e){G.best=0}}
function saveBest(){if(G.score>G.best){G.best=G.score;try{localStorage.setItem(KEY,JSON.stringify({best:G.best}))}catch(e){}}}
function spawn(){
 G.p=make(G.next||bagNext());G.next=bagNext();G.acc=0;G.t0=now();
 if(hit(G.p,G.p.r,G.p.x,G.p.y)){G.state='over';saveBest();snd('lose')}}
function interval(){return Math.max(90,820-(G.level-1)*72)}
function lock(){
 var c=cells(G.p),i,over=false;
 for(i=0;i<c.length;i++){if(c[i][1]<0)over=true;else G.b[c[i][1]][c[i][0]]=G.p.t}
 var full=[],r;for(r=0;r<H;r++)if(G.b[r].every(function(v){return v}))full.push(r);
 if(over){G.p=null;G.state='over';saveBest();snd('lose');return}
 if(full.length){var lv0=G.level;G.score+=PTS[full.length]*G.level;G.lines+=full.length;G.level=1+Math.floor(G.lines/10);snd(full.length>=4?'powerup':G.level>lv0?'win':'coin');G.flash={rows:full,t0:now()};G.state='flash';G.p=null;saveBest()}
 else{snd('blip');spawn()}}
function removeRows(){
 var rows=G.flash.rows;G.b=G.b.filter(function(_,i){return rows.indexOf(i)<0});
 while(G.b.length<H)G.b.unshift(new Array(W).fill(''));
 G.flash=null;G.state='play';spawn()}
C.move=function(d){if(G.state!=='play')return false;if(!hit(G.p,G.p.r,G.p.x+d,G.p.y)){G.p.x+=d;snd('tick');C.draw();return true}return false};
C.rotate=function(){if(G.state!=='play')return false;var nr=(G.p.r+1)%4,ks=[0,-1,1,-2,2],i;
 for(i=0;i<ks.length;i++)if(!hit(G.p,nr,G.p.x+ks[i],G.p.y)){G.p.r=nr;G.p.x+=ks[i];snd('move');C.draw();return true}
 if(!hit(G.p,nr,G.p.x,G.p.y-1)){G.p.r=nr;G.p.y--;snd('move');C.draw();return true}return false};
C.soft=function(){if(G.state!=='play')return false;
 if(!hit(G.p,G.p.r,G.p.x,G.p.y+1)){G.p.y++;G.score+=1;G.acc=0;C.ui();return true}
 lock();C.ui();return false};
C.drop=function(){if(G.state!=='play')return;var y=ghostY(),d=y-G.p.y;G.p.y=y;G.score+=2*d;lock();C.ui()};
C.btn=function(n,a){C[n](a);var e=document.activeElement;if(e&&e.tagName==='BUTTON'&&e.blur)e.blur()};
C.pause=function(){
 if(G.state==='play'){G.state='pause'}else if(G.state==='pause'){G.state='play';G.acc=0;G.t0=now()}
 C.ui()};
C.reset=function(){snd('start');G.b=empty();G.score=0;G.lines=0;G.level=1;G.flash=null;G.bag=[];G.next=null;G.state='play';best();spawn();C.ui()};
C.step=function(){ // gravidade: uma casa para baixo (ou trava a peça)
 if(G.state!=='play')return;
 if(!hit(G.p,G.p.r,G.p.x,G.p.y+1))G.p.y++;else lock();
 C.ui()};
C.loop=function(){
 var t=now();
 if(G.state==='flash'){if(t-G.flash.t0>=220){removeRows();C.ui()}else C.draw();return}
 if(G.state!=='play'){G.t0=t;return}
 G.acc+=t-G.t0;G.t0=t;
 var n=0;while(G.acc>=interval()&&G.state==='play'&&n++<5){G.acc-=interval();C.step()}
 if(n)return;C.draw()};

/* ---------- desenho ---------- */
function shade(hex,k){var n=parseInt(hex.slice(1),16),f=function(v){return Math.max(0,Math.min(255,Math.round(v*k)))};return'rgb('+f(n>>16&255)+','+f(n>>8&255)+','+f(n&255)+')'}
function cell(x,px,py,s,t,a){
 var c=COR[t];x.globalAlpha=a===undefined?1:a;
 x.fillStyle=c;x.fillRect(px,py,s,s);
 x.fillStyle=shade(c,1.3);x.fillRect(px,py,s,Math.max(2,s*.12));x.fillRect(px,py,Math.max(2,s*.12),s);
 x.fillStyle=shade(c,.7);x.fillRect(px,py+s-Math.max(2,s*.12),s,Math.max(2,s*.12));x.fillRect(px+s-Math.max(2,s*.12),py,Math.max(2,s*.12),s);
 x.globalAlpha=1}
C.draw=function(){
 var cv=$('bBoard');if(!cv)return;var x=cv.getContext('2d'),r,c;
 x.fillStyle='#0b1220';x.fillRect(0,0,cv.width,cv.height);
 x.strokeStyle='#162033';x.lineWidth=1;
 for(r=1;r<H;r++){x.beginPath();x.moveTo(0,r*CS+.5);x.lineTo(W*CS,r*CS+.5);x.stroke()}
 for(c=1;c<W;c++){x.beginPath();x.moveTo(c*CS+.5,0);x.lineTo(c*CS+.5,H*CS);x.stroke()}
 for(r=0;r<H;r++)for(c=0;c<W;c++)if(G.b[r][c])cell(x,c*CS,r*CS,CS,G.b[r][c]);
 if(G.p&&G.state!=='over'){
  var gy=ghostY();if(gy!==G.p.y)cells(G.p,G.p.r,G.p.x,gy).forEach(function(q){if(q[1]>=0){x.strokeStyle=COR[G.p.t];x.globalAlpha=.55;x.lineWidth=2;x.strokeRect(q[0]*CS+2,q[1]*CS+2,CS-4,CS-4);x.globalAlpha=1}});
  cells(G.p).forEach(function(q){if(q[1]>=0)cell(x,q[0]*CS,q[1]*CS,CS,G.p.t)})}
 if(G.flash){var k=Math.min(1,(now()-G.flash.t0)/220);G.flash.rows.forEach(function(rw){x.fillStyle='rgba(255,255,255,'+(0.85*(1-k*.4)).toFixed(2)+')';x.fillRect(0,rw*CS,W*CS,CS)})}
 if(G.state==='pause'||G.state==='over'){
  x.fillStyle='rgba(2,6,23,.72)';x.fillRect(0,0,cv.width,cv.height);
  x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';
  x.font='bold 34px system-ui,sans-serif';x.fillText(G.state==='pause'?'Pausado':'Fim de jogo',cv.width/2,cv.height/2-16);
  x.font='18px system-ui,sans-serif';x.fillStyle='#cbd5e1';x.fillText(G.state==='pause'?'Toque em Continuar':'Pontos: '+G.score,cv.width/2,cv.height/2+24);
  if(G.state==='over')x.fillText('Toque em Novo jogo',cv.width/2,cv.height/2+52)}
 var nv=$('bNext');if(nv){var y=nv.getContext('2d');y.fillStyle='#0b1220';y.fillRect(0,0,nv.width,nv.height);
  if(G.next){var m=SHAPES[G.next][0],s=Math.floor(nv.width/5),i,j,minR=9,maxR=-1,minC=9,maxC=-1;
   for(i=0;i<m.length;i++)for(j=0;j<m[i].length;j++)if(m[i][j]){minR=Math.min(minR,i);maxR=Math.max(maxR,i);minC=Math.min(minC,j);maxC=Math.max(maxC,j)}
   var ox=(nv.width-(maxC-minC+1)*s)/2,oy=(nv.height-(maxR-minR+1)*s)/2;
   for(i=minR;i<=maxR;i++)for(j=minC;j<=maxC;j++)if(m[i][j])cell(y,ox+(j-minC)*s,oy+(i-minR)*s,s,G.next)}}};
function st(id,t){var e=$(id);if(e){e.style.whiteSpace='pre-line';e.style.textAlign='center';e.style.fontWeight='700';e.style.lineHeight='1.35';e.textContent=t}}
C.ui=function(){
 saveBest();
 st('bScore','PONTOS\n'+G.score);st('bLevel','NÍVEL\n'+G.level);st('bLines','LINHAS\n'+G.lines);st('bBest','RECORDE\n'+Math.max(G.best,G.score));
 var s=$('bStatus');if(s)s.textContent=G.state==='over'?'Fim de jogo — '+G.score+' pontos':(G.state==='pause'?'Pausado':'Jogando — nível '+G.level);
 var pb=$('bPause');if(pb){pb.textContent=G.state==='pause'?'Continuar':'Pausar';pb.disabled=G.state==='over'}
 C.draw()};

/* ---------- teclado e toque ---------- */
function key(e){
 if(!$('bBoard'))return;
 var k=e.key,used=true;
 if(k==='ArrowLeft'||k==='a'||k==='A')C.move(-1);
 else if(k==='ArrowRight'||k==='d'||k==='D')C.move(1);
 else if(k==='ArrowUp'||k==='x'||k==='X'||k==='w'||k==='W')C.rotate();
 else if(k==='ArrowDown'||k==='s'||k==='S')C.soft();
 else if(k===' '||k==='Spacebar')C.drop();
 else if(k==='p'||k==='P'||k==='Escape')C.pause();
 else used=false;
 if(used&&e.preventDefault)e.preventDefault()}
function gestures(cv){
 var d=null;
 cv.style.touchAction='none';
 cv.addEventListener('pointerdown',function(e){d={x:e.clientX,y:e.clientY,t:now(),moved:false,cells:0,px:e.clientX};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
 cv.addEventListener('pointermove',function(e){if(!d)return;var rc=cv.getBoundingClientRect(),cw=rc.width/W,dx=e.clientX-d.px;
  if(Math.abs(dx)>=cw*.9){var n=Math.floor(Math.abs(dx)/(cw*.9)),s=dx>0?1:-1;while(n--)C.move(s);d.px+=s*Math.floor(Math.abs(dx)/(cw*.9))*cw*.9;d.moved=true}
  if(Math.abs(e.clientY-d.y)>12)d.moved=true});
 cv.addEventListener('pointerup',function(e){if(!d)return;var dy=e.clientY-d.y,dt=Math.max(1,now()-d.t),dx=e.clientX-d.x;
  if(dy>60&&dy/dt>.5&&Math.abs(dx)<dy)C.drop();
  else if(!d.moved&&dt<350)C.rotate();
  d=null});
 cv.addEventListener('pointercancel',function(){d=null})}
C.init=function(){
 var cv=$('bBoard');if(cv&&!cv.__ffb){cv.__ffb=true;gestures(cv)}
 if(!window.__ffBlocosKeys){window.__ffBlocosKeys=true;document.addEventListener('keydown',key);
  document.addEventListener('visibilitychange',function(){if(document.hidden&&G.state==='play'){G.state='pause';C.ui()}})}
 best();C.reset();if(!G.timer)G.timer=setInterval(C.loop,30)};
C.test={state:function(){return G},cells:cells,ghostY:ghostY,interval:interval,shapes:SHAPES,
 setBoard:function(rows){G.b=empty();rows.forEach(function(row,i){var r=H-rows.length+i;row.split('').forEach(function(ch,c){if(ch!=='.'&&ch!==' ')G.b[r][c]=ch})});C.draw()},
 setPiece:function(t,r,x,y){G.p={t:t,r:r,x:x,y:y};C.draw()},
 setQueue:function(a){G.queue=a},
 setStats:function(s,l){G.score=s;G.lines=l;G.level=1+Math.floor(l/10);C.ui()},
 bag:function(n){var o=[],i;G.bag=[];for(i=0;i<n;i++)o.push(bagNext());return o},
 removeRows:function(){if(G.flash)removeRows()}};
})()}
