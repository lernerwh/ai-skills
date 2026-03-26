---
name: harmonyos-local-test
description: Use when running HarmonyOS/ArkTS local unit tests (hvigorw test, hypium), fixing "SDK component missing" or "Task test not found" errors, setting up CI/CD testing, or resolving DEVECO_SDK_HOME/HOS_SDK_HOME issues. Also use when user mentions: 本地测试, 本地单元测试, hvigorw test, hypium test, test_result.txt, .test目录, coverage report.
---

# HarmonyOS Local Unit Test

## The Iron Law

```
DO NOT SET DEVECO_SDK_HOME / HOS_SDK_HOME when running hvigorw test
```

**Why:** IDE Terminal injects these env vars → SDK version mismatch → "SDK component missing" error.

## Quick Reference

| Task | Command |
|------|---------|
| Run all tests | `$HVIGORW test -p module=entry@default --no-daemon` |
| Run specific suite | `$HVIGORW test -p module=entry@default -p scope=suiteName` |
| Run specific test | `$HVIGORW test -p module=entry@default -p scope=suiteName#testName` |
| Without coverage | `$HVIGORW test -p module=entry@default -p coverage=false` |

> `$HVIGORW` is the full path to hvigorw.bat (Windows) or hvigorw (Unix). See "How to Run" below.

## Find hvigorw Path

If `hvigorw` is not in PATH, check these locations:

```bash
# Windows - command-line-tools (recommended for CI)
"/c/Program Files/Tools/command-line-tools/bin/hvigorw.bat"

# Windows - DevEco Studio
"/c/Program Files/Huawei/DevEco Studio/tools/hvigor/bin/hvigorw.js"

# macOS
"/Applications/DevEco Studio.app/Contents/tools/hvigor/bin/hvigorw"
```

Auto-detect script (run this first if unsure):
```bash
# Find hvigorw.bat on Windows
find "/c/Program Files" -name "hvigorw.bat" 2>/dev/null | head -1
```

## How to Run

```bash
cd /path/to/harmonyos-project

# Option 1: command-line-tools (recommended for CI)
"/c/Program Files/Tools/command-line-tools/bin/hvigorw.bat" \
  test -p module=entry@default --no-daemon

# Option 2: DevEco Studio tools
"/c/Program Files/Huawei/DevEco Studio/tools/node/node.exe" \
  "/c/Program Files/Huawei/DevEco Studio/tools/hvigor/bin/hvigorw.js" \
  test -p module=entry@default --no-daemon
```

## Output Locations

| Artifact | Path |
|----------|------|
| Test results | `entry/.test/default/intermediates/test/coverage_data/test_result.txt` |
| Coverage (HTML) | `entry/.test/default/outputs/test/reports/index.html` |

**Result format:**
```
class=localUnitTest
test=assertContain
result=Success
Tests run: 1, Failure: 0, Error: 0, Pass: 1, Ignore: 0
```

## Common Errors

| Error | Solution |
|-------|----------|
| `SDK component missing` | Unset DEVECO_SDK_HOME, use matching hvigorw+SDK |
| `Task 'test' not found` | Update command-line-tools to match IDE version |
| `spawn java ENOENT` | Install JDK 11+ and add to PATH |
| `oxc-resolver native binding failed` | Warning only, tests still run. Caused by missing native module in command-line-tools. |
| `hvigorw: command not found` | Use full path to hvigorw.bat (see "Find hvigorw Path" above) |

## Common Warnings (Safe to Ignore)

These warnings appear during test runs but do not affect test results:

| Warning | Meaning |
|---------|---------|
| `oxc-resolver native binding failed` | command-line-tools lacks Windows native resolver. Safe to ignore. |
| `media of 'xxx' does not have a base resource` | Image resources lack base variant (only density-specific versions exist). Safe to ignore. |
| `Cannot find module '@ohos/hvigor-arkts-resolver-win32-x64-msvc'` | Same as oxc-resolver warning. Safe to ignore. |

## Red Flags

- Setting `DEVECO_SDK_HOME` before running tests
- Using IDE's hvigorw with command-line-tools SDK (or vice versa)
- Assuming IDE Terminal = external terminal (IDE injects env vars)

## The Bottom Line

**Use matching hvigorw + SDK. Don't mix.**

| hvigorw source | SDK source | Result |
|----------------|------------|--------|
| command-line-tools | command-line-tools | ✅ Works |
| IDE | IDE | ✅ Works |
| IDE | command-line-tools | ❌ Fails |
| command-line-tools | IDE | ❌ Fails |
