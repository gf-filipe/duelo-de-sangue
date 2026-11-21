# Message Protocol — PeerJS

## Fluxo de conexão (host)

1. startHostRoom → initPeerJS(code) → peer.on('connection', conn) → setupDataChannelHandlers(conn)
2. conn.on('open') → envia handshake
3. Recebe handshake do convidado → P1 envia start_duel, setTimeout(launchDuelArena, 400)

## Fluxo de conexão (guest)

1. startJoinRoom → initPeerJS(null) → peer.on('open') → peer.connect(code) → setupDataChannelHandlers
2. conn.on('open') → envia handshake
3. Recebe start_duel → launchDuelArena

## Durante o duelo

- aim_sync: cada 40ms no máximo, role + angle.
- drum_state: ao mudar holding. Host atualiza forfeit timer.
- countdown: host inicia; guest recebe countdown_start(true). Cancel propaga.
- Tiros: triggerFireBullet → bullet_spawn (se localRole===shooter). Guest decrementa balas do atirador.
- Acertos: host aplica applyHitDamage + hit_confirm. Guest aplica no hit_confirm.
- Fim: ammo_result / forfeit_result vindos do host.

## Regras

- Toda mensagem é um objeto simples e serializável.
- sendP2PData ignora se canal fechado.
- Host é a única fonte de transições autoritativas de fase.
