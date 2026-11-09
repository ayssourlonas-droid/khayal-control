# @@APP_NAME@@ — PWA (aplicativo web instalável)

Pacote gerado pelo **FlowForge WebStudio** em @@GEN_DATE@@.

Conteúdo: `index.html` (o app), `manifest.webmanifest`, `sw.js` (funciona offline), `icons/` (192, 512, maskable e Apple).

## 1. Publicar (HTTPS é obrigatório)

Envie **todos os arquivos** para uma hospedagem com HTTPS, por exemplo GitHub Pages, Netlify, Cloudflare Pages ou Vercel.
(Para testar localmente: `npx serve .` e abra `http://localhost:3000`; `localhost` conta como seguro.)

Ao abrir o site no Chrome do Android aparece a opção **Instalar app / Adicionar à tela inicial**.

## 2. Gerar o APK / AAB com o PWABuilder (gratuito)

1. Abra [pwabuilder.com](https://www.pwabuilder.com) e informe o endereço onde publicou o app.
2. Confira a pontuação (manifesto, service worker e ícones já estão incluídos).
3. Clique em **Package for stores → Android** e informe o ID do pacote (sugestão: `@@APP_ID@@`).
4. Baixe o pacote: ele traz o `.apk` para testar e o `.aab` para a Google Play, mais a chave de assinatura (guarde-a bem).

O resultado é um app Android que abre o seu site em tela cheia (*Trusted Web Activity*). Para remover a barra de endereço,
publique o arquivo `assetlinks.json` que o PWABuilder fornece em `https://seu-site/.well-known/assetlinks.json`.

## Atualizar

Gere o pacote de novo no FlowForge e republique os arquivos. O `sw.js` usa um número de versão
(@@VERSION_NAME@@): ao mudar a versão do projeto, os aparelhos recebem a atualização.

## Observações

- Câmera, microfone e localização dependem de HTTPS e da permissão do usuário.
- Se o projeto usa um framework CSS (Bootstrap etc.), ele vem por CDN; o `sw.js` guarda uma cópia para uso offline depois do primeiro acesso.
