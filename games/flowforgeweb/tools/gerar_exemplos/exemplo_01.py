from lib import *
# ---------- Lista de Tarefas ----------
P="""var $=function(i){return document.getElementById(i)};if(!window.ffTodo){var T=window.ffTodo={items:[],filter:'Todas',id:0};try{T.items=JSON.parse(localStorage.getItem('ffTodoV1')||'[]')}catch(e){}T.id=T.items.reduce(function(m,t){return Math.max(m,t.id)},0);T.save=function(){try{localStorage.setItem('ffTodoV1',JSON.stringify(T.items))}catch(e){}};T.render=function(){var box=$('todoList');box.innerHTML='';var vis=T.items.filter(function(t){return T.filter==='Todas'||(T.filter==='Pendentes'?!t.done:t.done)});vis.forEach(function(t){var r=document.createElement('div');r.className='todo-row';r.dataset.id=t.id;r.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px solid #e5e7eb';var c=document.createElement('input');c.type='checkbox';c.checked=t.done;c.setAttribute('aria-label','Concluir');c.onchange=function(){t.done=c.checked;T.save();T.render()};var s=document.createElement('span');s.textContent=t.text;s.style.cssText='flex:1;'+(t.done?'text-decoration:line-through;color:#9ca3af':'');var x=document.createElement('button');x.textContent='✕';x.title='Remover';x.className='todo-del';x.style.cssText='border:0;background:transparent;color:#ef4444;cursor:pointer;font-size:16px';x.onclick=function(){T.items=T.items.filter(function(i){return i!==t});T.save();T.render()};r.append(c,s,x);box.appendChild(r)});if(!vis.length){var e=document.createElement('div');e.textContent=T.items.length?'Nada neste filtro.':'Nenhuma tarefa. Adicione a primeira!';e.style.cssText='padding:14px;color:#9ca3af;text-align:center';box.appendChild(e)}var left=T.items.filter(function(t){return!t.done}).length;$('todoCount').textContent=left===1?'1 tarefa pendente':left+' tarefas pendentes'};T.add=function(){var f=$('todoInput'),v=f.value.trim();if(!v){$('todoCount').textContent='Digite uma tarefa';return}T.items.push({id:++T.id,text:v,done:false});f.value='';T.save();T.render();f.focus()};T.render()}"""
add=P+"window.ffTodo.add();"
kd=P+"if(event.key==='Enter'){window.ffTodo.add()}"
flt=P+"window.ffTodo.filter=event.target.value;window.ffTodo.render();"
clr=P+"var T=window.ffTodo;T.items=T.items.filter(function(t){return!t.done});T.save();T.render();"
rend=P
items=[
 it('heading','todoTitle','Lista de Tarefas',24,16,400,48,bg='transparent'),
 it('input','todoInput','Nova tarefa...',24,76,300,44,{"keydown":kd}),
 it('button','todoAdd','Adicionar',336,76,100,44,{"click":add},bg=BTN,color='#ffffff'),
 it('select','todoFilter','Filtro',24,132,160,40,{"change":flt},items=['Todas','Pendentes','Concluídas']),
 it('label','todoCount','0 tarefas pendentes',200,136,236,32,bg='transparent'),
 it('section','todoList','',24,184,412,300,bg='#ffffff'),
 it('button','todoClear','Limpar concluídas',24,498,180,44,{"click":clr}),
 it('label','todoHint','As tarefas ficam salvas neste navegador.',216,504,220,32,bg='transparent',color='#6b7280'),
]
save('Lista_de_Tarefas',proj('Lista de Tarefas',[('Principal',items,{'onload':P})]))
