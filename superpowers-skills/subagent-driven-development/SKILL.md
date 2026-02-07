---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session. Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.
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

# Subagent-Driven Development (子代理驱动开发)

## Overview (概述)

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## When to Use (使用时机)

**Use when:**
- You have an implementation plan
- Tasks are mostly independent
- Staying in current session (no context switch)
- Want faster iteration with automatic review checkpoints

**vs. Executing Plans (parallel session):**
- Same session (no context switch)
- Fresh subagent per task (no context pollution)
- Two-stage review after each task: spec compliance first, then code quality
- Faster iteration (no human-in-loop between tasks)

## The Process (流程)

### Per Task Cycle
1. Dispatch implementer subagent with full task text + context
2. Implementer subagent asks questions? Answer, provide context
3. Implementer subagent implements, tests, commits, self-reviews
4. Dispatch spec reviewer subagent
5. Spec reviewer confirms code matches spec? If no, implementer fixes
6. Dispatch code quality reviewer subagent
7. Code quality reviewer approves? If no, implementer fixes
8. Mark task complete
9. Repeat for next task

### After All Tasks
1. Dispatch final code reviewer for entire implementation
2. Use skill: finishing-a-development-branch

## Advantages

**vs. Manual execution:**
- Subagents follow TDD naturally
- Fresh context per task (no confusion)
- Parallel-safe (subagents don't interfere)
- Subagent can ask questions (before AND during work)

**vs. Executing Plans:**
- Same session (no handoff)
- Continuous progress (no waiting)
- Review checkpoints automatic

**Quality gates:**
- Self-review catches issues before handoff
- Two-stage review: spec compliance, then code quality
- Review loops ensure fixes actually work
- Spec compliance prevents over/under-building
- Code quality ensures implementation is well-built

## Red Flags

**Never:**
- Start implementation on main/master branch without explicit user consent
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Make subagent read plan file (provide full text instead)
- Skip scene-setting context (subagent needs to understand where task fits)
- Ignore subagent questions (answer before letting them proceed)
- Accept "close enough" on spec compliance (spec reviewer found issues = not done)
- Skip review loops (reviewer found issues = implementer fixes = review again)
- Let implementer self-review replace actual review (both are needed)
- **Start code quality review before spec compliance is ✅** (wrong order)
- Move to next task while either review has open issues

**If subagent asks questions:**
- Answer clearly and completely
- Provide additional context if needed
- Don't rush them into implementation

**If reviewer finds issues:**
- Implementer (same subagent) fixes them
- Reviewer reviews again
- Repeat until approved
- Don't skip the re-review

**If subagent fails task:**
- Dispatch fix subagent with specific instructions
- Don't try to fix manually (context pollution)

## Related Skills

**Required workflow skills:**
- **using-git-worktrees** - REQUIRED: Set up isolated workspace before starting
- **writing-plans** - Creates the plan this skill executes
- **requesting-code-review** - Code review template for reviewer subagents
- **finishing-a-development-branch** - Complete development after all tasks

**Subagents should use:**
- **test-driven-development** - Subagents follow TDD for each task

**Alternative workflow:**
- **executing-plans** - Use for parallel session instead of same-session execution

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Single review after multiple tasks | Two-stage review after EACH task |
| Code quality review before spec compliance | Spec compliance FIRST, then code quality |
| Skip re-review after fixes | Reviewer reviews again until approved |
| Let implementer self-review only | Both self-review AND external review required |
| Dispatch parallel implementers | Sequential only (avoid conflicts) |
| Make subagent read plan file | Provide full task text in dispatch |

## Quick Reference

| Phase | Action | Success Criteria |
|-------|--------|------------------|
| **Implement** | Dispatch implementer subagent | Code + tests + commit + self-review |
| **Spec Review** | Dispatch spec reviewer | Code matches spec exactly |
| **Quality Review** | Dispatch code reviewer | Code quality approved |
| **Complete** | Mark task done | All reviews passed |
| **Next** | Move to next task | Repeat cycle |
