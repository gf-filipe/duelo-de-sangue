# Connection Lifecycle — PeerJS

## Eventos

- peer.on('open', id): peer registrado no signaling; exibe código de sala.
- peer.on('connection', conn): host recebe conexão do guest.
- peer.on('error', err): log + toast. Tipos comuns: 'peer-unavailable' (código errado), 'network', 'server-error'.
- conn.on('open'): canal de dados pronto → handshake.
- conn.on('data'): mensagem.
- conn.on('close'): oponente desconectou.

## Encerramento

- exitToMainMenu → peerConnection.destroy(), p2pDataChannel=null, limpa timers.
- Hipótese H03: destroy pode não fechar conexões WebRTC pendentes imediatamente. Validar abrindo/fechando salas seguidas.

## Riscos

- Código de sala já em uso → peer-unavailable/server error. Considerar sufixo aleatório.
- NAT estrito: STUN pode falhar sem TURN. Servidor próprio (M01) pode incluir TURN.

## Melhorias planejadas (fase multiplayer)

- U01: indicador visual conectado/reconectando/desconectado.
- M03: reconexão automática + re-sync.
- M01: signaling server dedicado.
