import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/oet.js", import.meta.url));
const run = (args, cwd) => spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8" });

async function fixture(callback) {
  const root = await mkdtemp(path.join(os.tmpdir(), "oet-project-"));
  try { await callback(root); }
  finally { await rm(root, { recursive: true, force: true }); }
}

test("inspect inventories an existing project without writing files", async () => fixture(async (root) => {
  await writeFile(path.join(root, "package.json"), JSON.stringify({ packageManager: "pnpm@10.13.1", scripts: { test: "node --test", build: "tool build", dev: "tool dev" } }));
  await writeFile(path.join(root, "AGENTS.md"), "# Instructions\n");
  const before = await Promise.all(["package.json", "AGENTS.md"].map((file) => readFile(path.join(root, file), "utf8")));
  const result = run(["project", "inspect", "--root", root, "--json"], root);
  assert.equal(result.status, 0, result.stderr);
  const inventory = JSON.parse(result.stdout);
  assert.equal(inventory.entrypoints["AGENTS.md"], true);
  assert.deepEqual(inventory.validation.commands.map((item) => item.command), ["pnpm run build", "pnpm run test"]);
  assert.deepEqual(await Promise.all(["package.json", "AGENTS.md"].map((file) => readFile(path.join(root, file), "utf8"))), before);
}));

test("check reports missing entry, broken links, and bad Skill metadata with locations", async () => fixture(async (root) => {
  await mkdir(path.join(root, ".agents/skills/example"), { recursive: true });
  await writeFile(path.join(root, ".agents/skills/example/SKILL.md"), "---\nname: wrong\ndescription: Example\n---\n[missing](../../../missing.md)\n");
  const result = run(["project", "check", "--root", root, "--json"], root);
  assert.equal(result.status, 1, result.stderr);
  const checked = JSON.parse(result.stdout);
  assert.equal(checked.status, "fail");
  for (const code of ["MISSING_AGENT_ENTRY", "INVALID_SKILL_METADATA", "BROKEN_LINK"]) assert.ok(checked.diagnostics.some((item) => item.code === code), code);
  assert.ok(checked.diagnostics.every((item) => item.file && Number.isInteger(item.line) && item.evidence));
}));

test("check resolves relative links and detects duplicate Skill names", async () => fixture(async (root) => {
  await writeFile(path.join(root, "AGENTS.md"), "[architecture](ARCHITECTURE.md)\n");
  await writeFile(path.join(root, "ARCHITECTURE.md"), "# Current architecture\n");
  for (const parent of [".agents", ".codex"]) {
    const folder = path.join(root, parent, "skills/example");
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, "SKILL.md"), "---\nname: example\ndescription: Example\n---\n");
  }
  const result = run(["project", "check", "--json"], root);
  assert.equal(result.status, 1);
  assert.deepEqual(JSON.parse(result.stdout).diagnostics.map((item) => item.code), ["DUPLICATE_SKILL_NAME"]);
}));

test("inspect finds nested instructions and check identifies duplicate root entries", async () => fixture(async (root) => {
  await writeFile(path.join(root, "AGENTS.md"), "# Shared instructions\n");
  await writeFile(path.join(root, "CLAUDE.md"), "# Shared instructions\n");
  await mkdir(path.join(root, "src"));
  await writeFile(path.join(root, "src/AGENTS.md"), "# Module instructions\n");
  const inventory = JSON.parse(run(["project", "inspect", "--json"], root).stdout);
  assert.deepEqual(inventory.instructions, ["AGENTS.md", "CLAUDE.md", "src/AGENTS.md"]);
  const checked = JSON.parse(run(["project", "check", "--json"], root).stdout);
  assert.ok(checked.diagnostics.some((item) => item.code === "DUPLICATE_INSTRUCTION_ENTRY" && item.severity === "warning"));
}));

test("inspect and check include nested project Skills", async () => fixture(async (root) => {
  await writeFile(path.join(root, "AGENTS.md"), "# Instructions\n");
  await mkdir(path.join(root, ".agents/skills/pipeline/skills/internal"), { recursive: true });
  await writeFile(path.join(root, ".agents/skills/pipeline/skills/internal/SKILL.md"), "---\nname: wrong\ndescription: Internal method\n---\n");
  const checked = JSON.parse(run(["project", "check", "--json"], root).stdout);
  assert.ok(checked.inventory.skills.some((item) => item.file === ".agents/skills/pipeline/skills/internal/SKILL.md"));
  assert.ok(checked.diagnostics.some((item) => item.code === "INVALID_SKILL_METADATA" && item.file.endsWith("internal/SKILL.md")));
}));

test("check rejects links that escape through a symlink", async () => fixture(async (root) => {
  await writeFile(path.join(root, "AGENTS.md"), "[secret](outside.txt)\n");
  const outside = await mkdtemp(path.join(os.tmpdir(), "oet-outside-"));
  try {
    await writeFile(path.join(outside, "outside.txt"), "private\n");
    await symlink(path.join(outside, "outside.txt"), path.join(root, "outside.txt"));
    const result = run(["project", "check", "--json"], root);
    assert.equal(result.status, 1);
    assert.ok(JSON.parse(result.stdout).diagnostics.some((item) => item.code === "LINK_OUTSIDE_ROOT"));
  } finally { await rm(outside, { recursive: true, force: true }); }
}));

test("check reports a dangling symlink as a broken link", async () => fixture(async (root) => {
  await writeFile(path.join(root, "AGENTS.md"), "[missing](dangling.md)\n");
  await symlink("missing.md", path.join(root, "dangling.md"));
  const result = run(["project", "check", "--json"], root);
  assert.equal(result.status, 1, result.stderr);
  assert.ok(JSON.parse(result.stdout).diagnostics.some((item) => item.code === "BROKEN_LINK"));
}));

test("removed configuration and orchestration commands are unavailable", async () => fixture(async (root) => {
  for (const args of [["init"], ["doctor"], ["config", "show"]]) assert.equal(run(args, root).status, 64);
}));
