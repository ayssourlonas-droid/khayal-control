# @@APP_NAME@@ — projeto Android (Capacitor)

Pacote gerado pelo **FlowForge WebStudio** em @@GEN_DATE@@.
O app (`www/index.html`) é empacotado com o [Capacitor](https://capacitorjs.com) e vira um APK Android.

| Item | Valor |
|---|---|
| ID do pacote | `@@APP_ID@@` |
| Versão | @@VERSION_NAME@@ (código @@VERSION_CODE@@) |
| Orientação | @@ORIENTATION_LABEL@@ |
| Permissões | @@PERMISSIONS_LIST@@ |

## Opção 1 — compilar na nuvem do GitHub (sem instalar nada)

1. Crie um repositório no GitHub e envie **todo o conteúdo desta pasta** (inclusive `.github/`).
2. Abra a aba **Actions** → **Gerar APK** → **Run workflow** (também roda a cada `push`).
3. Quando terminar (3–6 minutos), baixe o arquivo em **Artifacts → app-debug-apk**. Dentro está o `.apk`.
4. Copie o `.apk` para o celular e abra para instalar (permita "instalar apps desconhecidos" quando o Android pedir).

O APK "debug" serve para testar e compartilhar. Para publicar na Google Play, veja **Assinatura** abaixo.

## Opção 2 — compilar no seu computador

Requisitos: **Node.js 22+**, **JDK 21** e o **Android SDK** (o jeito mais fácil é instalar o Android Studio).

```bash
npm install
npm run android:apk
```

O APK fica em `android/app/build/outputs/apk/debug/app-debug.apk`.
Para abrir no Android Studio: `npm run android:open`.

## Assinatura (publicar na Google Play)

1. Crie uma chave (guarde o arquivo e as senhas em local seguro; sem ela você não consegue atualizar o app):
   `keytool -genkeypair -v -keystore release.keystore -alias meuapp -keyalg RSA -keysize 2048 -validity 10000`
2. No GitHub: **Settings → Secrets and variables → Actions** e crie os segredos
   `KEYSTORE_BASE64` (saída de `base64 -w0 release.keystore`), `KEYSTORE_PASSWORD`, `KEY_ALIAS` e `KEY_PASSWORD`.
3. Rode o workflow de novo: além do APK de teste ele gera **app-release** com o `.apk` e o `.aab` assinados.
   A Play Store pede o arquivo `.aab`.

## Atualizar o app

Altere o projeto no FlowForge, gere o pacote de novo e substitua `www/index.html` (e `resources/`, se mudou o ícone).
Aumente o código de versão a cada publicação.

## Observações

- Câmera, microfone e localização pedem permissão ao usuário na primeira vez, como no navegador.
- Se o projeto usa um framework CSS (Bootstrap etc.), ele é carregado por CDN e exige internet.
- Esta estrutura não foi compilada pelo FlowForge: o build acontece no GitHub Actions ou na sua máquina.
