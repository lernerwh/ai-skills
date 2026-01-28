---
name: skill-generator
description: Use when user asks to create a new skill, automate repetitive tasks, or wants the AI to learn how to do something new. This meta-skill automatically generates complete, ready-to-use skills with proper structure, documentation, and TypeScript code. Triggers on phrases like "create a skill", "generate a skill", "make a skill that...", or when AI detects a repetitive task pattern.
---

# Skill Generator - 技能自动生成器

**元技能** - 让 AI 自动创建新技能的技能。

当用户要求创建技能、自动化重复任务，或希望 AI 学会新能力时使用。

## 触发条件

此 skill 在以下情况下自动触发:

1. **创建技能请求**: 用户明确要求创建新技能
   - "帮我创建一个xxx技能"
   - "写一个能做xxx的skill"
   - "生成一个新技能"
   - "make a skill that..."

2. **重复性任务识别**: AI 识别到用户在执行重复性任务
   - 同一个操作模式出现 3 次以上
   - 用户说"这个操作很频繁"
   - AI 判断任务可自动化

3. **功能扩展请求**: 用户想要添加新功能
   - "能不能让CLI学会xxx"
   - "如何实现xxx能力"

## 使用方式

### 基础用法

直接描述你想要的技能：

```
"帮我创建一个分析Nginx日志的技能"
"写一个自动生成单元测试的skill"
"创建一个代码格式化检查技能"
```

### 完整流程

```
用户输入 → 需求分析 → 生成文件 → 验证 → 完成
```

### 代码调用示例

```typescript
import { createSkill, previewSkill } from 'skill-generator';

// 预览技能
const preview = previewSkill("创建一个日志分析技能");
console.log(preview);

// 生成技能
const skill = await createSkill("创建一个日志分析技能", {
  basePath: './skills',
  autoWrite: true,
});

console.log(`技能已生成: ${skill.name}`);
```

## 输出格式

生成的新技能包含：

| 文件 | 说明 |
|-----|------|
| `SKILL.md` | 技能定义（触发条件、描述） |
| `README.md` | 使用文档（示例、配置、FAQ） |
| `plugin.json` | 插件配置 |
| `package.json` | NPM 包配置 |
| `src/index.ts` | 主入口（如需要代码） |
| `src/types.ts` | 类型定义（如需要代码） |

## 自动分析能力

Skill Generator 会自动分析用户输入，提取：

- **技能名称**: 自动生成 kebab-case 名称
- **技能类型**: search/analyzer/generator/operator
- **触发条件**: 根据描述自动生成
- **工具权限**: Read/Write/Bash/WebSearch
- **是否需要代码**: 判断是否需要实现代码

### 关键词识别

| 类型 | 关键词 | 生成的技能前缀 |
|-----|-------|--------------|
| 搜索 | 搜索、查找、search、find | `search-` |
| 分析 | 分析、解析、analyze | `analyzer-` |
| 生成 | 生成、创建、generate | `generator-` |
| 操作 | 清理、删除、更新 | `-cleaner` |

## 生成的技能示例

### 示例 1: 日志分析技能

```
输入: "帮我创建一个分析Nginx日志的技能"

生成:
- 名称: log-analyzer
- 类型: analyzer
- 包含: TypeScript 代码实现
- 触发: "分析日志"、"检查错误"
```

### 示例 2: 测试生成器

```
输入: "写一个自动生成单元测试的skill"

生成:
- 名称: test-generator
- 类型: generator
- 包含: 代码生成逻辑
- 触发: "生成测试"、"创建测试用例"
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| name | string | 自动生成 | 指定技能名称 |
| description | string | 自动提取 | 指定技能描述 |
| type | enum | 自动检测 | simple/medium/complex |
| autoWrite | boolean | false | 是否自动写入文件 |
| basePath | string | '.' | 生成路径 |

## 限制

- 生成的代码需要人工review和完善
- 复杂技能可能需要调整架构
- 默认不包含外部依赖集成
- 需要用户确认后才写入磁盘

## 验证

生成的技能会自动验证：

- ✅ SKILL.md 格式正确
- ✅ 文件结构完整
- ✅ 命名符合规范
- ✅ 描述清晰明确

## 相关技能

- **code-reviewer**: 审查生成的代码质量
- **test-generator**: 为新技能生成测试用例

---

**此技能由人工创建，用于生成其他技能**
