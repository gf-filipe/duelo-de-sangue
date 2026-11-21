# Limites e Dependências entre Módulos

## Ordem de carregamento alvo no index.html

```
1. src/constants.js        (sem deps)
2. src/physics.js          (sem deps)          [já existe]
3. src/state.js            (constants)
4. src/audio/audioEngine.js(constants, state)
5. src/rendering/environment.js (constants, state)
6. src/rendering/characters.js  (constants, state, audio)
7. src/rendering/hud.js         (state)
8. src/gameplay/duelFlow.js     (constants, state, audio, characters)
9. src/gameplay/cpuAI.js        (state, duelFlow)
10. src/multiplayer/peerManager.js (state, gameplay)
11. src/main.js                 (orquestra init, loop, input, UI wiring)
```

## Regras de dependência

- Rendering NÃO chama gameplay. Gameplay PODE chamar rendering helpers.
- Physics NÃO importa estado do jogo. É geometria pura.
- Multiplayer é a camada mais alta; depende de gameplay mas não é dependido por ele (inverta com callbacks se necessário).
- `main.js` apenas inicializa e conecta tudo no final.

## Mapa de funções atuais relevantes (baseline para extração)

| Grupo | Funções em main.js (linhas aprox.) |
|-------|-------------------------------------|
| Constantes | GUNSLINGERS (9), OUTFIT_COLORS (76), BULLET_SPEED/GROUND_RATIO (80-81) |
| Estado | fighter1/2, activeBullets, currentPhase, etc. (83-144) |
| Audio | audioEngine (188-459) |
| Environment | initBackgroundElements, renderGunbloodEnvironment, town/props/cactus (465-863) |
| Characters | renderGunbloodCharacter, legs/torso/head/arm, sheriff sprite (869-1577) |
| Crosshair | renderGunbloodCrosshair (1583-1621) |
| Physics/Hit | getMuzzleWorldCoords, hitboxes, applyHitDamage, bullets (1627-2077) |
| Blood/Gore | spawnBloodFountain, splatBloodOnSand, severedHeads (2083-2241) |
| Drum render | renderTactileDrum (2247-2313) |
| Duel flow | beginNewRound, countdown, forfeit, CPU (2319-2555) |
| Results/score | displayDuelResult, leaderboard, history (2561-2740) |
| Multiplayer | PeerJS, handlers, sendP2P (2746-3009) |
| Input/loop | aim, mouse/touch, gameAnimationLoop (3046-3186) |
| UI/init | switchScreen, picker, resize, init (3192-3409) |
