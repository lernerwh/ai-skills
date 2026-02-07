---
name: dispatching-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies. Core principle: Dispatch one agent per independent problem domain. Let them work concurrently.
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

# Dispatching Parallel Agents (分发并行任务)

## Overview (概述)

When you have multiple unrelated failures (different test files, different subsystems, different bugs), investigating them sequentially wastes time. Each investigation is independent and can happen in parallel.

**Core principle:** Dispatch one agent per independent problem domain. Let them work concurrently.

## When to Use (使用时机)

**Use when:**
- 3+ test files failing with different root causes
- Multiple subsystems broken independently
- Each problem can be understood without context from others
- No shared state between investigations
- Problems are unrelated (fixing one won't fix others)

**Don't use when:**
- Failures are related (fix one might fix others)
- Need to understand full system state
- Agents would interfere with each other
- Shared state or resources

## The Pattern

### 1. Identify Independent Domains

Group failures by what's broken:
- File A tests: Tool approval flow
- File B tests: Batch completion behavior
- File C tests: Abort functionality

Each domain is independent - fixing tool approval doesn't affect abort tests.

### 2. Create Focused Agent Tasks

Each agent gets:
- **Specific scope:** One test file or subsystem
- **Clear goal:** Make these tests pass
- **Constraints:** Don't change other code
- **Expected output:** Summary of what you found and fixed

### 3. Dispatch in Parallel

Create tasks for each independent domain:
- Agent 1 → Fix agent-tool-abort.test.ts
- Agent 2 → Fix batch-completion-behavior.test.ts
- Agent 3 → Fix tool-approval-race-conditions.test.ts

All three run concurrently.

### 4. Review and Integrate

When agents return:
- Read each summary
- Verify fixes don't conflict
- Run full test suite
- Integrate all changes

## Agent Prompt Structure

Good agent prompts are:
1. **Focused** - One clear problem domain
2. **Self-contained** - All context needed to understand the problem
3. **Specific about output** - What should the agent return?

```markdown
Fix the 3 failing tests in src/agents/agent-tool-abort.test.ts:

1. "should abort tool with partial output capture" - expects 'interrupted at' in message
2. "should handle mixed completed and aborted tools" - fast tool aborted instead of completed
3. "should properly track pendingToolCount" - expects 3 results but gets 0

These are timing/race condition issues. Your task:

1. Read the test file and understand what each test verifies
2. Identify root cause - timing issues or actual bugs?
3. Fix by:
   - Replacing arbitrary timeouts with event-based waiting
   - Fixing bugs in abort implementation if found
   - Adjusting test expectations if testing changed behavior

Do NOT just increase timeouts - find the real issue.

Return: Summary of what you found and what you fixed.
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Too broad: "Fix all the tests" | Specific: "Fix agent-tool-abort.test.ts" |
| No context: "Fix the race condition" | Paste error messages and test names |
| No constraints: Agent might refactor everything | "Do NOT change production code" or "Fix tests only" |
| Vague output: "Fix it" | "Return summary of root cause and changes" |

## Real Example

**Scenario:** 6 test failures across 3 files after major refactoring

**Failures:**
- agent-tool-abort.test.ts: 3 failures (timing issues)
- batch-completion-behavior.test.ts: 2 failures (tools not executing)
- tool-approval-race-conditions.test.ts: 1 failure (execution count = 0)

**Decision:** Independent domains - abort logic separate from batch completion separate from race conditions

**Dispatch:**
```
Agent 1 → Fix agent-tool-abort.test.ts
Agent 2 → Fix batch-completion-behavior.test.ts
Agent 3 → Fix tool-approval-race-conditions.test.ts
```

**Results:**
- Agent 1: Replaced timeouts with event-based waiting
- Agent 2: Fixed event structure bug (threadId in wrong place)
- Agent 3: Added wait for async tool execution to complete

**Integration:** All fixes independent, no conflicts, full suite green

**Time saved:** 3 problems solved in parallel vs sequentially

## Key Benefits

1. **Parallelization** - Multiple investigations happen simultaneously
2. **Focus** - Each agent has narrow scope, less context to track
3. **Independence** - Agents don't interfere with each other
4. **Speed** - 3 problems solved in time of 1

## Verification

After agents return:
1. **Review each summary** - Understand what changed
2. **Check for conflicts** - Did agents edit same code?
3. **Run full suite** - Verify all fixes work together
4. **Spot check** - Agents can make systematic errors

## Quick Reference

| Situation | Action |
|-----------|--------|
| Multiple unrelated failures | Dispatch parallel agents |
| Related failures | Investigate together |
| Shared state | Sequential agents |
| Independent domains | Parallel dispatch |

## Red Flags

**Never:**
- Dispatch parallel agents for related problems
- Let agents edit same files without coordination
- Use parallel dispatch for shared state issues
- Skip full test suite after integration

**Always:**
- Verify problems are independent first
- Give each agent focused scope
- Check for conflicts after agents return
- Run full test suite to verify integration

## Related Skills

- **systematic-debugging** - Use for investigating each independent problem
