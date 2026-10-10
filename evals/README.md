# Manual project-preparation evaluation

The behavior harness copies `prepare-engineering-project` into disposable Git repositories, runs a candidate Agent, checks observable files and behavior, then asks an independent read-only Judge to score the filtered evidence. It is manual and separate from `pnpm verify`.

```bash
pnpm eval -- --list
pnpm eval -- --case bootstrap-existing
pnpm eval -- --case migrate-authority --case daily-direct
pnpm eval -- --repeat 3 --json
```

The five current cases cover a minimal existing-project adoption, consolidation of conflicting guidance, a read-only Skill audit, a synthetic website assessment, and an ordinary bug fix that does not invoke the setup Skill. `project-check` hard checks run the CLI's structural validator on the candidate workspace. The Judge evaluates semantic accuracy, scope, and evidence. A case passes only when all hard checks pass and its critical rubric criteria pass with a score of at least 80.

The Codex Runner checks that the Skill declares `policy.allow_implicit_invocation: false` and that an ordinary prompt does not expose it for implicit selection. The adoption cases invoke `$prepare-engineering-project` explicitly. The ordinary bug-fix case checks that the candidate never reads the setup Skill. New-project initialization is a [first-public-release target](../docs/product-direction.md); it is not covered by the current cases.

The Codex Runner requires an authenticated CLI. It inherits the user's configured model unless `--model` or `--judge-model` is supplied. A custom Runner module can provide `preflight()` and `run()`; the Fake Runner is used by unit tests. Candidate and Judge sessions are separate, and the Judge's repository does not contain the Skill under test.

Run evidence is saved under ignored `evals/.runs/`: filtered events, final messages, diff, checks, judge result, per-phase usage and duration, and a suite report. The report separates candidate input, cached input, noncached input, output, and elapsed time when the Runner exposes them; Judge usage is excluded. Filtered command events can show some file access, but they are not a complete file-read trace. Compare cost only for matched tasks in equivalent environments; correctness and absence of mandatory setup flow are the current release gates. A prior orchestration-case score is not a comparable baseline for project adoption.

No model run, individual score, or token count proves universal performance. Do not commit `.runs/`, retained workspaces, credentials, hidden reasoning, or complete environment variables.
