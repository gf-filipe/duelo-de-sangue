# Regra: Física e Colisões

## Diretrizes
- Use `window.DuelPhysics` como fonte única de geometria (AABB, cruzar plano). **Não reimplemente** colisão AABB (eliminar duplicação `checkLineAABB`).
- Balas colidem por **varredura de segmento** (prev→atual); nunca por ponto único (evita tunneling).
- Escala unificada `min(screenW,screenH)/640` em hitboxes, muzzle e desenho.
- Hitbox deve corresponder ao recorte visual; ao mudar o desenho, revalidar hitbox.
- Dano determinístico por parte: head 100, torso 40, legs 25, arm 20 (efeitos: headless/bleeding/kneeling/disarmed).
- Online: host é autoridade de dano; convidado aplica só via `hit_confirm` (sem dano duplo).
- Magic numbers de física/gameplay → centralizar em constantes/config (fase dedicada).

## Proibições
- Colisão por ponto único.
- Autoridade dupla de dano no online.
- Duplicar funções de `DuelPhysics`.

Detalhes: skill `gameplay-physics`.
