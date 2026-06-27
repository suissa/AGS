# AGS Implementation Prompts

Este pacote contém prompts numerados para implementar o **AGS — Agentic GitHub System** em etapas atômicas.

## Ordem recomendada

| Arquivo | Implementação |
|---|---|
| 00.md | arquitetura base e bootstrap |
| 01.md | CLI `ags project create` / `ags project sync` |
| 02.md | GitHub REST API |
| 03.md | GitHub Projects v2 GraphQL |
| 04.md | CTID system |
| 05.md | Project Sync Rules Engine |
| 06.md | Event Bus interno |
| 07.md | LLM Plugin Layer |
| 08.md | TASKS_GENERATED validator |
| 09.md | TUI em tempo real |
| 10.md | Cognitive Provenance Report |
| 11.md | Loop-Until-Done |
| 12.md | Multi-Agent Parallel Execution |
| 13.md | Wiki Snapshot Generator |
| 14.md | CI/CD Mapping Engine |
| 15.md | integração end-to-end |

## Instrução de uso

Envie um arquivo por vez para a IA implementadora, começando por `00.md`.

A IA deve ler o prompt inteiro, implementar apenas o escopo daquele arquivo, criar testes, atualizar documentação, não avançar sem validação e registrar pendências explicitamente.
