"""Componente Game Sound (gamesound): toolbox, propriedades, runtime no HTML exportado, efeitos, mudo, sons personalizados."""
import os, sys, json
import common
sys.path.insert(0, os.path.join(common.TOOLS, 'gerar_exemplos'))
from lib import *
from playwright.sync_api import sync_playwright
R = []
def t(l, ok, d=''): R.append(bool(ok)); print('✓' if ok else '✗', l, '' if ok else d)
SOUNDS = json.dumps({"boom": {"preset": "explosion"}, "tema": {"notes": [[440, 100], [660, 200]], "wave": "triangle"}, "arq": {"src": "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="}})
items = [it('label', 'lbl', 'x', 20, 10, 200, 30),
         it('button', 'btnMoeda', 'Moeda', 20, 50, 100, 40, {'click': "Sons.play('coin');"}),
         it('button', 'btnMudo', 'Mudo', 130, 50, 100, 40, {'click': "lbl.textContent = Sons.toggleMute() ? 'mudo' : 'som';"}),
         it('gamesound', 'Sons', 'Sons', 20, 100, 90, 34, {}, volume=0.4, muted=False, sounds=SOUNDS)]
p = proj('Som', [('P', items, {'onload': ''})])
json.dump(p, open(common.OUT + '/som.flowmobile', 'w', encoding='utf-8'), ensure_ascii=False)
p2 = proj('SemSom', [('P', [it('button', 'b', 'x', 20, 10, 100, 40)], {'onload': ''})])
json.dump(p2, open(common.OUT + '/semsom.flowmobile', 'w', encoding='utf-8'), ensure_ascii=False)
INIT = "window.__osc=0;window.__noise=0;(()=>{const A=window.AudioContext;if(!A)return;const co=A.prototype.createOscillator,cb=A.prototype.createBufferSource;A.prototype.createOscillator=function(){window.__osc++;return co.apply(this,arguments)};A.prototype.createBufferSource=function(){window.__noise++;return cb.apply(this,arguments)}})()"
with sync_playwright() as pw:
    b = pw.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); ctx = b.new_context(viewport={'width': 1400, 'height': 900}); pg = ctx.new_page(); erros = []
    pg.on('pageerror', lambda e: erros.append(str(e))); pg.on('console', lambda m: erros.append(m.text) if m.type == 'error' else None)
    pg.goto(common.URL + '/index.html'); pg.wait_for_timeout(500)
    pg.evaluate("FlowForgeI18n.setLanguage('pt-BR');document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    # --- toolbox e propriedades ---
    pg.fill('#toolSearch', 'sound') if pg.locator('#toolSearch').count() else None
    pg.evaluate("renderTools('')"); pg.wait_for_timeout(100)
    btn = pg.locator('#tools button.tool[data-kind=gamesound]')
    t('Game Sound aparece na toolbox (grupo GAMES)', btn.count() == 1, btn.count())
    nome = pg.evaluate("document.querySelector('#tools button.tool[data-kind=gamesound] .toolLabel').textContent")
    t('nome traduzido na toolbox (pt-BR)', nome == 'Som do jogo', nome)
    btn.scroll_into_view_if_needed(); btn.click(); pg.wait_for_timeout(300)
    t('clicar adiciona o componente "Sons1" não visual', pg.evaluate("selected&&selected.kind==='gamesound'&&selected.name==='Sons1'"), pg.evaluate("selected&&selected.name"))
    campos = pg.evaluate("[...document.querySelectorAll('#propDynamic [data-key], #propDynamic input, #propDynamic textarea')].map(e=>e.dataset.key||e.id||e.name||e.type)")
    t('painel de propriedades: volume, começar sem som e sons personalizados', all(k in campos for k in ('volume', 'muted', 'sounds')), campos)
    t('sem a propriedade de encaixe (Dock) por ser não visual', 'dock' not in campos, campos)
    pg.evaluate("renderTools('')")
    # --- componente no HTML exportado ---
    pg.set_input_files('#fileInput', common.OUT + '/som.flowmobile'); pg.wait_for_timeout(700)
    html = pg.evaluate("generated()")
    t('HTML exportado inclui o motor de som e esconde o componente', 'FlowForgeSound' in html and '.ff-kind-gamesound,.ff-kind-timer{display:none!important}' in html)
    pg.set_input_files('#fileInput', common.OUT + '/semsom.flowmobile'); pg.wait_for_timeout(700)
    t('projeto sem o componente não leva o motor de som', 'engine' not in pg.evaluate("generated()") and 'ff_sound_muted' not in pg.evaluate("generated()"))
    pg.set_input_files('#fileInput', common.OUT + '/som.flowmobile'); pg.wait_for_timeout(700)
    open(common.OUT + '/som.html', 'w', encoding='utf-8').write(html)
    pg2 = ctx.new_page(); pg2.on('pageerror', lambda e: erros.append(str(e))); pg2.add_init_script(INIT)
    pg2.goto(common.URL + '/tools/_out/som.html'); pg2.wait_for_timeout(500)
    J = pg2.evaluate
    t('Sons é uma variável do projeto com play/tone/notes/mute', J("typeof Sons.play==='function'&&typeof Sons.tone==='function'&&typeof Sons.notes==='function'&&typeof Sons.toggleMute==='function'"))
    t('o componente fica invisível na página', J("getComputedStyle(document.getElementById('Sons')).display")=='none')
    t('volume vem da propriedade (0.4) e começa com som', J("Sons.volume")==0.4 and J("Sons.muted")==False, (J("Sons.volume"), J("Sons.muted")))
    pres = J("Sons.presets"); t('17 efeitos prontos', len(pres) == 17 and all(k in pres for k in ('coin', 'jump', 'hit', 'explosion', 'win', 'lose', 'click', 'laser', 'powerup')), pres)
    pg2.click('#btnMoeda'); pg2.wait_for_timeout(200)
    t('botão tocando Sons.play("coin") registra o som e cria osciladores', J("Sons.history.at(-1).name")=='coin' and J("window.__osc")>=2, (J("Sons.history.at(-1)"), J("window.__osc")))
    ok = all(J("Sons.play(%r)" % k) for k in pres); t('todos os 17 efeitos tocam sem erro', ok)
    t('explosão usa ruído', J("window.__noise")>=2, J("window.__noise"))
    t('nome desconhecido devolve false', J("Sons.play('naoexiste')")==False)
    t('tone e notes funcionam', J("Sons.tone(440,100,'sine',0.5)")==True and J("Sons.notes([[262,80],[330,80],[0,50],[392,160]],'triangle')")==True)
    t('sons personalizados da propriedade: preset, melodia e arquivo', J("Sons.play('boom')")==True and J("Sons.play('tema')")==True and J("Sons.play('arq')")==True)
    t('register() em tempo de execução', J("Sons.register('meu',{preset:'jump'})")==True and J("Sons.play('meu')")==True and J("Sons.register('x',5)")==False)
    # mudo
    n0 = J("window.__osc"); pg2.click('#btnMudo'); pg2.wait_for_timeout(100)
    t('botão Mudo: rótulo e estado', J("lbl.textContent")=='mudo' and J("Sons.muted")==True)
    t('no mudo nada é tocado (histórico marca muted)', J("Sons.play('coin')")==False and J("Sons.history.at(-1).muted")==True and J("window.__osc")==n0)
    t('mudo fica salvo no aparelho', J("localStorage.getItem('ff_sound_muted')")=='1')
    pg2.reload(); pg2.wait_for_timeout(400); t('depois de recarregar continua mudo', J("Sons.muted")==True)
    pg2.click('#btnMudo'); t('alternar de novo liga o som', J("Sons.muted")==False and J("lbl.textContent")=='som' and J("Sons.play('coin')")==True)
    J("Sons.volume=5"); t('volume é limitado entre 0 e 1', J("Sons.volume")==1); J("Sons.volume=-3"); t('volume mínimo 0', J("Sons.volume")==0); J("Sons.volume='abc'"); t('volume inválido vira 0 (sem NaN)', J("Sons.volume")==0)
    J("Sons.muted=true"); J("Sons.muted=false"); t('propriedade muted pode ser atribuída', J("Sons.muted")==False)
    t('stop/stopMusic não geram erro', J("(()=>{Sons.stopMusic();Sons.stop();return true})()"))
    t('music() com arquivo devolve booleano', J("typeof Sons.music('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=')")=='boolean')
    J("Sons.stopMusic()")
    # destravar áudio por gesto / AudioContext ausente
    pg3 = ctx.new_page(); pg3.add_init_script("delete window.AudioContext;delete window.webkitAudioContext"); pg3.on('pageerror', lambda e: erros.append(str(e)))
    pg3.goto(common.URL + '/tools/_out/som.html'); pg3.wait_for_timeout(400)
    t('sem suporte a Web Audio o jogo continua (sem erro)', pg3.evaluate("(()=>{try{Sons.play('coin');Sons.tone(440,50);return true}catch(e){return false}})()"))
    # autocomplete
    pg.evaluate("document.querySelector('[data-tab=code]').click()"); pg.wait_for_timeout(200)
    ms = pg.evaluate("(()=>{const m=window.FlowForgeMembers||null;return m?1:0})()")
    t('sem erros de JavaScript', not erros, erros[:3])
    b.close()
print('\nTOTAL %d / %d' % (sum(R), len(R))); sys.exit(0 if all(R) else 1)
