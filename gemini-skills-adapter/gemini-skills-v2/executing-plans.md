# Executing Plans (执行计划)

## Description / 描述
Use when you have a written implementation plan to execute in a separate session with review checkpoints

## Instructions / 指令


# Executing Plans

## Overview (概述)

Load plan, review critically, execute tasks in batches, report for review between batches.

**Core principle:** Batch execution with checkpoints for architect review.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

## The Process (流程)

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify any questions or concerns about the plan
3. If concerns: Raise them with your human partner before starting
4. If no concerns: Create TodoWrite and proceed

### Step 2: Execute Batch
**Default: First 3 tasks**

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

### Step 3: Report
When batch complete:
- Show what was implemented
- Show verification output
- Say: "Ready for feedback."

### Step 4: Continue
Based on feedback:
- Apply changes if needed
- Execute next batch
- Repeat until complete

### Step 5: Complete Development

After all tasks complete and verified:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use 切换到技能 finishing-a-development-branch.md (使用 gskill finishing-a-development-branch)
- Follow that skill to verify tests, present options, execute choice

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker mid-batch (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Between batches: just report and wait
- Stop when blocked, don't guess
- Never start implementation on main/master branch without explicit user consent

## Integration

**Required workflow skills:**
- **切换到技能 using-git-worktrees.md (使用 gskill using-git-worktrees)** - REQUIRED: Set up isolated workspace before starting
- **切换到技能 writing-plans.md (使用 gskill writing-plans)** - Creates the plan this skill executes
- **切换到技能 finishing-a-development-branch.md (使用 gskill finishing-a-development-branch)** - Complete development after all tasks


---

## 使用说明 / Usage Notes

### 技能触发 / When to Use
Use when you have a written implementation plan to execute in a separate session with review checkpoints

### 注意事项 / Important Notes
- Follow all instructions exactly / 严格遵循所有指令
- Code blocks and commands remain in English / 代码块和命令保持英文
- Technical terms are kept in original form / 技术术语保持原形式
- Skill references use gskill command / 技能引用使用 gskill 命令
