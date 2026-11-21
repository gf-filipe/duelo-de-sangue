# Scope Guide — escolha por arquivo/alteração

| Arquivos / área | Escopo sugerido |
|-----------------|-----------------|
| Dano, morte, hitboxes, desarme, sangramento | `combat` |
| Colisão, balas, muzzle, `src/physics.js` | `physics` |
| PeerJS, protocolo, salas, reconexão | `multiplayer` |
| Menu, abas, HUD, DOM, CSS | `ui` |
| `GUNSLINGERS`, sprites, animação de personagem | `characters` |
| Canvas, câmera, ambiente, camadas de desenho | `rendering` |
| Web Audio, sons | `audio` |
| Extração de módulos, estrutura (`constants`, `state`) | `arch` |
| `netlify.toml`, `server.js`, configuração de build | `config` |
| `.cline/skills`, `.cline/rules`, docs do agente | `cline` |

## Regras de escolha
- Se a alteração toca **um subsistema**, use o escopo desse subsistema.
- Extrações/movimentações de código sem mudança de comportamento → `refactor` + `arch`.
- Documentação/Skills/regras → `docs` + `cline`.
- Se couber em dois escopos, escolha o de **menor granularidade que descreve o impacto real**
  (ex.: novo impacto de dano → `combat`, mesmo que mexa em `main.js`).
