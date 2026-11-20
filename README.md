# Duelo de Sangue

Jogo de duelos western 2D executado diretamente no navegador.

## Desenvolvimento local

O projeto é estático e não exige etapa de build nem instalação de dependências para servir o jogo. Abra `index.html` por um servidor HTTP local (por exemplo, `node server.js`) para evitar restrições do navegador ao carregar recursos.

## Publicação no Netlify

- Build command: deixar vazio.
- Publish directory: `.` (raiz do repositório).
- O arquivo `netlify.toml` já configura a publicação estática.
- PeerJS é carregado pelo CDN definido em `index.html`.

## Estrutura atual

- `index.html`: marcação e estrutura das telas.
- `assets/css/styles.css`: estilos da interface.
- `src/main.js`: orquestração atual do jogo, renderização e multiplayer.
- `src/physics.js`: helpers puros de geometria para colisão de segmentos, hitboxes e plano do chão.
- `assets/sprites/sheriff-idle.png`: sprite piloto do Xerife, com braço armado renderizado proceduralmente.
- `assets/`: imagens e demais recursos visuais.
- `netlify.toml`: configuração de publicação estática.
- `server.js`: servidor HTTP simples para desenvolvimento local.

## Próximas etapas de arquitetura

A lógica em `src/main.js` será extraída gradualmente para módulos menores (core, rendering, entities, physics, multiplayer e UI). A primeira extração é `src/physics.js`, carregado como script clássico para manter compatibilidade com hospedagem estática no Netlify. Essa migração será incremental para preservar o comportamento existente e manter compatibilidade com hospedagem estática no Netlify.

Não é necessário Vite, React, Node no ambiente de produção ou funções serverless para a versão atual.
