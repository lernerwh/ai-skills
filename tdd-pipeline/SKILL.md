---
name: tdd-pipeline
description: Full TDD-driven Android-to-HarmonyOS conversion pipeline. Orchestrates spec-enhancer and tdd-step-executor to automatically convert features one by one using test-driven development. Triggers when user wants to run full TDD conversion, start automated TDD pipeline, or mentions: TDD流水线, 自动TDD转换, run pipeline, tdd pipeline, 全流程TDD. Handles the complete workflow from spec generation to code implementation with tests.
argument-hint: <android-project-path> <harmonyos-project-path> [spec-dir-path]
allowed-tools: Agent, Read, Write, Edit, Glob, Grep, Bash, Skill
---

# TDD Pipeline

全流程 TDD 驱动的 Android 转 HarmonyOS 自动化编排器。

## Inputs

| Argument | Required | Description |
|----------|----------|-------------|
| `$ARGUMENTS[0]` | Yes | Android 项目路径（绝对路径） |
| `$ARGUMENTS[1]` | Yes | HarmonyOS 项目路径（绝对路径） |
| `$ARGUMENTS[2]` | No | Spec 文档目录路径（包含 FEATURE_MAP.md 和 PROJECT_ANALYSIS.md，默认在 Android 项目路径下查找） |

## Prerequisites

在开始之前，验证以下条件：

1. **Android 项目路径有效** — 检查路径存在且包含源码文件
2. **HarmonyOS 项目路径有效** — 检查路径存在且包含 `entry/` 目录
3. **Spec 文档存在** — FEATURE_MAP.md 和 PROJECT_ANALYSIS.md 必须存在
4. **测试目录可写** — `{harmonyos-project}/entry/src/test/ets/` 可创建

```bash
# 验证 Android 项目
ls "$ANDROID_PATH" && echo "Android project exists"

# 验证 HarmonyOS 项目
ls "$HMOS_PATH/entry/src/main/ets" && echo "HarmonyOS project structure valid"

# 验证 spec 文档
ls "$SPEC_DIR/FEATURE_MAP.md" && echo "FEATURE_MAP.md found"
ls "$SPEC_DIR/PROJECT_ANALYSIS.md" && echo "PROJECT_ANALYSIS.md found"

# 创建测试目录（如果不存在）
mkdir -p "$HMOS_PATH/entry/src/test/ets/steps"
```

---

## Pipeline Execution Flow

```
输入验证
    │
    ▼
┌──────────────────────┐
│ Phase 1: Spec 增强    │  调用 spec-enhancer
│ 生成 enhanced-spec.md │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Phase 2: 解析与排序   │  解析 enhanced-spec.md
│ 构建 step 执行计划    │  拓扑排序确定顺序
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Phase 3: 逐步执行     │  对每个 step 调用
│ TDD 循环              │  tdd-step-executor
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Phase 4: 报告生成     │  生成 pipeline 报告
│ tdd-pipeline-report   │
└──────────────────────┘
```

---

## Phase 1: Spec 增强

### 1.1 定位 spec 文档

```bash
# 如果用户提供了 spec 目录
SPEC_DIR="$ARGUMENTS[2]"

# 如果没有提供，在 Android 项目路径下查找
if [ -z "$SPEC_DIR" ]; then
  # 常见位置 1: transfer_results/{project}/.gitnexus/
  SPEC_DIR=$(find "$ARGUMENTS[0]/.." -name "FEATURE_MAP.md" -exec dirname {} \; | head -1)
fi

# 验证
FEATURE_MAP="$SPEC_DIR/FEATURE_MAP.md"
PROJECT_ANALYSIS="$SPEC_DIR/PROJECT_ANALYSIS.md"
```

### 1.2 调用 spec-enhancer

使用 Skill 工具调用 spec-enhancer 技能：

```
Skill: spec-enhancer
Arguments: "$FEATURE_MAP" "$PROJECT_ANALYSIS" "$ARGUMENTS[0]"
```

### 1.3 验证输出

确认 `enhanced-spec.md` 已生成在 spec 目录下。

---

## Phase 2: 解析与排序

### 2.1 读取 enhanced-spec.md

读取整个文件，解析出所有 step。

### 2.2 提取 step 信息

对每个 `## Step N:` 章节提取：
- step 编号
- step 名称
- 依赖列表（从"依赖"章节提取）

### 2.3 构建执行计划

根据依赖关系进行拓扑排序，生成执行顺序：

```javascript
// 伪代码：拓扑排序
steps = parseAllSteps(enhancedSpec)
order = topologicalSort(steps, dependencies)

// 输出执行计划
print("执行计划:")
for (i, step in order) {
  print(`  ${i+1}. Step ${step.number}: ${step.name}`)
}
```

---

## Phase 3: 逐步执行 TDD

### 3.1 执行循环

对排序后的每个 step，按顺序执行：

```
pipeline_state = {
  completed: [],
  failed: [],
  blocked: [],
  results: {}
}

for step in execution_order:
  │
  ├── 检查依赖是否都已完成
  │   如果依赖中有 failed 的 step → 标记为 blocked，跳过
  │
  ├── 调用 tdd-step-executor
  │   Skill: tdd-step-executor
  │   Arguments: "$ENHANCED_SPEC" "$step.number" "$HMOS_PATH"
  │
  ├── 收集执行结果
  │   记录: step 编号、状态、测试通过数、失败数
  │
  └── 更新 pipeline_state
      如果 PASSED → completed.append(step)
      如果 PARTIAL → completed.append(step)（部分通过也算完成）
      如果 FAILED → failed.append(step)
```

### 3.2 断点续跑支持

每次完成一个 step 后，将 pipeline 状态写入文件：

```bash
# 状态文件: {spec-dir}/tdd-pipeline-state.md
# 格式:
# Step 1: completed
# Step 2: completed
# Step 3: failed
# Step 4: pending
```

如果 pipeline 中途中断，重新运行时读取状态文件，跳过已完成的 step。

### 3.3 错误处理

| 情况 | 处理 |
|------|------|
| 单个 step 失败 | 记录失败，继续执行不依赖它的后续 step |
| 依赖 step 失败 | 标记为 blocked，跳过 |
| 环境错误（SDK/构建） | 停止 pipeline，输出错误信息 |
| 所有 step 都失败 | 停止 pipeline，建议检查环境 |

---

## Phase 4: 报告生成

### 4.1 生成 tdd-pipeline-report.md

输出到 spec 目录下，格式如下：

```markdown
# TDD Pipeline 报告

**项目**: {项目名称}
**执行时间**: {日期}
**HarmonyOS 项目路径**: {路径}

## 概览

| 指标 | 值 |
|------|-----|
| 总 Step 数 | {total} |
| 通过 | {passed} |
| 部分通过 | {partial} |
| 失败 | {failed} |
| 跳过(blocked) | {blocked} |

## Step 详细结果

### Step 1: {名称} — 通过
- **测试文件**: `entry/src/test/ets/steps/step1_{name}/`
- **实现文件**: `entry/src/main/ets/{path}/`
- **测试结果**: {n}/{m} passed
- **耗时**: {t}s

### Step 2: {名称} — 失败
- **测试文件**: `entry/src/test/ets/steps/step2_{name}/`
- **失败原因**: {具体描述}
- **重试次数**: 3
- **建议修复**: {具体建议}

### Step 3: {名称} — 跳过
- **跳过原因**: 依赖 Step 2（已失败）

## 生成的文件清单

### 测试文件
- `entry/src/test/ets/steps/step1_xxx/Xxx.test.ets`
- `entry/src/test/ets/steps/step2_xxx/Xxx.test.ets`
- `entry/src/test/ets/List.test.ets`

### 实现文件
- `entry/src/main/ets/models/Xxx.ets`
- `entry/src/main/ets/utils/Xxx.ets`

## 修复建议

{针对每个失败 step 的具体修复建议}
```

---

## Output Summary

Pipeline 执行完成后，向用户报告：

1. **执行摘要** — 总 step 数、通过/失败/跳过
2. **文件位置** — enhanced-spec.md、pipeline-report.md、HarmonyOS 项目
3. **测试覆盖率** — 已实现的功能点数 / 总功能点数
4. **下一步建议** — 如果有失败的 step，给出具体修复建议

---

## Error Handling

| 错误 | 处理 |
|------|------|
| Android 项目路径无效 | Phase 0 即报错退出 |
| HarmonyOS 项目结构不正确 | Phase 0 即报错退出 |
| Spec 文档不存在 | Phase 0 即报错退出，建议先运行 android2hmos_android-project-analysis |
| spec-enhancer 执行失败 | 停止 pipeline，输出 spec-enhancer 的错误信息 |
| enhanced-spec.md 无有效 step | 停止 pipeline，报告可能原因（如所有功能点都不可测试） |
| 所有 step 都被 blocked | 停止 pipeline，报告依赖分析结果 |
