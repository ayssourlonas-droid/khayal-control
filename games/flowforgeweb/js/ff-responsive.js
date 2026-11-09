/* FlowForge Responsive System - additive module. Does not replace the legacy designer.
 * Breakpoints are measured on the designer stage (#stage), i.e. the layout the user selected
 * (Mobile/Tablet/Desktop), and fall back to the window width when there is no stage. */
(function(w,d){'use strict';
  const bp={mobile:0,tablet:768,desktop:1200};
  const listeners=new Set(); let current='desktop';
  function detect(width){if(width<bp.tablet)return'mobile';if(width<bp.desktop)return'tablet';return'desktop'}
  /* Width being designed. Prefers the stage's target width (style.width) because the stage animates
     its width (CSS transition), then its rendered width, and finally the window as a fallback. */
  function measure(){
    const stage=d.getElementById('stage');
    if(stage){
      const target=parseFloat(stage.style.width);
      if(target>0)return target;
      const sw=stage.getBoundingClientRect().width;
      if(sw>0)return sw;
    }
    return w.innerWidth||1200;
  }
  function update(){
    const next=detect(measure());
    if(next===current)return;
    const prev=current;current=next;
    d.documentElement.dataset.ffBreakpoint=current;
    const stage=d.getElementById('stage');if(stage)stage.dataset.ffBreakpoint=current;
    listeners.forEach(fn=>{try{fn(current,prev)}catch(e){}})
  }
  function observe(fn){if(typeof fn!=='function')return()=>{};listeners.add(fn);fn(current,null);return()=>listeners.delete(fn)}
  function variant(obj, fallback){return obj&&obj[current]!==undefined?obj[current]:fallback}
  function apply(el, cfg){if(!el||!cfg)return el;const v=variant(cfg,{});Object.keys(v||{}).forEach(k=>{if(k==='style'&&v.style)Object.assign(el.style,v.style);else if(k==='className')el.className=v.className;else if(k in el)try{el[k]=v[k]}catch(e){}else el.dataset[k]=v[k]});return el}
  w.FFResponsive={breakpoints:Object.freeze(bp),get current(){return current},get width(){return measure()},detect,measure,update,observe,variant,apply,setBreakpoints(next){Object.assign(bp,next||{});update()}};
  w.addEventListener('resize',update,{passive:true});
  function init(){
    const stage=d.getElementById('stage');
    if(stage&&typeof ResizeObserver==='function'&&!stage.dataset.ffRespObserved){
      stage.dataset.ffRespObserved='1';
      new ResizeObserver(update).observe(stage);
    }
    update();
  }
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window,document);
