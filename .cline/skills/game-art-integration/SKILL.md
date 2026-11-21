---
name: game-art-integration
description: Guia de integração de arte (sprites, assets, dimensões, estados, animações) do Duelo de Sangue com identidade cartoon western. Ative ao adicionar/alterar sprites, criar spritesheets, ligar assets ao loader, definir dimensões/âncoras, ou mapear estados de personagem a quadros. NÃO ative para física, multiplayer ou UI pura.
---

# Game Art Integration — Duelo de Sangue

## Direção artística

- Identidade: **cartoon western** inspirado em Gunblood. Silhueta limpa, contorno escuro, cores quentes (ocre, marrom, laranja do pôr do sol).
- Evolução **híbrida**: preservar renderer procedural funcional enquanto sprites entram gradualmente; nunca quebrar o que funciona para "forçar" sprite.
- Polígonos geométricos improvisados são **temporários**, nunca entrega final dos sprites desejados.

## Estado atual dos assets

- Único sprite: `assets/sprites/sheriff-idle.png` (128×320, 1 frame real).
- Carregado em `main.js` como `sheriffSpriteSheet` (Image), com listener de `load` para atualizar previews.
- 3 personagens (outlaw, undertaker, bounty_hunter) ainda 100% procedurais.

## Regras ao integrar sprite/asset

1. **Defina especificação antes do asset:** dimensões (frameW×frameH), grade (cols×rows), âncora (pés no chão), estados (idle/aim/disarmed/kneel/dead).
2. **Loader explícito:** registre o asset com metadados; não assuma grade.
3. **Só avance frames existentes.** Spritesheet incompleto = flicker/desaparecimento (ver A01).
4. **Mapa de estados → animação:** idle, aiming (braço separado), disarmed, kneeling, dead/headless. Se faltar estado, use procedural.
5. **Alinhamento:** âncora na linha dos pés (`footOffset`), mesma escala do procedural (`min(screenW,screenH)/640`).
6. **Preview no menu** (`renderCharacterMiniPreview`) deve refletir o mesmo asset/estado.

## Convenções de arquivo

- `assets/sprites/<personagem>-<estado>.png` (ex.: `sheriff-idle.png`, `outlaw-draw.png`).
- Manter fundo transparente (PNG).
- Documentar dimensões no README ou em metadados do loader.

## Anti-padrões proibidos

- Substituir sprite por desenho geométrico temporário como solução permanente.
- Assumir que um atlas tem mais frames do que realmente tem.
- Mudar cores/estilo fora da paleta cartoon definida sem aprovação.

## Referências

- `references/sprite-specs.md` — especificação de dimensões/âncoras/estados.
- `references/asset-pipeline.md` — fluxo de adicionar um novo sprite ao jogo.
