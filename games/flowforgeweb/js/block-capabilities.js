// FlowForge v0.11.7 — extensible visual-block capability API
(function(){
 const extra=new Map();
 window.FlowForgeBlockCapabilities={
  register(kind,definition){extra.set(kind,{...(extra.get(kind)||{}),...definition})},
  get(kind){return extra.get(kind)||null},
  has(kind){return extra.has(kind)}
 };
})();