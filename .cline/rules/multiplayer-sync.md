# Regra: Multiplayer e Sincronização (BAIXA PRIORIDADE)

## Estado
- Multiplayer é a **última prioridade** do projeto. O jogo offline (vs CPU, treino, mecânicas, visual) deve estar perfeito antes.
- Não trabalhe em multiplayer sem aprovação explícita do usuário.

## Diretrizes (quando ativo)
- PeerJS via CDN; host = P1 autoridade de colisão/dano; convidado obedece.
- Sincronize só o necessário (aim_sync throttled 40ms; não envie estado inteiro por frame).
- Transições de fase (countdown/forfeit/ammo) decididas pelo host.
- Isole todo código online por `activeGameMode === 'online'` — nunca quebre o offline.
- Trate desconexão (`conn.on('close')`) encerrando limpo, sem travar fase.

## Proibições
- Tornar multiplayer dependência do loop offline.
- Enviar sem checar canal aberto.
- Autoridade dupla de dano.

Detalhes: skill `multiplayer-peerjs`.
