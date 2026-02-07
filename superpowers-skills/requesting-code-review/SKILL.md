---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements. Core principle: Review early, review often.
---

> **⚠️ COMPATIBILITY WARNING**
>
> This skill requires **subagent** capabilities to function properly.
>
> **Requirements:**
> - Subagent dispatch: Ability to spawn and coordinate multiple AI agents
> - Parallel execution: Ability to run tasks concurrently
>
> **Compatible with:** Claude Code (with subagent support)
> **Not compatible with:** CLI that only supports basic skill invocation
>
> **Alternative:** See the README.md for compatible alternatives.
>
> ---

# Requesting Code Review (请求代码审查)

## Overview (概述)

Dispatch code-reviewer subagent to catch issues before they cascade.

**Core principle:** Review early, review often.

## When to Use (使用时机)

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

### 1. Get git SHAs
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

### 2. Dispatch Code Reviewer

Provide the following information:
- **WHAT_WAS_IMPLEMENTED** - What you just built
- **PLAN_OR_REQUIREMENTS** - What it should do
- **BASE_SHA** - Starting commit
- **HEAD_SHA** - Ending commit
- **DESCRIPTION** - Brief summary

### 3. Act on Feedback
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Example Workflow

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch code reviewer subagent]
  WHAT_WAS_IMPLEMENTED: Verification and repair functions for conversation index
  PLAN_OR_REQUIREMENTS: Task 2 from docs/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

### Subagent-Driven Development
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

### Executing Plans
- Review after each batch (3 tasks)
- Get feedback, apply, continue

### Ad-Hoc Development
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skip review for "simple" changes | Review ALL code before merge |
| Review only after all tasks | Review after EACH task/batch |
| Ignore Important issues | Fix before proceeding |
| Accept wrong feedback | Push back with technical reasoning |
| No git SHAs provided | Always provide BASE_SHA and HEAD_SHA |

## Quick Reference

| Situation | When to Review |
|-----------|----------------|
| Subagent-driven dev | After EACH task |
| Executing plans | After each batch (3 tasks) |
| Major feature | Before merge |
| Stuck | When needed (fresh perspective) |

## Related Skills

- **subagent-driven-development** - Uses this skill after each task
- **executing-plans** - Uses this skill after each batch
- **receiving-code-review** - How to handle review feedback

## The Bottom Line

**Review early, review often.**

Code review catches issues before they cascade. One review at the end is too late.
