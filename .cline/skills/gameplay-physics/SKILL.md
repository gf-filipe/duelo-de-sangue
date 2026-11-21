---
name: gameplay-physics
description: Guia de física, colisões, hitboxes, projéteis, dano e detecção de impacto do Duelo de Sangue. Ative ao modificar balas, hitboxes, colisão segmento-AABB/cápsula, ângulo de mira, cálculo de dano por parte do corpo, ou regras de duelo ligadas a acertos. NÃO ative para rendering puro ou UI.
---

# Gameplay Physics — Duelo de Sangue

## Modelo físico atual

- Projéteis de **velocidade constante** (`BULLET_SPEED = 2600` px/s), com `prevX/prevY` para
  varredura de colisão por segmento (evita "tunneling" em alta velocidade).
- Colisão por **segmento vs AABB** (`DuelPhysics.segmentIntersectsAabb`) e **segmento vs cápsula**
  (`segmentIntersectsCapsule` local para o braço do Xerife).
- Balas só colidem com o chão no rodapé (`screenH - 8`); abaixo da linha dos prédios é jogável (permite acertar pernas).
- Mira: `aimAngle = atan2(cursorY - shoulderY, cursorX - shoulderX)`. O cano termina a `95 * scale` do ombro (`getMuzzleWorldCoords`).

## Regras de dano por parte do corpo (baseline — preservar)

| Parte | Dano | Efeito |
|-------|------|--------|
| head | 100 | Headshot: `isHeadless = true`, hp=0, cabeça decapitada rolando, sangue |
| torso | 40 | `isBleeding = true` (DoT), knockback, buraco de bala |
| legs | 25 (legado 25, ajoelhado 20) | `isKneeling = true`, hitbox abaixa |
| arm | 20 | `isDisarmed = true`, arma cai (`spawnDroppedWeapon`) |

- Vitória por munição: quando todos os projéteis em voo terminam e um lado tem 0 balas.
- Host (P1) é autoridade de colisão/dano no modo online (`localRole === 'p1'`).

## Regras ao alterar física/hitboxes

1. **Nunca remova a varredura por segmento** (prev/atual). Testar com tiros rápidos em ângulos rasantes.
2. **Mantenha paridade hitbox ↔ visual.** Se mudar o desenho, ajuste a hitbox correspondente e valide com debug visual (P02).
3. **Use `DuelPhysics` como fonte única.** Não reimplemente AABB (eliminar `checkLineAABB` duplicado — bug B01).
4. **Escala sempre `min(screenW,screenH)/640`.** Hitboxes e muzzle usam a mesma escala.
5. **Dano é determinístico por parte**; dispersão de tiro rápido (`consecutiveShots`) afeta só o ângulo, não o dano.
6. **Modo online:** só o host aplica dano real; o convidado recebe `hit_confirm`. Não dobre dano.

## Anti-padrões proibidos

- Chamar `applyHitDamage` no cliente convidado de forma independente (causa dano duplo).
- Hitbox baseada em números mágicos soltos — centralize em constantes/config (Fase 4, G02).
- Colisão por ponto único da bala (perde tiros rápidos).

## Referências

- `references/collision-api.md` — assinaturas de DuelPhysics e helpers.
- `references/hitbox-specs.md` — geometria das hitboxes sheriff (sprite) vs legado.
