# Regra: Padrões de Implementação JavaScript

## Estilo
- `'use strict';` no topo de cada script/módulo.
- Preferir `const` > `let`; evitar `var`.
- Nomes descritivos em português para domínio do jogo (fighter, duelo, tambor) ou inglês para termos técnicos — manter consistência no arquivo.
- Funções pequenas e focadas; uma responsabilidade.

## Estrutura de módulo
- IIFE + namespace global para novos módulos: `(function(g){ 'use strict'; ... g.DuelX = Object.freeze({...}); })(window);`
- Sem `import`/`export` ES (incompatível com `<script>` clássico no Netlify).
- Documentar API pública com **JSDoc** (parâmetros, retorno, efeitos colaterais).

## Magic numbers
- Evitar números mágicos de gameplay no meio da lógica. Preferir constantes nomeadas/config.
- Valores de escala/layout podem usar a constante `scale`.

## Comentários
- Explicar o "porquê" de decisões não óbvias (ex.: por que não avançar frame de sprite).
- Evitar comentar o óbvio. Manter comentários úteis e atuais.
- Não misturar idiomas de forma confusa; manter PT para domínio, EN para termos técnicos é aceitável desde que claro.

## Proibições
- Código morto/comentado sem justificativa.
- Variáveis globais duplicadas para o mesmo estado.
- Alterar nomes/estilo de código existente sem necessidade funcional (refatoração cosmética).
