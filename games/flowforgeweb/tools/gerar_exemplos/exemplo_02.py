from lib import *
# ---------- Conversor de Unidades ----------
P="""var $=function(i){return document.getElementById(i)};if(!window.ffConv){var C=window.ffConv={U:{'Comprimento':{'Metro':1,'Quilômetro':1000,'Centímetro':0.01,'Milha':1609.344,'Pé':0.3048,'Polegada':0.0254},'Massa':{'Quilograma':1,'Grama':0.001,'Libra':0.45359237,'Onça':0.028349523125,'Tonelada':1000},'Volume':{'Litro':1,'Mililitro':0.001,'Galão (US)':3.785411784,'Metro cúbico':1000,'Copo (240 ml)':0.24},'Temperatura':{'Celsius':1,'Fahrenheit':1,'Kelvin':1}}};C.fill=function(sel,names,keep){sel.innerHTML='';names.forEach(function(n){var o=document.createElement('option');o.value=o.textContent=n;sel.appendChild(o)});if(keep&&names.indexOf(keep)>=0)sel.value=keep};C.cat=function(){var names=Object.keys(C.U[$('convCat').value]);C.fill($('convFrom'),names);C.fill($('convTo'),names);$('convFrom').selectedIndex=0;$('convTo').selectedIndex=Math.min(1,names.length-1)};C.temp=function(v,a,b){var c=a==='Celsius'?v:a==='Fahrenheit'?(v-32)*5/9:v-273.15;return b==='Celsius'?c:b==='Fahrenheit'?c*9/5+32:c+273.15};C.run=function(){var raw=$('convValue').value.replace(',','.').trim(),v=Number(raw),r0=$('convResult'),r=r0.querySelector('small')||r0;if(raw===''||!isFinite(v)){r.textContent='Digite um número';return}var cat=$('convCat').value,a=$('convFrom').value,b=$('convTo').value,out;if(cat==='Temperatura')out=C.temp(v,a,b);else out=v*C.U[cat][a]/C.U[cat][b];var s=Number(out.toPrecision(10)).toLocaleString('pt-BR',{maximumFractionDigits:6});r.textContent=raw.replace('.',',')+' '+a+' = '+s+' '+b};C.cat()}"""
conv=P+"window.ffConv.run();"
cat=P+"window.ffConv.cat();window.ffConv.run();"
swap=P+"var f=$('convFrom'),t=$('convTo'),x=f.value;f.value=t.value;t.value=x;window.ffConv.run();"
items=[
 it('heading','convTitle','Conversor de Unidades',24,16,420,48,bg='transparent'),
 it('select','convCat','Categoria',24,80,420,44,{"change":cat},items=['Comprimento','Massa','Volume','Temperatura']),
 it('input','convValue','Valor',24,140,420,44,{"input":conv},value=''),
 it('select','convFrom','De',24,200,190,44,{"change":conv},items=['Metro']),
 it('select','convTo','Para',254,200,190,44,{"change":conv},items=['Metro']),
 it('button','convSwap','⇄ Inverter',24,260,180,44,{"click":swap}),
 it('label','convResult','Digite um número',24,320,420,60,{},bg='#eef2ff',fontSize=16),
]
save('Conversor_de_Unidades',proj('Conversor de Unidades',[('Principal',items,{'onload':P})]))
