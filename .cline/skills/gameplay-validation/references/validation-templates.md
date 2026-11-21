# Validation Templates — por tipo de alteração

Escolha o bloco correspondente e ADAPTE os passos para a alteração concreta. Nunca cole
templates inteiros de subsistemas não afetados.

## A. Alteração de combate / dano
Cenários mínimos:
- Normal: acerto em cada parte relevante (cabeça/tronco/pernas/braço) → efeito correto (headshot/morte, bleed DoT, ajoelhar, desarmar).
- Negativo: continua atirando após desarme/munição 0 → não dispara; aviso aparece.
- Extremo: dois tiros letais em sequência (bala em voo) → vencedor = primeiro kill letal; ambos caem visualmente.
- Regressão: HP nunca < 0; HUD atualiza; histórico registra a parte fatal.

## B. Alteração de física / colisão
- Normal: tiro reto acerta; tiro rasante acerta pernas; ricochete no rodapé.
- Negativo: tiro que passa longe não gera dano/falsa colisão.
- Extremo: tiro muito rápido não atravessa o alvo (sem tunneling); alvo ajoelhado (hitbox abaixada).
- Regressão: muzzle/hitbox alinhados à escala `min(screenW,screenH)/640`; sem erro no console.

## C. Alteração de fluxo de duelo (tambor/contagem/fogo/forfeit/ammo/rematch)
- Normal: ambos seguram tambor → contagem 3-2-1 → FOGO → tiros liberados.
- Negativo: soltar tambor na contagem → cancela e avisa.
- Extremo: ficar >10s fora do tambor (online) → W.O.; ambos sem munição → vitória por munição; empate.
- Regressão: revanche reseta hp/balas/estados; rodada incrementa no HUD/histórico.

## D. Alteração de UI (abas, picker, ranking, histórico, HUD)
- Normal: navegar todas as abas; selecionar personagem/cor (preview atualiza).
- Negativo: ranking vazio mostra placeholder; limpar ranking pede confirmação.
- Extremo: redimensionar janela; lista de histórico cheia (>5 rounds).
- Regressão: HUD reflete hp/munição/badges; toast some após duração.

## E. Alteração de personagens/sprites
- Normal: avatar aparece em pé na arena e no preview do menu; P2 espelhado.
- Negativo: sprite ausente → fallback procedural (sem crash).
- Extremo: resize; estados de dano (ajoelhado/decapitado/desarmado) mantêm coerência.
- Regressão: hitboxes alinhadas ao recorte visual.

## F. Alteração de multiplayer (baixa prioridade)
- Normal: criar sala + entrar (2 abas); handshake; duelo completo.
- Negativo: código inválido; desconectar no meio não trava.
- Extremo: latência alta; soltar tambor remoto.
- Regressão: host é autoridade de dano (guest não aplica dano duplo).
