---
name: canvas-rendering
description: Guia de renderização Canvas 2D, ciclo de desenho, sprites, animações e performance do Duelo de Sangue. Ative ao modificar funções de desenho (render*), o gameAnimationLoop, sprites/spritesheets, ordem de camadas, estado de canvas, ou ao otimizar o loop de jogo. NÃO ative para lógica de física, regras de duelo ou multiplayer.
---

# Canvas Rendering — Duelo de Sangue

## Arquitetura de renderização atual

- Todo o jogo é desenhado em **Canvas 2D** (`gameCanvas`). A mira é desenhada no canvas (não é CSS cursor).
- Os tambores usam canvases próprios (`drumCanvasLeft/Right`, 96×96) via `renderTactileDrum`.
- Há um canvas separado de **manchas de sangue persistentes** (`bloodStainsCanvas`) desenhado por cima do cenário.
- Menu tem canvas de fundo próprio (`menuCanvasBg`).

## Ordem de camadas no `gameAnimationLoop` (preserve esta ordem)

1. `renderGunbloodEnvironment` (céu, sol, nuvens, prédios, props, chão, blood stains, tumbleweeds)
2. física (`updateBulletsPhysics`, `updateDroppedWeapons`, `updateBloodParticles`)
3. `renderGunbloodCharacter` p1 e p2
4. `renderProjectilesAndGore` (balas, sangue em voo, armas, cabeças)
5. `renderTactileDrum` (HUD de tambor)
6. `renderGunbloodCrosshair` (topo de tudo)

## Regras de sprites

- Sprite piloto: `assets/sprites/sheriff-idle.png` (128×320, **1 frame real**). O código NÃO deve avançar `sourceY` esperando frames inexistentes — isso já causou flicker (ver `renderSheriffSprite`).
- Para spritesheets reais futuros: defina grade explícita (cols × rows) e só avance frames que existem. Use `spriteAnimator` com `dt`.
- Escala unificada: `scale = Math.min(screenW, screenH) / 640`. Respeite-a para manter proporção com a física.
- O personagem P2 é espelhado com `ctx.scale(-1, 1)` — cuidado ao converter ângulos (mira) para espaço local.

## Regras de performance

- Não crie gradientes/Path2D a cada frame se forem constantes — crie uma vez e reutilize quando possível.
- Evite alocações por frame dentro de loops de partículas; considere object pooling (Fase 6).
- `dt` vem de `gameAnimationLoop` limitado a 0.05s. Use `dt` para movimento, não frame count.
- Pause o loop quando a aba está inativa (Page Visibility API) — melhoria futura.

## Convenções

- Funções de desenho começam com `render*` (canvas principal) ou `draw*` (helpers de forma).
- Funções de desenho NÃO alteram regras de gameplay nem estado persistente (exceto animações visuais locais como `recoilAngle` decay).
- Sempre `ctx.save()`/`ctx.restore()` ao mudar transform/estilo e ao redor de código que mexe em coordenadas.

## Anti-padrões proibidos

- Substituir sprites desejados por polígonos geométricos improvisados como solução permanente.
- Desenhar HUD crítico apenas em DOM sem canvas (a mira precisa estar no canvas).
- Misturar lógica de dano dentro de funções `render*`.

## Referências

- `references/render-loop.md` — fluxo do loop e uso de dt.
- `references/sprite-conventions.md` — especificação de sprites e spritesheets.
