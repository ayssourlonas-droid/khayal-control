// FlowForge v0.10.4 - ProgressBar
(function(){
 const R=window.FlowForge?.components;
 if(R?.register)R.register('progress',{
  title:'ProgressBar',category:'Dados / Indicadores',
  defaults:{name:'ProgressBar1',width:240,height:32,min:0,max:100,value:50,showText:true,barColor:'#22c55e',bg:'#e5e7eb'},
  event:'change',events:['change','complete'],
  render:ctx=>{const x=ctx?.item||ctx||{},min=Number(x.min??0),max=Number(x.max??100),v=Math.max(min,Math.min(max,Number(x.value??50))),p=max>min?(v-min)/(max-min)*100:0;const color=window.FFSecurity?.safeColor(x.barColor,'#22c55e')||'#22c55e';return `<div class="ff-progress" data-min="${min}" data-max="${max}" data-value="${v}"><i style="width:${p}%;background:${color}"></i>${x.showText!==false?`<span>${Math.round(p)}%</span>`:''}</div>`}
 });
 window.FlowForgeProgress={
  _bar(id){const outer=typeof id==='string'?document.getElementById(id):id;if(!outer)return null;return outer.classList?.contains('ff-progress')?outer:(outer.querySelector?.('.ff-progress')||outer)},
  set(id,value){const el=this._bar(id);if(!el)return;let min=Number(el.dataset.min??el.getAttribute('aria-valuemin')??0),max=Number(el.dataset.max??el.getAttribute('aria-valuemax')??100),v=Math.max(min,Math.min(max,Number(value))),p=max>min?(v-min)/(max-min)*100:0;el.dataset.value=v;el.setAttribute('aria-valuenow',v);el.querySelector('i')?.style.setProperty('width',p+'%');const t=el.querySelector('span');if(t)t.textContent=Math.round(p)+'%';el.dispatchEvent(new CustomEvent('change',{detail:{value:v,percent:p}}));if(v>=max)el.dispatchEvent(new CustomEvent('complete',{detail:{value:v}}))},
  increment(id,step=1){const el=this._bar(id);this.set(el,Number(el?.dataset.value??el?.getAttribute('aria-valuenow')??0)+Number(step))}
 };
})();
