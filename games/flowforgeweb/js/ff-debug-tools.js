/* FlowForge Debug Tools - additive developer API. */
(function(w){'use strict';
  const logs=[];const watchers=new Map();const errors=[];
  function push(type,args){const item={time:new Date(),type,args:Array.from(args)};logs.push(item);if(logs.length>1000)logs.shift();return item}
  function log(){push('log',arguments);console.log('[FlowForge]',...arguments)}
  function warn(){push('warn',arguments);console.warn('[FlowForge]',...arguments)}
  function error(){const i=push('error',arguments);errors.push(i);console.error('[FlowForge]',...arguments)}
  function inspect(value){try{return structuredClone(value)}catch(e){return value}}
  function watch(name,getter){if(typeof getter!=='function')return()=>{};watchers.set(name,getter);return()=>watchers.delete(name)}
  function snapshot(){const out={};watchers.forEach((g,n)=>{try{out[n]=inspect(g())}catch(e){out[n]='<error>'}});return out}
  w.FFDebugTools={log,warn,error,inspect,watch,snapshot,get logs(){return logs.slice()},get errors(){return errors.slice()},clear(){logs.length=0;errors.length=0}};
})(window);
