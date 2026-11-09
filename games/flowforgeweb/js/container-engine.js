// FlowForge WebStudio v0.13.1 — container engine
(function(){
 const CONTAINER_KINDS=new Set(['container','section','card','form','row','columns','hero','panel','groupbox','flexpanel','gridpanel','stackpanel','scrollpanel']);
 const stage=()=>document.querySelector('#stage');
 const items=()=>window.ffItems?.()||[];
 const byId=id=>items().find(x=>x.id===id)||null;
 const isContainer=x=>!!x&&CONTAINER_KINDS.has(x.kind);
 const hasAncestor=(item,ancestorId)=>{let seen=new Set(),p=item?.parentId;while(p&&!seen.has(p)){if(p===ancestorId)return true;seen.add(p);p=byId(p)?.parentId}return false};
 function ffAbsPos(item){
  let x=Number(item?.x)||0,y=Number(item?.y)||0,seen=new Set(),p=item?.parentId;
  while(p&&!seen.has(p)){seen.add(p);let parent=byId(p);if(!parent)break;x+=Number(parent.x)||0;y+=Number(parent.y)||0;p=parent.parentId}
  return {x,y};
 }
 function ffFindContainerAt(px,py,exclude){
  const s=stage();if(!s)return null;
  const candidates=items().filter(isContainer).filter(x=>x!==exclude&&!hasAncestor(x,exclude?.id));
  const domById=id=>document.querySelector(`#stage .component[data-id="${CSS.escape(String(id))}"]`);
  const hit=[];
  for(const x of candidates){const el=domById(x.id);if(!el)continue;const r=el.getBoundingClientRect();if(px>=r.left-s.getBoundingClientRect().left&&py>=r.top-s.getBoundingClientRect().top&&px<=r.right-s.getBoundingClientRect().left&&py<=r.bottom-s.getBoundingClientRect().top)hit.push({x,area:r.width*r.height});}
  hit.sort((a,b)=>a.area-b.area);
  return hit[0]?.x||null;
 }
 function ffReparent(item,parent,absX,absY){
  if(!item)return;
  const oldParent=item.parentId?byId(item.parentId):null;
  if(parent?.id===item.id||hasAncestor(parent,item.id))return false;
  const targetAbs=parent?ffAbsPos(parent):{x:0,y:0};
  item.parentId=parent?.id||undefined;
  item.x=Math.round((Number(absX)||0)-targetAbs.x);
  item.y=Math.round((Number(absY)||0)-targetAbs.y);
  if(!item.parentId)delete item.parentId;
  return oldParent?.id!==parent?.id;
 }
 function ffParentSelectedTo(parent){
  const selection=window.ffSelection?.()||[];if(!parent||!isContainer(parent))return false;
  const targets=selection.filter(x=>x&&x!==parent&&!hasAncestor(parent,x.id));if(!targets.length)return false;
  window.snapshot?.();
  targets.forEach(x=>{const a=ffAbsPos(x);ffReparent(x,parent,a.x,a.y)});
  window.render?.();window.ffMarkMulti?.();return true;
 }
 function ffUnparentSelected(){
  const selection=window.ffSelection?.()||[];const targets=selection.filter(x=>x?.parentId);if(!targets.length)return false;
  window.snapshot?.();targets.forEach(x=>{const a=ffAbsPos(x);ffReparent(x,null,a.x,a.y)});window.render?.();window.ffMarkMulti?.();return true;
 }
 function nestDOM(){
  const s=stage();if(!s)return;
  const nodes=[...s.querySelectorAll(':scope > .component')];
  items().filter(x=>x.parentId).forEach(it=>{
   const el=s.querySelector(`.component[data-id="${CSS.escape(String(it.id))}"]`),parent=s.querySelector(`.component[data-id="${CSS.escape(String(it.parentId))}"]`);
   if(!el||!parent||!isContainer(parent))return;
   let host=parent.querySelector(':scope > .ff-child-host');
   if(!host){host=document.createElement('div');host.className='ff-child-host';parent.append(host)}
   host.append(el);
   el.style.left=(Number(it.x)||0)+'px';el.style.top=(Number(it.y)||0)+'px';
  });
 }
 window.FF_CONTAINERS=CONTAINER_KINDS;
 window.ffAbsPos=ffAbsPos;window.ffFindContainerAt=ffFindContainerAt;window.ffReparent=ffReparent;window.ffParentSelectedTo=ffParentSelectedTo;window.ffUnparentSelected=ffUnparentSelected;window.ffNestDOM=nestDOM;
 addEventListener('DOMContentLoaded',()=>{const c=stage();if(c)new MutationObserver(()=>requestAnimationFrame(nestDOM)).observe(c,{childList:true,subtree:true});nestDOM()});
 document.addEventListener('pointerup',e=>{if(!e.altKey||!window.ffSelected?.())return;const c=stage();if(!c)return;const r=c.getBoundingClientRect(),px=e.clientX-r.left+c.scrollLeft,py=e.clientY-r.top+c.scrollTop,selected=window.ffSelected(),a=ffAbsPos(selected),parent=ffFindContainerAt(px,py,selected);if(parent||selected.parentId){window.snapshot?.();if(ffReparent(selected,parent,a.x,a.y)){window.render?.();window.openStudioDrawer?.('outline')}}},true);
})();