#!/usr/bin/env node
/* Prepara o projeto Android gerado pelo Capacitor ("npx cap add android") com as
   configurações do FlowForge: ícones, permissões, orientação, versão e cores.
   Pode ser executado várias vezes sem problemas. Não usa dependências externas. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'android', 'config.json'), 'utf8'));
const app = path.join(root, 'android', 'app');
const main = path.join(app, 'src', 'main');
if (!fs.existsSync(main)) {
  console.error('Pasta android/ não encontrada. Rode antes: npx cap add android');
  process.exit(1);
}

const read = (f) => fs.readFileSync(f, 'utf8');
const write = (f, s) => fs.writeFileSync(f, s);
const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function copyDir(from, to) {
  if (!fs.existsSync(from)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) { fs.mkdirSync(b, { recursive: true }); n += copyDir(a, b); }
    else { fs.mkdirSync(path.dirname(b), { recursive: true }); fs.copyFileSync(a, b); n++; }
  }
  return n;
}

// 1) Ícones (mipmap-*) e cores do ícone adaptativo
const icons = copyDir(path.join(root, 'resources', 'android', 'res'), path.join(main, 'res'));
console.log('• ícones e recursos copiados:', icons);

// 2) Tela de abertura: cor sólida em vez da imagem padrão do Capacitor
const stylesFile = path.join(main, 'res', 'values', 'styles.xml');
if (fs.existsSync(stylesFile)) {
  let s = read(stylesFile);
  s = s.replace(/@drawable\/splash/g, '@color/ff_splash_color');
  if (!/ff_status_color/.test(s)) {
    s = s.replace(/(<style name="AppTheme\.NoActionBar"[^>]*>)/, '$1\n        <item name="android:statusBarColor">@color/ff_status_color</item>');
  }
  write(stylesFile, s);
}

// 3) Versão do app
const gradleFile = path.join(app, 'build.gradle');
let g = read(gradleFile);
g = g.replace(/versionCode\s+\d+/, 'versionCode ' + cfg.versionCode).replace(/versionName\s+"[^"]*"/, 'versionName "' + cfg.versionName + '"');
write(gradleFile, g);
console.log('• versão:', cfg.versionName, '(código ' + cfg.versionCode + ')');

// 4) Manifest: permissões, recursos opcionais e orientação
const manifestFile = path.join(main, 'AndroidManifest.xml');
let m = read(manifestFile);
for (const p of cfg.permissions) {
  if (!m.includes('android:name="' + p + '"')) m = m.replace('</manifest>', '    <uses-permission android:name="' + p + '" />\n</manifest>');
}
for (const f of cfg.features || []) {
  if (!m.includes('android:name="' + f + '"')) m = m.replace('</manifest>', '    <uses-feature android:name="' + f + '" android:required="false" />\n</manifest>');
}
m = m.replace(/\s+android:screenOrientation="[^"]*"/, '');
if (cfg.orientation && cfg.orientation !== 'unspecified') {
  m = m.replace(/(android:name="\.MainActivity")/, '$1\n            android:screenOrientation="' + cfg.orientation + '"');
}
write(manifestFile, m);
console.log('• permissões:', cfg.permissions.join(', '));

// 5) Cores (barra de status e abertura)
fs.mkdirSync(path.join(main, 'res', 'values'), { recursive: true });
write(path.join(main, 'res', 'values', 'ff_colors.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ff_splash_color">' + cfg.themeColor + '</color>\n    <color name="ff_status_color">' + cfg.themeColor + '</color>\n</resources>\n');

// 6) Nome do app (garantia; o Capacitor já usa o appName)
const stringsFile = path.join(main, 'res', 'values', 'strings.xml');
if (fs.existsSync(stringsFile)) {
  let s = read(stringsFile);
  s = s.replace(/(<string name="app_name">)[^<]*(<\/string>)/, '$1' + xmlEsc(cfg.appName) + '$2').replace(/(<string name="title_activity_main">)[^<]*(<\/string>)/, '$1' + xmlEsc(cfg.appName) + '$2');
  write(stringsFile, s);
}
console.log('Projeto Android preparado. Próximo passo: npx cap sync android');
