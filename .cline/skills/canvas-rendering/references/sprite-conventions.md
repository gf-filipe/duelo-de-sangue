# Sprite Conventions — Duelo de Sangue

## Sprite piloto atual

- Arquivo: `assets/sprites/sheriff-idle.png`
- Dimensões: 128 × 320 px
- Frames reais: **1** (não é spritesheet 2×2 apesar de comentário antigo no código).
- Render: `renderSheriffSprite` usa `drawImage(img, 0,0,128,320, ...)` sempre no frame 0.
- Âncora: pés alinhados via `footOffset = 89 * scale` (mesma linha dos personagens legados).
- Só é usado quando: personagem = sheriff, cor = padrão, vivo, não ajoelhado, não decapitado (`usesSheriffSprite`).

## Especificação para spritesheets futuros

- Formato: grade regular, sem padding entre frames.
- Metadados sugeridos (em `constants.js` ou loader):
  ```js
  { src, frameW, frameH, cols, rows, anims: { idle:[0,1,2,3], draw:[4,5,6] } }
  ```
- `spriteAnimator`: recebe `dt`, `fps`, lista de frames da animação; avança índice e faz wrap.
- NUNCA avance para um frame que não existe no atlas (causa desaparecimento/flicker).
- Estados que trocam de sprite: idle, aiming (braço), disarmed, kneeling, dead/headless.
  - Enquanto não houver sprite para um estado, use o renderer procedural correspondente (híbrido).

## Âncoras e alinhamento

- Âncora do desenho = linha dos pés no chão (`getFighterCoords` → y = groundY).
- O braço armado é desenhado separadamente (procedural) mesmo com sprite, para acompanhar a mira.
- Hitboxes devem corresponder ao recorte visual, não ao corpo "ideal". Ver skill gameplay-physics.

## Direção artística

- Identidade: cartoon western (silhueta limpa, contorno escuro, cores quentes).
- Não usar placeholders geométricos como entrega final — são temporários até o sprite chegar.
