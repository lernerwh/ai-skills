# Finishing A Development Branch

## Description / 描述
Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup

## Instructions / 指令


# Finishing a Development branch (分支)

## Overview

Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Verify tests → Present options → Execute choice → Clean up.

**Announce at start:** "I'm using the finishing-a-development-branch (分支) skill to complete this work."

## The Process

### Step 1: Verify Tests

**Before presenting options, verify tests pass:**

```bash
# Run project's test suite
npm test / cargo test / pytest / go test ./...
```

**If tests fail:**
```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge (合并)/PR until tests pass.
```

Stop. Don't proceed to Step 2.

**If tests pass:** Continue to Step 2.

### Step 2: Determine Base branch (分支)

```bash
# Try common base branches
git merge (合并)-base HEAD main 2>/dev/null || git merge (合并)-base HEAD master 2>/dev/null
```

Or ask: "This branch split from main - is that correct?"

### Step 3: Present Options

Present exactly these 4 options:

```
Implementation complete. What would you like to do?

1. merge (合并) back to <base-branch (分支)> locally
2. Push and create a Pull Request
3. Keep the branch (分支) as-is (I'll handle it later)
4. Discard this work

Which option?
```

**Don't add explanation** - keep options concise.

### Step 4: Execute Choice

#### Option 1: merge (合并) Locally

```bash
# Switch to base branch (分支)
git checkout <base-branch (分支)>

# Pull latest
git pull

# merge (合并) feature branch (分支)
git merge (合并) <feature-branch (分支)>

# Verify tests on merged result
<test command>

# If tests pass
git branch (分支) -d <feature-branch (分支)>
```

Then: Cleanup worktree (工作树) (Step 5)

#### Option 2: Push and Create PR

```bash
# Push branch (分支)
git push -u origin <feature-branch (分支)>

# Create PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

Then: Cleanup worktree (工作树) (Step 5)

#### Option 3: Keep As-Is

Report: "Keeping branch (分支) <name>. worktree (工作树) preserved at <path>."

**Don't cleanup worktree (工作树).**

#### Option 4: Discard

**Confirm first:**
```
This will permanently delete:
- branch (分支) <name>
- All commits: <commit (提交)-list>
- worktree (工作树) at <path>

Type 'discard' to confirm.
```

Wait for exact confirmation.

If confirmed:
```bash
git checkout <base-branch (分支)>
git branch (分支) -D <feature-branch (分支)>
```

Then: Cleanup worktree (工作树) (Step 5)

### Step 5: Cleanup worktree (工作树)

**For Options 1, 2, 4:**

Check if in worktree (工作树):
```bash
git worktree (工作树) list | grep $(git branch (分支) --show-current)
```

If yes:
```bash
git worktree (工作树) remove <worktree (工作树)-path>
```

**For Option 3:** Keep worktree (工作树).

## Quick Reference

| Option | merge (合并) | Push | Keep worktree (工作树) | Cleanup branch (分支) |
|--------|-------|------|---------------|----------------|
| 1. merge (合并) locally | ✓ | - | - | ✓ |
| 2. Create PR | - | ✓ | ✓ | - |
| 3. Keep as-is | - | - | ✓ | - |
| 4. Discard | - | - | - | ✓ (force) |

## Common Mistakes

**Skipping test verification**
- **Problem:** merge (合并) broken code, create failing PR
- **Fix:** Always verify tests before offering options

**Open-ended questions**
- **Problem:** "What should I do next?" → ambiguous
- **Fix:** Present exactly 4 structured options

**Automatic worktree (工作树) cleanup**
- **Problem:** Remove worktree (工作树) when might need it (Option 2, 3)
- **Fix:** Only cleanup for Options 1 and 4

**No confirmation for discard**
- **Problem:** Accidentally delete work
- **Fix:** Require typed "discard" confirmation

## RED (红 - 编写失败的测试) Flags

**Never:**
- Proceed with failing tests
- merge (合并) without verifying tests on result
- Delete work without confirmation
- Force-push without explicit request

**Always:**
- Verify tests before offering options
- Present exactly 4 options
- Get typed confirmation for Option 4
- Clean up worktree (工作树) for Options 1 & 4 only

## Integration

**Called by:**
- **subagent (子代理)-driven-development** (Step 7) - After all tasks complete
- **executing-plans (执行计划)** (Step 5) - After all batches complete

**Pairs with:**
- **using-git-worktrees (使用 Git 工作树)** - Cleans up worktree (工作树) created by that skill


## Important Notes / 重要说明
- Follow these instructions EXACTLY / 严格遵循这些指令
- Do not skip any steps / 不要跳过任何步骤
- If the workflow doesn't apply to the current task, state that clearly / 如果工作流程不适用，明确说明
