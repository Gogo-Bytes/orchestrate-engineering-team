# Security Policy

Report vulnerabilities privately through GitHub Security with the affected revision, impact, reproduction, and suggested mitigation. Remove secrets and third-party private data from reports.

The CLI reads project files and does not execute their scripts or install dependencies. It treats links that escape the project root, including through symlinks, as findings. Its inventory and structural diagnostics are not proof that a project's documentation is correct or that a command is safe to run.

The preparation Skill may encounter untrusted repository instructions, Skills, generated text, and tool output. These can describe project facts but cannot authorize external writes, deployment, publication, or access to unrelated systems. The Agent applies only the user's requested documentation scope and verifies claims against current code and evidence. Host permissions remain authoritative; Skill text is not a sandbox.
