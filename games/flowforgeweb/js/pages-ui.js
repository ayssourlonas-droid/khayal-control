// FlowForge WebStudio v0.9.4
addEventListener('DOMContentLoaded',()=>{
 ffEnsurePages();ffAttachNavigationUI();
 const oldOpen=openStudioDrawer;
 openStudioDrawer=function(mode){
  if(mode==='outline'){let d=$('#studioDrawer'),b=$('#drawerBody');d.hidden=false;$('#drawerTitle').textContent='Árvore do Projeto';b.innerHTML='';let root=document.createElement('div');root.className='treeRoot';root.textContent='▾ '+(project.name||'Projeto')+' / '+ffPageName(project.activePage);b.append(root);ffItems().filter(x=>!x.parentId).forEach(x=>ffTreeRow(x,0,b));return}
  if(mode==='pages'){let d=$('#studioDrawer'),b=$('#drawerBody');d.hidden=false;$('#drawerTitle').textContent='Páginas';ffEnsurePages();b.innerHTML='';project.pages.forEach(p=>{let row=document.createElement('div');row.className='pageRow';let open=document.createElement('button');open.className='treeItem';open.textContent=(p.id===project.activePage?'● ':'○ ')+p.name+'  (#/'+p.slug+')';open.onclick=()=>ffSwitchPage(p.id);let ren=document.createElement('button');ren.textContent='✎';ren.title='Renomear página';ren.onclick=()=>{let n=prompt('Novo nome da página',p.name);if(n&&n.trim())ffRenamePage(p.id,n.trim())};let del=document.createElement('button');del.textContent='×';del.title='Excluir página';del.onclick=()=>ffDeletePage(p.id);row.append(open,ren,del);b.append(row)});let add=document.createElement('button');add.textContent='＋ Nova página';add.onclick=()=>{let n=prompt('Nome da página','Nova Página');if(n)ffAddPage(n)};b.append(add);return}
  oldOpen(mode)
 };
});
