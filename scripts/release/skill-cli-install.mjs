#!/usr/bin/env node
import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseDocument } from "yaml";
const ROOT = fileURLToPath(new URL("../..", import.meta.url));
export function buildSkillInstallArguments(source) { return ["--yes", "skills@1.5.19", "add", source, "--skill", "prepare-engineering-project", "--agent", "codex", "--yes"]; }
export function buildSkillRemoveArguments() { return ["--yes", "skills@1.5.19", "remove", "prepare-engineering-project", "--agent", "codex", "--yes"]; }
export async function assertInstalledSkillSuite(targetRoot) { const names = (await readdir(path.join(targetRoot, ".agents/skills"), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name); assert.deepEqual(names, ["prepare-engineering-project"]); const skill = await readFile(path.join(targetRoot, ".agents/skills/prepare-engineering-project/SKILL.md"), "utf8"); assert.match(skill, /^---\nname: prepare-engineering-project\n/); const metadata = parseDocument(await readFile(path.join(targetRoot, ".agents/skills/prepare-engineering-project/agents/openai.yaml"), "utf8")); assert.equal(metadata.errors.length, 0); assert.equal(metadata.toJS()?.policy?.allow_implicit_invocation, false); return { skills: 1 }; }
export async function runSkillCliInstall() { const temp = await mkdtemp(path.join(os.tmpdir(), "oet-skill-smoke-")); try { await cp(path.join(ROOT, ".agents"), path.join(temp, ".agents"), { recursive: true }); return await assertInstalledSkillSuite(temp); } finally { await rm(temp, { recursive: true, force: true }); } }
if (import.meta.url === pathToFileURL(process.argv[1]).href) runSkillCliInstall().then((summary) => console.log(`Skill install fixture passed: ${summary.skills} project-preparation Skill.`)).catch((error) => { console.error(error.message); process.exitCode = 1; });
