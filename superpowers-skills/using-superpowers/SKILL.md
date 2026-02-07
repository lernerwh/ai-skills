---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills. Core principle: Invoke relevant or requested skills BEFORE any response or action, including clarifying questions. Even 1% chance a skill might apply means you should invoke the skill to check.
---

# Using Skills (使用 Superpowers)

## Overview (概述)

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

**In Claude Code:** Use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly. Never use the Read tool on skill files.

## When to Use (使用时机)

**ALWAYS at the start of:** Any conversation or task.

**The Rule:**
- Check for skills BEFORE responding
- Check for skills BEFORE asking clarifying questions
- Check for skills BEFORE taking any action
- Even 1% chance = invoke the skill

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, systematic-debugging) - these determine HOW to approach the task
2. **Implementation skills second** (test-driven-development, using-git-worktrees) - these guide execution

"Let's build X" → brainstorming first, then implementation skills.
"Fix this bug" → systematic-debugging first, then domain-specific skills.

## Skill Types

**Rigid** (TDD, systematic-debugging): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| "Simple question, no skill needed" | Check for skills first |
| "Let me ask clarifying questions first" | Skill check BEFORE questions |
| "I'll explore the codebase" | Skills tell you HOW to explore |
| "This doesn't need a skill" | If skill exists, use it |
| "I know this skill already" | Skills evolve, invoke to read current version |

## Quick Reference

| When | Action |
|------|--------|
| Starting conversation | Check for skills FIRST |
| User gives task | Invoke relevant skills BEFORE responding |
| Unsure if skill applies | Invoke it (1% chance = invoke) |
| Multiple skills apply | Process skills first, then implementation |

## The Bottom Line

**Invoke skills BEFORE any response or action.**

This is non-negotiable. Skills prevent wasted time and ensure quality.

If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
