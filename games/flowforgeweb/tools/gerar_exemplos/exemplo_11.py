"""Chess_Landing_Page — xadrez completo (regras oficiais, computador opcional) numa landing page.
O motor está em xadrez.js (mesma pasta) e é embutido no onload da página."""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
JS = open(os.path.join(here, 'xadrez.js'), encoding='utf-8').read()
dest = os.path.join(here, '..', '..', 'examples', 'Chess_Landing_Page.flowmobile')
old = json.load(open(dest, encoding='utf-8'))
hero = dict(next(i for i in old['pages'][0]['items'] if i['kind'] == 'hero')); hero['y'] = 35  # posição-base (idempotente)

def it(id_, kind, name, text, x, y, w, h, events=None, bg='transparent', color='#222', **kw):
    d = {"id": id_, "kind": kind, "name": name, "text": text, "x": x, "y": y, "width": f"{w}px", "height": f"{h}px",
         "bg": bg, "color": color, "events": events or {}}
    d.update(kw); return d

call = lambda m: {"click": f"window.ffChess&&window.ffChess.{m};"}
MODOS = ['Contra o computador — fácil', 'Contra o computador — médio', 'Dois jogadores', 'Computador x Computador']
TEMPOS = ['Sem limite (cronômetro)', '1 min', '3 min + 2 s', '5 min', '5 min + 3 s', '10 min', '15 min + 10 s', '30 min']
items = [
    hero,
    it('ch-l', 'label', 'chessIntro', 'Xadrez completo no navegador: roque, en passant, promoção, xeque-mate e empates. Jogue contra o computador, com um amigo ou assista a duas máquinas se enfrentando, com relógios analógicos de xadrez. Tudo desenhado por JavaScript, sem arquivos de imagem.', 65, 190, 650, 70),
    it('ch-c', 'canvas', 'chessBoard', '', 65, 270, 480, 480, {"click": "window.ffChess&&window.ffChess.click(event);"}, bg='#fff', canvasWidth=480, canvasHeight=480),
    it('ch-t', 'heading', 'chessTitle', 'Partida', 575, 270, 190, 40),
    it('ch-s', 'label', 'chessStatus', 'Vez das brancas', 575, 314, 190, 48, bg='#f1f5f9', color='#0f172a'),
    it('ch-m', 'select', 'chessMode', 'Modo', 575, 366, 190, 34, {"change": "window.ffChess&&window.ffChess.modeChanged();"}, items=MODOS),
    it('ch-sp', 'select', 'chessSpeed', 'Ritmo do computador', 575, 404, 190, 34, {"change": "window.ffChess&&window.ffChess.save();"}, items=['Computador: Lento', 'Computador: Normal', 'Computador: Rápido']),
    it('ch-tm', 'select', 'chessTime', 'Tempo', 575, 442, 190, 34, {"change": "window.ffChess&&window.ffChess.timeChanged();"}, items=TEMPOS),
    it('ch-p', 'select', 'chessPromo', 'Promoção', 575, 480, 190, 34, {"change": "window.ffChess&&window.ffChess.save();"}, items=['Promover em Dama', 'Promover em Torre', 'Promover em Bispo', 'Promover em Cavalo']),
    it('ch-b', 'button', 'chessStart', 'Novo jogo', 575, 520, 92, 38, call('reset(true)'), bg='#2563eb', color='#fff'),
    it('ch-pa', 'button', 'chessPause', 'Pausar', 673, 520, 92, 38, call('pause()')),
    it('ch-u', 'button', 'chessUndo', 'Desfazer', 575, 564, 92, 38, call('undo()')),
    it('ch-f', 'button', 'chessFlip', 'Girar', 673, 564, 92, 38, call('flip()')),
    it('ch-v', 'textarea', 'chessMoves', '', 575, 608, 190, 142, {}, readOnly=True),
    it('ch-k', 'label', 'chessCaptured', 'Brancas capturaram: —     Pretas capturaram: —', 65, 760, 700, 56, color='#475569'),
    it('ch-ct', 'heading', 'chessClockTitle', 'Relógio de xadrez', 65, 826, 400, 40),
    it('ch-cw', 'canvas', 'chessClockW', '', 115, 872, 210, 210, {"click": "window.ffChess&&window.ffChess.clockClick();"}, canvasWidth=210, canvasHeight=210),
    it('ch-cb', 'canvas', 'chessClockB', '', 475, 872, 210, 210, {"click": "window.ffChess&&window.ffChess.clockClick();"}, canvasWidth=210, canvasHeight=210),
    it('ch-lw', 'label', 'chessClockWLabel', 'Brancas  10:00', 115, 1086, 210, 32, color='#0f172a'),
    it('ch-lb', 'label', 'chessClockBLabel', 'Pretas  10:00', 475, 1086, 210, 32, color='#0f172a'),
    it('ch-sc', 'label', 'chessScore', 'Placar:  Brancas 0  •  Empates 0  •  Pretas 0', 65, 1132, 430, 34, color='#334155'),
    it('ch-au', 'select', 'chessAuto', 'Reinício', 505, 1132, 260, 34, {"change": "window.ffChess&&window.ffChess.save();"}, items=['Nova partida automática: não', 'Nova partida automática: sim']),
    it('ch-h', 'label', 'chessHint', 'Dicas: clique em um dos relógios para pausar ou continuar. Em “Computador x Computador” as partidas rodam sozinhas; ative a nova partida automática para um torneio sem fim.', 65, 1176, 700, 56, color='#64748b'),
]
# cabeçalho próprio no topo (72 px): o conteúdo começa abaixo dele
DY = 70
for i in items: i['y'] += DY
# rodapé próprio logo abaixo do conteúdo (senão a landing page coloca o rodapé automático em y=900, por cima do relógio)
fim = max(i['y'] + int(i['height'][:-2]) for i in items)
W = 'calc(100% - 48px)'
cabecalho = {"id": "ch-hd", "kind": "header", "name": "header", "text": "♞ Xadrez no navegador", "x": 24, "y": 16, "width": W, "height": 72, "bg": "#ffffff", "color": "#111827", "events": {}}
rodape = {"id": "ch-ft", "kind": "footer", "name": "footer", "text": "© FlowForge WebStudio", "x": 24, "y": fim + 30, "width": W, "height": 70, "bg": "#111827", "color": "#ffffff", "events": {}}
items = [cabecalho] + items + [rodape]
old['pages'][0]['items'] = items
old['pages'][0]['events'] = {"onload": JS + "\nwindow.ffChess.init();", "onshow": ""}
json.dump(old, open(dest, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok', os.path.getsize(dest), 'bytes')

# ---------- sons: o motor chama Sons.play (snd); aqui entram o componente Game Sound e o botão 🔊/🔇 (ao lado do título "Partida") ----------
from sons import pos_salvar
pos_salvar('Chess_Landing_Page', [], mudo_xy=(729, 274))
