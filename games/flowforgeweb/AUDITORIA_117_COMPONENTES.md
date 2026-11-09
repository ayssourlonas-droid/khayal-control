# Auditoria dos 117 tipos — FlowForge Web

Base: auditoria 03 (mapa por endereço).

## Correções efetuadas
- Removidas três declarações duplicadas de `iframe`, `canvas` e `map` no catálogo `META`.
- Registrados no editor de ações eventos específicos para RichTextEditor, DateRangePicker, ColorPalette, DataTableFilter, PasswordStrength, TextCounter, DetailsBox e MediaGallery.

## Cobertura da inspeção estática
- Tipos únicos inventariados: **117**.
- Tipos com ramificação `case` explícita em `app.js`: **110** (outros podem ser tratados por módulos).
- Tipos com IntelliSense específico identificado: **42** (os demais podem usar sugestões genéricas).
- Tipos com eventos específicos declarados: **54** (os demais usam eventos padrão).

## Limitação de testes
Os testes HTML existentes foram localizados, mas o Chromium bloqueou a navegação ao servidor local com `ERR_BLOCKED_BY_ADMINISTRATOR`. Nenhum teste de interface ou exportação foi declarado aprovado.

## Matriz por componente
| Tipo | Renderização explícita em app.js | IntelliSense específico | Eventos específicos |
|---|---|---|---|
| gamesound | Não identificado | Sim | Não identificado |
| header | Sim | Não identificado | Não identificado |
| pagenav | Sim | Não identificado | Não identificado |
| combobox | Sim | Não identificado | Não identificado |
| listbox | Sim | Não identificado | Não identificado |
| label | Sim | Sim | Não identificado |
| heading | Sim | Sim | Não identificado |
| button | Sim | Sim | Sim |
| link | Sim | Sim | Sim |
| image | Sim | Sim | Sim |
| picturebox | Sim | Sim | Sim |
| icon | Sim | Não identificado | Não identificado |
| divider | Sim | Não identificado | Não identificado |
| spacer | Não identificado | Não identificado | Não identificado |
| input | Sim | Não identificado | Sim |
| textarea | Sim | Sim | Sim |
| checkbox | Sim | Sim | Sim |
| radio | Sim | Sim | Sim |
| switch | Sim | Sim | Sim |
| select | Sim | Sim | Sim |
| range | Sim | Não identificado | Sim |
| date | Sim | Sim | Não identificado |
| time | Sim | Sim | Não identificado |
| file | Sim | Não identificado | Sim |
| form | Sim | Sim | Sim |
| container | Não identificado | Não identificado | Não identificado |
| section | Não identificado | Não identificado | Não identificado |
| card | Não identificado | Não identificado | Não identificado |
| row | Não identificado | Não identificado | Não identificado |
| columns | Não identificado | Não identificado | Não identificado |
| hero | Sim | Não identificado | Não identificado |
| navbar | Sim | Não identificado | Não identificado |
| bottomnav | Sim | Não identificado | Não identificado |
| tabs | Sim | Não identificado | Não identificado |
| tabcontrol | Sim | Não identificado | Sim |
| drawer | Sim | Não identificado | Sim |
| bottomsheet | Sim | Não identificado | Sim |
| sidebar | Sim | Não identificado | Não identificado |
| toolbar | Sim | Não identificado | Não identificado |
| footer | Sim | Não identificado | Não identificado |
| breadcrumb | Sim | Não identificado | Não identificado |
| pagination | Sim | Não identificado | Não identificado |
| fab | Sim | Não identificado | Não identificado |
| list | Sim | Não identificado | Não identificado |
| table | Sim | Não identificado | Não identificado |
| datagrid | Sim | Não identificado | Não identificado |
| chart | Sim | Sim | Não identificado |
| calendar | Sim | Não identificado | Sim |
| listview | Sim | Sim | Não identificado |
| treeview | Sim | Não identificado | Não identificado |
| statcard | Sim | Não identificado | Não identificado |
| rating | Sim | Não identificado | Sim |
| timeline | Sim | Não identificado | Não identificado |
| stepper | Sim | Não identificado | Não identificado |
| badge | Sim | Não identificado | Não identificado |
| progress | Sim | Sim | Sim |
| spinner | Sim | Não identificado | Não identificado |
| accordion | Sim | Não identificado | Não identificado |
| alert | Sim | Não identificado | Não identificado |
| modalbox | Sim | Não identificado | Não identificado |
| video | Sim | Sim | Sim |
| audio | Sim | Sim | Sim |
| camera | Sim | Não identificado | Sim |
| fileupload | Sim | Não identificado | Sim |
| colorpicker | Sim | Não identificado | Não identificado |
| avatar | Sim | Não identificado | Não identificado |
| modal | Sim | Não identificado | Não identificado |
| toast | Sim | Não identificado | Não identificado |
| tooltip | Sim | Não identificado | Não identificado |
| carousel | Sim | Não identificado | Não identificado |
| timer | Sim | Não identificado | Sim |
| http | Sim | Não identificado | Sim |
| websocket | Sim | Não identificado | Sim |
| storage | Sim | Não identificado | Sim |
| geolocation | Sim | Não identificado | Sim |
| notification | Sim | Não identificado | Sim |
| clipboard | Sim | Não identificado | Sim |
| network | Sim | Não identificado | Sim |
| vibration | Sim | Não identificado | Sim |
| iframe | Sim | Sim | Sim |
| canvas | Sim | Sim | Não identificado |
| map | Sim | Não identificado | Não identificado |
| qrcode | Sim | Sim | Não identificado |
| battery | Sim | Sim | Não identificado |
| thermometer | Sim | Sim | Não identificado |
| led | Sim | Sim | Não identificado |
| sevenseg | Sim | Sim | Não identificado |
| dotmatrix | Sim | Sim | Não identificado |
| sparkline | Sim | Sim | Não identificado |
| valuecard | Sim | Sim | Não identificado |
| statuscard | Sim | Sim | Não identificado |
| glasspanel | Sim | Não identificado | Não identificado |
| gradientbutton | Sim | Sim | Não identificado |
| iconbutton | Sim | Sim | Não identificado |
| mobilelist | Sim | Não identificado | Não identificado |
| searchbar | Sim | Não identificado | Sim |
| passwordbox | Sim | Não identificado | Sim |
| numberbox | Sim | Não identificado | Sim |
| segmentedcontrol | Sim | Não identificado | Sim |
| skeleton | Sim | Não identificado | Sim |
| progressring | Sim | Não identificado | Sim |
| emptystate | Sim | Não identificado | Sim |
| codeblock | Sim | Não identificado | Sim |
| chat | Sim | Não identificado | Sim |
| signaturepad | Sim | Não identificado | Sim |
| dropdownmenu | Sim | Não identificado | Sim |
| popover | Sim | Não identificado | Sim |
| themetoggle | Sim | Não identificado | Sim |
| meterbar | Sim | Sim | Não identificado |
| detailsbox | Sim | Sim | Sim |
| textcounter | Sim | Sim | Sim |
| richtexteditor | Sim | Sim | Sim |
| daterangepicker | Sim | Sim | Sim |
| mediagallery | Sim | Sim | Sim |
| datatablefilter | Sim | Sim | Sim |
| passwordstrength | Sim | Sim | Sim |
| colorpalette | Sim | Sim | Sim |

**Atenção:** “Não identificado” não significa necessariamente ausência de implementação; módulos externos podem fornecer a função. Esta matriz não é um certificado de funcionalidade.

## Próximos testes obrigatórios
- Exercitar cada componente no Designer e Preview.
- Exportar e executar os mesmos casos no HTML gerado.
- Confirmar sugestões IntelliSense contra APIs reais e eventos da programação por blocos.
- Salvar, reabrir e comparar propriedades e rotinas.