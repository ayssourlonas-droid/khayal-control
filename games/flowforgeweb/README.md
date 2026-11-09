# FlowForge WebStudio Beta

**FlowForge WebStudio** é um ambiente visual para criação de aplicações web, sites e landing pages usando componentes, páginas, eventos, JavaScript, dados e recursos locais.

> **Status:** Beta  
> **Formato de projeto:** `.flowmobile`  
> **Execução:** navegador / HTML5 + JavaScript

## Índice

- [Visão geral](#visão-geral)
- [Tipos de projeto](#tipos-de-projeto)
- [Componentes](#componentes)
- [Páginas e navegação](#páginas-e-navegação)
- [Eventos e JavaScript](#eventos-e-javascript)
- [OnLoad e OnShow](#onload-e-onshow)
- [ListBox e ComboBox](#listbox-e-combobox)
- [Áudio e vídeo](#áudio-e-vídeo)
- [Imagens e Assets](#imagens-e-assets)
- [HTTP](#http)
- [Database](#database)
- [Frameworks CSS](#frameworks-css)
- [Layout e responsividade](#layout-e-responsividade)
- [QR Code](#qr-code)
- [Exportação](#exportação)
- [Formato `.flowmobile`](#formato-flowmobile)
- [Arquitetura](#arquitetura)
- [Boas práticas](#boas-práticas)
- [Limitações](#limitações)

## Visão geral

O FlowForge WebStudio combina um designer visual com programação JavaScript. O usuário pode criar páginas, adicionar componentes, configurar propriedades, definir eventos, testar a aplicação e exportar o resultado para a Web.

A ideia central é:

```text
Designer visual + Componentes + Eventos + JavaScript + Dados + Assets
```

Projetos são armazenados no formato `.flowmobile`.

## Tipos de projeto

### App

Para aplicações web interativas com múltiplas telas, navegação, componentes, eventos, lógica JavaScript e layout responsivo.

### Site

Para sites institucionais e portais, com recursos como Header, Navbar, seções, cards e Footer.

### Landing Page

Para páginas de apresentação, produtos e serviços, com estruturas como Header, Hero, CTA, benefícios, cards e Footer.

## Componentes

O WebStudio possui componentes de interface, entrada, navegação, dados e visualização.

Exemplos:

- Button, Label, Link
- IconButton, GradientButton, FAB
- Image, Video, Audio, IFrame, Canvas
- Input, TextArea, CheckBox, Radio, Switch
- SearchBar, PasswordBox, NumberBox, SegmentedControl
- ComboBox, ListBox, ColorPicker, FileUpload
- Navbar, BottomNav, Tabs, TabControl, Drawer, Sidebar, Toolbar
- Pagination, PageNav, DropdownMenu, Popover
- Skeleton, ProgressRing, EmptyState
- CodeBlock, Chat, SignaturePad
- List, ListView, MobileList, Table, DataGrid, TreeView
- Chart, Calendar, Rating, Timeline, Stepper, Accordion
- Modal, Toast, Tooltip, Carousel, QRCode
- Battery, Thermometer, LED, Sparkline
- ValueCard, StatusCard, StatCard, GlassPanel
- ThemeToggle

### Toolbox traduzida

Os nomes das ferramentas e dos grupos da Toolbox seguem o idioma escolhido no seletor de idioma (pt-BR, English e Español). Por exemplo, `TextBox` aparece como **Caixa de texto** em português e **Cuadro de texto** em espanhol. Em inglês, os nomes técnicos de sempre são mantidos.

- Só o texto da Toolbox é traduzido. Nomes de componentes (`input1`, `button1`), o tipo (`input`), os eventos e o código gerado não mudam.
- A busca encontra pelo nome traduzido, pelo nome técnico original (`textbox`) e pelo nome do grupo, ignorando acentos.
- As traduções ficam em `js/ui-i18n-tools.js`, indexadas pelo tipo da ferramenta. Ao criar uma ferramenta nova no `TOOL_GROUPS`, adicione o nome em pt-BR e es nesse arquivo. O teste `/tests/toolbox_i18n_test.html` avisa se faltar alguma.

## Páginas e navegação

Um projeto pode possuir várias páginas, cada uma com seus componentes e configurações.

Exemplo:

```text
Home
Radios
Sobre
Contato
```

A navegação pode ser feita por componentes ou JavaScript:

```js
ffNavigate("Radios");
```

A navegação interna também utiliza hash/URL para permitir roteamento entre páginas.

### Header, navegação e footer automáticos

Projetos criados pelo assistente (e Site/Landing sem layout definido) recebem header, navegação e footer automáticos em todas as páginas. Esses blocos são marcados como `siteChrome` e acompanham as páginas e o framework CSS.

- Se a página já tem um **header ou footer próprio** e o projeto não tem layout do assistente (`siteLayout`), ela é tratada como de layout próprio e **não recebe chrome automático**. Chrome automático já gravado nesse tipo de projeto é removido ao abrir.
- Um header, footer ou navegação **inserido manualmente** impede que o automático do mesmo tipo seja recriado. Se o automático já existe e você acrescenta um manual, os dois permanecem (escolha explícita).
- Teste: `/tests/site_chrome_test.html`.

### Eventos `load` e `error` no HTML gerado

Os eventos de componentes viram atributos inline (`onclick="button1_click(event)"`). `load` e `error` podem disparar enquanto a página ainda está sendo lida (por exemplo um iframe `about:blank`), antes de o script com os handlers existir. Por isso eles são gerados protegidos: `onload="typeof iframe1_load==='function'&&iframe1_load(event)"`. Os demais eventos não mudam. Teste: `/tests/generated_events_test.html`.

## Eventos e JavaScript

Componentes possuem eventos que podem executar JavaScript.

Exemplos:

```js
label1.textContent = "Olá, FlowForge!";
```

```js
button1.visible = false;
```

```js
button1.enabled = false;
```

O editor de código permite trabalhar diretamente com a lógica dos eventos.

## OnLoad e OnShow

As páginas possuem eventos de ciclo de vida.

### OnLoad

Executado no carregamento inicial da página:

```js
async function Home_onload(event) {
    label1.textContent = "Aplicação carregada";
}
```

### OnShow

Executado quando a página é exibida:

```js
async function Home_onshow(event) {
    label1.textContent = "Página exibida";
}
```

Na primeira página, o fluxo é `OnLoad` seguido de `OnShow`. Nas navegações posteriores, `OnShow` acompanha a exibição da página.

Os eventos de página aparecem na área de Actions e seguem o mesmo conceito de edição dos eventos de componentes.

## ListBox e ComboBox

O `ListBox` trabalha com itens contendo texto e valor:

```js
radiosList.items = [
    { text: "Groove Salad", value: "groovesalad" },
    { text: "Drone Zone", value: "dronezone" }
];
```

Item selecionado:

```js
const item = radiosList.selectedItem;

if (item) {
    label1.textContent = item.text;
}
```

O item possui:

```text
text
value
index
```

Manipulação:

```js
radiosList.addItem("Nova rádio", "radio1");
radiosList.removeItem("radio1");
radiosList.clearItems();
```

## Áudio e vídeo

O FlowForge utiliza elementos HTML reais para áudio e vídeo.

Exemplo de rádio:

```js
audio1.src = "https://exemplo.com/stream";
audio1.load();
await audio1.play();
```

Pausa:

```js
audio1.pause();
```

Volume:

```js
audio1.volume = 0.5;
```

Áudio e vídeo suportam propriedades como `src`, `controls`, `autoplay`, `loop`, `muted`, `volume`, `poster` e `visible`, além de eventos de mídia.

## Imagens e Assets

Imagens locais podem ser armazenadas nos Assets do projeto.

A arquitetura utiliza referências de asset para evitar duplicação desnecessária de Base64 nos componentes:

```text
Imagem local
    ↓
Asset do projeto
    ↓
asset://id
    ↓
Preview
    ↓
Exportação
    ↓
Base64 no HTML final
```

Isso permite manter os projetos autocontidos.

## HTTP

O FlowForge possui serviços HTTP para consumo de APIs:

```js
await http.get(url);
await http.post(url, data);
await http.put(url, data);
await http.patch(url, data);
await http.delete(url);
await http.request(options);
```

O uso de APIs externas continua sujeito às regras do navegador, especialmente CORS.

## Database

O serviço `Database` utiliza armazenamento local baseado em IndexedDB.

Exemplos:

```js
await db.createTable("users");
```

```js
await db.insert("users", {
    name: "FlowForge"
});
```

```js
const users = await db.select("users");
```

Também estão disponíveis operações como:

```js
db.get()
db.update()
db.delete()
db.clear()
db.count()
db.dropTable()
```

O banco é local ao navegador e não é automaticamente um banco de servidor.

## Frameworks CSS

O WebStudio possui suporte visual para:

- Bootstrap 5.3
- Bulma
- Pico CSS
- Tailwind CSS
- Materialize CSS
- Foundation
- UIkit
- Semantic UI

O framework pode ser utilizado para visualização e estilo da aplicação, mantendo a estrutura de componentes do FlowForge.

### Interface traduzida

Além da Toolbox, todo o restante da interface do editor segue o idioma escolhido (pt-BR, English e Español): painel de propriedades e de ações, painel do projeto, gavetas (Árvore, Páginas, Assets), blocos, depurador, assistente de novo projeto, editor WYSIWYG, diálogos de salvar e exportar, dicas (tooltips) e mensagens de aviso.

- O nome do tipo do componente também é traduzido onde aparece: na Árvore (`Caixa de texto: input1`), nos seletores de alvo das ações e no título `Propriedades: Caixa de texto`.
- **Conteúdo do usuário nunca é traduzido**: nomes de componentes e de páginas, textos digitados nos campos, o conteúdo do editor WYSIWYG, o palco, o preview e o código gerado. Só textos que coincidem exatamente com uma entrada do dicionário são trocados, nunca trechos de frases.
- O dicionário fica em `js/ui-i18n-dom.js`. Cada entrada tem as três versões, no formato `['português', 'english', 'español']`. Um `{0}` marca uma parte dinâmica (por exemplo `'definir {0}'`), e a opção `scope` limita a entrada a um trecho da tela. O texto reconhecido pode estar em qualquer um dos três idiomas, então voltar ao português restaura tudo.
- Rótulos desenhados por CSS no palco (`duplo clique → ação`, `HIDDEN`, `DISABLED`) usam variáveis CSS atualizadas a cada troca de idioma.
- Ao criar um texto novo na interface, adicione a entrada no dicionário. O teste `/tests/ui_i18n_test.html` percorre os 124 componentes, os painéis e os diálogos nos três idiomas e avisa se algum texto conhecido aparecer no idioma errado.

## Layout e responsividade

O modo App possui recursos para interfaces responsivas e diferentes tamanhos de viewport.

O docking pode utilizar:

```text
none
top
bottom
left
right
fill
```

Exemplo conceitual:

```text
Header  -> top
Sidebar -> left
Content -> fill
Footer  -> bottom
```

Sempre teste o projeto em desktop, tablet e celular.

### Viewport do Designer

O tamanho do palco pode ser escolhido de três formas:

- **Viewport** (propriedades do projeto): Mobile 390, Tablet 768 ou Desktop 1200.
- **Largura × Altura** (propriedades do projeto): valores livres, de 280 a 1440 de largura e de 200 a 4000 de altura. O Viewport passa a mostrar *Outro*.
- **Seletor de dispositivo** (barra de ferramentas): *Livre* segue o Viewport / Largura × Altura; *Mobile*, *Tablet* e *Desktop* aplicam largura e altura de um dispositivo.

A escolha é salva no projeto (`project.viewport`, no arquivo `.flowmobile`) e restaurada ao reabrir. Projetos antigos, sem esse campo, usam 390 (App) ou 1200 (Site e Landing Page). Desfazer e refazer não alteram o viewport.

O módulo `js/ff-designer-viewport.js` (`FFDesignerViewport`) é o único responsável por esse tamanho. Os breakpoints do `FFResponsive` (mobile, tablet e desktop) são medidos sobre o palco, e não sobre a janela do navegador.

Para rodar o teste de regressão, inicie um servidor local na raiz do projeto (`python -m http.server`) e abra `/tests/viewport_test.html`.


## QR Code

O QR Code pode ser atualizado por JavaScript:

```js
qrcode1.textContent = "https://exemplo.com";
```

Isso permite gerar códigos dinamicamente, inclusive para URLs de streams de rádio.

## Exportação

A exportação transforma a estrutura do projeto em uma aplicação web executável, considerando páginas, componentes, hierarquia, eventos, JavaScript e assets.

Assets armazenados no projeto podem ser incorporados ao resultado final.

### Ícone e favicon

Tanto **Salvar** quanto **Exportar HTML** permitem definir o ícone do app (Apple Touch Icon) e o favicon. Os dois sempre ficam incorporados em **Base64**, dentro do `.flowmobile` e do `index.html` exportado, sem arquivos externos.

- **Escolher** abre um arquivo (PNG, JPEG, WEBP, GIF, SVG ou ICO). **Usar Asset** aproveita uma imagem dos Assets do projeto, que também é convertida em Base64. **Remover** limpa o campo.
- Imagens maiores que o necessário são reduzidas e gravadas como PNG: o ícone fica com no máximo 192 px e o favicon com no máximo 64 px, mantendo a proporção. Imagens pequenas são mantidas como estão. SVG e ICO são incorporados sem alteração (até 512 KB). O limite do arquivo escolhido é 5 MB.
- Cada campo mostra uma prévia, o formato, o tamanho e as dimensões. Um aviso aparece quando a imagem não é quadrada.
- No HTML exportado, o `<head>` recebe `<link rel="icon">`, `<link rel="apple-touch-icon">` e `<link rel="icon" sizes="192x192">`, com o `type` correto.
- Projetos antigos que usam um caminho (por exemplo `assets/icon-192.png`) ou um token `asset://` continuam funcionando. Escolha a imagem novamente para convertê-la em Base64.

Para rodar os testes de regressão, inicie um servidor local na raiz do projeto (`python -m http.server`) e abra `/tests/project_icons_test.html`, `/tests/viewport_test.html` ou `/tests/preview_assets_test.html`.


## Formato `.flowmobile`

Um projeto possui estrutura JSON. Entre as informações principais estão:

```text
version
name
projectVersion
icon
favicon
themeColor
type
framework
titlebar
pages
assets
```

As páginas armazenam seus componentes em `pages[].items`.

Componentes normalmente possuem propriedades como:

```text
id
kind
name
text
x
y
width
height
bg
color
visible
enabled
events
```

Componentes específicos podem possuir propriedades adicionais.

## Arquitetura

O FlowForge utiliza uma arquitetura modular. Funcionalidades específicas são mantidas em módulos separados sempre que possível, incluindo recursos relacionados a:

- responsividade;
- layout;
- estilos;
- componentes;
- data binding;
- debug;
- templates;
- enhancements;
- eventos de página;
- imagens/assets;
- HTTP;
- Database.

A separação reduz alterações desnecessárias no executor principal e facilita a evolução do WebStudio.

## Boas práticas

### Organize por páginas

Separe funcionalidades em páginas como:

```text
Home
Login
Dashboard
Configurações
Sobre
```

### Use nomes claros

Prefira:

```text
buttonLogin
labelStatus
radioList
audioPlayer
```

### Use Assets para recursos grandes

Evite repetir grandes strings Base64 diretamente em vários componentes.

### Use `await` em operações assíncronas

```js
const data = await http.get(url);
```

### Teste a responsividade

Verifique diferentes larguras e orientações antes da publicação.

## Limitações

O FlowForge WebStudio está em fase Beta.

Alguns recursos dependem do navegador, incluindo:

- reprodução automática de áudio/vídeo;
- CORS;
- APIs externas;
- armazenamento local;
- permissões do navegador.

A reprodução automática de mídia pode ser bloqueada até que o usuário interaja com a página.

Streams externos podem mudar ou ficar indisponíveis independentemente do FlowForge.

O banco local é específico do ambiente do navegador.

## Fluxo de criação

```text
Criar projeto
      ↓
Escolher App / Site / Landing Page
      ↓
Criar páginas
      ↓
Adicionar componentes
      ↓
Configurar propriedades
      ↓
Criar eventos
      ↓
Programar em JavaScript
      ↓
Executar e testar
      ↓
Exportar
```

## Princípios do projeto

1. **Visual primeiro** — a interface deve poder ser construída visualmente.
2. **Código quando necessário** — JavaScript amplia o comportamento da aplicação.
3. **Projetos autocontidos** — recursos locais devem permanecer no `.flowmobile` sempre que possível.
4. **Modularidade** — novas funcionalidades devem preferencialmente utilizar módulos independentes.
5. **Compatibilidade** — alterações no núcleo devem ser evitadas quando uma funcionalidade puder ser adicionada sem modificar o executor existente.
6. **Funcionalidade real** — componentes devem produzir comportamento funcional, e não apenas representação visual.

## Identidade

**Produto:** FlowForge WebStudio Beta  
**Projeto:** FlowForge WebStudio  
**Formato:** `.flowmobile`

> **Crie visualmente. Programe quando precisar. Exporte para a Web.**

## Licença

A licença do FlowForge  é a GPL 3.0.

## Site/Landing chrome automático
Ao selecionar **Site** ou **Landing Page**, o WebStudio cria automaticamente em cada página:
1. Header
2. Barra de navegação com botões para todas as páginas
3. Área de conteúdo
4. Footer abaixo do conteúdo

Ao selecionar **App HTML5**, esses componentes estruturais de navegação são removidos da estrutura automática; o App mantém apenas a Titlebar como estrutura global. Button e Link continuam disponíveis para navegação via `ffNavigate()`.


## Revisão dos exemplos

- Corrigidos: Adivinhe_o_Numero (campo não era limpo ao iniciar), Pong_IA (índice da raquete da CPU), Jogo_da_Memoria (seletor pegava outros componentes), Calculadora_Interativa (itens do combo), Dashboard_Sistema (histórico do sparkline) e cards usados como texto (sem o valor padrão "1.284").
- Gerador: cards atualizam o texto do rótulo, botões respeitam cores personalizadas, `switch` é um input real (funciona no modo escuro) e `sparkline` lê `data-values`.

### Exemplos novos

- **Lista_de_Tarefas**: criação de elementos pela página, filtro, contador e persistência em `localStorage`; carrega tudo no evento `OnLoad` da página.
- **Conversor_de_Unidades**: comprimento, massa, volume e temperatura; os combos De/Para são recriados ao trocar a categoria.
- **Quiz_de_Conhecimentos**: perguntas embaralhadas, ProgressBar, feedback de acerto/erro e recorde salvo.
- **Calculadoras_Multipagina**: IMC, gorjeta com divisão e juros compostos, com navegação por `ffNavigate`.
- **Pomodoro**: temporizador com pausa, reinício, três modos e contagem de sessões.
- **Jogo_da_Forca**: teclado A–Z, dicas por categoria e fim de jogo.

- **Editor_de_Texto**: Novo/Abrir/Salvar (.txt), localizar e substituir, ABC/abc/Aa, contagem de linhas/palavras/caracteres, tamanho da fonte, modo escuro e rascunho automático.

- **Editor_de_Texto_Blocos**: editor feito só com programação por blocos (definir propriedade, juntar texto, somar variável, repetir, se/senão, ir para página); sem código digitado.
Correção no gerador: o código do `OnLoad`/`OnShow` da página que contivesse `$&`, `$'` ou `` $` `` era corrompido na exportação (uso de `String.replace` com texto). Agora a inserção usa função. Teste: `/tests/generated_events_test.html`.

Observação: em projetos tipo app a TitleBar ocupa os primeiros 52 px da página, então os exemplos novos começam em y ≥ 56 e usam largura máxima de 390 px.

## Correção do componente Câmera

Por que a câmera "não funcionava" mesmo com o app publicado:

- Nada iniciava a câmera: o componente só abria o fluxo quando o código chamava `start`. Agora há um botão **Ativar câmera** no próprio componente (oculte com a propriedade *Ocultar botão Ativar câmera*) e a propriedade **autoplay** inicia a câmera automaticamente.
- Os erros eram silenciosos. Agora aparecem mensagens claras (permissão negada, sem câmera, câmera em uso, HTTPS ausente) e o evento `cameraerror` traz `error` e `message`.
- Se `facingMode` (frontal/traseira) for recusado, há fallback para qualquer câmera disponível.
- A câmera exige **HTTPS** (ou `localhost`). Em `http://` de um servidor, o navegador bloqueia `getUserMedia`.
- Se o app for embutido em um `iframe` de outra origem, use `allow="camera; microphone"`. O preview do IDE já faz isso.
- Se o servidor enviar o cabeçalho `Permissions-Policy: camera=()`, a câmera é bloqueada; use `camera=(self)`.

Testes: `tests/camera_test.html` (20 verificações).

Correções adicionais na câmera:

- Os eventos `camerastart`, `camerastop` e `cameraerror` agora executam as ações definidas pelo usuário (antes o atributo `oncamera…` era gerado, mas o navegador não o executava).
- `camerastop` só dispara quando havia uma câmera ligada; reiniciar a câmera (por exemplo, trocar frontal/traseira) não dispara `camerastop`.
- O bloco "iniciar câmera" não gera mais erro não tratado quando o acesso é negado; a mensagem aparece pelo evento `cameraerror`.
- Novo exemplo: `examples/Estudio_de_Camera.flowmobile` (ligar, desligar, trocar câmera, tirar foto, baixar, listar câmeras).

Depurador e exemplo da câmera:

- O painel do Depurador deixou de cobrir a parte de baixo do Preview/Design: agora ocupa uma linha própria abaixo da área de trabalho, e a barra de rolagem do projeto fica totalmente visível e utilizável com o Debug aberto.
- No exemplo `Estudio_de_Camera`, os botões Tirar foto e Trocar ficam sempre visíveis (antes só apareciam depois de a câmera ligar); o indicador "● AO VIVO" mostra/oculta pelos eventos `camerastart`/`camerastop`.

Permissões do Preview/Debug:

- O iframe do Preview e do Debug só recebe permissão de câmera (e microfone, se o componente usar áudio) quando o projeto possui um componente Câmera; permissão de localização só com componente Geolocalização. Sem esses componentes, nada é delegado nem solicitado.
- O navegador só pede acesso à câmera quando existe um componente Câmera no projeto e a câmera é iniciada (autoplay, botão Ativar câmera ou ação). Adicionar o componente no Design não pede permissão.

## Depurador melhorado

- **Captura desde o início:** o código de captura é injetado no começo do app em execução, então mensagens e erros do carregamento (onload etc.) também aparecem. Antes só eram registrados depois do carregamento.
- **Console:** hora real de cada mensagem (antes mostrava a hora da renderização), filtro por nível (Todos/Informações/Avisos/Erros), filtro de texto, botão **Copiar** e linha para **executar expressões JavaScript no app** (setas ↑↓ percorrem o histórico).
- **Erros:** mostram a origem quando vêm de um evento (ex.: `btnBad · click ↗`; clique para selecionar o componente no Design), detalhes da pilha, falhas de carregamento de recursos e Promises rejeitadas. A aba fica em vermelho com o contador.
- **Eventos:** click, dblclick, input (com o valor), change, submit e camerastart/camerastop/cameraerror; clique no nome do componente para destacá-lo no app.
- **Variáveis:** lista todas as variáveis globais criadas pelo projeto (não só nomes pré-definidos), atualiza sozinha e permite **editar o valor** (Enter).
- **Componentes:** nome, tipo, valor e visibilidade; clique para destacar no app ou selecionar no Design.
- **Rede (nova):** registra `fetch` e `XMLHttpRequest` com método, URL, status e tempo.
- **Painel:** redimensionável arrastando a borda superior; traduzido em português, inglês e espanhol.

## Novos exemplos e ferramentas Python

- Exemplos novos em `examples/`: **Cronometro_Voltas** (Iniciar/Pausar/Volta/Zerar, melhor e pior volta), **Controle_de_Gastos** (lançamentos por categoria, total e percentuais, salvos no navegador), **Foto_de_Perfil** (câmera + recorte quadrado + cartão em outra página, salvo no navegador) e **Laboratorio_do_Depurador** (botões que geram logs, avisos, erros, requisições e variáveis para explorar o Depurador).
- Pasta `tools/` (opcional, só para desenvolvimento): testes automatizados em Python/Playwright e os geradores dos exemplos. Veja `tools/README.md`. Rodar tudo: `python tools/run_all.py`.

## Exemplo Chess_Landing_Page funcional

- O tabuleiro demonstrativo virou um **jogo de xadrez completo**: regras oficiais (roque, en passant, promoção com escolha da peça, xeque, xeque-mate, afogamento, material insuficiente, regra dos 50 lances e repetição tripla), destaque do último lance e das casas possíveis, notação algébrica em português (R, D, T, B, C), peças capturadas, desfazer, girar o tabuleiro e salvamento automático da partida no navegador.
- Modos: contra o computador (fácil ou médio) ou dois jogadores.
- O motor foi validado por *perft* em 5 posições de referência (inicial, Kiwipete, posições 3, 4 e 5); os cenários estão em `tools/test_exemplos.py`. O código do jogo fica em `tools/gerar_exemplos/xadrez.js` e é gerado por `exemplo_11.py`.
- O conteúdo da landing page agora começa abaixo do cabeçalho/menu (antes o hero ficava por cima do cabeçalho).

Xadrez: modo Computador x Computador e relógio analógico:

- **Computador x Computador:** duas máquinas jogam sozinhas, com ritmo lento/normal/rápido, botão **Pausar/Continuar**, placar acumulado (brancas/empates/pretas) e opção de **nova partida automática** para um torneio contínuo. Há limite de 150 jogadas (empate).
- **Relógio de xadrez analógico:** um mostrador para cada lado, com ponteiros de hora e minuto, ponteiro de segundos, bandeirinha que sobe no último minuto e cai quando o tempo acaba. Tempos: 1, 3+2, 5, 5+3, 10, 15+10 e 30 minutos, ou *Sem limite (cronômetro)*, em que os ponteiros contam o tempo gasto. O lado da vez fica com o aro verde; clique em um relógio para pausar/continuar. O relógio começa a correr após o primeiro lance, aplica o incremento a cada lance, e Desfazer devolve o tempo anterior. Tempo esgotado = derrota (ou empate se o adversário não tem material para dar mate).
- Correção: a notação dos lances do computador mostrava desambiguação desnecessária (`Cb1c3`, `Ta1a8#`); agora aparece `Cc3`, `Ta8#`.
- O exemplo passou a ter cabeçalho e rodapé próprios (o rodapé automático ficava por cima do relógio).

Xadrez 3D com WebGL (`Xadrez_3D.flowmobile`):

- Mesmo jogo, motor, relógios analógicos e modo Computador x Computador do exemplo de xadrez, mas com **tabuleiro e peças em 3D desenhados com WebGL puro** (sem Three.js, sem imagens). O renderizador é `tools/gerar_exemplos/xadrez3d.js` e se encaixa no motor `xadrez.js` trocando `ffChess.draw` e `ffChess.click`.
- Peças torneadas (peão, torre, bispo, dama, rei) e cavalo extrudado; iluminação com brilho, sombras suaves, tabuleiro texturizado com coordenadas, destaque do último lance, da peça selecionada, dos destinos e do rei em xeque.
- Câmera orbital: **arraste** para girar, **roda do mouse** para o zoom; o botão Girar vira o tabuleiro suavemente para o lado das pretas. Clique nas peças ou casas (seleção por raio, correta em qualquer ângulo).
- Os lances são animados: a peça sobe e atravessa o tabuleiro, as capturas afundam, e o roque move rei e torre.
- Sem WebGL no navegador, o exemplo volta sozinho ao desenho 2D. Gere de novo com `python tools/gerar_exemplos/exemplo_11.py && python tools/gerar_exemplos/exemplo_12.py`.

## Empacotar para Android (APK)

O FlowForge roda só no navegador e não consegue compilar um APK sozinho (isso exige o Android SDK). Por isso o menu **Exportar → Android (APK)** (o antigo botão Exportar HTML virou o menu **Exportar**, com os itens *Exportar HTML* e *Android (APK)*) gera no próprio navegador um pacote `.zip` pronto para virar APK, em três formatos:

- **Capacitor + build na nuvem:** projeto Capacitor com o app em `www/`, ícones, permissões, versão e orientação já configurados (`scripts/prepare-android.js`) e um workflow do GitHub Actions (`.github/workflows/build-apk.yml`) que compila o APK de teste sozinho. Inclui assinatura opcional (APK e AAB de release) por *secrets*. Também compila localmente com `npm install && npm run android:apk` (Node 22+, JDK 21 e Android SDK).
- **PWA + PWABuilder:** `index.html` com manifest, `sw.js` (funciona offline) e ícones (192, 512, *maskable* e Apple). Publique em HTTPS e gere o APK/AAB em pwabuilder.com.
- **Projeto Android Studio:** projeto nativo (Java) com um `WebView` que serve o app em `https://appassets.androidplatform.net`, para câmera, microfone e localização funcionarem como no navegador. Trata permissões em tempo de execução, envio de arquivos, botão voltar, links externos e tela cheia. Também traz o workflow do GitHub Actions.

O item *Android (APK)* só aparece em projetos do tipo **App mobile**; em Site e Landing Page o botão Exportar abre direto a exportação de HTML. Opções do diálogo: nome do app, ID do pacote (validado), versão e código da versão, orientação, tela cheia. As **permissões** são deduzidas dos componentes do projeto (câmera → `CAMERA`, e `RECORD_AUDIO` se a câmera captura áudio; localização → `ACCESS_FINE_LOCATION`/`ACCESS_COARSE_LOCATION`). O **ícone** vem do ícone do projeto (ou é gerado a partir do nome) e é convertido para todas as densidades, inclusive o ícone adaptativo. As opções ficam salvas no projeto (`project.android`). Cada pacote traz um `LEIA-ME.md` com o passo a passo.

Arquivos: `js/ff-android-export.js` (diálogo, ícones e gerador de `.zip` sem bibliotecas), `js/ff-android-templates.js` (modelos de texto, **gerado**) e os modelos editáveis em `tools/android_templates/`; depois de editar um modelo rode `python tools/gerar_android_templates.py`. Teste: `python tools/test_android.py`.

Importante: o FlowForge entrega o projeto, e o build do APK acontece no GitHub, no PWABuilder ou no Android Studio. A estrutura foi validada (XML, JSON, YAML, PNG, sintaxe do Java, `npx cap add android` + `prepare-android.js` + `cap sync`), mas a compilação final com o Android SDK não pôde ser executada no ambiente de desenvolvimento.

## Exemplo Blocos_Empilhados (jogo novo)

Quebra-cabeça de peças que caem, escrito inteiro no FlowForge (canvas 2D + JavaScript no `onload`, motor em `tools/gerar_exemplos/blocos.js`):

- 7 formas, sorteio em **sacola** (cada grupo de 7 traz todas as peças), rotação com ajuste na parede, **peça-fantasma** tracejada e prévia da próxima peça.
- Pontuação por linhas (100/300/500/800 × nível), +1 por casa na descida e +2 na queda direta; a cada 10 linhas sobe o nível e a gravidade acelera; animação de limpeza de linhas; **recorde** salvo no aparelho.
- Controles: botões, **teclado** (setas, Espaço, P) e **toque** no tabuleiro (arraste para mover, toque para girar, deslize para baixo para a queda direta). Pausa automática ao sair da aba.
- Testado com 42 verificações (movimento, paredes, rotação, linhas, níveis, pausa, teclado, toque, fim de jogo, recorde e proporção do canvas). Gere de novo com `python tools/gerar_exemplos/exemplo_13.py`.

## Exemplo Corrida_Neon_3D (jogo 3D)

Corredor infinito em **3D com WebGL puro** (sem bibliotecas), escrito no FlowForge (motor em `tools/gerar_exemplos/corrida3d.js`, embutido no `onload`):

- Cidade neon com sol, grade e neblina; nave com sombra; câmera que acompanha a faixa. Se o navegador não tiver WebGL, o jogo avisa em vez de travar.
- Três faixas, **muros** (troque de faixa), **barreiras baixas** (pule), **portais** (deslize por baixo) e **moedas** (algumas no alto, só pegas pulando). A geração nunca bloqueia as três faixas ao mesmo tempo.
- **3 vidas** com invulnerabilidade curta após a batida, velocidade crescente (limite 36), pontuação por distância e moedas e **recorde** salvo no aparelho.
- Controles: botões, **teclado** (← → faixas, ↑/Espaço pula, ↓ desliza, P pausa, Enter reinicia) e **toque** (arraste para os lados/cima/baixo; um toque pula). Pausa automática ao sair da aba.
- Testado com 56 verificações (renderização real, faixas, pulo, deslize, colisões, moedas, velocidade, geração justa, pausa, fim de jogo, recorde, toque e fallback sem WebGL). Gere de novo com `python tools/gerar_exemplos/exemplo_14.py`.

## Exemplo Invasores_do_Espaco (jogo novo)

Jogo de tiro clássico em canvas 2D, escrito no FlowForge (motor em `tools/gerar_exemplos/invasores.js`, embutido no `onload`):

- Onda de 32 invasores (4 fileiras × 8) que andam de lado, descem ao tocar a borda e **aceleram conforme sobram menos**; 3 tipos com 10, 20 e 30 pontos; a partir da onda 3 há 5 fileiras e as ondas começam mais baixas.
- 4 **abrigos destrutíveis** (desgastam com os tiros dos dois lados), **disco voador** bônus (50 a 300 pontos), no máximo 3 tiros seus ao mesmo tempo e tiros inimigos que sobem de dificuldade.
- 3 vidas com invulnerabilidade curta, +100 por onda concluída, fim de jogo se os invasores chegam à Terra e **recorde** salvo no aparelho.
- Controles: botões, **teclado** (← → segure para mover, Espaço/↑ atira, P pausa, Enter reinicia) e **toque** (arraste para mover, toque para atirar). Pausa automática ao sair da aba.
- Testado com 51 verificações. Gere de novo com `python tools/gerar_exemplos/exemplo_15.py`.

## Exemplo Labirinto_3D (jogo 3D)

Labirinto em **primeira pessoa com WebGL puro** (sem bibliotecas), escrito no FlowForge (motor em `tools/gerar_exemplos/labirinto3d.js`):

- Um labirinto novo a cada nível (5x5 e cresce até 12x12, sempre com solução e alguns atalhos), com **tocha** (luz perto de você) e neblina, paredes com neon, chão xadrez e **farol verde** na saída.
- **Gemas** para coletar (+100), **tempo limitado** que cresce com o tamanho, bônus ao achar a saída (tempo restante × 5 + 200 × nível) e **recorde** salvo no aparelho.
- Colisão com deslize nas paredes (nunca atravessa nem sai do labirinto) e **minimapa** que revela só as células já visitadas.
- Controles: **teclado** (↑ ↓ andam, ← → giram, A D andam de lado, P pausa, Enter começa), **toque** (arraste: para os lados gira, para cima/baixo anda) e botões que podem ser **segurados**. Pausa automática ao sair da aba; se o navegador não tiver WebGL, o jogo avisa em vez de travar.
- Testado com 53 verificações (36 labirintos gerados, movimento, giro, colisões, gemas, minimapa, tempo, pausa, níveis, fim de jogo, recorde, toque e fallback). Gere de novo com `python tools/gerar_exemplos/exemplo_16.py`.

## Exemplo Memoria_Avancada e vídeo-tutorial

`Memoria_Avancada` é o app construído no vídeo-tutorial: Jogo da Memória com **3 níveis** (4x3, 4x4 e 6x4), tabuleiro **criado por código** (uma grade de botões gerada com JavaScript), contagem de jogadas, **cronômetro** e **recorde por nível** salvo no aparelho. Os eventos usados são `click()` do botão, `change()` da lista de níveis e o **OnLoad** da página. O código está dividido em 6 blocos explicáveis em `tools/gerar_exemplos/memoria_codigo.py`; gere de novo com `python tools/gerar_exemplos/exemplo_17.py`. Testado com 25 verificações.

O tutorial em vídeo é gravado por `python tools/gravar_tutorial.py [pasta]`: 6 capítulos (projeto, interface, lógica, eventos, teste no Preview e publicação) com cartões de título, legendas, cursor visível e o código digitado ao vivo, bloco a bloco. Gera `tutorial_memoria.mp4`, o projeto resultante e `capitulos.txt` com os tempos de cada capítulo. `FF_RAPIDO=1` faz um ensaio sem esperas, com capturas de tela por capítulo. Requer Playwright e ffmpeg.

## Exemplo Rastreador_de_Habitos

App de 3 páginas (Hoje, Semana, Hábitos) para acompanhar hábitos diários. **Hoje**: lista com marcação por toque, barra de progresso e sequência 🔥; **Semana**: grade dos últimos 7 dias (toque corrige um dia), taxa semanal e melhor hábito; **Hábitos**: adicionar (validação, sem duplicados, limite de 10), remover e restaurar o padrão. Dados salvos no navegador (localStorage). Todo o código fica dentro do próprio .flowmobile (eventos das páginas; gerador `tools/gerar_exemplos/exemplo_18.py`) e é carregado no OnLoad de cada página, então recarregar (F5) em qualquer página funciona.

## Exemplo Divisor_de_Conta

App de 1 página para dividir a conta do restaurante: valor (aceita `1.234,50`, `45.90`, `R$ 80`), gorjeta (0 a 20%), número de pessoas (1 a 30, botões − e +) e arredondamento opcional para reais inteiros, mostrando gorjeta, total e quanto cada pessoa paga (cálculo em centavos, sem erro de ponto flutuante). Todo o código fica dentro do .flowmobile (OnLoad da página e eventos dos componentes); gerador em `tools/gerar_exemplos/exemplo_19.py`. Testado com 23 verificações.

## Exemplo Jogo_2048

O clássico 2048 em 1 página: grade 4x4, controle por **setas do teclado** (ou WASD), **botões na tela** e **deslizar** (toque/mouse), pontuação, **recorde**, **desfazer** a última jogada, aviso ao chegar em 2048 (dá para continuar) e fim de jogo quando não há mais movimentos. O jogo é salvo no aparelho e volta ao recarregar (dados inválidos são ignorados). Todo o código fica dentro do .flowmobile (OnLoad da página e eventos dos botões); gerador em `tools/gerar_exemplos/exemplo_20.py`. Testado com 36 verificações.

## Exemplo Campo_Minado

O clássico Campo Minado em 1 página: 3 níveis (8x8/10 minas, 10x10/18, 12x12/30), **primeira jogada sempre segura**, abertura em cascata, bandeiras (clique direito, **toque longo** ou botão **Modo: Bandeira** no celular), **acorde** (tocar num número com as bandeiras certas abre as vizinhas), contador de minas, cronômetro e **recorde por nível** salvo no aparelho. Todo o código fica dentro do .flowmobile; gerador em `tools/gerar_exemplos/exemplo_21.py`. Testado com 34 verificações.

## Menu de exemplos (todos os arquivos da pasta `examples/`)

O menu **Exemplos** mostra os 24 exemplos embutidos no `app.js` e, em seguida, todos os `.flowmobile` da pasta `examples/` (37 hoje), como Campo Minado, Xadrez 3D, Corrida Neon 3D, Labirinto 3D, Invasores do Espaço, 2048, Rastreador de Hábitos, Divisor de Conta, Memória Avançada, sites e landing pages. Para funcionar abrindo o `index.html` direto do disco (sem servidor), uma cópia dos arquivos é empacotada em `js/examples-pack.js`. **Ao criar ou alterar um exemplo, rode `python tools/gerar_menu_exemplos.py`** (o teste `tools/test_menu_exemplos.py` avisa se o menu ficou desatualizado).

## Componente Som do jogo (Game Sound) e sons nos jogos

Na categoria **GAMES** da caixa de ferramentas há o componente não visual **Som do jogo** (`gamesound`). Ele não ocupa espaço no app (no editor aparece como uma etiqueta) e cria efeitos sonoros **sintetizados na hora (Web Audio), sem arquivos**; também aceita arquivos de áudio. O motor só entra no HTML exportado/Preview quando o projeto usa o componente. Chame pelo nome do componente (por padrão `Sons`):

- `Sons.play('coin')` toca um efeito pronto: `click, blip, tick, move, pop, flag, merge, coin, jump, laser, hit, explosion, powerup, start, win, lose, error`. `Sons.play('hit', 0.4)` define o volume (0 a 1).
- `Sons.tone(440, 200, 'square', 0.5)` toca uma nota (Hz, ms, onda, volume); `Sons.notes([[440,150],[660,300]])` toca uma melodia.
- `Sons.music('musica.mp3')` / `Sons.stopMusic()` música de fundo em repetição (arquivo ou data URI); `Sons.stop()` para tudo.
- `Sons.mute()`, `Sons.unmute()`, `Sons.toggleMute()` e a propriedade `muted`: o estado de mudo fica salvo no aparelho. `Sons.volume` (0 a 1).
- `Sons.register('tiro', {notes:[[880,60],[440,120]], wave:'square'})` cadastra um som próprio (`{src}`, `{notes, wave}` ou `{preset}`).

Os navegadores só liberam áudio depois do primeiro toque ou tecla; antes disso o som é simplesmente ignorado, sem erro, e se o navegador não tiver Web Audio o jogo continua normalmente. Os jogos de exemplo (Snake, Pong, Breakout, Genius, Memória, Velha, Pedra Papel Tesoura, Adivinhe o Número, Reflexo, Quiz, Forca, Blocos Empilhados, Invasores, Corrida 3D, Labirinto 3D, Xadrez 3D, 2048 e Campo Minado) têm sons e um botão 🔊/🔇. Os 9 jogos clássicos sem gerador próprio recebem os sons com `python tools/gerar_exemplos/sons_nos_jogos.py` (seguro rodar de novo). Testado com `tools/test_som.py` (31 verificações).

## Componente Gráfico (Chart) e exemplo Painel_de_Graficos

O componente **Chart** (categoria Dados) agora desenha gráficos de verdade em SVG, sem bibliotecas: **barras, barras horizontais, linhas, área, pizza e rosca**, com várias séries, legenda, valores sobre as barras, grade, linha suave, cores próprias, prefixo/sufixo (ex.: `R$ `, `%`), eixo mínimo/máximo e animação. Ele se redesenha sozinho quando o componente muda de tamanho e passa o mouse mostra o valor de cada barra, ponto ou fatia.

**Pelo editor:** escolha *Tipo de gráfico*, *Rótulos* (`Jan,Fev,Mar`) e *Valores* (`[12,19,8]`, ou `[[1,2],[3,4]]` para várias séries; também vale `{"Jan":10,"Fev":20}`).

**Pelo código** (use o nome do componente, por exemplo `grafico`):

- `grafico.setData(['Jan','Fev'], [10, 20])` troca os dados (valores `[[..],[..]]` e nomes `'Vendas,Custos'` para várias séries).
- `grafico.addPoint('12:01', 42)` acrescenta um ponto (ou uma lista, um valor por série); com `grafico.maxPoints = 20` guarda só os últimos 20, ideal para gráficos ao vivo.
- `grafico.clear()`, `grafico.getData()`, `grafico.chartType = 'line'`, `grafico.chartTitle`, `grafico.legend`, `grafico.showValues`.
- Evento **select**: clique numa barra, ponto ou fatia, com `event.detail = { index, label, value, series }` (também em `grafico.selected`).
- `grafico.toImage()` devolve uma Promise com o PNG (data URI) e `grafico.download('nome')` baixa a imagem.

O motor só entra no HTML exportado quando o projeto usa um gráfico. O exemplo **Painel_de_Graficos** (3 páginas) mostra tudo: *Vendas* (troca o tipo do gráfico, novos dados, clique nas barras), *Ao vivo* (Timer + `addPoint` + `maxPoints`, pausar e limpar) e *Despesas* (rosca com lançamentos salvos no aparelho). Gerador: `tools/gerar_exemplos/exemplo_22.py`; testes: `tools/test_grafico.py` (48 verificações) e o cenário do exemplo (30).

## Auditoria dos 124 componentes

O teste `tests/all_components_test.html` cria **todos os 124 tipos de componente** da Toolbox em uma página (uma única renderização, para o teste ser rápido), exporta o projeto e verifica o resultado no HTML gerado:

- todo tipo chega ao palco (`.component.ff-kind-<tipo>`) e ao export (`.ff-component.ff-kind-<tipo>`);
- componentes visíveis têm conteúdo e tamanho; os não visuais (timer, http, websocket, storage, geolocalização, notificação, clipboard, rede, vibração) ficam ocultos como serviço;
- as APIs dos jogos/serviços existem no export (`FlowForgeSound`, `FlowForgeTimer`, `FlowForgeChart`, `FlowForgeQRCode`, câmera, canvas com contexto 2D, `http`, `db`);
- as interações funcionam após carregar o HTML exportado: checkbox, switch, range, select, color, date, accordion, rating, stepper, carrossel, LED, lista, drawer, bottom sheet, FAB (menu abre **e** o `click` do usuário roda), toast, modal, gráfico (SVG), sparkline (canvas), QR Code, câmera (autoplay), navbar, pagenav (navega e dispara o `change` do usuário), timer (`tick`) e nenhum erro de runtime.

Resultado atual: **46 verificações, todas aprovadas (124 componentes)**. Componentes dependentes do ambiente (câmera, geolocalização, notificações, clipboard, gamepad, vibração, rede, mapa) são testados com stubs/permissões simuladas; em uso real dependem de HTTPS/localhost, permissão do usuário e do hardware.

## Eventos do usuário não substituem mais o comportamento nativo do componente

Na exportação, componentes "diretos" (o evento fica no controle real, como `<button>` ou `<video>`) tinham o `onclick`/`onchange` interno substituído pelo evento do usuário. Com isso, o FAB deixava de abrir o menu e o PageNav deixava de navegar quando o projeto definia uma ação para `click`/`change`. Agora os dois são mesclados: o comportamento nativo roda primeiro e o código do usuário roda em seguida. Teste: `tests/generated_events_test.html` e `tests/all_components_test.html`.

## TabControl: abas internas (diferente de Tabs)

O **TabControl** deixou de ser um clone das abas de página. Ele agora tem abas e painéis próprios, no palco e no HTML exportado:

- `tabs` aceita `["Geral", "Detalhes"]`, `[{ "label": "Geral", "content": "Texto do painel" }, …]` ou o JSON já salvo (até 24 abas). Texto inválido vira uma lista separada por linha/`|`; vazio cai no padrão de 3 abas.
- `activeTab` escolhe a aba inicial (índice fora da faixa é limitado à última).
- Markup acessível: `role="tablist"` → `role="tab"` (`aria-selected`, `tabindex` roving) e `role="tabpanel"` (`aria-labelledby`, `hidden` nos inativos). `←/→/↑/↓`, `Home` e `End` navegam; o foco acompanha a aba ativa.
- Trocar de aba dispara o evento **change** do componente com `event.detail = { index, value, label }`. O evento padrão do TabControl na Toolbox é `change`.
- No palco, a aba clicada é gravada em `activeTab`, então selecionar o componente (que antes re-renderizava o palco) não faz a aba voltar. A seleção no palco também não reconstrói mais o DOM: drawer, bottom sheet e FAB abrem já no primeiro clique.
- A navegação por páginas continua nos componentes **Navbar, BottomNav, Tabs, Sidebar, Drawer, BottomSheet, Toolbar, Breadcrumb, Pagination, PageNav e FAB**; o TabControl não interfere nela.

Teste: `tests/navigation_test.html` (**70 verificações**) cobre o markup de todas as navegações, troca e sincronização de páginas (navbar, paginação, drawer, FAB, select do PageNav), estados `disabled` da paginação, fechamento por Escape/clique fora, o evento `change` do usuário junto do `goPage` nativo, ARIA/teclado/`change`/escape do TabControl, o palco e a preservação de `tabs`/`activeTab` na importação.

## Novos componentes (13 tipos)

A Toolbox ganhou 13 componentes com markup real, propriedades, eventos e runtime no palco e no HTML exportado:

- **Entrada:** SearchBar, PasswordBox, NumberBox, SegmentedControl.
- **Feedback/estado:** Skeleton, ProgressRing, EmptyState.
- **Conteúdo/mídia:** CodeBlock, Chat, SignaturePad.
- **Menus/tema:** DropdownMenu, Popover, ThemeToggle.

Eventos padrão e interações:

| Componente | Evento padrão | Interação |
| --- | --- | --- |
| SearchBar | `search` | Digitar mostra o botão limpar; `Enter` dispara `search` com `{ value }`; limpar zera o campo. |
| PasswordBox | `input` | Botão alterna `type=password/text`, com `aria-pressed` e rótulo. |
| NumberBox | `change` | Botões −/+ respeitam `min`, `max` e `step`; cada passo dispara `input` e `change`. |
| SegmentedControl | `change` | Clique, setas, `Home`/`End` e `aria-pressed`/`tabindex` roving; detalhe `{ index, value }`. |
| Skeleton | `click` | Barras shimmer com `role=status` e `aria-busy`; `lines` de 1 a 12. |
| ProgressRing | `change` | SVG com `pathLength=100`; `min`, `max`, `barColor`, `showText`; API `.value` atualiza anel, texto e ARIA. |
| EmptyState | `action` | Ícone, título, descrição e botão opcional; clique dispara `action`. |
| CodeBlock | `copy` | Cabeçalho com linguagem e botão copiar (Clipboard API com fallback); feedback "Copiado!". |
| Chat | `send` | Log com `role=log`/`aria-live`, formulário adiciona a mensagem e dispara `send` com `{ message, text }`. |
| SignaturePad | `save` | Canvas com pointer events (escala por DPR); Limpar e Salvar; `save` recebe `{ dataUrl, empty }`. |
| DropdownMenu | `select` | Menu `role=menu`; setas, `Home`/`End`, `Escape`, clique fora e foco no primeiro item; `{ index, value }`. |
| Popover | `toggle` | Painel `role=dialog` posicionado por `placement` (top/bottom/left/right), `Escape` e clique fora; `{ open }`. |
| ThemeToggle | `change` | Alterna `data-theme` no `<html>`, persiste em `localStorage['ff-theme']` e aplica o tema escuro às páginas e superfícies. |

**Eventos sem handler nativo:** `search`, `action`, `send` e `save` não funcionam como atributos inline (`onsearch`/`onaction` são inertes para `CustomEvent`). A exportação marca o wrapper com `data-ff-custom-events` e liga esses eventos via `addEventListener` depois que as funções do usuário são declaradas. `copy`, `select`, `toggle` e `change` continuam como atributos inline normais.

**APIs no export:** `FF_searchbar.clear()`, `FF_searchbar.value`; `FF_segmentedcontrol.value` (índice ou rótulo); `FF_progressring.value`; `FF_codeblock.code`; `FF_chat.messages`/`FF_chat.send(texto)`; `FF_signaturepad.isEmpty`/`.clear()`/`.save()`/`.toDataURL()`; `FF_dropdownmenu.value`; `FF_themetoggle.theme`.

**Importação:** `validateProject()` normaliza os novos campos. Mensagens do Chat viram `{ from: 'me'|'them', text }`; itens de SegmentedControl/DropdownMenu viram rótulos sem espaços nas pontas (máximo 24); `language` aceita apenas javascript/typescript/html/css/json/text; `placement` cai em `bottom`; `lines` fica entre 1 e 12; `lineWidth` entre 1 e 40; `penColor` inválido vira `#111827`; `activeIndex` negativo vira 0; e os eventos `search`/`action`/`send`/`save` são preservados no round-trip.

Teste: `tests/new_components_test.html` (**56 verificações**) cobre palco, export, todas as interações acima, os quatro eventos personalizados, a API proxy, o tema persistido e a sanitização na importação. O `tests/all_components_test.html` também passa a incluir os 13 tipos (124 no total).

## Layout do palco (Mobile/Tablet/Desktop/Livre) é preservado ao abrir o projeto

O tamanho escolhido no designer (`project.viewport`) era descartado por `FFSecurity.validateProject()` ao abrir um `.flowmobile`, e o projeto reaberto voltava ao padrão do tipo (390 px para App). Agora a largura (280–1440), a altura (200–4000) e o preset (Livre/390/768/1440) são validados e restaurados. Teste: `tests/viewport_test.html` (33 verificações).

## Como rodar as suítes

Com um servidor local na raiz (`python -m http.server`), abra o `tests/*_test.html` no navegador. Para rodar tudo sem a limitação de temporizadores de abas em segundo plano, use o Chrome em modo headless e leia o resultado em `body[data-test]`:

```bash
for t in all_components camera component_semantics generated_events navigation new_components preview_assets \
         project_icons runtime_components site_chrome toolbox_i18n ui_i18n viewport; do
  "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
    --virtual-time-budget=600000 --dump-dom "http://127.0.0.1:8000/tests/${t}_test.html" \
    | grep -o 'data-test="[A-Z]*"'
done
```
