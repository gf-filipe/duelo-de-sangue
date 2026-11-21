# Collision API — DuelPhysics (src/physics.js)

Módulo puro, sem dependências. Exposto como `window.DuelPhysics` (frozen).

## segmentIntersectsAabb(x1, y1, x2, y2, box) → boolean

- `box`: `{ x, y, w, h }`
- Teste de interseção segmento × retângulo (slab method).
- USAR ESTE para hitboxes retangulares. NÃO reimplementar (remover checkLineAABB em main.js).

## segmentCrossesHorizontalPlane(x1, y1, x2, y2, planeY) → {x,y,t} | null

- Retorna o ponto onde o segmento cruza a linha horizontal `planeY`.
- Usado para impacto no chão (rodapé da tela).
- `t` no intervalo [0,1] indica o ponto ao longo do segmento.

## Helpers locais em main.js (a consolidar)

- `pointSegmentDistanceSquared` — distância ponto-segmento².
- `segmentsCross` — interseção de dois segmentos.
- `segmentIntersectsCapsule(x1,y1,x2,y2,capsule)` — capsule = {ax,ay,bx,by,radius}.
  - Combinado com `DuelPhysics` para braço do Xerife.
- `checkLineAABB` — REMOVIDO (B01 resolvido). A colisão AABB agora usa exclusivamente `window.DuelPhysics.segmentIntersectsAabb` (fonte única).

## Muzzle e ombro

- `getMuzzleWorldCoords(role)` → {x, y, shoulderX, shoulderY}
  - shoulderX = coords.x + knockbackX ± 14*scale (p1 +, p2 -)
  - shoulderY = coords.y + (sheriff? -56 : -52)*scale + kneelY
  - muzzle = shoulder + unit(angle) * 95*scale
