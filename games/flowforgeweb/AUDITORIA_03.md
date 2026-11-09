# Auditoria e correções 03

- Adicionada propriedade `mapAddress` ao mapa, disponível no painel de propriedades e no esquema consultado pelo IntelliSense.
- Google Maps: busca pelo endereço informado; endereço vazio utiliza latitude/longitude.
- Bing Maps: busca pelo endereço informado; a incorporação de página de pesquisa pode ser restringida pelo Bing.
- OpenStreetMap: continua utilizando latitude/longitude; geocodificação por endereço ainda não foi implementada para este provedor.
- Mantido `src` para o provedor personalizado.

## Limitações
Não foi executada auditoria funcional completa dos 117 tipos de componentes. Não há garantia de equivalência entre IntelliSense, blocos, Preview e exportação HTML para todos eles. Testes no navegador continuam necessários.
