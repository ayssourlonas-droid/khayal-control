// FlowForge WebStudio v0.9.9 - Timer real
(function(){
 const timers=new Map();
 function key(t){return t.id||t.name}
 function stop(t){const k=key(t),h=timers.get(k);if(h){clearInterval(h);clearTimeout(h);timers.delete(k)}}
 function fire(t){
   const code=t.events?.tick||t.events?.Tick||'';
   if(!code)return;
   try{new Function('component','project',code)(t,window.project)}catch(e){console.error('Timer '+t.name,e)}
 }
 function start(t){
   stop(t);if(t.enabled===false)return;
   let ms=Math.max(10,Number(t.interval)||1000), k=key(t);
   if(t.oneShot){timers.set(k,setTimeout(()=>{timers.delete(k);fire(t)},ms))}
   else timers.set(k,setInterval(()=>fire(t),ms));
 }
 window.FlowForgeTimer={
   start,stop,
   restart:start,
   startAll(){(window.ffItems?ffItems():(window.project?.items||[])).filter(x=>x.kind==='timer').forEach(start)},
   stopAll(){timers.forEach(h=>{clearInterval(h);clearTimeout(h)});timers.clear()}
 };
 addEventListener('beforeunload',()=>FlowForgeTimer.stopAll());
})();
