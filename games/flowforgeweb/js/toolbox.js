// Toolbox modular v0.8.2
FlowForge.registerModule('toolbox',{
 register(def){return FlowForgeRegistry.register(def)},
 search(query){query=String(query||'').toLowerCase();return FlowForgeRegistry.all().filter(x=>JSON.stringify(x).toLowerCase().includes(query))}
});
