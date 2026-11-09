// FlowForge WebStudio v0.9.0
FlowForge.registerModule('visualActions',{
 types:['setProperty','show','hide','toggle','goPage','navigate','openUrl','alert','addClass','removeClass','play','pause','storageSet','storageGet','httpRequest'],
 create(type,target,property,value){return {type,target,property,value}},
 toJS(a){let t=JSON.stringify(a.target||'');let el=`document.getElementById(${t})`;switch(a.type){
 case'setProperty':return `${el}.${a.property}=${JSON.stringify(a.value)};`;case'show':return `${el}.hidden=false;`;case'hide':return `${el}.hidden=true;`;
 case'toggle':return `${el}.hidden=!${el}.hidden;`;case'goPage':return `ffNavigate(${JSON.stringify(a.value)});`;case'navigate':return `location.href=${JSON.stringify(a.value)};`;case'openUrl':return `window.open(${JSON.stringify(a.value)},'_blank');`;
 case'alert':return `alert(${JSON.stringify(a.value)});`;case'addClass':return `${el}.classList.add(${JSON.stringify(a.value)});`;case'removeClass':return `${el}.classList.remove(${JSON.stringify(a.value)});`;
 case'play':return `${el}.play();`;case'pause':return `${el}.pause();`;case'storageSet':return `localStorage.setItem(${JSON.stringify(a.property)},${JSON.stringify(a.value)});`;
 case'storageGet':return `${el}.${a.property||'textContent'}=localStorage.getItem(${JSON.stringify(a.value)});`;case'httpRequest':return `fetch(${JSON.stringify(a.value)}).then(r=>r.json()).then(console.log);`;default:return `// ação ${a.type}`}}
});
