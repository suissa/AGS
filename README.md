# AGS — Agentic GitHub System

**AGS** is a GitHub-native runtime for AI-agent-driven development. It automates GitHub Projects, Issues, PRs, Actions, Wiki, CTID tracking, Cognitive Provenance, Project Sync Rules, and multi-agent execution.

## Quick Start

```bash
npm install
npm run build

# Create a new AGS project (interactive or via flags)
npx tsx src/cli/index.ts project create --name "my-project" --owner "suissa" --repo "my-repo" --mode simple --dry-run

# Sync project with GitHub state
npx tsx src/cli/index.ts project sync --dry-run
```

## CLI Commands

### `ags project create`

Provisions a new AGS project:

- Prompts for project name, owner/repo, mode (`simple` or `allascode`)
- Validates `TASKS.md` if `TASKS_GENERATED=true`
- Creates GitHub Projects via GraphQL API
- Writes `.ags/config.json`
- Optionally enables TUI and Wiki

```bash
ags project create
ags project create --name "my-project" --owner "org" --repo "repo" --mode allascode --dry-run
```

### `ags project sync`

Syncs AGS project with current GitHub state:

- Loads `.ags/config.json` (fails clearly if missing)
- Starts internal Event Bus
- Loads CTID registry
- Reads GitHub Issues and Workflow Runs
- Applies Project Sync Rules Engine
- Processes CI/CD mappings
- Generates provenance reports (allascode mode)
- Updates Wiki if enabled
- Renders TUI if enabled

```bash
ags project sync
ags project sync --dry-run
```

## Modes

### `simple`

- 1 GitHub Project: `AGS - Execution`
- CTID basic tracking
- Issues/PR/Actions sync
- 4 sync rules

### `allascode`

- 5 GitHub Projects: Backlog, Execution, Bug Tracker, Cognitive, Security
- Full CTID registry
- Event Bus with JSONL persistence
- Multi-agent parallel execution (Builder, Critic, Tester, Unifier, Observer)
- Loop-Until-Done convergence engine
- Cognitive Provenance Reports
- CI/CD mapping engine
- Wiki snapshot generator
- Full TUI

## Architecture

```
src/
  cli/          # CLI entry point and commands
  config/       # Config schema, load, write
  core/         # AGS runtime core
  github/       # REST client (no Octokit)
  projects/     # GraphQL client, project provisioner
  ctid/         # Cognitive Trace ID system
  events/       # Internal Event Bus (EventEmitter)
  sync/         # Project Sync Rules Engine
  llm/          # LLM Plugin Layer (OpenAI, Anthropic, Local, Mock)
  tasks/        # TASKS.md validator and parser
  tui/          # Terminal UI
  provenance/   # Cognitive Provenance Reports
  convergence/  # Loop-Until-Done engine
  agents/       # Multi-agent scheduler and roles
  wiki/         # Wiki snapshot generator
  cicd/         # CI/CD mapping engine
```

## CTID — Cognitive Trace ID

Every agentic task gets a CTID that correlates:
- GitHub Issue
- Branch
- Commits
- PR
- Project item
- LLM reports
- Semantic traces
- Wiki snapshots

Format: `ctid_{repo_slug}_{issue_number}_{short_hash}`

Example: `ctid_auth_service_42_a91f33c9`

## Environment Variables

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | GitHub PAT (scopes: repo, project, workflow) |
| `GITHUB_OWNER` | GitHub user or organization |
| `GITHUB_REPO` | Repository name |
| `LLM_PROVIDER` | `openai` \| `anthropic` \| `local` \| `mock` |
| `OPENAI_API_KEY` | OpenAI-compatible API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `AGS_MODE` | `simple` \| `allascode` |
| `AGS_DRY_RUN` | `true` for no real GitHub calls |
| `AGS_TUI` | `true` to enable TUI |

## Development

```bash
npm install
npm run build       # TypeScript compile
npm test            # Run all tests (72 tests)
npm run typecheck   # Type check only
```

## Project Sync Rules

Rules map events to GitHub Project actions:

| Event | simple | allascode |
|---|---|---|
| `task.created` | add to Execution | add to Backlog |
| `branch.created` | — | Execution / In Progress |
| `pr.opened` | In Review | Execution / In Review |
| `ci.failed` | Blocked | Bug Tracker + Execution / Blocked |
| `llm.used` | — | Cognitive |
| `dependabot.alert` | — | Security |
| `pr.merged` | Done | Execution / Done |
| `task.converged` | — | Cognitive + Wiki snapshot |

## CI/CD Mapping

| CI Stage | Conclusion | AGS Event | Project Status |
|---|---|---|---|
| lint | failure | ci.failed | Blocked |
| test | failure | ci.failed | Bug Tracker |
| build | failure | ci.failed | Blocked |
| sonar | failure | ci.failed | Quality Issue |
| e2e | failure | ci.failed | Bug Tracker |
| docker | failure | ci.failed | Deployment Blocked |
| deploy | success | ci.success | Done/Released |
| dependabot | — | dependabot.alert | Security |
| snyk | failure | security.alert | Security |

## Why AGS?

Traditional GitHub workflows require manual triage, status updates, and correlation between issues, branches, PRs, and CI. AGS automates this by:

1. **CTID** — a global correlation ID that ties every artifact together
2. **Event Bus** — decoupled internal events that drive all automation
3. **Sync Rules Engine** — configurable rules that react to events
4. **Multi-Agent Execution** — parallel agents with independent critics and a unifier
5. **Loop-Until-Done** — iterates until convergence criteria are met
6. **Cognitive Provenance** — structured reports without raw chain-of-thought

## License

MIT
