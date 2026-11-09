/* FlowForge Data Binding - additive reactive store. */
(function(w){'use strict';
  const data={};const watchers=new Map();
  function get(path){return path.split('.').reduce((o,k)=>o==null?undefined:o[k],data)}
  function set(path,value){const parts=path.split('.');let o=data;parts.slice(0,-1).forEach(k=>{if(!o[k]||typeof o[k]!=='object')o[k]={};o=o[k]});o[parts.at(-1)]=value;const setWatch=watchers.get(path)||[];setWatch.forEach(fn=>{try{fn(value,path)}catch(e){}});return value}
  function remove(path){const p=path.split('.'),k=p.pop(),o=p.reduce((a,x)=>a&&a[x],data);if(o&&k in o)delete o[k];(watchers.get(path)||[]).forEach(fn=>fn(undefined,path))}
  function watch(path,fn){if(typeof fn!=='function')return()=>{};if(!watchers.has(path))watchers.set(path,[]);watchers.get(path).push(fn);return()=>{const a=watchers.get(path)||[];const i=a.indexOf(fn);if(i>=0)a.splice(i,1)}}
  function bind(el,path,prop='textContent'){const sync=()=>{const v=get(path);if(prop in el)el[prop]=v??'';else el.textContent=v??''};const off=watch(path,sync);sync();return off}
  w.FFData={get,set,remove,watch,bind,raw:data};
})(window);
