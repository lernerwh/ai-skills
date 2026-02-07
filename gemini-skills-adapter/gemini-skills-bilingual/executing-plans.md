# Executing Plans

## Description / 描述
Use when you have a written implementation plan to execute in a separate session with review checkpoints

## Instructions / 指令


# Executing Plans

## Overview

Load plan, review critically, execute tasks in batches, report for review between batches.

**Core principle:** Batch execution with checkpoints for architect review.

**Announce at start:** "I'm using the executing-plans (执行计划) skill to implement this plan."

## The Process

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
- Announce: "I'm using the finishing-a-development-branch (分支) skill to complete this work."
- **REQUIRED SUB-SKILL:** Use superpowers:finishing-a-development-branch (分支)
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
- Never start implementation on main/master branch (分支) without explicit user consent

## Integration

**Required workflow skills:**
- **superpowers:using-git-worktrees (使用 Git 工作树)** - REQUIRED: Set up isolated workspace before starting
- **superpowers:writing-plans (编写计划)** - Creates the plan this skill executes
- **superpowers:finishing-a-development-branch (分支)** - Complete development after all tasks


## Important Notes / 重要说明
- Follow these instructions EXACTLY / 严格遵循这些指令
- Do not skip any steps / 不要跳过任何步骤
- If the workflow doesn't apply to the current task, state that clearly / 如果工作流程不适用，明确说明
