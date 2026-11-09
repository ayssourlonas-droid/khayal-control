// FlowForge WebStudio v0.9.1 — persistent project assets
FlowForge.registerModule('assets',{
 ensure(p){return p.assets??=[]},
 async add(p,file){
  if(!file)return null;
  const existing=this.ensure(p).find(a=>a.name===file.name&&a.size===file.size&&a.type===file.type);
  if(existing)return existing;
  const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('Falha ao ler asset'));r.readAsDataURL(file)});
  const a={id:'asset-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)),name:file.name,type:file.type,size:file.size,data};
  this.ensure(p).push(a);return a;
 },
 remove(p,id){p.assets=(p.assets||[]).filter(x=>x.id!==id)}
});