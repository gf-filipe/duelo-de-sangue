# Regra: Canvas 2D e Loop de Jogo

## Diretrizes
- Toda renderização principal é no `gameCanvas` (Canvas 2D). A mira é desenhada no canvas.
- **Preserve a ordem de camadas** definida no `gameAnimationLoop` (ambiente → física → personagens → projéteis/gore → tambores → mira).
- Use `dt` (clampado a 0.05) para animação; não dependa de contagem de frames.
- `scale = min(screenW,screenH)/640` é a escala unificada — respeite-a.
- Funções `render*`/`draw*` **não alteram regras de gameplay** nem estado persistente.
- Sempre `ctx.save()/restore()` ao mudar transform/estilo.
- Sprites: só avance frames existentes (ver skill `canvas-rendering`).
- Não substitua sprites desejados por polígonos improvisados como solução permanente.

## Proibições
- Lógica de dano dentro de funções de render.
- Alocações pesadas por frame (prefira pooling em fase futura).
- Ignorar `dt` e mover por frame.

Detalhes: skill `canvas-rendering`.
