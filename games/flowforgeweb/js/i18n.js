/* FlowForge WebStudio — automatic UI language detection */
(function(){
  'use strict';
  const LANGS={
    'pt':{
      'Novo':'Novo','Salvar':'Salvar','Abrir':'Abrir','Exemplos':'Exemplos','Exportar HTML':'Exportar HTML','Preview':'Preview','Design':'Design','Código':'Código','Blocos':'Blocos','Debug':'Debug','Propriedades':'Propriedades','Ações':'Ações','Name':'Nome','Texto':'Texto','Visible':'Visível','Enabled':'Habilitado','Duplicar':'Duplicar','Excluir':'Excluir','Projeto':'Projeto','Nome':'Nome','Tipo':'Tipo','Framework CSS':'Framework CSS','Modo do Designer':'Modo do Designer','Viewport':'Viewport','Snap 8px':'Snap 8px','Ações / Eventos':'Ações / Eventos','Adicionar evento':'Adicionar evento','Adicionar ação':'Adicionar ação','Ação visual':'Ação visual','Ações rápidas':'Ações rápidas','Cancelar':'Cancelar','Fechar':'Fechar','Salvar projeto':'Salvar projeto','Versão':'Versão','Nome do arquivo':'Nome do arquivo','Escolher arquivo':'Escolher arquivo','Escolher dos Assets...':'Escolher dos Assets...','Remover':'Remover','Ícone do App / Apple Touch Icon':'Ícone do App / Apple Touch Icon','Favicon':'Favicon','Cor do tema':'Cor do tema','Salvar arquivo':'Salvar arquivo','Exportar HTML':'Exportar HTML','Exportar index.html':'Exportar index.html','Escolher um ícone e um favicon, ou selecione imagens já adicionadas aos Assets.':'Escolha um ícone e um favicon, ou selecione imagens já adicionadas aos Assets.','Revise os dados do projeto antes de salvar.':'Revise os dados do projeto antes de salvar.','App HTML5':'App HTML5','Site':'Site','Landing Page':'Landing Page','CSS próprio':'CSS próprio','Framework':'Framework','FlowForge':'FlowForge','Mobile / PWA':'Mobile / PWA','Multi-page':'Multi-page','Cancelar':'Cancelar','OK':'OK'
    },
    'en':{
      'Novo':'New','Salvar':'Save','Abrir':'Open','Exemplos':'Examples','Exportar HTML':'Export HTML','Preview':'Preview','Design':'Design','Código':'Code','Blocos':'Blocks','Debug':'Debug','Propriedades':'Properties','Ações':'Actions','Name':'Name','Texto':'Text','Visible':'Visible','Enabled':'Enabled','Duplicar':'Duplicate','Excluir':'Delete','Projeto':'Project','Nome':'Name','Tipo':'Type','Framework CSS':'CSS Framework','Modo do Designer':'Designer Mode','Viewport':'Viewport','Snap 8px':'Snap 8px','Ações / Eventos':'Actions / Events','Adicionar evento':'Add event','Adicionar ação':'Add action','Ação visual':'Visual action','Ações rápidas':'Quick actions','Cancelar':'Cancel','Fechar':'Close','Salvar projeto':'Save project','Versão':'Version','Nome do arquivo':'File name','Escolher arquivo':'Choose file','Escolher dos Assets...':'Choose from Assets...','Remover':'Remove','Ícone do App / Apple Touch Icon':'App Icon / Apple Touch Icon','Favicon':'Favicon','Cor do tema':'Theme color','Salvar arquivo':'Save file','Exportar index.html':'Export index.html','Escolha um ícone e um favicon, ou selecione imagens já adicionadas aos Assets.':'Choose an icon and favicon, or select images already added to Assets.','Revise os dados do projeto antes de salvar.':'Review the project details before saving.','App HTML5':'HTML5 App','Site':'Website','Landing Page':'Landing Page','CSS próprio':'Custom CSS','Framework':'Framework','FlowForge':'FlowForge','Mobile / PWA':'Mobile / PWA','Multi-page':'Multi-page','OK':'OK'
    },
    'es':{
      'Novo':'Nuevo','Salvar':'Guardar','Abrir':'Abrir','Exemplos':'Ejemplos','Exportar HTML':'Exportar HTML','Preview':'Vista previa','Design':'Diseño','Código':'Código','Blocos':'Bloques','Debug':'Depurar','Propriedades':'Propiedades','Ações':'Acciones','Name':'Nombre','Texto':'Texto','Visible':'Visible','Enabled':'Habilitado','Duplicar':'Duplicar','Excluir':'Eliminar','Projeto':'Proyecto','Nome':'Nombre','Tipo':'Tipo','Framework CSS':'Framework CSS','Modo do Designer':'Modo del diseñador','Viewport':'Viewport','Snap 8px':'Ajuste 8px','Ações / Eventos':'Acciones / Eventos','Adicionar evento':'Añadir evento','Adicionar ação':'Añadir acción','Ação visual':'Acción visual','Ações rápidas':'Acciones rápidas','Cancelar':'Cancelar','Fechar':'Cerrar','Salvar projeto':'Guardar proyecto','Versão':'Versión','Nome do arquivo':'Nombre del archivo','Escolher arquivo':'Elegir archivo','Escolher dos Assets...':'Elegir de Assets...','Remover':'Eliminar','Ícone do App / Apple Touch Icon':'Icono de app / Apple Touch Icon','Favicon':'Favicon','Cor do tema':'Color del tema','Salvar arquivo':'Guardar archivo','Exportar index.html':'Exportar index.html','Escolha um ícone e um favicon, ou selecione imagens já adicionadas aos Assets.':'Elige un icono y un favicon, o selecciona imágenes ya añadidas a Assets.','Revise os dados do projeto antes de salvar.':'Revisa los datos del proyecto antes de guardar.','App HTML5':'App HTML5','Site':'Sitio web','Landing Page':'Landing Page','CSS próprio':'CSS propio','Framework':'Framework','FlowForge':'FlowForge','Mobile / PWA':'Móvil / PWA','Multi-page':'Multipágina','OK':'OK'
    }
  };
  const browser=(navigator.languages&&navigator.languages[0]||navigator.language||'pt').toLowerCase();
  const lang=browser.startsWith('en')?'en':browser.startsWith('es')?'es':'pt';
  const dict=LANGS[lang];
  const rootSelector='header, #tabs, #props, dialog, #debuggerPanel, #studioDrawer, #blocksEditor';
  function translate(root=document){
    root.querySelectorAll?.(rootSelector).forEach(scope=>{
      const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
      nodes.forEach(n=>{const key=n.nodeValue.trim();if(!key||!dict[key])return; const next=n.nodeValue.replace(key,dict[key]); if(next!==n.nodeValue)n.nodeValue=next;});
      scope.querySelectorAll('option,button,[title],[placeholder]').forEach(el=>{
        if(el.tagName==='OPTION'&&dict[el.textContent.trim()])el.textContent=dict[el.textContent.trim()];
        if(el.title&&dict[el.title])el.title=dict[el.title];
        if(el.placeholder&&dict[el.placeholder])el.placeholder=dict[el.placeholder];
      });
    });
    document.documentElement.lang=browser.startsWith('en')?'en':browser.startsWith('es')?'es':'pt-BR';
  }
  function boot(){
    translate();
    const obs=new MutationObserver(()=>translate());obs.observe(document.body,{childList:true,subtree:true});
    window.FlowForgeI18n={language:lang,translate};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
