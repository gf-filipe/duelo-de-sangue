# Regression Checklist por subsistema

Marque antes de considerar uma tarefa concluída.

## Física / colisão
- [ ] Tiro reto na cabeça = headshot único (sem dano duplo)
- [ ] Tiro nas pernas = ajoelha, continua atirando
- [ ] Tiro no torso = sangramento contínuo (DoT) e knockback
- [ ] Tiro no braço = desarma e arma cai no chão
- [ ] Balas rápidas não atravessam o alvo (varredura por segmento)
- [ ] Impacto no chão gera ricochete; não colide acima da linha jogável

## Rendering
- [ ] Menu, holding, countdown, fire, result renderizam sem erro no console
- [ ] 4 personagens visíveis (sheriff sprite + 3 procedurais)
- [ ] Resize mantém proporções e mira correta
- [ ] Sangue/manchas, cabeças, armas caídas aparecem e somem corretamente

## Duel flow
- [ ] Contagem só inicia com ambos no tambor
- [ ] Soltar tambor cancela contagem
- [ ] Forfeit após 10s fora do tambor (online)
- [ ] Vitória por munição funciona
- [ ] Rematch reinicia round limpo (hp, balas, estados)

## UI
- [ ] Abas Online/CPU/Personagem/Ranking funcionam
- [ ] Picker de personagem e cor atualiza preview
- [ ] Ranking persiste em LocalStorage; limpar funciona
- [ ] Histórico mostra rounds

## Multiplayer (quando aplicável)
- [ ] Criar sala gera código; entrar conecta
- [ ] Handshake troca nome/char/cor
- [ ] Dano aplicado só pelo host (sem duplo)
- [ ] Desconexão não trava o jogo
