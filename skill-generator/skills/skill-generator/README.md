# Skill Generator - 使用指南

让 AI 自动创建新技能的元技能。

## 快速开始

### 基础用法

直接告诉 AI 你想要什么技能：

```
"帮我创建一个能分析Nginx日志的技能"
"写一个自动生成单元测试的skill"
"创建一个代码格式化检查技能"
```

### 高级用法

如果 AI 没有自动识别，你可以明确触发：

```
"使用 skill-generator 创建一个xxx技能"
```

## 生成的技能结构

### 简单技能 (无代码)

```
your-skill/
├── skills/your-skill/
│   ├── SKILL.md          # 技能定义 (必需)
│   └── README.md         # 使用说明 (必需)
├── .claude-plugin/
│   └── plugin.json
└── package.json
```

### 完整技能 (包含文档和工具)

```
your-skill/
├── skills/your-skill/
│   ├── SKILL.md          # 技能定义 (必需)
│   ├── README.md         # 使用说明 (必需)
│   ├── docs/             # 子文档目录
│   │   ├── PLAN.md       # 实施计划
│   │   ├── DESIGN.md     # 设计文档
│   │   ├── API.md        # API 文档
│   │   ├── TESTING.md    # 测试文档
│   │   └── CONTRIBUTING.md # 贡献指南
│   └── src/              # 源代码 (可选)
│       ├── index.ts      # 主入口
│       ├── types.ts      # 类型定义
│       ├── core/         # 核心逻辑
│       └── utils/        # 工具函数
├── scripts/              # 脚本工具
│   ├── build.sh          # 构建脚本
│   ├── test.sh           # 测试脚本
│   ├── deploy.sh         # 部署脚本
│   └── setup.sh          # 安装脚本
├── tools/                # 工具集
│   ├── validators/       # 验证工具
│   ├── generators/       # 生成器
│   └── formatters/       # 格式化工具
├── tests/                # 测试文件
├── examples/             # 使用示例
├── .claude-plugin/
│   └── plugin.json
├── package.json
└── tsconfig.json
```

## SKILL.md 格式说明

```yaml
---
name: skill-name              # 技能名称 (必需)
description: 技能描述         # 何时使用此技能 (必需)
---

# 技能标题

## 触发条件
描述何时自动触发此技能

## 使用方式
如何使用此技能

## 配置
需要的配置项

## 限制
已知限制
```

## 常见问题

### Q: 如何给技能命名？

A: 遵循以下规范：
- 使用小写字母和连字符: `log-analyzer`
- 名称应简洁且描述性强
- 避免通用名称: `helper`, `tool`
- 推荐使用动词前缀: `search-`, `analyze-`, `generate-`

### Q: 技能需要代码实现怎么办？

A: Skill Generator 会生成完整的项目结构，包括：
- TypeScript 源码框架
- `package.json` 配置
- 编译脚本

你只需要填充具体的业务逻辑。

### Q: 如何测试新技能？

A: 按以下步骤：
1. 检查生成的 SKILL.md 格式正确
2. 在 Claude Code 中重新加载技能
3. 尝试触发技能
4. 根据需要调整描述和触发条件

### Q: 什么时候需要创建子文档？

A: 根据技能复杂度决定：
- **简单技能**: 只需要 SKILL.md + README.md
- **中等技能**: 添加 API.md (如果有代码) + TESTING.md (如果有测试)
- **复杂技能**: 添加所有子文档 (PLAN.md, DESIGN.md, API.md, TESTING.md, CONTRIBUTING.md)

### Q: 什么时候需要创建脚本工具？

A: 根据项目需求：
- **build.sh**: 需要编译 TypeScript 时
- **test.sh**: 有测试套件时
- **deploy.sh**: 需要部署流程时
- **setup.sh**: 需要环境配置时

### Q: tools/ 目录是什么？

A: tools/ 目录包含可复用的工具模块：
- **validators/**: 参数验证工具
- **generators/**: 代码生成工具
- **formatters/**: 输出格式化工具

### Q: 生成的技能如何共享？

A:
1. 将技能添加到 `ai-skills` 仓库
2. 提交并推送到 GitHub
3. 其他人可以通过克隆仓库获取该技能

## 技能示例

### 日志分析技能

```
名称: log-analyzer
描述: 分析应用日志，识别错误模式和异常趋势
触发:
- 用户说"分析日志"
- 提供 .log 文件路径
- 询问错误统计
```

### 代码审查技能

```
名称: code-reviewer
描述: 自动审查代码质量，检查潜在问题和最佳实践
触发:
- 用户要求审查代码
- 打开 Pull Request 时
- 提交代码后
```

## 配置选项

Skill Generator 支持以下配置：

| 选项 | 说明 | 默认值 |
|-----|------|--------|
| include-tests | 是否生成测试文件 | false |
| include-typescript | 是否使用 TypeScript | true |
| auto-commit | 是否自动提交到 git | false |

在触发技能时可以指定：

```
"创建一个日志分析技能，包含测试文件"
```

## 限制

1. **网络访问**: 生成的技能默认不包含网络操作
2. **文件操作**: 危险操作需要用户确认
3. **API 调用**: 需要配置相应的环境变量

## 最佳实践

1. **明确触发条件**: 在 SKILL.md 中详细说明何时触发
2. **提供示例**: 在 README.md 中包含使用示例
3. **处理错误**: 说明可能的错误和解决方案
4. **保持简洁**: 一个技能只做一件事
5. **编写文档**: 及时更新使用说明

## 贡献

如果你创建了有用的技能，欢迎贡献到 `ai-skills` 仓库！

## 更新日志

- **v1.1.0** (2026-01-28): 增强版元技能
  - ✨ 新增完整的子文档生成指南 (PLAN.md, DESIGN.md, API.md, TESTING.md, CONTRIBUTING.md)
  - ✨ 新增脚本工具模板 (build.sh, test.sh, deploy.sh, setup.sh)
  - ✨ 新增 TypeScript 工具集模板 (validators, generators, formatters)
  - ✨ 新增文档与工具选择指南，根据技能复杂度智能推荐
  - 📝 完善使用流程，包含 5 个步骤：需求 → 设计 → 代码 → 文档 → 脚本
  - 📝 更新输出格式，明确列出所有可创建的文件类型

- **v1.0.0** (2026-01-28): 初始版本
  - 支持基础技能模板生成
  - 支持 TypeScript 项目结构
  - 自动生成文档

## 许可证

MIT License
