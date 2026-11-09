from lib import *
# ---------- Calculadoras (multipágina) ----------
def nav(prefix,y,current):
    names=[('IMC','imc'),('Gorjeta','tip'),('Juros','inv')]
    out=[]
    for i,(n,k) in enumerate(names):
        out.append(it('button',f'{prefix}Nav{k}',n,24+i*142,y,134,40,{"click":f'ffNavigate("{n}");'},bg=BTN if n==current else '#ffffff',color='#ffffff' if n==current else '#222222'))
    return out
imc_calc="""var p=Number(imcPeso.value.replace(',','.')),a=Number(imcAltura.value.replace(',','.'));if(a>3)a=a/100;if(!(p>0)||!(a>0)){imcResult.textContent='Informe peso (kg) e altura (m)';imcClass.textContent='';return}var v=p/(a*a),c=v<18.5?'Abaixo do peso':v<25?'Peso normal':v<30?'Sobrepeso':v<35?'Obesidade grau I':v<40?'Obesidade grau II':'Obesidade grau III';imcResult.textContent='IMC: '+v.toFixed(1).replace('.',',');imcClass.textContent=c;"""
tip_calc="""var b=Number(tipConta.value.replace(',','.')),pct=Number(tipPct.value),n=Math.max(1,Math.floor(Number(tipPessoas.value)||1));if(!(b>0)){tipResult.textContent='Informe o valor da conta';tipPerson.textContent='';return}var tip=b*pct/100,tot=b+tip,f=function(x){return 'R$ '+x.toFixed(2).replace('.',',')};tipResult.textContent='Total: '+f(tot)+' (gorjeta '+f(tip)+')';tipPerson.textContent='Por pessoa ('+n+'): '+f(tot/n);"""
inv_calc="""var c=Number(invCap.value.replace(',','.')),m=Number(invMes.value.replace(',','.')),r=Number(invTaxa.value.replace(',','.'))/100,n=Math.floor(Number(invMeses.value));if(!(c>=0)||!(n>0)||!(r>=0)||invCap.value===''||invTaxa.value===''){invResult.textContent='Preencha capital, taxa e meses';invGain.textContent='';return}m=m||0;var s=c;for(var i=0;i<n;i++){s=s*(1+r)+m}var put=c+m*n,f=function(x){return 'R$ '+x.toFixed(2).replace('.',',')};invResult.textContent='Montante: '+f(s);invGain.textContent='Investido '+f(put)+' · Juros '+f(s-put);"""
p1=[it('heading','imcTitle','Calculadora de IMC',24,16,420,48,bg='transparent')]+nav('imc',70,'IMC')+[
 it('input','imcPeso','Peso (kg)',24,126,200,44),
 it('input','imcAltura','Altura (m)',244,126,200,44),
 it('button','imcCalc','Calcular',24,186,180,44,{"click":imc_calc},bg=BTN,color='#ffffff'),
 it('label','imcResult','IMC: —',24,246,420,55,{},bg='#eef2ff',fontSize=16),
 it('label','imcClass','',24,350,420,50,{},bg='#eef2ff',fontSize=16)]
p2=[it('heading','tipTitle','Gorjeta e Divisão',24,16,420,48,bg='transparent')]+nav('tip',70,'Gorjeta')+[
 it('input','tipConta','Valor da conta (R$)',24,126,420,44),
 it('select','tipPct','Gorjeta',24,182,200,44,{},items=['0','5','10','12','15','20']),
 it('input','tipPessoas','Pessoas',244,182,200,44),
 it('button','tipCalc','Calcular',24,242,180,44,{"click":tip_calc},bg=BTN,color='#ffffff'),
 it('label','tipResult','Total: —',24,302,420,55,{},bg='#eef2ff',fontSize=16),
 it('label','tipPerson','',24,406,420,50,{},bg='#eef2ff',fontSize=16)]
p3=[it('heading','invTitle','Juros Compostos',24,16,420,48,bg='transparent')]+nav('inv',70,'Juros')+[
 it('input','invCap','Capital inicial (R$)',24,126,200,44),
 it('input','invMes','Aporte mensal (R$)',244,126,200,44),
 it('input','invTaxa','Taxa ao mês (%)',24,182,200,44),
 it('input','invMeses','Meses',244,182,200,44),
 it('button','invCalc','Calcular',24,242,180,44,{"click":inv_calc},bg=BTN,color='#ffffff'),
 it('label','invResult','Montante: —',24,302,420,55,{},bg='#eef2ff',fontSize=16),
 it('label','invGain','',24,406,420,50,{},bg='#eef2ff',fontSize=16)]
save('Calculadoras_Multipagina',proj('Calculadoras',[('IMC',p1),('Gorjeta',p2),('Juros',p3)]))
