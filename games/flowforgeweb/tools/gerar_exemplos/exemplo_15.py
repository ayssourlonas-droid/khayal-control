"""Invasores_do_Espaco — jogo de tiro em canvas 2D (onda de invasores, abrigos que se desgastam, 3 vidas, ondas crescentes,
recorde salvo; teclado + botões + toque). O motor está em invasores.js e é embutido no onload."""
from lib import *
import os
here = os.path.dirname(os.path.abspath(__file__))
JS = open(os.path.join(here, 'invasores.js'), encoding='utf-8').read()
call = lambda m: {"click": f"window.ffInvasores&&window.ffInvasores.btn('{m}');"}
items = [
    it('heading', 'iTitle', 'Invasores do Espaço', 24, 6, 420, 40, bg='transparent'),
    it('canvas', 'iView', '', 24, 52, 420, 470, {}, bg='#050816', canvasWidth=360, canvasHeight=480),
    it('label', 'iScore', 'PONTOS\n0', 24, 530, 99, 52, bg='#f1f5f9', color='#0f172a'),
    it('label', 'iWave', 'ONDA\n1', 131, 530, 99, 52, bg='#ede9fe', color='#4c1d95'),
    it('label', 'iLives', 'VIDAS\n♥♥♥', 238, 530, 99, 52, bg='#fee2e2', color='#7f1d1d'),
    it('label', 'iBest', 'RECORDE\n0', 345, 530, 99, 52, bg='#e0e7ff', color='#312e81'),
    it('label', 'iStatus', 'Defenda a Terra — onda 1', 24, 588, 420, 26, bg='transparent', color='#334155'),
    it('button', 'iLeft', '◀', 24, 620, 130, 60, call('left')),
    it('button', 'iFire', '✦ Atirar', 164, 620, 140, 60, call('fire'), bg='#dc2626', color='#ffffff'),
    it('button', 'iRight', '▶', 314, 620, 130, 60, call('right')),
    it('button', 'iPause', 'Pausar', 24, 688, 200, 52, call('pause')),
    it('button', 'iNew', 'Novo jogo', 235, 688, 210, 52, call('reset'), bg=BTN, color='#ffffff'),
    it('label', 'iHint', 'Teclado: ← → movem a nave (segure), Espaço ou ↑ atira (segure para rajada), P pausa, Enter reinicia. Toque: arraste no jogo para mover, toque para atirar. Os abrigos verdes se desfazem com os tiros; o disco vermelho vale pontos extras.', 24, 748, 420, 84, bg='transparent', color='#64748b'),
]
save('Invasores_do_Espaco', proj('Invasores do Espaço', [('Principal', items, {'onload': JS + "\nwindow.ffInvasores.init();"})]))
print('ok')

# ---------- sons: o motor chama Sons.play (snd); aqui entram o componente Game Sound e o botão 🔊/🔇 ----------
from sons import pos_salvar
pos_salvar('Invasores_do_Espaco', [])
