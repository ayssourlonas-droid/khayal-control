// FlowForge WebStudio v0.8.2 - núcleo modular
window.FlowForge = window.FlowForge || {};
FlowForge.version='0.10.5';
FlowForge.bus={
 listeners:new Map(),
 on(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);return ()=>this.listeners.get(name)?.delete(fn)},
 emit(name,data){this.listeners.get(name)?.forEach(fn=>{try{fn(data)}catch(e){console.error('[FlowForge]',name,e)}})}
};
FlowForge.modules={};
FlowForge.registerModule=(name,api)=>{FlowForge.modules[name]=api;FlowForge.bus.emit('module:registered',{name,api});return api};
