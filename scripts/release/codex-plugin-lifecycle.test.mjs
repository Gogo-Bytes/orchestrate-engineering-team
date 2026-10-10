import assert from "node:assert/strict";
import test from "node:test";
import { assertDisposableCiRunner, assertDiscoveredPluginSkills } from "./codex-plugin-lifecycle.mjs";
test("lifecycle remains CI-only", () => { assert.throws(() => assertDisposableCiRunner({}), /disposable/); });
test("discovery accepts only the project-preparation Skill", () => { const home = "/tmp/codex-oet"; assert.doesNotThrow(() => assertDiscoveredPluginSkills({ data: [{ skills: [{ name: "orchestrate-engineering-team:prepare-engineering-project", path: `${home}/plugins/cache/x/SKILL.md`, enabled: true }], errors: [] }] }, home)); });
