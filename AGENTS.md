# Repository agent instructions

## Do not use this repository's Skill on itself

When working in this repository, **do not invoke or follow `prepare-engineering-project` to plan, implement, test, or review changes to this repository**.

This prohibition also covers the former `orchestrate-engineering-team` Skill, its former role Skills, and any renamed, copied, installed, or compatibility form of them.

Do not create or maintain `.agent-work/` state for repository development or use this product's project-preparation workflow to govern its own modification.

Use the host agent's ordinary single-agent workflow and independent general-purpose review/testing tools instead. This product's scripts and Skill may be executed only as the **system under test** in disposable fixtures or explicit validation commands; executing them for tests does not authorize using them to coordinate the repository change itself.

This rule prevents the product under development from controlling or validating its own development process.

## GitHub 开发流程

涉及功能规划、问题反馈、开始/恢复开发、PR 或交付验收时，先读取 [github-workflow Skill](.agents/skills/github-workflow/SKILL.md)。当前 session 能修复并验证闭环的小问题直接处理；跨轮、延期、阻塞或后续验收任务才使用 Issue，大功能确认范围后再建 Issue；批量反馈先分类查重，同根因合并。

本仓库原有分支、提交、推送、验证和授权规则优先，Skill 不额外授予权限，也不解除上述禁止自用工程编排 Skill 的限制。未迁移任务保留现有进度入口；获准采用 Issue 的工程任务只在 Issue/已有 Projects 维护动态状态，设计契约留在文档。阶段完成、阻塞或范围变化时同步获准的 Issue/PR，未同步须报告；不自动迁移历史待办，合并不等于发布或人工验收。
