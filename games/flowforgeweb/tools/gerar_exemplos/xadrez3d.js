/* Renderizador 3D (WebGL puro, sem bibliotecas) para o motor window.ffChess.
   Substitui C.draw e C.click: o tabuleiro e as peças viram malhas 3D (peças torneadas),
   com iluminação, sombras suaves, câmera orbital (arraste/roda), animação dos lances e
   seleção por raio. Se o navegador não tiver WebGL, volta ao desenho 2D. */
if(window.ffChess&&!window.ffChess.gl3d){(function(){
var C=window.ffChess,PI=Math.PI;
var st=function(){return C.test.state()};
var $g=function(i){return document.getElementById(i)};
var R={c:null,gl:null,fail:false,yaw:0,yawT:0,pitch:.92,dist:15.5,flip:false,len:-1,an:null,raf:0,frames:0,down:null,moved:false,suppress:false,lastT:0,vp:null,eye:[0,0,0],W:0,H:0};
var HT={P:.78,R:.92,N:1.02,B:1.2,Q:1.34,K:1.42};

/* ---------- construtor de malhas ---------- */
function M(){this.v=[]}
M.prototype.t=function(a,b,c,na,nb,nc){var v=this.v;v.push(a[0],a[1],a[2],na[0],na[1],na[2],b[0],b[1],b[2],nb[0],nb[1],nb[2],c[0],c[1],c[2],nc[0],nc[1],nc[2])};
function nrm(x,y,z){var l=Math.sqrt(x*x+y*y+z*z)||1;return[x/l,y/l,z/l]}
function arc(cx,cy,rx,ry,a0,a1,n){var o=[],i,a;for(i=0;i<=n;i++){a=(a0+(a1-a0)*i/n)*PI/180;o.push([rx*Math.cos(a),cy+ry*Math.sin(a)])}return o}
/* torno: perfil [[raio,altura],...] de baixo para cima, terminando no eixo */
M.prototype.lathe=function(prof,ox,oy,oz,seg){
 seg=seg||32;ox=ox||0;oy=oy||0;oz=oz||0;
 var sn=[],i,k;
 for(i=0;i<prof.length-1;i++){var dr=prof[i+1][0]-prof[i][0],dy=prof[i+1][1]-prof[i][1],l=Math.sqrt(dr*dr+dy*dy);sn.push(l<1e-6?null:[dy/l,-dr/l])}
 var self=this;
 function nlo(i){var n=sn[i],p=i>0?sn[i-1]:null;if(n&&p&&n[0]*p[0]+n[1]*p[1]>.8)return nrm(n[0]+p[0],n[1]+p[1],0);return n}
 function nhi(i){var n=sn[i],q=i+1<sn.length?sn[i+1]:null;if(n&&q&&n[0]*q[0]+n[1]*q[1]>.8)return nrm(n[0]+q[0],n[1]+q[1],0);return n}
 for(i=0;i<sn.length;i++){
  if(!sn[i])continue;
  var a0=prof[i],a1=prof[i+1],n0=nlo(i),n1=nhi(i);
  for(k=0;k<seg;k++){
   var t0=k/seg*2*PI,t1=(k+1)/seg*2*PI,c0=Math.cos(t0),s0=Math.sin(t0),c1=Math.cos(t1),s1=Math.sin(t1);
   var p00=[a0[0]*c0+ox,a0[1]+oy,a0[0]*s0+oz],p01=[a0[0]*c1+ox,a0[1]+oy,a0[0]*s1+oz],p10=[a1[0]*c0+ox,a1[1]+oy,a1[0]*s0+oz],p11=[a1[0]*c1+ox,a1[1]+oy,a1[0]*s1+oz];
   var q00=[n0[0]*c0,n0[1],n0[0]*s0],q01=[n0[0]*c1,n0[1],n0[0]*s1],q10=[n1[0]*c0,n1[1],n1[0]*s0],q11=[n1[0]*c1,n1[1],n1[0]*s1];
   self.t(p00,p01,p11,q00,q01,q11);self.t(p00,p11,p10,q00,q11,q10)}}
};
M.prototype.sphere=function(cx,cy,cz,r,seg){this.lathe(arc(0,0,r,r,-90,90,12),cx,cy,cz,seg||20)};
M.prototype.box=function(cx,cy,cz,sx,sy,sz,ry){
 ry=ry||0;var c=Math.cos(ry),s=Math.sin(ry),hx=sx/2,hy=sy/2,hz=sz/2,self=this;
 function P(x,y,z){return[cx+x*c+z*s,cy+y,cz-x*s+z*c]}
 function N(x,y,z){return[x*c+z*s,y,-x*s+z*c]}
 function face(n,u,v,w){ // n normal; 4 cantos
  var a=P.apply(0,u),b=P.apply(0,v),d=P.apply(0,w),e=P.apply(0,[v[0]+w[0]-u[0],v[1]+w[1]-u[1],v[2]+w[2]-u[2]]),nn=N.apply(0,n);
  self.t(a,b,d,nn,nn,nn);self.t(b,e,d,nn,nn,nn)}
 face([0,1,0],[-hx,hy,-hz],[hx,hy,-hz],[-hx,hy,hz]);
 face([0,-1,0],[-hx,-hy,hz],[hx,-hy,hz],[-hx,-hy,-hz]);
 face([0,0,1],[-hx,-hy,hz],[-hx,hy,hz],[hx,-hy,hz]);
 face([0,0,-1],[hx,-hy,-hz],[hx,hy,-hz],[-hx,-hy,-hz]);
 face([1,0,0],[hx,-hy,hz],[hx,hy,hz],[hx,-hy,-hz]);
 face([-1,0,0],[-hx,-hy,-hz],[-hx,hy,-hz],[-hx,-hy,hz])};
function ears(poly){ // triangulação por "ear clipping" (polígono anti-horário)
 var idx=poly.map(function(_,i){return i}),out=[],guard=0;
 function cr(a,b,c){return(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}
 function inside(p,a,b,c){return cr(a,b,p)>=0&&cr(b,c,p)>=0&&cr(c,a,p)>=0}
 while(idx.length>3&&guard++<500){
  var found=false,i;
  for(i=0;i<idx.length;i++){
   var ia=idx[(i+idx.length-1)%idx.length],ib=idx[i],ic=idx[(i+1)%idx.length],a=poly[ia],b=poly[ib],c=poly[ic];
   if(cr(a,b,c)<=0)continue;
   var ok=true;idx.forEach(function(j){if(j!==ia&&j!==ib&&j!==ic&&inside(poly[j],a,b,c))ok=false});
   if(ok){out.push([ia,ib,ic]);idx.splice(i,1);found=true;break}}
  if(!found)break}
 if(idx.length===3)out.push([idx[0],idx[1],idx[2]]);
 return out}
M.prototype.extrude=function(poly,th,ry,oy,sc){
 var c=Math.cos(ry),s=Math.sin(ry),h=th/2,self=this;
 function P(p,z){var x=p[0]*sc,y=p[1]*sc+oy;return[x*c+z*s,y,-x*s+z*c]}
 function N(x,y,z){return[x*c+z*s,y,-x*s+z*c]}
 ears(poly).forEach(function(t){
  var nf=N(0,0,1),nb=N(0,0,-1);
  self.t(P(poly[t[0]],h),P(poly[t[1]],h),P(poly[t[2]],h),nf,nf,nf);
  self.t(P(poly[t[2]],-h),P(poly[t[1]],-h),P(poly[t[0]],-h),nb,nb,nb)});
 for(var i=0;i<poly.length;i++){
  var a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.sqrt(dx*dx+dy*dy)||1,n=N(dy/l,-dx/l,0);
  self.t(P(a,h),P(a,-h),P(b,-h),n,n,n);self.t(P(a,h),P(b,-h),P(b,h),n,n,n)}};

/* ---------- peças ---------- */
var BASE=[[0,0],[.37,0],[.39,.04],[.37,.09],[.31,.13]];
function pawn(){var m=new M();m.lathe(BASE.concat([[.22,.17],[.15,.3],[.13,.37],[.23,.41],[.23,.45],[.15,.47],[.10,.49]]).concat(arc(0,.62,.16,.16,-50,90,10)));return m}
function rook(){var m=new M(),i;m.lathe(BASE.concat([[.27,.17],[.21,.24],[.2,.52],[.25,.58],[.31,.63],[.31,.78],[0,.78]]));
 for(i=0;i<4;i++){var a=PI/4+i*PI/2;m.box(Math.cos(a)*.2,.85,Math.sin(a)*.2,.17,.14,.17,-a)}return m}
function bishop(){var m=new M();m.lathe(BASE.concat([[.25,.17],[.18,.25],[.12,.46],[.21,.53],[.21,.57],[.12,.61]]).concat(arc(0,.83,.17,.27,-62,90,14)));m.sphere(0,1.13,0,.075,14);return m}
function queen(){var m=new M(),i;m.lathe(BASE.concat([[.29,.17],[.2,.26],[.14,.56],[.25,.63],[.25,.69],[.15,.74],[.19,.92],[.27,1.08],[.22,1.12],[0,1.12]]));
 for(i=0;i<8;i++){var a=i*PI/4;m.sphere(Math.cos(a)*.22,1.16,Math.sin(a)*.22,.05,10)}m.sphere(0,1.26,0,.085,14);return m}
function king(){var m=new M();m.lathe(BASE.concat([[.29,.17],[.2,.26],[.14,.56],[.25,.63],[.25,.69],[.15,.74],[.19,.92],[.25,1.06],[.2,1.1],[.16,1.12],[0,1.12]]));
 m.box(0,1.28,0,.09,.34,.09,0);m.box(0,1.33,0,.27,.09,.09,0);return m}
var HORSE=[[-.26,.1],[.26,.1],[.24,.28],[.10,.44],[.30,.50],[.37,.58],[.31,.67],[.16,.81],[.12,.95],[.02,.85],[-.10,.83],[-.24,.60],[-.32,.34]];
function knight(){var m=new M();m.lathe(BASE.concat([[.27,.16],[.24,.2],[0,.2]]));m.extrude(HORSE,.44,0,.12,1.0);return m}

/* ---------- matrizes ---------- */
function persp(f,a,n,fa){var t=1/Math.tan(f/2),o=new Float32Array(16);o[0]=t/a;o[5]=t;o[10]=(fa+n)/(n-fa);o[11]=-1;o[14]=2*fa*n/(n-fa);return o}
function look(e,t){var f=nrm(t[0]-e[0],t[1]-e[1],t[2]-e[2]),s=nrm(-f[2],0,f[0]);// s = f x (0,1,0)
 var u=[s[1]*f[2]-s[2]*f[1],s[2]*f[0]-s[0]*f[2],s[0]*f[1]-s[1]*f[0]];
 var o=new Float32Array(16);o[0]=s[0];o[4]=s[1];o[8]=s[2];o[1]=u[0];o[5]=u[1];o[9]=u[2];o[2]=-f[0];o[6]=-f[1];o[10]=-f[2];
 o[12]=-(s[0]*e[0]+s[1]*e[1]+s[2]*e[2]);o[13]=-(u[0]*e[0]+u[1]*e[1]+u[2]*e[2]);o[14]=f[0]*e[0]+f[1]*e[1]+f[2]*e[2];o[15]=1;return{m:o,f:f,s:s,u:u}}
function mul(a,b){var o=new Float32Array(16),i,j,k,v;for(i=0;i<4;i++)for(j=0;j<4;j++){v=0;for(k=0;k<4;k++)v+=a[k*4+j]*b[i*4+k];o[i*4+j]=v}return o}

/* ---------- GL ---------- */
var VS='attribute vec3 a_p;attribute vec3 a_n;uniform mat4 u_vp;uniform vec3 u_pos;uniform vec3 u_sc;uniform float u_ry;varying vec3 v_w;varying vec3 v_n;varying vec2 v_l;'+
'void main(){vec3 p=a_p*u_sc;float c=cos(u_ry),s=sin(u_ry);vec3 r=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);vec3 n=vec3(a_n.x*c+a_n.z*s,a_n.y,-a_n.x*s+a_n.z*c);v_w=r+u_pos;v_n=n;v_l=a_p.xz*2.0;gl_Position=u_vp*vec4(v_w,1.0);}';
var FS='precision mediump float;varying vec3 v_w;varying vec3 v_n;varying vec2 v_l;uniform vec3 u_col;uniform float u_a;uniform float u_mode;uniform float u_spec;uniform float u_shin;uniform sampler2D u_tex;uniform vec3 u_eye;'+
'void main(){'+
' if(u_mode>1.5){float d=length(v_l);float a=u_a;'+
'  if(u_mode<2.5){}'+
'  else if(u_mode<3.5){if(d>1.0)discard;a*=1.0-smoothstep(0.15,1.0,d);}'+
'  else if(u_mode<4.5){if(d>1.0)discard;a*=1.0-smoothstep(0.0,1.0,d);}'+
'  else if(u_mode<5.5){if(d>1.0)discard;a*=1.0-smoothstep(0.82,1.0,d);}'+
'  else{if(d>1.0||d<0.74)discard;a*=smoothstep(0.74,0.80,d)*(1.0-smoothstep(0.94,1.0,d));}'+
'  gl_FragColor=vec4(u_col,a);return;}'+
' vec3 N=normalize(v_n);vec3 L1=normalize(vec3(-0.45,1.0,0.55));vec3 L2=normalize(vec3(0.7,0.45,-0.6));vec3 V=normalize(u_eye-v_w);'+
' float d1=max(dot(N,L1),0.0);float d2=max(dot(N,L2),0.0)*0.32;'+
' vec3 base=u_mode>0.5?texture2D(u_tex,(v_w.xz+5.0)/10.0).rgb:u_col;'+
' vec3 H=normalize(L1+V);float sp=pow(max(dot(N,H),0.0),u_shin)*u_spec;'+
' float rim=pow(1.0-max(dot(N,V),0.0),3.0)*0.10;'+
' vec3 col=base*(0.40+0.10*N.y+0.78*d1+d2)+vec3(sp)+vec3(rim);'+
' gl_FragColor=vec4(col,1.0);}';

function sh(gl,t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o}
function buf(gl,m){var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(m.v),gl.STATIC_DRAW);return{b:b,n:m.v.length/6}}

function boardTex(gl){
 var cv=document.createElement('canvas');cv.width=cv.height=1024;var x=cv.getContext('2d'),k=1024/10,r,c,i;
 x.fillStyle='#5a3920';x.fillRect(0,0,1024,1024);
 var g=x.createLinearGradient(0,0,1024,1024);g.addColorStop(0,'rgba(255,255,255,.07)');g.addColorStop(1,'rgba(0,0,0,.18)');x.fillStyle=g;x.fillRect(0,0,1024,1024);
 x.strokeStyle='#c9a46a';x.lineWidth=3;x.strokeRect(k*.78,k*.78,1024-2*k*.78,1024-2*k*.78);
 for(r=0;r<8;r++)for(c=0;c<8;c++){x.fillStyle=(r+c)%2?'#a9744a':'#efd7ab';x.fillRect((c+1)*k,(r+1)*k,k+1,k+1)}
 // veios suaves
 for(i=0;i<120;i++){x.strokeStyle='rgba(60,30,10,'+(Math.random()*.05).toFixed(3)+')';x.beginPath();var yy=Math.random()*1024;x.moveTo(k,yy);x.bezierCurveTo(300,yy+8,700,yy-8,1024-k,yy+Math.random()*6);x.stroke()}
 x.fillStyle='#e8cf9e';x.font='bold '+Math.round(k*.36)+'px sans-serif';x.textAlign='center';x.textBaseline='middle';
 for(i=0;i<8;i++){var L='abcdefgh'.charAt(i),D=String(8-i);
  x.fillText(L,(i+1.5)*k,9.5*k);x.fillText(D,.5*k,(i+1.5)*k);
  x.save();x.translate((i+1.5)*k,.5*k);x.rotate(PI);x.fillText(L,0,0);x.restore();
  x.save();x.translate(9.5*k,(i+1.5)*k);x.rotate(PI);x.fillText(D,0,0);x.restore()}
 var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);
 gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 var an=gl.getExtension('EXT_texture_filter_anisotropic');if(an)gl.texParameterf(gl.TEXTURE_2D,an.TEXTURE_MAX_ANISOTROPY_EXT,4);
 return t}

function initGL(c){
 var gl=null;try{gl=c.getContext('webgl',{antialias:true,alpha:false})||c.getContext('experimental-webgl',{antialias:true,alpha:false})}catch(e){}
 if(!gl)return false;
 try{
  var p=gl.createProgram();gl.attachShader(p,sh(gl,gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  gl.useProgram(p);R.p=p;R.U={};['u_vp','u_pos','u_sc','u_ry','u_col','u_a','u_mode','u_spec','u_shin','u_tex','u_eye'].forEach(function(n){R.U[n]=gl.getUniformLocation(p,n)});
  R.ap=gl.getAttribLocation(p,'a_p');R.an_=gl.getAttribLocation(p,'a_n');
  var q=new M();q.t([-.5,0,-.5],[.5,0,-.5],[-.5,0,.5],[0,1,0],[0,1,0],[0,1,0]);q.t([.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,1,0],[0,1,0],[0,1,0]);
  var b=new M();b.box(0,0,0,1,1,1,0);
  R.mesh={P:buf(gl,pawn()),R:buf(gl,rook()),N:buf(gl,knight()),B:buf(gl,bishop()),Q:buf(gl,queen()),K:buf(gl,king()),quad:buf(gl,q),box:buf(gl,b)};
  R.tex=boardTex(gl);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,R.tex);gl.uniform1i(R.U.u_tex,0);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  R.gl=gl;return true}catch(e){R.err=String(e&&e.message||e);return false}}

function draw(mesh,x,y,z,ry,sx,sy,sz,col,a,mode,spec,shin){
 var gl=R.gl,U=R.U,m=R.mesh[mesh];
 gl.bindBuffer(gl.ARRAY_BUFFER,m.b);gl.enableVertexAttribArray(R.ap);gl.vertexAttribPointer(R.ap,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(R.an_);gl.vertexAttribPointer(R.an_,3,gl.FLOAT,false,24,12);
 gl.uniform3f(U.u_pos,x,y,z);gl.uniform3f(U.u_sc,sx,sy,sz);gl.uniform1f(U.u_ry,ry);gl.uniform3f(U.u_col,col[0],col[1],col[2]);gl.uniform1f(U.u_a,a);gl.uniform1f(U.u_mode,mode);gl.uniform1f(U.u_spec,spec||0);gl.uniform1f(U.u_shin,shin||16);
 gl.drawArrays(gl.TRIANGLES,0,m.n)}

/* ---------- câmera ---------- */
function cam(){
 var T=R.T||[0,.25,.1],cp=Math.cos(R.pitch),e=[T[0]+R.dist*cp*Math.sin(R.yaw),T[1]+R.dist*Math.sin(R.pitch),T[2]+R.dist*cp*Math.cos(R.yaw)];
 var v=look(e,T),fov=38*PI/180,asp=R.W/Math.max(1,R.H);
 R.eye=e;R.cv=v;R.fov=fov;R.asp=asp;R.vp=mul(persp(fov,asp,.5,80),v.m)}
function toScreen(x,y,z){var v=R.vp,w=v[3]*x+v[7]*y+v[11]*z+v[15];return[(v[0]*x+v[4]*y+v[8]*z+v[12])/w,(v[1]*x+v[5]*y+v[9]*z+v[13])/w]}
function sqXZ(i){return[(i&7)-3.5,(i>>3)-3.5]}

/* ---------- quadro ---------- */
var WCOL=[.93,.89,.79],BCOL=[.17,.15,.16];
function pieces(){
 var g=st(),b=g.S.b,out=[],an=R.an,i,t=1,e=1;
 if(an){t=Math.min(1,(performance.now()-an.t0)/an.dur);e=t<.5?2*t*t:1-2*(1-t)*(1-t)}
 var skip={},m=an&&an.m;
 if(an&&t<1){skip[m.t]=1;
  var mover=an.before[m.f],cap=an.before[m.t];
  var A=sqXZ(m.f),B=sqXZ(m.t);
  out.push({p:mover,x:A[0]+(B[0]-A[0])*e,y:Math.sin(t*PI)*.75,z:A[1]+(B[1]-A[1])*e,s:1});
  if(mover&&mover.toUpperCase()==='P'&&!cap&&(m.f&7)!==(m.t&7)){var ci=(m.f>>3)*8+(m.t&7);cap=an.before[ci];var Cc=sqXZ(ci);if(cap)out.push({p:cap,x:Cc[0],y:-e*.5,z:Cc[1],s:1-e})}
  else if(cap)out.push({p:cap,x:B[0],y:-e*.5,z:B[1],s:1-e});
  if(mover&&mover.toUpperCase()==='K'&&Math.abs(m.t-m.f)===2){
   var rf=m.t>m.f?m.f+3:m.f-4,rt=m.t>m.f?m.f+1:m.f-1,RA=sqXZ(rf),RB=sqXZ(rt);skip[rt]=1;
   out.push({p:an.before[rf],x:RA[0]+(RB[0]-RA[0])*e,y:Math.sin(t*PI)*.3,z:RA[1]+(RB[1]-RA[1])*e,s:1})}}
 for(i=0;i<64;i++){if(b[i]&&!skip[i]){var P=sqXZ(i);out.push({p:b[i],x:P[0],y:i===g.sel?.16:0,z:P[1],s:1,sq:i})}}
 return out}

function frame(){
 R.raf=0;var c=R.c;if(!c||!document.body.contains(c)||!R.gl)return;
 var g=st(),rc=c.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),W=Math.max(2,Math.round(rc.width*dpr)),H=Math.max(2,Math.round(rc.height*dpr));
 if(rc.width<2)return;
 if(c.width!==W||c.height!==H){c.width=W;c.height=H}
 R.W=W;R.H=H;var gl=R.gl,U=R.U,more=false;
 var nt=performance.now(),dt=R.ft?Math.min(100,nt-R.ft):16;R.ft=nt;
 if(Math.abs(R.yawT-R.yaw)>.002){R.yaw+=(R.yawT-R.yaw)*(1-Math.exp(-dt/110));more=true}else R.yaw=R.yawT;
 if(R.an){if(performance.now()-R.an.t0>=R.an.dur)R.an=null;else more=true}
 cam();
 gl.viewport(0,0,W,H);gl.clearColor(.09,.12,.18,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.uniformMatrix4fv(U.u_vp,false,R.vp);gl.uniform3f(U.u_eye,R.eye[0],R.eye[1],R.eye[2]);
 // mesa, base e tabuleiro
 draw('box',0,-.9,0,0,60,.1,60,[.07,.08,.11],1,0,.1,8);
 draw('box',0,-.36,0,0,10.5,.7,10.5,[.23,.14,.08],1,0,.25,20);
 draw('quad',0,0,0,0,10,1,10,[1,1,1],1,1,.0,8);
 // marcações (translúcidas)
 gl.enable(gl.BLEND);gl.depthMask(false);
 var last=g.last,chk=-1,Sx=g.S,k,i;
 function sq(i,col,a,mode,sc,y){var P=sqXZ(i);draw('quad',P[0],y||.006,P[1],0,sc||1,1,sc||1,col,a,mode||2,0,8)}
 if(last){sq(last.f,[.98,.85,.2],.42);sq(last.t,[.98,.85,.2],.5)}
 if(g.sel>=0)sq(g.sel,[.25,.65,.98],.65);
 var kk=Sx.t==='w'?'K':'k';for(i=0;i<64;i++)if(Sx.b[i]===kk){chk=i;break}
 if(chk>=0&&C.test.inCheck(Sx,Sx.t))sq(chk,[1,.1,.1],.95,4,1.35);
 (g.targets||[]).forEach(function(m){var cap=Sx.b[m.t]||m.ep;if(cap)sq(m.t,[.9,.2,.2],.9,6,1.0,.008);else sq(m.t,[.1,.1,.1],.38,5,.34,.008)});
 var list=pieces();
 list.forEach(function(o){if(o.s>.3)draw('quad',o.x+.09,.01,o.z-.07,0,.95*o.s,1,.95*o.s,[0,0,0],.38,3,0,8)});
 gl.depthMask(true);gl.disable(gl.BLEND);
 list.forEach(function(o){
  var w=o.p===o.p.toUpperCase(),u=o.p.toUpperCase();
  draw(u,o.x,o.y,o.z,u==='N'?(w?PI/4:-3*PI/4):0,o.s,o.s,o.s,w?WCOL:BCOL,1,0,w?.55:.85,w?36:60)});
 R.frames++;
 if(more)kick();else R.ft=0}
function kick(){if(!R.raf&&R.gl)R.raf=requestAnimationFrame(frame)}
/* ---------- seleção por raio ---------- */
function rayAt(ev){
 var c=R.c,rc=c.getBoundingClientRect(),nx=(ev.clientX-rc.left)/rc.width*2-1,ny=1-(ev.clientY-rc.top)/rc.height*2,v=R.cv,th=Math.tan(R.fov/2);
 return{o:R.eye,d:nrm(v.f[0]+v.s[0]*nx*th*R.asp+v.u[0]*ny*th,v.f[1]+v.s[1]*nx*th*R.asp+v.u[1]*ny*th,v.f[2]+v.s[2]*nx*th*R.asp+v.u[2]*ny*th)}}
function pickSq(ev){
 if(!R.vp)return -1;var r=rayAt(ev),o=r.o,d=r.d,g=st(),best=1e9,res=-1,i;
 if(Math.abs(d[1])>1e-6){var tp=-o[1]/d[1];if(tp>0){var hx=o[0]+d[0]*tp,hz=o[2]+d[2]*tp,cx=Math.floor(hx+4),cz=Math.floor(hz+4);if(cx>=0&&cx<8&&cz>=0&&cz<8){best=tp;res=cz*8+cx}}}
 for(i=0;i<64;i++){var p=g.S.b[i];if(!p)continue;
  var P=sqXZ(i),px=o[0]-P[0],pz=o[2]-P[1],a=d[0]*d[0]+d[2]*d[2],b=2*(px*d[0]+pz*d[2]),cc=px*px+pz*pz-.3*.3,D=b*b-4*a*cc;
  if(D<0||a<1e-9)continue;var t=(-b-Math.sqrt(D))/(2*a),y=o[1]+d[1]*t;
  if(t>0&&y>=0&&y<=HT[p.toUpperCase()]*.95&&t<best){best=t;res=i}}
 return res}

/* ---------- integração com o motor ---------- */
C.draw2d=C.draw;C.click2d=C.click;
function ensure(){
 var c=$g('chessBoard');if(!c)return false;
 if(R.c===c)return !R.fail;
 R.c=c;R.fail=false;R.gl=null;
 if(!initGL(c)){R.fail=true;return false}
 var g=st();R.flip=!!g.flip;R.yaw=R.yawT=g.flip?PI:0;
 c.style.touchAction='none';c.style.cursor='grab';
 c.addEventListener('pointerdown',function(e){R.down={x:e.clientX,y:e.clientY,yaw:R.yawT,pitch:R.pitch};R.moved=false;try{c.setPointerCapture(e.pointerId)}catch(_){}});
 c.addEventListener('pointermove',function(e){if(!R.down)return;var dx=e.clientX-R.down.x,dy=e.clientY-R.down.y;
  if(!R.moved&&Math.hypot(dx,dy)>5){R.moved=true;c.style.cursor='grabbing'}
  if(R.moved){R.yawT=R.yaw=R.down.yaw-dx*.008;R.pitch=Math.max(.3,Math.min(1.5,R.down.pitch+dy*.006));kick()}});
 var up=function(){if(R.moved){R.suppress=true;setTimeout(function(){R.suppress=false},60)}R.down=null;c.style.cursor='grab'};
 c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
 c.addEventListener('wheel',function(e){e.preventDefault();R.dist=Math.max(7,Math.min(22,R.dist*Math.exp(e.deltaY*.001)));kick()},{passive:false});
 c.addEventListener('webglcontextlost',function(e){e.preventDefault()});
 return true}
C.draw=function(){
 if(!ensure()){return C.draw2d()}
 var g=st(),n=g.hist.length,now=performance.now();
 if(R.flip!==!!g.flip){R.flip=!!g.flip;R.yawT+=PI}
 if(R.len>=0&&n===R.len+1){var h=g.hist[n-1];if(h&&h.before)R.an={m:h.m,before:h.before.b,t0:now,dur:Math.max(70,Math.min(420,(now-R.lastT)*.85))}}
 else if(n!==R.len)R.an=null;
 if(n!==R.len)R.lastT=now;
 R.len=n;kick()};
C.click=function(ev){
 if(R.fail)return C.click2d(ev);
 if(R.suppress||R.moved)return;
 var i=pickSq(ev);if(i>=0)C.pick(i)};
C.gl3d={ok:function(){return !!R.gl&&!R.fail},error:function(){return R.err||''},frames:function(){return R.frames},
 // posição (coordenadas da janela) do centro de uma casa; útil para testes
 screen:function(i,h){var P=sqXZ(i),s=toScreen(P[0],h||0,P[1]),rc=R.c.getBoundingClientRect();return{x:rc.left+(s[0]+1)/2*rc.width,y:rc.top+(1-s[1])/2*rc.height}},
 camera:function(){return{yaw:R.yaw,yawT:R.yawT,pitch:R.pitch,dist:R.dist}},
 setCamera:function(y,p,d,t){R.yaw=R.yawT=y;R.pitch=p;R.dist=d;R.T=t||null;kick()},
 animating:function(){return !!R.an}};
})()}
