# Engineering project preparation

This repository is an open-source project-preparation toolkit for individual developers and teams using AI coding agents and human engineers. The current source supports assessment and bounded documentation improvement for **existing repositories**. The target for the first public release also includes a separate new-project engineering-foundation path for Node/TypeScript and Python; that path is not implemented yet. The repository name `orchestrate-engineering-team` and the `oet` command remain development names.

The authoritative [product direction](docs/product-direction.md) and [implementation roadmap](docs/implementation-roadmap.md) are maintained in Chinese. They distinguish agreed targets from current capabilities and record open decisions before implementation.

The main installable deliverable is one Skill. A separate CLI is optional:

- [`prepare-engineering-project`](.agents/skills/prepare-engineering-project/SKILL.md) guides an Agent through a project assessment or a bounded migration of instruction and knowledge materials.
- [`oet project inspect/check`](packages/cli/README.md) inventories facts and checks links and Skill metadata without modifying the target project.

The preparation Skill is explicitly invoked by the user, whether installed globally or in a project. It is not selected automatically from an ordinary request. Ordinary development stays with the target project's `AGENTS.md`, code, tests, and relevant on-demand Skills. The setup Skill is not a daily workflow coordinator. The target product has no role dispatcher, Host Adapter, task database, or mandatory Review/Test phase.

| Starting point | Preparation input | Status |
| --- | --- | --- |
| Existing repository | Current code, tests, instructions, and documents | Assessment and bounded documentation improvement exist in the current source |
| New project without implementation | Goals, constraints, and intended technical choices | Node/TypeScript and Python engineering foundations are first-public-release targets, pending implementation and validation |

## Project material conventions

| Material | Purpose | Create or update when |
| --- | --- | --- |
| Root `AGENTS.md` | Short routing and project-specific hard boundaries | Agents need a reliable entry or existing instructions conflict |
| Current architecture document | Confirmed system boundaries and ownership | The facts are consequential and costly to rediscover |
| Module navigation | Business terms leading to real code owners | Code search alone does not make ownership clear |
| Project Skill | Reusable, project-specific method with a precise trigger | Ordinary instructions and existing Skills are insufficient |

These are roles for materials, not mandatory files or fixed directory names. Preserve the target project's useful conventions. Keep implementation facts in code, types, tests, schemas, and executable configuration; document the constraints and reasons those files cannot convey. Standardization means choosing one authoritative home for a rule and fixing its pointers. It does not require moving business code or generating empty documents.

## Install and invoke the Skill

To install the current preparation Skill into Codex from GitHub:

```bash
npx --yes skills add https://github.com/Gogo-Bytes/orchestrate-engineering-team --skill prepare-engineering-project --agent codex --yes
```

Invoke it explicitly with `$prepare-engineering-project` in the user request. For example: “Use `$prepare-engineering-project` to assess this existing repository without editing files,” or “Use `$prepare-engineering-project` to prepare this existing repository and show the documentation patch.” The same invocation rule applies to global and project installations. An ordinary development request must not start this setup workflow. The Skill folder is the user-facing installable unit; the source repository and CLI are not included in that installation.

The optional Codex Plugin manifest points to the same Skill directory when working from a clone. The current Skill still mentions the optional CLI; removing that runtime expectation is tracked in the [implementation roadmap](docs/implementation-roadmap.md).

## Optional CLI from this source checkout

Use Node.js 22 and pnpm 10.13.1. The CLI package is source-only; it is not published to npm and is not required to run the Skill.

```bash
pnpm install --frozen-lockfile
node packages/cli/bin/oet.js project inspect --root /path/to/project --json
node packages/cli/bin/oet.js project check --root /path/to/project --json
```

## Verification

```bash
pnpm verify
pnpm eval -- --list
```

`pnpm verify` checks Skill packaging, CLI behavior and read-only operation in fixtures, local link and metadata diagnostics, and the CLI tarball. The manual black-box eval harness runs real Agent scenarios in disposable repositories; it is separate from CI because outcomes and cost vary by model and host. Its evidence reports task correctness, read files, token usage, and elapsed time where the runner exposes them. See [evaluation guide](evals/README.md) and [acceptance evidence](evals/ACCEPTANCE.md).
