# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 AI 技能集合仓库，用于 Claude Code 和其他 AI 助手。每个技能是一个独立的子目录，包含完整的 TypeScript 实现、文档和配置。

### 核心架构

```
ai-skills/
├── skill-generator/      # 元技能：自动生成新技能
├── github-kb/            # GitHub 知识库搜索
├── harmonyos-code-review/ # 鸿蒙代码审查
└── README.md             # 仓库总览
```

每个技能遵循统一的结构：
```
skill-name/
├── skills/skill-name/
│   ├── SKILL.md          # 技能定义（触发条件、工具权限）
│   ├── README.md         # 使用文档
│   └── src/              # TypeScript 源码（如需要）
├── .claude-plugin/
│   └── plugin.json       # 插件配置
├── package.json          # NPM 配置
└── tsconfig.json         # TypeScript 配置
```

## 常用命令

### 构建
```bash
# skill-generator
cd skill-generator && npm run build

# github-kb
cd github-kb && npm run build
```

### 测试
```bash
# skill-generator
cd skill-generator && npm test

# github-kb
cd github-kb && npm test
```

### 代码检查
```bash
# skill-generator
cd skill-generator && npm run lint

# github-kb
cd github-kb && npm run lint
```

## 开发指南

### 创建新技能

有两种方式创建新技能：

1. **使用 Skill Generator（推荐）**
   - 调用 `skill-generator` 技能自动生成新技能框架
   - 自动生成 SKILL.md、README.md、TypeScript 代码模板

2. **手动创建**
   - 参考 `skill-generator` 或 `github-kb` 的目录结构
   - 创建必需文件：SKILL.md、README.md、plugin.json、package.json

### SKILL.md 格式

每个技能必须有 SKILL.md，格式如下：

```markdown
---
name: skill-name
description: 技能描述，用于自动触发判断
---

# 技能标题

技能描述

## 触发条件

此 skill 在以下情况下自动触发:

1. **触发类型**: 描述
   - "示例输入 1"
   - "示例输入 2"
```

### TypeScript 技能开发

- 入口文件：`src/index.ts` 导出主函数供外部调用
- 类型定义：`src/types.ts` 定义接口和类型
- 工具函数：按功能模块组织到 `src/utils/`、`src/core/` 等子目录
- 编译输出：所有 TypeScript 编译到 `dist/` 目录

## 技能设计模式

### Skill Generator（元技能）

位于 `skill-generator/skills/skill-generator/`

**核心类：**
- `SkillGenerator` (index.ts:24): 主类，协调整个生成流程
- `generateSkill()` (core/generator.ts:11): 根据用户输入生成技能文件
- `analyzeRequirement()` (utils/skill-parser.ts:45): 分析用户需求，提取技能配置

**关键类型：**
- `SkillConfig`: 技能配置接口
- `GeneratedSkill`: 生成的技能结构
- `RequirementAnalysis`: 需求分析结果

### GitHub KB

位于 `github-kb/skills/github-kb/`

**核心类：**
- `GitHubSearcher`: 执行 GitHub API 搜索
- `SummaryFormatter`: 格式化搜索结果为摘要
- `searchGitHub()`: 主入口函数

**环境变量：**
- `GITHUB_TOKEN`: GitHub 个人访问令牌（必需）

## MCP 服务器配置

仓库配置了 Playwright MCP 服务器（`.claude/mcp.json`），用于浏览器自动化任务。

## GitHub 操作规范

所有 GitHub 操作（push、PR、issue 等）优先使用 GitHub CLI (gh)。

## 注意事项

1. **技能命名**：使用 kebab-case（小写字母+连字符）
2. **TypeScript 版本**：统一使用 TypeScript 5.3+
3. **输出目录**：编译后的代码必须输出到 `dist/` 目录
4. **文档语言**：所有文档和注释使用中文，技术术语保持英文
