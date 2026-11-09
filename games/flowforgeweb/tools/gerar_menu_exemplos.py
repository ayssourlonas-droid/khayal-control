"""Gera js/examples-pack.js: os exemplos da pasta examples/ que ainda não estão no menu Exemplos (embutidos no app.js).
Rode de novo sempre que um .flowmobile for criado ou alterado:  python3 tools/gerar_menu_exemplos.py
(Os arquivos .flowmobile continuam sendo a fonte; este script só empacota uma cópia para o navegador abrir sem servidor.)"""
import json, os, glob
raiz = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
# já existem no menu embutido (app.js): não repetir
JA_NO_MENU = {'Lista_de_Tarefas'}
# jogos clássicos: a versão da pasta (com sons) substitui a do menu embutido  →  arquivo: chave do app.js
SUBSTITUI = {'Snake': 'snake', 'Pong_IA': 'pong', 'Breakout': 'breakout', 'Genius_Simon': 'simon', 'Jogo_da_Memoria': 'memory',
             'Adivinhe_o_Numero': 'guess', 'Teste_de_Reflexo': 'reaction', 'Pedra_Papel_Tesoura_IA': 'rps', 'Jogo_da_Velha_IA': 'tictactoe'}
# arquivo: (ícone, título, descrição)
META = {
 'Snake': ('●', 'Snake', 'Movimento, timer, colisão e pontuação. Com sons.'),
 'Pong_IA': ('↕', 'Pong vs IA', 'Raquete, bola, colisões e adversário automático. Com sons.'),
 'Breakout': ('▦', 'Breakout', 'Blocos, colisão, pontuação e controle da raquete. Com sons.'),
 'Genius_Simon': ('◉', 'Genius / Simon', 'Sequências, memória e temporização. Com sons.'),
 'Jogo_da_Memoria': ('▦', 'Jogo da Memória', 'Encontre os pares e pratique estado, eventos e Timer. Com sons.'),
 'Adivinhe_o_Numero': ('#', 'Adivinhe o Número', 'Jogo simples com entrada de dados e lógica. Com sons.'),
 'Teste_de_Reflexo': ('⚡', 'Teste de Reflexo', 'Timer aleatório e medição de tempo de reação. Com sons.'),
 'Pedra_Papel_Tesoura_IA': ('✊', 'Pedra Papel Tesoura', 'Jogador contra IA com escolha aleatória. Com sons.'),
 'Jogo_da_Velha_IA': ('⊞', 'Jogo da Velha IA', 'Jogador X contra IA O com estratégia minimax. Com sons.'),
 'Blocos_Empilhados': ('▤', 'Blocos Empilhados', 'Jogo de empilhar blocos com timing e pontuação.'),
 'Cadastro_Usuario': ('👤', 'Cadastro de Usuário', 'Formulário com validação de campos.'),
 'Calculadora_Interativa': ('🧮', 'Calculadora Interativa', 'Calculadora com botões e visor.'),
 'Calculadoras_Multipagina': ('🧮', 'Calculadoras (3 páginas)', 'Várias calculadoras com navegação entre páginas.'),
 'Campo_Minado': ('💣', 'Campo Minado', 'Clássico com 3 níveis, bandeiras, acorde, cronômetro e recorde.'),
 'Chess_Landing_Page': ('♞', 'Chess Landing Page', 'Landing page com tabuleiro de xadrez.'),
 'Controle_de_Gastos': ('💰', 'Controle de Gastos', 'Lançamentos, totais e saldo.'),
 'Conversor_de_Unidades': ('⇄', 'Conversor de Unidades', 'Converte comprimento, peso e temperatura.'),
 'Corrida_Neon_3D': ('🏎', 'Corrida Neon 3D', 'Jogo de corrida em 3D (WebGL) com vidas e obstáculos.'),
 'Cronometro_Voltas': ('⏱', 'Cronômetro com Voltas', 'Cronômetro com registro de voltas.'),
 'Dashboard_Sistema': ('▥', 'Dashboard do Sistema', 'Painel com indicadores do sistema.'),
 'Divisor_de_Conta': ('🍽', 'Divisor de Conta', 'Divide a conta com gorjeta e arredondamento.'),
 'Editor_de_Texto': ('✎', 'Editor de Texto', 'Editor com formatação e contagem de palavras.'),
 'Editor_de_Texto_Blocos': ('✎', 'Editor de Texto em Blocos', 'Editor de texto construído com blocos visuais.'),
 'Estudio_de_Camera': ('📷', 'Estúdio de Câmera', 'Câmera, filtros e captura de fotos.'),
 'FileUpload_PictureBox': ('🖼', 'Carregar imagem no PictureBox', 'Escolher um arquivo e mostrar a imagem.'),
 'FlowForge_Landing_Header_Nav_Footer_Exemplo': ('↥', 'Landing: Cabeçalho, Menu e Rodapé', 'Landing page com layout de 3 páginas.'),
 'FlowForge_Site_Header_Nav_Footer_Exemplo': ('🌐', 'Site: Cabeçalho, Menu e Rodapé', 'Site com cabeçalho, navegação e rodapé.'),
 'Foto_de_Perfil': ('🙂', 'Foto de Perfil', 'Escolher e ajustar a foto de perfil.'),
 'Invasores_do_Espaco': ('👾', 'Invasores do Espaço', 'Jogo de nave com ondas de invasores.'),
 'Jogo_2048': ('🔢', '2048', 'O clássico 2048: setas, deslizar, desfazer e recorde.'),
 'Jogo_da_Forca': ('🔤', 'Jogo da Forca', 'Adivinhe a palavra letra por letra.'),
 'Labirinto_3D': ('🧭', 'Labirinto 3D', 'Labirinto em 3D (WebGL) com gemas e minimapa.'),
 'Laboratorio_do_Depurador': ('🐞', 'Laboratório do Depurador', 'Pratique pontos de parada e inspeção de variáveis.'),
 'Landing_Page_Layout_Exemplo': ('↥', 'Landing Page: Layout', 'Demonstração de layout de landing page.'),
 'Landing_Page_SaaS_Exemplo': ('☁', 'Landing Page SaaS', 'Página de produto SaaS com planos e CTA.'),
 'Memoria_Avancada': ('🃏', 'Memória Avançada (3 níveis)', 'Memória com tabuleiro por código, cronômetro e recorde.'),
 'Painel_de_Graficos': ('📊', 'Painel de Gráficos', 'Componente Gráfico: barras, linhas, ao vivo e rosca de despesas.'),
 'Painel_Configuracoes': ('⚙', 'Painel de Configurações', 'Opções e preferências do aplicativo.'),
 'Pomodoro': ('🍅', 'Pomodoro', 'Temporizador de foco e pausa.'),
 'Quiz_de_Conhecimentos': ('❓', 'Quiz de Conhecimentos', 'Perguntas com pontuação e resultado final.'),
 'Rastreador_de_Habitos': ('✅', 'Rastreador de Hábitos', 'App de 3 páginas: Hoje, Semana e Hábitos.'),
 'Site_Corporativo_Exemplo': ('🏢', 'Site Corporativo', 'Site institucional de 4 páginas.'),
 'Site_Landing_Pages_Layout_Exemplo': ('🌐', 'Site + Landing: Layout', 'Site com landing pages e layout compartilhado.'),
 'Site_Multipagina': ('🌐', 'Site Multipágina', 'Site com navegação entre 3 páginas.'),
 'Visualizador_de_Fotos': ('🖼', 'Visualizador de Fotos', 'Galeria de fotos com navegação.'),
 'Xadrez_3D': ('♟', 'Xadrez 3D', 'Xadrez em 3D (WebGL) contra o computador.'),
}
pack = []; falta = []
for f in sorted(glob.glob(os.path.join(raiz, 'examples', '*.flowmobile'))):
    k = os.path.basename(f)[:-len('.flowmobile')]
    if k in JA_NO_MENU: continue
    if k not in META: falta.append(k); continue
    ic, ti, de = META[k]
    e = {'key': 'file:' + k, 'icon': ic, 'title': ti, 'desc': de, 'project': json.load(open(f, encoding='utf-8'))}
    if k in SUBSTITUI: e['replaces'] = SUBSTITUI[k]
    pack.append(e)
if falta: raise SystemExit('Sem descrição em META para: ' + ', '.join(falta))
dest = os.path.join(raiz, 'js', 'examples-pack.js')
open(dest, 'w', encoding='utf-8').write('/* Gerado por tools/gerar_menu_exemplos.py a partir de examples/*.flowmobile — não edite à mão. */\nwindow.FF_EXAMPLE_PACK = ' + json.dumps(pack, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(pack), 'exemplos →', dest, os.path.getsize(dest) // 1024, 'KB')
