---
name: gameplay-validation
description: Gera cenários de validação MANUAL específicos para qualquer alteração de gameplay, interface ou comportamento do Duelo de Sangue, ao concluir uma tarefa. Ative ao final de toda task que altere comportamento observável (combate, física, fluxo de duelo, UI, personagens, multiplayer), antes de considerar a tarefa validada. Complementa game-testing (estratégia de testes/regressão); esta Skill foca no "como validar na prática" com passos e resultados esperados.
---

# Gameplay Validation — Duelo de Sangue

Objetivo: garantir que toda alteração de gameplay/UI/comportamento seja acompanhada de
instruções claras de **validação manual** — não basta "os testes automatizados passaram".

Diferença para `game-testing`: aquela define *estratégia* e *checklist de regressão por
subsistema*. Esta define os **cenários concretos e passo a passo** da alteração atual.

## Quando aplicar
Sempre que a task mudar comportamento observável pelo jogador: combate/dano, física/colisão,
fluxo do duelo (tambor/contagem/fogo/forfeit/ammo/rematch), UI (abas, picker, ranking,
histórico, HUD), personagens/sprites, ou multiplayer. Não é necessária para extrações puras
sem mudança de comportamento (ex.: mover constante) — mas informe isso explicitamente.

## O que o relatório de validação DEVE conter

1. **O que mudou na prática** — 1-3 frases objetivas sobre o comportamento novo/diferente.
2. **Comportamentos a observar** — o que o jogador deve ver/experimentar.
3. **Cenários passo a passo** — numerados, executáveis, específicos desta alteração
   (sem checklists genéricos ou irrelevantes).
4. **Resultado esperado** de cada cenário — critério objetivo de sucesso/falha.
5. **Cobertura de casos** — inclua: normal (caminho feliz), negativo (entrada/ação inválida),
   extremo (limites), e possíveis regressões relacionadas.
6. **Automatizado × manual** — separe claramente o que foi testado por script (unit/harness)
   do que exige interação manual no navegador.
7. **Checklist de validação** adequado à alteração (não copie checklist inteiro de outro
   subsistema).
8. **O que NÃO foi possível testar** — declaração explícita (ex.: mobile, online, retina).

## Regra de ouro
**Nunca considere a tarefa completamente validada apenas porque testes automatizados
passaram.** Testes automatizados cobrem lógica/geometria; comportamento percebido (visual,
áudio, timing, UX) exige validação manual ou declaração explícita de que não foi validado.

## Formato de cenário (use este padrão)
```
Cenário N — <nome curto>
Pré-condição: <estado inicial: modo, dificuldade, personagens, fase>
Passos:
  1. ...
  2. ...
  3. ...
Resultado esperado: <critério objetivo>
Cobertura: normal | negativo | extremo | regressão
```

## Como rodar manualmente
```
node server.js   # http://127.0.0.1:3000/
```
Abra DevTools Console e confirme ausência de erros.

## Referências
- `references/validation-templates.md` — templates de cenários por tipo de alteração.
- `references/edge-cases.md` — catálogo de casos extremos conhecidos.
