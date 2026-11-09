// FlowForge WebStudio v0.9.1 — validator aligned with paged project model
FlowForge.registerModule('validator',{run(p){
 let issues=[],seen=new Set(),items=(p?.pages||[]).flatMap(page=>Array.isArray(page.items)?page.items:[]);
 items.forEach(x=>{
  const name=String(x.name??'').trim();
  if(!name)issues.push({level:'error',message:'Componente sem Name'});
  if(name&&seen.has(name))issues.push({level:'error',message:'Name duplicado: '+name});
  if(name)seen.add(name);
  const w=parseFloat(x.width),h=parseFloat(x.height);
  if(!(w>0)||!(h>0))issues.push({level:'warning',message:'Tamanho inválido: '+(name||x.kind||x.id)});
  if(x.parentId&&!items.some(parent=>parent.id===x.parentId))issues.push({level:'error',message:'Parent inexistente: '+name});
 });
 return issues;
}});