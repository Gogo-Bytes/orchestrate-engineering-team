import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { discoverCases } from "./core.mjs";

const execFileAsync = promisify(execFile);
const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const CASES_ROOT = path.join(ROOT, "evals", "cases");
const EXPECTED_IDS = ["bootstrap-existing", "daily-direct", "migrate-authority", "site-readonly", "skill-audit"];

test("the project-preparation suite contains five valid, fully rubriced cases", async () => {
  const cases = await discoverCases(CASES_ROOT);
  assert.deepEqual(cases.map((item) => item.id), EXPECTED_IDS);
  for (const item of cases) for (const criterion of item.judge.criticalCriteria) assert.ok(item.rubric.includes(`\`${criterion}\``), `${item.id} rubric omits ${criterion}`);
});

test("only the follow-on development task bypasses the setup Skill", async () => {
  const cases = new Map((await discoverCases(CASES_ROOT)).map((item) => [item.id, item]));
  assert.equal(cases.get("daily-direct").phases[0].useSkill, false);
  assert.ok(cases.get("daily-direct").checks.some((item) => item.id === "setup-skill-not-loaded" && item.maxMatches === 0));
  assert.equal(cases.get("site-readonly").sandbox, "read-only");
  assert.equal(cases.get("skill-audit").sandbox, "read-only");
  assert.ok(cases.get("bootstrap-existing").checks.some((item) => item.type === "project-check"));
});

test("the daily bug fixture starts with a failing behavior test", async () => {
  const { NODE_TEST_CONTEXT: _testContext, ...env } = process.env;
  await assert.rejects(execFileAsync("node", ["--test"], { cwd: path.join(CASES_ROOT, "daily-direct", "fixture"), env, timeout: 30_000 }));
});
