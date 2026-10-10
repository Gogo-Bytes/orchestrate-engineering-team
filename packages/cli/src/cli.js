import process from "node:process";
import { checkProject, inspectProject } from "./project.js";

export const EXIT = Object.freeze({ OK: 0, FINDINGS: 1, ERROR: 2, USAGE: 64 });

const USAGE = `Usage:
  oet project inspect [--root PATH] [--json]
  oet project check [--root PATH] [--json]
`;

function parseOptions(args) {
  let root = process.cwd();
  let json = false;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--json") json = true;
    else if (args[index] === "--root" && args[index + 1] && !args[index + 1].startsWith("--")) root = args[++index];
    else return null;
  }
  return { root, json };
}

function printHuman(command, result) {
  if (command === "inspect") {
    process.stdout.write(`Project: ${result.root}\n`);
    process.stdout.write(`Agent entry: ${result.entrypoints["AGENTS.md"] ? "present" : "missing"}\n`);
    process.stdout.write(`Architecture entry: ${result.entrypoints["ARCHITECTURE.md"] ? "present" : "missing"}\n`);
    process.stdout.write(`Skills: ${result.skills.map((item) => item.name ?? item.file).join(", ") || "none"}\n`);
    process.stdout.write(`Instruction files: ${result.instructions.length}\n`);
    process.stdout.write(`Documents: ${result.documents.length}\n`);
    process.stdout.write(`Validation candidates: ${result.validation.commands.map((item) => item.command).join(", ") || "none found"}\n`);
    return;
  }
  process.stdout.write(`Project check: ${result.status} (${result.diagnostics.length} diagnostics)\n`);
  for (const item of result.diagnostics) process.stdout.write(`${item.severity} ${item.code} ${item.file}:${item.line} ${item.message} [${item.evidence}]\n`);
}

export async function main(args = process.argv.slice(2)) {
  const [group, command, ...rest] = args;
  if ([undefined, "help", "--help", "-h"].includes(group)) { process.stdout.write(USAGE); return EXIT.OK; }
  if (group !== "project" || !["inspect", "check"].includes(command)) { process.stderr.write(USAGE); return EXIT.USAGE; }
  const options = parseOptions(rest);
  if (!options) { process.stderr.write(USAGE); return EXIT.USAGE; }
  try {
    const result = command === "inspect" ? await inspectProject(options.root) : await checkProject(options.root);
    if (options.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else printHuman(command, result);
    return command === "check" && result.status === "fail" ? EXIT.FINDINGS : EXIT.OK;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    return EXIT.ERROR;
  }
}
