/* FlowForge NextGen enhancements UI. It only adds a small independent panel. */
(function(w){'use strict';
  function init(){
    if(document.getElementById('ffEnhancementsBtn'))return;
    const btn=document.createElement('button');btn.id='ffEnhancementsBtn';btn.textContent='⚙ Recursos';btn.title='Recursos avançados FlowForge';
    const nav=document.querySelector('header nav');if(nav)nav.append(btn);else document.body.append(btn);
    const panel=document.createElement('section');panel.id='ffEnhancementsPanel';panel.hidden=true;panel.innerHTML='<div class="ffEnhHead"><b>Recursos avançados</b><button id="ffEnhClose">×</button></div><div class="ffEnhBody"></div>';
    document.body.append(panel);const body=panel.querySelector('.ffEnhBody');
    body.innerHTML='<div class="ffEnhCard"><b>Responsive</b><span id="ffEnhBreakpoint">—</span><div><button data-ff-v="390">Mobile</button><button data-ff-v="768">Tablet</button><button data-ff-v="1200">Desktop</button></div></div><div class="ffEnhCard"><b>APIs disponíveis</b><code>http · db · FFData · FFLayout · FFStyle · FFComponents · FFTemplates · FFDebugTools</code></div><div class="ffEnhCard"><b>Templates</b><div id="ffEnhTemplates"></div></div>';
    btn.onclick=()=>{panel.hidden=!panel.hidden;render()};panel.querySelector('#ffEnhClose').onclick=()=>panel.hidden=true;
    panel.querySelectorAll('[data-ff-v]').forEach(b=>b.onclick=()=>{const width=+b.dataset.ffV;w.FFDesignerViewport?.apply(width);w.FFResponsive?.update?.();render()});
    w.FFResponsive?.observe?.(render);
    function render(){const bp=document.getElementById('ffEnhBreakpoint');if(bp)bp.textContent=w.FFResponsive?.current||'—';const t=document.getElementById('ffEnhTemplates');if(t)t.textContent=(w.FFTemplates?.list()||[]).map(x=>x.name).join(' · ')}render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
