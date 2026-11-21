# Commit Examples — Duelo de Sangue

Exemplos derivados das tasks reais do projeto (adapte ao diff real; não copie cego).

## Tasks já realizadas
- B01 unificar colisão AABB:
  ```
  fix(physics): unify AABB collision via DuelPhysics
  ```
- B02 vencedor por primeiro kill letal:
  ```
  fix(combat): lock first lethal hit as round winner
  ```
- C01 extrair constantes:
  ```
  refactor(arch): extract shared constants into src/constants.js
  ```

## Outros cenários típicos
- Nova mecânica (ex.: desarme): `feat(combat): add disarm mechanic on arm hits`
- Ajuste de sprite do Xerife: `feat(characters): animate sheriff idle sprite with arm hitbox`
- Correção de flicker: `fix(rendering): stop sheriff sprite flicker`
- UI do ranking: `feat(ui): add persistent leaderboard table`
- Sincronização de mira: `perf(multiplayer): throttle aim sync to 40ms`
- Testes/harness: `test(physics): add AABB collision parity harness`
- Skills/regras do Cline: `docs(cline): add gameplay-validation and commit-guidelines skills`
- Config de deploy: `chore(config): set netlify publish root`

## Com body (quando necessário)
```
fix(combat): make host authoritative for online hit resolution

Prevents double damage on the guest by applying damage only via hit_confirm
from the host. Offline behavior unchanged.
```

## Anti-exemplos (evitar)
- `update stuff` — vago, sem tipo/escopo.
- `Fix (Physics) Unified AABB.` — maiúsculas/ponto final/inglês inconsistente.
- `feat: everything` — mistura várias tasks.
- Misturar `docs(cline)` com `fix(physics)` numa só mensagem.
