"""Memoria_Avancada — o app do tutorial em vídeo (tools/gravar_tutorial.py): Jogo da Memória com 3 níveis (4x3, 4x4, 6x4),
tabuleiro criado por código, contagem de jogadas, cronômetro e recorde por nível salvo no aparelho.
O código está em memoria_codigo.py (mesmos blocos que o vídeo digita)."""
from lib import *
import os, json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import memoria_codigo as M
items = []
for kind, name, text, x, y, w, h in M.UI:
    ev = {}
    kw = {}
    if name == 'btnNovo': ev = {'click': M.CLICK}; kw = dict(bg=BTN, color='#ffffff')
    if name == 'selNivel': ev = {'change': M.CHANGE}; kw = dict(items=json.loads(M.NIVEIS_JSON))
    if name == 'tabuleiro': kw = dict(bg='#f1f5f9')
    if kind == 'label' and name != 'lblMsg': kw = dict(bg='#e0e7ff', color='#312e81')
    items.append(it(kind, name, text, x, y, w, h, ev, **kw))
p = proj('Jogo da Memória', [('Jogo', items, {'onload': M.ONLOAD})])
dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'examples', 'Memoria_Avancada.flowmobile')
json.dump(p, open(dest, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
