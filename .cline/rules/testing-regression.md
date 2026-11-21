# Regra: Testes e Prevenção de Regressões

## Diretrizes
- Todo bug só é considerado corrigido após **reproduzir o critério de aceite**.
- Execute testes **proporcionais ao escopo**: teste o subsistema afetado + um smoke test.
- Mudou física → teste tiros (cabeça/tronco/pernas/braço, ângulos rasantes).
- Mudou rendering → carregue cada fase e cada personagem; teste resize.
- Mudou duel flow → duelo completo vs CPU nas 3 dificuldades (forfeit, ammo, rematch).
- Mudou UI → todas as abas, picker, ranking, histórico.
- Registre explicitamente o que NÃO foi testado (mobile, online etc.).

## Antes de cada mudança
- Se um teste falha: **leia o código + logs e formule hipótese** antes de editar. Evite tentativa-e-erro cega.

## Baseline
- Não há testes automatizados hoje. Introdução gradual na fase final (Vitest unit puro + Playwright smoke), apenas em dev.

Detalhes: skill `game-testing` (checklist de regressão por subsistema).
