// FlowForge WebStudio v0.9.1 — width/height model compatibility
FlowForge.registerModule('layout',{
 presets:{mobile:390,tablet:768,desktop:1440},
 align(items,mode){if(!items?.length)return items;let xs=items.map(x=>Number(x.x)||0),ys=items.map(x=>Number(x.y)||0),rs=items.map(x=>(Number(x.x)||0)+(parseFloat(x.width)||0)),bs=items.map(x=>(Number(x.y)||0)+(parseFloat(x.height)||0));
  let v=mode==='left'?Math.min(...xs):mode==='right'?Math.max(...rs):mode==='top'?Math.min(...ys):mode==='bottom'?Math.max(...bs):null;
  items.forEach(x=>{if(mode==='left')x.x=v;if(mode==='right')x.x=v-(parseFloat(x.width)||0);if(mode==='top')x.y=v;if(mode==='bottom')x.y=v-(parseFloat(x.height)||0)});return items},
 dockCSS(dock){return ({top:'top:0;left:0;right:0;',bottom:'bottom:0;left:0;right:0;',left:'top:0;bottom:0;left:0;',right:'top:0;bottom:0;right:0;',fill:'inset:0;'})[dock]||''}
});
