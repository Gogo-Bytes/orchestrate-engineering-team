# Acceptance boundaries for the project toolkit

`pnpm verify` checks the one published preparation Skill, source CLI inventory and structural diagnostics, copied Skill fixture, Plugin metadata, and a packed CLI installed from a local tarball. It does not prove that an Agent will produce accurate project documentation.

The CLI reads only. `inspect` reports observed root and nested instructions, Skills, documents, manifests, and validation command candidates; `check` reports missing root instructions, bad Skill metadata, duplicate Skill names or root instruction content, broken local links, and missing project Skill paths. It does not evaluate architecture claims, document authority, test quality, or product behavior.

Manual behavior evals run in disposable repositories with independent judging. A passing case is local evidence for its scenario and model, not a guarantee for every project. Runner output is filtered before storage; runs live under ignored `evals/.runs/`. Record token and elapsed-time comparisons as diagnostics, not release gates until repeated results show a stable difference.

On 2026-10-08, all five current existing-project cases passed once with the authenticated Codex Runner and independent Judge: `bootstrap-existing` (100), `migrate-authority` (100), `skill-audit` (100), `site-readonly` (92), and `daily-direct` (100). The hard checks also passed: no out-of-scope business edits, no read-only writes, valid local structure where applicable, and a passing ordinary bug-fix test. The website case uses a small synthetic read-only fixture to test evidence discipline. New-project initialization remains a target in the [product direction](../docs/product-direction.md), not an observed result here.

After disabling implicit invocation, `bootstrap-existing` and `daily-direct` were rerun on 2026-10-08; both passed their hard checks and independent Judge with scores of 100. The explicit adoption run read the installed preparation Skill. The ordinary bug-fix run did not read it, and the Codex prompt-input preflight did not expose it to an ordinary prompt. Separate disposable project-level and global installations each allowed an actual explicit `$prepare-engineering-project` Codex run. These observations cover the tested Codex host; another host must honor an equivalent invocation policy before claiming the same guarantee.

No npm publication workflow or real remote installation check ships. The CLI remains source-only. The Codex Plugin lifecycle check is restricted to a disposable CI runner.

## Matched ordinary-development comparison

The same `daily-direct` slug bug fixture and task text were run once with the new project's ordinary `AGENTS.md` route and once with the former public `orchestrate-engineering-team` Skill explicitly invoked from commit `99e5438fc8b2ca5c51e9311abde2e7e9c4028991` in a disposable checkout. The Skill wrapper therefore differed by design. Both changed only `src/slug.js` and passed the two behavior tests. Filtered command events show both executed six shell commands and read the same four project files: `AGENTS.md`, `package.json`, `src/slug.js`, and `test/slug.test.js`. The former run additionally loaded its Skill through the host; complete host-side reads are not observable.

| Route | Input | Cached input | Noncached input | Output | Candidate time | Result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| New ordinary route | 88,377 | 69,248 | 19,129 | 556 | 43.0 s | 2 tests pass; independent Judge 100/100 |
| Former Skill route | 100,692 | 91,776 | 8,916 | 609 | 24.3 s | 2 tests pass; no independent Judge in this matched run |

Token counts come from the Codex Runner's `turn.completed.usage`. Input includes cached input; noncached input is the difference. They exclude Judge usage. Candidate time is measured immediately before and after the `codex exec` process, including its tool calls but excluding fixture setup, preflight, and Judge time. The first pair ran at different times alongside other evaluation work, did not pin the model in the Runner invocation, and had different cache states. The new run's 43.0 seconds was not reproduced in the sequential comparison below.

To reduce those confounders, the same fixture and task were run four more times in `new → former → former → new` order, sequentially, with `--model gpt-6-sol`. The new route left the setup Skill available but did not invoke it; the former route explicitly invoked its old Skill. Every run changed only `src/slug.js` and passed both tests. This comparison did not run a Judge.

| Run | Route | Input | Cached input | Noncached input | Output | Candidate time | Shell commands |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | New | 81,872 | 72,960 | 8,912 | 610 | 24.3 s | 4 |
| 2 | Former | 131,258 | 119,424 | 11,834 | 859 | 25.2 s | 6 |
| 3 | Former | 109,061 | 82,688 | 26,373 | 1,022 | 25.2 s | 7 |
| 4 | New | 70,854 | 60,032 | 10,822 | 645 | 21.4 s | 4 |

The former route read its Skill in both repeated runs and performed more shell commands. The new route used less reported input in these four attempts and finished in 21.4–24.3 seconds versus 25.2 seconds for the former route. Four runs of one small task do not establish a general speed advantage. Cache and model-service variation remain, and the task does not exercise the old product's larger-team capabilities. Correctness and direct ordinary development are the release gates. Filtered records are under ignored `evals/.runs/` for this local run.
