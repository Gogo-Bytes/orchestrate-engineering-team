import assert from "node:assert/strict";
import test from "node:test";
import { checkCopiedPackage } from "./check-copied-package.mjs";
test("copied package contains the project-preparation Skill and CLI", async () => { assert.deepEqual(await checkCopiedPackage(), { skills: 1, packages: 1 }); });
