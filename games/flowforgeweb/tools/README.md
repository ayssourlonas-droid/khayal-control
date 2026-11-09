# Ferramentas de teste e geração (Python)

Scripts opcionais para desenvolvedores do FlowForge WebStudio. O IDE em si continua 100% estático (HTML/JS); nada aqui é necessário para usá-lo.

## Requisitos

```bash
pip install playwright
playwright install chromium
```

Testado em Linux/macOS (Python 3.10+). Todos os scripts iniciam sozinhos um servidor local na raiz do projeto — não é preciso subir nada antes.

## Testes

| Script | O que faz |
|---|---|
| `python tools/run_all.py` | Roda tudo abaixo e mostra um resumo |
| `python tools/run_suites.py [nome...]` | Suítes HTML de `tests/` (idiomas, ícones, viewport, câmera, eventos, runtime de jogos/serviços…) |
| `python tools/export_examples.py` | Exporta todos os `examples/*.flowmobile` para `tools/_out/exemplos_html/` |
| `python tools/test_exemplos.py [Exemplo...]` | Cenários de uso de cada exemplo (cliques, digitação, persistência…) |
| `python tools/test_camera.py` | Exemplo Estúdio de Câmera com câmera simulada do Chromium e com permissão negada |
| `python tools/test_permissoes.py` | Garante que a câmera só é pedida quando o projeto tem componente Câmera |
| `python tools/test_depurador.py` | Depurador: console, erros, eventos, variáveis, rede, REPL, redimensionamento |

Os scripts retornam código de saída diferente de zero em caso de falha (úteis em CI). Capturas de tela e HTML gerados ficam em `tools/_out/`.

## Geração dos exemplos

`tools/gerar_exemplos/exemplo_NN.py` são os programas que geraram os arquivos de `examples/`. `lib.py` traz as funções auxiliares (`it`, `proj`, `save`). Para gerar de novo:

```bash
python tools/gerar_exemplos/exemplo_10.py   # grava examples/*.flowmobile
```

Observações: `exemplo_09.py` reutiliza funções de `exemplo_08.py`. Os arquivos em `examples/` já estão prontos; rodar os geradores só os sobrescreve.

`test_android.py` testa o menu **Exportar → Android (APK)** (empacotamento Android): diálogo, os 3 formatos, conteúdo dos .zip, permissões, ícones, `prepare-android.js` e o PWA offline. Os modelos dos pacotes ficam em `android_templates/`; `gerar_android_templates.py` os embute em `js/ff-android-templates.js`.

- `gravar_demo.py` grava em vídeo (MP4) o IDE sendo usado de verdade: cria um app do zero com cursor visível, cliques destacados e legendas em português. Uso: `python tools/gravar_demo.py [pasta_de_saída]` (requer Playwright e ffmpeg; edite o roteiro dentro do script para filmar outro app).
- `gravar_tutorial.py` grava o vídeo-tutorial completo do Jogo da Memória (capítulos, legendas, código digitado ao vivo); usa `gerar_exemplos/memoria_codigo.py`. Uso: `python tools/gravar_tutorial.py [pasta]` (`FF_RAPIDO=1` para ensaiar).
- `gerar_menu_exemplos.py` empacota os `examples/*.flowmobile` em `js/examples-pack.js` para o menu Exemplos (rode após criar/alterar um exemplo); `test_menu_exemplos.py` confere o menu.
