---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code. Write comprehensive implementation plans assuming the engineer has zero context for the codebase.
---

# Writing Plans (编写计划)

## Overview (概述)

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.
【编写全面的实现计划，假设工程师对代码库零背景且品味存疑】

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** This should be run in a dedicated worktree (created by using-git-worktrees skill).

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

## When to Use (使用时机)

**Use when:**
- You have a spec or requirements
- Starting a multi-step implementation task
- Before writing any code

**Prerequisite:** Use skill: brainstorming to create the design first.

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill: executing-plans to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## Task Structure

```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
```

## Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- Reference relevant skills with skill: syntax
- DRY, YAGNI, TDD, frequent commits

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `docs/plans/<filename>.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?"**

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use skill: subagent-driven-development
- Stay in this session
- Fresh subagent per task + code review

**If Parallel Session chosen:**
- Guide them to open new session in worktree
- **REQUIRED SUB-SKILL:** New session uses skill: executing-plans

## Related Skills

- **brainstorming** - Create the design before writing the plan
- **using-git-worktrees** - Create isolated workspace before implementation
- **executing-plans** - Execute the plan in a separate session
- **subagent-driven-development** - Execute the plan in the current session

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| "Create file for validation" | Specify exact file path |
| "Add error handling" | Write complete error handling code |
| "Run tests" | Specify exact command with expected output |
| Vague task descriptions | Break into 2-5 minute steps |
| Missing commit steps | Add git commit after each task |

## Red Flags

**Never:**
- Write plans without exact file paths
- Skip expected outputs for commands
- Combine multiple actions into one step
- Make steps longer than 5 minutes
- Skip verification steps
- Forget commit instructions

**Always:**
- Exact file paths
- Complete code examples
- Exact commands
- Expected outputs
- 2-5 minute steps
- TDD cycle
- Frequent commits
