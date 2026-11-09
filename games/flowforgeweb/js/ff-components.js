/* FlowForge Reusable Components - additive registry. */
(function(w){'use strict';
  const registry=new Map();
  function register(name,definition){if(!name)throw new Error('Component name required');registry.set(name,{...definition,name});return registry.get(name)}
  function define(name,definition){return register(name,definition)}
  function list(){return Array.from(registry.values()).map(x=>x.name)}
  function get(name){return registry.get(name)}
  function create(name,props={},children=[]){const d=get(name);if(!d)throw new Error('Unknown FlowForge component: '+name);let el=typeof d.render==='function'?d.render(props):document.createElement(d.tag||'div');if(!el)return null;if(d.className)el.className=d.className;if(d.setup)d.setup(el,props);if(props&&typeof props==='object'){Object.entries(props).forEach(([k,v])=>{if(k==='children'||k==='style')return;try{if(k in el)el[k]=v;else el.dataset[k]=v}catch(e){}});if(props.style)Object.assign(el.style,props.style)}(Array.isArray(children)?children:[children]).filter(Boolean).forEach(c=>el.append(c.nodeType?c:document.createTextNode(String(c))));return el}
  function mount(name,target,props,children){const el=create(name,props,children);const host=typeof target==='string'?document.querySelector(target):target;if(!host)throw new Error('Target not found');host.append(el);return el}
  w.FFComponents={register,define,get,list,create,mount,registry};
})(window);
