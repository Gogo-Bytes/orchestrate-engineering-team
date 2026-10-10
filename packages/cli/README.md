# @orchestrate-engineering-team/cli

Read-only inventory and structural checks for existing software projects. The package is currently source-only; run it from this repository with Node.js 22:

```bash
node packages/cli/bin/oet.js project inspect --root /path/to/project --json
node packages/cli/bin/oet.js project check --root /path/to/project --json
```

`inspect` lists root and nested Agent instructions, architecture and documentation entrypoints, project Skills, common manifests, and validation command candidates from `package.json` or `Makefile`. Package script commands use the declared package manager or detected lockfile. It exits `0` after a successful inventory.

`check` validates the root Agent entry, project Skill frontmatter and duplicate names, duplicate root instruction content, local Markdown links, and Skill paths referenced from `AGENTS.md`. It exits `0` on pass, `1` for error findings, `2` for runtime errors, and `64` for invalid options. Every JSON diagnostic includes `code`, `severity`, `file`, `line`, `message`, and `evidence`; a duplicate instruction warning does not fail the check.

Both commands only read project files. Their output cannot establish architectural truth, decide which document is authoritative, or approve a code change. The setup Skill and project maintainer make those judgments using current repository evidence.
