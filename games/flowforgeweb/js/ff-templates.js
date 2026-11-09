/* FlowForge Templates - additive project/page template registry. */
(function(w){'use strict';
  const templates=new Map();
  function register(name,definition){templates.set(name,{name,...definition});return templates.get(name)}
  function get(name){return templates.get(name)}
  function list(){return Array.from(templates.values()).map(x=>({name:x.name,description:x.description||''}))}
  function instantiate(name,ctx={}){const t=get(name);if(!t)throw new Error('Template not found: '+name);if(typeof t.create==='function')return t.create(ctx);return structuredClone(t.project||t)}
  register('blank',{description:'Página vazia',create:()=>({name:'Nova Página',items:[]})});
  register('dashboard',{description:'Estrutura inicial de dashboard',create:()=>({name:'Dashboard',items:[]})});
  register('login',{description:'Estrutura inicial de login',create:()=>({name:'Login',items:[]})});
  register('crud',{description:'Estrutura inicial de CRUD',create:()=>({name:'CRUD',items:[]})});
  register('landing',{description:'Estrutura inicial de landing page',create:()=>({name:'Landing',items:[]})});
  w.FFTemplates={register,get,list,instantiate,templates};
})(window);
