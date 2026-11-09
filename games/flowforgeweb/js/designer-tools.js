// FlowForge v0.9.3 designer tools UI
addEventListener('DOMContentLoaded',()=>{
 const q=s=>document.querySelector(s);
 q('#equalW')?.addEventListener('click',()=>ffEqual('width'));
 q('#equalH')?.addEventListener('click',()=>ffEqual('height'));
 q('#distH')?.addEventListener('click',()=>ffDistribute('x'));
 q('#distV')?.addEventListener('click',()=>ffDistribute('y'));
 q('#zFront')?.addEventListener('click',()=>ffZ('front'));
 q('#zBack')?.addEventListener('click',()=>ffZ('back'));
 q('#unparentBtn')?.addEventListener('click',()=>window.ffUnparentSelected?.());
 q('#parentBtn')?.addEventListener('click',()=>{let containers=ffItems().filter(x=>FF_CONTAINERS.has(x.kind)&&!ffSelection().includes(x));if(!containers.length)return alert('Adicione um container primeiro.');let name=prompt('Name do container de destino:',containers[0].name);let c=containers.find(x=>x.name===name);if(c)window.ffParentSelectedTo?.(c)});

});
