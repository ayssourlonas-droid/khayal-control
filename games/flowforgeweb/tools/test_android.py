"""Testa "Empacotar para Android": diálogo, os 3 formatos (Capacitor, PWA, Android Studio), conteúdo dos .zip,
permissões deduzidas do projeto, ícones, script prepare-android.js e o PWA funcionando offline.
Uso: python tools/test_android.py"""
import base64, functools, http.server, io, json, os, re, shutil, socketserver, struct, subprocess, tempfile, threading, zipfile
import xml.dom.minidom as X
import common
from playwright.sync_api import sync_playwright

R = []
def t(l, ok, d=''):
    R.append(bool(ok)); print(('✓' if ok else '✗'), l, '' if ok else f'→ {str(d)[:200]}')

def png_size(b):
    return struct.unpack('>II', b[16:24]) if b[:8] == b'\x89PNG\r\n\x1a\n' else None

def load(pg, name):
    pg.evaluate("FlowForgeI18n.setLanguage('pt-BR')")
    pg.set_input_files('#fileInput', f'{common.ROOT}/examples/{name}.flowmobile'); pg.wait_for_timeout(700)
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")

def apk(pg):
    """abre o menu Exportar e escolhe Android (APK)"""
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    pg.click('#exportMenuBtn'); pg.click('#androidBtn')

def pack(pg, fmt, **o):
    """gera o pacote pelo diálogo e devolve (nome, bytes)"""
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    apk(pg); pg.wait_for_timeout(150)
    pg.check(f'input[name=andFormat][value={fmt}]')
    for k, v in o.items():
        el = {'name': '#andName', 'appId': '#andId', 'ver': '#andVer', 'code': '#andCode'}.get(k)
        if el: pg.fill(el, str(v))
    if 'ori' in o: pg.select_option('#andOri', o['ori'])
    if 'full' in o: pg.set_checked('#andFull', o['full'])
    with pg.expect_download() as d: pg.click('#andGo')
    dl = d.value; p = dl.path()
    return dl.suggested_filename, open(p, 'rb').read()

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1400, 'height': 950}, accept_downloads=True); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda d: d.accept())
    pg.goto(common.URL + '/index.html'); pg.wait_for_timeout(500)
    load(pg, 'Estudio_de_Camera')

    # ---- funções puras ----
    FA = lambda js: pg.evaluate(js)
    t('ID padrão sem acentos e com prefixo', FA("FlowForgeAndroid.defaultAppId('Calculadora Científica')") == 'com.flowforge.calculadoracientifica')
    t('ID padrão corrige nome que começa com número', FA("FlowForgeAndroid.defaultAppId('123 Jogo')") == 'com.flowforge.app123jogo')
    t('ID padrão evita palavra reservada do Java', FA("FlowForgeAndroid.defaultAppId('New')") == 'com.flowforge.newapp')
    t('validação do ID do pacote', FA("['com.a.b','br.com.meu_app','Com.A.b','com.a','com.new.b','a','com.1a.b','com..a'].map(FlowForgeAndroid.validAppId)") == [True, True, False, True, False, False, False, False])
    t('código de versão a partir da versão (2.3.4 → 20304)', FA("FlowForgeAndroid.versionCodeOf('2.3.4')") == 20304 and FA("FlowForgeAndroid.versionCodeOf('1')") == 10000)

    # ---- zip: CRC e estrutura válidos (lido por outro leitor) ----
    nome, dados = pack(pg, 'studio')
    zf = zipfile.ZipFile(io.BytesIO(dados))
    t('o .zip gerado no navegador é válido (CRC conferido pelo Python)', zf.testzip() is None and len(zf.namelist()) > 20, zf.testzip())
    t('nome do arquivo baixado', nome == 'estudio-de-camera-android-studio.zip', nome)
    t('caracteres acentuados em nomes de arquivo e conteúdo (UTF-8)', 'Estúdio de Câmera' in zf.read('app/src/main/res/values/strings.xml').decode('utf-8'))

    # ---- diálogo ----
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    t('menu "Exportar" na barra superior (substitui o botão Exportar HTML)', pg.inner_text('#exportMenuBtn').strip().startswith('Exportar') and pg.locator('#exportBtn').count() == 1 and pg.locator('#androidBtn').count() == 1)
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    t('menu começa fechado', pg.is_hidden('#exportMenuList') and pg.get_attribute('#exportMenuBtn', 'aria-expanded') == 'false')
    pg.click('#exportMenuBtn'); itens = pg.eval_on_selector_all('#exportMenuList button:not([hidden])', 'els=>els.map(e=>e.textContent.trim())')
    t('projeto App mobile: o menu tem Exportar HTML e Android (APK)', itens == ['Exportar HTML', 'Android (APK)'] and pg.get_attribute('#exportMenuBtn', 'aria-expanded') == 'true', itens)
    pg.keyboard.press('Escape'); t('Escape fecha o menu', pg.is_hidden('#exportMenuList'))
    pg.click('#exportMenuBtn'); pg.click('#flowTitle' if False else 'header > b'); t('clicar fora fecha o menu', pg.is_hidden('#exportMenuList'))
    pg.click('#exportMenuBtn'); pg.click('#exportBtn'); pg.wait_for_timeout(200)
    t('item "Exportar HTML" abre o diálogo de exportação e fecha o menu', pg.locator('#exportHtmlDlg[open]').count() == 1 and pg.is_hidden('#exportMenuList'))
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    # tipo do projeto: o APK só existe para App mobile
    for tipo in ('site', 'landing'):
        pg.evaluate("t=>{project.type=t}", tipo); pg.wait_for_timeout(900)
        t(f'projeto {tipo}: sem opção de APK; o botão Exportar abre direto o HTML', pg.is_hidden('#androidBtn') and pg.evaluate("document.getElementById('exportMenu').classList.contains('single')"))
        pg.click('#exportMenuBtn'); pg.wait_for_timeout(200)
        t(f'projeto {tipo}: clique em Exportar abre o diálogo de HTML (sem dropdown)', pg.locator('#exportHtmlDlg[open]').count() == 1 and pg.is_hidden('#exportMenuList') and pg.locator('#androidDlg[open]').count() == 0)
        pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    pg.evaluate("project.type='app'"); pg.wait_for_timeout(900)
    t('voltando para App mobile o item de APK reaparece', not pg.is_hidden('#exportMenuBtn') and pg.evaluate("!document.getElementById('androidBtn').hidden"))
    pg.select_option('#projectType', 'landing'); pg.wait_for_timeout(300)
    t('trocar o tipo pelo painel Projeto esconde o APK na hora', pg.evaluate("document.getElementById('androidBtn').hidden"))
    pg.select_option('#projectType', 'app'); pg.wait_for_timeout(300)
    t('e mostrar de novo ao voltar para App', pg.evaluate("!document.getElementById('androidBtn').hidden"))
    apk(pg); pg.wait_for_timeout(150)
    t('diálogo abre com os 3 formatos', pg.locator('input[name=andFormat]').count() == 3 and pg.locator('#androidDlg[open]').count() == 1)
    t('campos preenchidos com os dados do projeto', pg.input_value('#andName') == 'Estúdio de Câmera' and pg.input_value('#andId') == 'com.flowforge.estudiodecamera' and pg.input_value('#andVer') == '1.0.0' and pg.input_value('#andCode') == '10000',
      (pg.input_value('#andName'), pg.input_value('#andId')))
    t('lista as permissões detectadas (câmera)', 'CAMERA' in pg.inner_text('#andInfo') and 'INTERNET' in pg.inner_text('#andInfo'), pg.inner_text('#andInfo'))
    pg.fill('#andId', 'Com.Invalido'); t('ID inválido desabilita "Gerar pacote"', pg.is_disabled('#andGo'))
    pg.fill('#andId', 'com.flowforge.new'); t('palavra reservada desabilita "Gerar pacote"', pg.is_disabled('#andGo'))
    pg.fill('#andId', 'br.com.meuapp'); t('ID válido reabilita', not pg.is_disabled('#andGo'))
    pg.fill('#andName', 'Meu Super App'); t('ID digitado à mão não é sobrescrito ao mudar o nome', pg.input_value('#andId') == 'br.com.meuapp')
    pg.fill('#andVer', '2.5.1'); t('código da versão acompanha a versão (2.5.1 → 20501)', pg.input_value('#andCode') == '20501', pg.input_value('#andCode'))
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")

    # ---- Android Studio ----
    nome, dados = pack(pg, 'studio', name='Meu Super App', appId='br.com.meuapp', ver='2.5.1', ori='portrait', full=True)
    saved_android = pg.evaluate("project.android")
    zf = zipfile.ZipFile(io.BytesIO(dados)); N = zf.namelist(); rd = lambda n: zf.read(n).decode('utf-8')
    bad = []
    for n in N:
        if n.endswith('.xml'):
            try: X.parseString(zf.read(n))
            except Exception as e: bad.append(n)
        if n.endswith('.png') and not png_size(zf.read(n)): bad.append(n)
    t('Studio: todos os XML e PNG são válidos', not bad, bad)
    t('Studio: arquivos essenciais', all(x in N for x in ['settings.gradle', 'build.gradle', 'gradle.properties', 'gradle/wrapper/gradle-wrapper.properties', 'app/build.gradle', 'app/src/main/AndroidManifest.xml', 'app/src/main/java/br/com/meuapp/MainActivity.java', 'app/src/main/assets/www/index.html', '.github/workflows/build-apk.yml', 'LEIA-ME.md']))
    t('Studio: MainActivity no pacote certo e tela cheia ativada', rd('app/src/main/java/br/com/meuapp/MainActivity.java').startswith('package br.com.meuapp;') and 'FULLSCREEN = true' in rd('app/src/main/java/br/com/meuapp/MainActivity.java'))
    t('Studio: namespace, applicationId, versão', "namespace 'br.com.meuapp'" in rd('app/build.gradle') and "applicationId 'br.com.meuapp'" in rd('app/build.gradle') and 'versionCode 20501' in rd('app/build.gradle') and "versionName '2.5.1'" in rd('app/build.gradle'))
    man = rd('app/src/main/AndroidManifest.xml')
    t('Studio: orientação retrato no manifest', 'android:screenOrientation="portrait"' in man)
    t('Studio: permissões = internet + câmera (projeto tem câmera)', 'permission.CAMERA' in man and 'permission.INTERNET' in man and 'RECORD_AUDIO' not in man and 'ACCESS_FINE_LOCATION' not in man)
    t('Studio: o app do projeto está em assets/www/index.html', 'id="btnStart"' in rd('app/src/main/assets/www/index.html') and rd('app/src/main/assets/www/index.html').lstrip().lower().startswith('<!doctype html'))
    t('Studio: ícones nas 5 densidades + adaptativo', all(f'app/src/main/res/mipmap-{d}/ic_launcher{s}.png' in N for d in ('mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi') for s in ('', '_round', '_foreground')) and 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml' in N)
    t('Studio: tamanhos dos ícones (48/192 legado; 108/432 primeiro plano)', png_size(zf.read('app/src/main/res/mipmap-mdpi/ic_launcher.png')) == (48, 48) and png_size(zf.read('app/src/main/res/mipmap-xxxhdpi/ic_launcher.png')) == (192, 192) and png_size(zf.read('app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png')) == (108, 108) and png_size(zf.read('app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png')) == (432, 432))
    t('Studio: ícone da loja 512', png_size(zf.read('store/icon-512.png')) == (512, 512))
    wf = rd('.github/workflows/build-apk.yml')
    try:
        import yaml; y = yaml.safe_load(wf); ok = 'jobs' in y and any('gradle' in str(s) for s in y['jobs']['apk']['steps'])
    except Exception as e: ok = False
    t('Studio: workflow do GitHub Actions é um YAML válido', ok)
    # sintaxe do Java (ignora erros de símbolos do Android, que não existem sem o SDK)
    if shutil.which('javac'):
        d = tempfile.mkdtemp(); jp = d + '/MainActivity.java'; open(jp, 'w', encoding='utf-8').write(rd('app/src/main/java/br/com/meuapp/MainActivity.java'))
        r = subprocess.run(['javac', '-proc:none', '-d', d, jp], capture_output=True, text=True)
        syn = [l for l in r.stderr.splitlines() if 'error:' in l and not re.search(r'does not exist|cannot find symbol|cannot be applied|does not override|cannot access|incompatible types|lambda|cannot infer|not abstract', l)]
        t('Studio: MainActivity.java sem erros de sintaxe', not syn, syn[:3]); shutil.rmtree(d, ignore_errors=True)

    # ---- permissões por componente ----
    base = "FlowForgeAndroid.build('studio',{})"
    perms = lambda js: pg.evaluate("(async()=>{const r=await FlowForgeAndroid.build('studio',{});return r.config.perms.map(p=>p.replace('android.permission.',''))})()") if js is None else pg.evaluate(js)
    t('permissões: só câmera sem áudio', perms(None) == ['INTERNET', 'ACCESS_NETWORK_STATE', 'CAMERA'], perms(None))
    pg.evaluate("project.pages[0].items.filter(x=>x.kind==='camera').forEach(x=>x.audio=true)")
    t('permissões: câmera com áudio pede microfone', 'RECORD_AUDIO' in perms(None))
    pg.evaluate("project.pages[0].items.push({id:'g1',kind:'geolocation',name:'geo1',text:'',x:0,y:0,width:'10px',height:'10px',events:{}})")
    t('permissões: componente de localização', 'ACCESS_FINE_LOCATION' in perms(None) and 'ACCESS_COARSE_LOCATION' in perms(None))
    load(pg, 'Cronometro_Voltas')
    t('permissões: projeto sem câmera/localização só pede internet', perms(None) == ['INTERNET', 'ACCESS_NETWORK_STATE'], perms(None))

    # ---- persistência das opções no projeto ----
    saved = saved_android
    t('opções do último pacote ficam salvas no projeto', saved and saved.get('format') == 'studio' and saved.get('appId') == 'br.com.meuapp' and saved.get('fullscreen') is True, saved)
    pg.evaluate("project.android={format:'pwa',appId:'org.teste.app',versionCode:77,orientation:'landscape',fullscreen:true}")
    apk(pg); pg.wait_for_timeout(100)
    t('diálogo reabre com as opções salvas', pg.input_value('#andId') == 'org.teste.app' and pg.input_value('#andCode') == '77' and pg.input_value('#andOri') == 'landscape' and pg.is_checked('input[name=andFormat][value=pwa]') and pg.is_checked('#andFull'))
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close()); delete project.android")

    # ---- Capacitor ----
    load(pg, 'Estudio_de_Camera')
    nome, dados = pack(pg, 'capacitor', ori='landscape')
    zf = zipfile.ZipFile(io.BytesIO(dados)); N = zf.namelist(); rd = lambda n: zf.read(n).decode('utf-8')
    t('Capacitor: arquivos essenciais', all(x in N for x in ['package.json', 'capacitor.config.json', 'www/index.html', 'scripts/prepare-android.js', 'scripts/signing.init.gradle', 'resources/android/config.json', '.github/workflows/build-apk.yml', 'LEIA-ME.md', '.gitignore']))
    cfgc = json.loads(rd('capacitor.config.json')); pk = json.loads(rd('package.json')); pc = json.loads(rd('resources/android/config.json'))
    t('Capacitor: configuração (appId, nome, pasta web, esquema https)', cfgc['appId'] == 'com.flowforge.estudiodecamera' and cfgc['appName'] == 'Estúdio de Câmera' and cfgc['webDir'] == 'www' and cfgc['server']['androidScheme'] == 'https', cfgc)
    t('Capacitor: package.json com @capacitor/* e scripts', all(k in pk['dependencies'] for k in ('@capacitor/core', '@capacitor/android')) and '@capacitor/cli' in pk['devDependencies'] and 'android:apk' in pk['scripts'], pk)
    t('Capacitor: config do prepare (orientação, permissões, versão)', pc['orientation'] == 'landscape' and 'android.permission.CAMERA' in pc['permissions'] and pc['versionCode'] == 10000 and pc['features'][0] == 'android.hardware.camera', pc)
    try:
        import yaml; y = yaml.safe_load(rd('.github/workflows/build-apk.yml')); steps = y['jobs']['apk']['steps']; names = ' | '.join(str(s.get('run', s.get('uses', ''))) for s in steps)
        ok = 'cap add android' in names and 'prepare-android.js' in names and 'assembleDebug' in names and 'cap sync android' in names
        sec = all("secrets" not in str(s.get('if', '')) for s in steps)
    except Exception as e: ok = sec = False
    t('Capacitor: workflow válido (cap add → prepare → sync → gradle) e sem "secrets" em condições', ok and sec)
    if shutil.which('node'):
        d = tempfile.mkdtemp()
        for n in N:
            if not n.endswith('/'):
                os.makedirs(os.path.dirname(os.path.join(d, n)) or d, exist_ok=True); open(os.path.join(d, n), 'wb').write(zf.read(n))
        a = d + '/android/app/src/main'; os.makedirs(a + '/res/values', exist_ok=True); os.makedirs(a + '/java/com/x', exist_ok=True)
        open(a + '/AndroidManifest.xml', 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <application>\n        <activity\n            android:name=".MainActivity"\n            android:exported="true">\n        </activity>\n    </application>\n    <uses-permission android:name="android.permission.INTERNET" />\n</manifest>\n')
        open(a + '/res/values/styles.xml', 'w').write('<resources>\n    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">\n        <item name="windowNoTitle">true</item>\n    </style>\n    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">\n        <item name="android:background">@drawable/splash</item>\n    </style>\n</resources>\n')
        open(a + '/res/values/strings.xml', 'w').write('<resources>\n    <string name="app_name">x</string>\n    <string name="title_activity_main">x</string>\n</resources>\n')
        open(d + '/android/app/build.gradle', 'w').write('android {\n    defaultConfig {\n        versionCode 1\n        versionName "1.0"\n    }\n}\n')
        r1 = subprocess.run(['node', 'scripts/prepare-android.js'], cwd=d, capture_output=True, text=True)
        r2 = subprocess.run(['node', 'scripts/prepare-android.js'], cwd=d, capture_output=True, text=True)  # 2ª vez: idempotente
        mf = open(a + '/AndroidManifest.xml', encoding='utf-8').read(); st = open(a + '/res/values/styles.xml', encoding='utf-8').read()
        t('prepare-android.js roda (e roda de novo sem duplicar)', r1.returncode == 0 and r2.returncode == 0, (r1.stderr, r2.stderr))
        try: X.parseString(mf.encode()); okx = True
        except Exception: okx = False
        t('prepare: manifest válido com câmera, recurso opcional e orientação paisagem', okx and mf.count('permission.CAMERA') == 1 and mf.count('permission.INTERNET') == 1 and 'android.hardware.camera" android:required="false"' in mf and mf.count('android:screenOrientation="landscape"') == 1, mf[-400:])
        t('prepare: versão, nome, cores e abertura em cor sólida', 'versionCode 10000' in open(d + '/android/app/build.gradle').read() and 'Estúdio de Câmera' in open(a + '/res/values/strings.xml', encoding='utf-8').read() and '@color/ff_splash_color' in st and st.count('statusBarColor') == 1 and os.path.exists(a + '/res/values/ff_colors.xml'))
        t('prepare: ícones copiados para mipmap-*', os.path.exists(a + '/res/mipmap-xxxhdpi/ic_launcher.png') and os.path.exists(a + '/res/mipmap-anydpi-v26/ic_launcher.xml'))
        shutil.rmtree(d, ignore_errors=True)

    # ---- PWA ----
    nome, dados = pack(pg, 'pwa', full=False)
    zf = zipfile.ZipFile(io.BytesIO(dados)); N = zf.namelist(); rd = lambda n: zf.read(n).decode('utf-8')
    mani = json.loads(rd('manifest.webmanifest'))
    t('PWA: arquivos essenciais', all(x in N for x in ['index.html', 'manifest.webmanifest', 'sw.js', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'LEIA-ME.md']), N)
    t('PWA: manifest (nome, escopo, standalone, cor, ícones existentes)', mani['name'] == 'Estúdio de Câmera' and mani['display'] == 'standalone' and mani['start_url'] == './index.html' and mani['theme_color'] == '#20242a' and all(i['src'] in N for i in mani['icons']) and any(i['purpose'] == 'maskable' for i in mani['icons']), mani)
    t('PWA: tamanhos dos ícones (192, 512, maskable 512, Apple 180)', png_size(zf.read('icons/icon-192.png')) == (192, 192) and png_size(zf.read('icons/icon-512.png')) == (512, 512) and png_size(zf.read('icons/maskable-512.png')) == (512, 512) and png_size(zf.read('icons/apple-touch-icon.png')) == (180, 180))
    h = rd('index.html')
    t('PWA: index.html liga o manifest e registra o service worker', '<link rel="manifest" href="manifest.webmanifest">' in h and "serviceWorker.register('sw.js')" in h and h.count('rel="apple-touch-icon"') == 1)
    d = tempfile.mkdtemp(); zf.extractall(d)
    handler = functools.partial(type('Q', (http.server.SimpleHTTPRequestHandler,), {'log_message': lambda *a: None}), directory=d)
    socketserver.TCPServer.allow_reuse_address = True; srv = socketserver.TCPServer(('127.0.0.1', 0), handler); threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f'http://localhost:{srv.server_address[1]}/'
    pw = ctx.new_page(); pw.on('pageerror', lambda e: errs.append('PWA: ' + str(e)))
    pw.goto(url + 'index.html'); pw.wait_for_function("navigator.serviceWorker && navigator.serviceWorker.ready.then(()=>true)", timeout=8000); pw.wait_for_timeout(800)
    t('PWA: service worker ativa', pw.evaluate("navigator.serviceWorker.ready.then(r=>!!r.active)"))
    t('PWA: manifest carrega pelo navegador', pw.evaluate("fetch(document.querySelector('link[rel=manifest]').href).then(r=>r.json()).then(j=>j.name)") == 'Estúdio de Câmera')
    ctx.set_offline(True); pw.reload(); pw.wait_for_timeout(600)
    t('PWA: abre offline depois da primeira visita', pw.evaluate("!!document.getElementById('btnStart')") and 'Câmera' in pw.title(), pw.title())
    ctx.set_offline(False); pw.close(); srv.shutdown(); shutil.rmtree(d, ignore_errors=True)

    # ---- ícone do projeto ----
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    padrao = zipfile.ZipFile(io.BytesIO(pack(pg, 'studio')[1])).read('app/src/main/res/mipmap-xxxhdpi/ic_launcher.png')
    foto = base64.b64encode(open(f'{common.TOOLS}/test_photo.png', 'rb').read()).decode()
    pg.evaluate("p=>{project.icon=p}", 'data:image/png;base64,' + foto)
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    apk(pg); pg.wait_for_timeout(100); t('diálogo informa o ícone do projeto', 'ícone do projeto' in pg.inner_text('#andInfo'), pg.inner_text('#andInfo')); pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close())")
    custom = zipfile.ZipFile(io.BytesIO(pack(pg, 'studio')[1])).read('app/src/main/res/mipmap-xxxhdpi/ic_launcher.png')
    t('ícone do projeto vira ic_launcher (≠ ícone automático) e mantém 192×192', custom != padrao and png_size(custom) == (192, 192))
    pg.evaluate("project.icon=''")

    # ---- idiomas ----
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close());FlowForgeI18n.setLanguage('en')"); apk(pg); pg.wait_for_timeout(250)
    tx = pg.inner_text('#androidDlg')
    t('diálogo traduzido para inglês', 'Package for Android' in tx and 'Package ID' in tx and 'Create package (.zip)' in tx and 'Permissions' in tx and 'Version code' in tx and 'Orientation' in tx, tx)
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close());FlowForgeI18n.setLanguage('es')"); apk(pg); pg.wait_for_timeout(250)
    tx = pg.inner_text('#androidDlg'); t('diálogo traduzido para espanhol', 'Empaquetar para Android' in tx and 'ID del paquete' in tx and 'Generar paquete (.zip)' in tx, tx[:150])
    pg.evaluate("document.querySelectorAll('dialog[open]').forEach(d=>d.close());FlowForgeI18n.setLanguage('pt-BR')")
    t('sem erros de JavaScript', not errs, errs)
    b.close()
print(f"\nTOTAL {sum(R)} / {len(R)}")
raise SystemExit(0 if all(R) else 1)
