# Hitbox Specs — Duelo de Sangue

Escala S = min(screenW,screenH)/640. x = coords.x + knockbackX, y = base (groundY). kneelY = kneelProgress*42*S.

## Xerife (sprite) — getFighterActiveHitboxes, usesSheriffSprite=true

- head (se !headless): AABB x:x-46S, y:y-151S+kneelY, w:92S, h:104S, damage 100
- arm: CÁPSULA a partir do ombro (getMuzzleWorldCoords):
  ax/ay = shoulder, bx/by = shoulder + cos/sin(aimAngle)*42S, radius 8.5S, damage 20
- torso: AABB x:x-32S, y:y-70S+kneelY, w:70S, h:110S, damage 40
- legs: AABB x:x-43S, y:y+27S, w:86S, h:64S, damage 25

## Legado (procedural) — 3 personagens sem sprite

- head (se !headless): x:x-24S, y:y-148S+kneelY, w:48S, h:52S, dmg 100
- torso: x:x-42S, y:y-94S+kneelY, w:84S, h:86S, dmg 40
- arm: x = (p1: x+14S ; p2: x-40S), y:y-68S+kneelY, w:26S, h:56S, dmg 20
- legs (em pé): x:x-26S, y:y+22S, w:52S, h:62S, dmg 25
- legs (ajoelhado): x:x-32S, y:y+36S, w:68S, h:36S, dmg 20

## Ordem de prioridade

- A ordem do array importa: testar cabeça/braço antes de tronco reduz falsos "torso" em tiros no braço.
- Commit d6e6ac9 "prioritize arm hits" — manter braço testado de forma que não confunda com tronco.

## Validação

- Toggle debug (P02) desenha todas as hitboxes. Testar tiros em ângulos altos/baixos e com personagem ajoelhado.
- A cápsula do braço deve acompanhar a manga desenhada (visual ↔ colisão).
