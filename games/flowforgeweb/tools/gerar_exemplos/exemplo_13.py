"""Blocos_Empilhados — quebra-cabeça de peças que caem (7 formas, rotação com ajuste na parede, peça-fantasma,
queda direta, níveis, recorde salvo, teclado + toque + botões), em canvas 2D. O motor está em blocos.js e é embutido no onload."""
from lib import *
import os
here = os.path.dirname(os.path.abspath(__file__))
JS = open(os.path.join(here, 'blocos.js'), encoding='utf-8').read()
call = lambda m, a='': {"click": f"window.ffBlocos&&window.ffBlocos.btn('{m}'{',' + a if a != '' else ''});"}
items = [
    it('heading', 'bTitle', 'Blocos Empilhados', 24, 6, 420, 40, bg='transparent'),
    it('canvas', 'bBoard', '', 24, 52, 300, 504, {}, bg='#0b1220', canvasWidth=300, canvasHeight=600),
    it('label', 'bNextTitle', 'PRÓXIMA', 340, 52, 110, 22, bg='transparent', color='#475569'),
    it('canvas', 'bNext', '', 340, 76, 110, 84, {}, bg='#0b1220', canvasWidth=110, canvasHeight=100),
    it('label', 'bScore', 'PONTOS\n0', 340, 172, 110, 52, bg='#f1f5f9', color='#0f172a'),
    it('label', 'bLevel', 'NÍVEL\n1', 340, 230, 110, 52, bg='#f1f5f9', color='#0f172a'),
    it('label', 'bLines', 'LINHAS\n0', 340, 288, 110, 52, bg='#f1f5f9', color='#0f172a'),
    it('label', 'bBest', 'RECORDE\n0', 340, 346, 110, 52, bg='#fef3c7', color='#78350f'),
    it('button', 'bPause', 'Pausar', 340, 414, 110, 44, call('pause')),
    it('button', 'bNew', 'Novo jogo', 340, 466, 110, 44, call('reset'), bg=BTN, color='#ffffff'),
    it('label', 'bStatus', 'Jogando — nível 1', 24, 566, 420, 28, bg='transparent', color='#334155'),
    it('button', 'bLeft', '◀', 24, 602, 130, 56, call('move', '-1')),
    it('button', 'bRot', '⟳ Girar', 164, 602, 140, 56, call('rotate'), bg=BTN, color='#ffffff'),
    it('button', 'bRight', '▶', 314, 602, 130, 56, call('move', '1')),
    it('button', 'bDown', '▼ Descer', 24, 668, 200, 52, call('soft')),
    it('button', 'bDrop', '⤓ Queda', 234, 668, 210, 52, call('drop'), bg='#dc2626', color='#ffffff'),
    it('label', 'bHint', 'Teclado: ← → mover, ↑ girar, ↓ descer, Espaço queda, P pausa. Toque no tabuleiro: arraste para mover, toque para girar, deslize para baixo para a queda direta. A peça tracejada mostra onde ela vai parar.', 24, 730, 420, 78, bg='transparent', color='#64748b'),
]
save('Blocos_Empilhados', proj('Blocos Empilhados', [('Principal', items, {'onload': JS + "\nwindow.ffBlocos.init();"})]))
from sons import pos_salvar
pos_salvar('Blocos_Empilhados', [])  # os sons estão no próprio blocos.js (snd); aqui entram só o componente Sons e o botão 🔊
print('ok')
