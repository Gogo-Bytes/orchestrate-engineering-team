# Repository agent instructions

## Do not use this repository's Skill on itself

When working in this repository, **do not invoke or follow `prepare-engineering-project` to plan, implement, test, or review changes to this repository**.

This prohibition also covers the former `orchestrate-engineering-team` Skill, its former role Skills, and any renamed, copied, installed, or compatibility form of them.

Do not create or maintain `.agent-work/` state for repository development or use this product's project-preparation workflow to govern its own modification.

Use the host agent's ordinary single-agent workflow and independent general-purpose review/testing tools instead. This product's scripts and Skill may be executed only as the **system under test** in disposable fixtures or explicit validation commands; executing them for tests does not authorize using them to coordinate the repository change itself.

This rule prevents the product under development from controlling or validating its own development process.
