// FlowForge WebStudio - componente "Som do Jogo" (gamesound)
// Efeitos sonoros sintetizados (Web Audio, sem arquivos) + arquivos de áudio opcionais.
// O motor abaixo é uma função autocontida: ela roda aqui (editor) e é copiada, como texto, para o HTML exportado/Preview
// somente quando o projeto tem um componente "Som do Jogo".
(function(){
 function engine(){
  if(window.FlowForgeSound)return;
  var ctx=null,master=null,vol=0.6,muted=false,musicEl=null,custom={},files={},history=[],gesto=false;
  try{muted=localStorage.getItem('ff_sound_muted')==='1'}catch(e){}
  function ac(){
   if(!gesto)return null; // antes do 1º toque/tecla o navegador bloqueia o som; não enfileira nada para não soar de repente depois
   if(!ctx){
    var A=window.AudioContext||window.webkitAudioContext; if(!A)return null;
    try{ctx=new A();master=ctx.createGain();master.connect(ctx.destination)}catch(e){ctx=null;return null}
   }
   if(ctx.state==='suspended'&&ctx.resume)ctx.resume().catch(function(){});
   master.gain.value=muted?0:vol; return ctx;
  }
  // navegadores só liberam o som depois de um toque/tecla: destrava no primeiro gesto
  ['pointerdown','keydown','touchstart','click'].forEach(function(ev){addEventListener(ev,function(){gesto=true;ac()},{passive:true})});
  function clamp(v,a,b){v=Number(v);return isFinite(v)?Math.max(a,Math.min(b,v)):a}
  // nota: freq (Hz), dur (s), tipo de onda, volume, atraso (s), freq final (glissando)
  function note(f,dur,type,v,when,f2){
   var c=ac(); if(!c)return; var t=c.currentTime+(when||0),o=c.createOscillator(),g=c.createGain();
   o.type=type||'square'; o.frequency.setValueAtTime(Math.max(20,f),t);
   if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);
   var pk=clamp(v==null?0.25:v,0,1)*0.5;
   g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002,pk),t+0.008);
   g.gain.exponentialRampToValueAtTime(0.0001,t+Math.max(0.03,dur));
   o.connect(g); g.connect(master); o.start(t); o.stop(t+Math.max(0.03,dur)+0.02);
  }
  function noise(dur,v,when,f1,f2){
   var c=ac(); if(!c)return; var t=c.currentTime+(when||0),n=Math.max(1,Math.floor(c.sampleRate*dur)),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
   for(var i=0;i<n;i++)d[i]=Math.random()*2-1;
   var s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain(); s.buffer=b; fl.type='lowpass';
   fl.frequency.setValueAtTime(f1||2000,t); if(f2)fl.frequency.exponentialRampToValueAtTime(Math.max(40,f2),t+dur);
   g.gain.setValueAtTime(clamp(v==null?0.5:v,0,1)*0.6,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
   s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t+dur+0.02);
  }
  // sequência de notas [[freq, ms], ...] (freq 0 = pausa)
  function seq(list,type,v,gap){
   var at=0; (list||[]).forEach(function(n){var f=Array.isArray(n)?n[0]:n,ms=(Array.isArray(n)?n[1]:120)/1000; if(f>0)note(f,ms*0.95,type,v,at); at+=ms+(gap||0)/1000});
  }
  var P={
   click:function(v){note(900,0.04,'square',0.3*v)},
   blip:function(v){note(660,0.06,'square',0.3*v)},
   tick:function(v){note(1200,0.02,'square',0.2*v)},
   move:function(v){note(320,0.04,'triangle',0.35*v)},
   pop:function(v){note(400,0.09,'sine',0.5*v,0,900)},
   flag:function(v){note(520,0.05,'triangle',0.4*v);note(780,0.06,'triangle',0.4*v,0.05)},
   merge:function(v){note(520,0.12,'sine',0.5*v,0,820)},
   coin:function(v){note(988,0.07,'square',0.3*v);note(1319,0.28,'square',0.3*v,0.07)},
   jump:function(v){note(280,0.2,'square',0.3*v,0,720)},
   laser:function(v){note(1300,0.22,'sawtooth',0.25*v,0,180)},
   hit:function(v){noise(0.12,0.5*v,0,3000,300);note(180,0.14,'sawtooth',0.35*v,0,60)},
   explosion:function(v){noise(0.7,0.9*v,0,2600,60);note(110,0.5,'sawtooth',0.4*v,0,28)},
   powerup:function(v){seq([[392,70],[523,70],[659,70],[784,70],[1047,160]],'square',0.28*v)},
   start:function(v){seq([[392,90],[523,90],[784,180]],'square',0.28*v)},
   win:function(v){seq([[523,120],[659,120],[784,120],[1047,420]],'square',0.3*v)},
   lose:function(v){seq([[392,170],[330,170],[262,170],[196,480]],'sawtooth',0.3*v)},
   error:function(v){note(160,0.12,'square',0.35*v);note(130,0.18,'square',0.35*v,0.13)}
  };
  var S={
   presets:Object.keys(P),
   get volume(){return vol},
   set volume(x){vol=clamp(x,0,1);if(master)master.gain.value=muted?0:vol;if(musicEl)musicEl.volume=muted?0:vol},
   get muted(){return muted},
   set muted(x){muted=!!x;try{localStorage.setItem('ff_sound_muted',muted?'1':'0')}catch(e){}if(master)master.gain.value=muted?0:vol;if(musicEl)musicEl.volume=muted?0:vol},
   get history(){return history},
   // play('moeda') | play('coin', 0.5) | play('meuArquivo')
   play:function(name,v){
    name=String(name==null?'':name); var vv=v==null?1:clamp(v,0,1);
    history.push({name:name,t:Date.now(),muted:muted}); if(history.length>200)history.shift();
    if(muted||!gesto)return false;
    var d=custom[name];
    if(d){
     if(d.src){try{var a=files[name]?files[name].cloneNode():new Audio(d.src);files[name]=files[name]||a;a.volume=clamp(vol*vv*(d.volume==null?1:d.volume),0,1);var p=a.play();if(p&&p.catch)p.catch(function(){})}catch(e){}return true}
     if(d.notes){seq(d.notes,d.wave||'square',(d.volume==null?0.3:d.volume)*vv);return true}
     if(d.preset&&P[d.preset]){P[d.preset](vv);return true}
    }
    if(P[name]){P[name](vv);return true}
    return false;
   },
   tone:function(freq,ms,type,v){history.push({name:'tone:'+freq,t:Date.now(),muted:muted});if(muted||!gesto)return false;note(Number(freq)||440,(Number(ms)||150)/1000,type||'square',v==null?0.3:v);return true},
   notes:function(list,type,v){history.push({name:'notes',t:Date.now(),muted:muted});if(muted||!gesto)return false;seq(list,type||'square',v==null?0.3:v);return true},
   music:function(src,v){
    S.stopMusic(); if(!src)return false;
    try{musicEl=new Audio(src);musicEl.loop=true;musicEl.volume=muted?0:clamp(vol*(v==null?0.6:v),0,1);var p=musicEl.play();if(p&&p.catch)p.catch(function(){});history.push({name:'music',t:Date.now(),muted:muted});return true}catch(e){return false}
   },
   stopMusic:function(){if(musicEl){try{musicEl.pause()}catch(e){}musicEl=null}},
   stop:function(){S.stopMusic();if(ctx&&ctx.state==='running')ctx.suspend().then(function(){ctx.resume()}).catch(function(){})},
   mute:function(){S.muted=true;return true},
   unmute:function(){S.muted=false;return false},
   toggleMute:function(){S.muted=!muted;return muted},
   // register('boom', {src:'sons/boom.mp3'}) | register('tema', {notes:[[440,100],[660,200]], wave:'triangle'}) | register('pulo2', {preset:'jump'})
   register:function(name,def){if(name&&def&&typeof def==='object'){custom[String(name)]=def;delete files[String(name)];return true}return false},
   // lê as propriedades do componente (volume, mudo, sons personalizados)
   attach:function(el){
    var c=el&&(el.querySelector?el.querySelector('[data-ff-sound]'):null); if(!c)return;
    var v=Number(c.dataset.ffVolume); if(isFinite(v)&&c.dataset.ffVolume!=='')vol=clamp(v,0,1);
    var stored=null; try{stored=localStorage.getItem('ff_sound_muted')}catch(e){}
    if(stored===null&&c.dataset.ffMuted==='1')muted=true;
    try{var s=JSON.parse(c.dataset.ffSounds||'{}');Object.keys(s).forEach(function(k){S.register(k,s[k])})}catch(e){}
    if(master)master.gain.value=muted?0:vol;
   }
  };
  window.FlowForgeSound=S;
 }
 window.FlowForgeSoundRuntime='('+engine.toString()+')();';
 engine();
 // propriedades do componente no editor
 window.FlowForgeSoundSchema=[
  {key:'volume',label:'Volume (0 a 1)',type:'number',min:0,max:1,step:0.1},
  {key:'muted',label:'Começar sem som',type:'checkbox'},
  {key:'sounds',label:'Sons personalizados (JSON)',type:'textarea'}
 ];
 var R=window.FlowForge&&window.FlowForge.components;
 if(R&&R.register)R.register('gamesound',{
  title:'Game Sound',category:'GAMES',nonVisual:true,
  defaults:{name:'Sons1',volume:0.6,muted:false,sounds:'',width:90,height:34,text:'Sons'},
  event:'play',events:['play'],
  render:function(ctx){
   var x=(ctx&&ctx.item)||{},esc=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')};
   return '<div class="ff-nonvisual-chip" data-ff-sound data-ff-volume="'+esc(x.volume==null?0.6:x.volume)+'" data-ff-muted="'+(x.muted?'1':'0')+'" data-ff-sounds="'+esc(x.sounds||'')+'" title="Componente não visual: sons do jogo">🔊 Sons</div>';
  }
 });
})();
