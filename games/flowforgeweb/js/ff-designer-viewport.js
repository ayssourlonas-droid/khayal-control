/* FlowForge Designer Viewport
 * Single owner of the designer stage size (Mobile / Tablet / Desktop / custom Width × Height).
 * - Every UI control (Viewport select, Width × Height fields, device preset, "Recursos" panel)
 *   goes through apply().
 * - The chosen layout is stored in project.viewport ({width,height,device}), so it is saved in the
 *   .flowmobile file and restored whenever the project is rendered, opened, or created.
 * - device: '' = "Livre" (free: the stage follows Viewport / Width × Height),
 *           '390' | '768' | '1440' = fixed device preset.
 */
(function(w,d){'use strict';
  const PRESETS={
    mobile:{width:390,height:844},
    tablet:{width:768,height:1024},
    desktop:{width:1440,height:900}
  };
  const MIN_W=280,MAX_W=1440,MIN_H=200,MAX_H=4000;
  const $=id=>d.getElementById(id);
  const proj=()=>typeof project!=='undefined'?project:null;
  const clamp=(n,min,max)=>Math.min(Math.max(n,min),max);

  function presetName(width){
    width=Number(width);
    return width<768?'mobile':width<1200?'tablet':'desktop';
  }
  function defaults(type){return {width:type==='app'?390:1200,height:undefined,device:''};}
  function valid(v){
    const n=Number(v&&v.width);
    return Number.isFinite(n)&&n>=MIN_W&&n<=MAX_W;
  }
  /* Layout stored in the project (or the default for its type). */
  function current(){
    const p=proj();
    if(p&&valid(p.viewport)){
      const h=Number(p.viewport.height);
      return {
        width:Number(p.viewport.width),
        height:Number.isFinite(h)&&h>=MIN_H&&h<=MAX_H?h:undefined,
        device:String(p.viewport.device??'')
      };
    }
    return defaults(p&&p.type);
  }
  const hasOption=(sel,value)=>!!sel&&[...sel.options].some(o=>o.value===value);

  /* Viewport select shows the matching option, or a hidden "Outro" one for other widths. */
  function syncViewportSelect(width){
    const vp=$('viewport');
    if(!vp)return;
    const dp=$('devicePreset');
    let value=String(dp&&dp.value!==''&&width===1440?1200:width);
    if(!hasOption(vp,value)){
      let opt=[...vp.options].find(o=>o.value==='custom');
      if(!opt){
        opt=d.createElement('option');
        opt.value='custom';opt.textContent='Outro';
        opt.hidden=true;opt.disabled=true; /* shown only when selected by code */
        vp.appendChild(opt);
      }
      value='custom';
    }
    vp.value=value;
  }
  /* Width × Height fields (do not overwrite what the user is typing). */
  function syncSizeFields(width,height){
    const wi=$('viewportW'),hi=$('viewportH');
    if(wi&&d.activeElement!==wi)wi.value=width;
    if(hi&&d.activeElement!==hi)hi.value=height;
  }

  function apply(width,height,name,opts){
    const stage=$('stage');
    if(!stage)return;
    width=clamp(Math.round(Number(width))||390,MIN_W,MAX_W);
    const key=name||presetName(width);
    height=Number(height);
    height=clamp(Math.round(Number.isFinite(height)&&height>0?height:(PRESETS[key]?.height||900)),MIN_H,MAX_H);
    stage.style.width=width+'px';
    stage.style.minHeight=height+'px';
    stage.style.height=height+'px';
    stage.dataset.viewport=key;
    stage.classList.remove('ff-viewport-mobile','ff-viewport-tablet','ff-viewport-desktop');
    stage.classList.add('ff-viewport-'+key);
    const dp=$('devicePreset');
    /* Empty value = "Livre": keep it, the stage follows the Viewport / Width × Height. */
    if(dp&&dp.value!=='')dp.value=hasOption(dp,String(width))?String(width):key==='desktop'?'1440':'';
    syncViewportSelect(width);
    syncSizeFields(width,height);
    if(!(opts&&opts.persist===false)){
      const p=proj();
      if(p)p.viewport={width,height,device:dp?dp.value:''};
    }
    w.FFResponsive?.update?.();
  }

  function applyPreset(key){
    const p=PRESETS[key];
    if(!p)return;
    apply(p.width,p.height,key);
  }

  /* Re-apply the layout stored in the current project (called by render()). */
  function restore(){
    const s=current();
    const dp=$('devicePreset');
    if(dp&&hasOption(dp,s.device))dp.value=s.device;
    apply(s.width,s.height);
  }

  /* New project or project type change: go back to the default layout for that type. */
  function reset(type){
    const p=proj();
    if(p)p.viewport=defaults(type||p.type);
    restore();
  }

  /* Custom Width × Height typed by the user: switches to "Livre". */
  function applyCustomSize(){
    const wi=$('viewportW'),hi=$('viewportH');
    const width=parseInt(wi?.value,10),height=parseInt(hi?.value,10);
    const dp=$('devicePreset');
    if(dp)dp.value='';
    const cur=current();
    apply(Number.isFinite(width)?width:cur.width,Number.isFinite(height)?height:cur.height);
  }

  function bind(){
    const dp=$('devicePreset');
    const vp=$('viewport');
    if(dp&&!dp.dataset.ffViewportBound){
      dp.dataset.ffViewportBound='1';
      dp.addEventListener('change',function(){
        const value=this.value;
        if(!value){
          /* Livre: follow the layout selected in the Viewport select. */
          apply(Number(vp?.value)||current().width);
          return;
        }
        applyPreset(value==='390'?'mobile':value==='768'?'tablet':'desktop');
      });
    }
    if(vp&&!vp.dataset.ffViewportBound){
      vp.dataset.ffViewportBound='1';
      vp.addEventListener('change',function(){
        if(this.value==='custom'){restore();return;}
        apply(Number(this.value)||390);
      });
    }
    ['viewportW','viewportH'].forEach(id=>{
      const el=$(id);
      if(el&&!el.dataset.ffViewportBound){
        el.dataset.ffViewportBound='1';
        el.addEventListener('change',applyCustomSize);
      }
    });
    restore();
  }

  w.FFDesignerViewport={presets:PRESETS,apply,applyPreset,applyCustomSize,bind,restore,reset,current,applyCurrent:restore};
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
})(window,document);
