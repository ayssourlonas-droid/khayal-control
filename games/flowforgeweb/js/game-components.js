// FlowForge WebStudio v0.14.0 - Game Components
// Os renders abaixo são usados no Designer e no HTML exportado. O comportamento
// (loop, colisões, teclado, joystick) fica em js/game-runtime.js, copiado para o
// HTML final somente quando o projeto usa componentes de jogo.
(function(){
 const FF=window.FlowForge, R=FF?.components;
 const num=(v,fb)=>Number.isFinite(Number(v))?Number(v):fb;
 const safeColor=(v,fb)=>window.FFSecurity?.safeColor(v,fb)||fb;
 const safeMedia=(v)=>window.FFSecurity?.safeMediaUrl(v)||'';
 const escText=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const defs={
  gamecanvas:{title:'Game Canvas',category:'GAMES',defaults:{name:'GameCanvas1',width:320,height:240,canvasWidth:320,canvasHeight:240,bg:'#111827',fps:60,autoplay:true},event:'gameStart',events:['gameStart','gameUpdate','gameOver'],render:ctx=>{
   const x=ctx.item||{},w=Math.max(32,Math.min(8000,num(x.canvasWidth,320))),h=Math.max(32,Math.min(8000,num(x.canvasHeight,240))),fps=Math.max(1,Math.min(240,num(x.fps,60)));
   if(!ctx.exportMode)return `<div class="ff-gamecanvas ff-gamecanvas-design"><b>▶ Game Canvas</b><small>${w} × ${h} • ${fps} FPS</small></div>`;
   return `<canvas class="ff-gamecanvas" data-ff-gamecanvas width="${w}" height="${h}" style="display:block;width:100%;height:100%;background:${safeColor(x.bg,'#111827')}"></canvas>`;
  }},
  sprite:{title:'Sprite',category:'GAMES',defaults:{name:'Sprite1',width:48,height:48,text:'◆',bg:'transparent',color:'#e2e8f0',src:'',x:20,y:20,vx:0,vy:0,rotation:0,collidable:true,tag:'player'},event:'click',events:['click','collision','move'],render:ctx=>{
   const x=ctx.item||{},src=safeMedia(x.src),rot=num(x.rotation,0),size=Math.max(12,Math.min(200,num(x.height,48)));
   const inner=src
    ?`<img src="${escText(src)}" alt="${escText(x.text||'Sprite')}" draggable="false" style="display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;pointer-events:none">`
    :`<span aria-hidden="true">${escText(x.text||'◆')}</span>`;
   return `<div class="ff-sprite" data-ff-sprite style="width:100%;height:100%;display:grid;place-items:center;overflow:hidden;font-size:${size*.65}px;transform:rotate(${rot}deg);transform-origin:50% 50%">${inner}</div>`;
  }},
  spritesheet:{title:'Sprite Sheet',category:'GAMES',defaults:{name:'SpriteSheet1',width:64,height:64,frameWidth:32,frameHeight:32,frame:0,fps:8,loop:true,autoplay:true,src:''},event:'animationEnd',events:['animationStart','animationEnd','frame'],render:ctx=>{
   const x=ctx.item||{},fw=Math.max(1,Math.min(4096,num(x.frameWidth,32))),fh=Math.max(1,Math.min(4096,num(x.frameHeight,32))),frame=Math.max(0,num(x.frame,0)),fps=Math.max(1,Math.min(120,num(x.fps,8))),src=safeMedia(x.src);
   if(!ctx.exportMode)return `<div class="ff-spritesheet ff-spritesheet-design"><b>▦</b><small>quadro ${frame} • ${fps} FPS</small></div>`;
   return `<canvas class="ff-spritesheet" data-ff-spritesheet${src?` data-ff-src="${escText(src)}"`:''} width="${fw}" height="${fh}" style="display:block;width:100%;height:100%;background:transparent"></canvas>`;
  }},
  collisionarea:{title:'Collision Area',category:'GAMES',defaults:{name:'CollisionArea1',width:100,height:60,bg:'transparent',visibleInGame:false,tag:'obstacle',debug:false},event:'collision',events:['collision','enter','leave'],render:ctx=>{
   const x=ctx.item||{},tag=escText(x.tag||'obstacle');
   if(!ctx.exportMode)return `<div class="ff-collision" title="Área de colisão: ${tag}">▢ ${tag}</div>`;
   return `<div class="ff-collision" data-ff-collision data-tag="${tag}" data-ff-debug="${x.debug?'true':'false'}" aria-hidden="true"></div>`;
  }},
  keyboardinput:{title:'Keyboard Input',category:'GAMES',nonVisual:true,defaults:{name:'Keyboard1',width:1,height:1,enabled:true,preventDefault:false},event:'keydown',events:['keydown','keyup'],render:()=>'<div class="ff-game-nonvisual" title="Componente não visual: teclado">⌨ Teclado</div>'},
  gamepadinput:{title:'Gamepad Input',category:'GAMES',nonVisual:true,defaults:{name:'Gamepad1',width:1,height:1,enabled:true,index:0,deadZone:.15},event:'buttondown',events:['connected','disconnected','buttondown','buttonup','axis'],render:ctx=>{const x=ctx.item||{};return `<div class="ff-game-nonvisual" title="Componente não visual: controle">🎮 Controle ${num(x.index,0)}</div>`}},
  gametimer:{title:'Game Timer',category:'GAMES',nonVisual:true,defaults:{name:'GameTimer1',width:1,height:1,interval:16,enabled:true,oneShot:false},event:'tick',events:['tick'],render:ctx=>{const x=ctx.item||{};return `<div class="ff-game-nonvisual" title="Componente não visual: temporizador">◷ Timer ${Math.max(10,num(x.interval,16))}ms</div>`}},
  scorelabel:{title:'Score Label',category:'GAMES',defaults:{name:'Score1',width:130,height:36,text:'Score: 0',bg:'transparent',color:'#111827',value:0,prefix:'Score: '},event:'change',events:['change'],render:ctx=>{
   const x=ctx.item||{},prefix=String(x.prefix??'Score: '),value=num(x.value,0);
   return `<div class="ff-score" data-ff-score><span class="ff-score-prefix">${escText(prefix)}</span><span class="ff-score-value" data-ff-score-value>${escText(value)}</span></div>`;
  }},
  healthbar:{title:'Health Bar',category:'GAMES',defaults:{name:'Health1',width:180,height:24,value:100,max:100,barColor:'#22c55e',bg:'#e5e7eb'},event:'change',events:['change','empty'],render:ctx=>{
   const x=ctx.item||{},max=Math.max(1,num(x.max,100)),value=Math.max(0,Math.min(max,num(x.value,100))),pct=Math.round(value/max*100),bar=safeColor(x.barColor,'#22c55e');
   return `<div class="ff-health" data-ff-health data-value="${value}" data-max="${max}" role="progressbar" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><i style="width:${pct}%;background:${bar}"></i><span>${pct}%</span></div>`;
  }},
  joystick:{title:'Virtual Joystick',category:'GAMES',defaults:{name:'Joystick1',width:120,height:120,bg:'transparent',deadZone:.15,knobColor:'#94a3b8'},event:'move',events:['move','start','end'],render:ctx=>{
   const x=ctx.item||{},knob=safeColor(x.knobColor,'#94a3b8');
   return `<div class="ff-joystick" data-ff-joystick data-dead-zone="${num(x.deadZone,.15)}"><i style="background:${knob}" data-ff-joystick-knob></i></div>`;
  }}
 };
 if(R?.register)Object.entries(defs).forEach(([k,v])=>R.register(k,v));
 FF.game=FF.game||{};
 FF.game.rectsCollide=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 FF.game.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 FF.game.distance=(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0));
 FF.game.keys=new Set();
 addEventListener('keydown',e=>FF.game.keys.add(e.key));
 addEventListener('keyup',e=>FF.game.keys.delete(e.key));
 FF.game.key=k=>FF.game.keys.has(k);
 FF.game.loop=function(update,fps=60){let active=true,last=performance.now(),step=1000/fps;function frame(now){if(!active)return;if(now-last>=step){update((now-last)/1000);last=now}requestAnimationFrame(frame)}requestAnimationFrame(frame);return()=>active=false};
 FF.game.gamepads=()=>navigator.getGamepads?navigator.getGamepads():[];
})();
