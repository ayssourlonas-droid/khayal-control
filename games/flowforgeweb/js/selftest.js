// FlowForge v0.13.0 lightweight diagnostics
window.FlowForgeSelfTest=function(){
 const issues=[];
 const p=window.project;
 if(!p||!Array.isArray(p.pages)||!p.pages.length)issues.push('Projeto sem páginas');
 if(p&&(!Number.isInteger(p.active)||p.active<0||p.active>=p.pages.length))issues.push('Página ativa inválida');
 const ids=new Set(),names=new Set();
 (p?.pages||[]).forEach(pg=>(pg.items||[]).forEach(x=>{if(!x.id)issues.push('Componente sem ID');else if(ids.has(x.id))issues.push('ID duplicado: '+x.id);else ids.add(x.id);if(!x.name)issues.push('Componente sem Name');else if(names.has(x.name))issues.push('Name duplicado: '+x.name);else names.add(x.name)}));
 return issues;
};