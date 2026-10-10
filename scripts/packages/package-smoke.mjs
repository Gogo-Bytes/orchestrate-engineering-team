#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  return result.stdout.trim();
}

const temp = await mkdtemp(path.join(os.tmpdir(), "oet-pack-"));
try {
  const output = run("pnpm", ["pack", "--pack-destination", temp], path.join(root, "packages/cli"));
  const name = output.split(/\r?\n/).find((line) => line.endsWith(".tgz"));
  assert.ok(name, "no CLI tarball");
  const tarball = path.isAbsolute(name) ? name : path.join(root, "packages/cli", name);
  run("npm", ["init", "--yes"], temp);
  run("npm", ["install", "--ignore-scripts", tarball], temp);
  const bin = path.join(temp, "node_modules/@orchestrate-engineering-team/cli/bin/oet.js");
  assert.match(run(process.execPath, [bin, "--help"], temp), /oet project inspect/);
  const list = run("tar", ["-tzf", tarball], temp);
  assert.doesNotMatch(list, /node_modules|\/test\//);
  const manifest = JSON.parse(await readFile(path.join(temp, "node_modules/@orchestrate-engineering-team/cli/package.json"), "utf8"));
  assert.equal(manifest.name, "@orchestrate-engineering-team/cli");
  console.log("Package tarball smoke passed for project CLI.");
} finally { await rm(temp, { recursive: true, force: true }); }
