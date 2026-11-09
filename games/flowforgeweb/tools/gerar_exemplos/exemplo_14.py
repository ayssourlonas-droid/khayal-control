"""Corrida_Neon_3D — corredor infinito em 3D (WebGL puro): 3 faixas, muros, barreiras, portais, moedas, 3 vidas,
velocidade crescente; teclado + botões + gestos de toque. O motor está em corrida3d.js e é embutido no onload."""
from lib import *
import os
here = os.path.dirname(os.path.abspath(__file__))
JS = open(os.path.join(here, 'corrida3d.js'), encoding='utf-8').read()
call = lambda m: {"click": f"window.ffCorrida&&window.ffCorrida.btn('{m}');"}
items = [
    it('heading', 'cTitle', 'Corrida Neon 3D', 24, 6, 420, 40, bg='transparent'),
    it('canvas', 'cView', '', 24, 52, 420, 458, {}, bg='#2a1458', canvasWidth=444, canvasHeight=576),
    it('label', 'cScore', 'PONTOS\n0', 24, 518, 99, 52, bg='#f1f5f9', color='#0f172a'),
    it('label', 'cCoins', 'MOEDAS\n0', 131, 518, 99, 52, bg='#fef3c7', color='#78350f'),
    it('label', 'cLives', 'VIDAS\n♥♥♥', 238, 518, 99, 52, bg='#fee2e2', color='#7f1d1d'),
    it('label', 'cBest', 'RECORDE\n0', 345, 518, 99, 52, bg='#e0e7ff', color='#312e81'),
    it('label', 'cStatus', 'Pronto — toque, Espaço ou ↑ para começar', 24, 576, 420, 26, bg='transparent', color='#334155'),
    it('button', 'cLeft', '◀', 24, 608, 99, 60, call('left')),
    it('button', 'cJump', '⤒ Pular', 131, 608, 99, 60, call('jump'), bg=BTN, color='#ffffff'),
    it('button', 'cSlide', '⤓ Deslizar', 238, 608, 99, 60, call('slide'), bg=BTN, color='#ffffff'),
    it('button', 'cRight', '▶', 345, 608, 99, 60, call('right')),
    it('button', 'cPause', 'Pausar', 24, 676, 200, 52, call('pause')),
    it('button', 'cNew', 'Novo jogo', 234, 676, 210, 52, call('reset'), bg='#dc2626', color='#ffffff'),
    it('label', 'cHint', 'Teclado: ← → trocam de faixa, ↑ ou Espaço pula, ↓ desliza, P pausa, Enter reinicia. Toque: arraste para os lados, para cima ou para baixo; um toque pula. Desvie das paredes, pule as barreiras baixas, deslize sob os portais e pegue as moedas.', 24, 736, 420, 84, bg='transparent', color='#64748b'),
]
save('Corrida_Neon_3D', proj('Corrida Neon 3D', [('Principal', items, {'onload': JS + "\nwindow.ffCorrida.init();"})]))
print('ok')

# ---------- sons: o motor chama Sons.play (snd); aqui entram o componente Game Sound e o botão 🔊/🔇 ----------
from sons import pos_salvar
pos_salvar('Corrida_Neon_3D', [])
