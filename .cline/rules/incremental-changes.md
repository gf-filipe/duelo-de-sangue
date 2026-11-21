# Regra: Política de Alterações Incrementais

## Ciclo obrigatório por tarefa
1. Receba **uma única tarefa** com escopo delimitado (do PLAN).
2. Investigue os arquivos relevantes ao escopo (não o repositório inteiro).
3. Implemente a menor alteração que resolve.
4. Execute as verificações pertinentes (skill `game-testing`) e gere os cenários de validação manual passo a passo com resultados esperados (skill `gameplay-validation`).
5. Apresente: arquivos alterados, decisões, resultados dos testes, cenários de validação manual e o que NÃO foi testado.
6. Ao concluir, prepare a mensagem de commit (skill `git-commit-guidelines`): revise o diff e o `git status`, **nunca** faça commit automaticamente e alerte se houver mudanças fora do escopo da task.
7. **Pare e aguarde aprovação** antes da próxima tarefa.

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
