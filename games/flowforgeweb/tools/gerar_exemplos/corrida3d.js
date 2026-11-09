var $=function(i){return document.getElementById(i)};
if(!window.ffCorrida){(function(){
/* Corrida Neon 3D — corredor infinito em 3D com WebGL puro (sem bibliotecas).
   Três faixas, obstáculos (muro: troque de faixa; barreira baixa: pule; portal: deslize por baixo),
   moedas, 3 vidas, velocidade crescente. Teclado: ← → faixas, ↑ / Espaço pular, ↓ deslizar, P pausa.
   Toque no jogo: deslize para os lados, para cima (pular) ou para baixo (deslizar); toque simples = pular. */
var C=window.ffCorrida={},PI=Math.PI,KEY='ffCorridaV1';
function snd(n,v){try{if(window.Sons)window.Sons.play(n,v)}catch(e){}} // sons (componente Game Sound), se o projeto tiver
var LANES=[-1.7,0,1.7];
var G={state:'ready',t:0,dist:0,coins:0,lives:3,speed:14,lane:1,x:0,y:0,vy:0,slide:0,slideQ:false,inv:0,obs:[],coi:[],bld:[],par:[],nextZ:-45,bz:[0,0],shake:0,flash:0,best:0,score:0,overAt:0,freeze:false};
var R={c:null,gl:null,W:0,H:0,frames:0,last:0,eye:[0,0,0],ovKey:''};
C.gl3d={ok:false,error:'',frames:0};
var seed=(Date.now()>>>0)||1;
function rnd(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
var now=function(){return performance.now()};

/* ---------- malhas (posição, normal, cor, brilho) ---------- */
function Mesh(){this.v=[]}
Mesh.prototype.vx=function(p,n,col,e){this.v.push(p[0],p[1],p[2],n[0],n[1],n[2],col[0],col[1],col[2],e||0)};
Mesh.prototype.tri=function(a,b,c,n,col,e){this.vx(a,n,col,e);this.vx(b,n,col,e);this.vx(c,n,col,e)};
Mesh.prototype.quad=function(a,b,c,d,n,col,e){this.tri(a,b,c,n,col,e);this.tri(a,c,d,n,col,e)};
Mesh.prototype.box=function(cx,cy,cz,sx,sy,sz,col,e){
 var x0=cx-sx/2,x1=cx+sx/2,y0=cy-sy/2,y1=cy+sy/2,z0=cz-sz/2,z1=cz+sz/2;
 this.quad([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],[0,1,0],col,e);
 this.quad([x0,y0,z0],[x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[0,-1,0],col,e);
 this.quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],col,e);
 this.quad([x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0],[0,0,-1],col,e);
 this.quad([x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1],[1,0,0],col,e);
 this.quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],col,e)};
Mesh.prototype.ell=function(cx,cy,cz,rx,ry,rz,col,e,sg,rg){
 sg=sg||18;rg=rg||10;var self=this,i,j;
 function P(i,j){var th=PI*i/rg,ph=2*PI*j/sg,u=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];
  var n=[u[0]/rx,u[1]/ry,u[2]/rz],l=Math.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2])||1;return{p:[cx+u[0]*rx,cy+u[1]*ry,cz+u[2]*rz],n:[n[0]/l,n[1]/l,n[2]/l]}}
 for(i=0;i<rg;i++)for(j=0;j<sg;j++){var a=P(i,j),b=P(i+1,j),c=P(i+1,j+1),d=P(i,j+1);
  [a,b,c,a,c,d].forEach(function(q){self.vx(q.p,q.n,col,e)})}};
Mesh.prototype.prism=function(poly,y0,y1,col,e){
 var n=poly.length,i,cx=0,cz=0;poly.forEach(function(p){cx+=p[0]/n;cz+=p[1]/n});
 for(i=1;i<n-1;i++){
  this.tri([poly[0][0],y1,poly[0][1]],[poly[i][0],y1,poly[i][1]],[poly[i+1][0],y1,poly[i+1][1]],[0,1,0],col,e);
  this.tri([poly[0][0],y0,poly[0][1]],[poly[i+1][0],y0,poly[i+1][1]],[poly[i][0],y0,poly[i][1]],[0,-1,0],col,e)}
 for(i=0;i<n;i++){var a=poly[i],b=poly[(i+1)%n],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.sqrt(dx*dx+dz*dz)||1,nn=[dz/l,0,-dx/l];
  if(((a[0]+b[0])/2-cx)*nn[0]+((a[1]+b[1])/2-cz)*nn[2]<0)nn=[-nn[0],0,-nn[2]];
  this.quad([a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]],nn,col,e)}};
Mesh.prototype.cylZ=function(cx,cy,cz,r,len,col,e,seg){
 seg=seg||18;var z0=cz-len/2,z1=cz+len/2,k;
 for(k=0;k<seg;k++){var a0=2*PI*k/seg,a1=2*PI*(k+1)/seg,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
  var p00=[cx+r*c0,cy+r*s0,z0],p01=[cx+r*c1,cy+r*s1,z0],p10=[cx+r*c0,cy+r*s0,z1],p11=[cx+r*c1,cy+r*s1,z1];
  this.vx(p00,[c0,s0,0],col,e);this.vx(p01,[c1,s1,0],col,e);this.vx(p11,[c1,s1,0],col,e);
  this.vx(p00,[c0,s0,0],col,e);this.vx(p11,[c1,s1,0],col,e);this.vx(p10,[c0,s0,0],col,e);
  this.tri([cx,cy,z1],p10,p11,[0,0,1],col,e);this.tri([cx,cy,z0],p01,p00,[0,0,-1],col,e)}};
function disc(){var m=new Mesh(),k,n=20;for(k=0;k<n;k++){var a=2*PI*k/n,b=2*PI*(k+1)/n;
 m.tri([0,0,0],[.5*Math.cos(a),0,.5*Math.sin(a)],[.5*Math.cos(b),0,.5*Math.sin(b)],[0,1,0],[0,0,0],0)}return m}

var CY=[.13,.83,.93],MG=[.95,.2,.65],OR=[1,.55,.1],WH=[1,1,1];
function shipMesh(){var m=new Mesh();
 m.ell(0,.36,0,.3,.2,.78,CY,0,20,12);
 m.ell(0,.52,-.12,.17,.13,.3,[.1,.12,.3],.45,14,8);
 m.prism([[.18,-.15],[.92,.5],[.92,.72],[.18,.52]],.27,.34,MG,.15);
 m.prism([[-.18,-.15],[-.18,.52],[-.92,.72],[-.92,.5]],.27,.34,MG,.15);
 m.box(0,.62,.55,.05,.3,.32,MG,.2);
 m.cylZ(-.14,.32,.8,.09,.14,OR,1,12);m.cylZ(.14,.32,.8,.09,.14,OR,1,12);
 m.box(0,.12,.05,.55,.03,1.35,CY,1);
 return m}
function wallMesh(){var m=new Mesh();
 m.box(0,.95,0,1.4,1.9,1,[.2,.1,.35],0);m.box(0,1.9,0,1.48,.1,1.08,MG,1);m.box(0,.04,0,1.48,.08,1.08,MG,.8);
 m.box(-.45,.95,.51,.13,1.6,.02,MG,1);m.box(.45,.95,.51,.13,1.6,.02,MG,1);m.box(0,.95,.51,.13,1.6,.02,[.2,.9,1],1);
 return m}
function hurdleMesh(){var m=new Mesh();
 m.box(-.66,.33,0,.14,.66,.16,[.3,.3,.42],0);m.box(.66,.33,0,.14,.66,.16,[.3,.3,.42],0);
 m.box(0,.5,0,1.5,.22,.2,OR,.9);m.box(0,.2,0,1.5,.1,.2,WH,.6);return m}
function gateMesh(){var m=new Mesh();
 m.box(-.75,.85,0,.14,1.7,.3,[.25,.25,.42],0);m.box(.75,.85,0,.14,1.7,.3,[.25,.25,.42],0);
 m.box(0,1.1,0,1.5,.5,.3,[1,.15,.2],.9);m.box(0,1.74,0,1.64,.1,.34,[.3,.3,.45],.2);
 m.box(0,1.1,.16,1.2,.08,.02,WH,1);return m}
function coinMesh(){var m=new Mesh();m.cylZ(0,0,0,.34,.08,[1,.82,.2],.7,18);m.cylZ(0,0,0,.2,.1,[1,.95,.6],.9,14);return m}
function cube(e){var m=new Mesh();m.box(0,0,0,1,1,1,[1,1,1],e);return m}
function quadFloor(){var m=new Mesh();m.quad([-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,1,0],[1,1,1],0);return m}

/* ---------- matrizes ---------- */
function ident(){var o=new Float32Array(16);o[0]=o[5]=o[10]=o[15]=1;return o}
function mul(a,b){var o=new Float32Array(16),i,j,k,v;for(i=0;i<4;i++)for(j=0;j<4;j++){v=0;for(k=0;k<4;k++)v+=a[k*4+j]*b[i*4+k];o[i*4+j]=v}return o}
function mT(x,y,z){var o=ident();o[12]=x;o[13]=y;o[14]=z;return o}
function mS(x,y,z){var o=ident();o[0]=x;o[5]=y;o[10]=z;return o}
function mRY(a){var o=ident(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o}
function mRX(a){var o=ident(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o}
function mRZ(a){var o=ident(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o}
function model(x,y,z,ry,rx,rz,sx,sy,sz){return mul(mT(x,y,z),mul(mRY(ry||0),mul(mRX(rx||0),mul(mRZ(rz||0),mS(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz)))))}
function nrm(x,y,z){var l=Math.sqrt(x*x+y*y+z*z)||1;return[x/l,y/l,z/l]}
function persp(f,a,n,fa){var t=1/Math.tan(f/2),o=new Float32Array(16);o[0]=t/a;o[5]=t;o[10]=(fa+n)/(n-fa);o[11]=-1;o[14]=2*fa*n/(n-fa);return o}
function look(e,t){var f=nrm(t[0]-e[0],t[1]-e[1],t[2]-e[2]),s=nrm(-f[2],0,f[0]);
 var u=[s[1]*f[2]-s[2]*f[1],s[2]*f[0]-s[0]*f[2],s[0]*f[1]-s[1]*f[0]];
 var o=new Float32Array(16);o[0]=s[0];o[4]=s[1];o[8]=s[2];o[1]=u[0];o[5]=u[1];o[9]=u[2];o[2]=-f[0];o[6]=-f[1];o[10]=-f[2];
 o[12]=-(s[0]*e[0]+s[1]*e[1]+s[2]*e[2]);o[13]=-(u[0]*e[0]+u[1]*e[1]+u[2]*e[2]);o[14]=f[0]*e[0]+f[1]*e[1]+f[2]*e[2];o[15]=1;return o}

/* ---------- shaders ---------- */
var VS3='attribute vec3 a_p;attribute vec3 a_n;attribute vec3 a_c;attribute float a_e;uniform mat4 u_vp;uniform mat4 u_m;varying vec3 v_w;varying vec3 v_n;varying vec3 v_c;varying float v_e;varying vec3 v_l;'+
'void main(){vec4 w=u_m*vec4(a_p,1.0);v_w=w.xyz;v_n=(u_m*vec4(a_n,0.0)).xyz;v_c=a_c;v_e=a_e;v_l=a_p;gl_Position=u_vp*w;}';
var FS3='precision mediump float;varying vec3 v_w;varying vec3 v_n;varying vec3 v_c;varying float v_e;varying vec3 v_l;'+
'uniform vec3 u_eye;uniform vec3 u_fog;uniform vec3 u_tint;uniform float u_mode;uniform float u_a;uniform float u_t;uniform float u_seed;uniform float u_top;'+
'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+u_seed)*43758.5453);}'+
'void main(){float dist=length(v_w-u_eye);float fg=smoothstep(30.0,115.0,dist);vec3 col;float a=1.0;'+
' vec3 L=normalize(vec3(-0.35,0.8,0.55));'+
' if(u_mode<0.5){vec3 N=normalize(v_n);vec3 V=normalize(u_eye-v_w);float d=max(dot(N,L),0.0);vec3 b=v_c*u_tint;'+
'  col=b*(0.38+0.62*d+0.15*max(N.y,0.0))+b*v_e*1.25;vec3 H=normalize(L+V);col+=vec3(pow(max(dot(N,H),0.0),24.0))*0.22*(1.0-v_e);'+
'  col+=vec3(0.9,0.2,0.8)*pow(1.0-max(dot(N,V),0.0),3.0)*0.18;}'+
' else if(u_mode<1.5){float ax=abs(v_w.x);float inT=step(ax,2.6);float pulse=0.85+0.15*sin(u_t*2.5);'+
'  vec3 base=mix(vec3(0.03,0.012,0.07),vec3(0.045,0.02,0.1),inT);vec2 f=abs(fract(v_w.xz/3.0)-0.5);float lw=0.012+dist*0.0009;'+
'  float g=max(1.0-smoothstep(0.0,lw,0.5-f.x),1.0-smoothstep(0.0,lw,0.5-f.y));'+
'  vec3 gc=mix(vec3(1.0,0.2,0.7),vec3(0.1,0.8,1.0),inT);col=base+gc*g*mix(0.8,0.5,inT)*pulse;'+
'  float sepd=abs(ax-0.85);float sep=(1.0-smoothstep(0.0,0.03+dist*0.0006,sepd))*step(0.5,fract(v_w.z/2.5))*step(ax,2.0);col+=vec3(0.3,0.9,1.0)*sep*0.9;'+
'  float ed=abs(ax-2.7);col+=vec3(1.0,0.25,0.75)*(1.0-smoothstep(0.0,0.07+dist*0.001,ed))*1.3+vec3(1.0,0.2,0.7)*0.22*exp(-ed*5.0);}'+
' else if(u_mode<2.5){float r=length(v_l.xz)*2.0;if(r>1.0)discard;a=u_a*(1.0-smoothstep(0.0,1.0,r));col=vec3(0.0);fg=0.0;}'+
' else{vec3 N=normalize(v_n);float d=max(dot(N,L),0.0);col=u_tint*(0.3+0.5*d);float side=1.0-abs(N.y);'+
'  float hc=abs(N.x)>0.5?v_w.z:v_w.x;vec2 q=vec2(hc,v_w.y*0.8);vec2 cell=floor(q);vec2 fr=fract(q);'+
'  float win=step(0.2,fr.x)*step(fr.x,0.8)*step(0.2,fr.y)*step(fr.y,0.75);float on=step(0.5,h(cell));'+
'  vec3 wc=h(cell+7.0)>0.5?vec3(1.0,0.75,0.3):vec3(0.3,0.9,1.0);col+=wc*win*on*side*0.95;'+
'  col+=vec3(1.0,0.2,0.7)*smoothstep(u_top-0.35,u_top-0.1,v_w.y)*side*1.2;}'+
' col=mix(col,u_fog,fg);gl_FragColor=vec4(col,a);}';
var VS2='attribute vec2 a_q;varying vec2 v_u;void main(){v_u=a_q*0.5+0.5;gl_Position=vec4(a_q,0.0,1.0);}';
var FS2='precision mediump float;varying vec2 v_u;uniform float u_mode;uniform float u_hor;uniform float u_asp;uniform float u_t;uniform vec4 u_c;uniform sampler2D u_ov;'+
'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
'void main(){if(u_mode>1.5){gl_FragColor=vec4(u_c.rgb*u_c.a,u_c.a);return;}'+
' if(u_mode>0.5){gl_FragColor=texture2D(u_ov,vec2(v_u.x,1.0-v_u.y));return;}'+
' float y=v_u.y;float t=clamp((y-u_hor)/(1.0-u_hor),0.0,1.0);vec3 hc=vec3(0.45,0.08,0.42);vec3 col=mix(hc,vec3(0.02,0.0,0.12),pow(t,0.55));if(y<u_hor)col=hc;'+
' vec2 c=vec2(0.5,u_hor+0.2);vec2 p=(v_u-c)*vec2(u_asp,1.0);float r=length(p);float sun=1.0-smoothstep(0.17,0.175,r);'+
' float yy=c.y-v_u.y;float cut=step(0.0,yy)*step(fract(yy*26.0),yy*3.2);sun*=1.0-cut;'+
' vec3 sc=mix(vec3(1.0,0.85,0.25),vec3(1.0,0.2,0.6),clamp((c.y+0.17-v_u.y)/0.34,0.0,1.0));'+
' col+=vec3(1.0,0.3,0.6)*exp(-r*4.5)*0.45*step(u_hor,y);col=mix(col,sc,sun*step(u_hor,y));'+
' float s=step(0.996,h(floor(v_u*vec2(u_asp*110.0,110.0))))*step(u_hor+0.1,y)*(0.5+0.5*sin(u_t*3.0+h(floor(v_u*100.0))*6.0));col+=vec3(s);'+
' gl_FragColor=vec4(col,1.0);}';

function sh(gl,t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o}
function prog(gl,vs,fs,attrs,uni){var p=gl.createProgram();gl.attachShader(p,sh(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl,gl.FRAGMENT_SHADER,fs));
 attrs.forEach(function(n,i){gl.bindAttribLocation(p,i,n)});gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
 var U={};uni.forEach(function(n){U[n]=gl.getUniformLocation(p,n)});return{p:p,U:U}}
function buf(gl,m){var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(m.v),gl.STATIC_DRAW);return{b:b,n:m.v.length/10}}

function initGL(c){
 var gl=null;try{gl=c.getContext('webgl',{antialias:true,alpha:false})||c.getContext('experimental-webgl',{antialias:true,alpha:false})}catch(e){}
 if(!gl){C.gl3d.error='WebGL indisponível';return false}
 try{
  R.P3=prog(gl,VS3,FS3,['a_p','a_n','a_c','a_e'],['u_vp','u_m','u_eye','u_fog','u_tint','u_mode','u_a','u_t','u_seed','u_top']);
  R.P2=prog(gl,VS2,FS2,['a_q'],['u_mode','u_hor','u_asp','u_t','u_c','u_ov']);
  R.M={ship:buf(gl,shipMesh()),wall:buf(gl,wallMesh()),hurdle:buf(gl,hurdleMesh()),gate:buf(gl,gateMesh()),coin:buf(gl,coinMesh()),cube:buf(gl,cube(0)),glow:buf(gl,cube(1)),floor:buf(gl,quadFloor()),disc:buf(gl,disc())};
  var q=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,q);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);R.Q=q;
  R.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,R.tex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
  gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthFunc(gl.LEQUAL);
  R.ov=document.createElement('canvas');R.gl=gl;return true}
 catch(e){C.gl3d.error=String(e&&e.message||e);return false}}

function useP3(){var gl=R.gl,i;gl.useProgram(R.P3.p);for(i=0;i<4;i++)gl.enableVertexAttribArray(i)}
function useP2(){var gl=R.gl,i;gl.useProgram(R.P2.p);gl.enableVertexAttribArray(0);for(i=1;i<4;i++)gl.disableVertexAttribArray(i)}
function draw(name,m,tint,mode,a,top,sd){
 var gl=R.gl,U=R.P3.U,b=R.M[name];
 gl.bindBuffer(gl.ARRAY_BUFFER,b.b);
 gl.vertexAttribPointer(0,3,gl.FLOAT,false,40,0);gl.vertexAttribPointer(1,3,gl.FLOAT,false,40,12);gl.vertexAttribPointer(2,3,gl.FLOAT,false,40,24);gl.vertexAttribPointer(3,1,gl.FLOAT,false,40,36);
 gl.uniformMatrix4fv(U.u_m,false,m);gl.uniform3f(U.u_tint,tint[0],tint[1],tint[2]);gl.uniform1f(U.u_mode,mode||0);gl.uniform1f(U.u_a,a==null?1:a);gl.uniform1f(U.u_top,top||0);gl.uniform1f(U.u_seed,sd||0);
 gl.drawArrays(gl.TRIANGLES,0,b.n)}
function quad2(mode,col){var gl=R.gl,U=R.P2.U;gl.bindBuffer(gl.ARRAY_BUFFER,R.Q);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 gl.uniform1f(U.u_mode,mode);if(col)gl.uniform4f(U.u_c,col[0],col[1],col[2],col[3]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}

/* ---------- mensagens sobre o jogo (texto desenhado em canvas 2D, usado como textura) ---------- */
function paintOverlay(){
 var W=R.W,H=R.H,key=G.state+'|'+G.score+'|'+G.best+'|'+W+'|'+H+'|'+(G.state==='over'?1:0);
 if(key===R.ovKey)return;R.ovKey=key;
 var ov=R.ov,gl=R.gl;ov.width=W;ov.height=H;var x=ov.getContext('2d'),u=W/444;x.clearRect(0,0,W,H);
 if(G.state!=='play'){
  x.fillStyle='rgba(6,2,22,.62)';x.fillRect(W*.07,H*.27,W*.86,H*.4);
  x.strokeStyle='rgba(255,70,170,.9)';x.lineWidth=2*u;x.strokeRect(W*.07,H*.27,W*.86,H*.4);
  x.textAlign='center';x.textBaseline='middle';x.shadowColor='#ff2fa0';x.shadowBlur=18*u;x.fillStyle='#fff';
  var big=function(t,y,s){x.font='900 '+(s*u)+'px system-ui,sans-serif';x.fillText(t,W/2,y)};
  var small=function(t,y,s,c){x.shadowBlur=0;x.fillStyle=c||'#e9d5ff';x.font='600 '+(s*u)+'px system-ui,sans-serif';x.fillText(t,W/2,y);x.shadowBlur=18*u;x.fillStyle='#fff'};
  if(G.state==='ready'){big('CORRIDA NEON',H*.36,44);x.shadowColor='#22d3ee';x.fillStyle='#67e8f9';big('3D',H*.44,36);
   small('Toque, Espaço ou ↑ para começar',H*.54,17);small('← → faixas · ↑ pular · ↓ deslizar',H*.60,15,'#a5b4fc')}
  else if(G.state==='pause'){big('PAUSADO',H*.42,46);small('Pressione P ou use Continuar',H*.54,17)}
  else{big('FIM DE JOGO',H*.37,42);small('Pontos: '+G.score,H*.46,24,'#fde68a');
   small(G.score>0&&G.score>=G.best?'★ NOVO RECORDE ★':'Recorde: '+G.best,H*.53,18,'#fbbf24');small('Toque ou Enter para recomeçar',H*.61,16)}
 }
 gl.bindTexture(gl.TEXTURE_2D,R.tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,ov);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false)}

/* ---------- mundo ---------- */
var BT=[[.12,.08,.3],[.2,.07,.35],[.08,.12,.32],[.25,.06,.3],[.1,.1,.2]];
function genBuildings(pz){
 for(var q=G.bld.length-1;q>=0;q--)if(G.bld[q].z>pz+40)G.bld.splice(q,1);
 for(var side=0;side<2;side++){
  while(G.bz[side]>pz-125){
   var w=3+rnd()*4,d=4+rnd()*4,h=4+rnd()*14,xs=(7+w/2+rnd()*3)*(side?1:-1),z=G.bz[side]-d/2;
   G.bld.push({x:xs,z:z,w:w,d:d,h:h,t:BT[(rnd()*BT.length)|0],s:rnd()*50});
   G.bz[side]-=d+1+rnd()*4}}}
function coinsLine(x,z0,n,y){for(var i=0;i<n;i++)G.coi.push({x:x,z:z0-i*2.2,y:y||.95,got:false})}
function addObs(t,l,z){G.obs.push({t:t,lane:l,x:LANES[l],z:z,hit:false})}
function row(z){
 var d=G.dist/2,i;
 if(rnd()<.2){coinsLine(LANES[(rnd()*3)|0],z+4.4,5);return}
 var nb=d<60?1:(d<250?(rnd()<.5?1:2):(rnd()<.35?1:2));
 var free=(rnd()*3)|0,order=[0,1,2].filter(function(l){return l!==free});if(rnd()<.5)order.reverse();
 for(i=0;i<nb;i++){var l=order[i],r=rnd(),t=d<40?(r<.55?'wall':'hurdle'):(r<.38?'wall':(r<.7?'hurdle':'gate'));
  addObs(t,l,z);
  if(t==='hurdle'&&rnd()<.6){G.coi.push({x:LANES[l],z:z+1.4,y:1.35,got:false},{x:LANES[l],z:z,y:1.6,got:false},{x:LANES[l],z:z-1.4,y:1.35,got:false})}}
 if(rnd()<.7)coinsLine(LANES[free],z+4.4,5)}
function burst(x,y,z,n,cols){
 for(var i=0;i<n;i++){var a=rnd()*2*PI,sp=1.5+rnd()*3.5;
  G.par.push({x:x,y:y,z:z,vx:Math.cos(a)*sp,vy:1+rnd()*3.5,vz:Math.sin(a)*sp,life:.55+rnd()*.35,max:.9,col:cols[(rnd()*cols.length)|0],s:.16})}}
function saveBest(){if(G.score>G.best){G.best=G.score;try{localStorage.setItem(KEY,String(G.best))}catch(e){}}}
function loadBest(){try{G.best=parseInt(localStorage.getItem(KEY),10)||0}catch(e){G.best=0}}

C.reset=function(){
 snd('start');G.state='play';G.t=0;G.dist=0;G.coins=0;G.lives=3;G.speed=14;G.lane=1;G.x=0;G.y=0;G.vy=0;G.slide=0;G.slideQ=false;G.inv=0;G.shake=0;G.flash=0;G.score=0;
 G.obs=[];G.coi=[];G.par=[];G.nextZ=-45;G.overAt=0;R.ovKey='';C.ui()};
function hurt(){
 if(G.inv>0)return;
 G.lives--;snd(G.lives<=0?'explosion':'hit');G.shake=.6;G.flash=1;G.inv=1.6;burst(G.x,.6,-G.dist,18,[[1,.3,.2],[1,.7,.2],[1,1,1]]);
 if(G.lives<=0){setTimeout(function(){snd('lose')},550);G.state='over';G.overAt=now();G.score=Math.floor(G.dist/2)+G.coins*10;saveBest()}
 C.ui()}
C.step=function(dt){
 if(G.state!=='play')return;
 var pz0=-G.dist,i;
 G.t+=dt;G.speed=Math.min(36,14+G.t*.3);G.dist+=G.speed*dt;var pz=-G.dist;
 var tx=LANES[G.lane];G.x+=(tx-G.x)*(1-Math.exp(-dt*14));if(Math.abs(tx-G.x)<.01)G.x=tx;
 if(G.y>0||G.vy>0){G.vy-=30*dt;G.y+=G.vy*dt;if(G.y<=0){G.y=0;G.vy=0;if(G.slideQ){G.slide=.7;G.slideQ=false}}}
 if(G.slide>0)G.slide-=dt;if(G.inv>0)G.inv-=dt;if(G.shake>0)G.shake=Math.max(0,G.shake-dt*1.6);if(G.flash>0)G.flash=Math.max(0,G.flash-dt*2.2);
 var sp=Math.max(13,G.speed*.85);while(G.nextZ>pz-95){row(G.nextZ);G.nextZ-=sp}
 var ph=G.slide>0?.5:1.1,py=G.y;
 G.obs.forEach(function(o){if(o.hit)return;
  var hw=o.t==='wall'?.7:(o.t==='hurdle'?.75:.62),hd=o.t==='wall'?.5:.25,y0=o.t==='gate'?.85:0,y1=o.t==='wall'?1.9:(o.t==='hurdle'?.65:1.35);
  if(o.z+hd<pz-.4||o.z-hd>pz0+.4)return;if(Math.abs(o.x-G.x)>hw+.3)return;if(py>=y1||py+ph<=y0)return;
  o.hit=true;hurt()});
 G.coi.forEach(function(c){if(c.got||G.state!=='play')return;
  if(c.z<pz-.5||c.z>pz0+.5)return;if(Math.abs(c.x-G.x)>.75)return;if(c.y<py-.25||c.y>py+ph+.25)return;
  c.got=true;G.coins++;snd('coin',.7);burst(c.x,c.y,c.z,7,[[1,.85,.2],[1,1,.6]])});
 if(G.state==='play'){if(rnd()<.8)G.par.push({x:G.x+(rnd()<.5?-.14:.14),y:G.y+.32,z:pz+.85,vx:0,vy:.2,vz:2,life:.35,max:.35,col:[.2,.9,1],s:.1});
  G.score=Math.floor(G.dist/2)+G.coins*10}
 for(i=G.obs.length-1;i>=0;i--)if(G.obs[i].z>pz+25)G.obs.splice(i,1);
 for(i=G.coi.length-1;i>=0;i--)if(G.coi[i].z>pz+25||G.coi[i].got)G.coi.splice(i,1)};
function parts(dt){for(var i=G.par.length-1;i>=0;i--){var p=G.par[i];p.life-=dt;if(p.life<=0){G.par.splice(i,1);continue}p.vy-=9*dt;p.x+=p.vx*dt;p.y=Math.max(.05,p.y+p.vy*dt);p.z+=p.vz*dt}}

/* ---------- comandos ---------- */
function begin(){if(G.state==='ready'||(G.state==='over'&&now()-G.overAt>550)){C.reset();return true}return G.state==='play'}
C.left=function(){if(!begin())return;if(G.state==='play'&&G.lane>0){G.lane--;snd('move')}};
C.right=function(){if(!begin())return;if(G.state==='play'&&G.lane<2){G.lane++;snd('move')}};
C.jump=function(){if(!begin())return;if(G.state!=='play')return;if(G.y<=0&&G.vy<=0){G.vy=10;G.slide=0;G.slideQ=false;snd('jump')}};
C.slide=function(){if(!begin())return;if(G.state!=='play')return;if(G.y>0){G.vy=Math.min(G.vy,-16);G.slideQ=true}else{G.slide=.7;snd('tick')}};
C.pause=function(){if(G.state==='play')G.state='pause';else if(G.state==='pause'){G.state='play'}R.ovKey='';C.ui()};
C.btn=function(n,a){var f=C[n];if(typeof f==='function')f(a);var e=document.activeElement;if(e&&e.blur&&e.tagName==='BUTTON')e.blur()};
function key(e){
 if(!$('cView'))return;var k=e.key,used=true;
 if(k==='ArrowLeft'||k==='a'||k==='A')C.left();
 else if(k==='ArrowRight'||k==='d'||k==='D')C.right();
 else if(k==='ArrowUp'||k==='w'||k==='W'||k===' '||k==='Spacebar')C.jump();
 else if(k==='ArrowDown'||k==='s'||k==='S')C.slide();
 else if(k==='p'||k==='P'||k==='Escape')C.pause();
 else if(k==='Enter'){if(G.state==='over'||G.state==='ready')begin();else used=false}
 else used=false;
 if(used&&e.preventDefault)e.preventDefault()}
function gestures(cv){
 var d=null;cv.style.touchAction='none';
 cv.addEventListener('pointerdown',function(e){d={x:e.clientX,y:e.clientY,fired:false};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
 cv.addEventListener('pointermove',function(e){if(!d||d.fired)return;var dx=e.clientX-d.x,dy=e.clientY-d.y;
  if(Math.max(Math.abs(dx),Math.abs(dy))<26)return;d.fired=true;
  if(Math.abs(dx)>Math.abs(dy)){if(dx<0)C.left();else C.right()}else{if(dy<0)C.jump();else C.slide()}});
 cv.addEventListener('pointerup',function(){if(d&&!d.fired){if(G.state==='pause')C.pause();else C.jump()}d=null});
 cv.addEventListener('pointercancel',function(){d=null})}

/* ---------- placar (componentes do FlowForge) ---------- */
function st(id,t){var e=$(id);if(e){e.style.whiteSpace='pre-line';e.style.textAlign='center';e.style.fontWeight='700';e.style.lineHeight='1.35';e.textContent=t}}
C.ui=function(){
 saveBest();var hearts='';for(var i=0;i<3;i++)hearts+=i<G.lives?'♥':'♡';
 st('cScore','PONTOS\n'+G.score);st('cCoins','MOEDAS\n'+G.coins);st('cLives','VIDAS\n'+hearts);st('cBest','RECORDE\n'+Math.max(G.best,G.score));
 var s=$('cStatus');if(s)s.textContent=G.state==='over'?'Fim de jogo — '+G.score+' pontos':G.state==='pause'?'Pausado':G.state==='ready'?'Pronto — toque, Espaço ou ↑ para começar':'Correndo — '+Math.round(G.speed*3.6)+' km/h';
 var pb=$('cPause');if(pb){pb.textContent=G.state==='pause'?'Continuar':'Pausar';pb.disabled=G.state==='over'||G.state==='ready'}};

/* ---------- quadro ---------- */
var FOG=[.45,.08,.42];
function render(){
 var c=R.c,gl=R.gl;if(!c||!document.body.contains(c)||!gl)return;
 var rc=c.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),W=Math.max(2,Math.round(rc.width*dpr)),H=Math.max(2,Math.round(rc.height*dpr));
 if(rc.width<2)return;if(c.width!==W||c.height!==H){c.width=W;c.height=H}R.W=W;R.H=H;
 var pz=-G.dist,t=now()/1000,i;
 var sx=(rnd()-.5)*G.shake*.5,sy=(rnd()-.5)*G.shake*.4;
 var cx=G.x*.55,eye=[cx+sx,3.3+G.y*.35+sy,pz+6.8],tg=[cx*.6,1.0,pz-9];
 var fov=(60+(G.speed-14)*.35)*PI/180,view=look(eye,tg),vp=mul(persp(fov,W/H,.5,230),view);R.eye=eye;
 var hy=(vp[1]*0+vp[5]*0+vp[9]*(pz-2000)+vp[13])/(vp[11]*(pz-2000)+vp[15]),hor=Math.max(0,Math.min(1,hy*.5+.5));
 gl.viewport(0,0,W,H);gl.clearColor(FOG[0],FOG[1],FOG[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);useP2();var U2=R.P2.U;gl.uniform1f(U2.u_hor,hor);gl.uniform1f(U2.u_asp,W/H);gl.uniform1f(U2.u_t,t);gl.uniform1i(U2.u_ov,0);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,R.tex);quad2(0);
 gl.enable(gl.DEPTH_TEST);useP3();var U=R.P3.U;gl.uniformMatrix4fv(U.u_vp,false,vp);gl.uniform3f(U.u_eye,eye[0],eye[1],eye[2]);gl.uniform3f(U.u_fog,FOG[0],FOG[1],FOG[2]);gl.uniform1f(U.u_t,t);
 draw('floor',model(0,0,pz-70,0,0,0,90,1,230),[1,1,1],1);
 G.bld.forEach(function(b){if(b.z>pz+12||b.z<pz-130)return;draw('cube',model(b.x,b.h/2,b.z,0,0,0,b.w,b.h,b.d),b.t,3,1,b.h,b.s)});
 G.obs.forEach(function(o){if(o.z>pz+8||o.z<pz-125)return;draw(o.t,model(o.x,0,o.z),[1,1,1],0)});
 G.coi.forEach(function(k){if(k.got||k.z>pz+8||k.z<pz-125)return;draw('coin',model(k.x,k.y+Math.sin(t*4+k.z)*.06,k.z,t*3+k.z),[1,1,1],0)});
 var blink=G.inv>0&&Math.floor(G.inv*12)%2===0;
 var slv=G.slide>0?Math.max(0,Math.min(1,(.7-G.slide)/.1,G.slide/.1)):0;
 var vis=G.state==='over'?Math.floor(t*4)%2===0:!blink;
 if(vis)draw('ship',model(G.x,G.y+.02,pz,0,G.vy*.03,-(LANES[G.lane]-G.x)*.5-slv*1.1),[1,1,1],0);
 G.par.forEach(function(p){var s=p.s*Math.max(.1,p.life/p.max);draw('glow',model(p.x,p.y,p.z,p.life*5,0,0,s,s,s),p.col,0)});
 gl.enable(gl.BLEND);gl.depthMask(false);
 var bs=Math.max(.3,1.15-G.y*.35);draw('disc',model(G.x,.03,pz+.05,0,0,0,bs*1.1,1,bs*1.5),[1,1,1],2,.55-Math.min(.4,G.y*.2));
 gl.depthMask(true);gl.disable(gl.DEPTH_TEST);
 useP2();gl.uniform1i(R.P2.U.u_ov,0);
 if(G.flash>0)quad2(2,[1,.1,.2,G.flash*.38]);
 paintOverlay();gl.bindTexture(gl.TEXTURE_2D,R.tex);quad2(1);
 gl.disable(gl.BLEND);R.frames++;C.gl3d.frames=R.frames}

function fallback2d(c){var x=c.getContext('2d');if(!x)return;x.fillStyle='#1a0638';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.font='bold 18px system-ui,sans-serif';x.textAlign='center';x.fillText('Este navegador não tem WebGL.',c.width/2,c.height/2);x.font='14px system-ui,sans-serif';x.fillText('Abra em um navegador com suporte a 3D.',c.width/2,c.height/2+26)}
var uiKey='';
function loop(ts){
 R.raf=requestAnimationFrame(loop);
 var c=R.c;if(!c||!document.body.contains(c))return;
 var dt=R.last?Math.min(.05,(ts-R.last)/1000):.016;R.last=ts;
 if(!G.freeze){
  if(G.state==='play')C.step(dt);
  else if(G.state==='ready'){G.dist+=5*dt;G.nextZ=-G.dist-45}}
 genBuildings(-G.dist);parts(dt);
 var k=G.state+'|'+G.score+'|'+G.coins+'|'+G.lives+'|'+G.best+'|'+(G.state==='play'?Math.round(G.speed*3.6):0);
 if(k!==uiKey){uiKey=k;C.ui()}
 render()}
C.init=function(){
 var cv=$('cView');if(!cv)return;
 if(R.c!==cv){R.c=cv;R.gl=null;R.ovKey='';C.gl3d.ok=initGL(cv);if(!C.gl3d.ok)fallback2d(cv)}
 if(!cv.__ffc){cv.__ffc=true;gestures(cv)}
 if(!window.__ffCorridaKeys){window.__ffCorridaKeys=true;document.addEventListener('keydown',key);
  document.addEventListener('visibilitychange',function(){if(document.hidden&&G.state==='play'){G.state='pause';R.ovKey='';C.ui()}})}
 loadBest();G.bld=[];G.bz=[20,20];G.state='ready';G.dist=0;G.obs=[];G.coi=[];G.par=[];G.lives=3;G.coins=0;G.score=0;G.lane=1;G.x=0;G.y=0;G.vy=0;G.nextZ=-45;
 genBuildings(0);C.ui();
 if(C.gl3d.ok&&!R.raf)R.raf=requestAnimationFrame(loop)};
C.test={state:function(){return G},step:function(dt){C.step(dt);genBuildings(-G.dist);parts(dt)},freeze:function(f){G.freeze=!!f},
 seed:function(s){seed=s>>>0||1},addObs:addObs,addCoin:function(l,zAhead,y){G.coi.push({x:LANES[l],z:-G.dist-zAhead,y:y||.95,got:false})},
 clear:function(){G.obs=[];G.coi=[];G.par=[]},render:render,nextZ:function(v){G.nextZ=v},lanes:LANES};
})()}
