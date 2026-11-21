---
name: game-testing
description: Guia de testes, reprodução de bugs e prevenção de regressões do Duelo de Sangue (jogo Canvas 2D sem build). Ative ao criar/executar testes, ao validar uma alteração, ao reproduzir um bug reportado, ou ao definir critérios de aceite de uma tarefa. NÃO ative para tarefas puramente de conteúdo visual sem verificação lógica.
---

# Game Testing — Duelo de Sangue

> Baseline atual: **não há testes automatizados**. Toda validação é manual no navegador via `node server.js`. A introdução de testes automatizados é gradual (Fase 6).

## Estratégia de testes proporcional ao escopo

- **Mudou física/colisão** → teste manual de tiros em ângulos rasantes, rápidos, em cabeça/tronco/pernas/braço; aplicar toggle de hitbox (quando existir).
- **Mudou rendering** → carregar cada fase (menu, holding, countdown, fire, result) e cada personagem; resize janela; conferir sprites.
- **Mudou gameplay/duel flow** → rodar um duelo completo vs CPU nas 3 dificuldades; testar forfeit (sair do tambor), ammo victory, rematch.
- **Mudou UI** → clicar todas as abas, picker de personagem/cor, ranking, histórico.
- **Mudou multiplayer** → 2 abas/janelas, criar+entrar sala, duelo completo, desconectar no meio.

## Como rodar localmente

```
node server.js
# abrir http://127.0.0.1:3000/
```

Abrir DevTools (Console) e verificar ausência de erros/exceções.

## Boas práticas

1. **Hipótese antes de tentar fix.** Se um teste falha, leia o código relacionado e logs antes de editar.
2. **Uma verificação por mudança.** Não rode o jogo inteiro para uma mudança isolada; teste o subsistema afetado + um smoke test.
3. **Registre o que NÃO foi testado.** Se não validou mobile/online, diga explicitamente.
4. **Nunca declare concluído sem reproduzir o critério de aceite.**

## Testes automatizados futuros (Fase 6)

- Unit: `DuelPhysics` (AABB, plane crossing, capsule) — funções puras, fácil de testar.
- Unit: config de balanceamento, cálculos de dano por parte.
- Smoke E2E (Playwright): carregar página, iniciar CPU, disparar, chegar a result.
- Rodar sem build: usar Vitest/Jest apenas em dev (não entra no deploy Netlify).

## Referências

- `references/test-patterns.md` — padrões de teste para geometria e dano.
- `references/regression-checklist.md` — checklist por subsistema antes de concluir tarefas.
