import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "yaml";
import { checkProject } from "../../packages/cli/src/project.js";

const PUBLIC_SKILL = "prepare-engineering-project";

export const formatDiagnostic = (item) => `${item.file}:${item.line} [${item.code}] ${item.message}`;

export async function checkAgentProfiles(root) {
  const checked = await checkProject(root);
  const diagnostics = [...checked.diagnostics];
  const skillFiles = checked.inventory.skills.map((item) => item.file);
  const expected = `.agents/skills/${PUBLIC_SKILL}/SKILL.md`;
  if (skillFiles.length !== 1 || skillFiles[0] !== expected) diagnostics.push({
    code: "PUBLIC_SKILL_SET", severity: "error", file: ".agents/skills", line: 1,
    message: `distribution must contain only ${PUBLIC_SKILL}`, evidence: skillFiles.join(", ") || "none",
  });
  const metadataFile = `.agents/skills/${PUBLIC_SKILL}/agents/openai.yaml`;
  try {
    const parsed = parseDocument(await readFile(path.join(root, metadataFile), "utf8"), { strict: true, uniqueKeys: true });
    if (parsed.errors.length) throw parsed.errors[0];
    if (parsed.toJS()?.policy?.allow_implicit_invocation !== false) diagnostics.push({
      code: "IMPLICIT_SKILL_INVOCATION", severity: "error", file: metadataFile, line: 1,
      message: "preparation Skill must require explicit user invocation", evidence: "policy.allow_implicit_invocation must be false",
    });
  } catch (error) {
    diagnostics.push({ code: "INVALID_SKILL_AGENT_METADATA", severity: "error", file: metadataFile, line: 1,
      message: "Skill agent metadata is missing or invalid", evidence: error?.message ?? String(error) });
  }
  const manifest = JSON.parse(await readFile(path.join(root, ".codex-plugin/plugin.json"), "utf8"));
  if (manifest.skills !== "./.agents/skills/") diagnostics.push({
    code: "PLUGIN_SKILL_PATH", severity: "error", file: ".codex-plugin/plugin.json", line: 1,
    message: "Plugin must discover project Skills", evidence: String(manifest.skills),
  });
  return { ok: diagnostics.length === 0, diagnostics, summary: { skills: skillFiles.length } };
}
