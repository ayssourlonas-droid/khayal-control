"""Ajudantes para pôr sons nos jogos de exemplo: componente Game Sound ("Sons") + botão 🔊/🔇.
Usado por sons_nos_jogos.py (jogos antigos, editados no próprio .flowmobile) e pelos geradores novos."""
import uuid, json

def item_som(y, x=20):
    """Componente não visual Game Sound chamado Sons (fica escondido no app; no editor aparece como uma etiqueta)."""
    return {"id": str(uuid.uuid4()), "kind": "gamesound", "name": "Sons", "text": "Sons", "x": x, "y": y, "width": "90px", "height": "34px",
            "bg": "#ffffff", "color": "#222222", "events": {}, "volume": 0.6, "muted": False, "sounds": "", "visible": True, "enabled": True}

MUTE_CLICK = "Sons.toggleMute();document.getElementById('btnSom').textContent=Sons.muted?'🔇':'🔊';Sons.play('click');"
MUTE_LOAD = "document.getElementById('btnSom').textContent=Sons.muted?'🔇':'🔊';"

def item_mudo(x, y, w=36, h=32):
    return {"id": str(uuid.uuid4()), "kind": "button", "name": "btnSom", "text": "🔊", "x": x, "y": y, "width": f"{w}px", "height": f"{h}px",
            "bg": "#e2e8f0", "color": "#0f172a", "events": {"click": MUTE_CLICK}}

def tem_som(p):
    return any(i.get('kind') == 'gamesound' for pg in p['pages'] for i in pg['items'])

def aplicar(p, hooks, pagina=0, mudo_xy=None):
    """hooks: [(trecho, novo)] aplicados a TODOS os eventos (cada trecho deve existir ao menos uma vez).
    Acrescenta o componente Sons e o botão de mudo (mudo_xy = (x, y); padrão: canto do 1º título)."""
    if tem_som(p): return False
    achou = {h[0]: 0 for h in hooks}
    for pg in p['pages']:
        evs = [pg.get('events') or {}] + [i.get('events') or {} for i in pg['items']]
        for ev in evs:
            for k, v in list(ev.items()):
                if not isinstance(v, str): continue
                for a, b in hooks:
                    if a in v: achou[a] += v.count(a); v = v.replace(a, b)
                ev[k] = v
    faltou = [a for a, n in achou.items() if not n]
    if faltou: raise SystemExit('trecho não encontrado: ' + repr(faltou[0][:80]))
    pg = p['pages'][pagina]; its = pg['items']
    if mudo_xy is None:
        h = next((i for i in its if i['kind'] == 'heading'), None)
        mudo_xy = (334, (h['y'] + 4) if h else 70)
    num = lambda v: float(str(v).replace('px', '') or 0) if str(v).replace('px', '').replace('.', '', 1).isdigit() else 0
    base = int(max(num(i['y']) + num(i['height']) for i in its))
    its.append(item_mudo(*mudo_xy)); its.append(item_som(base + 12))
    ev = pg.get('events') or {'onload': '', 'onshow': ''}
    ev['onload'] = (ev.get('onload') or '') + ('\n' if ev.get('onload') else '') + MUTE_LOAD
    pg['events'] = ev
    return True

def pos_salvar(nome, hooks, **kw):
    """Abre examples/<nome>.flowmobile (acabou de ser gerado) e põe os sons."""
    import os
    f = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'examples', nome + '.flowmobile')
    p = json.load(open(f, encoding='utf-8'))
    if aplicar(p, hooks, **kw): json.dump(p, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
