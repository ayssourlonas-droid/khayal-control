/* FlowForge WebStudio — Empacotar para Android.
 *
 * O FlowForge roda só no navegador e não consegue compilar um APK sozinho (isso exige o Android SDK).
 * Este módulo gera, no próprio navegador, um .zip com tudo pronto para virar APK:
 *   • capacitor — projeto Capacitor + workflow do GitHub Actions que compila o APK na nuvem;
 *   • pwa       — app web instalável (manifest, service worker, ícones) para o PWABuilder;
 *   • studio    — projeto Android Studio nativo (WebView) pronto para abrir e compilar.
 * Os modelos de texto vêm de js/ff-android-templates.js (gerado por tools/gerar_android_templates.py).
 * Sem dependências: inclui o seu próprio criador de .zip e o gerador de ícones (canvas). */
(function(){
'use strict';
const TPL=()=>window.FF_ANDROID_TPL||{};
const $=id=>document.getElementById(id);
const enc=new TextEncoder();

/* ---------------------------------------------------------------- ZIP (sem compressão) */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function toBytes(d){return typeof d==='string'?enc.encode(d):d}
/** files: [{path, data:string|Uint8Array}] → Uint8Array com um .zip válido (método "store"). */
function zip(files){
  const now=new Date(),dosT=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1),dosD=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
  const parts=[],central=[];let off=0;
  for(const f of files){
    const name=enc.encode(f.path),data=toBytes(f.data),crc=crc32(data);
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint16(10,dosT,true);lh.setUint16(12,dosD,true);
    lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,name.length,true);lh.setUint16(28,0,true);
    parts.push(new Uint8Array(lh.buffer),name,data);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,0x031E,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint16(12,dosT,true);ch.setUint16(14,dosD,true);
    ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,name.length,true);
    ch.setUint32(38,(0o100644<<16)>>>0,true);ch.setUint32(42,off,true);
    central.push(new Uint8Array(ch.buffer),name);
    off+=30+name.length+data.length;
  }
  const cdSize=central.reduce((a,b)=>a+b.length,0);
  const end=new DataView(new ArrayBuffer(22));
  end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cdSize,true);end.setUint32(16,off,true);
  const all=[...parts,...central,new Uint8Array(end.buffer)],out=new Uint8Array(off+cdSize+22);let p=0;
  for(const a of all){out.set(a,p);p+=a.length}
  return out;
}

/* ---------------------------------------------------------------- utilidades */
const JAVA_KW=new Set('abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while true false null'.split(' '));
function slugify(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'')}
function fileSlug(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'app'}
function defaultAppId(name){let seg=slugify(name)||'app';if(!/^[a-z]/.test(seg))seg='app'+seg;if(JAVA_KW.has(seg))seg+='app';return 'com.flowforge.'+seg}
function validAppId(id){return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(id)&&id.split('.').every(p=>!JAVA_KW.has(p))}
function cleanVersion(v){return String(v||'1.0.0').replace(/[^0-9A-Za-z.+\-]/g,'')||'1.0.0'}
function versionCodeOf(v){const m=String(v).match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);if(!m)return 1;return Math.max(1,Math.min(2100000000,(+m[1])*10000+(+(m[2]||0))*100+(+(m[3]||0))))}
function xmlEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,"\\'")}
function fill(t,map){return String(t).replace(/@@([A-Z_]+)@@/g,(m,k)=>Object.prototype.hasOwnProperty.call(map,k)?map[k]:m)}
const ORI={any:{android:'unspecified',pwa:'any',label:'automática (gira com o aparelho)'},portrait:{android:'portrait',pwa:'portrait',label:'somente retrato'},landscape:{android:'landscape',pwa:'landscape',label:'somente paisagem'}};
function themeColor(){const c=(window.project&&project.themeColor)||'#20242a';return /^#[0-9a-f]{6}$/i.test(c)?c:'#20242a'}
function projItems(){return ((window.project&&project.pages)||[]).flatMap(p=>p.items||[])}

/** Permissões que o app precisa, deduzidas dos componentes usados no projeto. */
function detect(){
  const it=projItems(),perms=['android.permission.INTERNET','android.permission.ACCESS_NETWORK_STATE'],features=[];
  const cams=it.filter(x=>x.kind==='camera'),geo=it.some(x=>x.kind==='geolocation');
  if(cams.length){perms.push('android.permission.CAMERA');features.push('android.hardware.camera','android.hardware.camera.autofocus');if(cams.some(x=>x.audio))perms.push('android.permission.RECORD_AUDIO')}
  if(geo){perms.push('android.permission.ACCESS_FINE_LOCATION','android.permission.ACCESS_COARSE_LOCATION');features.push('android.hardware.location.gps')}
  return{perms,features,camera:cams.length>0,mic:cams.some(x=>x.audio),geo};
}

/* ---------------------------------------------------------------- ícones */
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h||w;return c};
function loadImg(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('icon'));i.src=src})}
function shade(hex,k){const n=parseInt(hex.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return '#'+[f(n>>16&255),f(n>>8&255),f(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('')}
/** Ícone-base 512×512: a imagem do projeto (recortada) ou uma letra sobre a cor do tema. */
async function sourceIcon(){
  let ref='';try{ref=(window.resolveProjectImageRef?window.resolveProjectImageRef(project.icon):project.icon)||''}catch(e){}
  if(ref){try{
    const img=await loadImg(ref),c=mk(512),x=c.getContext('2d'),r=Math.max(512/img.width,512/img.height),w=img.width*r,h=img.height*r;
    x.drawImage(img,(512-w)/2,(512-h)/2,w,h);return{canvas:c,custom:true};
  }catch(e){}}
  const c=mk(512),x=c.getContext('2d'),t=themeColor(),g=x.createLinearGradient(0,0,512,512);
  g.addColorStop(0,shade(t,1.35));g.addColorStop(1,shade(t,.8));x.fillStyle=g;x.fillRect(0,0,512,512);
  const ch=(String((project&&project.name)||'A').match(/[A-Za-z0-9À-ÿ]/)||['A'])[0].toUpperCase();
  x.fillStyle='#fff';x.font='bold 300px system-ui,-apple-system,"Segoe UI",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(ch,256,282);
  return{canvas:c,custom:false};
}
function rr(x,s,r){x.beginPath();x.moveTo(r,0);x.arcTo(s,0,s,s,r);x.arcTo(s,s,0,s,r);x.arcTo(0,s,0,0,r);x.arcTo(0,0,s,0,r);x.closePath()}
function variant(src,kind,size){
  const c=mk(size),x=c.getContext('2d');x.imageSmoothingQuality='high';
  if(kind==='legacy'){rr(x,size,size*.2);x.clip();x.drawImage(src,0,0,size,size)}
  else if(kind==='round'){x.beginPath();x.arc(size/2,size/2,size/2,0,Math.PI*2);x.clip();x.drawImage(src,0,0,size,size)}
  else if(kind==='foreground'){const s=size*.6,o=(size-s)/2;x.save();x.translate(o,o);rr(x,s,s*.2);x.clip();x.drawImage(src,0,0,s,s);x.restore()}
  else if(kind==='maskable'){x.fillStyle=themeColor();x.fillRect(0,0,size,size);const s=size*.7,o=(size-s)/2;x.save();x.translate(o,o);rr(x,s,s*.2);x.clip();x.drawImage(src,0,0,s,s);x.restore()}
  else if(kind==='opaque'){x.fillStyle='#fff';x.fillRect(0,0,size,size);x.drawImage(src,0,0,size,size)}
  else x.drawImage(src,0,0,size,size);
  return c;
}
const png=c=>new Promise((ok,no)=>c.toBlob(b=>b?b.arrayBuffer().then(a=>ok(new Uint8Array(a))):no(new Error('png')),'image/png'));
const DENS={mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4};
/** Ícones do Android: legado (48dp), redondo e primeiro plano do ícone adaptativo (108dp). */
async function androidIcons(prefix){
  const s=await sourceIcon(),files=[];
  for(const[d,m]of Object.entries(DENS)){
    files.push({path:`${prefix}mipmap-${d}/ic_launcher.png`,data:await png(variant(s.canvas,'legacy',Math.round(48*m)))});
    files.push({path:`${prefix}mipmap-${d}/ic_launcher_round.png`,data:await png(variant(s.canvas,'round',Math.round(48*m)))});
    files.push({path:`${prefix}mipmap-${d}/ic_launcher_foreground.png`,data:await png(variant(s.canvas,'foreground',Math.round(108*m)))});
  }
  const adaptive=fill(TPL()['studio/adaptive-icon.xml'],{});
  files.push({path:`${prefix}mipmap-anydpi-v26/ic_launcher.xml`,data:adaptive},{path:`${prefix}mipmap-anydpi-v26/ic_launcher_round.xml`,data:adaptive});
  return{files,store:await png(variant(s.canvas,'legacy',512)),custom:s.custom};
}

/* ---------------------------------------------------------------- configuração e pacotes */
function readHtml(){
  if(typeof buildExportHtml==='function')return buildExportHtml();
  const raw=generated();return window.FlowForgeImageAssets?.resolveHtml?.(raw)??raw;
}
function normalize(o){
  const p=window.project||{},name=String(o.name||p.name||'Meu App').trim()||'Meu App',appId=String(o.appId||defaultAppId(name)).trim();
  const version=cleanVersion(o.version||p.projectVersion),code=Math.max(1,Math.min(2100000000,parseInt(o.versionCode,10)||versionCodeOf(version)));
  const ori=ORI[o.orientation]?o.orientation:'any',d=detect();
  return{name,appId,version,code,orientation:ori,fullscreen:!!o.fullscreen,color:themeColor(),perms:d.perms,features:d.features,det:d,slug:fileSlug(name)};
}
function baseMap(c){
  const permsXml=c.perms.map(p=>`    <uses-permission android:name="${p}" />`).join('\n')+'\n'+c.features.map(f=>`    <uses-feature android:name="${f}" android:required="false" />`).join('\n')+(c.features.length?'\n':'');
  return{APP_ID:c.appId,APP_NAME:c.name,APP_NAME_XML:xmlEsc(c.name),APP_NAME_JSON:JSON.stringify(c.name).slice(1,-1),APP_NAME_JS:String(c.name).replace(/[\r\n*\/]/g,' '),
    VERSION_NAME:c.version,VERSION_CODE:String(c.code),ORIENTATION:ORI[c.orientation].android,ORIENTATION_LABEL:ORI[c.orientation].label,
    FULLSCREEN:c.fullscreen?'true':'false',FULLSCREEN_LABEL:c.fullscreen?'ativada':'desativada',THEME_COLOR:c.color,SLUG:c.slug,
    GRADLE_NAME:String(c.name).replace(/["\\$\r\n]/g,''),PERMISSIONS_XML:permsXml,PERMISSIONS_LIST:c.perms.map(p=>'`'+p.replace('android.permission.','')+'`').join(', '),
    GEN_DATE:new Date().toLocaleDateString('pt-BR')};
}
const T=k=>{const v=TPL()[k];if(v==null)throw new Error('Modelo ausente: '+k);return v};

async function buildCapacitor(c,html){
  const map=baseMap(c),ic=await androidIcons('resources/android/res/');
  const config={appId:c.appId,appName:c.name,webDir:'www',backgroundColor:'#ffffff',server:{androidScheme:'https'},android:{allowMixedContent:false},
    plugins:{SystemBars:{insetsHandling:'native',hidden:c.fullscreen}}};
  const prep={appId:c.appId,appName:c.name,versionName:c.version,versionCode:c.code,orientation:ORI[c.orientation].android,fullscreen:c.fullscreen,themeColor:c.color,permissions:c.perms,features:c.features};
  return[
    {path:'LEIA-ME.md',data:fill(T('cap/LEIA-ME.md'),map)},
    {path:'package.json',data:fill(T('cap/package.json'),map)},
    {path:'capacitor.config.json',data:JSON.stringify(config,null,2)+'\n'},
    {path:'.gitignore',data:T('cap/gitignore')},
    {path:'.github/workflows/build-apk.yml',data:T('cap/build-apk.yml')},
    {path:'scripts/prepare-android.js',data:T('cap/prepare-android.js')},
    {path:'scripts/signing.init.gradle',data:T('cap/signing.init.gradle')},
    {path:'www/index.html',data:html},
    {path:'resources/android/config.json',data:JSON.stringify(prep,null,2)+'\n'},
    {path:'resources/android/res/values/ic_launcher_background.xml',data:`<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${c.color}</color>\n</resources>\n`},
    ...ic.files,
    {path:'resources/icon-512.png',data:ic.store},
  ];
}
async function buildStudio(c,html){
  const map=baseMap(c),ic=await androidIcons('app/src/main/res/'),pkgPath=c.appId.replace(/\./g,'/');
  return[
    {path:'LEIA-ME.md',data:fill(T('studio/LEIA-ME.md'),map)},
    {path:'settings.gradle',data:fill(T('studio/settings.gradle'),map)},
    {path:'build.gradle',data:T('studio/build.gradle')},
    {path:'gradle.properties',data:T('studio/gradle.properties')},
    {path:'gradle/wrapper/gradle-wrapper.properties',data:T('studio/gradle-wrapper.properties')},
    {path:'.gitignore',data:T('studio/gitignore')},
    {path:'.github/workflows/build-apk.yml',data:T('studio/build-apk.yml')},
    {path:'app/build.gradle',data:fill(T('studio/app.build.gradle'),map)},
    {path:'app/proguard-rules.pro',data:T('studio/proguard-rules.pro')},
    {path:'app/src/main/AndroidManifest.xml',data:fill(T('studio/AndroidManifest.xml'),map)},
    {path:`app/src/main/java/${pkgPath}/MainActivity.java`,data:fill(T('studio/MainActivity.java'),map)},
    {path:'app/src/main/assets/www/index.html',data:html},
    {path:'app/src/main/res/values/strings.xml',data:`<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">${map.APP_NAME_XML}</string>\n</resources>\n`},
    {path:'app/src/main/res/values/colors.xml',data:`<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ff_theme_color">${c.color}</color>\n    <color name="ic_launcher_background">${c.color}</color>\n</resources>\n`},
    {path:'app/src/main/res/values/styles.xml',data:T('studio/styles.xml')},
    ...ic.files,
    {path:'store/icon-512.png',data:ic.store},
  ];
}
async function buildPwa(c,html){
  const map=baseMap(c),s=await sourceIcon();
  const icons={'icons/icon-192.png':variant(s.canvas,'plain',192),'icons/icon-512.png':variant(s.canvas,'plain',512),'icons/maskable-512.png':variant(s.canvas,'maskable',512),'icons/apple-touch-icon.png':variant(s.canvas,'opaque',180)};
  const files=[];for(const[p,cv]of Object.entries(icons))files.push({path:p,data:await png(cv)});
  const manifest={name:c.name,short_name:Array.from(c.name).slice(0,12).join(''),description:(window.project&&project.description)||c.name,id:'./',start_url:'./index.html',scope:'./',
    display:c.fullscreen?'fullscreen':'standalone',orientation:ORI[c.orientation].pwa,theme_color:c.color,background_color:'#ffffff',lang:'pt-BR',
    icons:[{src:'icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},{src:'icons/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]};
  let h=html.replace(/<link rel="apple-touch-icon"[^>]*>\s*/g,'').replace(/<link rel="icon" sizes="192x192"[^>]*>\s*/g,'');
  const head='<link rel="manifest" href="manifest.webmanifest">\n  <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n  <link rel="icon" sizes="192x192" type="image/png" href="icons/icon-192.png">';
  h=/<meta charset="utf-8">/i.test(h)?h.replace(/<meta charset="utf-8">/i,m=>m+'\n  '+head):h.replace(/<head>/i,m=>m+'\n  '+head);
  const reg="<script>if('serviceWorker' in navigator){addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}</script>\n";
  const i=h.lastIndexOf('</body>');h=i>=0?h.slice(0,i)+reg+h.slice(i):h+reg;
  return[
    {path:'LEIA-ME.md',data:fill(T('pwa/LEIA-ME.md'),map)},
    {path:'index.html',data:h},
    {path:'manifest.webmanifest',data:JSON.stringify(manifest,null,2)+'\n'},
    {path:'sw.js',data:fill(T('pwa/sw.js'),map)},
    ...files,
  ];
}
const FORMATS={
  capacitor:{suffix:'capacitor-android',build:buildCapacitor},
  pwa:{suffix:'pwa',build:buildPwa},
  studio:{suffix:'android-studio',build:buildStudio},
};
/** Gera o pacote e devolve {name, bytes, files, config}. */
async function build(format,opts){
  const f=FORMATS[format];if(!f)throw new Error('Formato desconhecido: '+format);
  const c=normalize(opts||{});
  if(format!=='pwa'&&!validAppId(c.appId))throw new Error('ID do pacote inválido: '+c.appId);
  const files=await f.build(c,readHtml());
  return{name:`${c.slug}-${f.suffix}.zip`,bytes:zip(files),files:files.map(x=>x.path),config:c};
}
function save(name,bytes){
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes],{type:'application/zip'}));a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}

/* ---------------------------------------------------------------- diálogo */
const FMT_INFO=[
  ['capacitor','Capacitor + build na nuvem','Projeto Capacitor com um workflow do GitHub Actions que compila o APK sozinho. Não precisa instalar nada.'],
  ['pwa','PWA + PWABuilder','App web instalável (manifest, service worker, ícones). Gere o APK/AAB no pwabuilder.com. Precisa de hospedagem HTTPS.'],
  ['studio','Projeto Android Studio','Projeto Android nativo (WebView) para abrir no Android Studio e compilar no seu computador.'],
];
function dialogHtml(){
  return `<form method="dialog" class="saveProjectForm"><h2>Empacotar para Android</h2>
<p class="exampleIntro">O FlowForge gera um pacote (.zip) pronto para virar APK. A compilação em si acontece no GitHub, no PWABuilder ou no Android Studio, conforme o formato escolhido.</p>
<div class="saveGrid ffAndGrid">
<fieldset class="ffAndFormats">${FMT_INFO.map((f,i)=>`<label class="ffAndFmt"><input type="radio" name="andFormat" value="${f[0]}"${i?'':' checked'}><span><b>${f[1]}</b><small>${f[2]}</small></span></label>`).join('')}</fieldset>
<label>Nome do app<input id="andName" type="text" spellcheck="false" autocomplete="off"></label>
<label>ID do pacote<input id="andId" type="text" spellcheck="false" autocomplete="off"></label>
<label>Versão<input id="andVer" type="text" spellcheck="false" autocomplete="off"></label>
<label>Código da versão<input id="andCode" type="number" min="1" step="1"></label>
<label>Orientação<select id="andOri"><option value="any">Automática</option><option value="portrait">Retrato</option><option value="landscape">Paisagem</option></select></label>
<label class="check ffAndFull"><input id="andFull" type="checkbox"> Tela cheia (oculta as barras do sistema)</label>
<div id="andInfo" class="ffAndInfo"></div>
<div id="andWarn" class="ffAndWarn" hidden></div>
<div id="andStatus" class="ffAndStatus" role="status"></div>
</div>
<div class="saveActions"><button value="cancel">Fechar</button><button id="andGo" type="button">Gerar pacote (.zip)</button></div></form>`;
}
function ensureDialog(){
  let dlg=$('androidDlg');if(dlg)return dlg;
  dlg=document.createElement('dialog');dlg.id='androidDlg';dlg.innerHTML=dialogHtml();document.body.appendChild(dlg);
  dlg.querySelector('#andName').addEventListener('input',()=>{const id=$('andId');if(!id.dataset.touched)id.value=defaultAppId($('andName').value);refresh()});
  dlg.querySelector('#andId').addEventListener('input',e=>{e.target.dataset.touched='1';refresh()});
  dlg.querySelector('#andVer').addEventListener('input',()=>{const c=$('andCode');if(!c.dataset.touched)c.value=versionCodeOf($('andVer').value)});
  dlg.querySelector('#andCode').addEventListener('input',e=>{e.target.dataset.touched='1'});
  dlg.querySelectorAll('input[name=andFormat]').forEach(r=>r.addEventListener('change',refresh));
  dlg.querySelector('#andGo').onclick=generate;
  if(window.FlowForgeUIText&&FlowForgeUIText.refresh)try{FlowForgeUIText.refresh()}catch(e){}
  return dlg;
}
const fmtNow=()=>(document.querySelector('input[name=andFormat]:checked')||{value:'capacitor'}).value;
function tr(){const d=$('androidDlg');if(window.FlowForgeUIText&&FlowForgeUIText.refresh)try{FlowForgeUIText.refresh(d)}catch(e){try{FlowForgeUIText.refresh()}catch(_){}}}
function refresh(){
  const d=detect(),fmt=fmtNow(),ok=fmt==='pwa'||validAppId($('andId').value.trim());
  $('andId').style.borderColor=ok?'':'#e5484d';$('andId').title=ok?'':'Use letras minúsculas, números e pontos, por exemplo com.empresa.app';
  const names=d.perms.map(p=>p.replace('android.permission.','')).join(', ');
  const hasIcon=!!(window.project&&project.icon);
  $('andInfo').innerHTML=`<div><b>Permissões</b>: <code>${names}</code></div><div><b>Ícone</b>: <span data-ffi="${hasIcon?'icon':'noicon'}">${hasIcon?'ícone do projeto':'gerado automaticamente a partir do nome'}</span></div>`;
  const warn=$('andWarn'),fw=(window.project&&project.framework)||'none';
  warn.hidden=fw==='none';warn.textContent=fw==='none'?'':'Este projeto usa um framework CSS carregado por CDN: o app precisa de internet.';
  $('andId').disabled=false;$('andId').closest('label').style.opacity=fmt==='pwa'?.7:1;
  $('andGo').disabled=!ok;tr();
}
function openDialog(){
  if(typeof saveEventBodiesFromEditor==='function')try{saveEventBodiesFromEditor()}catch(e){}
  const dlg=ensureDialog(),p=project,a=p.android||{};
  $('andName').value=p.name||'Meu App';
  $('andId').value=a.appId||defaultAppId(p.name);$('andId').dataset.touched=a.appId?'1':'';
  $('andVer').value=p.projectVersion||'1.0.0';
  {const vc=versionCodeOf(p.projectVersion||'1.0.0');$('andCode').value=a.versionCode||vc;$('andCode').dataset.touched=(a.versionCode&&a.versionCode!==vc)?'1':''}
  $('andOri').value=a.orientation||'any';$('andFull').checked=!!a.fullscreen;
  const r=dlg.querySelector(`input[name=andFormat][value="${a.format||'capacitor'}"]`);if(r)r.checked=true;
  $('andStatus').textContent='';refresh();
  if(!dlg.open)dlg.showModal();
}
async function generate(){
  const btn=$('andGo'),st=$('andStatus'),fmt=fmtNow();
  const o={name:$('andName').value,appId:$('andId').value.trim(),version:$('andVer').value,versionCode:$('andCode').value,orientation:$('andOri').value,fullscreen:$('andFull').checked};
  btn.disabled=true;st.innerHTML='<span data-ffi="busy">Gerando o pacote…</span>';
  try{
    const r=await build(fmt,o);
    project.android={format:fmt,appId:o.appId,versionCode:parseInt(o.versionCode,10)||r.config.code,orientation:o.orientation,fullscreen:o.fullscreen};
    save(r.name,r.bytes);
    st.innerHTML=`<span data-ffi="done">Pacote gerado:</span> <b></b> <small></small>`;st.querySelector('b').textContent=r.name;st.querySelector('small').textContent=`(${(r.bytes.length/1024).toFixed(0)} KB · ${r.files.length} arquivos)`;tr();
  }catch(e){st.textContent='';const s=document.createElement('span');s.className='ffAndErr';s.textContent=(e&&e.message)||String(e);st.appendChild(s)}
  btn.disabled=false;refresh();
}
/* Menu "Exportar": HTML (sempre) e Android/APK (só em projetos do tipo App mobile). */
const isApp=()=>!!(window.project&&project.type==='app');
function menuState(){
  const m=$('exportMenu'),b=$('exportMenuBtn'),a=$('androidBtn'),l=$('exportMenuList');if(!m||!b||!a||!l)return false;
  const app=isApp();a.hidden=!app;m.classList.toggle('single',!app);
  if(!app){l.hidden=true;b.setAttribute('aria-expanded','false');b.title='Exportar HTML'}else b.title='';
  return app;
}
function closeMenu(){const l=$('exportMenuList'),b=$('exportMenuBtn');if(l&&!l.hidden){l.hidden=true;b.setAttribute('aria-expanded','false')}}
function boot(){
  const m=$('exportMenu'),b=$('exportMenuBtn'),a=$('androidBtn'),l=$('exportMenuList'),h=$('exportBtn');
  if(!m||!b||!a||!l||b.__ffMenu)return;b.__ffMenu=true;
  b.addEventListener('click',e=>{
    e.stopPropagation();
    if(!menuState()){h.click();return}              // sem opção de APK: o botão já exporta o HTML direto
    const open=l.hidden;l.hidden=!open;b.setAttribute('aria-expanded',String(open));
    if(open){const r=b.getBoundingClientRect();l.style.top=Math.round(r.bottom+4)+'px';l.style.left=Math.round(Math.min(r.left,innerWidth-l.offsetWidth-8))+'px'}
  });
  l.addEventListener('click',()=>closeMenu());      // qualquer item fecha o menu (o clique continua até o item)
  a.addEventListener('click',openDialog);
  document.addEventListener('click',e=>{if(!m.contains(e.target))closeMenu()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu()}});
  addEventListener('resize',closeMenu);
  const pt=$('projectType');if(pt)pt.addEventListener('change',()=>setTimeout(menuState,0));
  menuState();setInterval(menuState,700);           // acompanha troca de projeto (Novo, Abrir, exemplos)
}
window.FlowForgeAndroid={build,zip,crc32,detect,defaultAppId,validAppId,versionCodeOf,sourceIcon,open:openDialog,normalize};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
