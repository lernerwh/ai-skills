# skill-creator-opencode

基于 [Anthropic 官方 skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) 改造，适配 OpenCode 环境的技能创建与管理工具。

## 改造背景

Anthropic 官方的 skill-creator 功能强大（测试、评估、基准、描述优化等），但核心脚本硬编码依赖 `claude -p` CLI，无法在 OpenCode 环境下运行。本版本在尽可能保留全部功能的前提下，使其完全兼容 OpenCode。

## 改造范围

### 新增文件

| 文件 | 说明 |
|------|------|
| `scripts/ai_backend.py` | AI 后端抽象层，自动检测 claude CLI / ANTHROPIC_API_KEY / OPENAI_API_KEY，提供统一的文本补全和触发评估接口 |
| `scripts/init_skill.py` | 从 [IgorWarzocha/skill-creator](https://smithery.ai/skills/IgorWarzocha/skill-creator) 移植的技能脚手架工具 |
| `README.md` | 本文件 |

### 重写文件

| 文件 | 改动说明 |
|------|---------|
| `scripts/run_eval.py` | 从硬编码 `claude -p` 流式检测改为双模式：**AI 判断模式**（任意后端）+ **CLI 直连模式**（claude CLI 可用时）。新增 `--backend`、`--eval-mode` 参数。`find_project_root()` 增加 `.opencode/` 路径检测 |
| `scripts/improve_description.py` | `_call_claude()` 替换为 `ai_backend.call_ai_text()`，支持多后端。`model` 参数改为可选 |

### 改造文件

| 文件 | 改动说明 |
|------|---------|
| `SKILL.md` | `name` 改为 `skill-creator-opencode`；`description` 改用 `|-` YAML 格式并增加 `user: "query" → action` 示例；新增 Skill Locations 路径表；新增 **OpenCode-Specific Instructions** 章节；新增 scripts 目录索引 |
| `scripts/run_loop.py` | 透传 `--backend`、`--eval-mode` 参数到 run_eval / improve_description；`model` 改为可选；适配新接口 |
| `scripts/quick_validate.py` | 新增 `--opencode` 扩展验证（检查 description 中是否包含 Examples 模式和 user 示例格式）；修复 Windows GBK 编码问题 |
| `scripts/package_skill.py` | import 路径增加容错处理（同时支持模块导入和直接文件导入） |
| `agents/grader.md` | 新增 Invocation 章节，说明 OpenCode Task 工具 / Claude Code subagent / Inline 三种调用方式 |
| `agents/comparator.md` | 同上 |
| `agents/analyzer.md` | 同上；修复原文 typo "unblids" → "unblinds" |

### 未改动文件

| 文件 | 说明 |
|------|------|
| `scripts/aggregate_benchmark.py` | 纯 Python 数据聚合，无外部依赖 |
| `scripts/generate_report.py` | 纯 HTML 生成，无外部依赖 |
| `scripts/utils.py` | 纯工具函数 |
| `eval-viewer/generate_review.py` | 纯 Python Web 服务 |
| `eval-viewer/viewer.html` | 纯前端 SPA |
| `assets/eval_review.html` | 纯前端模板 |
| `references/schemas.md` | JSON 数据结构定义 |

## 功能保留度

| 功能 | 原版 | 改造后 | 说明 |
|------|------|--------|------|
| 用户访谈/需求收集 | ✅ | ✅ | 不受影响 |
| 起草 SKILL.md | ✅ | ✅ | 增加 OpenCode 路径和 description 格式指南 |
| 脚手架初始化 | ❌ | ✅ | 新增 `init_skill.py` |
| 技能验证 | ✅ | ✅ | 新增 `--opencode` 扩展检查 |
| 技能打包 | ✅ | ✅ | 不变 |
| 测试用例生成/运行 | ✅ | ✅ | 多后端支持 |
| 子代理并行测试 (with-skill vs baseline) | ✅ | ✅ | Task 工具适配 |
| 定量评分 (grader) | ✅ | ✅ | 不变 |
| 基准聚合 | ✅ | ✅ | 不变 |
| Web 评估查看器 | ✅ | ✅ | 不变 |
| 盲比 A/B (comparator + analyzer) | ✅ | ✅ | 不变 |
| 迭代反馈循环 | ✅ | ✅ | 不变 |
| 描述自动优化 | ✅ (仅 claude -p) | ✅ (多后端) | 新增 Anthropic/OpenAI API 支持 |
| 实时优化报告 | ✅ | ✅ | 不变 |
| 多环境支持 | Claude.ai / Cowork | + OpenCode | 新增 OpenCode 专用章节 |

## AI 后端支持

脚本自动检测可用的 AI 后端，优先级如下：

| 优先级 | 后端 | 检测条件 | 用途 |
|--------|------|---------|------|
| 1 | claude CLI | `claude` 命令可用 | 文本补全 + 触发评估 |
| 2 | Anthropic API | `ANTHROPIC_API_KEY` 环境变量 | 文本补全 + AI 判断评估 |
| 3 | OpenAI API | `OPENAI_API_KEY` 环境变量 | 文本补全 + AI 判断评估 |
| 4 | manual | 以上均不可用 | 脚本会报错提示安装依赖 |

可通过 `--backend` 参数手动指定：`claude`、`anthropic`、`openai`。

## OpenCode 适配要点

### 路径规范

```
项目级: .opencode/skills/<name>/SKILL.md
全局级: ~/.config/opencode/skills/<name>/SKILL.md
```

同时兼容 Claude（`.claude/skills/`）和 Agents（`.agents/skills/`）路径。

### Description 格式

使用 `|-` YAML literal block scalar + `user: "query" → action` 示例：

```yaml
description: |-
  [动作/能力]. Use for [场景]. Use proactively when [触发上下文].
  Examples:
  - user: "query" → action
  - user: "query" → action
```

### 子代理调用

OpenCode 使用 Task 工具启动子代理，agent 文件（grader/comparator/analyzer）已增加 Task 工具调用说明。

## 与其他版本对比

| 维度 | 本版 (opencode) | Anthropic 原版 | IgorWarzocha 版 |
|------|----------------|---------------|----------------|
| 文件数 | 21 | 19 | 7 |
| 总代码量 | ~5,200 行 | ~4,526 行 | ~1,183 行 |
| AI 后端 | 多后端（自动检测） | 仅 claude -p | 无（纯指令） |
| 测试/评估/基准 | ✅ 完整 | ✅ 完整 | ❌ |
| 盲比 A/B | ✅ | ✅ | ❌ |
| 描述自动优化 | ✅ 多后端 | ✅ 仅 claude | ❌ |
| Web 评估查看器 | ✅ | ✅ | ❌ |
| 脚手架初始化 | ✅ | ❌ | ✅ |
| OpenCode 路径规范 | ✅ | ❌ | ✅ |
| OpenCode description 格式 | ✅ | ❌ | ✅ |
| OpenCode 环境下可用率 | ~100% | ~40% | ~95% |

## 许可证

Apache License 2.0（与原版一致）
