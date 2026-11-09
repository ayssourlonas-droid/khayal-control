/* FlowForge WebStudio NextGen foundation — additive module, does not replace core executor. */
(function(){
  const FF = window.FlowForge = window.FlowForge || {};
  FF.nextGen = FF.nextGen || {version:'1.0.0'};
  const store = { data:{}, listeners:new Set(), get(k,d){return Object.prototype.hasOwnProperty.call(this.data,k)?this.data[k]:d}, set(k,v){this.data[k]=v;this.listeners.forEach(f=>{try{f(k,v)}catch(e){}});return v}, remove(k){delete this.data[k];this.listeners.forEach(f=>{try{f(k,undefined)}catch(e){}})}, clear(){this.data={}} };
  window.ffData=store;
  window.storage=window.storage||{set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch(_){return localStorage.getItem(k)}},remove:k=>localStorage.removeItem(k),clear:()=>localStorage.clear()};
  window.http=window.http||{get:async u=>(await fetch(u)).json(),post:async(u,b)=>(await fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)})).json(),request:async(u,o={})=>(await fetch(u,o)).json()};
  window.ffLayout={row:(el,g=8)=>{el.style.display='flex';el.style.flexDirection='row';el.style.gap=g+'px'},column:(el,g=8)=>{el.style.display='flex';el.style.flexDirection='column';el.style.gap=g+'px'},grid:(el,cols=2,g=8)=>{el.style.display='grid';el.style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;el.style.gap=g+'px'}};
  window.ffResponsive={breakpoints:{mobile:0,tablet:768,desktop:1200},current(){const w=innerWidth;return w<768?'mobile':w<1200?'tablet':'desktop'},onChange(fn){let last=this.current();return addEventListener('resize',()=>{const n=this.current();if(n!==last){last=n;fn(n)}})}};
  window.ffComponent=window.ffComponent||function(name){return window[name]||document.getElementById(name)};
  window.ffTemplates=window.ffTemplates||{items:new Map(),register(name,fn){this.items.set(name,fn)},create(name,opts={}){const f=this.items.get(name);return f?f(opts):null},list(){return [...this.items.keys()]}};
  window.ffDebug=window.ffDebug||{breakpoints:new Set(),watch:new Map(),log(...a){console.log('[FlowForge]',...a)},error(...a){console.error('[FlowForge]',...a)},inspect(name){const c=window[name];return c?{name,visible:c.visible,enabled:c.enabled,value:c.value,text:c.text}:null},watchValue(name,fn){this.watch.set(name,fn)}};
  FF.intellisense?.register?.(ctx=>{
    const common=['visible','enabled','value','text','items','selectedIndex','selectedItem'];
    if(ctx?.type==='component'||ctx?.object==='component') return common.map(x=>({label:x,kind:'property',detail:'FlowForge'}));
    return ['ffData','storage','http','ffLayout','ffResponsive','ffComponent','ffTemplates','ffDebug'].map(x=>({label:x,kind:'variable',detail:'FlowForge NextGen'}));
  });
  FF.nextGen.api={ffData,storage:window.storage,http:window.http,ffLayout,ffResponsive,ffTemplates,ffDebug};
})();
