---
name: harmonyos-local-test
description: Use when running HarmonyOS/ArkTS local unit tests (hvigorw test, hypium), fixing "SDK component missing" or "Task test not found" errors, setting up CI/CD testing, or resolving DEVECO_SDK_HOME/HOS_SDK_HOME issues. Also use when user mentions: 本地测试, 本地单元测试, hvigorw test, hypium test, test_result.txt, .test目录, coverage report.
---

# HarmonyOS Local Unit Test

```
Usage: THIS FILE HAS BEEN VERIFIED ON REAL PROJECTS.
Every command, path, and error message has been tested against actual HarmonyOS projects.
```

## Related Skills

This skill works together with `harmonyos-local-test-writer`:
- **This skill**: Run tests and fix runtime issues (SDK errors, hvigorw commands, test execution)
- **harmonyos-local-test-writer**: Write test cases (create test files, mock dependencies, write assertions)

When test failures are caused by logic errors (wrong assertions, missing mocks), switch to `harmonyos-local-test-writer` to fix the test code. When failures are caused by environment issues (SDK mismatch, hvigorw errors), use this skill.

## Step 0: Auto-Detect Environment

**ALWAYS run this first.** Detect DevEco Studio installation, set required env vars, and check dependencies.

```bash
# ===== AUTO-DETECT SCRIPT (run in Git Bash) =====
cd /path/to/harmonyos-project

# 1) Find DevEco Studio installation root
find_deveco() {
  # Priority 1: Environment variable
  if [ -n "$DEVECO_SDK_HOME" ]; then
    # Derive DEVECO_ROOT from DEVECO_SDK_HOME (strip /sdk suffix)
    echo "${DEVECO_SDK_HOME%/sdk}"
    return
  fi

  # Priority 2: Search common Windows paths
  local candidates=(
    "/c/Program Files/Huawei/DevEco Studio"
    "/d/Program Files/Huawei/DevEco Studio"
    "/c/Huawei/DevEco Studio"
    "/d/DevEco Studio"
  )
  for p in "${candidates[@]}"; do
    if [ -f "$p/tools/hvigor/bin/hvigorw.js" ]; then
      echo "$p"
      return
    fi
  done

  # Priority 3: Search filesystem
  local found
  found=$(find "/c/Program Files" -name "hvigorw.js" -path "*/hvigor/*" 2>/dev/null | head -1)
  if [ -n "$found" ]; then
    # Extract root: .../tools/hvigor/bin/hvigorw.js → .../
    echo "${found%/tools/hvigor/bin/hvigorw.js}"
    return
  fi
}

DEVECO_ROOT=$(find_deveco)
if [ -z "$DEVECO_ROOT" ]; then
  echo "ERROR: DevEco Studio not found. Install from https://developer.huawei.com"
  exit 1
fi
echo "Found DevEco Studio: $DEVECO_ROOT"

# 2) Set required environment variables (for external terminals only)
export DEVECO_SDK_HOME="${DEVECO_ROOT}/sdk"

# macOS example (adjust paths accordingly):
# DEVECO_ROOT="/Applications/DevEco-Studio.app/Contents"
# export DEVECO_SDK_HOME="${DEVECO_ROOT}/sdk"

# 3) Set tool paths
NODE="${DEVECO_ROOT}/tools/node/node.exe"       # Windows
HVIGORW="${DEVECO_ROOT}/tools/hvigor/bin/hvigorw.js"  # Windows
OHPM="${DEVECO_ROOT}/tools/ohpm/bin/ohpm.bat"       # Windows

# macOS:
# NODE="${DEVECO_ROOT}/tools/node/bin/node"
# HVIGORW="${DEVECO_ROOT}/tools/hvigor/bin/hvigorw"
# OHPM="${DEVECO_ROOT}/tools/ohpm/bin/ohpm"

echo "Node:     $NODE"
echo "Hvigorw:  $HVIGORW"
echo "Ohpm:     $OHPM"
echo "SDK:      $DEVECO_SDK_HOME"

# 4) Check/install dependencies
if [ ! -d "oh_modules/@ohos/hypium" ]; then
  echo "Installing dependencies..."
  "$OHPM" install
fi
```

### macOS Differences

```bash
# macOS: DevEco Studio is typically at:
DEVECO_ROOT="/Applications/DevEco-Studio.app/Contents"

# Tool paths differ:
NODE="${DEVECO_ROOT}/tools/node/bin/node"
HVIGORW="${DEVECO_ROOT}/tools/hvigor/bin/hvigorw"
OHPM="${DEVECO_ROOT}/tools/ohpm/bin/ohpm"
```

## The Iron Law

```
DEVECO_SDK_HOME MUST point to the SDK that matches your hvigorw version.
DO NOT point it to a mismatched SDK path.
```

**Why:** hvigorw requires `DEVECO_SDK_HOME` to locate the SDK. If it's unset or points to a wrong path, you get `Configuration Error: Invalid value of 'DEVECO_SDK_HOME'` or `SDK component missing`. The key rule is: **hvigorw source and SDK source must match** (see "The Bottom Line" table below).

**In IDE Terminal:** DEVECO_SDK_HOME is auto-injected — no manual setup needed.
**In external terminal / CI:** You MUST set DEVECO_SDK_HOME explicitly. Use the auto-detect script above.

## Quick Reference

| Task | Command |
|------|---------|
| Run all tests | `"$NODE" "$HVIGORW" test -p module=entry@default --no-daemon` |
| Run specific suite | `"$NODE" "$HVIGORW" test -p module=entry@default -p scope=suiteName --no-daemon` |
| Run specific test | `"$NODE" "$HVIGORW" test -p module=entry@default -p scope=suiteName#testName --no-daemon` |
| Without coverage | `"$NODE" "$HVIGORW" test -p module=entry@default -p coverage=false --no-daemon` |

> `$NODE` and `$HVIGORW` are from the auto-detect script. On Windows in CMD.exe, use `node.exe` and `hvigorw.bat` directly.

## How to Run (Complete Workflow)

```bash
cd /path/to/harmonyos-project

# Step 0: Auto-detect (see "Step 0: Auto-Detect Environment" above)
# ... run the detect script to set DEVECO_ROOT, NODE, HVIGORW, OHPM, DEVECO_SDK_HOME

# Step 1: Install dependencies (if needed)
if [ ! -d "oh_modules/@ohos/hypium" ]; then
  "$OHPM" install
fi

# Step 2: Run tests
"$NODE" "$HVIGORW" test -p module=entry@default --no-daemon
```

### One-Liner (Windows, after auto-detect)

```bash
DEVECO_SDK_HOME="C:\\Program Files\\Huawei\\DevEco Studio\\sdk" \
  "/c/Program Files/Huawei/DevEco Studio/tools/node/node.exe" \
  "/c/Program Files/Huawei/DevEco Studio/tools/hvigor/bin/hvigorw.js" \
  test -p module=entry@default --no-daemon
```

## Output Locations

| Artifact | Path |
|----------|------|
| Test results | `entry/.test/default/intermediates/test/coverage_data/test_result.txt` |
| Coverage (HTML) | `entry/.test/default/outputs/test/reports/index.html` |

## Parsing Test Results

### test_result.txt Format

Each test result consists of 3 lines (class, test, result) followed by an optional summary line:

```
class=localUnitTest
test=assertContain
result=Success
---
class=StartupService
test=should return READY state when all dependencies are ready
result=Failure
Tests run: 341, Failure: 2, Error: 0, Pass: 339, Ignore: 0
```

### Field-by-Field Parsing

| Field | Meaning | Example |
|-------|---------|---------|
| `class` | Suite name (describe block name) | `StartupService` |
| `test` | Test case name (it block name) | `should return READY state...` |
| `result` | Test outcome: `Success` or `Failure` | `Success` |
| `Tests run` | Total number of tests executed | `341` |
| `Failure` | Count of failed tests | `2` |
| `Error` | Count of errored tests (runtime exceptions) | `0` |
| `Pass` | Count of passed tests | `339` |
| `Ignore` | Count of skipped tests (xit/xdescribe) | `0` |

### Extracting Failures

To find all failures from the result file:

```bash
# Extract failed test names
grep -B1 "result=Failure" entry/.test/default/intermediates/test/coverage_data/test_result.txt
```

A failure block looks like:
```
class=StartupService              <- Suite name
test=should verify call order      <- Test name
result=Failure                     <- Failed
```

### Reading Stack Traces

When a test fails, the output includes a stack trace after the `result=Failure` line:

```
class=StartupService
test=should verify call order
result=Failure
Error: Expected 1 but got 2
    at <anonymous> (entry/src/test/StartupService.test.ets:45:12)
    at Object.test [as it] (.../@ohos/hypium/...)
```

**Key information:**
- The **file path and line number** point to the exact assertion that failed
- The **Error message** describes what was expected vs what was received

### Summary Line Parsing

The last line of `test_result.txt` is a summary:
```
Tests run: 341, Failure: 2, Error: 0, Pass: 339, Ignore: 0
```

Quick verification: `Pass + Failure + Error + Ignore = Tests run`

## Incremental Testing Strategy

### Development Phase: Run Single Suite

When developing a specific feature, run only the relevant test suite for fast feedback:

```bash
# Run only StartupService tests during development
"$NODE" "$HVIGORW" test -p module=entry@default -p scope=StartupService --no-daemon

# Run a single test case within a suite
"$NODE" "$HVIGORW" test -p module=entry@default -p scope=StartupService#should\ return\ READY\ state --no-daemon
```

### Completion Phase: Run All Tests

Before committing, run all tests to verify no regressions:

```bash
"$NODE" "$HVIGORW" test -p module=entry@default --no-daemon
```

### Locating Failing Suite

When full test run has failures:

1. **Extract failed suite names** from test_result.txt:
```bash
grep -B1 "result=Failure" test_result.txt | grep "^class=" | sort -u
```

2. **Run only the failing suite** to confirm:
```bash
"$NODE" "$HVIGORW" test -p module=entry@default -p scope=FailingSuiteName --no-daemon
```

3. **Fix and re-run** just that suite until it passes, then run all tests again.

## Common Errors

| Error | Solution |
|-------|----------|
| `SDK component missing` | DEVECO_SDK_HOME mismatch — ensure hvigorw and SDK come from the same source (both IDE or both CLI tools) |
| `Invalid value of 'DEVECO_SDK_HOME'` | Run the auto-detect script in "Step 0" to set DEVECO_SDK_HOME correctly, or run tests inside IDE Terminal |
| `Failed to resolve OhmUrl for "@ohos/hypium"` | Run `ohpm install` in project root to install test dependencies |
| `Task 'test' not found` | Update command-line-tools to match IDE version |
| `spawn java ENOENT` | Install JDK 11+ and add to PATH |
| `oxc-resolver native binding failed` | Warning only, tests still run. Caused by missing native module in command-line-tools. |
| `hvigorw: command not found` | Use the auto-detect script to find the full path |

## Common Warnings (Safe to Ignore)

These warnings appear during test runs but do not affect test results:

| Warning | Meaning |
|---------|---------|
| `oxc-resolver native binding failed` | command-line-tools lacks Windows native resolver. Safe to ignore. |
| `media of 'xxx' does not have a base resource` | Image resources lack base variant (only density-specific versions exist). Safe to ignore. |
| `Cannot find module '@ohos/hvigor-arkts-resolver-win32-x64-msvc'` | Same as oxc-resolver warning. Safe to ignore. |

## Windows-Specific Notes

### Git Bash Path Format

In Git Bash, Windows paths use Unix-style format:
```bash
# Correct: Git Bash paths
"/c/Program Files/Huawei/DevEco Studio/tools/hvigor/bin/hvigorw.js"

# Incorrect: Windows native paths
"C:\Program Files\Huawei\DevEco Studio\tools\hvigor\bin\hvigorw.js"
```

### CMD.exe Format

For Windows Command Prompt (cmd.exe), use Windows-native paths:
```cmd
"C:\Program Files\Huawei\DevEco Studio\tools\node\node.exe" ^
  "C:\Program Files\Huawei\DevEco Studio\tools\hvigor\bin\hvigorw.js" ^
  test -p module=entry@default --no-daemon
```

### oxc-resolver Warning

The `oxc-resolver native binding failed` warning is **expected and harmless** on Windows when using command-line-tools. It indicates the native resolver module is not compiled for your platform, but tests run correctly using the JavaScript fallback.

### Line Endings

Test result files use platform-native line endings. On Windows, use appropriate parsing tools that handle `\r\n`.

## Debugging Test Isolation

### "Works Alone, Fails Together" Problem

When tests pass individually but fail when run together, the most common cause is **shared mutable state**.

### Common Causes

| Cause | Symptom | Fix |
|-------|---------|-----|
| **Singleton not reset** | Test A's state affects Test B | Add `Xxx.resetInstance()` in `afterEach` |
| **Shared mock state** | Mock from Suite A bleeds into Suite B | Re-create mocks in `beforeEach`, never in `beforeAll` |
| **Static variables** | Static class fields persist across suites | Reset static fields in `afterAll` |
| **Global order counter** | Counter not reset between suites | Reset in `beforeEach` of each suite |
| **File/system state** | Shared temp files or directories | Clean up in `afterAll` |

### Binary Search for Problem Suite

When full test run fails but you don't know which suite causes it:

1. **Comment out half the suites** in List.test.ets
2. **Run tests** - if they pass, the problem is in the commented half
3. **Restore the failing half, comment out the other half**
4. **Repeat** until you isolate the problematic suite
5. **Within the failing suite**, use `xit()` to disable tests one by one

### Shared State Checklist

Before investigating, verify each item:

- [ ] All singletons have `resetInstance()` in `afterEach`
- [ ] No `beforeAll` creates mutable state shared across suites
- [ ] No static fields in test helper classes accumulate state
- [ ] Global counters are reset in `beforeEach`
- [ ] Mock factory classes (MockRdbStoreFactory, etc.) have `reset()` in `afterEach`
- [ ] No test file imports modify module-level state on load

## Red Flags

- Setting `DEVECO_SDK_HOME` to a path that doesn't match your hvigorw source
- Using IDE's hvigorw with command-line-tools SDK (or vice versa)
- Assuming IDE Terminal = external terminal (IDE injects env vars)
- Running all tests when only one suite was changed
- Ignoring singleton reset patterns
- Running tests without first executing `ohpm install`

## The Bottom Line

**Use matching hvigorw + SDK + DEVECO_SDK_HOME. Don't mix.**

| hvigorw source | SDK source | DEVECO_SDK_HOME | Result |
|----------------|------------|-----------------|--------|
| DevEco Studio (auto-detect) | DevEco Studio (sdk/) | `{DEVECO_ROOT}/sdk` | Works |
| IDE Terminal | IDE (auto-injected) | Auto-injected | Works |
| command-line-tools | command-line-tools | command-line-tools SDK path | Works |
| IDE hvigorw | command-line-tools SDK | command-line-tools path | Fails |
| DevEco Studio (external) | IDE SDK | **unset** | Fails |
