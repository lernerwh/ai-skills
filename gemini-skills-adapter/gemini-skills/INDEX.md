# Superpowers 技能索引

这是为 Gemini CLI 转换的 Superpowers 技能集。

## 使用方法

```bash
# 切换到某个技能
export GEMINI_SYSTEM_MD=/path/to/skill.md

# 或使用切换脚本
./switch-skill.sh brainstorming
```

## 技能列表

### brainstorming

**描述:** "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."

**文件:** `brainstorming.md`

### dispatching-parallel-agents

**描述:** Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies

**文件:** `dispatching-parallel-agents.md`

### executing-plans

**描述:** Use when you have a written implementation plan to execute in a separate session with review checkpoints

**文件:** `executing-plans.md`

### finishing-a-development-branch

**描述:** Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup

**文件:** `finishing-a-development-branch.md`

### receiving-code-review

**描述:** Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation

**文件:** `receiving-code-review.md`

### requesting-code-review

**描述:** Use when completing tasks, implementing major features, or before merging to verify work meets requirements

**文件:** `requesting-code-review.md`

### subagent-driven-development

**描述:** Use when executing implementation plans with independent tasks in the current session

**文件:** `subagent-driven-development.md`

### systematic-debugging

**描述:** Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes

**文件:** `systematic-debugging.md`

### test-driven-development

**描述:** Use when implementing any feature or bugfix, before writing implementation code

**文件:** `test-driven-development.md`

### using-git-worktrees

**描述:** Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification

**文件:** `using-git-worktrees.md`

### using-superpowers

**描述:** Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions

**文件:** `using-superpowers.md`

### verification-before-completion

**描述:** Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always

**文件:** `verification-before-completion.md`

### writing-plans

**描述:** Use when you have a spec or requirements for a multi-step task, before touching code

**文件:** `writing-plans.md`

### writing-skills

**描述:** Use when creating new skills, editing existing skills, or verifying skills work before deployment

**文件:** `writing-skills.md`

