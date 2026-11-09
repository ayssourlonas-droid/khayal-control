// FlowForge WebStudio v0.14.0 - Game Runtime
// Este arquivo NÃO executa o motor no editor. Ele apenas guarda o código em
// window.FlowForgeGameRuntime; app.js copia a string para o HTML exportado/
// Preview somente quando o projeto usa componentes de jogo.
// O motor lê window.__FLOWFORGE_RUNTIME_CONFIG__ (id, nome, página, propriedades
// e nomes das funções de evento) e liga cada componente ao seu handler.
(function(){
 'use strict';

 function engine(){
  if(window.FlowForgeGame)return;
  var CFG=window.__FLOWFORGE_RUNTIME_CONFIG__||{};
  var LIST=Array.isArray(CFG.items)?CFG.items:[];
  var KINDS={gamecanvas:1,sprite:1,spritesheet:1,collisionarea:1,keyboardinput:1,gamepadinput:1,gametimer:1,scorelabel:1,healthbar:1,joystick:1};
  var records=[],byId={},byName={},activePage='',raf=0,lastFrame=0,lastCollision=0;
  var pressed=new Set();
  var hasRaf=typeof requestAnimationFrame==='function';

  function num(v,fb){v=Number(v);return isFinite(v)?v:fb}
  function clamp(v,a,b){v=Number(v);return isFinite(v)?Math.max(a,Math.min(b,v)):a}
  function safe(fn){try{return fn()}catch(e){console.error('[FlowForgeGame]',e)}}

  function findEl(id){
   var els=document.querySelectorAll('.ff-component[data-flow-id]');
   for(var i=0;i<els.length;i++)if(els[i].dataset.flowId===String(id))return els[i];
   return null;
  }
  function pageOf(rec){
   if(!rec.pageId)return null;
   var pages=document.querySelectorAll('.ff-page');
   for(var i=0;i<pages.length;i++)if(String(pages[i].dataset.pageId||pages[i].id)===rec.pageId)return pages[i];
   return null;
  }
  function pageActive(rec){
   var p=pageOf(rec);
   return !p||(!p.hidden&&!p.classList.contains('hidden'));
  }
  function activePageId(){
   var pages=document.querySelectorAll('.ff-page');
   for(var i=0;i<pages.length;i++)if(!pages[i].hidden&&!pages[i].classList.contains('hidden'))return String(pages[i].dataset.pageId||pages[i].id);
   return '';
  }
  function resolve(ref){
   if(!ref)return null;
   if(ref.__rec)return ref.__rec;
   if(ref.nodeType===1)ref=ref.closest?ref.closest('.ff-component'):ref;
   if(ref&&ref.nodeType===1)return byId[String(ref.dataset.flowId||ref.dataset.id||'')]||null;
   var s=String(ref);
   return byId[s]||byName[s]||null;
  }

  // Dispara o evento e chama o handler configurado. O atributo inline
  // equivalente é removido durante o disparo para nunca executar duas vezes.
  function invoke(rec,ev,detail){
   var fn=rec.handlers&&rec.handlers[ev],el=rec.el,saved=null,had=false;
   if(el&&el.getAttribute){
    saved=el.getAttribute('on'+ev);
    if(saved!==null){had=true;el.removeAttribute('on'+ev)}
   }
   var ce;
   try{ce=new CustomEvent(ev,{bubbles:true,cancelable:true,detail:detail||{}})}
   catch(_){ce=document.createEvent('CustomEvent');ce.initCustomEvent(ev,true,true,detail||{})}
   safe(function(){if(el)el.dispatchEvent(ce);else window.dispatchEvent(ce)});
   if(typeof fn==='string'&&typeof window[fn]==='function'){
    try{
     var out=window[fn].call(el||window,ce);
     if(out&&typeof out.catch==='function')out.catch(function(err){console.error('[FlowForge '+ev+']',err)});
    }catch(err){console.error('[FlowForge '+ev+']',err)}
   }
   if(had&&el)el.setAttribute('on'+ev,saved);
   return ce;
  }

  function ensureLoop(){
   if(raf||!records.length||document.hidden||!hasRaf)return;
   lastFrame=0;
   raf=requestAnimationFrame(frame);
  }
  function needsFrame(){
   for(var i=0;i<records.length;i++){
    var r=records[i];
    if(!r.active)continue;
    if(r.kind==='gamecanvas'&&r.running)return true;
    if(r.kind==='spritesheet'&&r.sheet&&r.sheet.playing)return true;
    if(r.kind==='gamepadinput')return true;
    if(r.kind==='sprite'&&r.spr&&(r.spr.vx||r.spr.vy))return true;
   }
   return false;
  }
  function frame(now){
   raf=0;
   var dt=lastFrame?Math.min(.05,Math.max(0,(now-lastFrame)/1000)):0;
   lastFrame=now;
   safe(function(){
    for(var i=0;i<records.length;i++){
     var r=records[i];
     if(!r.active)continue;
     if(r.kind==='gamecanvas')tickCanvas(r,dt,now);
     else if(r.kind==='sprite')tickSprite(r,dt);
     else if(r.kind==='spritesheet')tickSheet(r,dt);
    }
    pollGamepads();
    checkCollisions(now);
   });
   if(needsFrame())raf=requestAnimationFrame(frame);
   else lastFrame=0;
  }

  /* ---------------------------------- Canvas ---------------------------------- */
  function canvasSize(rec,w,h){
   if(!rec.canvas)return;
   w=clamp(w,16,8192);h=clamp(h,16,8192);
   rec.canvas.width=w;rec.canvas.height=h;
   paintCanvasBg(rec);
  }
  function paintCanvasBg(rec){
   if(!rec.ctx)return;
   var bg=String(rec.props.bg||'transparent');
   rec.ctx.clearRect(0,0,rec.canvas.width,rec.canvas.height);
   if(bg&&bg!=='transparent'){
    rec.ctx.save();rec.ctx.fillStyle=bg;rec.ctx.fillRect(0,0,rec.canvas.width,rec.canvas.height);rec.ctx.restore();
   }
  }
  function startCanvas(rec){
   if(rec.running)return;
   rec.running=true;rec.time=0;rec.acc=0;
   paintCanvasBg(rec);
   rec.started=true;
   invoke(rec,'gameStart',{ctx:rec.ctx,canvas:rec.canvas,width:rec.canvas.width,height:rec.canvas.height,time:0});
   ensureLoop();
  }
  function stopCanvas(rec,reason){
   if(!rec.running)return;
   rec.running=false;
   invoke(rec,'gameOver',{ctx:rec.ctx,canvas:rec.canvas,width:rec.canvas.width,height:rec.canvas.height,time:rec.time||0,reason:reason||'stop'});
  }
  function tickCanvas(rec,dt){
   if(!rec.running||!rec.ctx)return;
   var fps=clamp(num(rec.props.fps,60),1,240),step=1/fps;
   rec.acc=(rec.acc||0)+dt;
   if(rec.acc<step)return;
   var delta=Math.min(rec.acc,.25);rec.acc=0;rec.time=(rec.time||0)+delta;
   invoke(rec,'gameUpdate',{ctx:rec.ctx,canvas:rec.canvas,width:rec.canvas.width,height:rec.canvas.height,dt:delta,time:rec.time,fps:fps});
  }
  function setupCanvas(rec){
   rec.canvas=rec.el.querySelector('canvas[data-ff-gamecanvas]');
   if(!rec.canvas)return;
   rec.ctx=rec.canvas.getContext('2d');
   rec.running=false;rec.time=0;rec.acc=0;
   var api=rec.api;
   Object.defineProperties(api,{
    ctx:{get:function(){return rec.ctx}},
    canvas:{get:function(){return rec.canvas}},
    width:{get:function(){return rec.canvas.width},set:function(v){canvasSize(rec,v,rec.canvas.height)}},
    height:{get:function(){return rec.canvas.height},set:function(v){canvasSize(rec,rec.canvas.width,v)}},
    running:{get:function(){return !!rec.running}},
    time:{get:function(){return rec.time||0}},
    fps:{get:function(){return clamp(num(rec.props.fps,60),1,240)}}
   });
   api.start=function(){startCanvas(rec);return api};
   api.pause=function(){rec.running=false;return api};
   api.resume=function(){if(!rec.running){rec.running=true;ensureLoop()}return api};
   api.stop=function(){stopCanvas(rec,'stop');return api};
   api.over=function(){stopCanvas(rec,'over');return api};
   api.restart=function(){rec.running=false;startCanvas(rec);return api};
   api.clear=function(){paintCanvasBg(rec);return api};
   api.getContext=function(){return rec.ctx};
   api.fill=function(color){if(rec.ctx){rec.ctx.save();rec.ctx.fillStyle=color||'#000';rec.ctx.fillRect(0,0,rec.canvas.width,rec.canvas.height);rec.ctx.restore()}return api};
   if(rec.props.blur===undefined)rec.canvas.style.imageRendering='pixelated';
  }

  /* ---------------------------------- Sprite ---------------------------------- */
  function spriteRect(rec){
   if(!rec.el)return null;
   var r=rec.el.getBoundingClientRect();
   return {x:r.left,y:r.top,width:r.width,height:r.height};
  }
  function rectsHit(a,b){
   return !!a&&!!b&&a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
  }
  function syncSprite(rec){
   var s=rec.spr;
   rec.el.style.left=s.x+'px';rec.el.style.top=s.y+'px';
   if(rec.inner){
    rec.inner.style.transform='rotate('+(s.rot||0)+'deg)';
    rec.inner.style.transformOrigin='50% 50%';
   }
  }
  function moveSprite(rec,x,y,emit){
   var s=rec.spr,dx=x-s.x,dy=y-s.y;
   s.x=x;s.y=y;syncSprite(rec);
   if(emit&&(dx||dy))invoke(rec,'move',{x:s.x,y:s.y,dx:dx,dy:dy,vx:s.vx,vy:s.vy,self:rec.api});
   ensureLoop();
  }
  function tickSprite(rec,dt){
   var s=rec.spr;
   if(!s)return;
   if(s.vx||s.vy){
    var nx=s.x+s.vx*dt,ny=s.y+s.vy*dt;
    s.x=nx;s.y=ny;syncSprite(rec);
    invoke(rec,'move',{x:nx,y:ny,dx:s.vx*dt,dy:s.vy*dt,vx:s.vx,vy:s.vy,self:rec.api});
   }
  }
  function setupSprite(rec){
   var p=rec.props;
   rec.inner=rec.el.querySelector('[data-ff-sprite]')||rec.el;
   rec.spr={
    x:num(p.x,parseFloat(rec.el.style.left)||0),
    y:num(p.y,parseFloat(rec.el.style.top)||0),
    rot:num(p.rotation,0),
    vx:num(p.vx,0),vy:num(p.vy,0),
    tag:String(p.tag||'sprite'),
    collidable:p.collidable!==false
   };
   rec.over={};
   var api=rec.api,s=rec.spr;
   Object.defineProperties(api,{
    x:{get:function(){return s.x},set:function(v){moveSprite(rec,num(v,s.x),s.y,true)}},
    y:{get:function(){return s.y},set:function(v){moveSprite(rec,s.x,num(v,s.y),true)}},
    position:{get:function(){return {x:s.x,y:s.y}}},
    rotation:{get:function(){return s.rot},set:function(v){s.rot=num(v,0);syncSprite(rec)}},
    vx:{get:function(){return s.vx},set:function(v){s.vx=num(v,0);ensureLoop()}},
    vy:{get:function(){return s.vy},set:function(v){s.vy=num(v,0);ensureLoop()}},
    velocity:{get:function(){return {x:s.vx,y:s.vy}},set:function(v){s.vx=num(v&&v.x,0);s.vy=num(v&&v.y,0);ensureLoop()}},
    tag:{get:function(){return s.tag},set:function(v){s.tag=String(v||'')}},
    collidable:{get:function(){return !!s.collidable},set:function(v){s.collidable=!!v}},
    width:{get:function(){return rec.el.offsetWidth}},
    height:{get:function(){return rec.el.offsetHeight}},
    rect:{get:function(){return spriteRect(rec)}}
   });
   api.setPosition=api.moveTo=function(x,y){moveSprite(rec,num(x,s.x),num(y,s.y),true);return api};
   api.move=api.moveBy=function(dx,dy){moveSprite(rec,s.x+num(dx,0),s.y+num(dy,0),true);return api};
   api.rotate=function(deg){s.rot+=num(deg,0);syncSprite(rec);return api};
   api.collidesWith=function(other){var o=resolve(other);return o?rectsHit(spriteRect(rec),spriteRect(o)):false};
   syncSprite(rec);
  }

  /* --------------------------------- Collisões -------------------------------- */
  function collisionTargets(){
   var out=[];
   for(var i=0;i<records.length;i++){
    var r=records[i];
    if(!r.active||!r.el)continue;
    if(r.kind==='collisionarea')out.push(r);
    else if(r.kind==='sprite'&&r.spr&&r.spr.collidable)out.push(r);
   }
   return out;
  }
  function checkCollisions(now){
   if(now-lastCollision<40)return;
   lastCollision=now;
   var list=collisionTargets();
   for(var i=0;i<list.length;i++){
    var a=list[i];
    for(var j=i+1;j<list.length;j++){
     var b=list[j];
     if(a.kind==='sprite'&&b.kind==='sprite'&&!a.spr.collidable&&!b.spr.collidable)continue;
     var hit=rectsHit(spriteRect(a),spriteRect(b));
     var keyAb=b.id,keyBa=a.id;
     a.over=a.over||{};b.over=b.over||{};
     var detailAB={self:a.api,other:b.api,otherName:b.name,otherKind:b.kind,otherTag:b.spr?b.spr.tag:String(b.props.tag||''),rect:spriteRect(a)};
     var detailBA={self:b.api,other:a.api,otherName:a.name,otherKind:a.kind,otherTag:a.spr?a.spr.tag:String(a.props.tag||''),rect:spriteRect(b)};
     if(hit){
      if(!a.over[keyAb]){a.over[keyAb]=1;invoke(a,'enter',detailAB);invoke(a,'collision',detailAB)}
      if(!b.over[keyBa]){b.over[keyBa]=1;invoke(b,'enter',detailBA)}
      invoke(b,'collision',detailBA);
     }else{
      if(a.over[keyAb]){delete a.over[keyAb];invoke(a,'leave',detailAB)}
      if(b.over[keyBa]){delete b.over[keyBa];invoke(b,'leave',detailBA)}
     }
    }
   }
  }
  function setupCollision(rec){
   rec.over={};
   var api=rec.api;
   Object.defineProperties(api,{
    tag:{get:function(){return String(rec.props.tag||'')},set:function(v){rec.props.tag=String(v||'')}},
    rect:{get:function(){return spriteRect(rec)}}
   });
   api.contains=function(x,y){var r=spriteRect(rec);return !!r&&x>=r.x&&x<=r.x+r.width&&y>=r.y&&y<=r.y+r.height};
   if(rec.el)rec.el.style.pointerEvents='none';
  }

  /* -------------------------------- Sprite sheet ------------------------------- */
  function sheetFrameCount(rec){
   var s=rec.sheet,fw=Math.max(1,num(rec.props.frameWidth,32)),fh=Math.max(1,num(rec.props.frameHeight,32));
   if(s.total>0)return s.total;
   if(s.img&&s.img.naturalWidth)return Math.max(1,Math.floor(s.img.naturalWidth/fw)*Math.floor(s.img.naturalHeight/fh));
   return Math.max(1,num(rec.props.frames,1));
  }
  function drawSheet(rec){
   var s=rec.sheet,cv=rec.canvas;if(!s||!cv)return;
   var ctx=cv.getContext('2d');if(!ctx)return;
   var fw=Math.max(1,num(rec.props.frameWidth,32)),fh=Math.max(1,num(rec.props.frameHeight,32));
   if(cv.width!==fw)cv.width=fw;
   if(cv.height!==fh)cv.height=fh;
   ctx.clearRect(0,0,fw,fh);
   if(s.img&&s.img.naturalWidth){
    var cols=Math.max(1,Math.floor(s.img.naturalWidth/fw));
    var frame=((s.frame%sheetFrameCount(rec))+sheetFrameCount(rec))%sheetFrameCount(rec);
    var sx=(frame%cols)*fw,sy=Math.floor(frame/cols)*fh;
    try{ctx.drawImage(s.img,sx,sy,fw,fh,0,0,fw,fh)}catch(_){}
   }else{
    ctx.fillStyle='rgba(148,163,184,.14)';ctx.fillRect(0,0,fw,fh);
    ctx.strokeStyle='rgba(148,163,184,.5)';ctx.strokeRect(.5,.5,fw-1,fh-1);
    ctx.fillStyle='#94a3b8';ctx.font='bold '+Math.max(9,Math.floor(fh/4))+'px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('▦ '+(s.frame+1),fw/2,fh/2);
   }
  }
  function setSheetFrame(rec,n,emit){
   var s=rec.sheet,total=sheetFrameCount(rec),loop=rec.props.loop!==false;
   n=Math.floor(num(n,0));
   n=loop?((n%total)+total)%total:clamp(n,0,total-1);
   if(s.frame===n&&emit)return;
   s.frame=n;
   drawSheet(rec);
   if(emit)invoke(rec,'frame',{frame:n,index:n,total:total,self:rec.api});
  }
  function playSheet(rec){
   var s=rec.sheet,api=rec.api;
   if(!s||s.playing)return api;
   s.playing=true;s.elapsed=0;
   if(!rec.props.loop&&s.frame>=sheetFrameCount(rec)-1)s.frame=0;
   invoke(rec,'animationStart',{frame:s.frame,total:sheetFrameCount(rec),self:api});
   ensureLoop();
   return api;
  }
  function stopSheet(rec,end){
   var s=rec.sheet;
   if(!s||!s.playing)return;
   s.playing=false;
   if(end)invoke(rec,'animationEnd',{frame:s.frame,total:sheetFrameCount(rec),self:rec.api});
  }
  function tickSheet(rec,dt){
   var s=rec.sheet;if(!s||!s.playing)return;
   var fps=clamp(num(rec.props.fps,8),1,120),total=sheetFrameCount(rec);
   s.elapsed+=dt;
   var step=1/fps;
   if(s.elapsed<step)return;
   var advance=Math.floor(s.elapsed/step);
   s.elapsed-=advance*step;
   var next=s.frame+advance;
   if(rec.props.loop===false&&next>=total){
    setSheetFrame(rec,total-1,true);
    s.playing=false;
    invoke(rec,'animationEnd',{frame:s.frame,total:total,self:rec.api});
    return;
   }
   setSheetFrame(rec,next,true);
  }
  function setupSheet(rec){
   rec.canvas=rec.el.querySelector('canvas[data-ff-spritesheet]');
   if(!rec.canvas)return;
   rec.sheet={frame:Math.max(0,num(rec.props.frame,0)),playing:false,elapsed:0,total:Math.max(0,num(rec.props.frames,0)),img:null};
   var api=rec.api,s=rec.sheet;
   Object.defineProperties(api,{
    frame:{get:function(){return s.frame},set:function(v){setSheetFrame(rec,v,true)}},
    currentFrame:{get:function(){return s.frame}},
    totalFrames:{get:function(){return sheetFrameCount(rec)}},
    playing:{get:function(){return !!s.playing}},
    fps:{get:function(){return clamp(num(rec.props.fps,8),1,120)},set:function(v){rec.props.fps=clamp(num(v,8),1,120)}}
   });
   api.play=function(){playSheet(rec);return api};
   api.stop=function(){stopSheet(rec,false);return api};
   api.gotoFrame=api.setFrame=function(n){setSheetFrame(rec,n,true);return api};
   api.load=function(src){loadSheetImage(rec,src,true);return api};
   drawSheet(rec);
   loadSheetImage(rec,String((rec.canvas&&rec.canvas.dataset.ffSrc)||rec.props.src||''),false);
   if(rec.props.autoplay!==false)rec.autoplaySheet=true;
  }
  function loadSheetImage(rec,src,redraw){
   if(!src)return;
   var s=rec.sheet;
   var img=new Image();
   img.onload=function(){
    s.img=img;
    s.total=Math.max(0,num(rec.props.frames,0));
    if(redraw)drawSheet(rec);
    if(rec.active&&rec.props.autoplay!==false&&!s.playing)playSheet(rec);
   };
   img.onerror=function(){console.warn('[FlowForgeGame] Sprite Sheet: imagem não carregada:',src)};
   img.src=src;
  }

  /* --------------------------------- Keyboard --------------------------------- */
  function keyDetail(e){
   return {key:e.key,code:e.code,keyCode:e.keyCode||0,repeat:!!e.repeat,event:e,altKey:e.altKey,ctrlKey:e.ctrlKey,shiftKey:e.shiftKey,metaKey:e.metaKey};
  }
  function keyboardTargets(){
   var out=[];
   for(var i=0;i<records.length;i++){var r=records[i];if(r.kind==='keyboardinput'&&r.active&&r.props.enabled!==false)out.push(r)}
   return out;
  }
  function onKey(e,isDown){
   if(!e||typeof e.key!=='string')return;
   var k=String(e.key||''),norm=k.length===1?k.toLowerCase():k;
   if(isDown)pressed.add(norm);else pressed.delete(norm);
   var targets=keyboardTargets();
   if(!targets.length)return;
   for(var i=0;i<targets.length;i++){
    var rec=targets[i];
    if(rec.props.preventDefault&&e.cancelable){e.preventDefault()}
    invoke(rec,isDown?'keydown':'keyup',keyDetail(e));
   }
  }
  function setupKeyboard(rec){
   var api=rec.api;
   api.keys=function(){return Array.from(pressed)};
   api.isDown=function(key){
    var k=String(key);
    return pressed.has(k)||(k.length===1&&pressed.has(k.toLowerCase()));
   };
   Object.defineProperty(api,'preventDefault',{get:function(){return !!rec.props.preventDefault},set:function(v){rec.props.preventDefault=!!v}});
  }

  /* ---------------------------------- Gamepad --------------------------------- */
  function gamepads(){try{return navigator.getGamepads?navigator.getGamepads():[]}catch(_){return []}}
  function gamepadAt(index){var p=gamepads();for(var i=0;i<p.length;i++)if(p[i]&&p[i].index===index)return p[i];return p[index]||null}
  function pollGamepads(){
   var pads=gamepads();
   for(var i=0;i<records.length;i++){
    var rec=records[i];
    if(rec.kind!=='gamepadinput'||!rec.active||rec.props.enabled===false)continue;
    var index=clamp(num(rec.props.index,0),0,15),pad=pads[index]||null;
    var g=rec.padState;
    if(!pad){
     if(g.connected){g.connected=false;invoke(rec,'disconnected',{index:index,gamepad:g.id||'',self:rec.api})}
     continue;
    }
    if(!g.connected){
     g.connected=true;g.id=pad.id;g.buttons=[];g.axes=[];
     invoke(rec,'connected',{index:index,id:pad.id,gamepad:pad,self:rec.api});
    }
    var dead=clamp(num(rec.props.deadZone,.15),0,.9);
    for(var b=0;b<pad.buttons.length;b++){
     var val=Number(pad.buttons[b].value)||0,on=pad.buttons[b].pressed||val>.5;
     if(g.buttons[b]!==on){
      g.buttons[b]=on;
      invoke(rec,on?'buttondown':'buttonup',{index:index,button:b,pressed:on,value:val,gamepad:pad.id,self:rec.api});
     }
    }
    for(var a=0;a<pad.axes.length;a++){
     var v=Number(pad.axes[a])||0,prev=Number(g.axes[a]||0);
     if(Math.abs(v-prev)>(dead||.12)){
      g.axes[a]=v;
      invoke(rec,'axis',{index:index,axis:a,value:v,gamepad:pad.id,self:rec.api});
     }
    }
    g.pad=pad;
   }
  }
  function setupGamepad(rec){
   rec.padState={connected:false,buttons:[],axes:[],pad:null,id:''};
   var api=rec.api;
   Object.defineProperties(api,{
    connected:{get:function(){return !!rec.padState.connected}},
    gamepad:{get:function(){return gamepadAt(clamp(num(rec.props.index,0),0,15))}},
    buttons:{get:function(){var p=api.gamepad;return p?Array.from(p.buttons).map(function(b){return {pressed:!!b.pressed,value:Number(b.value)||0}}):[]}},
    axes:{get:function(){var p=api.gamepad;return p?Array.from(p.axes):[]}}
   });
   api.isDown=function(button){var p=api.gamepad,b=p&&p.buttons[Number(button)||0];return !!(b&&(b.pressed||b.value>.5))};
   api.value=function(button){var p=api.gamepad,b=p&&p.buttons[Number(button)||0];return b?Number(b.value)||0:0};
  }

  /* -------------------------------- Game Timer -------------------------------- */
  function startGameTimer(rec){
   stopGameTimer(rec);
   if(!rec.active||rec.props.enabled===false)return;
   var ms=clamp(num(rec.props.interval,16),10,3600000);
   rec.timerCount=0;
   rec.timerRunning=true;
   function fire(){
    if(!rec.active||rec.props.enabled===false)return;
    rec.timerCount++;
    invoke(rec,'tick',{count:rec.timerCount,interval:ms,time:Date.now(),self:rec.api});
    if(rec.props.oneShot){rec.timerRunning=false;rec.timerHandle=null}
   }
   rec.timerHandle=rec.props.oneShot?setTimeout(fire,ms):setInterval(fire,ms);
  }
  function stopGameTimer(rec){
   if(rec.timerHandle){if(rec.props.oneShot)clearTimeout(rec.timerHandle);else clearInterval(rec.timerHandle)}
   rec.timerHandle=null;rec.timerRunning=false;
  }
  function setupGameTimer(rec){
   var api=rec.api;
   Object.defineProperties(api,{
    running:{get:function(){return !!rec.timerRunning}},
    count:{get:function(){return rec.timerCount||0}},
    interval:{get:function(){return clamp(num(rec.props.interval,16),10,3600000)},set:function(v){rec.props.interval=clamp(num(v,16),10,3600000);startGameTimer(rec)}}
   });
   api.start=function(){startGameTimer(rec);return api};
   api.stop=function(){stopGameTimer(rec);return api};
   api.restart=function(){startGameTimer(rec);return api};
  }

  /* ---------------------------------- Score ----------------------------------- */
  function setupScore(rec){
   rec.score={value:num(rec.props.value,0),prefix:String(rec.props.prefix==null?'Score: ':rec.props.prefix),initial:num(rec.props.value,0)};
   var api=rec.api,s=rec.score;
   function renderScore(){
    var v=rec.el.querySelector('[data-ff-score-value]');
    if(v)v.textContent=String(s.value);
    var p=rec.el.querySelector('.ff-score-prefix');
    if(p)p.textContent=s.prefix;
   }
   function setScore(n,silent){
    var old=s.value;s.value=num(n,0);renderScore();
    if(!silent&&old!==s.value)invoke(rec,'change',{value:s.value,oldValue:old,delta:s.value-old,self:api});
    return s.value;
   }
   Object.defineProperties(api,{
    value:{get:function(){return s.value},set:function(v){setScore(v,false)}},
    prefix:{get:function(){return s.prefix},set:function(v){s.prefix=String(v==null?'':v);renderScore()}}
   });
   api.set=function(v){return setScore(v,false)};
   api.add=api.increment=function(n){return setScore(s.value+num(n,1),false)};
   api.reset=function(){return setScore(s.initial,false)};
   renderScore();
  }

  /* ---------------------------------- Health ---------------------------------- */
  function setupHealth(rec){
   rec.health={value:num(rec.props.value,100),max:Math.max(1,num(rec.props.max,100)),initial:num(rec.props.value,100)};
   var api=rec.api,h=rec.health;
   function renderHealth(){
    var v=clamp(h.value,0,h.max),pct=h.max>0?Math.round(v/h.max*100):0;
    rec.el.setAttribute('data-value',String(v));rec.el.setAttribute('data-max',String(h.max));
    var box=rec.el.querySelector('[data-ff-health]');
    if(box){
     box.setAttribute('data-value',String(v));box.setAttribute('data-max',String(h.max));
     box.setAttribute('aria-valuemax',String(h.max));box.setAttribute('aria-valuenow',String(v));
     var bar=box.querySelector('i');if(bar)bar.style.width=pct+'%';
     var txt=box.querySelector('span');if(txt)txt.textContent=pct+'%';
    }
   }
   function setHealth(n,silent){
    var old=h.value;h.value=clamp(n,0,h.max);renderHealth();
    if(!silent&&old!==h.value){
     invoke(rec,'change',{value:h.value,max:h.max,oldValue:old,delta:h.value-old,self:api});
     if(h.value<=0&&old>0)invoke(rec,'empty',{value:0,max:h.max,self:api});
    }
    return h.value;
   }
   Object.defineProperties(api,{
    value:{get:function(){return h.value},set:function(v){setHealth(v,false)}},
    max:{get:function(){return h.max},set:function(v){h.max=Math.max(1,num(v,100));h.value=clamp(h.value,0,h.max);renderHealth()}}
   });
   api.set=function(v){return setHealth(v,false)};
   api.damage=api.hit=function(n){return setHealth(h.value-Math.abs(num(n,10)),false)};
   api.heal=function(n){return setHealth(h.value+Math.abs(num(n,10)),false)};
   api.reset=function(){return setHealth(h.max,false)};
   renderHealth();
  }

  /* --------------------------------- Joystick --------------------------------- */
  function setupJoystick(rec){
   rec.joy={x:0,y:0,distance:0,angle:0,pointer:null};
   rec.joyEl=rec.el.querySelector('[data-ff-joystick]')||rec.el;
   rec.knob=rec.el.querySelector('[data-ff-joystick-knob]');
   if(rec.joyEl)rec.joyEl.style.touchAction='none';
   var api=rec.api,j=rec.joy,dead=clamp(num(rec.props.deadZone,.15),0,.9);
   function vectorFrom(e){
    var r=rec.joyEl.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    var dx=e.clientX-cx,dy=e.clientY-cy,radius=Math.max(8,r.width/2),dist=Math.sqrt(dx*dx+dy*dy);
    var nx=dx/radius,ny=dy/radius,len=Math.sqrt(nx*nx+ny*ny);
    if(len>1){nx/=len;ny/=len;len=1}
    if(len<dead){nx=0;ny=0;len=0}
    return {x:nx,y:ny,distance:len,angle:Math.atan2(ny,nx)};
   }
   function setJoy(v){
    j.x=v.x;j.y=v.y;j.distance=v.distance;j.angle=v.angle;
    if(rec.knob){
     var box=rec.joyEl.getBoundingClientRect(),range=Math.max(0,box.width/2-(rec.knob.offsetWidth||box.width*.21));
     rec.knob.style.transform='translate('+(v.x*range)+'px,'+(v.y*range)+'px)';
    }
   }
   if(rec.joyEl){
    rec.joyEl.addEventListener('pointerdown',function(e){
     if(!rec.active||rec.joy.pointer!==null)return;
     e.preventDefault();
     rec.joy.pointer=e.pointerId;
     try{rec.joyEl.setPointerCapture(e.pointerId)}catch(_){}
     var v=vectorFrom(e);setJoy(v);
     invoke(rec,'start',{x:v.x,y:v.y,angle:v.angle,distance:v.distance,self:api});
    });
    rec.joyEl.addEventListener('pointermove',function(e){
     if(rec.joy.pointer!==e.pointerId)return;
     e.preventDefault();
     var v=vectorFrom(e);setJoy(v);
     invoke(rec,'move',{x:v.x,y:v.y,angle:v.angle,distance:v.distance,self:api});
    });
    function end(e){
     if(rec.joy.pointer!==e.pointerId)return;
     var last={x:j.x,y:j.y,angle:j.angle,distance:j.distance};
     rec.joy.pointer=null;
     setJoy({x:0,y:0,distance:0,angle:0});
     invoke(rec,'end',{x:last.x,y:last.y,angle:last.angle,distance:last.distance,self:api});
    }
    rec.joyEl.addEventListener('pointerup',end);
    rec.joyEl.addEventListener('pointercancel',end);
   }
   Object.defineProperties(api,{
    x:{get:function(){return j.x}},
    y:{get:function(){return j.y}},
    distance:{get:function(){return j.distance}},
    angle:{get:function(){return j.angle}},
    vector:{get:function(){return {x:j.x,y:j.y,angle:j.angle,distance:j.distance}}},
    active:{get:function(){return j.pointer!==null}}
   });
   api.reset=function(){setJoy({x:0,y:0,distance:0,angle:0});return api};
  }

  /* --------------------------------- Ativação --------------------------------- */
  function activate(rec,on){
   if(rec.active===on)return;
   rec.active=on;
   if(rec.kind==='gamecanvas'){
    if(on&&rec.canvas&&rec.props.autoplay!==false)startCanvas(rec);
    else if(!on&&rec.running)stopCanvas(rec,'page');
   }else if(rec.kind==='spritesheet'){
    if(on&&rec.autoplaySheet)playSheet(rec);else if(!on&&rec.sheet)stopSheet(rec,false);
   }else if(rec.kind==='gametimer'){
    if(on)startGameTimer(rec);else stopGameTimer(rec);
   }else if(rec.kind==='gamepadinput'&&!on&&rec.padState&&rec.padState.connected){
    rec.padState.connected=false;
    invoke(rec,'disconnected',{index:num(rec.props.index,0),gamepad:rec.padState.id||'',self:rec.api});
   }else if(rec.kind==='joystick'&&!on){
    rec.joy.pointer=null;rec.api.reset();
   }
   if(on)ensureLoop();
  }
  function refreshActive(){
   activePage=activePageId();
   for(var i=0;i<records.length;i++)activate(records[i],pageActive(records[i]));
   ensureLoop();
  }

  /* --------------------------------- Interface -------------------------------- */
  function setup(rec){
   var p=rec.props;
   p.x=num(p.x,parseFloat(rec.el.style.left)||0);
   p.y=num(p.y,parseFloat(rec.el.style.top)||0);
   switch(rec.kind){
    case'gamecanvas':setupCanvas(rec);break;
    case'sprite':setupSprite(rec);break;
    case'spritesheet':setupSheet(rec);break;
    case'collisionarea':setupCollision(rec);break;
    case'keyboardinput':setupKeyboard(rec);break;
    case'gamepadinput':setupGamepad(rec);break;
    case'gametimer':setupGameTimer(rec);break;
    case'scorelabel':setupScore(rec);break;
    case'healthbar':setupHealth(rec);break;
    case'joystick':setupJoystick(rec);break;
   }
   rec.api.name=rec.name;rec.api.kind=rec.kind;
  }

  LIST.forEach(function(it){
   if(!it||!KINDS[it.kind])return;
   var el=findEl(it.id);if(!el)return;
   var rec={id:String(it.id),name:String(it.name||it.kind),kind:it.kind,pageId:String(it.pageId||''),props:it.p||{},handlers:it.h||{},el:el,active:false};
   rec.api={id:rec.id,name:rec.name,kind:rec.kind,pageId:rec.pageId,el:el,__rec:rec};
   records.push(rec);byId[rec.id]=rec;byName[rec.name]=rec;
   safe(function(){setup(rec)});
  });

  var Game={
   get:function(ref){var r=resolve(ref);return r?r.api:null},
   byId:function(id){var r=byId[String(id)];return r?r.api:null},
   byName:function(name){var r=byName[String(name)];return r?r.api:null},
   forElement:function(el){
    if(!el)return null;
    var w=el.classList&&el.classList.contains('ff-component')?el:(el.closest&&el.closest('.ff-component'));
    if(!w)return null;
    var r=byId[String(w.dataset.flowId||w.dataset.id||'')];
    return r?r.api:null;
   },
   emit:function(ref,ev,detail){var r=resolve(ref);if(!r)return false;invoke(r,String(ev),detail||{});return true},
   startAll:function(){records.forEach(function(r){if(r.kind==='gamecanvas'&&r.active)startCanvas(r);if(r.kind==='spritesheet'&&r.active)playSheet(r)})},
   stopAll:function(){
    records.forEach(function(r){
     if(r.kind==='gamecanvas')r.running=false;
     if(r.kind==='spritesheet')stopSheet(r,false);
     if(r.kind==='gametimer')stopGameTimer(r);
    });
   },
   isDown:function(key){var k=String(key);return pressed.has(k)||(k.length===1&&pressed.has(k.toLowerCase()))},
   keys:pressed,
   get page(){return activePage},
   get items(){return records.map(function(r){return r.api})},
   get sound(){return window.FlowForgeSound||null}
  };

  window.FlowForgeGame=Game;
  window.addEventListener('keydown',function(e){safe(function(){onKey(e,true)})},false);
  window.addEventListener('keyup',function(e){safe(function(){onKey(e,false)})},false);
  window.addEventListener('blur',function(){pressed.clear()});
  document.addEventListener('visibilitychange',function(){lastFrame=0;if(!document.hidden)ensureLoop()});
  window.addEventListener('flowforge:pagechange',function(e){safe(refreshActive)});
  window.addEventListener('pagehide',function(){Game.stopAll()});

  function boot(){refreshActive()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  setInterval(function(){if(activePage!==activePageId())refreshActive()},400);
 }

 window.FlowForgeGameRuntime='('+engine.toString()+')();';
})();
