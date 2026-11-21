# Edge Cases — catálogo de casos extremos conhecidos

Considere os relevantes à alteração; não precisa testar todos sempre.

## Janela / render
- Redimensionar durante holding/countdown/fire → canvas reajusta, mira correta, sem erro.
- DPR alto (retina) → desenho nítido; manchas de sangue alinhadas.
- Aspect ratio muito wide/tall → escala `min(screenW,screenH)/640` coerente.

## Ciclo de vida / foco
- Aba fica inativa durante o duelo → ao voltar, `dt` clampado (0.05), sem salto de física.
- `window.blur` durante holding → solta o tambor (sem travar fase).
- Abrir/fechar salas repetidamente (online) → sem conexões fantasma.

## Entrada
- Mobile: touchmove/touchstart mirar e atirar; não rolar a página (preventDefault).
- Clicar repetidamente muito rápido → respeita munição; sem disparo fantasma.
- Cursor fora do canvas → mira não quebra.

## Estado de combate
- Tiro no braço do já desarmado → não recria arma duplicada.
- Morte simultânea → vencedor = primeiro kill letal.
- Sangramento (torso) reduzindo HP até 0 → morte por DoT tratada.
- Ajoelhar + receber headshot → transição de estado consistente.

## Persistência
- `localStorage` cheio/indisponível → ranking não quebra o jogo (tratar exceção).
- Ranking com >10 entradas → corte mantém top 10.

## Multiplayer (quando aplicável)
- Guest recebe hit_confirm ao já estar morto → não aplica dano incoerente.
- Canal P2P fechado → envio ignorado; jogo não trava.
