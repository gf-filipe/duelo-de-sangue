---
name: game-architecture
description: Guia de arquitetura e organização de módulos do Duelo de Sangue. Ative ao criar, extrair ou mover arquivos JS, ao decidir onde uma função deve viver, ao definir limites de responsabilidade entre módulos, ou ao gerenciar estado global do jogo. NÃO ative para tarefas puramente visuais ou de conteúdo/asset.
---

# Game Architecture — Duelo de Sangue

## Estado atual (baseline obrigatório)

- Hospedagem estática no Netlify: **sem build, sem bundler, sem Node em produção**.
- Scripts clássicos carregados no `index.html` na ordem:
  `src/physics.js` → `src/main.js`. Novos módulos devem ser `<script>` clássicos e usar `window.<Namespace>` (padrão IIFE), nunca `import/export` ES Module (quebra hospedagem estática sem bundler).
- `src/main.js` (~3.4k linhas) é o monolito atual que será extraído **incrementalmente**.
- `src/physics.js` é o modelo de módulo correto: IIFE, `'use strict'`, `Object.freeze` no namespace global.

## Regras ao extrair um módulo

1. **Extraia um subsistema por vez.** Nunca misture gameplay + rendering + UI na mesma tarefa.
2. **Copie, não reescreva.** Mova a função existente com o mínimo de edição (ajustar referências de namespace). Preserve nomes e comportamento.
3. **Ordem de carregamento importa.** Módulos base (constants/state) carregam antes de módulos que os usam.
4. **Namespace global único por módulo.** Ex.: `window.DuelConstants`, `window.DuelState`, `window.DuelAudio`. Evite colisões.
5. **Estado compartilhado explícito.** Se um módulo precisa de `screenW/screenH` ou dos fighters, receba-os por parâmetro ou leia de um único objeto de estado — não duplique variáveis globais.
6. **Sem abstrações genéricas.** Não crie "Engine", "System<T>" ou fábricas genéricas. Crie funções concretas do jogo.

## Limites de responsabilidade (alvo)

- `constants.js`: valores fixos (BULLET_SPEED, GROUND_RATIO, cores, config de balanceamento).
- `state.js`: fighters, fase, placar, histórico (fonte única de verdade).
- `physics.js`: geometria pura (já existe).
- `rendering/*`: só desenham; não alteram regras de gameplay.
- `gameplay/*`: regras do duelo (holding, countdown, fire, forfeit, CPU).
- `multiplayer/*`: PeerJS e protocolo.
- `audio/*`: Web Audio API.

## Anti-padrões proibidos

- Introduzir Vite/Webpack/React sem decisão explícita do usuário.
- `export default` / `import` (não funciona em `<script>` clássico no Netlify).
- Estado duplicado entre módulos.
- Misturar DOM/UI dentro de funções de física ou rendering de canvas.

## Checklist antes de extrair

- [ ] A tarefa mexe em UM subsistema?
- [ ] O novo módulo usa IIFE + namespace `window.*`?
- [ ] A ordem no `index.html` foi ajustada?
- [ ] Nenhuma funcionalidade foi reescrita, apenas movida?
- [ ] Existe teste/verificação de regressão proporcional (ver skill game-testing)?

## Referências

Ver `references/module-boundaries.md` para a tabela de dependências entre módulos alvo.
