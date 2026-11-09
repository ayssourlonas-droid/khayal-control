// FlowForge WebStudio — Depurador integrado (v3)
// O Preview roda em um iframe sandbox (origem opaca). Toda inspeção e execução
// acontece dentro do app via postMessage; o editor nunca acessa o DOM do iframe.
(function(){
 'use strict';
 const $=s=>document.querySelector(s);
 const state={logs:[],errors:[],events:[],net:[],paused:false,running:false};
 const MAX=500;
 let tab='console',level='all',filter='',raf=0,hist=[],histPos=0,cmdSeq=0,inspecting=false;
 const pending=new Map();

 /* ---------- executado dentro do app (Preview/Debug) ---------- */
 function sandboxBootstrap(){
  function makeStore(){
   var m=new Map();
   return {
    getItem:function(k){k=String(k);return m.has(k)?m.get(k):null},
    setItem:function(k,v){m.set(String(k),String(v))},
    removeItem:function(k){m.delete(String(k))},
    clear:function(){m.clear()},
    key:function(i){var a=Array.from(m.keys());return i>=0&&i<a.length?a[i]:null},
    get length(){return m.size}
   };
  }
  function ok(name){try{window[name].getItem('__ff_probe__');return true}catch(e){return false}}
  if(!ok('localStorage')){
   try{Object.defineProperty(window,'localStorage',{configurable:true,get:function(){return window.__ffMemStorage||(window.__ffMemStorage=makeStore())}})}catch(e){}
  }
  if(!ok('sessionStorage')){
   try{Object.defineProperty(window,'sessionStorage',{configurable:true,get:function(){return window.__ffMemSession||(window.__ffMemSession=makeStore())}})}catch(e){}
  }
 }

 function boot(){
  if(window.__ffDebuggerInstalled)return;window.__ffDebuggerInstalled=true;
  var P=parent;
  var stdKeys=new Set(Object.getOwnPropertyNames(window));
  function send(o){o.__ffdbg=1;o.t=Date.now();try{P.postMessage(o,'*')}catch(e){}}
  function safe(v,d){d=d||0;try{
   if(v===null||v===undefined||typeof v==='number'||typeof v==='boolean'||typeof v==='string')return v;
   if(typeof v==='function')return '[Function '+(v.name||'anônima')+']';
   if(v instanceof Error)return {__err:1,name:v.name,message:v.message,stack:v.stack};
   if(v&&v.nodeType===1)return '<'+v.tagName.toLowerCase()+(v.id?'#'+v.id:'')+'>';
   if(d>3)return '[…]';
   if(Array.isArray(v))return v.slice(0,50).map(function(x){return safe(x,d+1)});
   if(typeof v==='object'){var o={},n=0;for(var k in v){if(n++>50)break;o[k]=safe(v[k],d+1)}return o}
   return String(v)}catch(e){return '[não serializável]'}}
  function describe(v){
   if(typeof v==='function')return '[Function '+(v.name||'anônima')+']';
   if(v&&v.nodeType===1)return '<'+v.tagName.toLowerCase()+(v.id?'#'+v.id:'')+'>';
   return safe(v);
  }
  function reply(id,ok,value){send({type:'reply',id:id,ok:ok,value:value})}
  function userVars(){
   var out=[];
   Object.keys(window).forEach(function(k){
    if(stdKeys.has(k)||/^(__|webkit|FlowForge|FF|ff[A-Z_]|on[a-z]+$)/.test(k)||['project','params'].includes(k))return;
    var v;try{v=window[k]}catch(e){return}
    try{
     // iframes nomeados expõem WindowProxy; ler nodeType nele lança SecurityError.
     if(typeof v==='function'||(v&&v.nodeType))return;
     if(v&&typeof v==='object'&&!Array.isArray(v)){var vals=[];try{vals=Object.values(v)}catch(e){};if(vals.length&&vals.every(function(x){return typeof x==='function'}))return}
     var type=v===null?'null':typeof v;
     out.push({name:k,type:type,primitive:v===null||['string','number','boolean','undefined'].includes(typeof v),value:describe(v)});
    }catch(e){}
   });
   return out.slice(0,300);
  }
  function components(){
   return Array.prototype.slice.call(document.querySelectorAll('.ff-component')).slice(0,500).map(function(el){
    var c=el.querySelector('[data-ff-control],input,button,textarea,select,img,video')||el;
    var kind=(el.className.match(/ff-kind-([\w-]+)/)||[])[1]||c.tagName.toLowerCase();
    return {name:c.id||el.id||el.dataset.flowId||'',kind:kind,value:'value' in c&&typeof c.value==='string'?c.value:(c.textContent||'').trim().slice(0,100),visible:getComputedStyle(el).display!=='none'};
   });
  }
  function highlight(name){
   var el=document.getElementById(String(name||''));
   var box=el&&(el.closest('.ff-component')||el);
   if(!box)return false;
   var old=box.style.outline,off=box.style.outlineOffset;
   try{box.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}
   box.style.outline='3px solid #f59e0b';box.style.outlineOffset='2px';
   setTimeout(function(){box.style.outline=old;box.style.outlineOffset=off},1600);
   return true;
  }
  addEventListener('message',function(e){
   if(e.source!==P)return;
   var d=e.data;if(!d||!d.__ffdbgCmd)return;
   try{
    if(d.cmd==='eval'){
     var r=(0,eval)(String(d.code||''));
     if(r&&typeof r.then==='function'){
      r.then(function(v){reply(d.id,true,describe(v))},function(er){reply(d.id,false,(er&&er.name||'Erro')+': '+(er&&er.message||er))});
     }else reply(d.id,true,describe(r));
    }else if(d.cmd==='vars')reply(d.id,true,userVars());
    else if(d.cmd==='components')reply(d.id,true,components());
    else if(d.cmd==='setVar'){
     var name=String(d.name||'');
     if(!/^[A-Za-z_$][\w$]*$/.test(name))throw new Error('Nome de variável inválido');
     window[name]=d.value;reply(d.id,true,true);
    }else if(d.cmd==='highlight')reply(d.id,true,highlight(d.name));
    else if(d.cmd==='ping')reply(d.id,true,true);
    else reply(d.id,false,'Comando desconhecido');
   }catch(err){reply(d.id,false,(err&&err.name||'Erro')+': '+(err&&err.message||err))}
  });
  ['log','info','warn','error','debug'].forEach(function(k){var o=console[k];console[k]=function(){try{send({type:'console',kind:k==='debug'?'info':k,args:[].map.call(arguments,function(a){return safe(a)})})}catch(e){}return o.apply(console,arguments)}});
  addEventListener('error',function(e){
   if(e.target&&e.target!==window&&e.target.tagName){send({type:'error',args:['Falha ao carregar <'+e.target.tagName.toLowerCase()+'> '+(e.target.currentSrc||e.target.src||e.target.href||'')]});return}
   send({type:'error',args:[e.message],stack:e.error&&e.error.stack?String(e.error.stack):'',src:(e.filename||'')+':'+(e.lineno||0)+':'+(e.colno||0)})
  },true);
  addEventListener('unhandledrejection',function(e){var r=e.reason;send({type:'error',args:['Promise rejeitada: '+(r&&r.message?r.message:String(r))],stack:r&&r.stack?String(r.stack):''})});
  ['click','dblclick','input','change','submit','camerastart','camerastop','cameraerror'].forEach(function(n){
   document.addEventListener(n,function(e){
    var el=e.target&&e.target.closest?e.target.closest('[id]'):null,info='';
    if(n==='input'||n==='change'){var v=e.target&&e.target.value;if(v!==undefined)info=String(v).slice(0,80)}
    if(n==='cameraerror'&&e.detail&&e.detail.message)info=e.detail.message;
    send({type:'event',name:n,target:el?el.id:(e.target&&e.target.tagName||''),info:info})
   },true)
  });
  var of=window.fetch;
  if(of)window.fetch=function(i,o){var u=typeof i==='string'?i:((i&&i.url)||String(i)),m=(o&&o.method)||(i&&i.method)||'GET',t0=performance.now();
   return of.apply(this,arguments).then(function(r){send({type:'net',method:m,url:u,status:r.status,ms:Math.round(performance.now()-t0)});return r},function(er){send({type:'net',method:m,url:u,status:0,error:String(er&&er.message||er),ms:Math.round(performance.now()-t0)});throw er})};
  var xo=XMLHttpRequest.prototype.open,xs=XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open=function(m,u){this.__ffm=m;this.__ffu=String(u);return xo.apply(this,arguments)};
  XMLHttpRequest.prototype.send=function(){var x=this,t0=performance.now();x.addEventListener('loadend',function(){send({type:'net',method:x.__ffm||'GET',url:x.__ffu||'',status:x.status,ms:Math.round(performance.now()-t0),error:x.status?'':'falha de rede'})});return xs.apply(this,arguments)};
  send({type:'boot'});
 }

 function injectPreview(html){
  if(typeof html!=='string')return html;
  const panel=$('#debuggerPanel');
  const withDebug=!!(panel&&!panel.hidden);
  const clean=src=>src.replace(/<\/script/gi,'<\\/script');
  const scripts='<script>'+clean('('+sandboxBootstrap.toString()+')()')+'</script>'+
    (withDebug?'<script>'+clean('('+boot.toString()+')()')+'</script>':'');
  return /<head[^>]*>/i.test(html)?html.replace(/<head[^>]*>/i,m=>m+scripts):scripts+html;
 }
 window.ffDebugWrap=injectPreview;

 /* ---------- utilidades ---------- */
 function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
 const hhmmss=t=>{const d=new Date(t);return d.toLocaleTimeString([], {hour12:false})+'.'+String(d.getMilliseconds()).padStart(3,'0')};
 function fmt(v){
  if(v&&v.__err)return v.name+': '+v.message;
  if(typeof v==='string')return v;
  if(v===undefined)return 'undefined';
  try{return JSON.stringify(v)}catch(_){return String(v)}
 }
 const fmtArgs=a=>(a||[]).map(fmt).join(' ');
 const win=()=>$('#preview')?.contentWindow;
 function push(list,o){list.push(o);if(list.length>MAX)list.shift()}
 function match(text){return !filter||String(text).toLowerCase().includes(filter.toLowerCase())}

 function sendCmd(cmd,args={},timeout=8000){
  const w=win();
  if(!w)return Promise.reject(new Error('Preview não está em execução.'));
  const id=++cmdSeq;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{pending.delete(id);reject(new Error('O app não respondeu ao depurador.'))},timeout);
   pending.set(id,{resolve,reject,timer});
   try{w.postMessage({__ffdbgCmd:1,id,cmd,...args},'*')}catch(e){pending.delete(id);clearTimeout(timer);reject(e)}
  });
 }

 function originOf(text){
  const re=/\b([A-Za-z_$][\w$]*)_([a-z]+)\b/g;let m;
  try{
   while((m=re.exec(text))){
    if((project.pages||[]).some(p=>(p.items||[]).some(x=>x.name===m[1])))return {name:m[1],ev:m[2]};
   }
  }catch(_){}
  return null;
 }
 function selectInIde(name){
  try{
   let page=-1,item=null;
   project.pages.forEach((p,i)=>{if(item)return;const f=(p.items||[]).find(x=>x.name===name);if(f){item=f;page=i}});
   if(!item)return false;
   document.querySelector('[data-tab="design"]').click();
   if(project.active!==page){project.active=page;project.activePage=project.pages[page].id;selected=null;render()}
   select(item);return true;
  }catch(_){return false}
 }
 function flash(name){sendCmd('highlight',{name},3000).catch(()=>{})}

 /* ---------- renderização ---------- */
 function logRow(x){
  const text=fmtArgs(x.args);
  const cls=x.kind==='repl'?'dbg-info':'dbg-'+(x.kind==='log'?'log':x.kind);
  return `<div class="dbgRow ${cls}"><small>${hhmmss(x.t)}</small><span>${esc(text)}</span></div>`;
 }
 function render(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;paint()});
 }
 function listHtml(el,html,empty,stick){
  const keep=el.scrollHeight-el.scrollTop-el.clientHeight<40;
  el.innerHTML=html||`<em>${empty}</em>`;
  if(stick&&keep)el.scrollTop=el.scrollHeight;
 }
 function paint(){
  const logs=state.logs.filter(x=>(level==='all'||(level==='info'?(x.kind==='info'||x.kind==='log'||x.kind==='repl'):x.kind===level))&&match(fmtArgs(x.args)));
  listHtml($('#dbgConsole'),logs.map(logRow).join(''),'Sem mensagens.',true);
  listHtml($('#dbgErrors'),state.errors.filter(x=>match(fmtArgs(x.args)+(x.stack||''))).map(x=>{
   const o=originOf((x.stack||'')+' '+fmtArgs(x.args));
   const where=o?`<a class="dbgGo" data-go="${esc(o.name)}" title="Selecionar no Design">${esc(o.name)} · ${esc(o.ev)} ↗</a>`:'';
   const det=(x.stack||x.src)?`<details><summary>detalhes</summary><pre>${esc(x.stack||x.src)}</pre></details>`:'';
   return `<div class="dbgRow dbg-error"><small>${hhmmss(x.t)}</small><span>${esc(fmtArgs(x.args))} ${where}${det}</span></div>`}).join(''),'Sem erros.',true);
  listHtml($('#dbgEvents'),state.events.filter(x=>match(x.name+' '+x.target+' '+x.info)).map(x=>`<div class="dbgRow dbg-event"><small>${hhmmss(x.t)}</small><span><b>${esc(x.name)}</b> → ${x.target?`<a class="dbgGo" data-flash="${esc(x.target)}">${esc(x.target)}</a>`:'—'}${x.info?` <i>${esc(x.info)}</i>`:''}</span></div>`).join(''),'Nenhum evento disparado.',true);
  listHtml($('#dbgNet'),state.net.filter(x=>match(x.method+' '+x.url+' '+x.status)).map(x=>{const bad=!x.status||x.status>=400;return `<div class="dbgRow ${bad?'dbg-error':'dbg-info'}"><small>${hhmmss(x.t)}</small><span><b>${esc(x.method)}</b> ${esc(x.url)} → ${x.status||'falhou'} <i>${x.ms} ms</i>${x.error?' '+esc(x.error):''}</span></div>`}).join(''),'Sem requisições.',true);
  $('#dbgErrorCount').textContent=state.errors.length;
  $('#dbgNetCount').textContent=state.net.length;
  document.querySelector('[data-dbg-tab="errors"]').classList.toggle('hasErr',state.errors.length>0);
  $('#dbgState').textContent=state.paused?'Pausado':(state.running?'Executando':'Parado');
 }

 async function inspect(){
  if(inspecting||!state.running||!win())return;
  inspecting=true;
  try{
   const [vars,comps]=await Promise.all([sendCmd('vars',{},5000),sendCmd('components',{},5000)]);
   if(!state.running)return;
   const ed=document.activeElement;
   if(ed&&ed.closest&&ed.closest('#dbgVars,#dbgComponents')&&ed.tagName==='INPUT')return;
   const filtered=vars.filter(v=>match(v.name+' '+fmt(v.value)));
   $('#dbgVars').innerHTML=filtered.map(v=>{
    return `<div class="dbgKV"><b>${esc(v.name)}</b>${v.primitive?`<input data-var="${esc(v.name)}" data-type="${esc(v.type)}" value="${esc(v.value)}" title="Enter para alterar">`:`<span>${esc(fmt(v.value)).slice(0,300)}</span>`}</div>`;
   }).join('')||'<em>Nenhuma variável pública detectada.</em>';
   $('#dbgComponents').innerHTML=comps.filter(c=>match(c.name+' '+c.kind+' '+c.value)).map(c=>
    `<div class="dbgKV dbgComp${c.visible?'':' off'}"><b>${c.name?`<a class="dbgGo" data-flash="${esc(c.name)}" title="Destacar no app">${esc(c.name)}</a>`:'(sem nome)'}</b><span><i>${esc(c.kind)}</i> ${esc(c.value)} ${c.visible?'':'(oculto)'} ${c.name?`<a class="dbgGo" data-go="${esc(c.name)}" title="Selecionar no Design">↗</a>`:''}</span></div>`
   ).join('')||'<em>Sem componentes.</em>';
  }catch(err){
   if(state.running)console.warn('[FlowForge Debugger]',err.message);
  }finally{inspecting=false}
 }

 /* ---------- mensagens vindas do app ---------- */
 addEventListener('message',e=>{
  const d=e.data;if(!d||!d.__ffdbg||e.source!==win())return;
  if(d.type==='reply'){
   const p=pending.get(d.id);
   if(p){pending.delete(d.id);clearTimeout(p.timer);d.ok?p.resolve(d.value):p.reject(new Error(d.value))}
   return;
  }
  if(d.type==='boot'){
   state.running=true;
   push(state.logs,{t:d.t,kind:'info',args:['[FlowForge Debugger] conectado']});
   render();inspect();return;
  }
  if(state.paused&&d.type!=='error')return;
  if(d.type==='console')push(state.logs,{t:d.t,kind:d.kind,args:d.args});
  else if(d.type==='error')push(state.errors,{t:d.t,args:d.args,stack:d.stack,src:d.src});
  else if(d.type==='event')push(state.events,{t:d.t,name:d.name,target:d.target,info:d.info});
  else if(d.type==='net')push(state.net,{t:d.t,method:d.method,url:d.url,status:d.status,ms:d.ms,error:d.error});
  render();
 });

 /* ---------- texto para copiar ---------- */
 function plain(){
  const f=x=>hhmmss(x.t);
  if(tab==='console')return state.logs.map(x=>`${f(x)} [${x.kind}] ${fmtArgs(x.args)}`).join('\n');
  if(tab==='errors')return state.errors.map(x=>`${f(x)} ${fmtArgs(x.args)}${x.stack?'\n'+x.stack:''}`).join('\n');
  if(tab==='events')return state.events.map(x=>`${f(x)} ${x.name} → ${x.target} ${x.info||''}`).join('\n');
  if(tab==='net')return state.net.map(x=>`${f(x)} ${x.method} ${x.url} → ${x.status} ${x.ms} ms`).join('\n');
  return $('#dbg'+tab[0].toUpperCase()+tab.slice(1)).innerText;
 }

 /* ---------- REPL ---------- */
 async function runExpr(code){
  const now=Date.now();
  push(state.logs,{t:now,kind:'repl',args:['› '+code]});
  if(!state.running||!win()){
   push(state.logs,{t:now,kind:'error',args:['Execute o app (Debug) antes de avaliar expressões.']});
   render();return;
  }
  try{
   const r=await sendCmd('eval',{code},12000);
   push(state.logs,{t:Date.now(),kind:'repl',args:['← '+fmt(r)]});
  }catch(err){
   push(state.logs,{t:Date.now(),kind:'error',args:[err.message||String(err)]});
  }
  render();setTimeout(inspect,50);
 }

 addEventListener('DOMContentLoaded',()=>{
  const preview=$('#preview'),panel=$('#debuggerPanel');
  function reset(){state.logs=[];state.errors=[];state.events=[];state.net=[];render()}
  $('#debugBtn').onclick=()=>{
   reset();state.running=false;pending.forEach(p=>clearTimeout(p.timer));pending.clear();
   document.querySelector('[data-tab="preview"]').click();panel.hidden=false;
   window.ffApplyPreviewPermissions?.(preview);
   const h=window.FlowForgeImageAssets?.resolveHtml?.(window.generated())??window.generated();
   preview.srcdoc=window.ffDebugWrap(h);$('#dbgState').textContent='Iniciando...';
  };
  preview.addEventListener('load',()=>{if(!panel.hidden&&!state.running)$('#dbgState').textContent='Iniciando...'});
  $('#dbgClose').onclick=()=>{panel.hidden=true;state.running=false;render()};
  $('#dbgClear').onclick=reset;
  $('#dbgRefresh').onclick=()=>{if(state.running)inspect()};
  $('#dbgPause').onclick=()=>{state.paused=true;render()};$('#dbgResume').onclick=()=>{state.paused=false;render()};
  $('#dbgCopy').onclick=async()=>{const b=$('#dbgCopy');try{await navigator.clipboard.writeText(plain())}catch(_){const t=document.createElement('textarea');t.value=plain();document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(__){}t.remove()}b.classList.add('copied');setTimeout(()=>b.classList.remove('copied'),1200)};
  document.querySelectorAll('[data-dbg-tab]').forEach(b=>b.onclick=()=>{
   tab=b.dataset.dbgTab;
   document.querySelectorAll('[data-dbg-tab]').forEach(x=>x.classList.toggle('active',x===b));
   document.querySelectorAll('.dbgView').forEach(x=>x.hidden=true);
   $('#dbg'+tab[0].toUpperCase()+tab.slice(1)).hidden=false;
   $('#dbgLevel').hidden=tab!=='console';$('#dbgRepl').hidden=tab!=='console';
   if(['vars','components'].includes(tab))inspect();render();
  });
  $('#dbgFilter').oninput=e=>{filter=e.target.value;render();if(['vars','components'].includes(tab))inspect()};
  $('#dbgLevel').onchange=e=>{level=e.target.value;render()};
  panel.addEventListener('click',e=>{
   const g=e.target.closest('[data-go]');if(g){selectInIde(g.dataset.go);return}
   const f=e.target.closest('[data-flash]');if(f)flash(f.dataset.flash);
  });
  panel.addEventListener('keydown',e=>{
   const i=e.target.closest&&e.target.closest('input[data-var]');
   if(i&&e.key==='Enter'){
    let v=i.value;const ty=i.dataset.type;
    if(ty==='number'){const n=Number(v);v=isNaN(n)?v:n}else if(ty==='boolean')v=(v==='true'||v==='1');
    else if(ty==='undefined'||ty==='null'){try{v=JSON.parse(v)}catch(_){}}
    sendCmd('setVar',{name:i.dataset.var,value:v},4000).then(()=>{i.blur();setTimeout(inspect,30)}).catch(err=>{push(state.errors,{t:Date.now(),args:[err.message||String(err)]});render()});
   }
  });
  $('#dbgRepl').onsubmit=e=>{e.preventDefault();const i=$('#dbgExpr'),c=i.value.trim();if(!c)return;hist.push(c);histPos=hist.length;i.value='';runExpr(c)};
  $('#dbgExpr').onkeydown=e=>{if(e.key==='ArrowUp'&&histPos>0){histPos--;e.target.value=hist[histPos];e.preventDefault()}else if(e.key==='ArrowDown'){histPos=Math.min(hist.length,histPos+1);e.target.value=hist[histPos]||'';e.preventDefault()}};
  /* redimensionar arrastando a borda superior */
  const bar=$('#dbgResize'),main=document.querySelector('main');
  bar.onpointerdown=e=>{e.preventDefault();bar.setPointerCapture(e.pointerId);const y0=e.clientY,h0=panel.getBoundingClientRect().height;
   const mv=ev=>{const h=Math.max(150,Math.min(main.getBoundingClientRect().height-140,h0+(y0-ev.clientY)));main.style.setProperty('--dbg-h',Math.round(h)+'px')};
   const up=()=>{bar.removeEventListener('pointermove',mv);bar.removeEventListener('pointerup',up)};
   bar.addEventListener('pointermove',mv);bar.addEventListener('pointerup',up)};
  /* placeholders de <input> não são traduzidos pelo tradutor de DOM (inputs são ignorados de propósito) */
  const PH=[['#dbgFilter','Filtrar...'],['#dbgExpr','Executar expressão JavaScript no app...']];
  const placeholders=()=>{const U=window.FlowForgeUIText;PH.forEach(([sel,txt])=>{const el=$(sel);if(el)el.placeholder=U?.t?U.t(txt):txt})};
  placeholders();
  const U0=window.FlowForgeUIText;if(U0&&typeof U0.refresh==='function'){const r0=U0.refresh;U0.refresh=function(){const o=r0.apply(this,arguments);placeholders();return o}}
  /* atualização automática de variáveis/componentes enquanto visíveis */
  setInterval(()=>{if(!panel.hidden&&!state.paused&&state.running&&['vars','components'].includes(tab))inspect()},800);
 });
 window.FlowForgeDebugger={state,inspect,render,runExpr};
})();
