// FlowForge Component Registry v0.10.5 — API compatível e centralizada
window.FlowForgeRegistry={
 components:new Map(),
 register(kindOrDef, maybeDef){
   let def=typeof kindOrDef==='string'?{...(maybeDef||{}),kind:kindOrDef}:{...(kindOrDef||{})};
   if(!def.kind)throw new Error('Component kind obrigatório');
   const old=this.components.get(def.kind)||{};
   const merged={...old,...def,defaults:{...(old.defaults||{}),...(def.defaults||{})}};
   this.components.set(def.kind,merged);
   return merged;
 },
 unregister(kind){return this.components.delete(kind)},
 get(kind){return this.components.get(kind)},
 has(kind){return this.components.has(kind)},
 all(){return [...this.components.values()]},
 byCategory(cat){return this.all().filter(x=>x.category===cat)}
};
FlowForge.components=FlowForgeRegistry;
FlowForge.registerModule('components',FlowForgeRegistry);
