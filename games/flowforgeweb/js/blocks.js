// FlowForge v0.13.0 — component-aware visual blocks
(function(){
 const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const EVENT_NAMES={click:'quando clicar',input:'quando texto mudar',change:'quando valor mudar',submit:'quando enviar',play:'quando reproduzir',load:'quando carregar',tick:'quando disparar',complete:'quando completar',camerastart:'quando câmera iniciar',cameraerror:'quando ocorrer erro'};
 const CAPS={
  button:{props:['textContent','disabled'],methods:['show','hide'],events:['click']},fab:{props:['textContent','disabled'],methods:['show','hide'],events:['click']},gradientbutton:{props:['textContent','disabled'],methods:['show','hide'],events:['click']},iconbutton:{props:['textContent','disabled'],methods:['show','hide'],events:['click']},
  input:{props:['value','disabled'],methods:['show','hide','focus'],events:['input','change']},textarea:{props:['value','disabled'],methods:['show','hide','focus'],events:['input','change']},select:{props:['value','disabled'],methods:['show','hide'],events:['change']},range:{props:['value','disabled'],methods:['show','hide'],events:['input','change']},
  checkbox:{props:['checked','disabled'],methods:['show','hide'],events:['change']},radio:{props:['checked','disabled'],methods:['show','hide'],events:['change']},
  label:{props:['textContent'],methods:['show','hide'],events:['click']},heading:{props:['textContent'],methods:['show','hide'],events:['click']},
  picturebox:{props:['src'],methods:['show','hide'],events:['click','load']},image:{props:['src'],methods:['show','hide'],events:['click','load']},
  progress:{props:['value'],methods:['progressSet','progressInc','show','hide'],events:['change','complete']},
  timer:{props:['enabled'],methods:['timerStart','timerStop'],events:['tick']},
  camera:{props:[],methods:['cameraStart','cameraStop','cameraCapture','show','hide'],events:['camerastart','cameraerror']},
  gamesound:{props:['volume','muted'],methods:['show','hide'],events:[]},
  chart:{props:['chartType','chartTitle','legend','showValues','maxPoints'],methods:['setData','addPoint','clear','show','hide'],events:['select']},
  audio:{props:[],methods:['play','pause','show','hide'],events:['play']},video:{props:['src'],methods:['play','pause','show','hide'],events:['play']},
  default:{props:['textContent'],methods:['show','hide'],events:['click']}
 };
 const GENERAL=[
  {type:'if',label:'se / então',cat:'Controle'},{type:'alert',label:'mostrar mensagem',cat:'Controle'},{type:'delay',label:'esperar',cat:'Controle'},
  {type:'setvar',label:'definir variável',cat:'Variáveis'},{type:'inc',label:'somar variável',cat:'Variáveis'},{type:'repeat',label:'repetir N vezes',cat:'Controle'},{type:'while',label:'enquanto',cat:'Controle'},{type:'math',label:'operação matemática',cat:'Matemática'},{type:'join',label:'juntar textos',cat:'Texto'},{type:'logic',label:'comparação lógica',cat:'Lógica'},{type:'navigate',label:'ir para página',cat:'Navegação'}
 ];
 
 const blockHistory=[]; let historyOwner=null;
 function saveBlocks(){let x=selected();if(!x)return;if(historyOwner!==x){historyOwner=x;blockHistory.length=0;}blockHistory.push(JSON.stringify(x.blocks||{}));if(blockHistory.length>40)blockHistory.shift()}
 function undoBlocks(){let x=selected();if(!x||historyOwner!==x||blockHistory.length<2)return;blockHistory.pop();x.blocks=JSON.parse(blockHistory[blockHistory.length-1]);render();sync()}
 function sourceName(s){if(!s)return'';if(s.kind==='component')return `${s.target}.${s.prop}`;if(s.kind==='variable')return `variável ${s.name}`;if(s.kind==='number')return String(s.value);return s.kind}

 function items(){return window.ffItems?.()||[]}
 function selected(){return window.selected||null}
 function cap(x){let c={...(CAPS[x?.kind]||CAPS.default),...(window.FlowForgeBlockCapabilities?.get?.(x?.kind)||{})}, reg=window.FlowForgeRegistry?.get?.(x?.kind), ev=reg?.events||(reg?.event?[reg.event]:null);return {...c,events:ev||window.EVENT_OPTIONS?.[x?.kind]||c.events}}
 function ensure(x,ev){x.blocks??={};return x.blocks[ev]??=[]}
 function eventList(x){return [...new Set(cap(x).events||[window.defaultEvent?.(x.kind)||'click'])]}
 function target(name){return items().find(x=>x.name===name)}
 function q(v){return JSON.stringify(String(v??''))}
 function expr(v,source){if(source?.kind==='component')return `document.getElementById(${q(source.target)})?.${source.prop||'value'}`;if(source?.kind==='variable')return `window[${q(source.name)}]`;if(source?.kind==='number')return String(Number(source.value)||0);if(source?.kind==='math')return `(${expr(source.a,source.as)} ${source.op||'+'} ${expr(source.b,source.bs)})`;if(source?.kind==='join')return `String(${expr(source.a,source.as)})+String(${expr(source.b,source.bs)})`;if(source?.kind==='logic')return `(${expr(source.a,source.as)} ${source.op||'=='} ${expr(source.b,source.bs)})`;return q(v)}
 function compile(b){
  switch(b.type){
   case'set':return `document.getElementById(${q(b.target)}).${b.prop||'textContent'}=${expr(b.value,b.source)};`;
   case'show':return `document.getElementById(${q(b.target)})?.closest('.ff-component')?.style.setProperty('display','');`;
   case'hide':return `document.getElementById(${q(b.target)})?.closest('.ff-component')?.style.setProperty('display','none');`;
   case'focus':return `document.getElementById(${q(b.target)})?.focus();`;
   case'play':return `document.getElementById(${q(b.target)})?.play();`;case'pause':return `document.getElementById(${q(b.target)})?.pause();`;
   case'timerStart':return `FlowForgeTimer.start(${q(b.target)});`;case'timerStop':return `FlowForgeTimer.stop(${q(b.target)});`;
   case'progressSet':return `FlowForgeProgress.set(${q(b.target)},${Number(b.value)||0});`;case'progressInc':return `FlowForgeProgress.increment(${q(b.target)},${Number(b.value)||1});`;
   case'cameraStart':return `FlowForgeCamera.start(${q(b.target)}).catch(()=>{});`;case'cameraStop':return `FlowForgeCamera.stop(${q(b.target)});`;case'cameraCapture':return `FlowForgeCamera.capture(${q(b.target)});`;
   case'alert':return `alert(${q(b.value||'Olá!')});`;case'delay':return `await new Promise(ffResolve=>setTimeout(ffResolve,${Math.max(0,Number(b.value)||1000)}));`;
   case'navigate':return `FlowForgeNavigate(${q(b.value)});`;case'setvar':return `window[${q(b.target||'variavel')}]=${q(b.value)};`;case'inc':return `window[${q(b.target||'contador')}]=(Number(window[${q(b.target||'contador')}])||0)+${Number(b.value)||1};`;
   case'if':return `if(${b.left||'true'} ${b.op||'=='} ${expr(b.right,b.source)}){\n${(b.body||[]).map(compile).join('\n')}\n}${b.elseBody?.length?`else{\n${b.elseBody.map(compile).join('\n')}\n}`:''}`;
   case'repeat':return `for(let ff_i=0;ff_i<${Math.max(0,Number(b.value)||1)};ff_i++){\n${(b.body||[]).map(compile).join('\n')}\n}`;
   case'while':return `while(${b.left||'false'} ${b.op||'=='} ${expr(b.right,b.source)}){\n${(b.body||[]).map(compile).join('\n')}\n}`;
   case'math':case'join':case'logic':return `/* bloco de valor: ${b.type} */`;default:return '';
  }
 }
 function validate(){
  const issues=[], names=new Set(items().map(x=>x.name));
  const walk=(arr,path)=>{(arr||[]).forEach((z,i)=>{let p=path+'['+i+']';if(z.target&&['set','show','hide','focus','play','pause','timerStart','timerStop','progressSet','progressInc','cameraStart','cameraStop','cameraCapture'].includes(z.type)&&!names.has(z.target))issues.push(p+': componente '+z.target+' não existe');if(z.source?.kind==='component'&&!names.has(z.source.target))issues.push(p+': fonte '+z.source.target+' não existe');walk(z.body,p+'.body');walk(z.elseBody,p+'.else')})};let x=selected();if(x)Object.entries(x.blocks||{}).forEach(([e,a])=>walk(a,e));return issues;
 }

 function sync(){let x=selected(),ev=$('#blockEvent')?.value;if(!x||!ev)return;x.events??={};x.events[ev]=ensure(x,ev).map(compile).join('\n');window.updateCode?.()}
 function palette(){
  let p=$('#blockPalette');if(!p)return;
  let html='<div class="bpPaletteHead"><input id="blockSearch" class="blockSearch" placeholder="Buscar blocos..."><button id="bpCollapse" title="Recolher tudo">−</button></div><div class="bpTitle">Componentes <span>'+items().length+'</span></div>';
  for(const x of items()){let c=cap(x);html+=`<details class="bpComp" ${selected()?.id===x.id?'open':''}><summary><b>${esc(x.name)}</b><small>${esc(x.kind)}</small></summary>`;
   for(const ev of eventList(x))html+=`<button class="bpEvent" data-select="${esc(x.name)}" data-event="${esc(ev)}"><small>Evento</small>${esc(EVENT_NAMES[ev]||('quando '+ev))}</button>`;
   for(const pr of c.props||[]){html+=`<button data-type="set" data-target="${esc(x.name)}" data-prop="${esc(pr)}"><small>Propriedade</small>definir ${esc(x.name)}.${esc(pr)}</button>`;html+=`<button class="bpGetter" data-getter="${esc(x.name)}" data-getprop="${esc(pr)}" draggable="true"><small>Valor</small>${esc(x.name)}.${esc(pr)}</button>`;}
   for(const m of c.methods||[])html+=`<button data-type="${esc(m)}" data-target="${esc(x.name)}"><small>Ação</small>${esc(m)} ${esc(x.name)}</button>`;
   html+='</details>';
  }
  html+='<div class="bpTitle">Integrados</div>'+GENERAL.map(b=>`<button data-type="${b.type}"><small>${b.cat}</small>${b.label}</button>`).join('');html+=`<div class="bpTitle">Valores e expressões</div>
<button class="bpValue bpMath" draggable="true" data-expr="number"><small>Matemática</small>número</button>
<button class="bpValue bpMath" draggable="true" data-expr="math"><small>Matemática</small>valor + valor</button>
<button class="bpValue bpText" draggable="true" data-expr="join"><small>Texto</small>juntar texto</button>
<button class="bpValue bpLogic" draggable="true" data-expr="logic"><small>Lógica</small>comparar valores</button>
<button class="bpValue bpVar" draggable="true" data-expr="variable"><small>Variáveis</small>obter variável</button>`;
  p.innerHTML=html;
  p.querySelectorAll('[data-type]').forEach(el=>{el.onclick=()=>add(el.dataset.type,{target:el.dataset.target,prop:el.dataset.prop});el.draggable=true;el.ondragstart=e=>e.dataTransfer.setData('text/ff-block',JSON.stringify({type:el.dataset.type,target:el.dataset.target,prop:el.dataset.prop}))});
  p.querySelectorAll('[data-select]').forEach(el=>el.onclick=()=>{let x=items().find(i=>i.name===el.dataset.select);if(x){window.selected=x;render(el.dataset.event)}});
  p.querySelectorAll('[data-getter]').forEach(el=>el.ondragstart=e=>{e.dataTransfer.setData('application/x-flowforge-value',JSON.stringify({kind:'component',target:el.dataset.getter,prop:el.dataset.getprop}));e.stopPropagation()});
  p.querySelectorAll('[data-expr]').forEach(el=>el.ondragstart=e=>{let k=el.dataset.expr,z=k==='number'?{kind:k,value:0}:k==='variable'?{kind:k,name:'variavel'}:{kind:k,a:'',b:'',op:k==='math'?'+':'=='};e.dataTransfer.setData('application/x-flowforge-value',JSON.stringify(z));e.stopPropagation()});
  let search=p.querySelector('#blockSearch');if(search)search.oninput=()=>{let q=search.value.toLowerCase();p.querySelectorAll('.bpComp').forEach(d=>d.style.display=!q||d.textContent.toLowerCase().includes(q)?'':'none');p.querySelectorAll(':scope>button').forEach(d=>d.style.display=!q||d.textContent.toLowerCase().includes(q)?'':'none')};let col=p.querySelector('#bpCollapse');if(col)col.onclick=()=>p.querySelectorAll('details').forEach(d=>d.open=false);

 }
 function optionsFor(b){
   let x=target(b.target),c=cap(x),names=items().map(i=>`<option ${i.name===b.target?'selected':''}>${esc(i.name)}</option>`).join('');
   if(b.type==='set')return `<select data-k="target">${names}</select><select data-k="prop">${(c.props||['textContent']).map(p=>`<option ${p===b.prop?'selected':''}>${esc(p)}</option>`).join('')}</select><span class="blockSocket" data-socket="source">${b.source?`<b>${esc(sourceName(b.source))}</b><button data-unsocket="1">×</button>`:`<input data-k="value" value="${esc(b.value)}" placeholder="valor ou encaixe">`}</span>`;
   if(['show','hide','focus','play','pause','timerStart','timerStop','progressSet','progressInc','cameraStart','cameraStop','cameraCapture'].includes(b.type))return `<select data-k="target">${names}</select>${['progressSet','progressInc'].includes(b.type)?`<input data-k="value" value="${esc(b.value)}" placeholder="valor">`:''}`;
   if(['alert','delay','navigate'].includes(b.type))return `<input data-k="value" value="${esc(b.value)}" placeholder="valor">`;
   if(['setvar','inc'].includes(b.type))return `<input data-k="target" value="${esc(b.target)}" placeholder="variável"><input data-k="value" value="${esc(b.value)}" placeholder="valor">`;
   if(b.type==='if'||b.type==='while')return `<input data-k="left" value="${esc(b.left)}" placeholder="expressão"><select data-k="op"><option ${b.op==='=='?'selected':''}>==</option><option ${b.op==='!='?'selected':''}>!=</option><option ${b.op==='>'?'selected':''}>&gt;</option><option ${b.op==='<'?'selected':''}>&lt;</option></select><span class="blockSocket" data-socket="source">${b.source?`<b>${esc(sourceName(b.source))}</b><button data-unsocket="1">×</button>`:`<input data-k="right" value="${esc(b.right)}" placeholder="valor ou encaixe">`}</span>`;
   if(b.type==='repeat')return `<input type="number" min="0" data-k="value" value="${esc(b.value||3)}" style="width:65px"> vezes`;return '';
 }
 function label(b){return ({set:'definir',show:'mostrar',hide:'ocultar',focus:'focar',play:'reproduzir',pause:'pausar',timerStart:'iniciar Timer',timerStop:'parar Timer',progressSet:'definir ProgressBar',progressInc:'incrementar ProgressBar',cameraStart:'iniciar câmera',cameraStop:'parar câmera',cameraCapture:'capturar câmera',if:'se / então',alert:'mostrar mensagem',delay:'esperar',navigate:'ir para página',setvar:'definir variável',inc:'somar variável',repeat:'repetir',while:'enquanto',math:'matemática',join:'juntar texto',logic:'lógica'})[b.type]||b.type}
 function card(b,i){let nested=['if','repeat','while'].includes(b.type)?`<div class="nestedZone" data-parent="${i}" data-branch="body"><small>faça</small>${(b.body||[]).map((z,j)=>`<div class="nestedMini">${esc(label(z))}<button data-nested-del="${i}:${j}:body">×</button></div>`).join('')||'<em>arraste uma ação aqui</em>'}</div>`:'';let els=b.type==='if'?`<div class="nestedZone elseZone" data-parent="${i}" data-branch="elseBody"><small>senão</small>${(b.elseBody||[]).map((z,j)=>`<div class="nestedMini">${esc(label(z))}<button data-nested-del="${i}:${j}:elseBody">×</button></div>`).join('')||'<em>arraste uma ação aqui</em>'}</div>`:'';return `<div class="ff-block ff-block-${esc(b.type)}" draggable="true" data-i="${i}"><span class="blockGrip">⋮⋮</span><b>${esc(label(b))}</b><div>${optionsFor(b)}</div><span class="blockBtns"><button data-up="${i}">↑</button><button data-down="${i}">↓</button><button data-copy="${i}">⧉</button><button data-del="${i}">×</button></span>${nested}${els}</div>`}
 function render(forceEvent){
  palette();let x=selected(),sel=$('#blockEvent'),ws=$('#blockWorkspace');if(!sel||!ws)return;if(!x){sel.innerHTML='';ws.innerHTML='<div class="blockHint">Selecione um componente no Designer ou na lista de componentes.</div>';return}
  if(historyOwner!==x){historyOwner=x;blockHistory.length=0;}let snap=JSON.stringify(x.blocks||{});if(blockHistory[blockHistory.length-1]!==snap)blockHistory.push(snap);if(blockHistory.length>40)blockHistory.shift();
  let evs=eventList(x),cur=forceEvent||sel.value;sel.innerHTML=evs.map(e=>`<option value="${esc(e)}">${esc(x.name)} → ${esc(EVENT_NAMES[e]||e)}</option>`).join('');sel.value=evs.includes(cur)?cur:evs[0];
  let a=ensure(x,sel.value);ws.innerHTML=`<div class="blockEventHat">quando <b>${esc(x.name)}</b> ${esc(EVENT_NAMES[sel.value]||sel.value)}</div>`+(a.length?a.map(card).join(''):'<div class="blockHint">Arraste ações compatíveis para este evento.</div>');
  ws.querySelectorAll('[data-k]').forEach(el=>el.oninput=()=>{let z=a[+el.closest('.ff-block').dataset.i];z[el.dataset.k]=el.value;if(el.dataset.k==='target')render();else sync()});
  ws.querySelectorAll('.blockSocket').forEach(sock=>{sock.ondragover=e=>{if(Array.from(e.dataTransfer?.types||[]).includes('application/x-flowforge-value')){e.preventDefault();sock.classList.add('socketHot')}};sock.ondragleave=()=>sock.classList.remove('socketHot');sock.ondrop=e=>{let raw=e.dataTransfer.getData('application/x-flowforge-value');if(!raw)return;e.preventDefault();e.stopPropagation();let z=a[+sock.closest('.ff-block').dataset.i];z[sock.dataset.socket]=JSON.parse(raw);render();sync()}});
  ws.querySelectorAll('[data-unsocket]').forEach(el=>el.onclick=e=>{e.stopPropagation();let z=a[+el.closest('.ff-block').dataset.i];delete z.source;render();sync()});
  ws.querySelectorAll('.nestedZone').forEach(zone=>{zone.ondragover=e=>{e.preventDefault();e.stopPropagation();zone.classList.add('nestedHot')};zone.ondragleave=()=>zone.classList.remove('nestedHot');zone.ondrop=e=>{e.preventDefault();e.stopPropagation();let raw=e.dataTransfer.getData('text/ff-block');if(!raw)return;let seed;try{seed=JSON.parse(raw)}catch(_){seed={type:raw}};let p=a[+zone.dataset.parent],arr=p[zone.dataset.branch]??=[];arr.push({type:seed.type,target:seed.target||items()[0]?.name||'',prop:seed.prop||'textContent',value:'',left:'true',op:'==',right:'',body:[],elseBody:[]});render();sync()}});
  ws.querySelectorAll('[data-nested-del]').forEach(el=>el.onclick=e=>{e.stopPropagation();let [pi,ji,br]=el.dataset.nestedDel.split(':');a[+pi][br].splice(+ji,1);render();sync()});

  ws.querySelectorAll('[data-del]').forEach(el=>el.onclick=()=>{a.splice(+el.dataset.del,1);render();sync()});ws.querySelectorAll('[data-copy]').forEach(el=>el.onclick=()=>{let i=+el.dataset.copy;a.splice(i+1,0,JSON.parse(JSON.stringify(a[i])));render();sync()});
  ws.querySelectorAll('[data-up]').forEach(el=>el.onclick=()=>{let i=+el.dataset.up;if(i){[a[i-1],a[i]]=[a[i],a[i-1]];render();sync()}});ws.querySelectorAll('[data-down]').forEach(el=>el.onclick=()=>{let i=+el.dataset.down;if(i<a.length-1){[a[i+1],a[i]]=[a[i],a[i+1]];render();sync()}});
  let drag=null;ws.querySelectorAll('.ff-block').forEach(el=>{el.ondragstart=()=>drag=+el.dataset.i;el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();if(drag==null)return;let to=+el.dataset.i,[v]=a.splice(drag,1);a.splice(to,0,v);render();sync()}});
 }
 function add(type,seed={}){let x=selected(),ev=$('#blockEvent')?.value;if(!x||!ev)return alert('Escolha primeiro o componente/evento.');ensure(x,ev).push({type,target:seed.target||items()[0]?.name||'',prop:seed.prop||'textContent',value:type==='delay'?'1000':type==='repeat'?'3':'',left:type==='while'?'true':'true',op:'==',right:'',body:[],elseBody:[]});render();sync()}
 addEventListener('DOMContentLoaded',()=>{let tb=$('#blocksToolbar');if(tb&&!$('#blockUndo')){let u=document.createElement('button');u.id='blockUndo';u.textContent='↶ Desfazer';u.onclick=undoBlocks;tb.append(u);let v=document.createElement('button');v.id='blockValidate';v.textContent='✓ Validar';v.onclick=()=>{let a=validate();alert(a.length?a.join('\n'):'Blocos válidos.')};tb.append(v);let z=document.createElement('button');z.id='blockZoomOut';z.textContent='−';z.title='Diminuir blocos';let zi=document.createElement('button');zi.id='blockZoomIn';zi.textContent='＋';zi.title='Aumentar blocos';tb.append(z,zi);let scale=1;z.onclick=()=>{scale=Math.max(.65,scale-.1);$('#blockWorkspace').style.setProperty('--block-scale',scale)};zi.onclick=()=>{scale=Math.min(1.4,scale+.1);$('#blockWorkspace').style.setProperty('--block-scale',scale)}}
  document.addEventListener('keydown',e=>{if($('#blocksEditor')?.style.display!=='none'&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undoBlocks()}});
  $('#blockEvent')?.addEventListener('change',()=>render());let ws=$('#blockWorkspace');if(ws){ws.ondragover=e=>e.preventDefault();ws.ondrop=e=>{let raw=e.dataTransfer.getData('text/ff-block');if(!raw)return;try{let z=JSON.parse(raw);add(z.type,z)}catch(_){add(raw)}}}$('#blockClear')?.addEventListener('click',()=>{let x=selected(),ev=$('#blockEvent')?.value;if(x&&ev&&confirm('Limpar blocos deste evento?')){x.blocks[ev]=[];render();sync()}})});
 window.FlowForgeBlocks={render,sync,add,CAPS,validate};
})();