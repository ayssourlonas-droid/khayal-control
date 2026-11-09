"""Labirinto_3D — labirinto em primeira pessoa (WebGL puro): níveis crescentes, gemas, saída com farol, tempo,
colisão com deslize, tocha/neblina e minimapa que revela o que já foi visitado. Motor em labirinto3d.js (embutido no onload)."""
from lib import *
import os
here = os.path.dirname(os.path.abspath(__file__))
JS = open(os.path.join(here, 'labirinto3d.js'), encoding='utf-8').read()
call = lambda m: {"click": f"window.ffLabirinto&&window.ffLabirinto.btn('{m}');"}
items = [
    it('heading', 'lTitle', 'Labirinto 3D', 24, 6, 420, 40, bg='transparent'),
    it('canvas', 'lView', '', 24, 52, 420, 420, {}, bg='#080a17', canvasWidth=420, canvasHeight=420),
    it('canvas', 'lMap', '', 306, 60, 130, 109, {}, bg='transparent', canvasWidth=109, canvasHeight=109),
    it('label', 'lMsg', '', 44, 170, 380, 160, bg='transparent', color='#ffffff'),
    it('label', 'lNivel', 'NÍVEL\n1', 24, 480, 99, 52, bg='#f1f5f9', color='#0f172a'),
    it('label', 'lGemas', 'GEMAS\n0/4', 131, 480, 99, 52, bg='#fae8ff', color='#701a75'),
    it('label', 'lTempo', 'TEMPO\n1:00', 238, 480, 99, 52, bg='#fef3c7', color='#78350f'),
    it('label', 'lPontos', 'PONTOS\n0', 345, 480, 99, 52, bg='#e0e7ff', color='#312e81'),
    it('label', 'lStatus', 'Pronto — Enter ou toque para começar', 24, 538, 420, 26, bg='transparent', color='#334155'),
    it('button', 'lLeft', '◀ Girar', 24, 570, 99, 64, {}),
    it('button', 'lFwd', '▲ Frente', 131, 570, 99, 64, {}, bg=BTN, color='#ffffff'),
    it('button', 'lBack', '▼ Trás', 238, 570, 99, 64, {}, bg=BTN, color='#ffffff'),
    it('button', 'lRight', 'Girar ▶', 345, 570, 99, 64, {}),
    it('button', 'lPause', 'Pausar', 24, 642, 200, 52, call('pause')),
    it('button', 'lNew', 'Novo jogo', 234, 642, 210, 52, call('reset'), bg='#dc2626', color='#ffffff'),
    it('label', 'lHint', 'Teclado: ↑ ↓ andam, ← → giram, A D andam de lado, P pausa, Enter começa. Toque: arraste no jogo (para os lados gira, para cima ou para baixo anda) ou segure os botões. Pegue as gemas, ache o farol verde da saída e vigie o tempo. O minimapa mostra só o que você já visitou.', 24, 702, 420, 96, bg='transparent', color='#64748b'),
]
save('Labirinto_3D', proj('Labirinto 3D', [('Principal', items, {'onload': JS + "\nwindow.ffLabirinto.init();"})]))
print('ok')

# ---------- sons: o motor chama Sons.play (snd); aqui entram o componente Game Sound e o botão 🔊/🔇 ----------
from sons import pos_salvar
pos_salvar('Labirinto_3D', [])
