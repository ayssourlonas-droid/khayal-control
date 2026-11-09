// FlowForge WebStudio - componente "Gráfico" (chart)
// Gráficos reais em SVG (sem bibliotecas): barras, barras horizontais, linhas, área, pizza e rosca.
// O motor abaixo é uma função autocontida: roda aqui (editor) e é copiada, como texto, para o HTML exportado/Preview
// somente quando o projeto tem um componente "Gráfico".
(function(){
 function engine(){
  if(window.FlowForgeChart)return;
  var PAL=['#4f46e5','#06b6d4','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899','#84cc16'];
  var NS='http://www.w3.org/2000/svg';
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function color(v){v=String(v==null?'':v).trim();if(/^#[0-9a-f]{3,8}$/i.test(v))return v;if(/^[a-z]{3,24}$/i.test(v)&&!/^(url|expression|javascript)$/i.test(v))return v;if(/^(?:rgb|rgba|hsl|hsla)\(\s*[-+.\d%,\s/]+\)$/i.test(v))return v;return ''}
  function num(v){v=Number(v);return isFinite(v)?v:0}
  function opt(v){return v===undefined||v===null||v===''?null:(isFinite(Number(v))?Number(v):null)}
  function bool(v,d){if(v===undefined||v===null||v==='')return d;return v===true||v==='true'||v==='1'||v===1}
  function list(t){
   if(Array.isArray(t))return t.map(String);
   t=String(t==null?'':t).trim(); if(!t)return [];
   if(t.charAt(0)==='['){try{var a=JSON.parse(t);if(Array.isArray(a))return a.map(String)}catch(e){}}
   return t.split(/[,;\n]/).map(function(s){return s.trim()}).filter(function(s){return s!==''});
  }
  // aceita [1,2,3] | [[1,2],[3,4]] | {"Jan":10,"Fev":20} | {"Vendas":[1,2],"Custos":[3,4]} | [{label,value}] | "1,2,3"
  function parseValues(t){
   var v=t;
   if(typeof t==='string'){
    var s=t.trim(); if(!s)return {series:[]};
    if(s.charAt(0)==='['||s.charAt(0)==='{'){try{v=JSON.parse(s)}catch(e){v=null}}
    if(v===null||typeof v==='string'){
     var lines=s.split(/\n/).map(function(l){return l.trim()}).filter(Boolean);
     var rows=lines.map(function(l){return l.split(/[,;\s]+/).filter(Boolean).map(num)});
     v=(rows.length>1&&rows.every(function(r){return r.length>1}))?rows:(rows.length?[].concat.apply([],rows):[]);
    }
   }
   if(Array.isArray(v)){
    if(v.length&&v.every(function(x){return x&&typeof x==='object'&&!Array.isArray(x)&&('value' in x||'y' in x)}))
     return {labels:v.map(function(x){return String(x.label!=null?x.label:(x.name!=null?x.name:(x.x!=null?x.x:'')))}),series:[{name:'',values:v.map(function(x){return num('value' in x?x.value:x.y)})}]};
    if(v.length&&v.every(Array.isArray))return {series:v.map(function(a){return {name:'',values:a.map(num)}})};
    return {series:[{name:'',values:v.map(num)}]};
   }
   if(v&&typeof v==='object'){
    var keys=Object.keys(v);
    if(keys.length&&keys.every(function(k){return Array.isArray(v[k])}))return {series:keys.map(function(k){return {name:k,values:v[k].map(num)}})};
    return {labels:keys,series:[{name:'',values:keys.map(function(k){return num(v[k])})}]};
   }
   return {series:[]};
  }
  function nice(min,max,n){
   if(min===max){if(min===0){max=1}else{var p=Math.abs(min)*0.1||1;min-=p;max+=p}}
   var span=max-min,step=Math.pow(10,Math.floor(Math.log(span/n)/Math.LN10)),err=span/n/step;
   step*=err>=7.5?10:err>=3.5?5:err>=1.5?2:1;
   var lo=Math.floor(min/step+1e-9)*step,hi=Math.ceil(max/step-1e-9)*step,t=[];
   for(var v=lo;v<=hi+step/2;v+=step)t.push(Math.round(v/step)*step);
   return {min:lo,max:hi,ticks:t};
  }
  function fmt(v,compact){
   v=num(v); var a=Math.abs(v);
   if(compact){if(a>=1e6)return (v/1e6).toFixed(1).replace(/\.0$/,'')+'M';if(a>=1e4)return (v/1e3).toFixed(1).replace(/\.0$/,'')+'k'}
   try{return v.toLocaleString('pt-BR',{maximumFractionDigits:2})}catch(e){return String(Math.round(v*100)/100)}
  }
  function css(){
   if(document.getElementById('ffc-style'))return;
   var s=document.createElement('style');s.id='ffc-style';
   s.textContent='.ff-chart2{width:100%;height:100%;box-sizing:border-box;overflow:hidden;color:inherit}.ff-chart2 svg{display:block;width:100%;height:100%}'
    +'.ffc-i{cursor:pointer;transition:opacity .15s}.ffc-i:hover{opacity:.78}.ffc-pt{transition:r .12s}.ffc-pt:hover{r:6}'
    +'@keyframes ffc-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes ffc-growx{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes ffc-fade{from{opacity:0}to{opacity:1}}'
    +'.ffc-anim .ffc-bar{transform-box:fill-box;transform-origin:50% 100%;animation:ffc-grow .5s ease-out both}.ffc-anim .ffc-barh{transform-box:fill-box;transform-origin:0 50%;animation:ffc-growx .5s ease-out both}'
    +'.ffc-anim .ffc-fade{animation:ffc-fade .6s ease-out both}@media (prefers-reduced-motion:reduce){.ffc-anim *{animation:none!important}}';
   (document.head||document.documentElement).appendChild(s);
  }
  function readData(h){
   var ds=h.dataset,pv=parseValues(ds.values||''),lab=list(ds.labels||''),names=list(ds.series||'');
   var series=pv.series; if(pv.labels&&!lab.length)lab=pv.labels;
   series.forEach(function(s,i){s.name=names[i]!=null?names[i]:(s.name||(series.length>1?'Série '+(i+1):(names[0]||'')))});
   return {labels:lab,series:series};
  }
  function readOpts(h){
   var d=h.dataset;
   return {type:d.type||'bar',title:d.title||'',legend:bool(d.legend,true),showValues:bool(d.showValues,true),grid:bool(d.grid,true),smooth:bool(d.smooth,false),
    colors:list(d.colors||''),prefix:d.prefix||'',suffix:d.suffix||'',yMin:opt(d.yMin),yMax:opt(d.yMax),maxPoints:Math.max(0,Math.floor(num(d.maxPoints))),animate:bool(d.animate,true),play:true};
  }
  function render(h){
   var o=h.__ffo,d=h.__ffd; if(!o||!d)return;
   var W=h.clientWidth||Number(h.dataset.w)||320,H=h.clientHeight||Number(h.dataset.h)||200;
   var type=o.type==='doughnut'||o.type==='donut'?'doughnut':o.type; if(['bar','hbar','line','area','pie','doughnut'].indexOf(type)<0)type='bar';
   var pie=type==='pie'||type==='doughnut',S=d.series.length;
   var L=d.labels.length; d.series.forEach(function(s){if(s.values.length>L)L=s.values.length});
   var labels=[];for(var i=0;i<L;i++)labels.push(d.labels[i]!=null?d.labels[i]:String(i+1));
   var col=function(i){var c=o.colors.length?color(o.colors[i%o.colors.length]):'';return c||PAL[i%PAL.length]};
   var out=[],pre=function(v){return o.prefix+fmt(v)+o.suffix},lab=function(v){return o.prefix+fmt(v,true)+o.suffix};
   var title=o.title,top=(title?32:10)+(o.showValues&&!(o.type==='pie'||o.type==='doughnut'||o.type==='donut')?10:0),bottom=8;
   // legenda (embaixo, com quebra de linha)
   var legItems=[];
   if(o.legend){
    if(pie)labels.forEach(function(l,i){legItems.push([l,col(i)])});
    else if(S>1||(S===1&&d.series[0].name&&false))d.series.forEach(function(s,i){legItems.push([s.name||('Série '+(i+1)),col(i)])});
   }
   var legSvg='',legH=0;
   if(legItems.length){
    var x=0,y=0,rows=[[]],rw=0;
    legItems.forEach(function(it){var w=22+String(it[0]).length*6.4;if(rw+w>W-20&&rows[rows.length-1].length){rows.push([]);rw=0}rows[rows.length-1].push([it,w]);rw+=w});
    legH=rows.length*18+6;
    rows.forEach(function(r,ri){var tw=r.reduce(function(a,b){return a+b[1]},0),sx=Math.max(8,(W-tw)/2);
     r.forEach(function(p){legSvg+='<rect x="'+sx+'" y="'+(H-legH+ri*18+4)+'" width="10" height="10" rx="2" fill="'+p[0][1]+'"/><text x="'+(sx+15)+'" y="'+(H-legH+ri*18+13)+'" font-size="11" fill="currentColor" opacity=".8">'+esc(p[0][0])+'</text>';sx+=p[1]})});
    bottom+=legH;
   }
   var aria=(title||'Gráfico')+': '+labels.slice(0,12).map(function(l,i){return l+' '+(d.series[0]?fmt(d.series[0].values[i]):'')}).join(', ');
   var head='<svg xmlns="'+NS+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(aria)+'" font-family="system-ui,Segoe UI,Roboto,sans-serif">';
   if(title)out.push('<text x="'+(W/2)+'" y="20" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">'+esc(title)+'</text>');
   var allv=[];d.series.forEach(function(s){s.values.forEach(function(v){allv.push(v)})});
   if(!L||!S||!allv.length||(pie&&!(d.series[0]&&d.series[0].values.some(function(v){return v>0})))){
    out.push('<text x="'+(W/2)+'" y="'+(H/2)+'" text-anchor="middle" font-size="13" fill="currentColor" opacity=".55">Sem dados</text>');
    h.innerHTML=head+out.join('')+legSvg+'</svg>';return;
   }
   if(pie){
    var vals=d.series[0].values,tot=0;vals.forEach(function(v){if(v>0)tot+=v});
    var ph=H-top-bottom,cx=W/2,cy=top+ph/2,R=Math.max(10,Math.min(W-24,ph)/2-4),ang=-Math.PI/2,hole=type==='doughnut'?R*0.58:0;
    var pos=vals.map(function(v){return v>0?v:0}).filter(function(v){return v>0}).length;
    vals.forEach(function(v,i){
     if(!(v>0))return; var a=v/tot*Math.PI*2,tip=esc(labels[i])+': '+pre(v)+' ('+Math.round(v/tot*1000)/10+'%)',c=col(i),a2=ang+a;
     var inner='data-i="'+i+'" data-s="0" class="ffc-i ffc-fade"';
     if(pos===1){
      out.push(type==='doughnut'?'<path '+inner+' fill="'+c+'" fill-rule="evenodd" d="M'+(cx-R)+','+cy+'a'+R+','+R+' 0 1,0 '+(2*R)+',0a'+R+','+R+' 0 1,0 '+(-2*R)+',0M'+(cx-hole)+','+cy+'a'+hole+','+hole+' 0 1,1 '+(2*hole)+',0a'+hole+','+hole+' 0 1,1 '+(-2*hole)+',0Z"><title>'+tip+'</title></path>'
       :'<circle '+inner+' cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="'+c+'"><title>'+tip+'</title></circle>');
     }else{
      var x1=cx+R*Math.cos(ang),y1=cy+R*Math.sin(ang),x2=cx+R*Math.cos(a2),y2=cy+R*Math.sin(a2),big=a>Math.PI?1:0,dd;
      if(hole){var x3=cx+hole*Math.cos(a2),y3=cy+hole*Math.sin(a2),x4=cx+hole*Math.cos(ang),y4=cy+hole*Math.sin(ang);
       dd='M'+x1+','+y1+'A'+R+','+R+' 0 '+big+',1 '+x2+','+y2+'L'+x3+','+y3+'A'+hole+','+hole+' 0 '+big+',0 '+x4+','+y4+'Z'}
      else dd='M'+cx+','+cy+'L'+x1+','+y1+'A'+R+','+R+' 0 '+big+',1 '+x2+','+y2+'Z';
      out.push('<path '+inner+' d="'+dd+'" fill="'+c+'" stroke="#fff" stroke-width="1.5"><title>'+tip+'</title></path>');
     }
     if(o.showValues&&v/tot>=0.08&&(R-hole)>=30){var mid=ang+a/2,rr=hole?(R+hole)/2:R*0.62;
      out.push('<text x="'+(cx+rr*Math.cos(mid))+'" y="'+(cy+rr*Math.sin(mid)+4)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" pointer-events="none">'+Math.round(v/tot*100)+'%</text>')}
     ang=a2;
    });
    if(hole)out.push('<text x="'+cx+'" y="'+(cy+2)+'" text-anchor="middle" font-size="'+Math.max(12,Math.min(22,hole/2.4))+'" font-weight="700" fill="currentColor">'+esc(o.prefix+fmt(tot,true)+o.suffix)+'</text><text x="'+cx+'" y="'+(cy+16)+'" text-anchor="middle" font-size="11" fill="currentColor" opacity=".6">Total</text>');
    h.innerHTML=head+out.join('')+legSvg+'</svg>';return;
   }
   // ---- gráficos com eixos ----
   var mn=Math.min.apply(null,allv),mx=Math.max.apply(null,allv),base0=type!=='line'||(mn>=0&&mx>0&&mn/mx<0.5);
   if(base0){mn=Math.min(mn,0);mx=Math.max(mx,0)}
   if(o.yMin!==null)mn=o.yMin; if(o.yMax!==null)mx=o.yMax; if(mx<=mn)mx=mn+1;
   var sc=nice(mn,mx,5); if(o.yMin!==null)sc.min=o.yMin; if(o.yMax!==null)sc.max=o.yMax;
   sc.ticks=sc.ticks.filter(function(t){return t>=sc.min-1e-9&&t<=sc.max+1e-9});
   var horiz=type==='hbar',tickW=Math.max.apply(null,sc.ticks.map(function(t){return fmt(t,true).length}))*6.4+10;
   var labW=horiz?Math.min(W*0.35,Math.max.apply(null,labels.map(function(l){return String(l).length}))*6.2+12):0;
   var left=horiz?labW+6:tickW+6,right=14,pw=Math.max(20,W-left-right);
   var xl=0,rot=false,skip=1;
   if(!horiz){
    var lw=Math.max.apply(null,labels.map(function(l){return String(l).length}))*6.2+6,slot=pw/L;
    if(lw>slot){rot=true;lw=Math.min(14,Math.max.apply(null,labels.map(function(l){return String(l).length})))*4.6}
    skip=Math.max(1,Math.ceil((rot?14:lw)/slot)); xl=rot?Math.min(60,lw*0.7+8):18;
   }else xl=18;
   var ph2=Math.max(20,H-top-bottom-xl-6),pt=top,pb=top+ph2;
   var vx=function(v){return left+(v-sc.min)/(sc.max-sc.min)*pw},vy=function(v){return pb-(v-sc.min)/(sc.max-sc.min)*ph2};
   // grade e eixo de valores
   sc.ticks.forEach(function(t){
    if(horiz){var x=vx(t);if(o.grid)out.push('<line x1="'+x+'" y1="'+pt+'" x2="'+x+'" y2="'+pb+'" stroke="currentColor" opacity="'+(t===0?.35:.12)+'"/>');out.push('<text x="'+x+'" y="'+(pb+14)+'" text-anchor="middle" font-size="10.5" fill="currentColor" opacity=".7">'+esc(fmt(t,true))+'</text>')}
    else{var y=vy(t);if(o.grid||t===0)out.push('<line x1="'+left+'" y1="'+y+'" x2="'+(left+pw)+'" y2="'+y+'" stroke="currentColor" opacity="'+(t===0?.35:.12)+'"/>');out.push('<text x="'+(left-6)+'" y="'+(y+3.5)+'" text-anchor="end" font-size="10.5" fill="currentColor" opacity=".7">'+esc(fmt(t,true))+'</text>')}
   });
   var zero=Math.max(sc.min,Math.min(sc.max,0));
   var catPos=function(i){return horiz?pt+(i+.5)*ph2/L:left+(i+.5)*pw/L};
   labels.forEach(function(l,i){
    if(i%skip)return; var p=catPos(i),tx=String(l);
    if(horiz)out.push('<text x="'+(left-6)+'" y="'+(p+4)+'" text-anchor="end" font-size="11" fill="currentColor" opacity=".8">'+esc(tx.length>Math.floor(labW/6)?tx.slice(0,Math.max(1,Math.floor(labW/6)-1))+'…':tx)+'</text>');
    else if(rot)out.push('<text transform="translate('+(p+3)+','+(pb+12)+') rotate(-35)" text-anchor="end" font-size="10.5" fill="currentColor" opacity=".8">'+esc(tx.length>14?tx.slice(0,13)+'…':tx)+'</text>');
    else out.push('<text x="'+p+'" y="'+(pb+15)+'" text-anchor="middle" font-size="11" fill="currentColor" opacity=".8">'+esc(tx)+'</text>');
   });
   if(type==='bar'||type==='hbar'){
    var cat=(horiz?ph2:pw)/L,area=cat*0.72,bw=area/S,lblOk=bw>=(horiz?10:15)||(S===1&&bw>=12);
    d.series.forEach(function(s,si){
     labels.forEach(function(l,i){
      var v=num(s.values[i]),off=(i+.5)*cat-area/2+si*bw,tip=esc(l)+(s.name?' · '+esc(s.name):'')+': '+esc(pre(v)),r,cls='data-i="'+i+'" data-s="'+si+'" class="ffc-i '+(horiz?'ffc-barh':'ffc-bar')+'"';
      if(horiz){var x0=vx(zero),x1=vx(v);r='<rect '+cls+' x="'+Math.min(x0,x1)+'" y="'+(pt+off)+'" width="'+Math.max(1,Math.abs(x1-x0))+'" height="'+Math.max(1,bw-1)+'" rx="3" fill="'+col(si)+'"><title>'+tip+'</title></rect>';
       out.push(r);if(o.showValues&&lblOk)out.push('<text x="'+(v>=0?x1+4:x1-4)+'" y="'+(pt+off+bw/2+4)+'" text-anchor="'+(v>=0?'start':'end')+'" font-size="10.5" fill="currentColor" opacity=".85" pointer-events="none">'+esc(lab(v))+'</text>')}
      else{var y0=vy(zero),y1=vy(v);r='<rect '+cls+' x="'+(left+off)+'" y="'+Math.min(y0,y1)+'" width="'+Math.max(1,bw-1)+'" height="'+Math.max(1,Math.abs(y1-y0))+'" rx="3" fill="'+col(si)+'"><title>'+tip+'</title></rect>';
       out.push(r);if(o.showValues&&lblOk)out.push('<text x="'+(left+off+bw/2)+'" y="'+(v>=0?y1-4:y1+12)+'" text-anchor="middle" font-size="10.5" fill="currentColor" opacity=".85" pointer-events="none">'+esc(lab(v))+'</text>')}
     });
    });
   }else{
    d.series.forEach(function(s,si){
     var pts=labels.map(function(l,i){return [catPos(i),vy(num(s.values[i])),num(s.values[i])]}),c=col(si),dd='';
     pts.forEach(function(p,i){
      if(!i)dd='M'+p[0]+','+p[1];
      else if(o.smooth){var q=pts[i-1],mx2=(q[0]+p[0])/2;dd+='C'+mx2+','+q[1]+' '+mx2+','+p[1]+' '+p[0]+','+p[1]}
      else dd+='L'+p[0]+','+p[1];
     });
     if(type==='area')out.push('<path class="ffc-fade" d="'+dd+'L'+pts[pts.length-1][0]+','+vy(zero)+'L'+pts[0][0]+','+vy(zero)+'Z" fill="'+c+'" opacity=".18"/>');
     out.push('<path class="ffc-fade" d="'+dd+'" fill="none" stroke="'+c+'" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>');
     if(L<=40)pts.forEach(function(p,i){
      out.push('<circle data-i="'+i+'" data-s="'+si+'" class="ffc-i ffc-pt ffc-fade" cx="'+p[0]+'" cy="'+p[1]+'" r="3.8" fill="#fff" stroke="'+c+'" stroke-width="2"><title>'+esc(labels[i])+(s.name?' · '+esc(s.name):'')+': '+esc(pre(p[2]))+'</title></circle>');
      if(o.showValues&&L<=14&&S===1)out.push('<text x="'+p[0]+'" y="'+(p[1]-9)+'" text-anchor="middle" font-size="10.5" fill="currentColor" opacity=".85" pointer-events="none">'+esc(lab(p[2]))+'</text>');
     });
    });
   }
   h.innerHTML=head+out.join('')+legSvg+'</svg>';
  }
  function schedule(h){
   if(h.__ffr)return; h.__ffr=requestAnimationFrame(function(){h.__ffr=0;draw(h)});
  }
  function draw(h){
   var play=h.__ffo&&h.__ffo.play; if(play){h.classList.add('ffc-anim');h.__ffo.play=false;clearTimeout(h.__fft);h.__fft=setTimeout(function(){h.classList.remove('ffc-anim')},800)}
   render(h); h.__ffs=(h.clientWidth||0)+'x'+(h.clientHeight||0);
  }
  var C={
   init:function(h){
    if(!h||h.__ffc)return; h.__ffc=true; css();
    h.__ffd=readData(h); h.__ffo=readOpts(h); h.__ffsel=null;
    h.addEventListener('click',function(e){
     var t=e.target&&e.target.closest?e.target.closest('[data-i]'):null; if(!t)return;
     var i=Number(t.getAttribute('data-i')),s=Number(t.getAttribute('data-s')||0),ser=h.__ffd.series[s]||{values:[]},pie=h.__ffo.type==='pie'||h.__ffo.type==='doughnut';
     var det={index:i,label:h.__ffd.labels[i]!=null?h.__ffd.labels[i]:String(i+1),value:num(ser.values[i]),series:ser.name||'',seriesIndex:s};
     h.__ffsel=det; h.dispatchEvent(new CustomEvent('select',{bubbles:true,detail:det}));
    });
    if(window.ResizeObserver){var ro=new ResizeObserver(function(){if(h.__ffs!==(h.clientWidth||0)+'x'+(h.clientHeight||0))schedule(h)});ro.observe(h)}
    C.expose(h); var w=h.closest&&h.closest('.ff-component'); if(w&&w!==h)C.expose(w,h);
    /* Desenha já no primeiro frame: requestAnimationFrame fica suspenso quando o
       preview está em segundo plano e o gráfico ficaria vazio até um resize. */
    draw(h);
   },
   initAll:function(root){(root||document).querySelectorAll('[data-ff-chart]').forEach(function(h){if(h.tagName!=='CANVAS')C.init(h)})},
   // métodos e propriedades usados pelo código: grafico.setData(...), grafico.addPoint(...), grafico.chartType = 'line'
   expose:function(el,h){
    h=h||el;
    function def(n,g,s){try{Object.defineProperty(el,n,{configurable:true,get:g,set:s})}catch(e){}}
    function fn(n,f){try{Object.defineProperty(el,n,{configurable:true,writable:true,value:f})}catch(e){}}
    function ch(){h.__ffo.play=true;schedule(h)}
    fn('setData',function(labels,values,series){
     var pv=parseValues(values),lab=list(labels),names=list(series);
     if(pv.labels&&!lab.length)lab=pv.labels;
     pv.series.forEach(function(s,i){s.name=names[i]!=null?names[i]:(s.name||(pv.series.length>1?'Série '+(i+1):(names[0]||(h.__ffd.series[0]&&pv.series.length===1?h.__ffd.series[0].name:''))))});
     h.__ffd={labels:lab,series:pv.series}; h.__ffsel=null; ch();return h.__ffd.series.length;
    });
    fn('addPoint',function(label,value){
     var d=h.__ffd,vals=Array.isArray(value)?value:[value];
     while(d.series.length<vals.length)d.series.push({name:d.series.length>1||vals.length>1?'Série '+(d.series.length+1):'',values:[]});
     var n=Math.max(d.labels.length,d.series.reduce(function(a,s){return Math.max(a,s.values.length)},0));
     while(d.labels.length<n)d.labels.push(String(d.labels.length+1));
     d.series.forEach(function(s,i){while(s.values.length<n)s.values.push(0);s.values.push(num(vals[i]))});
     d.labels.push(label==null?String(n+1):String(label));
     var mp=h.__ffo.maxPoints; if(mp>0){while(d.labels.length>mp){d.labels.shift();d.series.forEach(function(s){s.values.shift()})}}
     schedule(h);return d.labels.length;
    });
    fn('clear',function(){h.__ffd={labels:[],series:[]};h.__ffsel=null;schedule(h)});
    fn('getData',function(){return JSON.parse(JSON.stringify(h.__ffd))});
    fn('refresh',function(){ch()});
    fn('toImage',function(){return new Promise(function(ok,no){
     try{var svg=h.querySelector('svg'),w=h.clientWidth||320,hh=h.clientHeight||200,x=new XMLSerializer().serializeToString(svg).replace('<svg ','<svg width="'+w+'" height="'+hh+'" ');
      var img=new Image();img.onload=function(){var c=document.createElement('canvas');c.width=w*2;c.height=hh*2;var g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);ok(c.toDataURL('image/png'))};
      img.onerror=no;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(x.replace(/currentColor/g,getComputedStyle(h).color||'#222'))}catch(e){no(e)}})});
    fn('download',function(name){return el.toImage().then(function(u){var a=document.createElement('a');a.href=u;a.download=(name||'grafico')+'.png';document.body.appendChild(a);a.click();a.remove();return true})});
    def('chartType',function(){return h.__ffo.type},function(v){h.__ffo.type=String(v);ch()});
    def('chartTitle',function(){return h.__ffo.title},function(v){h.__ffo.title=String(v==null?'':v);schedule(h)});
    def('legend',function(){return h.__ffo.legend},function(v){h.__ffo.legend=!!v;schedule(h)});
    def('showValues',function(){return h.__ffo.showValues},function(v){h.__ffo.showValues=!!v;schedule(h)});
    def('maxPoints',function(){return h.__ffo.maxPoints},function(v){h.__ffo.maxPoints=Math.max(0,Math.floor(num(v)));schedule(h)});
    def('labels',function(){return h.__ffd.labels.slice()},function(v){el.setData(v,h.__ffd.series.map(function(s){return s.values}),h.__ffd.series.map(function(s){return s.name}))});
    def('values',function(){return h.__ffd.series.length===1?h.__ffd.series[0].values.slice():h.__ffd.series.map(function(s){return s.values.slice()})},function(v){var pv=parseValues(v);h.__ffd.series=pv.series.map(function(s,i){s.name=(h.__ffd.series[i]&&h.__ffd.series[i].name)||'';return s});if(pv.labels)h.__ffd.labels=pv.labels;ch()});
    def('selected',function(){return h.__ffsel||null},function(){});
   }
  };
  window.FlowForgeChart=C;
  function boot(){
   C.initAll(document);
   var q=0;new MutationObserver(function(){if(q)return;q=requestAnimationFrame(function(){q=0;C.initAll(document)})}).observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
 }
 window.FlowForgeChartRuntime='('+engine.toString()+')();';
 engine();

 // ---- editor: propriedades, marcação e registro ----
 var DEMO={labels:'Jan,Fev,Mar,Abr,Mai,Jun',values:'[12,19,8,15,22,17]'};
 window.FlowForgeChartMarkup=function(x){
  x=x||{};
  var a=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')};
  var hasData=(x.values!==undefined&&x.values!==null&&String(x.values).trim()!=='');
  return '<div class="ff-chart2" data-ff-chart="true" data-type="'+a(x.chartType||'bar')+'" data-labels="'+a(hasData?(x.chartLabels||''):(x.chartLabels||DEMO.labels))+'" data-values="'+a(hasData?x.values:DEMO.values)+'" data-series="'+a(x.chartSeries||'')+'" data-title="'+a(x.chartTitle!==undefined?x.chartTitle:(x.text&&x.text!=='Gráfico'?x.text:''))+'" data-legend="'+(x.legend===false?'false':'true')+'" data-show-values="'+(x.showValues===false?'false':'true')+'" data-grid="'+(x.chartGrid===false?'false':'true')+'" data-smooth="'+(x.smooth?'true':'false')+'" data-colors="'+a(x.chartColors||'')+'" data-prefix="'+a(x.valuePrefix||'')+'" data-suffix="'+a(x.valueSuffix||'')+'" data-y-min="'+a(x.yMin==null?'':x.yMin)+'" data-y-max="'+a(x.yMax==null?'':x.yMax)+'" data-max-points="'+a(x.maxPoints||0)+'" data-animate="'+(x.animate===false?'false':'true')+'" data-w="'+parseInt(x.width||320,10)+'" data-h="'+parseInt(x.height||180,10)+'"></div>';
 };
 window.FlowForgeChartSchema=[
  {key:'chartType',label:'Tipo de gráfico',type:'select',options:['bar','hbar','line','area','pie','doughnut']},
  {key:'chartTitle',label:'Título do gráfico',type:'text'},
  {key:'chartLabels',label:'Rótulos (separados por vírgula)',type:'textarea'},
  {key:'values',label:'Valores (JSON: [1,2,3] ou [[..],[..]])',type:'textarea'},
  {key:'chartSeries',label:'Nomes das séries (vírgula)',type:'text'},
  {key:'legend',label:'Mostrar legenda',type:'checkbox'},
  {key:'showValues',label:'Mostrar valores',type:'checkbox'},
  {key:'chartGrid',label:'Mostrar grade',type:'checkbox'},
  {key:'smooth',label:'Linha suave',type:'checkbox'},
  {key:'chartColors',label:'Cores (ex.: #4f46e5,#10b981)',type:'text'},
  {key:'valuePrefix',label:'Prefixo dos valores (ex.: R$ )',type:'text'},
  {key:'valueSuffix',label:'Sufixo dos valores (ex.: %)',type:'text'},
  {key:'yMin',label:'Mínimo do eixo (vazio = automático)',type:'number'},
  {key:'yMax',label:'Máximo do eixo (vazio = automático)',type:'number'},
  {key:'maxPoints',label:'Máximo de pontos (0 = sem limite)',type:'number',min:0},
  {key:'animate',label:'Animar',type:'checkbox'}
 ];
 var R=window.FlowForge&&window.FlowForge.components;
 if(R&&R.register)R.register('chart',{
  title:'Chart',category:'Dados',
  defaults:{name:'Grafico1',width:360,height:240,text:'Gráfico',chartType:'bar',chartTitle:'Vendas por mês',chartLabels:DEMO.labels,values:DEMO.values,chartSeries:'Vendas',legend:true,showValues:true,chartGrid:true,smooth:false,animate:true},
  event:'select',events:['select'],
  render:function(ctx){return window.FlowForgeChartMarkup((ctx&&ctx.item)||{})}
 });
})();
