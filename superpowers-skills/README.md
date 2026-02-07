# Superpowers Skills

这是一套从 Claude Code 技能集 适配到 普通技能组合 格式的高级开发技能集合。这些技能遵循严格的开发原则，帮助确保代码质量和开发效率。

This is a collection of advanced development skills adapted from Claude Code to Gemini Skills format. These skills follow strict development principles to help ensure code quality and development efficiency.

## 兼容性说明 / Compatibility

### 技能分类 / Skill Categories

根据对 CLI 能力的要求，技能分为两类：

#### 兼容技能（Compatible Skills）

以下技能**只需要基本的 skill 调用能力**，可以在任何支持 skill 的 CLI 中使用：

| 技能 | 说明 |
|-----|------|
| brainstorming | 头脑风暴和设计 |
| systematic-debugging | 系统化调试 |
| test-driven-development | 测试驱动开发 |
| verification-before-completion | 完成前验证 |
| using-git-worktrees | Git 工作树管理 |
| executing-plans | 计划执行 |
| receiving-code-review | 接收代码审查反馈 |
| finishing-a-development-branch | 完成开发分支 |
| using-superpowers | 元技能（指导如何使用其他技能） |

#### 高级技能（Advanced Skills - Requires Subagent）

以下技能**需要 subagent 和并行执行能力**，仅在使用支持这些功能的 CLI 时可用：

| 技能 | 所需能力 | 替代方案 |
|-----|---------|---------|
| subagent-driven-development | Subagent 分发 | 使用 executing-plans |
| requesting-code-review | Subagent 分发 | 使用 verification-before-completion |
| dispatching-parallel-agents | 并行执行 + Subagent | 顺序执行 systematic-debugging |
| writing-skills | Subagent 测试 | 手动测试或跳过验证 |

### 功能完整性对比

| 功能 | 使用兼容技能 | 使用全部技能 |
|-----|-------------|-------------|
| 需求分析和设计 | 完整支持 | 完整支持 |
| 编写实现计划 | 完整支持 | 完整支持 |
| 执行计划 | 支持（手动批量） | 支持（自动子代理） |
| 自动代码审查 | 手动执行 | 自动执行 |
| 并行任务处理 | 不支持 | 支持 |
| 技能验证 | 手动测试 | 自动压力测试 |

### 推荐配置

**如果你的 CLI 支持基本的 skill 调用：**
- 使用 9 个兼容技能即可完成完整的开发流程
- 保留 4 个高级技能作为参考文档

**如果你的 CLI 支持 subagent 和并行执行：**
- 可以使用全部 14 个技能
- 获得自动化的代码审查和并行任务处理能力

---

## 技能列表 / Skills List

### 核心工作流技能 / Core Workflow Skills

#### brainstorming
**用途：** 在任何创造性工作之前使用 - 创建功能、构建组件、添加功能或修改行为。探索用户意图、需求和设计，然后再实现。

**触发条件：** 创建新功能、构建组件、添加功能、修改行为

#### writing-plans
**用途：** 当你有规范或需求用于多步骤任务时，在编写代码之前使用。编写全面的实现计划，假设工程师对代码库零背景。

**触发条件：** 有规范或需求、开始多步骤实现任务

#### systematic-debugging
**用途：** 遇到任何错误、测试失败或意外行为时，在提出修复方案之前使用。核心原则：始终在尝试修复之前找到根本原因。

**触发条件：** 测试失败、生产环境错误、意外行为、性能问题、构建失败、集成问题

#### test-driven-development (TDD)
**用途：** 实现任何功能或错误修复时，在编写实现代码之前使用。核心原则：如果没有看到测试失败，你就不知道测试是否正确。

**触发条件：** 新功能、错误修复、重构、行为变更

### 开发环境技能 / Development Environment Skills

#### using-git-worktrees
**用途：** 开始需要与当前工作区隔离的功能工作或执行实现计划之前使用。创建具有智能目录选择和安全验证的隔离 git 工作树。

**触发条件：** 开始需要隔离的功能工作、执行实现计划之前

### 执行模式技能 / Execution Mode Skills

#### subagent-driven-development
**用途：** 在当前会话中执行具有独立任务的实现计划时使用。通过为每个任务分派新的子代理来执行计划，每个任务后进行两阶段审查：首先是规范合规性审查，然后是代码质量审查。

**触发条件：** 有实现计划、任务大部分独立、留在当前会话

#### executing-plans
**用途：** 当你有书面实现计划要在具有审查检查点的单独会话中执行时使用。加载计划、批判性审查、批量执行任务、在批次之间报告以供审查。

**触发条件：** 有书面实现计划、想在单独会话中执行、更喜欢批量执行

#### dispatching-parallel-agents
**用途：** 面对 2+ 个可以在没有共享状态或顺序依赖的情况下工作的独立任务时使用。核心原则：为每个独立问题域分派一个代理。让它们并发工作。

**触发条件：** 3+ 个测试文件失败、多个子系统独立损坏、问题可以独立理解

### 质量保证技能 / Quality Assurance Skills

#### verification-before-completion
**用途：** 在声称工作完成、修复或通过之前，在提交或创建 PR 之前使用。核心原则：证据优先于声明，始终。需要运行验证命令并在做出任何成功声明之前确认输出。

**触发条件：** 声称工作完成、提交或创建 PR 之前、移动到下一个任务之前

#### requesting-code-review
**用途：** 完成任务、实现主要功能或在合并之前使用，以验证工作满足要求。核心原则：尽早审查，经常审查。

**触发条件：** 完成任务后、实现主要功能后、合并到主分支之前

#### receiving-code-review
**用途：** 接收代码审查反馈时，在实施建议之前使用。核心原则：实施前验证。假设前询问。技术正确性优于社交舒适度。

**触发条件：** 接收代码审查反馈、实施建议之前、反馈看起来不清楚或在技术上有问题时

### 完成工作技能 / Completion Skills

#### finishing-a-development-branch
**用途：** 实现完成、所有测试通过，你需要决定如何集成工作时使用。核心原则：验证测试 → 展示选项 → 执行选择 → 清理。

**触发条件：** 实现完成、所有测试通过、需要决定如何集成工作

### 元技能 / Meta Skills

#### writing-skills
**用途：** 创建新技能、编辑现有技能或在部署前验证技能工作时使用。核心原则：编写技能是应用于过程文档的测试驱动开发。没有失败的测试就没有技能。

**触发条件：** 创建新技能、编辑现有技能、验证技能工作

#### using-superpowers
**用途：** 在开始任何对话时使用 - 建立如何查找和使用技能。核心原则：在任何响应或行动之前调用相关或请求的技能，包括澄清问题。即使 1% 的机会可能适用技能，你也应该调用该技能来检查。

**触发条件：** 开始任何对话

## 技能引用格式 / Skill Reference Format

在这些技能中，引用其他技能的格式为：

```
Use skill: skill-name
```

或者：

```
**REQUIRED SUB-SKILL:** Use skill: skill-name
```

这种格式确保技能之间的正确调用和依赖关系。

## 原则 / Principles

这些技能基于以下核心原则：

1. **证据优于声明** - 在声称之前验证
2. **根本原因优先** - 在修复之前理解
3. **测试驱动** - 在实现之前测试
4. **早期审查** - 经常审查，尽早发现问题
5. **严格纪律** - 不走捷径，不找借口

## 适配说明 / Adaptation Notes

这些技能从 Gemini Skills 格式适配到 Claude Code 格式：

1. **YAML Frontmatter** - 添加了符合 Claude Code 标准的 YAML frontmatter
2. **技能引用** - 将 `切换到技能 xxx.md (使用 gskill xxx)` 改为 `Use skill: xxx` 格式
3. **内容结构** - 保持了原始的双语内容和核心工作流程
4. **工具调用** - 适配了 Claude Code 的 Skill 工具调用方式

## 许可证 / License

这些技能基于原始 Gemini Skills 适配而来，遵循相同的使用原则。
