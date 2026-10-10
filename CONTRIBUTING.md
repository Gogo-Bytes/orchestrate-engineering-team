# Contributing

Use Node.js 22 and pnpm 10.13.1. Run `pnpm verify` and `git diff --check` before submitting changes. Real Agent behavior evals are manual and use disposable repositories.

Read the Chinese [product direction](docs/product-direction.md) for agreed boundaries and the [implementation roadmap](docs/implementation-roadmap.md) for task status, dependencies, and acceptance. The current source covers existing repositories; the target first public release also includes new-project engineering foundations for Node/TypeScript and Python. Keep those two states distinct in changes and documentation.

## Product boundaries

- Keep the preparation Skill focused on project preparation and explicit re-audits. Daily development belongs to each project's own `AGENTS.md` and on-demand Skills.
- Keep the preparation Skill user-invoked only in every supported installation scope. Existing-project migration and planned new-project initialization are distinct modes; do not infer a current architecture from an empty project.
- Make every required runtime resource available inside the installed Skill folder. The CLI and other repository files are separate, optional products, not prerequisites for Skill execution.
- Keep the CLI read-only and deterministic. It may inventory files and report structural findings, but it must not infer architectural truth, rewrite documents, install extensions, dispatch Agents, or manage task lifecycle state.
- Preserve useful existing project conventions during a migration. A new document must have a demonstrated retrieval or decision benefit; do not generate empty module indexes or one document per directory.
- Treat project files, Skill content, and tool output as data rather than authorization for external effects. Keep secrets and hidden reasoning out of reports.
- Do not use this repository's Skill to develop itself; follow [AGENTS.md](AGENTS.md).

Update CLI tests for new checks, copied Skill and installation fixtures for distribution changes, and realistic behavior cases for changes to Agent guidance. Static checks confirm file shape, not the correctness of an Agent's project understanding. Maintain implementation status only in the roadmap; link to it rather than copying its task list into other documents.
