---
name: tdd-step-executor
description: Execute a single TDD cycle (RED-GREEN-VERIFY-FIX) for one feature step in Android-to-HarmonyOS conversion. Triggers when user wants to implement a specific step from an enhanced spec, run TDD for a feature point, or mentions: 执行step, TDD循环, 实现功能点, run step, execute step. Takes an enhanced spec step section and runs the full test-first development cycle.
argument-hint: <enhanced-spec-path> <step-number> <harmonyos-project-path>
allowed-tools: Agent, Read, Write, Edit, Glob, Grep, Bash, Skill
---

# TDD Step Executor

对单个功能点 step 执行完整的 TDD 循环（RED → GREEN → VERIFY → FIX）。

## Inputs

| Argument | Required | Description |
|----------|----------|-------------|
| `$ARGUMENTS[0]` | Yes | Enhanced spec 文件路径 |
| `$ARGUMENTS[1]` | Yes | 要执行的 step 编号（如 1, 2, 3...） |
| `$ARGUMENTS[2]` | Yes | HarmonyOS 项目路径 |

## Execution Flow

```
enhanced-spec.md (单个 step)
        │
        ▼
┌─────────────────────┐
│ Phase 1: RED        │  调用 harmonyos-local-test-writer
│ 写测试（被测代码     │  根据测试用例描述生成 .test.ets
│ 尚不存在）           │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│ Phase 2: GREEN      │  参考增强 spec + Android 源码
│ 写最小实现代码       │  编写使测试通过的最小代码
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│ Phase 3: VERIFY     │  调用 harmonyos-local-test
│ 运行测试             │  收集测试结果
└─────────┬───────────┘
          ▼
     测试通过？
    /        \
  是          否
  │            │
  ▼            ▼
完成        ┌─────────────────────┐
            │ Phase 4: FIX        │
            │ 分析失败 → 修复代码  │
            │ → 重新运行测试      │
            │ 最多重试 3 次       │
            └─────────────────────┘
```

---

## Phase 1: RED — 写测试

### 1.1 解析 step spec

从 enhanced-spec.md 中提取目标 step 的内容：

```bash
# 读取 enhanced-spec.md
# 查找 "## Step {n}:" 开头的章节
# 提取该章节的全部内容直到下一个 "## Step" 或文件结尾
```

需要提取的信息：
- step 名称
- 源文件映射（Android 源文件 → HarmonyOS 目标文件）
- 逻辑层可测试单元表（函数名、输入、预期输出、测试类型）
- 验收标准

### 1.2 生成测试文件

调用 `harmonyos-local-test-writer` 技能，传入以下上下文：

**输入给 test-writer 的信息：**
- 被测函数签名（从"逻辑层可测试单元"表推导）
- 每个测试用例的描述、输入、预期输出
- 目标文件路径：`{harmonyos-project}/entry/src/test/ets/steps/step{n}_{name}/{ClassName}.test.ets`

**测试文件示例**（以 Step "基础数据模型" 为例）：

```typescript
import { describe, it, expect, beforeEach } from '@ohos/hypium';
import { Medium } from '../../../../main/ets/models/Medium';
import { Directory } from '../../../../main/ets/models/Directory';

export default function mediumTest() {
  describe('Medium', () => {
    it('should create instance with valid parameters', 0, () => {
      const medium = new Medium('file:///photo.jpg', 'photo.jpg', 'image/jpeg', 1024, 1920, 1080);
      expect(medium.path).assertEqual('file:///photo.jpg');
      expect(medium.name).assertEqual('photo.jpg');
      expect(medium.type).assertEqual('image/jpeg');
    });

    it('should identify image types correctly', 0, () => {
      const image = new Medium('file:///photo.jpg', 'photo.jpg', 'image/jpeg', 1024);
      expect(image.isImage()).assertTrue();
    });

    it('should identify video types correctly', 0, () => {
      const video = new Medium('file:///video.mp4', 'video.mp4', 'video/mp4', 5000);
      expect(video.isVideo()).assertTrue();
    });

    it('should return false for unsupported types', 0, () => {
      const doc = new Medium('file:///doc.pdf', 'doc.pdf', 'application/pdf', 2048);
      expect(doc.isImage()).assertFalse();
      expect(doc.isVideo()).assertFalse();
    });
  });
}
```

### 1.3 注册测试到 List.test.ets

检查 `{harmonyos-project}/entry/src/test/ets/List.test.ets` 是否存在：
- 如果不存在，创建并注册新测试
- 如果存在，追加注册新测试

```typescript
// List.test.ets
import { describe, it, expect } from '@ohos/hypium';
import step1BasicModels from './steps/step1_basic_models/Medium.test';
// 后续 step 的 import 会追加在这里

export default function ListTest() {
  describe('AllTests', () => {
    step1BasicModels();
    // 后续 step 的调用会追加在这里
  });
}
```

---

## Phase 2: GREEN — 写实现

### 2.1 参考源文件映射

从 step spec 的"源文件映射"中获取：
- Android 源文件路径 → 读取 Android 源码理解原始逻辑
- HarmonyOS 目标路径 → 确定实现文件放置位置

### 2.2 编写最小实现

规则：
1. **只写让测试通过的最小代码**——不多不少
2. 使用 ArkTS 语法（不是 TypeScript）
3. 遵循 HarmonyOS API 而非 Android API
4. 如果被测函数依赖外部模块，先创建 stub/接口

**实现文件示例**（对应上面的 Medium 测试）：

```typescript
// entry/src/main/ets/models/Medium.ets
export class Medium {
  path: string;
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;

  constructor(path: string, name: string, type: string, size: number, width: number = 0, height: number = 0) {
    this.path = path;
    this.name = name;
    this.type = type;
    this.size = size;
    this.width = width;
    this.height = height;
  }

  isImage(): boolean {
    return this.type.startsWith('image/');
  }

  isVideo(): boolean {
    return this.type.startsWith('video/');
  }
}
```

### 2.3 处理外部依赖

如果被测代码需要外部依赖（如数据库、网络、文件系统），用接口 + mock 隔离：

```typescript
// 定义接口（在实现文件中）
export interface MediaRepository {
  getAll(): Medium[];
  getById(id: string): Medium | null;
}

// 实现类注入接口
export class MediaHelper {
  private repo: MediaRepository;

  constructor(repo: MediaRepository) {
    this.repo = repo;
  }

  getImageCount(): number {
    return this.repo.getAll().filter(m => m.isImage()).length;
  }
}
```

测试中用 mock 实现：
```typescript
// 测试文件中
class MockMediaRepository implements MediaRepository {
  private items: Medium[];
  constructor(items: Medium[]) { this.items = items; }
  getAll(): Medium[] { return this.items; }
  getById(id: string): Medium | null { return this.items.find(m => m.name === id) || null; }
}
```

---

## Phase 3: VERIFY — 运行测试

### 3.1 调用 harmonyos-local-test

使用 Skill 工具调用 `harmonyos-local-test` 技能运行测试：

```
调用方式: Skill 工具, skill="harmonyos-local-test"
参数: HarmonyOS 项目路径
```

### 3.2 收集测试结果

从测试输出中提取：
- 通过/失败/跳过的测试用例数
- 失败用例的错误信息
- 测试执行时间

---

## Phase 4: FIX — 修复（条件执行）

仅在 Phase 3 测试未全部通过时执行。

### 4.1 第 1 次修复

策略：分析测试失败日志，定位实现代码中的问题，修复实现代码。

常见失败原因及修复方式：

| 失败原因 | 修复方式 |
|---------|---------|
| 函数签名不匹配 | 对齐测试和实现中的参数类型 |
| 返回值类型错误 | 修正实现中的返回值 |
| 缺少依赖文件 | 创建缺失的 stub 文件 |
| ArkTS 语法错误 | 修正为 ArkTS 合法语法 |

### 4.2 第 2 次修复

策略：如果第 1 次修复后仍失败，重新审视测试用例和实现的匹配度：
- 检查测试用例的输入是否合理
- 检查实现是否遗漏了关键逻辑
- 可能同时调整测试和实现

### 4.3 第 3 次修复

策略：如果前 2 次修复后仍失败，降低测试范围：
- 将持续失败的测试用例标记为 `xit`
- 添加注释说明跳过原因
- 记录为"部分通过"

### 4.4 放弃处理

3 次修复后仍失败的测试，记录失败信息并报告，不阻塞后续 step。

---

## Output Report

每个 step 执行完成后，输出简要报告：

```
Step {n}: {name} — {状态}
├── 测试文件: {路径}
├── 实现文件: {路径列表}
├── 测试结果: {passed}/{total} passed
├── 重试次数: {n}
└── 备注: {如果有失败，记录原因}
```

状态值：
- `PASSED` — 所有测试通过
- `PARTIAL` — 部分测试通过（有 xit）
- `FAILED` — 测试失败，3 次重试后仍不通过

---

## Error Handling

| 错误 | 处理 |
|------|------|
| enhanced-spec.md 不存在 | 报错退出，提示需要先运行 spec-enhancer |
| step 编号超出范围 | 报错退出，列出可用的 step 编号 |
| HarmonyOS 项目路径无效 | 报错退出，提示检查路径 |
| 测试运行环境错误 | 报错退出，提示检查 SDK 和 hvigorw 配置 |
| 实现代码编译失败 | 作为测试失败处理，进入 FIX 循环 |
