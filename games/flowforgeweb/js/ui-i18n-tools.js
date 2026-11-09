/* FlowForge WebStudio - Toolbox localization.
 * Translates only the editor chrome of the Toolbox: tool names, group headings and tooltips.
 * It never touches component identifiers (textBox1, button1...), project text or generated code.
 *
 * - pt-BR: Portuguese names (TextBox -> "Caixa de texto").
 * - en:    keeps the technical names the editor always used (TextBox, PictureBox...).
 * - es:    Spanish names.
 * Tool kinds are the stable keys (see TOOL_GROUPS in app.js); names missing here fall back to the original.
 */
(function(w){'use strict';
  const LANGS=['pt-BR','en','es'];

  const GROUPS={
    'pt-BR':{'Básicos':'Básicos','Formulários':'Formulários','Layout':'Layout','Navegação':'Navegação','Dados':'Dados','Feedback':'Feedback','Mídia / Web':'Mídia / Web','GAMES':'Jogos','Não Visuais':'Não visuais','FlowForge Components':'Componentes FlowForge'},
    en:{'Básicos':'Basics','Formulários':'Forms','Layout':'Layout','Navegação':'Navigation','Dados':'Data','Feedback':'Feedback','Mídia / Web':'Media / Web','GAMES':'Games','Não Visuais':'Non-visual','FlowForge Components':'FlowForge Components'},
    es:{'Básicos':'Básicos','Formulários':'Formularios','Layout':'Diseño','Navegação':'Navegación','Dados':'Datos','Feedback':'Avisos','Mídia / Web':'Multimedia / Web','GAMES':'Juegos','Não Visuais':'No visuales','FlowForge Components':'Componentes FlowForge'}
  };

  const TOOLS={
    'pt-BR':{
      /* Básicos */
      label:'Rótulo',heading:'Título',button:'Botão',link:'Link',image:'Imagem',picturebox:'Caixa de imagem',icon:'Ícone',divider:'Divisor',spacer:'Espaçador',
      panel:'Painel',groupbox:'Caixa de grupo',flexpanel:'Painel flexível',gridpanel:'Painel em grade',stackpanel:'Painel empilhado',scrollpanel:'Painel rolável',
      /* Formulários */
      input:'Caixa de texto',textarea:'Área de texto',checkbox:'Caixa de seleção',radio:'Botão de opção',switch:'Interruptor',select:'Lista suspensa',combobox:'Caixa de combinação',
      listbox:'Caixa de lista',range:'Controle deslizante',date:'Data',time:'Hora',file:'Envio de arquivo',form:'Formulário',
      /* Layout */
      container:'Contêiner',section:'Seção',card:'Cartão',row:'Linha / Flex',columns:'Colunas / Grade',hero:'Destaque (Hero)',
      /* Navegação */
      navbar:'Barra de navegação',bottomnav:'Navegação inferior',tabs:'Abas',tabcontrol:'Controle de abas',drawer:'Gaveta',bottomsheet:'Painel inferior',sidebar:'Barra lateral',
      toolbar:'Barra de ferramentas',header:'Cabeçalho',footer:'Rodapé',breadcrumb:'Trilha de navegação',pagination:'Paginação',pagenav:'Navegação de páginas',fab:'Botão flutuante',
      /* Dados */
      list:'Lista',table:'Tabela',datagrid:'Grade de dados',chart:'Gráfico',calendar:'Calendário',listview:'Exibição em lista',treeview:'Exibição em árvore',statcard:'Cartão de estatística',
      rating:'Avaliação',timeline:'Linha do tempo',stepper:'Passo a passo',badge:'Selo',progress:'Barra de progresso',spinner:'Carregamento',accordion:'Acordeão',
      /* Feedback */
      alert:'Alerta',modalbox:'Janela modal',toast:'Notificação rápida',
      /* Mídia / Web */
      video:'Vídeo',audio:'Áudio',camera:'Câmera',fileupload:'Envio de arquivo',colorpicker:'Seletor de cor',avatar:'Avatar',modal:'Janela modal',tooltip:'Dica de ferramenta',
      carousel:'Carrossel',iframe:'iFrame / Web',canvas:'Tela (Canvas)',map:'Mapa',qrcode:'QR Code',
      /* Jogos */
      gamecanvas:'Tela do jogo',sprite:'Sprite',spritesheet:'Folha de sprites',collisionarea:'Área de colisão',keyboardinput:'Entrada de teclado',gamepadinput:'Entrada de controle',
      gametimer:'Cronômetro do jogo',gamesound:'Som do jogo',scorelabel:'Placar',healthbar:'Barra de vida',joystick:'Joystick virtual',
      /* Não visuais */
      timer:'Temporizador',http:'HTTP / API',websocket:'WebSocket',storage:'Armazenamento local',geolocation:'Geolocalização',notification:'Notificação',clipboard:'Área de transferência',
      network:'Status da rede',vibration:'Vibração',
      /* Componentes FlowForge */
      battery:'Indicador de bateria',thermometer:'Termômetro',led:'Indicador LED',sevenseg:'7 segmentos',dotmatrix:'Matriz de pontos',sparkline:'Minigráfico',valuecard:'Cartão de valor',
      statuscard:'Cartão de status',glasspanel:'Painel de vidro',gradientbutton:'Botão com gradiente',iconbutton:'Botão de ícone',mobilelist:'Lista mobile',
      searchbar:'Barra de busca',passwordbox:'Caixa de senha',numberbox:'Caixa numérica',segmentedcontrol:'Controle segmentado',
      skeleton:'Esqueleto de carregamento',progressring:'Anel de progresso',emptystate:'Estado vazio',
      codeblock:'Bloco de código',chat:'Chat',signaturepad:'Assinatura digital',
      dropdownmenu:'Menu suspenso',popover:'Popover',themetoggle:'Alternador de tema'
    },
    /* English keeps the technical names already shown by the editor (original names are the fallback). */
    en:{},
    es:{
      /* Básicos */
      label:'Etiqueta',heading:'Título',button:'Botón',link:'Enlace',image:'Imagen',picturebox:'Cuadro de imagen',icon:'Icono',divider:'Divisor',spacer:'Espaciador',
      panel:'Panel',groupbox:'Cuadro de grupo',flexpanel:'Panel flexible',gridpanel:'Panel de cuadrícula',stackpanel:'Panel apilado',scrollpanel:'Panel desplazable',
      /* Formularios */
      input:'Cuadro de texto',textarea:'Área de texto',checkbox:'Casilla de verificación',radio:'Botón de opción',switch:'Interruptor',select:'Lista desplegable',combobox:'Cuadro combinado',
      listbox:'Cuadro de lista',range:'Control deslizante',date:'Fecha',time:'Hora',file:'Subir archivo',form:'Formulario',
      /* Diseño */
      container:'Contenedor',section:'Sección',card:'Tarjeta',row:'Fila / Flex',columns:'Columnas / Cuadrícula',hero:'Hero (destacado)',
      /* Navegación */
      navbar:'Barra de navegación',bottomnav:'Navegación inferior',tabs:'Pestañas',tabcontrol:'Control de pestañas',drawer:'Cajón',bottomsheet:'Hoja inferior',sidebar:'Barra lateral',
      toolbar:'Barra de herramientas',header:'Encabezado',footer:'Pie de página',breadcrumb:'Ruta de navegación',pagination:'Paginación',pagenav:'Navegación de páginas',fab:'Botón flotante',
      /* Datos */
      list:'Lista',table:'Tabla',datagrid:'Cuadrícula de datos',chart:'Gráfico',calendar:'Calendario',listview:'Vista de lista',treeview:'Vista de árbol',statcard:'Tarjeta de estadística',
      rating:'Valoración',timeline:'Línea de tiempo',stepper:'Pasos',badge:'Insignia',progress:'Barra de progreso',spinner:'Carga',accordion:'Acordeón',
      /* Avisos */
      alert:'Alerta',modalbox:'Ventana modal',toast:'Aviso emergente',
      /* Multimedia / Web */
      video:'Vídeo',audio:'Audio',camera:'Cámara',fileupload:'Subir archivo',colorpicker:'Selector de color',avatar:'Avatar',modal:'Ventana modal',tooltip:'Descripción emergente',
      carousel:'Carrusel',iframe:'iFrame / Web',canvas:'Lienzo (Canvas)',map:'Mapa',qrcode:'Código QR',
      /* Juegos */
      gamecanvas:'Lienzo del juego',sprite:'Sprite',spritesheet:'Hoja de sprites',collisionarea:'Área de colisión',keyboardinput:'Entrada de teclado',gamepadinput:'Entrada de mando',
      gametimer:'Temporizador del juego',gamesound:'Sonido del juego',scorelabel:'Marcador',healthbar:'Barra de vida',joystick:'Joystick virtual',
      /* No visuales */
      timer:'Temporizador',http:'HTTP / API',websocket:'WebSocket',storage:'Almacenamiento local',geolocation:'Geolocalización',notification:'Notificación',clipboard:'Portapapeles',
      network:'Estado de la red',vibration:'Vibración',
      /* Componentes FlowForge */
      battery:'Indicador de batería',thermometer:'Termómetro',led:'Indicador LED',sevenseg:'7 segmentos',dotmatrix:'Matriz de puntos',sparkline:'Minigráfico',valuecard:'Tarjeta de valor',
      statuscard:'Tarjeta de estado',glasspanel:'Panel de cristal',gradientbutton:'Botón con degradado',iconbutton:'Botón de icono',mobilelist:'Lista móvil',
      searchbar:'Barra de búsqueda',passwordbox:'Cuadro de contraseña',numberbox:'Cuadro numérico',segmentedcontrol:'Control segmentado',
      skeleton:'Esqueleto de carga',progressring:'Anillo de progreso',emptystate:'Estado vacío',
      codeblock:'Bloque de código',chat:'Chat',signaturepad:'Firma digital',
      dropdownmenu:'Menú desplegable',popover:'Popover',themetoggle:'Alternador de tema'
    }
  };

  const language=()=>{const l=w.FlowForgeI18n?.getLanguage?.();return LANGS.includes(l)?l:'pt-BR'};
  /* lower case + no accents, so "rotulo" finds "Rótulo" and "formularios" finds "Formulários" */
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

  /* Display name of a tool in the current language (fallback: the original name). */
  function name(kind,fallback){return TOOLS[language()]?.[kind]||fallback}
  /* Display name of a toolbox group in the current language. */
  function group(key){return GROUPS[language()]?.[key]||key}
  /* Toolbox search: matches the shown name, the original (technical) name and the group, ignoring accents. */
  function matches(filter,groupKey,kind,originalName){
    const q=norm(String(filter||'').trim());
    if(!q)return true;
    return norm([name(kind,originalName),originalName,group(groupKey),groupKey].join(' ')).includes(q);
  }

  /* Name of a component TYPE in the current language, for the tree, target selectors and the properties header.
     (falls back to the original tool name, then to the raw kind, e.g. 'titlebar') */
  let originals=null;
  function kindLabel(kind){
    const tr=TOOLS[language()]?.[kind];
    if(tr)return tr;
    if(!originals&&typeof TOOL_GROUPS!=='undefined'){
      originals={};
      Object.values(TOOL_GROUPS).forEach(list=>list.forEach(x=>{if(!originals[x[0]])originals[x[0]]=x[2]}));
    }
    return (originals&&originals[kind])||kind;
  }

  w.FlowForgeToolI18n={name,group,matches,kindLabel,language,languages:LANGS,dictionary:()=>({tools:TOOLS,groups:GROUPS})};
})(window);
