# Regra: Política de Alterações Incrementais

## Ciclo obrigatório por tarefa
1. Receba **uma única tarefa** com escopo delimitado (do PLAN).
2. Investigue os arquivos relevantes ao escopo (não o repositório inteiro).
3. Implemente a menor alteração que resolve.
4. Execute verificações pertinentes (skill `game-testing`, checklist de regressão).
5. Apresente: arquivos alterados, decisões, resultados dos testes, limitações.
6. **Pare e aguarde aprovação** antes da próxima tarefa.

## Regras
- **Uma tarefa por vez.** Não implemente o backlog inteiro de uma vez.
- **Não misture subsistemas** (gameplay + física + UI + arquitetura) numa só tarefa sem necessidade.
- **Não faça refatoração cosmética** (renomear, reformatar) sem valor funcional.
- **Não execute tarefas extras** não solicitadas.
- Ao mover código (extração de módulo): copie, não reescreva; preserve comportamento e nomes.
- Se um problema exigir decisão de produto/arquitetura grande: pare e apresente opções.

## Comunicação
- Resuma mudanças e resultados de forma objetiva.
- Informe claramente incertezas, hipóteses e o que NÃO foi testado.
