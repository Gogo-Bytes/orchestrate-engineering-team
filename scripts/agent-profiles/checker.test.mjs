import assert from "node:assert/strict";
import { cp, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { checkAgentProfiles } from "./checker.mjs";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

test("distribution has the project-preparation Skill and valid project entrypoints", async () => {
  const result = await checkAgentProfiles(ROOT);
  assert.equal(result.ok, true, JSON.stringify(result.diagnostics));
  assert.equal(result.summary.skills, 1);
});

test("a second public Skill is rejected", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "oet-profile-"));
  try {
    await cp(path.join(ROOT, ".agents"), path.join(temporary, ".agents"), { recursive: true });
    await cp(path.join(ROOT, ".codex-plugin"), path.join(temporary, ".codex-plugin"), { recursive: true });
    await writeFile(path.join(temporary, "AGENTS.md"), "# Agent entry\n");
    const extra = path.join(temporary, ".agents/skills/extra");
    await mkdir(extra);
    await writeFile(path.join(extra, "SKILL.md"), "---\nname: extra\ndescription: Extra skill\n---\n");
    const result = await checkAgentProfiles(temporary);
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((item) => item.code === "PUBLIC_SKILL_SET"));
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test("implicit invocation is rejected in the distributed Skill", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "oet-profile-"));
  try {
    await cp(path.join(ROOT, ".agents"), path.join(temporary, ".agents"), { recursive: true });
    await cp(path.join(ROOT, ".codex-plugin"), path.join(temporary, ".codex-plugin"), { recursive: true });
    await writeFile(path.join(temporary, "AGENTS.md"), "# Agent entry\n");
    await writeFile(path.join(temporary, ".agents/skills/prepare-engineering-project/agents/openai.yaml"), "interface:\n  display_name: \"Prepare Engineering Project\"\npolicy:\n  allow_implicit_invocation: true\n");
    const result = await checkAgentProfiles(temporary);
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((item) => item.code === "IMPLICIT_SKILL_INVOCATION"));
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
