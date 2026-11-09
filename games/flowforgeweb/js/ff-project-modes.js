/* FlowForge project modes and responsive/site helpers. Additive module. */
(function(w,d){'use strict';
  const $=id=>d.getElementById(id);
  const modeInfo={
    app:{title:'App responsivo',desc:'Interface mobile-first com layout adaptável, navegação e componentes de aplicação.',items:['Layout responsivo','PWA/HTML5','Controles e dados','Navegação por páginas']},
    site:{title:'Site multipágina',desc:'Estrutura para páginas institucionais, navegação, cabeçalho e rodapé.',items:['Header e Navbar','Seções de conteúdo','Footer e links','Páginas e SEO']},
    landing:{title:'Landing page',desc:'Página focada em apresentação, conversão e chamadas para ação.',items:['Header enxuto','Hero e CTA','Benefícios e prova social','Footer e contato']}
  };
  function add(kind){if(typeof w.addItem==='function')w.addItem(kind);}
  function panel(){
    const props=$('propertiesPanel'); if(!props||$('ffModePanel'))return;
    const box=d.createElement('section');box.id='ffModePanel';box.className='ff-mode-panel';
    box.innerHTML='<h3>Estrutura do projeto</h3><div id="ffModeDescription"></div><div class="ff-mode-actions"></div><small class="hint">Insira blocos prontos e ajuste suas propriedades depois.</small>';
    props.appendChild(box);
    refresh();
  }
  function refresh(){
    const type=$('projectType')?.value||'app', info=modeInfo[type]||modeInfo.app;
    const desc=$('ffModeDescription'); if(desc)desc.innerHTML='<strong>'+info.title+'</strong><p>'+info.desc+'</p><ul>'+info.items.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
    const actions=d.querySelector('#ffModePanel .ff-mode-actions');if(!actions)return;
    const sets=type==='app'?[['container','Container'],['row','Linha responsiva'],['columns','Grid responsivo'],['card','Card']]:[['header','Header'],['navbar','Barra de navegação'],['section','Seção'],['card','Card de conteúdo'],['footer','Footer']];
    actions.innerHTML='';sets.forEach(([kind,label])=>{const b=d.createElement('button');b.type='button';b.textContent='+ '+label;b.onclick=()=>add(kind);actions.appendChild(b)});
  }
  function responsive(){
    const stage=$('stage');if(!stage)return;
    stage.classList.toggle('ff-app-responsive',($('projectType')?.value||'app')==='app');
    stage.classList.toggle('ff-site-layout',($('projectType')?.value||'app')!=='app');
  }
  function init(){panel();refresh();responsive();const sel=$('projectType');if(sel&&!sel.dataset.ffModeBound){sel.dataset.ffModeBound='1';sel.addEventListener('change',()=>{setTimeout(()=>{panel();refresh();responsive()},0)})} }
  w.FFProjectModes={refresh,add,responsive};
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
  let ticks=0;const observer=new MutationObserver(()=>{if(ticks++>30){observer.disconnect();return}init();});observer.observe(d.body,{childList:true,subtree:true});
})(window,document);
