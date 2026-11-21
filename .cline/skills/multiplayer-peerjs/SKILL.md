---
name: multiplayer-peerjs
description: Guia do multiplayer P2P via PeerJS do Duelo de Sangue (salas, sincronização de estado, host autoritário, desconexões). Ative SOMENTE em tarefas de multiplayer online. NOTA: multiplayer é a ÚLTIMA prioridade do projeto — o jogo offline deve estar perfeito antes. Não ative em tarefas offline.
---

# Multiplayer PeerJS — Duelo de Sangue

> PRIORIDADE: BAIXA (última fase). Só trabalhe aqui após o offline estar validado e com aprovação do usuário.

## Arquitetura atual

- PeerJS 1.5.5 via CDN (`index.html`). Servidor público `0.peerjs.com`, STUN Google.
- Host (P1) cria sala com código de 5 letras (`generate5LetterRoomCode`) e escuta `connection`.
- Convidado (P2) conecta ao código do host.
- **Host é autoridade** de colisão/dano; convidado simula visualmente e aplica `hit_confirm`.

## Protocolo de mensagens (handleIncomingP2PData)

| type | Payload | Direção |
|------|---------|---------|
| handshake | name, charIdx, color | P2→P1 e P1→P2 |
| start_duel | — | P1→P2 |
| aim_sync | role, angle | ambos (throttle 40ms) |
| drum_state | isHolding | ambos |
| countdown_start | — | P1→P2 |
| countdown_cancel | — | P1→P2 |
| forfeit_result | winnerRole | P1→P2 |
| bullet_spawn | x,y,vx,vy,angle,shooterRole | atirador→outro |
| hit_confirm | part,damage,x,y,attacker,victim | P1→P2 |
| ammo_result | winnerRole | P1→P2 |
| rematch_ready | — | ambos |

## Regras ao mexer no multiplayer

1. **Não duplicar dano.** Só o host aplica dano real; convidado espera `hit_confirm`.
2. **Sincronize só o necessário.** aim_sync com throttle; não envie estado inteiro a cada frame.
3. **Host decide transições de fase** (countdown, forfeit, ammo). Convidado obedece.
4. **Tolerância a desconexão:** `close` deve encerrar limpo, sem travar fase. Reconexão é melhoria futura (M03).
5. **Nunca quebrar o modo offline** ao alterar multiplayer — isole por `activeGameMode === 'online'`.

## Problemas conhecidos (backlog)

- Servidor PeerJS público instável (M01) — considerar servidor próprio na fase de multiplayer.
- Estado de conexão não visível na UI (A03/U01).
- Sem reconexão automática (M03).
- Handshake só troca char/color, não estado completo (M02).

## Anti-padrões proibidos

- Tornar o multiplayer dependência do loop offline.
- Enviar dados sem checar `p2pDataChannel && open` (já tratado em sendP2PData).
- Confiar em autoridade dupla (ambos aplicando dano).

## Referências

- `references/message-protocol.md` — detalhe dos fluxos.
- `references/connection-lifecycle.md` — ciclo de conexão e erros.
