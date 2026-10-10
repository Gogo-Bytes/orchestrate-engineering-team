import assert from "node:assert/strict";
import test from "node:test";
import { buildSkillInstallArguments, buildSkillRemoveArguments, runSkillCliInstall } from "./skill-cli-install.mjs";
test("installer selects only the project-preparation Skill", () => { assert.ok(buildSkillInstallArguments("source").includes("prepare-engineering-project")); assert.equal(buildSkillRemoveArguments().filter((value) => value === "prepare-engineering-project").length, 1); });
test("installed fixture has the project-preparation Skill", async () => { assert.deepEqual(await runSkillCliInstall(), { skills: 1 }); });
