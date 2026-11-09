// FlowForge WebStudio v0.8.1
['datagrid','chart','calendar','tabcontrol','drawer','bottomsheet','camera','qrcode','listview','treeview','statcard','rating','timeline','stepper','sidebar','toolbar','footer','fileupload','colorpicker','avatar'].forEach(kind=>{
 FlowForgeRegistry.register({kind,version:1,responsive:true,properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor(kind):[]});
});

// TabControl: abas internas com painéis, teclado (setas/Home/End) e evento change.
FlowForgeRegistry.register({kind:'tabcontrol',version:2,responsive:true,event:'change',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('tabcontrol'):[],defaults:{activeTab:0,tabs:[{label:'Geral',content:'Conteúdo da aba Geral.'},{label:'Detalhes',content:'Conteúdo da aba Detalhes.'},{label:'Histórico',content:'Conteúdo da aba Histórico.'}]}});

// Formulário e entrada.
FlowForgeRegistry.register({kind:'searchbar',version:1,responsive:true,event:'search',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('searchbar'):[],defaults:{text:'Buscar...',placeholder:'Buscar...',showClear:true}});
FlowForgeRegistry.register({kind:'passwordbox',version:1,responsive:true,event:'input',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('passwordbox'):[],defaults:{text:'Senha',placeholder:'Digite sua senha'}});
FlowForgeRegistry.register({kind:'numberbox',version:1,responsive:true,event:'change',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('numberbox'):[],defaults:{value:0,min:0,max:100,step:1}});
FlowForgeRegistry.register({kind:'segmentedcontrol',version:1,responsive:true,event:'change',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('segmentedcontrol'):[],defaults:{items:['Dia','Semana','Mês'],activeIndex:0}});

// Feedback e estados.
FlowForgeRegistry.register({kind:'skeleton',version:1,responsive:true,properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('skeleton'):[],defaults:{lines:3}});
FlowForgeRegistry.register({kind:'progressring',version:1,responsive:true,event:'change',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('progressring'):[],defaults:{value:65,min:0,max:100,barColor:'#3b82f6',showText:true}});
FlowForgeRegistry.register({kind:'emptystate',version:1,responsive:true,event:'action',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('emptystate'):[],defaults:{text:'Nenhum item encontrado',description:'Adicione o primeiro item para começar.',actionText:'Criar'}});

// Conteúdo e mídia.
FlowForgeRegistry.register({kind:'codeblock',version:1,responsive:true,event:'copy',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('codeblock'):[],defaults:{code:"const hello = 'FlowForge';\nconsole.log(hello);",language:'javascript',showCopy:true}});
FlowForgeRegistry.register({kind:'chat',version:1,responsive:true,event:'send',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('chat'):[],defaults:{items:[{from:'them',text:'Olá! Como posso ajudar?'},{from:'me',text:'Quero conhecer o FlowForge.'}],placeholder:'Mensagem...',sendText:'Enviar'}});
FlowForgeRegistry.register({kind:'signaturepad',version:1,responsive:true,event:'save',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('signaturepad'):[],defaults:{text:'Assine aqui',penColor:'#111827',lineWidth:2}});

// Menus e tema.
FlowForgeRegistry.register({kind:'dropdownmenu',version:1,responsive:true,event:'select',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('dropdownmenu'):[],defaults:{text:'Ações',items:['Editar','Duplicar','Excluir']}});
FlowForgeRegistry.register({kind:'popover',version:1,responsive:true,event:'toggle',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('popover'):[],defaults:{text:'Mais informações',content:'Conteúdo exibido ao abrir o popover.',placement:'bottom'}});
FlowForgeRegistry.register({kind:'themetoggle',version:1,responsive:true,event:'change',properties:window.FlowForgePropertySchemaFor?FlowForgePropertySchemaFor('themetoggle'):[],defaults:{text:'Tema'}});

// Componentes Web reais: iframe, canvas, mapa e QR Code.
FlowForgeRegistry.register({kind:'iframe',version:2,responsive:true,properties:window.FlowForgePropertySchemaFor('iframe'),defaults:{src:'about:blank',lazy:true}});
FlowForgeRegistry.register({kind:'canvas',version:2,responsive:true,properties:window.FlowForgePropertySchemaFor('canvas'),defaults:{canvasWidth:300,canvasHeight:180,canvasBackground:'#ffffff'}});
FlowForgeRegistry.register({kind:'map',version:2,responsive:true,properties:window.FlowForgePropertySchemaFor('map'),defaults:{mapProvider:'google',mapAddress:'',mapLat:0,mapLng:0,mapZoom:13}});
FlowForgeRegistry.register({kind:'qrcode',version:2,responsive:true,properties:window.FlowForgePropertySchemaFor('qrcode'),defaults:{qrcodeSize:160,textContent:'https://flowforge.local'}});

// Rodada adicional de componentes HTML nativos.
FlowForgeRegistry.register({kind:'meterbar',version:1,responsive:true,properties:FlowForgePropertySchemaFor('meterbar'),defaults:{text:'Medidor',min:0,max:100,value:50}});
FlowForgeRegistry.register({kind:'detailsbox',version:1,responsive:true,properties:FlowForgePropertySchemaFor('detailsbox'),defaults:{text:'Mais detalhes',description:'Informações adicionais.'}});
FlowForgeRegistry.register({kind:'textcounter',version:1,responsive:true,event:'input',properties:FlowForgePropertySchemaFor('textcounter'),defaults:{text:'',placeholder:'Digite aqui',maxLength:200}});
