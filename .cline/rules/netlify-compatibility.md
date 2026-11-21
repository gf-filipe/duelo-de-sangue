# Regra: Compatibilidade com Netlify (hospedagem estática)

## Restrições de produção
- `netlify.toml`: `publish = "."`, sem build command. **O jogo deve rodar como arquivos estáticos.**
- **Sem** bundler, transpiler, `npm run build`, import/export ES Modules, ou dependência de Node runtime em produção.
- Scripts devem ser `<script src>` clássicos executados no navegador.
- PeerJS vem de CDN (`cdn.jsdelivr.net`) — não vendore sem necessidade.
- Novos assets: caminhos relativos (ex.: `assets/...`), funcionam em subpath do Netlify.

## Verificação antes de concluir
- [ ] O jogo abre corretamente servindo a raiz como estático (`node server.js`).
- [ ] Nenhuma referência a caminhos absolutos de sistema ou `file://`.
- [ ] Nenhum recurso requer build para carregar.

## Ferramentas de dev
Ferramentas de teste/lint (Vitest/Jest/ESLint) podem existir **apenas em dev** (devDependencies), nunca exigidas para servir o jogo no Netlify.
