// FlowForge WebStudio - Runtime Services
// HTTP + Local Database (IndexedDB), mantendo compatibilidade com a API anterior.
(function(){
  const runtime = FlowForge.registerModule('runtime', FlowForge.modules.runtime || {});
  const httpRequest = async (url,opt={})=>{
    const options={...opt,headers:{...(opt.headers||{})}};
    const timeout=Number(options.timeout||30000); delete options.timeout;
    const controller=options.signal?null:new AbortController();
    if(controller) options.signal=controller.signal;
    let timer=null;
    if(controller) timer=setTimeout(()=>controller.abort(),Math.max(1,timeout));
    let response;
    try{ response=await fetch(url,options); }
    catch(error){ if(error?.name==='AbortError') throw Object.assign(new Error('HTTP request timeout'),{code:'ETIMEDOUT',url}); throw Object.assign(error,{url}); }
    finally{ if(timer)clearTimeout(timer); }
    const headers={}; response.headers?.forEach?.((v,k)=>headers[k]=v);
    const type=response.headers.get('content-type')||'';
    let data;
    try{ data=type.includes('json')?await response.json():await response.text(); }
    catch{ data=null; }
    const result={ok:response.ok,status:response.status,statusText:response.statusText,headers,data,url:response.url||String(url)};
    if(!response.ok){ const e=new Error(`HTTP ${response.status} ${response.statusText}`.trim()); Object.assign(e,{status:response.status,statusText:response.statusText,data,headers,url:result.url,response:result}); throw e; }
    return result;
  };
  const http=async(url,opt={})=>(await httpRequest(url,opt)).data;
  Object.assign(http,{request:httpRequest,get:(url,opt={})=>httpRequest(url,{...opt,method:'GET'}),post:(url,data,opt={})=>httpRequest(url,{...opt,method:'POST',headers:{'Content-Type':'application/json',...(opt.headers||{})},body:typeof data==='string'?data:JSON.stringify(data)}),put:(url,data,opt={})=>httpRequest(url,{...opt,method:'PUT',headers:{'Content-Type':'application/json',...(opt.headers||{})},body:typeof data==='string'?data:JSON.stringify(data)}),patch:(url,data,opt={})=>httpRequest(url,{...opt,method:'PATCH',headers:{'Content-Type':'application/json',...(opt.headers||{})},body:typeof data==='string'?data:JSON.stringify(data)}),delete:(url,opt={})=>httpRequest(url,{...opt,method:'DELETE'})});

  const DB_NAME='FlowForgeDB'; const DB_VERSION_KEY='__flowforge_db_version__';
  const dbCache=new Map();
  const openDB=async(table)=>{
    if(dbCache.has(table))return dbCache.get(table);
    const current=Number(localStorage.getItem(DB_VERSION_KEY)||1);
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,current);
      req.onupgradeneeded=()=>{const db=req.result;if(table&&!db.objectStoreNames.contains(table))db.createObjectStore(table,{keyPath:'id',autoIncrement:true});};
      req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();dbCache.set(table,db);resolve(db)};
      req.onerror=()=>reject(req.error||new Error('Não foi possível abrir o banco local'));
    });
  };
  const ensureTable=async(table)=>{
    table=String(table||'').trim(); if(!table)throw new Error('Nome da tabela obrigatório');
    let db=await openDB(table);
    if(!db.objectStoreNames.contains(table)){
      db.close(); dbCache.delete(table);
      const version=Number(localStorage.getItem(DB_VERSION_KEY)||1)+1;
      localStorage.setItem(DB_VERSION_KEY,String(version));
      await new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,version);req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(table))d.createObjectStore(table,{keyPath:'id',autoIncrement:true});};req.onsuccess=()=>{req.result.close();resolve()};req.onerror=()=>reject(req.error)});
      db=await openDB(table);
    }
    return db;
  };
  const tx=(table,mode,fn)=>ensureTable(table).then(db=>new Promise((resolve,reject)=>{let result;const t=db.transaction(table,mode),s=t.objectStore(table);try{result=fn(s)}catch(e){reject(e);return}t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error||new Error('Operação de banco falhou'));t.onabort=()=>reject(t.error||new Error('Operação de banco cancelada'));}));
  const requestResult=req=>new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Operação de banco falhou'))});
  const db={
    async createTable(table){await ensureTable(table);return true},
    async insert(table,data){return tx(table,'readwrite',s=>requestResult(s.add({...data})))},
    async get(table,id){return tx(table,'readonly',s=>requestResult(s.get(id)))},
    async select(table,query={}){const rows=await tx(table,'readonly',s=>requestResult(s.getAll()));if(typeof query==='function')return rows.filter(query);if(query&&typeof query==='object'&&Object.keys(query).length)return rows.filter(r=>Object.entries(query).every(([k,v])=>r?.[k]===v));return rows},
    async update(table,id,data){return ensureTable(table).then(db=>new Promise((resolve,reject)=>{const t=db.transaction(table,'readwrite'),s=t.objectStore(table);let out;const g=s.get(id);g.onsuccess=()=>{if(!g.result){reject(new Error(`Registro ${id} não encontrado`));try{t.abort()}catch{};return}out={...g.result,...data,id};s.put(out)};g.onerror=()=>reject(g.error);t.oncomplete=()=>resolve(out);t.onerror=()=>reject(t.error||new Error('Operação de banco falhou'));t.onabort=()=>reject(t.error||new Error('Operação de banco cancelada'))}))},
    async delete(table,id){return tx(table,'readwrite',s=>requestResult(s.delete(id)))},
    async clear(table){return tx(table,'readwrite',s=>requestResult(s.clear()))},
    async count(table){return tx(table,'readonly',s=>requestResult(s.count()))},
    async dropTable(table){const current=Number(localStorage.getItem(DB_VERSION_KEY)||1)+1;localStorage.setItem(DB_VERSION_KEY,String(current));dbCache.forEach(x=>x.close());dbCache.clear();return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,current);req.onupgradeneeded=()=>{const d=req.result;if(d.objectStoreNames.contains(table))d.deleteObjectStore(table)};req.onsuccess=()=>{req.result.close();resolve(true)};req.onerror=()=>reject(req.error)})}
  };
  runtime.storage=runtime.storage||{set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return localStorage.getItem(k)}},remove:k=>localStorage.removeItem(k)};
  runtime.http=http; runtime.db=db;
  window.http=http; window.db=db;
  window.FlowForgeHTTP=http; window.FlowForgeDB=db;

  // Código autocontido usado pelo HTML exportado/Preview.
  window.FlowForgeRuntimeSource=window.FlowForgeRuntimeSource||`(${function(){
    const httpRequest=async(url,opt={})=>{const o={...opt,headers:{...(opt.headers||{})}};const timeout=Number(o.timeout||30000);delete o.timeout;const c=o.signal?null:new AbortController();if(c)o.signal=c.signal;let t;if(c)t=setTimeout(()=>c.abort(),timeout);let r;try{r=await fetch(url,o)}catch(e){if(e?.name==='AbortError')throw Object.assign(new Error('HTTP request timeout'),{code:'ETIMEDOUT',url});throw Object.assign(e,{url})}finally{if(t)clearTimeout(t)}const h={};r.headers?.forEach?.((v,k)=>h[k]=v);const ct=r.headers.get('content-type')||'';let data;try{data=ct.includes('json')?await r.json():await r.text()}catch{data=null}const out={ok:r.ok,status:r.status,statusText:r.statusText,headers:h,data,url:r.url||String(url)};if(!r.ok){const e=new Error((`HTTP ${r.status} ${r.statusText}`).trim());Object.assign(e,{status:r.status,statusText:r.statusText,data,headers:h,url:out.url,response:out});throw e}return out};
    const http=async(url,opt={})=>(await httpRequest(url,opt)).data;Object.assign(http,{request:httpRequest,get:(u,o={})=>httpRequest(u,{...o,method:'GET'}),post:(u,d,o={})=>httpRequest(u,{...o,method:'POST',headers:{'Content-Type':'application/json',...(o.headers||{})},body:typeof d==='string'?d:JSON.stringify(d)}),put:(u,d,o={})=>httpRequest(u,{...o,method:'PUT',headers:{'Content-Type':'application/json',...(o.headers||{})},body:typeof d==='string'?d:JSON.stringify(d)}),patch:(u,d,o={})=>httpRequest(u,{...o,method:'PATCH',headers:{'Content-Type':'application/json',...(o.headers||{})},body:typeof d==='string'?d:JSON.stringify(d)}),delete:(u,o={})=>httpRequest(u,{...o,method:'DELETE'})});
    const N='FlowForgeDB',VK='__flowforge_db_version__',cache=new Map(),open=table=>{if(cache.has(table))return cache.get(table);const v=Number(localStorage.getItem(VK)||1);return new Promise((res,rej)=>{const q=indexedDB.open(N,v);q.onupgradeneeded=()=>{const d=q.result;if(table&&!d.objectStoreNames.contains(table))d.createObjectStore(table,{keyPath:'id',autoIncrement:true})};q.onsuccess=()=>{const d=q.result;d.onversionchange=()=>d.close();cache.set(table,d);res(d)};q.onerror=()=>rej(q.error)})},ensure=async table=>{table=String(table||'').trim();if(!table)throw Error('Nome da tabela obrigatório');let d=await open(table);if(!d.objectStoreNames.contains(table)){d.close();cache.delete(table);const v=Number(localStorage.getItem(VK)||1)+1;localStorage.setItem(VK,String(v));await new Promise((res,rej)=>{const q=indexedDB.open(N,v);q.onupgradeneeded=()=>{const x=q.result;if(!x.objectStoreNames.contains(table))x.createObjectStore(table,{keyPath:'id',autoIncrement:true})};q.onsuccess=()=>{q.result.close();res()};q.onerror=()=>rej(q.error)});d=await open(table)}return d},rr=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}),run=(t,m,f)=>ensure(t).then(d=>new Promise((res,rej)=>{let z;const x=d.transaction(t,m),s=x.objectStore(t);try{z=f(s)}catch(e){rej(e);return}x.oncomplete=()=>res(z);x.onerror=()=>rej(x.error);x.onabort=()=>rej(x.error)}));
    const db={createTable:async t=>(await ensure(t),true),insert:(t,d)=>run(t,'readwrite',s=>rr(s.add({...d}))),get:(t,i)=>run(t,'readonly',s=>rr(s.get(i))),select:async(t,q={})=>{const a=await run(t,'readonly',s=>rr(s.getAll()));return typeof q==='function'?a.filter(q):q&&Object.keys(q).length?a.filter(r=>Object.entries(q).every(([k,v])=>r?.[k]===v)):a},update:(t,i,d)=>ensure(t).then(db=>new Promise((res,rej)=>{const x=db.transaction(t,'readwrite'),s=x.objectStore(t);let out;const g=s.get(i);g.onsuccess=()=>{if(!g.result){rej(Error(`Registro ${i} não encontrado`));try{x.abort()}catch{};return}out={...g.result,...d,id:i};s.put(out)};g.onerror=()=>rej(g.error);x.oncomplete=()=>res(out);x.onerror=()=>rej(x.error);x.onabort=()=>rej(x.error)})),delete:(t,i)=>run(t,'readwrite',s=>rr(s.delete(i))),clear:t=>run(t,'readwrite',s=>rr(s.clear())),count:t=>run(t,'readonly',s=>rr(s.count())),dropTable:async t=>{const v=Number(localStorage.getItem(VK)||1)+1;localStorage.setItem(VK,String(v));cache.forEach(d=>d.close());cache.clear();return new Promise((res,rej)=>{const q=indexedDB.open(N,v);q.onupgradeneeded=()=>{const d=q.result;if(d.objectStoreNames.contains(t))d.deleteObjectStore(t)};q.onsuccess=()=>{q.result.close();res(true)};q.onerror=()=>rej(q.error)})}};
    const mem=(()=>{const tables=new Map();let seq=1;const tab=t=>{t=String(t||'').trim();if(!t)throw Error('Nome da tabela obrigatório');if(!tables.has(t))tables.set(t,new Map());return tables.get(t)};return {createTable:async t=>{tab(t);return true},insert:async(t,d)=>{const tb=tab(t);let id=d&&d.id!=null?d.id:seq++;while(tb.has(id))id=seq++;const row={...(d||{}),id};tb.set(id,row);return id},get:async(t,i)=>tab(t).get(i),select:async(t,q={})=>{const a=[...tab(t).values()];return typeof q==='function'?a.filter(q):q&&Object.keys(q).length?a.filter(r=>Object.entries(q).every(([k,v])=>r?.[k]===v)):a},update:async(t,i,d)=>{const tb=tab(t),cur=tb.get(i);if(!cur)throw Error('Registro '+i+' não encontrado');const row={...cur,...d,id:i};tb.set(i,row);return row},delete:async(t,i)=>tab(t).delete(i),clear:async t=>{tab(t).clear()},count:async t=>tab(t).size,dropTable:async t=>{tables.delete(String(t||'').trim());return true}}})();
    const safeDB=new Proxy(db,{get(target,prop){const fn=target[prop];if(typeof fn!=='function')return fn;return async(...args)=>{try{return await fn.apply(target,args)}catch(err){try{return await mem[prop](...args)}catch(_){throw err}}}}});
    window.http=http;window.db=safeDB;window.FlowForgeHTTP=http;window.FlowForgeDB=safeDB;
  }.toString()})();`;
})();
