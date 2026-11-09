/* Labirinto 3D — primeira pessoa em WebGL puro (sem bibliotecas).
   Labirinto gerado a cada nível (cresce até 12x12), gemas para coletar, saída com farol verde, tempo limitado,
   colisão com deslize nas paredes, tocha (luz perto de você + neblina) e minimapa que revela só o que já foi visitado.
   Teclado: ↑/W frente, ↓/S trás, ←/→ girar, A/D andar de lado, P pausa, Enter/Espaço começa. Toque: arraste no jogo
   (para os lados gira, para cima/baixo anda) ou segure os botões. */
if(!window.ffLabirinto){(function(){
var C=window.ffLabirinto={},PI=Math.PI,$=function(i){return document.getElementById(i)},KEY='ffLabirintoV1';
function snd(n,v){try{if(window.Sons)window.Sons.play(n,v)}catch(e){}} // sons (componente Game Sound), se o projeto tiver
var S=2,WH=2.3,WT=.3,PR=.34,SPEED=3.3,TURN=2.3,FOG=[.03,.035,.09];
var G={state:'ready',level:1,n:5,cells:null,walls:[],vis:null,gems:[],ex:{i:0,j:0},x:1,z:1,yaw:0,time:60,score:0,got:0,total:0,best:0,spin:0,seed:7,overAt:0,clearAt:0,freeze:false,hold:{f:0,b:0,l:0,r:0,sl:0,sr:0},drag:{f:0,t:0},bonus:0,t:0};
var R={c:null,gl:null,m:null,mx:null,fail:false,frames:0,W:0,H:0,last:0,raf:0,err:''};
var now=function(){return performance.now()};

/* ---------- aleatório ---------- */
function rnd(){G.seed=(G.seed+0x6D2B79F5)|0;var t=Math.imul(G.seed^(G.seed>>>15),1|G.seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}
function hash(n){n=(n^61)^(n>>>16);n=(n+(n<<3))|0;n=n^(n>>>4);n=Math.imul(n,0x27d4eb2d);n=n^(n>>>15);return(n>>>0)/4294967296}

/* ---------- labirinto ---------- */
// bits de passagem: 1=N(-z) 2=E(+x) 4=S(+z) 8=W(-x)
var DX={1:0,2:1,4:0,8:-1},DZ={1:-1,2:0,4:1,8:0},OP={1:4,2:8,4:1,8:2};
function build(n){
 var i,j,c=[];for(i=0;i<n;i++){c.push([]);for(j=0;j<n;j++)c[i].push(0)}
 var seen=[];for(i=0;i<n;i++){seen.push([]);for(j=0;j<n;j++)seen[i].push(false)}
 var st=[[0,0]];seen[0][0]=true;
 while(st.length){var p=st[st.length-1],opts=[];
  [1,2,4,8].forEach(function(d){var a=p[0]+DX[d],b=p[1]+DZ[d];if(a>=0&&b>=0&&a<n&&b<n&&!seen[a][b])opts.push(d)});
  if(!opts.length){st.pop();continue}
  var d=opts[Math.floor(rnd()*opts.length)],a=p[0]+DX[d],b=p[1]+DZ[d];c[p[0]][p[1]]|=d;c[a][b]|=OP[d];seen[a][b]=true;st.push([a,b])}
 // alguns atalhos (laços) para o labirinto não ser só um caminho
 var extra=Math.floor(n*.8),k;
 for(k=0;k<extra;k++){i=Math.floor(rnd()*(n-1));j=Math.floor(rnd()*(n-1));var d2=rnd()<.5?2:4;c[i][j]|=d2;c[i+DX[d2]][j+DZ[d2]]|=OP[d2]}
 return c}
function wallsOf(c,n){
 var w=[],i,j;
 function add(x0,x1,z0,z1,h){w.push({x0:x0,x1:x1,z0:z0,z1:z1})}
 for(i=0;i<n;i++)for(j=0;j<n;j++){
  if(!(c[i][j]&2))add((i+1)*S-WT/2,(i+1)*S+WT/2,j*S-WT/2,(j+1)*S+WT/2);
  if(!(c[i][j]&4))add(i*S-WT/2,(i+1)*S+WT/2,(j+1)*S-WT/2,(j+1)*S+WT/2);
  if(i===0)add(-WT/2,WT/2,j*S-WT/2,(j+1)*S+WT/2);
  if(j===0)add(i*S-WT/2,(i+1)*S+WT/2,-WT/2,WT/2)}
 return w}
function pathLen(c,n,a,b){ // distância mínima em células (busca em largura)
 var d={},q=[[0,0]],i;d['0,0']=0;
 while(q.length){var p=q.shift();if(p[0]===a&&p[1]===b)return d[p[0]+','+p[1]];
  [1,2,4,8].forEach(function(m){if(c[p[0]][p[1]]&m){var x=p[0]+DX[m],y=p[1]+DZ[m],k=x+','+y;if(!(k in d)){d[k]=d[p[0]+','+p[1]]+1;q.push([x,y])}}})}
 return -1}
function farthest(c,n){var best=[n-1,n-1],bd=-1,i,j;for(i=0;i<n;i++)for(j=0;j<n;j++){var d=pathLen(c,n,i,j);if(d>bd){bd=d;best=[i,j]}}return best}
function level(lv){
 var n=Math.min(12,4+lv),i,j;G.level=lv;G.n=n;G.cells=build(n);G.walls=wallsOf(G.cells,n);
 G.vis=[];for(i=0;i<n;i++){G.vis.push([]);for(j=0;j<n;j++)G.vis[i].push(false)}
 var e=farthest(G.cells,n);G.ex={i:e[0],j:e[1]};
 G.gems=[];var want=Math.min(3+lv,10),tries=0;
 while(G.gems.length<want&&tries++<500){i=Math.floor(rnd()*n);j=Math.floor(rnd()*n);
  if((i===0&&j===0)||(i===G.ex.i&&j===G.ex.j))continue;if(G.gems.some(function(g){return g.i===i&&g.j===j}))continue;
  G.gems.push({i:i,j:j,x:(i+.5)*S,z:(j+.5)*S,got:false})}
 G.got=0;G.total=G.gems.length;G.x=S/2;G.z=S/2;
 G.yaw=(G.cells[0][0]&4)?0:PI/2; // olha para uma passagem aberta
 G.time=Math.round(26+n*n*1.25);G.t=0;visit();C.ui()}
function visit(){var i=Math.floor(G.x/S),j=Math.floor(G.z/S),a,b;
 for(a=i-1;a<=i+1;a++)for(b=j-1;b<=j+1;b++)if(a>=0&&b>=0&&a<G.n&&b<G.n&&(a===i&&b===j||(Math.abs(a-i)+Math.abs(b-j)===1&&(G.cells[i][j]&dirTo(a-i,b-j)))))G.vis[a][b]=true}
function dirTo(dx,dz){return dx===1?2:dx===-1?8:dz===1?4:1}

/* ---------- física ---------- */
function resolve(){
 var k,p,w,cx,cz,dx,dz,d;
 for(p=0;p<2;p++)for(k=0;k<G.walls.length;k++){w=G.walls[k];
  cx=Math.max(w.x0,Math.min(G.x,w.x1));cz=Math.max(w.z0,Math.min(G.z,w.z1));dx=G.x-cx;dz=G.z-cz;d=Math.sqrt(dx*dx+dz*dz);
  if(d<PR){if(d>1e-6){G.x=cx+dx/d*PR;G.z=cz+dz/d*PR}else{G.x+=PR}}}}
function axes(){
 var h=G.hold,f=Math.max(-1,Math.min(1,h.f-h.b+G.drag.f)),t=Math.max(-1,Math.min(1,h.l-h.r)),s=Math.max(-1,Math.min(1,h.sr-h.sl));return{f:f,t:t,s:s}}
function step(dt){
 G.spin+=dt*2.2;
 if(G.state==='clear'){if(now()-G.clearAt>1500)nextLevel();return}
 if(G.state!=='play')return;
 var a=axes(),dx=Math.sin(G.yaw),dz=Math.cos(G.yaw),rx=-dz,rz=dx,i;
 G.yaw+=a.t*TURN*dt;
 var vx=(dx*a.f+rx*a.s)*SPEED*dt,vz=(dz*a.f+rz*a.s)*SPEED*dt,len=Math.sqrt(vx*vx+vz*vz),maxS=SPEED*dt;
 if(len>maxS){vx*=maxS/len;vz*=maxS/len}
 // passos curtos para não atravessar paredes
 var n=Math.max(1,Math.ceil(Math.max(Math.abs(vx),Math.abs(vz))/.12));
 for(i=0;i<n;i++){G.x+=vx/n;G.z+=vz/n;resolve()}
 G.t+=dt;G.time-=dt;visit();
 for(i=0;i<G.gems.length;i++){var g=G.gems[i];if(!g.got&&Math.hypot(G.x-g.x,G.z-g.z)<.85){g.got=true;G.got++;G.score+=100;snd('coin');C.ui()}}
 var ex=(G.ex.i+.5)*S,ez=(G.ex.j+.5)*S;
 if(Math.hypot(G.x-ex,G.z-ez)<.9){G.bonus=Math.max(0,Math.floor(G.time))*5+200*G.level;G.score+=G.bonus;G.state='clear';G.clearAt=now();snd('win');saveBest();C.ui();return}
 if(G.time<=0){G.time=0;G.state='over';G.overAt=now();snd('lose');saveBest();C.ui()}}
C.step=step;
function nextLevel(){G.state='play';level(G.level+1)}
function loadBest(){try{G.best=+localStorage.getItem(KEY)||0}catch(e){G.best=0}}
function saveBest(){if(G.score>G.best){G.best=G.score;try{localStorage.setItem(KEY,String(G.best))}catch(e){}}}
function begin(){
 if(G.state==='ready'){G.state='play';G.score=0;C.ui();return true}
 if(G.state==='over'&&now()-G.overAt>550){C.reset();return true}
 return G.state==='play'}
C.reset=function(){snd('start');G.seed=(Date.now()&0xffff)+3;G.score=0;G.state='play';G.drag.f=0;G.drag.t=0;level(1)};
C.pause=function(){if(G.state==='play')G.state='pause';else if(G.state==='pause')G.state='play';R.last=0;C.ui()};
C.start=function(){begin()};
C.btn=function(n){if(typeof C[n]==='function')C[n]();var e=document.activeElement;if(e&&e.blur&&e.tagName==='BUTTON')e.blur()};
C.turn=function(d){G.yaw-=d*.35};

/* ---------- interface ---------- */
function fmt(t){t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+('0'+(t%60)).slice(-2)}
function st(id,t){var e=$(id);if(e){e.style.whiteSpace='pre-line';e.style.textAlign='center';e.style.fontWeight='700';e.style.lineHeight='1.35';e.textContent=t}}
C.ui=function(){
 st('lNivel','NÍVEL\n'+G.level);st('lGemas','GEMAS\n'+G.got+'/'+G.total);st('lTempo','TEMPO\n'+fmt(G.time));st('lPontos','PONTOS\n'+G.score);
 var s=$('lStatus');if(s)s.textContent=G.state==='over'?'Fim — '+G.score+' pontos (recorde '+Math.max(G.best,G.score)+')':G.state==='pause'?'Pausado':G.state==='ready'?'Pronto — Enter ou toque para começar':G.state==='clear'?'Saída encontrada!':'Ache a saída verde — recorde '+Math.max(G.best,G.score);
 var m=$('lMsg');if(m){var t=G.state==='ready'?'LABIRINTO 3D\nPegue as gemas e ache a saída\nantes do tempo acabar\n\nEnter, Espaço ou toque para começar':G.state==='pause'?'PAUSADO\nToque em Continuar':G.state==='clear'?'NÍVEL '+G.level+' CONCLUÍDO\n+'+G.bonus+' pontos':G.state==='over'?'TEMPO ESGOTADO\n'+G.score+' pontos'+(G.score>0&&G.score>=G.best?' — novo recorde!':'')+'\nToque em Novo jogo':R.fail?'WebGL indisponível':'';
  m.textContent=t;m.style.whiteSpace='pre-line';m.style.textAlign='center';m.style.display='flex';m.style.alignItems='center';m.style.justifyContent='center';m.style.fontWeight='700';m.style.fontSize='17px';m.style.lineHeight='1.4';m.style.borderRadius='12px';m.style.background=t?'rgba(2,6,23,.74)':'transparent';m.style.visibility=t?'visible':'hidden';m.style.pointerEvents='none'}
 var p=$('lPause');if(p){p.textContent=G.state==='pause'?'Continuar':'Pausar';p.disabled=G.state!=='play'&&G.state!=='pause'}};

/* ---------- malhas ---------- */
function M(){this.v=[]}
M.prototype.t=function(a,b,c,n){this.v.push(a[0],a[1],a[2],n[0],n[1],n[2],b[0],b[1],b[2],n[0],n[1],n[2],c[0],c[1],c[2],n[0],n[1],n[2])};
M.prototype.box=function(){var h=.5,s=this,F=[[[0,1,0],[-h,h,-h],[h,h,-h],[-h,h,h]],[[0,-1,0],[-h,-h,h],[h,-h,h],[-h,-h,-h]],[[0,0,1],[-h,-h,h],[-h,h,h],[h,-h,h]],[[0,0,-1],[h,-h,-h],[h,h,-h],[-h,-h,-h]],[[1,0,0],[h,-h,h],[h,h,h],[h,-h,-h]],[[-1,0,0],[-h,-h,-h],[-h,h,-h],[-h,-h,h]]];
 F.forEach(function(f){var a=f[1],b=f[2],d=f[3],e=[b[0]+d[0]-a[0],b[1]+d[1]-a[1],b[2]+d[2]-a[2]];s.t(a,b,d,f[0]);s.t(b,e,d,f[0])})};
M.prototype.quad=function(){this.t([-.5,0,-.5],[.5,0,-.5],[-.5,0,.5],[0,1,0]);this.t([.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,1,0])};
M.prototype.octa=function(){var s=this,T=[0,1,0],B=[0,-1,0],P=[[1,0,0],[0,0,1],[-1,0,0],[0,0,-1]],i;
 function nr(a,b,c){var x=a[0]+b[0]+c[0],y=a[1]+b[1]+c[1],z=a[2]+b[2]+c[2],l=Math.sqrt(x*x+y*y+z*z);return[x/l,y/l,z/l]}
 for(i=0;i<4;i++){var a=P[i],b=P[(i+1)%4];s.t(T,a,b,nr(T,a,b));s.t(B,b,a,nr(B,b,a))}};

/* ---------- matrizes e GL ---------- */
function nrm(x,y,z){var l=Math.sqrt(x*x+y*y+z*z)||1;return[x/l,y/l,z/l]}
function persp(f,a,n,fa){var t=1/Math.tan(f/2),o=new Float32Array(16);o[0]=t/a;o[5]=t;o[10]=(fa+n)/(n-fa);o[11]=-1;o[14]=2*fa*n/(n-fa);return o}
function look(e,t){var f=nrm(t[0]-e[0],t[1]-e[1],t[2]-e[2]),s=nrm(-f[2],0,f[0]);
 var u=[s[1]*f[2]-s[2]*f[1],s[2]*f[0]-s[0]*f[2],s[0]*f[1]-s[1]*f[0]],o=new Float32Array(16);
 o[0]=s[0];o[4]=s[1];o[8]=s[2];o[1]=u[0];o[5]=u[1];o[9]=u[2];o[2]=-f[0];o[6]=-f[1];o[10]=-f[2];
 o[12]=-(s[0]*e[0]+s[1]*e[1]+s[2]*e[2]);o[13]=-(u[0]*e[0]+u[1]*e[1]+u[2]*e[2]);o[14]=f[0]*e[0]+f[1]*e[1]+f[2]*e[2];o[15]=1;return o}
function mul(a,b){var o=new Float32Array(16),i,j,k,v;for(i=0;i<4;i++)for(j=0;j<4;j++){v=0;for(k=0;k<4;k++)v+=a[k*4+j]*b[i*4+k];o[i*4+j]=v}return o}
var VS='attribute vec3 a_p;attribute vec3 a_n;uniform mat4 u_vp;uniform vec3 u_pos;uniform vec3 u_sc;uniform float u_ry;varying vec3 v_w;varying vec3 v_n;'+
'void main(){vec3 p=a_p*u_sc;float c=cos(u_ry),s=sin(u_ry);vec3 r=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);v_n=vec3(a_n.x*c+a_n.z*s,a_n.y,-a_n.x*s+a_n.z*c);v_w=r+u_pos;gl_Position=u_vp*vec4(v_w,1.0);}';
var FS='precision mediump float;varying vec3 v_w;varying vec3 v_n;uniform vec3 u_col;uniform float u_mode;uniform vec3 u_eye;uniform vec3 u_fog;'+
'void main(){vec3 col=u_col;float dd=length(u_eye-v_w);'+
' if(u_mode<0.5){vec3 N=normalize(v_n);float torch=1.0/(1.0+0.045*dd*dd);float up=max(N.y,0.0);col=u_col*(0.16+0.10*up+0.95*torch*(0.55+0.45*abs(dot(N,normalize(u_eye-v_w)))));}'+
' float f=clamp((dd-5.0)/22.0,0.0,1.0);if(u_mode>2.5)f=0.0;'+
' gl_FragColor=vec4(mix(col,u_fog,f),1.0);}';
function sh(gl,t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o}
function buf(gl,m){var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(m.v),gl.STATIC_DRAW);return{b:b,n:m.v.length/6}}
function initGL(c){
 var gl=null;try{gl=c.getContext('webgl',{antialias:true,alpha:false})||c.getContext('experimental-webgl',{antialias:true,alpha:false})}catch(e){}
 if(!gl){R.err='WebGL indisponível';return false}
 try{
  var p=gl.createProgram();gl.attachShader(p,sh(gl,gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  gl.useProgram(p);R.U={};['u_vp','u_pos','u_sc','u_ry','u_col','u_mode','u_eye','u_fog'].forEach(function(n){R.U[n]=gl.getUniformLocation(p,n)});
  R.ap=gl.getAttribLocation(p,'a_p');R.an=gl.getAttribLocation(p,'a_n');
  var b=new M(),q=new M(),o=new M();b.box();q.quad();o.octa();R.mesh={box:buf(gl,b),quad:buf(gl,q),octa:buf(gl,o)};
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.uniform3f(R.U.u_fog,FOG[0],FOG[1],FOG[2]);R.gl=gl;return true}catch(e){R.err=String(e&&e.message||e);return false}}
function draw(mesh,x,y,z,ry,sx,sy,sz,col,mode){
 var gl=R.gl,U=R.U,m=R.mesh[mesh];
 gl.bindBuffer(gl.ARRAY_BUFFER,m.b);gl.enableVertexAttribArray(R.ap);gl.vertexAttribPointer(R.ap,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(R.an);gl.vertexAttribPointer(R.an,3,gl.FLOAT,false,24,12);
 gl.uniform3f(U.u_pos,x,y,z);gl.uniform3f(U.u_sc,sx,sy,sz);gl.uniform1f(U.u_ry,ry);gl.uniform3f(U.u_col,col[0],col[1],col[2]);gl.uniform1f(U.u_mode,mode||0);
 gl.drawArrays(gl.TRIANGLES,0,m.n)}
function hex(h){return[parseInt(h.substr(1,2),16)/255,parseInt(h.substr(3,2),16)/255,parseInt(h.substr(5,2),16)/255]}
var K={wall:[hex('#6d5bd0'),hex('#4f7be0'),hex('#8a5bd0')],top:hex('#22d3ee'),f1:hex('#26304f'),f2:hex('#1d2540'),gem:[hex('#f0abfc'),hex('#fde047'),hex('#67e8f9')],exit:hex('#34d399'),exitD:hex('#10b981')};

/* ---------- desenho ---------- */
function frame(t){
 R.raf=0;var c=R.c;if(!c||!document.body.contains(c)||!R.gl)return;
 R.raf=requestAnimationFrame(frame);
 var dt=R.last?Math.min(.05,(t-R.last)/1000):.016;R.last=t;
 if(!G.freeze){var s0=G.state,tk=Math.ceil(G.time);step(dt);if(G.state==='play'&&Math.ceil(G.time)!==tk)C.ui()}
 var rc=c.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),W=Math.max(2,Math.round(rc.width*dpr)),H=Math.max(2,Math.round(rc.height*dpr));
 if(rc.width<2)return;if(c.width!==W||c.height!==H){c.width=W;c.height=H}
 R.W=W;R.H=H;R.frames++;render();drawMap()}
function render(){
 var gl=R.gl,U=R.U,i,j,n=G.n;
 gl.viewport(0,0,R.W,R.H);gl.clearColor(FOG[0],FOG[1],FOG[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 var bob=G.state==='play'?Math.sin(G.t*9)*.018*Math.min(1,Math.hypot(axes().f,axes().s)):0;
 var e=[G.x,1.15+bob,G.z],d=[Math.sin(G.yaw),0,Math.cos(G.yaw)];
 R.eye=e;R.vp=mul(persp(72*PI/180,R.W/Math.max(1,R.H),.08,120),look(e,[e[0]+d[0],e[1]-.02,e[2]+d[2]]));
 gl.uniformMatrix4fv(U.u_vp,false,R.vp);gl.uniform3f(U.u_eye,e[0],e[1],e[2]);
 // chão (xadrez) e teto escuro
 for(i=0;i<n;i++)for(j=0;j<n;j++)draw('box',(i+.5)*S,-.05,(j+.5)*S,0,S,.1,S,(i+j)%2?K.f1:K.f2);
 draw('box',n*S/2,WH+.05,n*S/2,0,n*S,.1,n*S,[.05,.05,.12]);
 // paredes
 for(i=0;i<G.walls.length;i++){var w=G.walls[i],cx=(w.x0+w.x1)/2,cz=(w.z0+w.z1)/2,sx=w.x1-w.x0,sz=w.z1-w.z0,hk=Math.floor(hash(Math.floor(cx*7)*31+Math.floor(cz*7)+G.level)*3);
  draw('box',cx,WH/2,cz,0,sx,WH,sz,K.wall[hk]);draw('box',cx,WH-.06,cz,0,sx+.02,.12,sz+.02,K.top,1);draw('box',cx,.05,cz,0,sx+.02,.1,sz+.02,K.top,1)}
 // gemas
 for(i=0;i<G.gems.length;i++){var g=G.gems[i];if(g.got)continue;draw('octa',g.x,.95+Math.sin(G.spin*1.5+i)*.12,g.z,G.spin+i,.26,.38,.26,K.gem[i%3],1)}
 // saída: base e farol visível de longe
 var ex=(G.ex.i+.5)*S,ez=(G.ex.j+.5)*S;
 draw('box',ex,.02,ez,0,1.5,.05,1.5,K.exit,1);draw('box',ex,.02+WH,ez,G.spin,.5,WH*2,.5,K.exitD,3);draw('box',ex,2.6,ez,G.spin,.9,.12,.9,K.exit,3)}
C.draw=render;

/* ---------- minimapa (revela só o visitado) ---------- */
function drawMap(){
 var cv=R.mx;if(!cv)return;var x=cv.getContext('2d');if(!x)return;var W=cv.width,H=cv.height,n=G.n,k=Math.min(W,H)/(n*S),i,j;
 x.clearRect(0,0,W,H);x.fillStyle='#0b1020';x.fillRect(0,0,W,H);x.lineCap='round';x.lineWidth=2;
 for(i=0;i<n;i++)for(j=0;j<n;j++){if(!G.vis[i][j])continue;
  x.fillStyle='rgba(148,163,184,.18)';x.fillRect(i*S*k,j*S*k,S*k,S*k);x.strokeStyle='#c4b5fd';x.beginPath();
  if(!(G.cells[i][j]&1)){x.moveTo(i*S*k,j*S*k);x.lineTo((i+1)*S*k,j*S*k)}
  if(!(G.cells[i][j]&2)){x.moveTo((i+1)*S*k,j*S*k);x.lineTo((i+1)*S*k,(j+1)*S*k)}
  if(!(G.cells[i][j]&4)){x.moveTo(i*S*k,(j+1)*S*k);x.lineTo((i+1)*S*k,(j+1)*S*k)}
  if(!(G.cells[i][j]&8)){x.moveTo(i*S*k,j*S*k);x.lineTo(i*S*k,(j+1)*S*k)}
  x.stroke()}
 G.gems.forEach(function(g){if(!g.got&&G.vis[g.i][g.j]){x.fillStyle='#f0abfc';x.beginPath();x.arc(g.x*k,g.z*k,2.6,0,2*PI);x.fill()}});
 if(G.vis[G.ex.i][G.ex.j]){x.fillStyle='#34d399';x.fillRect((G.ex.i+.5)*S*k-4,(G.ex.j+.5)*S*k-4,8,8)}
 var px=G.x*k,pz=G.z*k,dx=Math.sin(G.yaw),dz=Math.cos(G.yaw);
 x.fillStyle='#fde047';x.beginPath();x.moveTo(px+dx*7,pz+dz*7);x.lineTo(px-dx*4-dz*4,pz-dz*4+dx*4);x.lineTo(px-dx*4+dz*4,pz-dz*4-dx*4);x.closePath();x.fill()}

/* ---------- entrada ---------- */
var KEYS={ArrowUp:'f',w:'f',W:'f',ArrowDown:'b',s:'b',S:'b',ArrowLeft:'l',ArrowRight:'r',a:'sl',A:'sl',d:'sr',D:'sr'};
function key(e){
 if(!$('lView'))return;var k=e.key,u=true;
 if(KEYS[k]){if(G.state==='ready'||G.state==='over'){begin()}G.hold[KEYS[k]]=1}
 else if(k==='p'||k==='P'||k==='Escape')C.pause();
 else if(k==='Enter'||k===' '||k==='Spacebar'){if(G.state==='ready'||G.state==='over')begin();else u=false}
 else u=false;
 if(u&&e.preventDefault)e.preventDefault()}
function keyup(e){var k=KEYS[e.key];if(k)G.hold[k]=0}
function holdBtn(id,name){var b=$(id);if(!b||b.__ffl)return;b.__ffl=true;
 function on(e){if(G.state==='ready'||G.state==='over')begin();G.hold[name]=1;if(e.preventDefault)e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}}
 function off(){G.hold[name]=0}
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);b.style.touchAction='none'}
function gestures(cv){
 var d=null;cv.style.touchAction='none';
 cv.addEventListener('pointerdown',function(e){if(G.state==='ready'||G.state==='over'){begin();return}d={x:e.clientX,y:e.clientY,lx:e.clientX};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
 cv.addEventListener('pointermove',function(e){if(!d)return;var dx=e.clientX-d.lx;d.lx=e.clientX;if(G.state==='play')G.yaw-=dx*.012;
  var dy=e.clientY-d.y;G.drag.f=Math.abs(dy)<12?0:Math.max(-1,Math.min(1,-dy/70))});
 function up(){d=null;G.drag.f=0}
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up)}
C.init=function(){
 var cv=$('lView');loadBest();G.state='ready';G.seed=11;G.score=0;level(1);G.state='ready';C.ui();
 if(!cv)return;R.mx=$('lMap');
 if(R.c!==cv){R.c=cv;if(!initGL(cv)){R.fail=true;C.ui();var x=R.mx&&R.mx.getContext('2d');return}gestures(cv)}
 ['lFwd:f','lBack:b','lLeft:l','lRight:r'].forEach(function(s){var a=s.split(':');holdBtn(a[0],a[1])});
 if(!window.__ffLabKeys){window.__ffLabKeys=true;document.addEventListener('keydown',key);document.addEventListener('keyup',keyup);
  window.addEventListener('blur',function(){G.hold={f:0,b:0,l:0,r:0,sl:0,sr:0}});
  document.addEventListener('visibilitychange',function(){if(document.hidden&&G.state==='play'){G.state='pause';C.ui()}})}
 if(!R.raf)R.raf=requestAnimationFrame(frame)};
C.gl3d={get ok(){return!!R.gl},get error(){return R.err},get frames(){return R.frames},get fail(){return R.fail}};
C.test={state:function(){return G},freeze:function(f){G.freeze=!!f;R.last=0},step:step,level:level,axes:axes,
 setPos:function(x,z,yaw){G.x=x;G.z=z;if(yaw!=null)G.yaw=yaw;visit()},pathLen:function(){return pathLen(G.cells,G.n,G.ex.i,G.ex.j)},
 reachable:function(){var n=G.n,i,j;for(i=0;i<n;i++)for(j=0;j<n;j++)if(pathLen(G.cells,n,i,j)<0)return false;return true},
 render:render,seed:function(s){G.seed=s}};
})()}
