// FlowForge WebStudio v0.14.0 - Nonvisual Services
// Registra os componentes de serviço no Designer e guarda o motor em
// window.FlowForgeNonvisualRuntime. O motor só roda no Preview/HTML exportado.
(function(){
 'use strict';

 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=(v,fb)=>Number.isFinite(Number(v))?Number(v):fb;

 const defs={
  http:{title:'HTTP / API',category:'SERVIÇOS',nonVisual:true,defaults:{name:'HTTP1',width:132,height:28,url:'',method:'GET',headers:''},event:'response',events:['request','response','error'],render:ctx=>{
   const x=ctx.item||{};
   if(ctx.exportMode)return '<div class="ff-nonvisual" data-ff-nonvisual="http"></div>';
   return `<div class="ff-nonvisual-chip" title="Componente não visual: HTTP">⇄ HTTP · ${esc(String(x.method||'GET').toUpperCase())}${x.url?' · '+esc(x.url):''}</div>`;
  }},
  websocket:{title:'WebSocket',category:'SERVIÇOS',nonVisual:true,defaults:{name:'WebSocket1',width:132,height:28,url:'',protocol:'',autoConnect:true},event:'message',events:['open','message','close','error'],render:ctx=>{
   const x=ctx.item||{};
   if(ctx.exportMode)return '<div class="ff-nonvisual" data-ff-nonvisual="websocket"></div>';
   return `<div class="ff-nonvisual-chip" title="Componente não visual: WebSocket">⌁ WebSocket${x.url?' · '+esc(x.url):' · sem URL'}</div>`;
  }},
  storage:{title:'LocalStorage',category:'SERVIÇOS',nonVisual:true,defaults:{name:'Storage1',width:132,height:28,key:''},event:'change',events:['change'],render:ctx=>{
   const x=ctx.item||{};
   if(ctx.exportMode)return '<div class="ff-nonvisual" data-ff-nonvisual="storage"></div>';
   return `<div class="ff-nonvisual-chip" title="Componente não visual: armazenamento local">▤ Storage${x.key?' · '+esc(x.key):''}</div>`;
  }},
  geolocation:{title:'Geolocation',category:'SERVIÇOS',nonVisual:true,defaults:{name:'Geolocation1',width:132,height:28,highAccuracy:true,watch:false,timeout:10000,maximumAge:0},event:'change',events:['change','error'],render:ctx=>{
   if(ctx.exportMode)return '<div class="ff-nonvisual" data-ff-nonvisual="geolocation"></div>';
   return '<div class="ff-nonvisual-chip" title="Componente não visual: geolocalização">⌖ Geolocation</div>';
  }},
  notification:{title:'Notification',category:'SERVIÇOS',nonVisual:true,defaults:{name:'Notification1',width:132,height:28,title:'Notificação',body:'',icon:''},event:'click',events:['click','close','error'],render:ctx=>{
   const x=ctx.item||{};
   if(ctx.exportMode)return '<div class="ff-nonvisual" data-ff-nonvisual="notification"></div>';
   return `<div class="ff-nonvisual-chip" title="Componente não visual: notificações">◉ Notification${x.title?' · '+esc(x.title):''}</div>`;
  }},
  clipboard:{title:'Clipboard',category:'SERVIÇOS',nonVisual:true,defaults:{name:'Clipboard1',width:132,height:28},event:'change',events:['change','error'],render:ctx=>{
   if(ctx.exportMode)return '<div class="ff-nonvisual" data-ff-nonvisual="clipboard"></div>';
   return '<div class="ff-nonvisual-chip" title="Componente não visual: área de transferência">▣ Clipboard</div>';
  }},
  network:{title:'Network Status',category:'SERVIÇOS',nonVisual:true,defaults:{name:'Network1',width:132,height:28},event:'change',events:['change','online','offline'],render:ctx=>{
   if(ctx.exportMode)return '<div class="ff-nonvisual" data-ff-nonvisual="network"></div>';
   return '<div class="ff-nonvisual-chip" title="Componente não visual: status da rede">⌁ Network</div>';
  }},
  vibration:{title:'Vibration',category:'SERVIÇOS',nonVisual:true,defaults:{name:'Vibration1',width:132,height:28,pattern:200},event:'start',events:['start','end','error'],render:ctx=>{
   const x=ctx.item||{};
   if(ctx.exportMode)return '<div class="ff-nonvisual" data-ff-nonvisual="vibration"></div>';
   return `<div class="ff-nonvisual-chip" title="Componente não visual: vibração">〰 Vibration · ${esc(x.pattern??200)}ms</div>`;
  }}
 };

 if(window.FlowForgeRegistry?.register)Object.entries(defs).forEach(([k,v])=>window.FlowForgeRegistry.register(k,v));

 function engine(){
  if(window.FlowForgeServices)return;
  var CFG=window.__FLOWFORGE_RUNTIME_CONFIG__||{};
  var LIST=Array.isArray(CFG.items)?CFG.items:[];
  var KINDS={http:1,websocket:1,storage:1,geolocation:1,notification:1,clipboard:1,network:1,vibration:1};
  var records=[],byId={},byName={};
  var memory=Object.create(null);
  var listeners=[];

  function num(v,fb){v=Number(v);return isFinite(v)?v:fb}
  function safe(fn){try{return fn()}catch(e){console.error('[FlowForgeServices]',e)}}
  function findEl(id){
   var els=document.querySelectorAll('.ff-component[data-flow-id]');
   for(var i=0;i<els.length;i++)if(els[i].dataset.flowId===String(id))return els[i];
   return null;
  }
  function resolve(ref){
   if(!ref)return null;
   if(ref.__rec)return ref.__rec;
   if(ref.nodeType===1)ref=ref.closest?ref.closest('.ff-component'):ref;
   if(ref&&ref.nodeType===1)return byId[String(ref.dataset.flowId||ref.dataset.id||'')]||null;
   var s=String(ref);
   return byId[s]||byName[s]||null;
  }
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
  function broadcast(kind,ev,detail){
   for(var i=0;i<records.length;i++)if(!kind||records[i].kind===kind)invoke(records[i],ev,detail);
  }

  /* --------------------------------- Storage ---------------------------------- */
  function storageArea(){
   try{
    var s=window.localStorage;
    var probe='__ff_probe__';
    s.setItem(probe,'1');s.removeItem(probe);
    return s;
   }catch(_){return null}
  }
  function storageGet(rec,key){
   key=String(key==null||key===''?rec.props.key||'':key);
   if(!key)return null;
   var s=storageArea();
   if(s)try{return s.getItem(key)}catch(_){}
   return Object.prototype.hasOwnProperty.call(memory,key)?memory[key]:null;
  }
  function storageSet(rec,key,value){
   key=String(key==null||key===''?rec.props.key||'':key);
   if(!key)return false;
   var old=storageGet(rec,key),text=String(value==null?'':value),s=storageArea();
   if(s)try{s.setItem(key,text)}catch(_){memory[key]=text}
   else memory[key]=text;
   invoke(rec,'change',{key:key,value:text,oldValue:old,source:'storage',self:rec.api});
   return true;
  }
  function storageRemove(rec,key){
   key=String(key==null||key===''?rec.props.key||'':key);
   if(!key)return false;
   var old=storageGet(rec,key),s=storageArea();
   if(s)try{s.removeItem(key)}catch(_){delete memory[key]}
   else delete memory[key];
   invoke(rec,'change',{key:key,value:null,oldValue:old,source:'storage',self:rec.api});
   return true;
  }
  function storageKeys(rec){
   var s=storageArea(),out=[];
   if(s){try{for(var i=0;i<s.length;i++)out.push(s.key(i))}catch(_){out=Object.keys(memory)}}
   else out=Object.keys(memory);
   return out.filter(function(k){return k!==null});
  }
  function storageClear(rec){
   var s=storageArea();
   if(s)try{s.clear()}catch(_){memory=Object.create(null)}
   else memory=Object.create(null);
   invoke(rec,'change',{key:null,value:null,oldValue:null,source:'storage',self:rec.api});
  }
  function setupStorage(rec){
   var api=rec.api;
   api.get=api.getItem=function(key){return storageGet(rec,key)};
   api.set=api.setItem=function(key,value){
    if(arguments.length<2){value=key;key=null}
    return storageSet(rec,key,value);
   };
   api.remove=api.removeItem=function(key){return storageRemove(rec,key)};
   api.clear=function(){storageClear(rec);return api};
   api.keys=function(){return storageKeys(rec)};
   api.has=function(key){return storageGet(rec,key)!==null};
   api.json=function(key,fallback){
    var raw=storageGet(rec,key);
    if(raw==null)return fallback===undefined?null:fallback;
    try{return JSON.parse(raw)}catch(_){return fallback===undefined?raw:fallback}
   };
   api.defaultKey=rec.props.key||'';
  }

  /* -------------------------------- WebSocket --------------------------------- */
  function socketUrl(rec,url){
   var u=String(url==null||url===''?rec.props.url||'':url).trim();
   if(!/^wss?:\/\//i.test(u))return '';
   return u;
  }
  function setupSocket(rec){
   var api=rec.api;
   rec.state='closed';rec.sock=null;rec.manual=false;rec.retry=null;rec.attempt=0;
   api.connect=api.open=function(url){
    var u=socketUrl(rec,url);
    if(!u){invoke(rec,'error',{error:new Error('Informe uma URL ws:// ou wss://'),url:u,self:api});return false}
    if(rec.sock&&(rec.state==='open'||rec.state==='connecting'))return false;
    rec.manual=false;rec.state='connecting';
    var protocols=String(rec.props.protocol||'').split(',').map(function(s){return s.trim()}).filter(Boolean);
    var sock;
    try{sock=new WebSocket(u,protocols.length?protocols:undefined)}
    catch(err){rec.state='closed';invoke(rec,'error',{error:err,url:u,self:api});return false}
    rec.sock=sock;rec.url=u;
    sock.onopen=function(e){
     rec.state='open';rec.attempt=0;
     invoke(rec,'open',{url:u,protocol:sock.protocol,event:e,self:api});
    };
    sock.onmessage=function(e){
     var data=e.data,parsed=null;
     if(typeof data==='string'){
      try{parsed=JSON.parse(data)}catch(_){}
     }
     invoke(rec,'message',{data:data,json:parsed,event:e,self:api});
    };
    sock.onerror=function(e){
     invoke(rec,'error',{error:e,url:u,event:e,self:api});
    };
    sock.onclose=function(e){
     rec.state='closed';rec.sock=null;
     invoke(rec,'close',{code:e.code,reason:e.reason,wasClean:e.wasClean,url:u,event:e,self:api});
     if(!rec.manual&&rec.props.autoConnect!==false&&document.visibilityState!=='hidden'){
      rec.attempt++;
      var delay=Math.min(10000,1000*Math.pow(1.6,Math.min(rec.attempt,6)));
      rec.retry=setTimeout(function(){rec.retry=null;if(!rec.manual)safe(function(){api.connect()})},delay);
     }
    };
    return true;
   };
   api.send=function(data){
    if(!rec.sock||rec.state!=='open')return false;
    try{
     rec.sock.send(typeof data==='object'&&data!==null?JSON.stringify(data):String(data));
     return true;
    }catch(err){
     invoke(rec,'error',{error:err,self:api});
     return false;
    }
   };
   api.close=function(code,reason){
    rec.manual=true;
    if(rec.retry){clearTimeout(rec.retry);rec.retry=null}
    if(rec.sock){
     rec.state='closing';
     try{rec.sock.close(num(code,1000),String(reason||''))}catch(_){}
     return true;
    }
    return false;
   };
   Object.defineProperties(api,{
    state:{get:function(){return rec.state}},
    readyState:{get:function(){return rec.sock?rec.sock.readyState:3}},
    url:{get:function(){return rec.url||String(rec.props.url||'')}},
    socket:{get:function(){return rec.sock}},
    connected:{get:function(){return rec.state==='open'}}
   });
   if(rec.props.autoConnect!==false)rec.autoConnect=true;
  }

  /* -------------------------------- Geolocation ------------------------------- */
  function positionDetail(pos,self){
   var c=pos.coords||{};
   return {coords:c,latitude:c.latitude,longitude:c.longitude,accuracy:c.accuracy,altitude:c.altitude,altitudeAccuracy:c.altitudeAccuracy,heading:c.heading,speed:c.speed,timestamp:pos.timestamp,position:pos,self:self};
  }
  function setupGeo(rec){
   var api=rec.api;
   rec.watchId=null;rec.last=null;
   function options(over){
    over=over||{};
    return {
     enableHighAccuracy:over.enableHighAccuracy!==undefined?!!over.enableHighAccuracy:rec.props.highAccuracy!==false,
     timeout:num(over.timeout,rec.props.timeout!=null?num(rec.props.timeout,10000):10000),
     maximumAge:num(over.maximumAge,rec.props.maximumAge!=null?num(rec.props.maximumAge,0):0)
    };
   }
   function ok(pos){
    rec.last=pos;
    invoke(rec,'change',positionDetail(pos,api));
   }
   function fail(err){
    invoke(rec,'error',{code:err&&err.code,message:(err&&err.message)||'Não foi possível obter a localização',error:err,self:api});
   }
   function supported(){
    if(!navigator.geolocation){
     fail({code:2,message:'Geolocalização não suportada neste navegador'});
     return false;
    }
    return true;
   }
   api.getCurrent=api.getCurrentPosition=function(over){
    return new Promise(function(resolve,reject){
     if(!supported())return reject(new Error('Geolocalização indisponível'));
     navigator.geolocation.getCurrentPosition(function(pos){ok(pos);resolve(pos)},function(err){fail(err);reject(err)},options(over));
    });
   };
   api.watch=function(over){
    if(rec.watchId!==null)return rec.watchId;
    if(!supported())return null;
    rec.watchId=navigator.geolocation.watchPosition(function(pos){ok(pos)},function(err){fail(err)},options(over));
    return rec.watchId;
   };
   api.stop=api.clearWatch=function(){
    if(rec.watchId!==null&&navigator.geolocation)navigator.geolocation.clearWatch(rec.watchId);
    rec.watchId=null;
   };
   Object.defineProperties(api,{
    supported:{get:function(){return !!navigator.geolocation}},
    watching:{get:function(){return rec.watchId!==null}},
    watchId:{get:function(){return rec.watchId}},
    lastPosition:{get:function(){return rec.last}},
    latitude:{get:function(){return rec.last?rec.last.coords.latitude:null}},
    longitude:{get:function(){return rec.last?rec.last.coords.longitude:null}},
    accuracy:{get:function(){return rec.last?rec.last.coords.accuracy:null}}
   });
   if(rec.props.watch)rec.autoWatch=true;
  }

  /* -------------------------------- Notification ------------------------------ */
  function setupNotification(rec){
   var api=rec.api;
   api.supported=function(){return typeof window.Notification!=='undefined'};
   api.requestPermission=function(){
    if(!api.supported())return Promise.resolve('denied');
    if(Notification.permission==='granted')return Promise.resolve('granted');
    try{return Notification.requestPermission()}catch(_){return Promise.resolve('denied')}
   };
   api.show=api.notify=function(title,opts){
    opts=opts||{};
    if(!api.supported()){invoke(rec,'error',{error:new Error('Notificações não suportadas'),self:api});return null}
    var t=String(title==null||title===''?rec.props.title||'Notificação':title);
    var body=String(opts.body!=null?opts.body:rec.props.body||'');
    var icon=String(opts.icon!=null?opts.icon:rec.props.icon||'');
    if(icon&&!/^(https?:|data:image\/|blob:|\/)/i.test(icon))icon='';
    try{
     var n=new Notification(t,{body:body,icon:icon||undefined,tag:opts.tag||undefined,requireInteraction:!!opts.requireInteraction});
     var detail={title:t,body:body,notification:n,self:api};
     n.onclick=function(e){invoke(rec,'click',Object.assign({event:e},detail))};
     n.onclose=function(e){invoke(rec,'close',Object.assign({event:e},detail))};
     n.onerror=function(e){invoke(rec,'error',Object.assign({event:e,error:e},detail))};
     return n;
    }catch(err){
     invoke(rec,'error',{error:err,self:api});
     return null;
    }
   };
   Object.defineProperties(api,{
    permission:{get:function(){return api.supported()?Notification.permission:'unsupported'}}
   });
   api.title=rec.props.title||'';
   api.body=rec.props.body||'';
  }

  /* --------------------------------- Clipboard -------------------------------- */
  function setupClipboard(rec){
   var api=rec.api;
   function fallbackWrite(text){
    var ta=document.createElement('textarea');
    ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(ta);ta.select();
    var ok=false;
    try{ok=document.execCommand('copy')}catch(_){ok=false}
    ta.remove();
    return ok;
   }
   api.writeText=api.copy=function(text){
    var value=String(text==null?'':text);
    function done(method){
     invoke(rec,'change',{text:value,method:method,self:api});
     return true;
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){
     return navigator.clipboard.writeText(value).then(function(){return done('clipboard-api')}).catch(function(err){
      if(fallbackWrite(value))return done('execCommand');
      invoke(rec,'error',{error:err,text:value,self:api});
      return false;
     });
    }
    if(fallbackWrite(value))return Promise.resolve(done('execCommand'));
    var err=new Error('Área de transferência indisponível');
    invoke(rec,'error',{error:err,text:value,self:api});
    return Promise.resolve(false);
   };
   api.readText=api.paste=function(){
    if(navigator.clipboard&&navigator.clipboard.readText){
     return navigator.clipboard.readText().catch(function(err){
      invoke(rec,'error',{error:err,self:api});
      return '';
     });
    }
    invoke(rec,'error',{error:new Error('Leitura da área de transferência não suportada'),self:api});
    return Promise.resolve('');
   };
   api.supported=function(){return !!(navigator.clipboard&&navigator.clipboard.writeText)};
  }

  /* ---------------------------------- Network --------------------------------- */
  function networkInfo(){
   var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection||{};
   return {
    online:navigator.onLine!==false,
    type:c.type||'unknown',
    effectiveType:c.effectiveType||'unknown',
    downlink:Number.isFinite(Number(c.downlink))?Number(c.downlink):null,
    downlinkMax:Number.isFinite(Number(c.downlinkMax))?Number(c.downlinkMax):null,
    rtt:Number.isFinite(Number(c.rtt))?Number(c.rtt):null,
    saveData:!!c.saveData
   };
  }
  function setupNetwork(rec){
   var api=rec.api;
   Object.defineProperties(api,{
    online:{get:function(){return navigator.onLine!==false}},
    type:{get:function(){return networkInfo().type}},
    effectiveType:{get:function(){return networkInfo().effectiveType}},
    downlink:{get:function(){return networkInfo().downlink}},
    rtt:{get:function(){return networkInfo().rtt}},
    saveData:{get:function(){return networkInfo().saveData}}
   });
   api.info=function(){return networkInfo()};
  }

  /* --------------------------------- Vibration -------------------------------- */
  function vibratePattern(value){
   if(Array.isArray(value))return value.map(function(v){return Math.max(0,num(v,0))});
   if(typeof value==='number')return Math.max(0,value);
   var parts=String(value==null?'':value).split(/[ ,;]+/).map(Number).filter(function(v){return isFinite(v)&&v>=0});
   if(!parts.length)return [200];
   return parts.length===1?parts[0]:parts;
  }
  function patternDuration(p){
   if(typeof p==='number')return p;
   return p.reduce(function(a,b){return a+b},0);
  }
  function setupVibration(rec){
   var api=rec.api;
   rec.endTimer=null;rec.vibrating=false;
   api.supported=function(){return typeof navigator.vibrate==='function'};
   api.vibrate=api.start=function(pattern){
    if(!api.supported()){
     invoke(rec,'error',{error:new Error('Vibração não suportada'),self:api});
     return false;
    }
    var p=vibratePattern(pattern!==undefined?pattern:rec.props.pattern);
    var ms=patternDuration(p);
    var ok=false;
    try{ok=navigator.vibrate(p)}catch(err){invoke(rec,'error',{error:err,self:api});return false}
    if(!ok){
     invoke(rec,'error',{error:new Error('O navegador recusou a vibração (normalmente exige um gesto do usuário)'),pattern:p,self:api});
     return false;
    }
    rec.vibrating=true;
    if(rec.endTimer){clearTimeout(rec.endTimer);rec.endTimer=null}
    invoke(rec,'start',{pattern:p,duration:ms,self:api});
    if(ms>0)rec.endTimer=setTimeout(function(){rec.endTimer=null;rec.vibrating=false;invoke(rec,'end',{pattern:p,duration:ms,self:api})},ms+30);
    return true;
   };
   api.stop=function(){
    var was=!!rec.vibrating;
    if(rec.endTimer){clearTimeout(rec.endTimer);rec.endTimer=null}
    if(api.supported()){try{navigator.vibrate(0)}catch(_){}}
    rec.vibrating=false;
    if(was)invoke(rec,'end',{pattern:null,duration:0,self:api});
    return true;
   };
   Object.defineProperty(api,'vibrating',{get:function(){return !!rec.vibrating}});
  }

  /* ----------------------------------- HTTP ----------------------------------- */
  function httpHeaders(rec,extra){
   var out={};
   var raw=rec.props.headers;
   if(raw&&typeof raw==='object')Object.assign(out,raw);
   else if(typeof raw==='string'&&raw.trim()){
    try{var parsed=JSON.parse(raw);if(parsed&&typeof parsed==='object')Object.assign(out,parsed)}catch(_){}
   }
   if(extra&&typeof extra==='object')Object.assign(out,extra);
   return out;
  }
  function httpUrl(rec,url){
   var base=String(rec.props.url||'').trim(),u=String(url==null||url===''?base:url).trim();
   if(!u)return '';
   if(/^[a-z][a-z0-9+.-]*:/i.test(u))return /^https?:/i.test(u)?u:'';
   if(/^\/\//.test(u))return location.protocol+u;
   try{return new URL(u,location.href).href}catch(_){return ''}
  }
  function requestHttp(rec,url,opts){
   opts=opts||{};
   if(url&&typeof url==='object'){opts=url;url=''}
   var u=httpUrl(rec,url);
   if(!u)return Promise.reject(new Error('URL HTTP inválida ou vazia'));
   var method=String(opts.method||rec.props.method||'GET').toUpperCase();
   var headers=httpHeaders(rec,opts.headers);
   var body=opts.body;
   if(body&&typeof body==='object'&&!(body instanceof FormData)&&!(body instanceof Blob)&&!(body instanceof URLSearchParams)){
    if(!Object.keys(headers).some(function(h){return h.toLowerCase()==='content-type'}))headers['Content-Type']='application/json';
    try{body=JSON.stringify(body)}catch(_){}
   }
   var init={method:method,headers:headers};
   if(body!==undefined&&method!=='GET'&&method!=='HEAD')init.body=body;
   invoke(rec,'request',{url:u,method:method,options:init,self:rec.api});
   return fetch(u,init).then(function(res){
    var type=res.headers.get('content-type')||'';
    var read=type.indexOf('application/json')>=0?res.json().catch(function(){return null}):res.text();
    return read.then(function(data){
     var detail={response:res,data:data,status:res.status,ok:res.ok,url:u,method:method,self:rec.api};
     invoke(rec,'response',detail);
     return detail;
    });
   }).catch(function(err){
    invoke(rec,'error',{error:err,url:u,method:method,self:rec.api});
    throw err;
   });
  }
  function setupHttp(rec){
   var api=rec.api;
   api.request=function(url,opts){return requestHttp(rec,url,opts)};
   ['get','post','put','patch','delete'].forEach(function(m){
    api[m]=function(url,body,opts){
     if(m==='get'&&(body&&typeof body==='object')&&!opts){opts=body;body=undefined}
     return requestHttp(rec,url,Object.assign({},opts||{},{method:m.toUpperCase(),body:body}));
    };
   });
  }

  /* --------------------------------- Interface -------------------------------- */
  function setup(rec){
   switch(rec.kind){
    case'http':setupHttp(rec);break;
    case'websocket':setupSocket(rec);break;
    case'storage':setupStorage(rec);break;
    case'geolocation':setupGeo(rec);break;
    case'notification':setupNotification(rec);break;
    case'clipboard':setupClipboard(rec);break;
    case'network':setupNetwork(rec);break;
    case'vibration':setupVibration(rec);break;
   }
   rec.api.name=rec.name;rec.api.kind=rec.kind;
  }

  LIST.forEach(function(it){
   if(!it||!KINDS[it.kind])return;
   var el=findEl(it.id);
   var rec={id:String(it.id),name:String(it.name||it.kind),kind:it.kind,pageId:String(it.pageId||''),props:it.p||{},handlers:it.h||{},el:el};
   var api={id:rec.id,name:rec.name,kind:rec.kind,pageId:rec.pageId,el:el,__rec:rec};
   // Serviços não precisam do wrapper no DOM, mas o proxy usa __rec quando ele existe.
   rec.api=api;records.push(rec);byId[rec.id]=rec;byName[rec.name]=rec;
   safe(function(){setup(rec)});
  });

  /* ------------------------------ Listeners globais ---------------------------- */
  function onOnline(e){
   if(typeof CustomEvent==='function'&&e instanceof CustomEvent)return;
   broadcast('network','online',{online:true,info:networkInfo()});
   broadcast('network','change',{online:true,info:networkInfo()});
  }
  function onOffline(e){
   if(typeof CustomEvent==='function'&&e instanceof CustomEvent)return;
   broadcast('network','offline',{online:false,info:networkInfo()});
   broadcast('network','change',{online:false,info:networkInfo()});
  }
  function onConnection(){
   broadcast('network','change',{online:navigator.onLine!==false,info:networkInfo()});
  }
  function onStorage(e){
   for(var i=0;i<records.length;i++){
    var rec=records[i];
    if(rec.kind!=='storage')continue;
    if(!e.key||!rec.props.key||e.key===rec.props.key)invoke(rec,'change',{key:e.key,value:e.newValue,oldValue:e.oldValue,source:'storage',external:true,self:rec.api});
   }
  }
  function onVisibility(){
   for(var i=0;i<records.length;i++){
    var rec=records[i];
    if(rec.kind!=='websocket'||!rec.props.autoConnect)continue;
    if(document.visibilityState!=='hidden'&&!rec.manual&&!rec.sock&&rec.props.url&&rec.state==='closed'&&!rec.retry)rec.api.connect();
   }
  }
  try{
   window.addEventListener('online',onOnline);
   window.addEventListener('offline',onOffline);
   window.addEventListener('storage',onStorage);
   document.addEventListener('visibilitychange',onVisibility);
   var conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
   if(conn&&conn.addEventListener){conn.addEventListener('change',onConnection);listeners.push(function(){conn.removeEventListener('change',onConnection)})}
  }catch(_){}

  var Services={
   get:function(ref){var r=resolve(ref);return r?r.api:null},
   byId:function(id){var r=byId[String(id)];return r?r.api:null},
   byName:function(name){var r=byName[String(name)];return r?r.api:null},
   forElement:function(el){
    if(!el)return null;
    var w=el.classList&&el.classList.contains('ff-component')?el:(el.closest&&el.closest('.ff-component'));
    var r=w?byId[String(w.dataset.flowId||w.dataset.id||'')]:null;
    return r?r.api:null;
   },
   emit:function(ref,ev,detail){var r=resolve(ref);if(!r)return false;invoke(r,String(ev),detail||{});return true},
   get items(){return records.map(function(r){return r.api})},
   network:networkInfo
  };
  window.FlowForgeServices=Services;

  function boot(){
   for(var i=0;i<records.length;i++){
    var rec=records[i];
    if(rec.kind==='websocket'&&rec.autoConnect&&rec.props.url)safe(function(){rec.api.connect()});
    if(rec.kind==='geolocation'&&rec.autoWatch)safe(function(){rec.api.watch()});
   }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.addEventListener('pagehide',function(){
   records.forEach(function(rec){
    if(rec.kind==='websocket'&&rec.sock){try{rec.sock.close(1001,'pagehide')}catch(_){}}
    if(rec.kind==='geolocation'&&rec.watchId!==null&&navigator.geolocation){try{navigator.geolocation.clearWatch(rec.watchId)}catch(_){}}
    if(rec.kind==='vibration'&&rec.endTimer)clearTimeout(rec.endTimer);
   });
   listeners.forEach(function(off){safe(off)});
  });
 }

 window.FlowForgeNonvisualRuntime='('+engine.toString()+')();';
})();
