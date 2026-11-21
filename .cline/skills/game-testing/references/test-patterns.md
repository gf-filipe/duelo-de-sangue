# Test Patterns — Duelo de Sangue

## DuelPhysics (puro, testável sem DOM)

```js
// segmentIntersectsAabb
expect(segmentIntersectsAabb(0,5,10,5, {x:2,y:0,w:3,h:10})).toBe(true)   // atravessa
expect(segmentIntersectsAabb(0,20,10,20,{x:2,y:0,w:3,h:10})).toBe(false) // acima, não toca
expect(segmentIntersectsAabb(0,0,0,10, {x:-1,y:0,w:2,h:10})).toBe(true)  // vertical no box

// segmentCrossesHorizontalPlane
expect(segmentCrossesHorizontalPlane(0,0,0,10,5).x).toBe(0)
expect(segmentCrossesHorizontalPlane(0,8,0,10,5)).toBe(null) // não cruza
```

- Cobrir: dentro/fora, tangente, diagonal, vertical/horizontal, box degenerado.

## Dano por parte (gameplay puro se isolado)

- head → hp 0, isHeadless true.
- torso → isBleeding true, hp -= 40.
- legs → isKneeling true.
- arm → isDisarmed true, arma criada.
- hp nunca < 0.

## Fluxo de fases (integração)

- holding → (ambos holding) → countdown → (3,2,1) → fire.
- Soltar tambor no countdown → volta holding + aviso.
- Sem munição ambos, sem balas em voo → draw.
- hp<=0 → round_over → result.

## Convenções

- Manter testes sem dependência de build; executar via runner de dev.
- Não testar detalhes visuais pixel-a-pixel; testar estado e invariantes.
