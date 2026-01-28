# 技能模板 - 新技能创建参考

使用此模板快速创建新技能。

## 快速开始

1. 复制此模板
2. 替换 `{{变量}}` 为实际内容
3. 保存为 `SKILL.md`

---

## SKILL.md 模板

```yaml
---
name: {{skill-name}}
description: {{一句话描述这个技能做什么，以及何时使用它}}
---

# {{技能标题}}

{{技能的详细描述，2-3句话说明其用途和价值}}

## 触发条件

此 skill 在以下情况下自动触发:

1. **场景一**: {{具体场景描述}}
   - 示例: "{{用户可能说的话}}"

2. **场景二**: {{另一个场景描述}}
   - 示例: "{{另一个示例}}"

## 使用方式

### 基础用法

```
{{简单使用示例}}
```

### 高级用法

```markdown
{{复杂使用场景和参数说明}}
```

## 配置

{{如果需要配置，说明配置项}}

### 环境变量

```bash
export {{CONFIG_NAME}}=your_value
```

## 输出格式

{{说明技能的输出格式}}

| 字段 | 说明 |
|-----|------|
| field1 | 说明1 |
| field2 | 说明2 |

## 限制

{{列出已知的限制}}

- 限制1
- 限制2

## 示例

### 示例 1: {{场景标题}}

```
输入: {{输入示例}}
输出: {{输出示例}}
```
```

---

## README.md 模板

```markdown
# {{技能名称}} - 使用指南

{{简短描述技能功能}}

## 安装

```bash
# 克隆技能到本地
git clone https://github.com/lernerwh/ai-skills.git ~/.claude/skills
```

## 快速开始

### 基础用法

```
{{最简单的使用方式}}
```

### 完整示例

```markdown
{{完整的使用流程示例}}
```

## 配置

{{配置说明}}

## 参数说明

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| param1 | string | 是 | 参数说明 |
| param2 | number | 否 | 参数说明 |

## 使用场景

1. **场景一**: {{说明}}
2. **场景二**: {{说明}}

## 常见问题

### Q: {{问题}}?

A: {{回答}}

## 最佳实践

1. {{最佳实践1}}
2. {{最佳实践2}}

## 故障排除

| 问题 | 解决方案 |
|-----|---------|
| 问题1 | 解决方案1 |
| 问题2 | 解决方案2 |

## 相关技能

- [[skill-name]]: {{关联技能说明}}

## 更新日志

- **v1.0.0** ({{日期}}): 初始版本
  - {{功能列表}}

## 许可证

MIT License
```

---

## 命名规范

### 技能名称 (name)

- 格式: `kebab-case` (小写字母 + 连字符)
- 长度: 3-30 个字符
- 建议: 使用动词 + 名词

| 好的例子 | 不好的例子 |
|---------|-----------|
| `log-analyzer` | `LogAnalyzer` |
| `code-searcher` | `codeSearcher` |
| `git-cleaner` | `helper` (太通用) |
| `test-generator` | `tool` (太模糊) |

### 描述 (description)

- 一句话，简明扼要
- 说明: 何时使用 + 为什么使用

**好的描述**:
```
"Use when analyzing log files to identify errors, patterns, and anomalies"
```

**不好的描述**:
```
"This skill analyzes logs"  # 太简单
```

## 技能分类

### 搜索类 (search-*)
- `log-searcher`: 搜索日志
- `code-searcher`: 搜索代码
- `file-finder`: 查找文件

### 分析类 (analyzer-*)
- `log-analyzer`: 分析日志
- `error-analyzer`: 分析错误
- `perf-analyzer`: 性能分析

### 生成类 (generator-*)
- `test-generator`: 生成测试
- `doc-generator`: 生成文档
- `code-generator`: 生成代码

### 操作类 (执行特定动作)
- `git-cleaner`: 清理 git
- `dep-updater`: 更新依赖
- `format-checker`: 格式检查

## 项目结构

### 简单技能 (无代码)

```
skill-name/
├── skills/skill-name/
│   ├── SKILL.md          # 技能定义
│   └── README.md         # 使用说明
├── .claude-plugin/
│   └── plugin.json
└── package.json
```

### 复杂技能 (带代码)

```
skill-name/
├── skills/skill-name/
│   ├── SKILL.md
│   ├── README.md
│   └── src/
│       ├── index.ts      # 主入口
│       ├── types.ts      # 类型定义
│       ├── core/         # 核心逻辑
│       └── utils/        # 工具函数
├── dist/                 # 编译输出
├── .claude-plugin/
│   └── plugin.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 提交检查清单

创建新技能前，确保：

- [ ] SKILL.md 格式正确 (frontmatter 有效)
- [ ] 描述清晰且触发条件明确
- [ ] README.md 包含使用示例
- [ ] 命名符合规范
- [ ] 如有代码，已通过测试
- [ ] 更新了主仓库的 README.md

## 工具权限参考

| 工具 | 用途 | 风险级别 |
|-----|------|---------|
| Read | 读取文件 | 安全 |
| Write | 写入文件 | 中等 |
| Bash | 执行命令 | 中等 |
| WebSearch | 网络搜索 | 中等 |
| Grep/Glob | 搜索文件 | 安全 |

在 SKILL.md 中说明技能需要的工具权限。
