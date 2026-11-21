# Regra: Arquitetura e Preservação do Projeto

## Contexto
Duelo de Sangue é um jogo western 2D (Canvas 2D + HTML + CSS + PeerJS + LocalStorage), hospedado estaticamente no Netlify. Sem framework, sem bundler, sem Node em produção.

## Diretrizes obrigatórias
- **Preservar funcionalidades existentes.** Não remover, reescrever ou substituir sistemas que funcionam sem necessidade técnica demonstrada.
- **Menor alteração possível.** Prefira mudanças pequenas e cirúrgicas a refatorações amplas.
- **Não trocar tecnologia** (framework, bundler, lib) sem apresentar vantagens/desvantagens e obter aprovação.
- **Não introduzir dependências** sem justificativa explícita.
- **Não criar abstrações genéricas** ("Engine", factories universais). Só o concreto do jogo.
- **Respeitar a arquitetura atual.** `main.js` monolítico será extraído incrementalmente; não force a divisão completa de uma vez.
- Módulos novos: IIFE + `window.<Namespace>`, `<script>` clássico (ver skill `game-architecture`).

## Estrutura atual
- `index.html`, `assets/css/styles.css`, `src/main.js`, `src/physics.js`, `server.js`, `netlify.toml`.

## Ao propor algo grande
Se a tarefa exigir decisão de produto ou mudança arquitetural significativa: apresente alternativas e **aguarde decisão do usuário**. Não implemente unilateralmente.
