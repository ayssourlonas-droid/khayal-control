"""Gera js/ff-android-templates.js a partir dos arquivos de tools/android_templates/.
O FlowForge é um site estático (sem etapa de build), então os modelos de texto do pacote Android
são embutidos em um .js. Edite os arquivos em android_templates/ e rode:  python tools/gerar_android_templates.py"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, 'android_templates')
MAP = {
    'cap/prepare-android.js': 'capacitor/scripts/prepare-android.js',
    'cap/signing.init.gradle': 'capacitor/scripts/signing.init.gradle',
    'cap/build-apk.yml': 'capacitor/github/build-apk.yml',
    'cap/gitignore': 'capacitor/gitignore',
    'cap/LEIA-ME.md': 'capacitor/LEIA-ME.md',
    'cap/package.json': 'capacitor/package.json',
    'studio/settings.gradle': 'studio/settings.gradle',
    'studio/build.gradle': 'studio/build.gradle',
    'studio/gradle.properties': 'studio/gradle.properties',
    'studio/gradle-wrapper.properties': 'studio/gradle-wrapper.properties',
    'studio/app.build.gradle': 'studio/app/build.gradle',
    'studio/proguard-rules.pro': 'studio/app/proguard-rules.pro',
    'studio/AndroidManifest.xml': 'studio/AndroidManifest.xml',
    'studio/styles.xml': 'studio/styles.xml',
    'studio/adaptive-icon.xml': 'studio/adaptive-icon.xml',
    'studio/MainActivity.java': 'studio/java/MainActivity.java',
    'studio/build-apk.yml': 'studio/github/build-apk.yml',
    'studio/gitignore': 'studio/gitignore',
    'studio/LEIA-ME.md': 'studio/LEIA-ME.md',
    'pwa/sw.js': 'pwa/sw.js',
    'pwa/LEIA-ME.md': 'pwa/LEIA-ME.md',
}
out = {k: open(os.path.join(src, v), encoding='utf-8').read() for k, v in MAP.items()}
js = ('/* GERADO por tools/gerar_android_templates.py a partir de tools/android_templates/ — não edite à mão. */\n'
      'window.FF_ANDROID_TPL=' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
dest = os.path.join(here, '..', 'js', 'ff-android-templates.js')
open(dest, 'w', encoding='utf-8').write(js)
print('ok', len(out), 'modelos,', len(js), 'bytes')
