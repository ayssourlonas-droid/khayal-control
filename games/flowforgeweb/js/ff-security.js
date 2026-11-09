/* FlowForge WebStudio — utilitários de segurança.
 * Escapes por contexto, validação de identificadores e normalização de
 * projetos importados (.flowmobile). Nada aqui altera projetos internos:
 * os dados só passam por validateProject() na abertura de arquivos.
 */
(function(){
  'use strict';

  const HTML_ESCAPES={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,c=>HTML_ESCAPES[c]);
  }

  function jsonEscape(value){
    return JSON.stringify(value===undefined?null:value)
      .replace(/</g,'\\u003c')
      .replace(/>/g,'\\u003e')
      .replace(/\u2028/g,'\\u2028')
      .replace(/\u2029/g,'\\u2029');
  }

  // Expressão JS segura para atributos inline (onclick="..."), após o
  // navegador decodificar as entidades HTML.
  function jsAttr(value){return escapeHtml(jsonEscape(value))}

  // JSON embutido em <script> sem permitir fechar a tag.
  function scriptJson(value){return jsonEscape(value)}

  // Corpo de script gerado a partir de código do usuário.
  function scriptBody(value){
    return String(value??'')
      .replace(/<\/(script)/gi,'<\\/$1')
      .replace(/<!--/g,'<\\!--');
  }

  const RESERVED=new Set(('break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum implements interface package private protected public static await null true false '+
    'window document globalThis top parent self location history navigator localStorage sessionStorage indexedDB console fetch event project selected params name status origin frames length close open print alert confirm prompt undefined NaN Infinity '+
    'FlowForgeComponent FlowForgeUI FlowForgeNavigate FlowForgeCamera FlowForgeTimer FlowForgeProgress FlowForgeSound FlowForgeChart FlowForgeQRCode Sons http db').split(/\s+/));
  const IDENT_RE=/^[A-Za-z_$][\w$]*$/;
  // Eventos nativos são minúsculos, mas componentes de jogo usam camelCase
  // (gameStart, animationEnd). O nome vira sufixo de função, então só letras
  // ASCII e dígitos são aceitos.
  const EVENT_RE=/^[a-z][a-zA-Z0-9]{0,40}$/;

  function sanitizeIdentifier(value,fallback='component'){
    let s=String(value??'').trim().replace(/[^A-Za-z0-9_$]+/g,'_').replace(/^[^A-Za-z_$]+/,'').slice(0,60);
    if(!s)s=String(fallback||'component').replace(/[^A-Za-z0-9_$]+/g,'_').replace(/^[^A-Za-z_$]+/,'')||'component';
    if(!IDENT_RE.test(s))s='ff_'+s;
    if(RESERVED.has(s))s='ff_'+s;
    return s;
  }

  function isEventName(value){
    const s=String(value??'');
    return EVENT_RE.test(s)&&!['__proto__','constructor','prototype'].includes(s);
  }

  function safeColor(value,fallback=''){
    const s=String(value??'').trim();
    if(/^#[0-9a-f]{3,8}$/i.test(s))return s;
    if(/^[a-z]{3,24}$/i.test(s)&&!/^(url|expression|javascript)$/i.test(s))return s;
    if(/^(?:rgb|rgba|hsl|hsla)\(\s*[-+.\d%,\s/]+\)$/i.test(s))return s;
    return fallback;
  }

  function safeCssSize(value,fallback=''){
    const s=String(value??'').trim();
    if(!s)return fallback;
    if(s.length>80)return fallback;
    if(/^(?:-?\d+(?:\.\d+)?)(?:px|%|vh|vw|rem|em|pt)?$/i.test(s))return s;
    if(s==='auto')return s;
    if(/^calc\([-\d.%\s+*/(),a-z]+\)$/i.test(s))return s;
    return fallback;
  }

  function safeNumber(value,fallback=0,min=-Infinity,max=Infinity){
    const n=Number(value);
    if(!Number.isFinite(n))return fallback;
    return Math.max(min,Math.min(max,n));
  }

  function safeFit(value){return ['cover','contain','fill','none','scale-down'].includes(String(value))?String(value):'contain'}
  function safeAlign(value){return ['left','center','right','justify','start','end'].includes(String(value))?String(value):'left'}

  function safeFontFamily(value){
    const s=String(value??'').trim().slice(0,120);
    if(!s)return '';
    if(/[<>;{}\\]/.test(s)||/url\s*\(|expression|javascript:/i.test(s))return '';
    return s;
  }

  function safeHref(value){
    const s=String(value??'').trim();
    if(!s)return '';
    if(/^(?:https?:|mailto:|tel:)/i.test(s))return s;
    if(/^asset:\/\/[A-Za-z0-9._-]+$/.test(s))return s;
    if(/^(?:#|\/|\.\/|\.\.\/)/.test(s))return s;
    if(!/^[a-z][a-z0-9+.-]*:/i.test(s))return s;
    return '';
  }

  function safeMediaUrl(value){
    const s=String(value??'').trim();
    if(!s)return '';
    if(/^asset:\/\/[A-Za-z0-9._-]+$/.test(s))return s;
    if(/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml|avif|bmp|x-icon);base64,[a-z0-9+/=\s]+$/i.test(s))return s;
    if(/^data:(?:audio|video)\/[\w.+-]+;base64,[a-z0-9+/=\s]+$/i.test(s))return s;
    if(/^blob:/i.test(s))return s;
    if(/^https?:\/\//i.test(s))return s;
    if(/^\/\//.test(s))return 'https:'+s;
    if(!/^[a-z][a-z0-9+.-]*:/i.test(s))return s;
    return '';
  }

  function safeFrameUrl(value){
    const s=String(value??'').trim();
    if(!s||s==='about:blank')return s;
    if(/^https?:\/\//i.test(s))return s;
    if(/^(?:\.\/|\.\.\/|\/)[^"<>]*$/.test(s))return s;
    return '';
  }

  function safeSlug(value,fallback='pagina'){
    return String(value??'').trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||fallback;
  }

  function safeId(value,prefix='id'){
    const s=String(value??'');
    if(/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(s))return s;
    return String(prefix||'id').replace(/[^A-Za-z0-9_-]+/g,'')+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
  }

  const ALLOWED_TAGS=new Set(['a','abbr','b','blockquote','br','code','div','em','font','h1','h2','h3','h4','h5','h6','hr','i','li','ol','p','pre','s','small','span','strong','sub','sup','u','ul']);
  const ALLOWED_ATTR=new Set(['href','title','target','rel','style','class','src','alt','width','height','color','size','face']);
  const ALLOWED_STYLE=new Set(['color','background-color','font-family','font-size','font-weight','font-style','text-decoration','text-align','line-height','letter-spacing','white-space','vertical-align']);
  function sanitizeStyle(value){
    return String(value??'').split(';').map(part=>{
      const i=part.indexOf(':');
      if(i<0)return '';
      const prop=part.slice(0,i).trim().toLowerCase();
      const val=part.slice(i+1).trim();
      if(!ALLOWED_STYLE.has(prop)||!val||val.length>200)return '';
      if(/[<>;\\]|url\s*\(|expression|@import|javascript:/i.test(val))return '';
      return prop+':'+val;
    }).filter(Boolean).join(';');
  }
  function sanitizeHtml(value){
    const tpl=document.createElement('template');
    tpl.innerHTML=String(value??'');
    const walk=node=>{
      [...node.childNodes].forEach(child=>{
        if(child.nodeType===8){child.remove();return}
        if(child.nodeType!==1)return;
        const tag=child.tagName.toLowerCase();
        if(!ALLOWED_TAGS.has(tag)){child.remove();return}
        [...child.attributes].forEach(attr=>{
          const name=attr.name.toLowerCase();
          const val=attr.value;
          if(name.startsWith('on')||!ALLOWED_ATTR.has(name)){child.removeAttribute(attr.name);return}
          if(name==='style'){const css=sanitizeStyle(val);if(css)child.setAttribute('style',css);else child.removeAttribute('style')}
          else if(name==='href'){const href=safeHref(val);if(href)child.setAttribute('href',href);else child.removeAttribute('href')}
          else if(name==='src'){const src=safeMediaUrl(val);if(src)child.setAttribute('src',src);else child.removeAttribute('src')}
          else if(name==='target'){if(val!=='_blank'&&val!=='_self')child.removeAttribute('target');else if(val==='_blank')child.setAttribute('rel','noopener noreferrer')}
          else if(name==='class'){child.setAttribute('class',val.replace(/[^\w\s-]/g,'').slice(0,200))}
          else if(name==='width'||name==='height'){if(!/^\d{1,4}$/.test(val))child.removeAttribute('width'),child.removeAttribute('height')}
          else if(name==='face'){const face=safeFontFamily(val);if(face)child.setAttribute('face',face);else child.removeAttribute('face')}
          else if(name==='color'){const color=safeColor(val);if(color)child.setAttribute('color',color);else child.removeAttribute('color')}
          else if(name==='size'){if(!/^[1-7]$/.test(val))child.removeAttribute('size')}
          else if(name==='title'||name==='alt'){
            if(val.length>500)child.setAttribute(name,val.slice(0,500));
          }
        });
        walk(child);
      });
    };
    walk(tpl.content);
    return tpl.innerHTML;
  }

  const FRAMEWORKS=new Set(['none','bootstrap','bulma','pico','tailwind','materialize','foundation','uikit','semantic']);
  const EVENT_KEYS=new Set(['click','dblclick','mousedown','mouseup','mouseenter','mouseleave','focus','blur','input','change','submit','reset','keydown','keyup','load','error','play','pause','ended','timeupdate','volumechange','camerastart','camerastop','cameraerror','tick','start','stop','request','response','open','message','close','online','offline','complete','toggle','action','send','save','copy','select','search',
    // Jogos
    'gameStart','gameUpdate','gameOver','animationStart','animationEnd','frame','collision','enter','leave','connected','disconnected','buttondown','buttonup','axis','move','end','empty','show','hide','reset','score','damage','heal']);
  const EVENT_CANON=new Map([...EVENT_KEYS].map(k=>[k.toLowerCase(),k]));
  const NUMBER_KEYS=new Set(['x','y','value','min','max','step','interval','fontSize','borderRadius','qrcodeSize','mapLat','mapLng','mapZoom','volume','activeTab','activeIndex','pageSize','maxLength','gap','rows','lines','lineWidth',
    'fps','canvasWidth','canvasHeight','frameWidth','frameHeight','frames','frame','rotation','vx','vy','index','deadZone','timeout','maximumAge']);
  const COLOR_KEYS=new Set(['bg','color','barColor','canvasBackground','themeColor','knobColor','penColor']);
  const MEDIA_KEYS=new Set(['src','poster','icon']);
  const FRAME_KEYS=new Set(['iframeUrl']);
  const HREF_KEYS=new Set(['href']);
  const MAX_EVENTS=24,MAX_TEXT=200000,MAX_CODE=200000,MAX_ITEMS=1000,MAX_PAGES=60,MAX_ASSETS=120,MAX_ASSET_DATA=16*1024*1024;
  const MAX_TOTAL_ASSET_DATA=48*1024*1024;

  function cap(value,max){
    const s=String(value??'');
    return s.length>max?s.slice(0,max):s;
  }

  function normalizeAssets(list){
    const out=[],map=new Map(),used=new Set();
    let total=0;
    if(!Array.isArray(list))return {assets:out,map};
    for(const a of list){
      if(out.length>=MAX_ASSETS||!a||typeof a!=='object')continue;
      const data=String(a.data||'');
      if(!/^data:[a-z0-9.+-]+\/[a-z0-9.+-]+(?:;[a-z0-9=.+-]+)*;base64,[a-z0-9+/=\s]+$/i.test(data))continue;
      if(data.length>MAX_ASSET_DATA||(total+=data.length)>MAX_TOTAL_ASSET_DATA)continue;
      const oldId=String(a.id??'');
      let id=safeId(oldId,'asset');
      while(used.has(id))id=safeId('','asset');
      if(oldId)map.set(oldId,id);
      used.add(id);
      out.push({id,name:cap(a.name,200)||id,type:cap(a.type,100),size:safeNumber(a.size,data.length,0,MAX_ASSET_DATA),data});
    }
    return {assets:out,map};
  }

  function normalizeEvents(raw){
    const events={};
    if(!raw||typeof raw!=='object')return events;
    Object.keys(raw).slice(0,60).forEach(key=>{
      // Mantém a grafia canônica (gameStart, animationEnd) para que o nome da
      // função do handler e o evento do runtime continuem iguais.
      const ev=EVENT_CANON.get(String(key).toLowerCase());
      if(!ev||!isEventName(ev))return;
      if(Object.keys(events).length>=MAX_EVENTS)return;
      const body=raw[key];
      if(typeof body!=='string')return;
      events[ev]=cap(body,MAX_CODE);
    });
    return events;
  }

  function normalizeItem(raw,index,kindFallback,usedIds,usedNames,assetMap,assetIds){
    const src=(raw&&typeof raw==='object')?raw:{};
    const item={...src};
    delete item.__proto__;delete item.constructor;delete item.prototype;
    item.id=safeId(src.id,'item');
    let n=2;
    while(usedIds.has(item.id))item.id=safeId('','item')+(n++);
    usedIds.add(item.id);
    item.kind=cap(src.kind,40).replace(/[^a-z0-9]/gi,'')||kindFallback||'label';
    if(item.kind==='fileupload')item.kind='file';
    let name=sanitizeIdentifier(src.name||item.kind,item.kind);
    let candidate=name,count=2;
    while(usedNames.has(candidate))candidate=name+'_'+(count++);
    usedNames.add(candidate);
    item.name=candidate;
    item.x=safeNumber(src.x,0,-20000,20000);
    item.y=safeNumber(src.y,0,-20000,20000);
    item.width=typeof src.width==='number'?safeNumber(src.width,140,1,10000)+'px':safeCssSize(src.width,'140px');
    item.height=typeof src.height==='number'?safeNumber(src.height,50,1,10000)+'px':safeCssSize(src.height,'50px');
    if(src.dock!==undefined)item.dock=['none','top','bottom','left','right','fill'].includes(src.dock)?src.dock:'none';
    if(src.textAlign!==undefined)item.textAlign=safeAlign(src.textAlign);
    if(src.fit!==undefined)item.fit=safeFit(src.fit);
    COLOR_KEYS.forEach(k=>{if(k in item&&item[k]!==undefined)item[k]=safeColor(item[k],k==='bg'?'#ffffff':k==='penColor'?'#111827':'#222222')});
    if(item.fontFamily!==undefined)item.fontFamily=safeFontFamily(item.fontFamily);
    if(item.fontSize!==undefined)item.fontSize=safeNumber(item.fontSize,16,6,200);
    if(item.borderRadius!==undefined)item.borderRadius=safeNumber(item.borderRadius,0,0,2000);
    if(item.barColor!==undefined)item.barColor=safeColor(item.barColor,'#22c55e');
    if(item.canvasBackground!==undefined)item.canvasBackground=safeColor(item.canvasBackground,'#ffffff');
    if(item.interval!==undefined)item.interval=safeNumber(item.interval,1000,10,3600000);
    if(item.volume!==undefined)item.volume=safeNumber(item.volume,1,0,1);
    if(item.qrcodeSize!==undefined)item.qrcodeSize=safeNumber(item.qrcodeSize,160,64,2048);
    if(item.mapLat!==undefined)item.mapLat=safeNumber(item.mapLat,0,-90,90);
    if(item.mapLng!==undefined)item.mapLng=safeNumber(item.mapLng,0,-180,180);
    if(item.mapZoom!==undefined)item.mapZoom=safeNumber(item.mapZoom,13,1,20);
    MEDIA_KEYS.forEach(k=>{if(typeof item[k]==='string')item[k]=resolveAssetToken(safeMediaUrl(item[k]),assetMap,assetIds)});
    FRAME_KEYS.forEach(k=>{if(typeof item[k]==='string')item[k]=safeFrameUrl(item[k])});
    HREF_KEYS.forEach(k=>{if(typeof item[k]==='string')item[k]=safeHref(item[k])});
    if(typeof item.text==='string'){item.text=cap(item.text,MAX_TEXT);if(item.allowHtml)item.text=sanitizeHtml(item.text)}
    if(typeof item.textContent==='string')item.textContent=cap(item.textContent,5000);
    if(typeof item.placeholder==='string')item.placeholder=cap(item.placeholder,500);
    if(typeof item.alt==='string')item.alt=cap(item.alt,500);
    if(typeof item.description==='string')item.description=cap(item.description,5000);
    if(typeof item.actionText==='string')item.actionText=cap(item.actionText,200);
    if(typeof item.sendText==='string')item.sendText=cap(item.sendText,200);
    if(typeof item.code==='string')item.code=cap(item.code,MAX_CODE);
    else if(item.code&&typeof item.code==='object'){try{item.code=cap(JSON.stringify(item.code),MAX_CODE)}catch(_){delete item.code}}
    if(item.language!==undefined){const l=String(item.language).toLowerCase();item.language=['javascript','typescript','html','css','json','text'].includes(l)?l:'text'}
    if(typeof item.content==='string')item.content=cap(item.content,20000);
    if(item.placement!==undefined)item.placement=['top','bottom','left','right'].includes(item.placement)?item.placement:'bottom';
    if(typeof item.showClear!=='undefined')item.showClear=!!item.showClear;
    if(typeof item.showCopy!=='undefined')item.showCopy=!!item.showCopy;
    if(typeof item.readOnly!=='undefined')item.readOnly=!!item.readOnly;
    if(item.lines!==undefined)item.lines=Math.max(1,Math.min(12,Math.trunc(safeNumber(item.lines,3,1,12))));
    if(item.lineWidth!==undefined)item.lineWidth=safeNumber(item.lineWidth,2,1,40);
    if(item.step!==undefined)item.step=safeNumber(item.step,1,-1000000,1000000);
    if(item.penColor!==undefined)item.penColor=safeColor(item.penColor,'#111827');
    if(item.activeIndex!==undefined)item.activeIndex=Math.max(0,Math.min(999,Math.trunc(safeNumber(item.activeIndex,0,0,999))||0));
    if(typeof item.multiple!=='undefined')item.multiple=!!item.multiple;
    if(typeof item.allowHtml!=='undefined')item.allowHtml=!!item.allowHtml;
    if(typeof item.visible!=='undefined')item.visible=!!item.visible;
    if(typeof item.enabled!=='undefined')item.enabled=!!item.enabled;
    if(Array.isArray(item.options))item.options=item.options.slice(0,500).map(v=>typeof v==='string'?cap(v,2000):v);
    if(Array.isArray(item.items))item.items=item.items.slice(0,500);
    if(typeof item.items==='string')item.items=cap(item.items,20000);
    if(item.kind==='chat'&&Array.isArray(item.items))item.items=item.items.slice(0,200).map(m=>{
      if(m&&typeof m==='object')return {from:String(m.from??m.role??'').toLowerCase()==='me'?'me':'them',text:cap(m.text??m.message??'',4000)};
      return {from:'them',text:cap(m,4000)};
    });
    if(['segmentedcontrol','dropdownmenu'].includes(item.kind)&&Array.isArray(item.items))item.items=item.items.slice(0,24).map(v=>{
      const label=typeof v==='object'&&v?(v.label??v.text??v.value??''):(v==null?'':v);
      return cap(String(label),120).trim();
    }).filter(Boolean);
    if(item.tabs!==undefined){
      if(Array.isArray(item.tabs))item.tabs=item.tabs.slice(0,24).map(t=>typeof t==='string'?cap(t,2000):(t&&typeof t==='object'?{label:cap(t.label??t.title??t.name??'',80),content:cap(t.content??t.text??'',4000)}:null)).filter(Boolean);
      else if(typeof item.tabs==='string')item.tabs=cap(item.tabs,20000);
      else delete item.tabs;
    }
    if(item.activeTab!==undefined)item.activeTab=Math.max(0,Math.min(999,Math.trunc(safeNumber(item.activeTab,0,0,999))||0));
    if(typeof item.events!=='object'||!item.events)item.events={};
    else item.events=normalizeEvents(item.events);
    Object.keys(item).forEach(k=>{
      if(['id','kind','name','x','y','width','height','dock','textAlign','fit','bg','color','fontFamily','fontSize','borderRadius','barColor','canvasBackground','interval','volume','qrcodeSize','mapLat','mapLng','mapZoom','src','poster','iframeUrl','href','text','textContent','placeholder','alt','allowHtml','visible','enabled','options','items','events'].includes(k))return;
      if(NUMBER_KEYS.has(k)&&typeof item[k]!=='number')item[k]=safeNumber(item[k],0,-1000000,1000000);
    });
    item.__oldId=String(src.id??'');
    item.__oldParent=typeof src.parentId==='string'?src.parentId:null;
    item.__oldTarget=typeof src.targetPage==='string'?src.targetPage:null;
    item.__oldAsset=typeof src.assetId==='string'?src.assetId:null;
    return item;
  }

  function resolveAssetToken(value,assetMap,assetIds){
    const s=String(value??'');
    if(!s.startsWith('asset://'))return s;
    const old=s.slice(8);
    const id=assetMap.get(old)||old;
    return assetIds.has(id)?'asset://'+id:'';
  }

  function validateProject(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('O arquivo não contém um projeto JSON válido.');
    if(!Array.isArray(raw.pages)||!raw.pages.length)throw new Error('O projeto não possui páginas.');
    if(raw.pages.length>MAX_PAGES)throw new Error('O projeto excede o limite de '+MAX_PAGES+' páginas.');
    const assetPack=normalizeAssets(raw.assets);
    const assetIds=new Set(assetPack.assets.map(a=>a.id));
    const p={
      version:cap(raw.version,20)||'0.13.0',
      name:cap(raw.name,120)||'Projeto',
      projectVersion:cap(raw.projectVersion,40)||'1.0.0',
      type:['app','site','landing'].includes(raw.type)?raw.type:'app',
      framework:FRAMEWORKS.has(raw.framework)?raw.framework:'none',
      designerMode:raw.designerMode==='flowforge'?'flowforge':'framework',
      themeColor:safeColor(raw.themeColor,'#20242a'),
      titlebar:null,
      siteLayout:null,
      assets:assetPack.assets,
      pages:[],
      active:0,
      activePage:''
    };
    p.icon=resolveAssetToken(safeMediaUrl(raw.icon),assetPack.map,assetIds);
    p.favicon=resolveAssetToken(safeMediaUrl(raw.favicon),assetPack.map,assetIds);
    p.headerLogo=resolveAssetToken(safeMediaUrl(raw.headerLogo),assetPack.map,assetIds);
    // Layout do palco (Mobile/Tablet/Desktop/Livre) viaja no arquivo; sem isso o
    // projeto reaberto voltaria ao padrão do tipo e perderia o tamanho escolhido.
    const vp=raw.viewport&&typeof raw.viewport==='object'?raw.viewport:null;
    if(vp){
      const width=Math.round(Number(vp.width)),height=Math.round(Number(vp.height));
      if(Number.isFinite(width)&&width>=280&&width<=1440){
        p.viewport={
          width,
          height:Number.isFinite(height)&&height>=200&&height<=4000?height:undefined,
          device:['','390','768','1440'].includes(String(vp.device??''))?String(vp.device??''):''
        };
      }
    }

    const t=raw.titlebar&&typeof raw.titlebar==='object'?raw.titlebar:{};
    p.titlebar={
      name:sanitizeIdentifier(t.name||'titlebar1','titlebar1'),
      text:cap(t.text??p.name,200),
      height:typeof t.height==='number'?safeNumber(t.height,52,20,4000)+'px':safeCssSize(t.height,'52px'),
      bg:safeColor(t.bg,'#20242a'),
      color:safeColor(t.color,'#ffffff'),
      showMenu:t.showMenu!==false,
      autoStyle:t.autoStyle!==false
    };
    const layout=raw.siteLayout&&typeof raw.siteLayout==='object'?raw.siteLayout:null;
    const navFallback=p.type==='app'?'none':'navbar';
    p.siteLayout=layout?{
      header:layout.header!==false,
      footer:layout.footer!==false,
      navigation:['navbar','bottomnav','tabs','sidebar','drawer','toolbar','breadcrumb','pagination','pagenav','none'].includes(layout.navigation)?layout.navigation:navFallback,
      frameworkStyle:layout.frameworkStyle!==false,
      titlebar:layout.titlebar!==false
    }:null;

    const pageIdMap=new Map(),usedPageIds=new Set(),usedItemIds=new Set(),usedNames=new Set();
    const shells=raw.pages.map((rp,i)=>{
      const page=(rp&&typeof rp==='object')?rp:{};
      let id=safeId(page.id,'page');
      while(usedPageIds.has(id))id=safeId('','page');
      usedPageIds.add(id);
      if(page.id!=null)pageIdMap.set(String(page.id),id);
      return {rawPage:page,id,name:cap(page.name,120)||('Página '+(i+1)),slug:safeSlug(page.slug||page.name,'pagina-'+(i+1)),items:[],events:{}};
    });

    shells.forEach((shell,index)=>{
      const page=shell.rawPage;
      const rawItems=Array.isArray(page.items)?page.items.slice(0,MAX_ITEMS):[];
      const items=rawItems.map(item=>normalizeItem(item,index,'label',usedItemIds,usedNames,assetPack.map,assetIds));
      const itemIdMap=new Map();
      items.forEach(item=>{if(item.__oldId)itemIdMap.set(item.__oldId,item.id)});
      items.forEach(item=>{
        if(item.__oldParent&&item.__oldParent!==item.__oldId){
          const mapped=itemIdMap.get(item.__oldParent);
          if(mapped)item.parentId=mapped;else delete item.parentId;
        }else delete item.parentId;
        if(item.__oldTarget)item.targetPage=pageIdMap.get(item.__oldTarget)||'';
        if(item.__oldAsset){const mapped=assetPack.map.get(item.__oldAsset)||item.__oldAsset;if(assetIds.has(mapped))item.assetId=mapped;else delete item.assetId}
        delete item.__oldId;delete item.__oldParent;delete item.__oldTarget;delete item.__oldAsset;
        if(item.targetPage===undefined)delete item.targetPage;
      });
      // Evita ciclos de parentId que travariam a geração do HTML.
      items.forEach(item=>{
        if(!item.parentId)return;
        const seen=new Set([item.id]);
        let cur=item;
        while(cur&&cur.parentId){
          if(seen.has(cur.parentId)){delete item.parentId;break}
          seen.add(cur.parentId);
          cur=items.find(x=>x.id===cur.parentId);
        }
      });
      shell.items=items;
      const pe=page.events&&typeof page.events==='object'?page.events:{};
      shell.events={onload:cap(typeof pe.onload==='string'?pe.onload:'',MAX_CODE),onshow:cap(typeof pe.onshow==='string'?pe.onshow:'',MAX_CODE)};
      delete shell.rawPage;
    });

    p.pages=shells;
    p.active=Math.max(0,Math.min(Number.isInteger(raw.active)?raw.active:0,p.pages.length-1));
    p.activePage=p.pages[p.active]?.id||'';
    return p;
  }

  window.FFSecurity={
    escapeHtml,jsonEscape,jsAttr,scriptJson,scriptBody,
    sanitizeIdentifier,isEventName,safeColor,safeCssSize,safeNumber,safeFit,safeAlign,safeFontFamily,
    safeHref,safeMediaUrl,safeFrameUrl,safeSlug,safeId,sanitizeHtml,validateProject
  };
})();
