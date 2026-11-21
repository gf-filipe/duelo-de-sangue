# Render Loop — Fluxo e dt

## gameAnimationLoop(timestamp)

```
dt = min((timestamp - lastFrameTimestamp)/1000, 0.05)
lastFrameTimestamp = timestamp

if phase not in (menu, load):
    renderGunbloodEnvironment(ctx, dt)
    updateBulletsPhysics(dt)
    updateDroppedWeapons(dt)
    updateBloodParticles(dt)
    renderGunbloodCharacter(ctx, fighter1, 'p1', dt)
    renderGunbloodCharacter(ctx, fighter2, 'p2', dt)
    renderProjectilesAndGore(ctx)
    renderTactileDrum(drumCanvasLeft, p1.bullets, p1.drumRotation, cor)
    renderTactileDrum(drumCanvasRight, p2.bullets, p2.drumRotation, cor)
    renderGunbloodCrosshair(ctx, cursorAimX, cursorAimY)
elif phase == 'menu':
    renderMenuAnimation(dt)

requestAnimationFrame(gameAnimationLoop)
```

## Regras

- dt é clampado a 0.05 (evita saltos ao voltar de aba inativa).
- Física usa dt em segundos (velocidades em px/s).
- Não recalcule `scale` de forma diferente do restante: `min(screenW,screenH)/640`.
- Resize: `handleWindowResize` ajusta canvas sizes e recria bloodStainsCanvas (ver bug B02 sobre alinhamento).

## Cuidados

- `renderGunbloodCharacter` contém micro-animações que decay usam dt (recoilAngle, knockbackX, deathFall, bleed DoT). Não remova o update de dt dessas animações.
- O bleed DoT aplica dano dentro do render (acoplamento conhecido). Ao modularizar, mover o dano para gameplay e deixar só o visual no rendering.
