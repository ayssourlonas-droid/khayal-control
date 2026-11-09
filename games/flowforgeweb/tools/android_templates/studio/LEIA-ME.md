# @@APP_NAME@@ — projeto Android Studio

Pacote gerado pelo **FlowForge WebStudio** em @@GEN_DATE@@.
É um projeto Android nativo (Java) com um `WebView` que exibe o seu app (`app/src/main/assets/www/index.html`).

| Item | Valor |
|---|---|
| ID do pacote | `@@APP_ID@@` |
| Versão | @@VERSION_NAME@@ (código @@VERSION_CODE@@) |
| Orientação | @@ORIENTATION_LABEL@@ |
| Permissões | @@PERMISSIONS_LIST@@ |
| SDK | minSdk 24 (Android 7.0), compileSdk/targetSdk 36 |

## Abrir e gerar o APK no Android Studio

1. Instale o [Android Studio](https://developer.android.com/studio) e use **File → Open** nesta pasta.
2. Aguarde o *Gradle Sync* (ele baixa o Gradle 8.14.3 e as dependências sozinho).
3. Para testar: conecte o celular (depuração USB) e clique em **Run ▶**.
4. Para gerar o arquivo: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
   O APK fica em `app/build/outputs/apk/debug/`.
5. Para publicar: **Build → Generate Signed Bundle / APK…** (o Android Studio cria e guarda a chave de assinatura).

Pela linha de comando (com o Gradle instalado): `gradle assembleDebug`. Para criar o *wrapper* local use `gradle wrapper`.

## Compilar na nuvem do GitHub

Envie esta pasta para um repositório do GitHub (inclusive `.github/`) e rode **Actions → Gerar APK**.
O `.apk` de teste fica em **Artifacts**.

## O que o `MainActivity` já faz

- Serve o app em `https://appassets.androidplatform.net` (endereço seguro, necessário para câmera e localização).
- Pede as permissões de câmera, microfone e localização no momento em que o app as usa.
- Suporta o componente de envio de arquivos, o botão voltar e links externos (abrem no navegador).
- Tela cheia: @@FULLSCREEN_LABEL@@.

## Atualizar o app

Gere o pacote de novo no FlowForge e substitua `app/src/main/assets/www/index.html`
(e as pastas `mipmap-*` em `app/src/main/res/`, se mudou o ícone). Aumente o `versionCode` em `app/build.gradle`.

## Observações

- Se o projeto usa um framework CSS (Bootstrap etc.), ele é carregado por CDN e exige internet.
- O FlowForge não compila o APK; ele entrega o projeto pronto para compilar.
