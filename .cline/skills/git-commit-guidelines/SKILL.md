---
name: git-commit-guidelines
description: Padroniza mensagens de commit (Conventional Commits) e o procedimento de commit do Duelo de Sangue. Ative ao concluir uma task validada, para gerar a mensagem de commit pronta para copiar. NUNCA executa o commit automaticamente. Ative também ao revisar o diff/estado do Git antes de sugerir um commit.
---

# Git Commit Guidelines — Duelo de Sangue

Objetivo: mensagens de commit consistentes, curtas e em inglês, seguindo Conventional Commits.
Esta Skill **gera a mensagem** — o commit é feito pelo usuário. Nunca commite automaticamente.

## Antes de sugerir qualquer commit
Sempre, nesta ordem:
1. **Revisar o diff** da tarefa (`git --no-pager diff` e `git status --short`).
2. **Verificar o estado do Git** (branch, arquivos staged/untracked, mudanças não relacionadas).
3. **Alertar** se houver alterações não relacionadas à task no working tree antes de sugerir o commit.
4. Garantir que a mensagem representa **apenas as alterações daquela task**.

Nunca sugira um commit antes de revisar o diff e conferir o estado do Git.

## Formato
```
<type>(<scope>): <subject>

<optional body>
```
- **subject**: curto, objetivo, imperativo, **em inglês**, minúsculo, sem ponto final.
- Tamanho alvo do subject: ≤ 72 caracteres.
- Body opcional: só quando precisar explicar o "porquê"; quebre em linhas ≤ 100.

## Tipos
| Tipo | Uso |
|------|-----|
| `feat` | nova funcionalidade/mecânica |
| `fix` | correção de bug |
| `refactor` | reorganização sem mudar comportamento |
| `perf` | melhoria de performance |
| `test` | testes/harness |
| `docs` | documentação/skills/regras |
| `chore` | tarefas de manutenção/config |

## Escopos (use quando aplicável)
`combat`, `physics`, `multiplayer`, `ui`, `characters`, `rendering`, `audio`, `arch`,
`config`, `cline`.

## Regras
- **Uma mensagem por task.** Não agregue mudanças de tarefas diferentes.
- Se o diff incluir arquivos fora do escopo da task → **pare e alerte** antes de sugerir.
- Não inclua emoji na mensagem.
- Não faça `git add`/`git commit` automaticamente.
- Se a task não mudou comportamento (ex.: só docs/skills) → tipo `docs`/`chore`.

## Fluxo de saída ao concluir a task
1. Rodar `git status --short` e `git --no-pager diff --stat`.
2. Se houver mudanças não relacionadas → listar e pedir decisão antes do commit.
3. Caso contrário, apresentar a mensagem pronta para copiar (bloco de código).

## Referências
- `references/commit-examples.md` — exemplos baseados nas tasks reais do projeto.
- `references/scope-guide.md` — como escolher o escopo por arquivo/alteração.
