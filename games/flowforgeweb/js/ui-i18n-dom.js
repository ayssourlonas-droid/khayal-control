/* FlowForge WebStudio - UI text translator (pt-BR / en / es).
 *
 * The editor builds many panels from code (properties, actions, project panel, drawers, dialogs, tooltips,
 * messages) and part of its source text was written in a mix of Portuguese and English. This module gives
 * every piece of editor chrome ONE dictionary entry with its three versions. Whatever variant is found in
 * the DOM (the Portuguese source, the old English word, an already translated text) is recognised and shown
 * in the current language, so switching languages back and forth never needs to remember an "original".
 *
 * What it translates: text nodes, option text and the placeholder / title / aria-label attributes of the
 * editor UI, plus the text of alert() / confirm() / prompt().
 * What it NEVER touches: form values, <textarea>, [contenteditable] (WYSIWYG), the design stage, the code
 * editor, the preview, the toolbox (handled by ui-i18n-tools.js), page / component names and anything else
 * the user wrote. Only EXACT dictionary matches are translated, never fragments of a sentence.
 *
 * Entry format: [pt, en, es, options]. Options: {alias:[extra source variants], scope:'css selector'}.
 * "{0}" in a text is a placeholder for a dynamic part (e.g. 'definir {0}').
 */
(function(w,d){'use strict';
  const LANGS=['pt-BR','en','es'];
  const IDX={'pt-BR':0,en:1,es:2};

  const E=[
    /* ---------- empacotar para Android ---------- */
    ['Empacotar para Android','Package for Android','Empaquetar para Android'],
    ['O FlowForge gera um pacote (.zip) pronto para virar APK. A compilação em si acontece no GitHub, no PWABuilder ou no Android Studio, conforme o formato escolhido.','FlowForge creates a package (.zip) ready to become an APK. The build itself happens on GitHub, in PWABuilder or in Android Studio, depending on the chosen format.','FlowForge genera un paquete (.zip) listo para convertirse en APK. La compilación ocurre en GitHub, en PWABuilder o en Android Studio, según el formato elegido.'],
    ['Capacitor + build na nuvem','Capacitor + cloud build','Capacitor + compilación en la nube'],
    ['Projeto Capacitor com um workflow do GitHub Actions que compila o APK sozinho. Não precisa instalar nada.','Capacitor project with a GitHub Actions workflow that builds the APK by itself. Nothing to install.','Proyecto Capacitor con un workflow de GitHub Actions que compila el APK solo. No hay que instalar nada.'],
    ['PWA + PWABuilder','PWA + PWABuilder','PWA + PWABuilder'],
    ['App web instalável (manifest, service worker, ícones). Gere o APK/AAB no pwabuilder.com. Precisa de hospedagem HTTPS.','Installable web app (manifest, service worker, icons). Create the APK/AAB at pwabuilder.com. Needs HTTPS hosting.','App web instalable (manifest, service worker, iconos). Genera el APK/AAB en pwabuilder.com. Requiere hosting HTTPS.'],
    ['Projeto Android Studio','Android Studio project','Proyecto Android Studio'],
    ['Projeto Android nativo (WebView) para abrir no Android Studio e compilar no seu computador.','Native Android project (WebView) to open in Android Studio and build on your computer.','Proyecto Android nativo (WebView) para abrir en Android Studio y compilar en tu computadora.'],
    ['Exportar','Export','Exportar'],
    ['Nome do app','App name','Nombre de la app'],
    ['Versão','Version','Versión'],
    ['ID do pacote','Package ID','ID del paquete'],
    ['Código da versão','Version code','Código de versión'],
    ['Orientação','Orientation','Orientación'],
    ['Automática','Automatic','Automática'],
    ['Retrato','Portrait','Vertical'],
    ['Paisagem','Landscape','Horizontal'],
    ['Tela cheia (oculta as barras do sistema)','Fullscreen (hides the system bars)','Pantalla completa (oculta las barras del sistema)'],
    ['Gerar pacote (.zip)','Create package (.zip)','Generar paquete (.zip)'],
    ['Permissões','Permissions','Permisos'],
    ['ícone do projeto','project icon','icono del proyecto'],
    ['gerado automaticamente a partir do nome','generated automatically from the name','generado automáticamente a partir del nombre'],
    ['Gerando o pacote…','Creating the package…','Generando el paquete…'],
    ['Pacote gerado:','Package created:','Paquete generado:'],
    ['Este projeto usa um framework CSS carregado por CDN: o app precisa de internet.','This project uses a CSS framework loaded from a CDN: the app needs internet access.','Este proyecto usa un framework CSS cargado por CDN: la app necesita internet.'],
    ['Use letras minúsculas, números e pontos, por exemplo com.empresa.app','Use lowercase letters, numbers and dots, for example com.company.app','Usa minúsculas, números y puntos, por ejemplo com.empresa.app'],
    ['Empacotar o app como APK (Android)','Package the app as an APK (Android)','Empaquetar la app como APK (Android)'],
    /* ---------- generic ---------- */
    ['Nome','Name','Nombre'],['Texto','Text','Texto'],['Largura','Width','Ancho'],['Altura','Height','Alto'],
    ['Fundo','Background','Fondo'],['Cor','Color','Color'],['Visível','Visible','Visible'],['Habilitado','Enabled','Habilitado'],
    ['Ferramentas','Toolbox','Herramientas'],['Projeto','Project','Proyecto'],['Tipo','Type','Tipo'],['Valor','Value','Valor'],
    ['Alvo','Target','Objetivo'],['Propriedade','Property','Propiedad'],['Mostrar','Show','Mostrar'],['Ocultar','Hide','Ocultar'],
    ['Alternar','Toggle','Alternar'],['Navegar','Navigate','Navegar'],['Mensagem','Message','Mensaje'],
    ['Limpar','Clear','Limpiar'],['Cancelar','Cancel','Cancelar'],['Fechar','Close','Cerrar'],['Remover','Remove','Quitar'],
    ['Aplicar','Apply','Aplicar'],['Usar Asset','Use Asset','Usar Asset'],['Exemplos','Examples','Ejemplos'],
    ['Código','Code','Código'],['Título','Title','Título'],['Ajuda','Help','Ayuda'],['Página','Page','Página'],['Páginas','Pages','Páginas'],
    ['Componentes','Components','Componentes'],['Variáveis','Variables','Variables'],['Erros','Errors','Errores'],
    ['Evento','Event','Evento'],['Eventos','Events','Eventos'],['Ação','Action','Acción'],

    /* ---------- properties panel (static + dynamic) ---------- */
    ['Aba ativa (índice)','Active tab (index)','Pestaña activa (índice)'],['Índice ativo','Active index','Índice activo'],
    ['Abas (JSON)','Tabs (JSON)','Pestañas (JSON)'],['Aberto','Open','Abierto'],['Ajuste','Fit','Ajuste'],
    ['Alinhamento','Alignment','Alineación'],['Alinhar','Align','Alinear'],['Âncora','Anchor','Ancla'],['Ativar','Enable','Activar'],
    ['Cor da barra','Bar Color','Color de la barra'],['Cabeçalhos (JSON)','Headers (JSON)','Encabezados (JSON)'],
    ['Capturar áudio','Capture audio','Capturar audio'],['Carregamento tardio','Lazy loading','Carga diferida'],
    ['Chave de armazenamento','Storage key','Clave de almacenamiento'],['Colunas (JSON)','Columns (JSON)','Columnas (JSON)'],
    ['Controle','Control','Control'],['Câmera','Camera','Cámara'],['Direção','Direction','Dirección'],
    ['Encaixe','Docking','Acoplamiento'],['Encaixe (Dock)','Dock','Acoplamiento (Dock)'],
    ['Espaçamento (px)','Spacing (px)','Espaciado (px)'],['Executar uma vez','Run once','Ejecutar una vez'],
    ['Fechar ao clicar fora','Close on outside click','Cerrar al hacer clic fuera'],['Fonte','Font','Fuente'],
    ['Imagem','Image','Imagen'],['Imagem de capa (URL)','Cover image (URL)','Imagen de portada (URL)'],
    ['Imagem do computador','Image from computer','Imagen del equipo'],['Imagem dos Assets','Image from Assets','Imagen de Assets'],
    ['Intervalo (ms)','Interval (ms)','Intervalo (ms)'],['Itens (JSON)','Items (JSON)','Elementos (JSON)'],
    ['Itens por página','Items per page','Elementos por página'],['Itálico','Italic','Cursiva'],['Justificar','Justify','Justificar'],
    ['Latitude','Latitude','Latitud'],['Longitude','Longitude','Longitud'],['Linhas','Rows','Filas'],['Listras','Stripes','Rayas'],
    ['Mensagem de alerta','Alert message','Mensaje de alerta'],['Mínimo','Minimum','Mínimo'],['Máximo','Maximum','Máximo'],
    ['Mostrar controles','Show controls','Mostrar controles'],['Mostrar legenda','Show legend','Mostrar leyenda'],
    ['Mudo','Muted','Silenciado'],['Método','Method','Método'],['Negrito','Bold','Negrita'],['Nenhuma','None','Ninguna'],
    ['Ordenável','Sortable','Ordenable'],['Origem (URL)','Source (URL)','Origen (URL)'],['Posição','Position','Posición'],
    ['Protocolo','Protocol','Protocolo'],['Quebrar linha','Wrap','Ajustar línea'],['Repetir','Repeat','Repetir'],
    ['Reprodução automática','Autoplay','Reproducción automática'],['Sombra','Shadow','Sombra'],
    ['Somente leitura','Read only','Solo lectura'],['Sublinhado','Underline','Subrayado'],
    ['Tamanho da fonte (px)','Font size (px)','Tamaño de fuente (px)'],['Tamanho do QR','QR size','Tamaño del QR'],
    ['Tamanho máximo','Max length','Longitud máxima'],['Texto alternativo','Alt text','Texto alternativo'],
    ['Texto do QR Code','QR Code text','Texto del código QR'],['Tipo de gráfico','Chart type','Tipo de gráfico'],
    ['Valores (JSON)','Values (JSON)','Valores (JSON)'],['Variante','Variant','Variante'],['Volume (0-1)','Volume (0-1)','Volumen (0-1)'],
    ['Página de destino','Target page','Página de destino'],['Seção','Section','Sección'],
    ['Pré-visualização da imagem','Image preview','Vista previa de la imagen'],['Escolher imagem','Choose image','Elegir imagen'],
    ['Escolher dos Assets','Choose from Assets','Elegir de Assets'],['Escolher dos Assets...','Choose from Assets...','Elegir de Assets...'],
    ['Remover imagem','Remove image','Quitar imagen'],['Nenhuma imagem selecionada','No image selected','Ninguna imagen seleccionada'],
    ['Nenhuma imagem local selecionada','No local image selected','Ninguna imagen local seleccionada'],
    ['Selecione uma imagem já adicionada ao projeto.','Select an image already added to the project.','Selecciona una imagen ya agregada al proyecto.'],
    ['Propriedades: {0}','Properties: {0}','Propiedades: {0}'],
    ['Header do Site','Site header','Encabezado del sitio'],
    ['duplo clique → ação','double-click → action','doble clic → acción'],['OCULTO','HIDDEN','OCULTO'],['DESABILITADO','DISABLED','DESHABILITADO'],
    ['Adicionado: {0} • duplo clique abre {1}','Added: {0} • double-click opens {1}','Añadido: {0} • doble clic abre {1}'],['(sem nome)','(unnamed)','(sin nombre)'],
    ['Superior','Top','Arriba',{scope:'#dockSelect'}],['Inferior','Bottom','Abajo',{scope:'#dockSelect'}],['Esquerda','Left','Izquierda',{scope:'#dockSelect'}],
    ['Direita','Right','Derecha',{scope:'#dockSelect'}],['Preencher','Fill','Rellenar',{scope:'#dockSelect'}],['Modelos','Templates','Plantillas'],
    ['Ícone','Icon','Icono'],['Mostrar %','Show %','Mostrar %'],['Borda arredondada (px)','Border radius (px)','Borde redondeado (px)'],
    ['Múltiplas páginas','Multi-page','Múltiples páginas'],['Página única','One-page','Página única'],['Integrados','Built-in','Integrados'],

    /* ---------- project panel ---------- */
    ['Modo do Designer','Designer mode','Modo del diseñador'],
    ['Framework: visualiza o estilo do projeto. FlowForge: visualiza o estilo nativo do editor.','Framework: previews the project style. FlowForge: previews the editor native style.','Framework: muestra el estilo del proyecto. FlowForge: muestra el estilo nativo del editor.'],
    ['O framework escolhido é incluído no HTML exportado via CDN.','The chosen framework is included in the exported HTML via CDN.','El framework elegido se incluye en el HTML exportado mediante CDN.'],
    ['Largura × Altura','Width × Height','Ancho × Alto'],['CSS próprio','Custom CSS','CSS propio'],['Framework CSS','CSS Framework','Framework CSS'],
    ['Estrutura do projeto','Project structure','Estructura del proyecto'],['App responsivo','Responsive app','App responsivo'],
    ['Interface mobile-first com layout adaptável, navegação e componentes de aplicação.','Mobile-first interface with adaptive layout, navigation and application components.','Interfaz mobile-first con diseño adaptable, navegación y componentes de aplicación.'],
    ['Layout responsivo','Responsive layout','Diseño responsivo'],['Controles e dados','Controls and data','Controles y datos'],
    ['Navegação por páginas','Page navigation','Navegación por páginas'],
    ['Insira blocos prontos e ajuste suas propriedades depois.','Insert ready-made blocks and adjust their properties afterwards.','Inserta bloques listos y ajusta sus propiedades después.'],
    ['+ Contêiner','+ Container','+ Contenedor',{alias:['+ Container']}],['+ Linha responsiva','+ Responsive row','+ Fila responsiva'],
    ['+ Grid responsivo','+ Responsive grid','+ Cuadrícula responsiva'],['+ Cartão','+ Card','+ Tarjeta',{alias:['+ Card']}],
    ['Logo do Header','Header logo','Logo del encabezado'],['(opcional · armazenado em Base64)','(optional · stored as Base64)','(opcional · almacenado en Base64)'],
    ['(opcional · Base64)','(optional · Base64)','(opcional · Base64)'],['Escolher logo','Choose logo','Elegir logo'],
    ['Nenhum logo definido','No logo set','Ningún logo definido'],
    ['Múltiplas linhas','Multiline','Varias líneas'],['Aceitar tags HTML','Allow HTML tags','Aceptar etiquetas HTML'],
    ['✎ Abrir editor WYSIWYG','✎ Open WYSIWYG editor','✎ Abrir editor WYSIWYG'],
    ['Editor visual com fontes, cores, listas, alinhamento e formatação.','Visual editor with fonts, colors, lists, alignment and formatting.','Editor visual con fuentes, colores, listas, alineación y formato.'],

    /* ---------- actions panel ---------- */
    ['Ir para página','Go to page','Ir a página'],['Abrir URL','Open URL','Abrir URL'],['Abrir ação padrão','Open default action','Abrir acción predeterminada'],
    ['Adicionar classe','Add class','Añadir clase'],['Adicionar evento','Add event','Añadir evento'],
    ['＋ Adicionar ação','＋ Add action','＋ Añadir acción'],['＋ Adicionar ao evento','＋ Add to event','＋ Añadir al evento'],
    ['Ações rápidas','Quick actions','Acciones rápidas'],['Alterar propriedade','Change property','Cambiar propiedad'],
    ['Ação visual','Visual action','Acción visual'],['Eventos da Página','Page events','Eventos de la página'],
    ['Remover ação','Remove action','Quitar acción'],['Valor / URL','Value / URL','Valor / URL'],
    ['OnLoad executa uma vez ao abrir a página. OnShow executa sempre que ela é exibida.','OnLoad runs once when the page opens. OnShow runs every time it is displayed.','OnLoad se ejecuta una vez al abrir la página. OnShow se ejecuta cada vez que se muestra.'],
    ['Arraste ações compatíveis para este evento.','Drag compatible actions to this event.','Arrastra acciones compatibles a este evento.'],
    ['Selecione um componente no Designer e monte o evento arrastando blocos.','Select a component in the Designer and build the event by dragging blocks.','Selecciona un componente en el Designer y arma el evento arrastrando bloques.'],

    /* ---------- blocks ---------- */
    ['Lógica','Logic','Lógica'],['Matemática','Math','Matemática'],['Navegação','Navigation','Navegación'],
    ['Valores e expressões','Values and expressions','Valores y expresiones'],
    ['Buscar blocos...','Search blocks...','Buscar bloques...'],['Recolher tudo','Collapse all','Contraer todo'],
    ['Aumentar blocos','Larger blocks','Aumentar bloques'],['Diminuir blocos','Smaller blocks','Reducir bloques'],
    ['comparar valores','compare values','comparar valores'],['comparação lógica','logical comparison','comparación lógica'],
    ['enquanto','while','mientras'],['esperar','wait','esperar'],['ir para página','go to page','ir a página'],
    ['juntar texto','join text','unir texto'],['juntar textos','join texts','unir textos'],['mostrar mensagem','show message','mostrar mensaje'],
    ['número','number','número'],['operação matemática','math operation','operación matemática'],['quando','when','cuando'],
    ['repetir N vezes','repeat N times','repetir N veces'],['se / então','if / then','si / entonces'],['valor + valor','value + value','valor + valor'],
    ['obter variável','get variable','obtener variable'],['definir variável','set variable','establecer variable'],
    ['somar variável','add to variable','sumar a variable'],['quando carregar','when loaded','al cargar'],
    ['quando câmera iniciar','when camera starts','al iniciar la cámara'],['quando enviar','when submitted','al enviar'],
    ['quando ocorrer erro','when error occurs','cuando ocurra un error'],['quando texto mudar','when text changes','cuando cambie el texto'],
    ['quando valor mudar','when value changes','cuando cambie el valor'],
    ['＋ Alerta','＋ Alert','＋ Alerta'],['＋ Definir','＋ Set','＋ Establecer'],['＋ Navegar','＋ Navigate','＋ Navegar'],['＋ Se','＋ If','＋ Si'],
    ['definir {0}','set {0}','establecer {0}',{scope:'#blocksEditor'}],

    /* ---------- debugger ---------- */
    ['Depurador','Debugger','Depurador'],['Executando','Running','Ejecutando'],['Parado','Stopped','Detenido'],
    ['⏸ Pausar','⏸ Pause','⏸ Pausar'],['▶ Continuar','▶ Resume','▶ Continuar'],['↻ Inspecionar','↻ Inspect','↻ Inspeccionar'],
    ['✓ Validar','✓ Validate','✓ Validar'],['Nenhum evento disparado.','No events fired.','Ningún evento disparado.'],
    ['Nenhuma variável pública detectada.','No public variables detected.','No se detectaron variables públicas.'],
    ['Pausado','Paused','Pausado'],['Iniciando...','Starting...','Iniciando...'],['Sem mensagens.','No messages.','Sin mensajes.'],['Sem componentes.','No components.','Sin componentes.'],['Copiar','Copy','Copiar'],['Rede','Network','Red'],['Todos','All','Todos'],['Informações','Info','Información'],['Avisos','Warnings','Avisos'],['Sem requisições.','No requests.','Sin solicitudes.'],['detalhes','details','detalles'],['(oculto)','(hidden)','(oculto)'],['Filtrar...','Filter...','Filtrar...'],['Arraste para redimensionar','Drag to resize','Arrastre para redimensionar'],['Copiar o conteúdo desta aba','Copy this tab\'s content','Copiar el contenido de esta pestaña'],['Nível das mensagens','Message level','Nivel de los mensajes'],['Enter para alterar','Press Enter to change','Enter para cambiar'],['Selecionar no Design','Select in Design','Seleccionar en Design'],['Destacar no app','Highlight in the app','Resaltar en la app'],['Executar expressão JavaScript no app...','Run a JavaScript expression in the app...','Ejecutar una expresión JavaScript en la app...'],['Execute o app (Debug) antes de avaliar expressões.','Run the app (Debug) before evaluating expressions.','Ejecute la app (Debug) antes de evaluar expresiones.'],
    ['Sem erros.','No errors.','Sin errores.'],['[FlowForge Debugger] conectado','[FlowForge Debugger] connected','[FlowForge Debugger] conectado'],

    /* ---------- toolbar tooltips / pages ---------- */
    ['Alinhar esquerda','Align left','Alinear a la izquierda'],['Alinhar topo','Align top','Alinear arriba'],
    ['Alinhar direita','Align right','Alinear a la derecha'],['Alinhar base','Align bottom','Alinear abajo'],
    ['Igualar largura','Equal width','Igualar ancho'],['Igualar altura','Equal height','Igualar alto'],
    ['Distribuir horizontal','Distribute horizontally','Distribuir horizontalmente'],['Distribuir vertical','Distribute vertically','Distribuir verticalmente'],
    ['Trazer para frente','Bring to front','Traer al frente'],['Enviar para trás','Send to back','Enviar atrás'],
    ['Colocar seleção dentro do container selecionado','Put selection inside the selected container','Colocar la selección dentro del contenedor seleccionado'],
    ['Retirar do container','Take out of container','Sacar del contenedor'],
    ['Desfazer','Undo','Deshacer'],['Refazer','Redo','Rehacer'],['↶ Desfazer','↶ Undo','↶ Deshacer'],
    ['Duplicar componente','Duplicate component','Duplicar componente'],['Excluir componente','Delete component','Eliminar componente'],
    ['Excluir página','Delete page','Eliminar página'],['Renomear página','Rename page','Renombrar página'],
    ['＋ Nova página','＋ New page','＋ Nueva página'],['Página do projeto','Project page','Página del proyecto'],
    ['Árvore do Projeto','Project outline','Árbol del proyecto'],
    ['Largura (280–1440)','Width (280–1440)','Ancho (280–1440)'],['Altura (200–4000)','Height (200–4000)','Alto (200–4000)'],
    ['Livre: o palco segue o Viewport ou a Largura × Altura definidos nas propriedades','Free: the stage follows the Viewport or the Width × Height set in the properties','Libre: el escenario sigue el Viewport o el Ancho × Alto definidos en las propiedades'],
    ['⚙ Recursos','⚙ Features','⚙ Recursos'],['Recursos avançados FlowForge','FlowForge advanced features','Recursos avanzados de FlowForge'],
    ['Recursos avançados','Advanced features','Recursos avanzados'],['APIs disponíveis','Available APIs','APIs disponibles'],
    ['Buscar asset...','Search asset...','Buscar asset...'],

    /* ---------- save / export / open dialogs ---------- */
    ['Projeto:','Project:','Proyecto:'],['Versão:','Version:','Versión:'],['Arquivo:','File:','Archivo:'],['Ícone:','Icon:','Icono:'],
    ['não definido','not set','no definido'],['Cor do tema','Theme color','Color del tema'],
    ['Ícone do App / Apple Touch Icon','App icon / Apple Touch Icon','Icono de la app / Apple Touch Icon'],
    ['Abrir projeto','Open project','Abrir proyecto'],['Projetos comentados para aprender','Commented projects to learn from','Proyectos comentados para aprender'],
    ['Escolha um projeto pronto. O JavaScript dos eventos é comentado passo a passo.','Choose a ready-made project. The event JavaScript is commented step by step.','Elige un proyecto listo. El JavaScript de los eventos está comentado paso a paso.'],

    /* ---------- new project wizard ---------- */
    ['Configurar novo projeto','Set up new project','Configurar nuevo proyecto'],
    ['Novo {0} — Configuração inicial','New {0} — Initial setup','Nuevo {0} — Configuración inicial'],
    ['Defina a estrutura inicial. As escolhas serão aplicadas automaticamente a todas as páginas.','Define the initial structure. Your choices are applied automatically to all pages.','Define la estructura inicial. Las opciones se aplicarán automáticamente a todas las páginas.'],
    ['Defina a estrutura inicial do aplicativo. As escolhas serão aplicadas automaticamente às páginas.','Define the initial structure of the app. Your choices are applied automatically to the pages.','Define la estructura inicial de la aplicación. Las opciones se aplicarán automáticamente a las páginas.'],
    ['Estrutura global','Global structure','Estructura global'],['Header em todas as páginas','Header on all pages','Encabezado en todas las páginas'],
    ['Footer em todas as páginas','Footer on all pages','Pie de página en todas las páginas'],
    ['Barra superior do App (Titlebar)','App top bar (Titlebar)','Barra superior de la app (Titlebar)'],
    ['Seguir estilo do framework CSS','Follow the CSS framework style','Seguir el estilo del framework CSS'],
    ['Navegação entre páginas','Navigation between pages','Navegación entre páginas'],
    ['Barra de navegação','Navigation bar','Barra de navegación'],['Navegação inferior','Bottom navigation','Navegación inferior',{alias:['Bottom Nav']}],
    ['Abas','Tabs','Pestañas'],['Barra lateral','Sidebar','Barra lateral'],['Gaveta','Drawer','Cajón'],['Barra de ferramentas','Toolbar','Barra de herramientas'],
    ['Trilha de navegação','Breadcrumb','Ruta de navegación'],['Paginação','Pagination','Paginación'],
    ['Navegação de páginas','Page Navigation','Navegación de páginas'],['Sem navegação automática','No automatic navigation','Sin navegación automática'],
    ['A navegação é sincronizada automaticamente com as páginas criadas.','Navigation is synchronized automatically with the pages you create.','La navegación se sincroniza automáticamente con las páginas creadas.'],
    ['Páginas iniciais','Initial pages','Páginas iniciales'],
    ['Separe os nomes por vírgula. Em Landing Page, você pode manter apenas uma.','Separate the names with commas. In a Landing Page you can keep just one.','Separa los nombres con comas. En una Landing Page puedes mantener solo una.'],
    ['Criar projeto','Create project','Crear proyecto'],
    ['Home, Sobre, Contato','Home, About, Contact','Inicio, Acerca de, Contacto'],['Home, Tela 2','Home, Screen 2','Inicio, Pantalla 2'],

    /* ---------- label WYSIWYG editor ---------- */
    ['Editor de texto — Label','Text editor — Label','Editor de texto — Label'],
    ['Edite o conteúdo visualmente. O HTML será usado quando “Aceitar HTML” estiver ativado.','Edit the content visually. The HTML is used when “Allow HTML tags” is enabled.','Edita el contenido visualmente. Se usará el HTML cuando “Aceptar etiquetas HTML” esté activado.'],
    ['Tamanho','Size','Tamaño'],['Cor do texto','Text color','Color del texto'],['Cor de fundo','Background color','Color de fondo'],
    ['Esq.','Left','Izq.',{scope:'#labelWysiwygDlg'}],['Centro','Center','Centro',{scope:'#labelWysiwygDlg'}],['Dir.','Right','Der.',{scope:'#labelWysiwygDlg'}],['Just.','Justify','Just.',{scope:'#labelWysiwygDlg'}],
    ['• Lista','• List','• Lista'],['1. Lista','1. List','1. Lista'],['← Recuar','← Outdent','← Reducir sangría'],['→ Avançar','→ Indent','→ Aumentar sangría'],
    ['Desvincular','Unlink','Quitar enlace'],

    /* ---------- messages (ideMessage / alert / confirm / prompt) ---------- */
    ['Projeto aberto','Project opened','Proyecto abierto'],['"{0}" foi carregado com sucesso.','"{0}" was loaded successfully.','"{0}" se cargó correctamente.'],
    ['Não foi possível abrir o projeto','Could not open the project','No se pudo abrir el proyecto'],
    ['Arquivo de projeto inválido.','Invalid project file.','Archivo de proyecto no válido.'],
    ['Colar','Paste','Pegar'],['Não foi possível colar os componentes.','Could not paste the components.','No se pudieron pegar los componentes.'],
    ['Digite seu nome primeiro.','Type your name first.','Escribe tu nombre primero.'],
    ['O projeto precisa ter ao menos uma página.','The project needs at least one page.','El proyecto necesita al menos una página.'],
    ['Selecione um item.','Select an item.','Selecciona un elemento.'],
    ['Excluir esta página? Essa ação não pode ser desfeita.','Delete this page? This action cannot be undone.','¿Eliminar esta página? Esta acción no se puede deshacer.'],
    ['Nome da página','Page name','Nombre de la página'],['Novo nome da página','New page name','Nuevo nombre de la página'],
    ['Escolha primeiro o componente/evento.','Choose the component/event first.','Elige primero el componente/evento.'],
    ['Blocos válidos.','Valid blocks.','Bloques válidos.'],['Limpar blocos deste evento?','Clear the blocks of this event?','¿Limpiar los bloques de este evento?'],
    ['Adicione um container primeiro.','Add a container first.','Añade primero un contenedor.'],
    ['Name do container de destino:','Name of the target container:','Nombre del contenedor de destino:'],
    ['Não foi possível armazenar a imagem.','Could not store the image.','No se pudo almacenar la imagen.']
  ];

  /* ---------- index ---------- */
  const norm=s=>String(s??'').replace(/\s+/g,' ').trim();
  const entries=E.map(a=>({t:[a[0],a[1],a[2]],scope:a[3]?.scope||'',alias:a[3]?.alias||[],pattern:/\{\d\}/.test(a[0])}));
  const exact=new Map();    /* normalized variant -> [entry...] */
  const patterns=[];        /* {re, entry, order} */
  const conflicts=[];
  const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

  entries.forEach(en=>{
    const variants=[...new Set([...en.t,...en.alias].map(norm))];
    variants.forEach(v=>{
      if(en.pattern){
        const re=new RegExp('^'+esc(v).replace(/\\\{(\d)\\\}/g,'(.+?)')+'$');
        patterns.push({re,entry:en,variant:v});
      }else{
        const list=exact.get(v)||[];
        const clash=list.find(o=>o!==en&&o.scope===en.scope);
        if(clash)conflicts.push({text:v,a:clash.t[0],b:en.t[0],scope:en.scope});
        list.push(en);exact.set(v,list);
      }
    });
  });

  const language=()=>{const l=w.FlowForgeI18n?.getLanguage?.();return LANGS.includes(l)?l:'pt-BR'};

  function pick(list,node){
    if(!list)return null;
    const scoped=node&&list.find(e=>e.scope&&node.closest&&node.closest(e.scope));
    return scoped||list.find(e=>!e.scope)||null;
  }
  function fill(tpl,groups){return tpl.replace(/\{(\d)\}/g,(m,i)=>groups[+i]??m)}

  /* Translate one string (exact match or {0} pattern). Returns null when unknown. */
  function translate(str,node,lang){
    const key=norm(str);
    if(!key)return null;
    lang=lang||language();
    const hit=pick(exact.get(key),node);
    if(hit)return hit.t[IDX[lang]];
    for(const p of patterns){
      if(p.entry.scope&&!(node&&node.closest&&node.closest(p.entry.scope)))continue;
      const m=p.re.exec(key);
      if(m)return fill(p.entry.t[IDX[lang]],m.slice(1));
    }
    return null;
  }
  /* Same as translate() but returns the original text when unknown (for code that builds messages). */
  function t(str,lang){const r=translate(str,null,lang);return r==null?str:r}
  const known=str=>translate(str,null,'pt-BR')!=null;

  /* ---------- DOM walking ---------- */
  const SKIP='script,style,textarea,input,[contenteditable],[data-i18n-skip],#stageWrap,#codeEditor,#preview,#stage,#code,#tools,#pageSelect,#projectPageTop,.treeItem,.pageItem>span';
  const ATTRS=['placeholder','title','aria-label'];
  const inSkip=el=>!!(el&&el.closest&&el.closest(SKIP));

  function setText(node,lang){
    const cur=node.nodeValue;
    const lead=(/^\s*/.exec(cur)||[''])[0],trail=(/\s*$/.exec(cur)||[''])[0];
    const out=translate(cur,node.parentElement,lang);
    if(out==null)return;
    const next=lead+out+trail;
    if(next!==cur)node.nodeValue=next;
  }
  function setAttr(el,name,lang){
    const cur=el.getAttribute(name);
    if(!cur)return;
    const out=translate(cur,el,lang);
    if(out!=null&&out!==cur)el.setAttribute(name,out);
  }
  function walk(root,lang){
    if(!root)return;
    if(root.nodeType===3){if(!inSkip(root.parentElement))setText(root,lang);return}
    if(root.nodeType!==1||inSkip(root))return;
    const tw=d.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{
      acceptNode(n){
        if(n.nodeType===1&&n.matches(SKIP))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const visit=el=>{ATTRS.forEach(a=>{if(el.hasAttribute&&el.hasAttribute(a))setAttr(el,a,lang)})};
    visit(root);
    let n;
    while((n=tw.nextNode())){
      if(n.nodeType===3)setText(n,lang);else visit(n);
    }
  }

  /* ---------- observers (dynamic panels rebuilt by the editor) ---------- */
  const ROOTS=['#props','#ideTools','#toolbox','#selectionInfo','#studioDrawer','#blocksEditor','#debuggerPanel','#ffEnhancementsPanel','dialog','#tabs','header'];
  let obs=null,popupObs=null,paused=false;
  function onMutations(records){
    if(paused)return;
    const lang=language();
    records.forEach(r=>{
      if(r.type==='childList')r.addedNodes.forEach(n=>walk(n,lang));
      else if(r.type==='characterData'){if(!inSkip(r.target.parentElement))setText(r.target,lang)}
      else if(r.type==='attributes'){if(!inSkip(r.target))setAttr(r.target,r.attributeName,lang)}
    });
    obs.takeRecords(); /* discard the records caused by our own edits */
  }
  function start(){
    if(obs)return;
    obs=new MutationObserver(onMutations);
    const cfg={childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS};
    ROOTS.forEach(sel=>d.querySelectorAll(sel).forEach(el=>obs.observe(el,cfg)));
    /* floating menus / popups appended straight to <body> */
    popupObs=new MutationObserver(recs=>{
      const lang=language();
      recs.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1&&!n.matches?.('dialog'))walk(n,lang)}));
      popupObs.takeRecords();
    });
    popupObs.observe(d.body,{childList:true});
  }
  /* Translate the whole editor chrome now (language change / startup). */
  /* Text drawn by CSS (::after content) cannot be reached through the DOM: it is fed by CSS variables. */
  function syncCssText(){
    const root=d.documentElement.style;
    [['--ff-hint-dblclick','duplo clique → ação'],['--ff-label-hidden','OCULTO'],['--ff-label-disabled','DESABILITADO']]
      .forEach(([name,src])=>root.setProperty(name,JSON.stringify(t(src))));
  }
  function refresh(){
    start();
    syncCssText();
    paused=true;
    try{walk(d.body,language())}finally{paused=false;obs&&obs.takeRecords()}
  }

  /* ---------- native dialogs ---------- */
  ['alert','confirm','prompt'].forEach(name=>{
    const orig=w[name];
    if(typeof orig!=='function'||orig.__ffI18n)return;
    const wrapped=function(msg,...rest){return orig.call(this,typeof msg==='string'?t(msg):msg,...rest)};
    wrapped.__ffI18n=true;
    w[name]=wrapped;
  });

  w.FlowForgeUIText={t,translate,known,refresh,language,
    integrity:()=>conflicts.slice(),
    dictionary:()=>entries.map(e=>({pt:e.t[0],en:e.t[1],es:e.t[2],scope:e.scope,alias:e.alias})),
    skipSelector:SKIP};
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window,document);
