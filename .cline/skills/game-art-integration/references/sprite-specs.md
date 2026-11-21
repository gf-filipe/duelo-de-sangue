# Sprite Specs — Duelo de Sangue

## Dimensões e âncoras

- Escala de referência do jogo: S = min(screenW,screenH)/640.
- Âncora de personagem: linha dos pés no chão (groundY = screenH*0.74).
- Sheriff piloto: 128×320 px de origem; desenhado com footOffset = 89*S.
- Personagem P2 é espelhado: `ctx.scale(-1,1)`; manter arte coerente (não invertida internamente).

## Estados necessários por personagem (alvo)

| Estado | Descrição | Fallback procedural |
|--------|-----------|---------------------|
| idle | em pé, respiração leve | renderArticulated* |
| aiming | braço acompanhando mira | renderArticulatedArmedArm (ou braço sprite) |
| disarmed | sem arma, braço caído | renderArmedArm ramo disarmed |
| kneeling | ajoelhado (tiro nas pernas) | renderArticulatedLegs kneeling |
| dead | caindo | deathFallAngle/FallY |
| headless | decapitado | renderNeckStumpGeyser |

## Especificação de spritesheet (futuro)

```js
{
  src: 'assets/sprites/<char>-atlas.png',
  frameW: 128, frameH: 320,
  cols: 4, rows: 2,
  anims: {
    idle:  [0,1,2,3],
    draw:  [4,5,6],
    // ...
  },
  anchor: { x: frameW/2, y: footOffsetPx }
}
```

- Só referencie frames existentes no atlas.
- fps sugerido idle: 6–8; draw: 12–15.

## Alinhamento com hitboxes

- O recorte visual define a hitbox. Ao trocar sprite, revalidar hitboxes (skill gameplay-physics).
