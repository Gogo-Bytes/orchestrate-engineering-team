---
name: prepare-engineering-project
description: User-invoked preparation of an existing software repository for AI-assisted and human development through clear Agent entrypoints, current architecture knowledge, and project-specific Skills. Existing-project adoption, instruction migration, and Skill audits are supported; ordinary development does not use this Skill.
license: MIT
metadata:
  author: Gogo-Bytes
---

# Prepare an engineering project

Help a team make its existing repository easy to navigate, change, and verify. Use this Skill for a requested project adoption or assessment. Once prepared, ordinary development follows that project's `AGENTS.md` and applicable on-demand Skills; this setup Skill is not its daily coordinator.

Only run when the user explicitly invokes this Skill. First distinguish a repository with implementation from a new project without implementation. The first release supports existing repositories. For a new project, do not present proposed architecture as current fact or apply the migration procedure below; explain that new-project setup is a separate future mode and identify the project goals and technical choices needed to design it. Do not generate placeholder documents or a scaffold under this mode.

## Assess the current project

Run `oet project inspect --json` when the CLI is available. It inventories files and validation candidates; it cannot decide what the code means. Read the current user request, repository instructions, relevant code, manifests, tests, documentation, and existing Skills. Identify the current behavior owners and how a new contributor reaches them. Separate verified facts, conflicting claims, and decisions the repository cannot settle.

For an assessment-only request, report the evidence, gaps, and smallest useful changes. Do not edit the project.

## Adopt or migrate

When the user requests project changes, make a bounded, reviewable patch based on verified repository facts:

- Keep root `AGENTS.md` short: route genuinely different tasks, point to authoritative project material, and state only project-specific hard boundaries. Preserve existing user and repository constraints.
- Record confirmed current architecture and ownership in an existing architecture entrypoint, or create one when the facts are consequential and otherwise hard to recover. Mark proposals as proposals rather than established rules.
- Add module navigation only where business language does not reliably lead to the owning code. Link to real modules and verification evidence; avoid one document per directory.
- Put a reusable, project-specific method in an on-demand Skill only when ordinary instructions and existing Skills are insufficient. Give it a precise trigger and one clear responsibility.
- Choose one authoritative home for each rule. Update pointers and remove redundant copies within the authorized documentation scope. Preserve useful project terminology and history that explains a current constraint.

Do not reorganize business code to fit documentation. Do not invent module boundaries, test coverage, deployment rules, or user decisions. A working note or generated template is not evidence of current behavior.

## Assess existing Skills

For a Skill-strengthening request, inspect its trigger, scope, input facts, output evidence, overlap with other instructions, and conditional references. Return concrete findings and suggested edits with affected paths. The first release does not automatically rewrite existing Skills; a later explicit edit request can apply the reviewed suggestions.

## Check the result

Review the actual diff against the requested boundary. Run `oet project check --json` when available, fix structural findings, and run only other checks relevant to changed executable behavior. The CLI verifies links and metadata, not architectural truth. Report changed files, the verified facts each new claim rests on, unresolved conflicts, checks performed, and coverage gaps. No project needs a task database or mandatory multi-Agent workflow to use this setup.
