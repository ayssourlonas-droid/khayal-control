"""Xadrez_3D — o mesmo jogo do Chess_Landing_Page (motor xadrez.js, relógios, modo PC x PC), mas com
tabuleiro e peças em 3D desenhados com WebGL puro (xadrez3d.js). Parte do exemplo 11: rode exemplo_11.py antes."""
import json, os, copy
here = os.path.dirname(os.path.abspath(__file__))
ex = os.path.join(here, '..', '..', 'examples')
JS = open(os.path.join(here, 'xadrez.js'), encoding='utf-8').read()
JS3D = open(os.path.join(here, 'xadrez3d.js'), encoding='utf-8').read()
p = json.load(open(os.path.join(ex, 'Chess_Landing_Page.flowmobile'), encoding='utf-8'))
p = copy.deepcopy(p)
p['name'] = 'Xadrez 3D'
pg = p['pages'][0]
for i in pg['items']:
    n = i['name']
    if n == 'header': i['text'] = '♞ Xadrez 3D com WebGL'
    elif n == 'chessIntro':
        i['text'] = 'Tabuleiro e peças em 3D desenhados com WebGL puro, sem bibliotecas nem imagens. Arraste para girar a câmera, use a roda do mouse para aproximar e clique nas peças para jogar. Contra o computador, com um amigo ou com duas máquinas se enfrentando, com relógios analógicos.'
    elif n == 'chessHint':
        i['text'] = 'Dicas: arraste o tabuleiro para girar a câmera e use a roda do mouse para o zoom. “Girar” vira o tabuleiro para o lado das pretas. Clique em um relógio para pausar ou continuar.'
    elif n == 'chessBoard':
        i['canvasWidth'] = 480; i['canvasHeight'] = 480; i['bg'] = '#172033'
hero = next((i for i in pg['items'] if i['kind'] == 'hero'), None)
if hero:
    for k, v in list(hero.items()):
        if isinstance(v, str) and 'xadrez no navegador' in v: hero[k] = v.replace('xadrez no navegador', 'xadrez 3D no navegador')
from sons import MUTE_LOAD
pg['events'] = {"onload": JS + "\n" + JS3D + "\nwindow.ffChess.init();\n" + MUTE_LOAD, "onshow": ""}
dest = os.path.join(ex, 'Xadrez_3D.flowmobile')
json.dump(p, open(dest, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok', os.path.getsize(dest), 'bytes')
