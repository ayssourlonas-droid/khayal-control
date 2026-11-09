// Timer property metadata
addEventListener('DOMContentLoaded',()=>{
 window.FlowForgeTimerSchema=[
  {key:'name',label:'Name',type:'text'},
  {key:'interval',label:'Interval (ms)',type:'number',min:10},
  {key:'enabled',label:'Enabled',type:'checkbox'},
  {key:'oneShot',label:'Executar uma vez',type:'checkbox'}
 ];
});
