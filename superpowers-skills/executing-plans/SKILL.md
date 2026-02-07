---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints. Load plan, review critically, execute tasks in batches, report for review between batches.
---

# Executing Plans (执行计划)

## Overview (概述)

Load plan, review critically, execute tasks in batches, report for review between batches.

**Core principle:** Batch execution with checkpoints for architect review.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

## When to Use (使用时机)

**Use when:**
- You have a written implementation plan
- Want to execute in separate session (not same-session subagent-driven)
- Prefer batch execution with review checkpoints
- Plan has multiple independent tasks

**vs. Subagent-Driven Development:**
- Separate session (context isolation)
- Batch execution (3 tasks per batch)
- Human-in-loop between batches
- Review checkpoints at batch boundaries

## The Process (流程)

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify any questions or concerns about the plan
3. If concerns: Raise them with your human partner before starting
4. If no concerns: Create task tracking and proceed

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
- **REQUIRED SUB-SKILL:** Use skill: finishing-a-development-branch
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

## Quick Reference

| Step | Action | Batch Size |
|------|--------|------------|
| **1. Review** | Read plan, raise concerns | - |
| **2. Execute** | Follow steps exactly | 3 tasks |
| **3. Report** | Show results, wait for feedback | - |
| **4. Continue** | Apply feedback, next batch | - |
| **5. Complete** | Use finishing-a-development-branch | - |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skip critical review | Always review plan first |
| Execute all tasks at once | Batch in groups of 3, report between |
| Skip verifications | Run all verifications as specified |
| Don't report between batches | Always show results and wait |
- Continue with blockers | STOP and ask for clarification |
| Start on main/master | Never start without explicit consent |

## Red Flags

**Never:**
- Skip plan review
- Execute more than 3 tasks without reporting
- Skip verifications
- Proceed through blockers
- Start on main/master without permission
- Modify the plan yourself (ask partner instead)

**Always:**
- Review critically first
- Batch in groups of 3
- Report after each batch
- Wait for feedback
- Stop when blocked
- Follow plan steps exactly

## Related Skills

**Required workflow skills:**
- **using-git-worktrees** - REQUIRED: Set up isolated workspace before starting
- **writing-plans** - Creates the plan this skill executes
- **finishing-a-development-branch** - Complete development after all tasks

**Alternative workflow:**
- **subagent-driven-development** - Use for same-session execution instead of parallel session
