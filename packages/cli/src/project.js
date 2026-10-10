import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "yaml";

const SKILL_ROOTS = [".agents/skills", ".codex/skills"];
const DOCUMENT_ROOTS = ["docs"];
const ROOT_DOCUMENTS = ["AGENTS.md", "ARCHITECTURE.md", "README.md"];
const INSTRUCTION_NAMES = new Set(["AGENTS.md", "CLAUDE.md"]);
const SKIP = new Set([".git", "node_modules", ".next", ".turbo", ".venv", ".cache", ".runs", "dist", "build", "out", "target", "coverage", "vendor", "fixture", "fixtures", "__fixtures__", ".agent-work"]);
const VALIDATION_SCRIPT = /^(test|lint|typecheck|type-check|check|verify|build)(:|$)/i;

async function optionalStat(file) {
  try { return await lstat(file); }
  catch (error) { if (error?.code === "ENOENT") return null; throw error; }
}

async function walkMarkdown(root, relative, result) {
  const directory = path.join(root, relative);
  if (!(await optionalStat(directory))?.isDirectory()) return;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.isSymbolicLink()) continue;
    const child = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) await walkMarkdown(root, child, result);
    else if (entry.isFile() && entry.name.endsWith(".md")) result.add(child);
  }
}

async function walkInstructions(root, relative, result) {
  const directory = path.join(root, relative);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.isSymbolicLink()) continue;
    const child = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) await walkInstructions(root, child, result);
    else if (entry.isFile() && INSTRUCTION_NAMES.has(entry.name)) result.add(child);
  }
}

function diagnostic(code, severity, file, line, message, evidence) {
  return { code, severity, file, line, message, evidence };
}

function contentLines(source) {
  let fenced = false;
  return source.split(/\r?\n/).map((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; return null; }
    return fenced ? null : { text: line, number: index + 1 };
  }).filter(Boolean);
}

function skillMetadata(source, file) {
  if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) return { error: "missing YAML frontmatter" };
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { error: "unclosed YAML frontmatter" };
  const document = parseDocument(match[1], { strict: true, uniqueKeys: true });
  if (document.errors.length) return { error: document.errors[0].message };
  const value = document.toJS();
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "frontmatter must be a mapping" };
  if (typeof value.name !== "string" || !value.name.trim()) return { error: "name must be a non-empty string" };
  if (typeof value.description !== "string" || !value.description.trim()) return { error: "description must be a non-empty string" };
  const folder = path.basename(path.dirname(file));
  if (value.name !== folder) return { error: `name '${value.name}' differs from folder '${folder}'` };
  return { name: value.name, description: value.description.trim() };
}

async function discoverSkills(root) {
  const skills = [];
  async function visit(relative) {
    if (!(await optionalStat(path.join(root, relative)))?.isDirectory()) return;
    for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
      if (entry.isSymbolicLink() || !entry.isDirectory() || SKIP.has(entry.name)) continue;
      const folder = path.posix.join(relative, entry.name);
      const file = path.posix.join(folder, "SKILL.md");
      if ((await optionalStat(path.join(root, file)))?.isFile()) skills.push({ file, ...skillMetadata(await readFile(path.join(root, file), "utf8"), file) });
      await visit(folder);
    }
  }
  for (const parent of SKILL_ROOTS) await visit(parent);
  return skills.sort((a, b) => a.file.localeCompare(b.file));
}

async function validationCandidates(root) {
  const manifests = [];
  const commands = [];
  for (const file of ["package.json", "Makefile", "pyproject.toml", "Cargo.toml", "go.mod", "pom.xml", "build.gradle", "build.gradle.kts"])
    if ((await optionalStat(path.join(root, file)))?.isFile()) manifests.push(file);
  if (manifests.includes("package.json")) {
    try {
      const manifest = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
      const declaredManager = /^(npm|pnpm|yarn|bun)@/.exec(manifest.packageManager ?? "")?.[1];
      const inferredManager = (await optionalStat(path.join(root, "pnpm-lock.yaml")))?.isFile() ? "pnpm"
        : (await optionalStat(path.join(root, "yarn.lock")))?.isFile() ? "yarn"
        : (await optionalStat(path.join(root, "bun.lock")))?.isFile() || (await optionalStat(path.join(root, "bun.lockb")))?.isFile() ? "bun" : "npm";
      const manager = declaredManager ?? inferredManager;
      for (const name of Object.keys(manifest.scripts ?? {}).filter((item) => VALIDATION_SCRIPT.test(item)).sort()) commands.push({ command: `${manager} run ${name}`, source: "package.json" });
    } catch { /* The project checker reports facts it can verify; package parsing belongs to the project toolchain. */ }
  }
  if (manifests.includes("Makefile")) {
    const source = await readFile(path.join(root, "Makefile"), "utf8");
    for (const match of source.matchAll(/^([A-Za-z][A-Za-z0-9_-]*):(?!=)/gm)) if (VALIDATION_SCRIPT.test(match[1])) commands.push({ command: `make ${match[1]}`, source: "Makefile" });
  }
  return { manifests, commands };
}

export async function inspectProject(root = process.cwd()) {
  const absoluteRoot = await realpath(path.resolve(root));
  if (!(await optionalStat(absoluteRoot))?.isDirectory()) throw new Error(`not a directory: ${root}`);
  const entrypoints = {};
  for (const file of ROOT_DOCUMENTS) entrypoints[file] = (await optionalStat(path.join(absoluteRoot, file)))?.isFile() === true;
  const documents = new Set();
  for (const file of ROOT_DOCUMENTS) if (entrypoints[file]) documents.add(file);
  for (const relative of DOCUMENT_ROOTS) await walkMarkdown(absoluteRoot, relative, documents);
  const instructions = new Set();
  await walkInstructions(absoluteRoot, "", instructions);
  for (const file of instructions) documents.add(file);
  const skills = await discoverSkills(absoluteRoot);
  for (const skill of skills) documents.add(skill.file);
  return {
    root: absoluteRoot,
    entrypoints,
    instructions: [...instructions].sort(),
    documents: [...documents].sort(),
    skills,
    validation: await validationCandidates(absoluteRoot),
  };
}

function linkTargets(line) {
  const targets = [];
  for (const match of line.matchAll(/!?\[[^\]]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+[^)]*)?\)/g)) targets.push(match[1]);
  const reference = line.match(/^\s*\[[^\]]+\]:\s*(<[^>]+>|\S+)/);
  if (reference) targets.push(reference[1]);
  return targets;
}

async function checkLink(root, file, line, raw) {
  const value = raw.replace(/^<|>$/g, "");
  if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(value)) return null;
  let target;
  try { target = decodeURIComponent(value.split(/[?#]/, 1)[0]); }
  catch { return diagnostic("INVALID_LINK", "error", file, line, "invalid URL encoding in local link", raw); }
  if (!target) return null;
  const absolute = path.resolve(root, path.dirname(file), target);
  if (!(absolute === root || absolute.startsWith(`${root}${path.sep}`))) return diagnostic("LINK_OUTSIDE_ROOT", "error", file, line, "local link leaves project root", raw);
  const stat = await optionalStat(absolute);
  if (!stat) return diagnostic("BROKEN_LINK", "error", file, line, "local link target does not exist", raw);
  let resolved;
  try { resolved = await realpath(absolute); }
  catch (error) {
    if (error?.code === "ENOENT") return diagnostic("BROKEN_LINK", "error", file, line, "local link target does not exist", raw);
    throw error;
  }
  if (!(resolved === root || resolved.startsWith(`${root}${path.sep}`))) return diagnostic("LINK_OUTSIDE_ROOT", "error", file, line, "local link resolves outside project root", raw);
  return null;
}

export async function checkProject(root = process.cwd()) {
  const inventory = await inspectProject(root);
  const diagnostics = [];
  if (!inventory.entrypoints["AGENTS.md"]) diagnostics.push(diagnostic("MISSING_AGENT_ENTRY", "error", "AGENTS.md", 1, "project has no root Agent entry", "AGENTS.md is absent"));
  if (inventory.instructions.includes("AGENTS.md") && inventory.instructions.includes("CLAUDE.md")) {
    const agents = (await readFile(path.join(inventory.root, "AGENTS.md"), "utf8")).trim();
    const claude = (await readFile(path.join(inventory.root, "CLAUDE.md"), "utf8")).trim();
    if (agents && agents === claude) diagnostics.push(diagnostic("DUPLICATE_INSTRUCTION_ENTRY", "warning", "CLAUDE.md", 1, "root Agent instructions duplicate AGENTS.md", "same content as AGENTS.md"));
  }
  const names = new Map();
  for (const skill of inventory.skills) {
    if (skill.error) diagnostics.push(diagnostic("INVALID_SKILL_METADATA", "error", skill.file, 1, skill.error, skill.file));
    else if (names.has(skill.name)) diagnostics.push(diagnostic("DUPLICATE_SKILL_NAME", "error", skill.file, 1, `Skill name '${skill.name}' is already used`, names.get(skill.name)));
    else names.set(skill.name, skill.file);
  }
  for (const file of inventory.documents) {
    const source = await readFile(path.join(inventory.root, file), "utf8");
    for (const line of contentLines(source)) {
      for (const target of linkTargets(line.text)) {
        const problem = await checkLink(inventory.root, file, line.number, target);
        if (problem) diagnostics.push(problem);
      }
      if (file === "AGENTS.md") for (const match of line.text.matchAll(/(?:\.agents|\.codex)\/skills\/[A-Za-z0-9._/-]+\/SKILL\.md/g)) {
        if (!(await optionalStat(path.join(inventory.root, match[0])))?.isFile()) diagnostics.push(diagnostic("MISSING_SKILL_REFERENCE", "error", file, line.number, "referenced project Skill does not exist", match[0]));
      }
    }
  }
  const unique = new Map();
  for (const item of diagnostics) unique.set(`${item.code}:${item.file}:${item.line}:${item.evidence}`, item);
  return { status: [...unique.values()].some((item) => item.severity === "error") ? "fail" : "pass", inventory, diagnostics: [...unique.values()] };
}
