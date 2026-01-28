# Skill Generator - 使用指南

让 AI 自动创建新技能的元技能。

## 快速开始

### 直接使用

直接告诉 AI 你想要什么技能：

```
"帮我创建一个分析Nginx日志的技能"
"写一个自动生成单元测试的skill"
"创建一个代码格式化检查技能"
```

### 代码中使用

```typescript
import { createSkill, previewSkill } from 'skill-generator';

// 预览技能（不生成文件）
const preview = previewSkill("创建一个日志分析技能");
console.log(preview);

// 生成技能并写入文件
const skill = await createSkill("创建一个日志分析技能", {
  basePath: './',
  autoWrite: true,
});

console.log(`技能已生成: ${skill.name}`);
console.log(`路径: ${skill.path}`);
```

## 工作流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  用户输入   │───▶│  需求分析   │───▶│  生成文件   │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │  验证输出   │
                                        └─────────────┘
```

## 自动分析能力

### 需求提取

Skill Generator 会自动从用户输入中提取：

| 提取内容 | 说明 | 示例 |
|---------|------|------|
| 技能名称 | 自动生成 kebab-case 名称 | `log-analyzer` |
| 技能类型 | search/analyzer/generator/operator | `analyzer` |
| 描述 | 从输入中提取 | "分析应用日志" |
| 触发条件 | 根据描述自动生成 | "分析日志时" |
| 工具权限 | 判断需要哪些工具 | `Read`, `Grep` |

### 关键词识别

| 类型 | 关键词 | 前缀 |
|-----|-------|------|
| 搜索类 | 搜索、查找、search、find | `search-` |
| 分析类 | 分析、解析、analyze | `analyzer-` |
| 生成类 | 生成、创建、generate | `generator-` |
| 操作类 | 清理、删除、更新 | `cleaner` |

### 智能判断

```typescript
// 输入: "创建一个日志分析技能"
{
  skillName: "log-analyzer",
  suggestedType: "analyzer",
  needsCode: true,
  requiredTools: ["Read", "Grep"],
  triggers: ["分析日志", "检查日志文件"]
}
```

## 生成的技能结构

### 简单技能（仅文档）

```
skill-name/
├── skills/skill-name/
│   ├── SKILL.md          # 技能定义
│   └── README.md         # 使用说明
├── .claude-plugin/
│   └── plugin.json
└── package.json
```

### 复杂技能（带代码）

```
skill-name/
├── skills/skill-name/
│   ├── SKILL.md
│   ├── README.md
│   └── src/
│       ├── index.ts      # 主入口
│       ├── types.ts      # 类型定义
│       └── utils.ts      # 工具函数
├── dist/                 # 编译输出
├── .claude-plugin/
│   └── plugin.json
├── package.json
└── tsconfig.json
```

## 配置选项

### 生成选项

| 选项 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| name | string | 自动生成 | 指定技能名称 |
| description | string | 自动提取 | 指定技能描述 |
| type | enum | 自动检测 | 模板类型 |
| autoWrite | boolean | false | 自动写入文件 |
| basePath | string | '.' | 生成路径 |

### 模板类型

```typescript
enum SkillTemplateType {
  SIMPLE   = 'simple',    // 仅文档
  MEDIUM   = 'medium',    // 基础代码
  COMPLEX  = 'complex',   // 完整项目
}
```

## API 参考

### SkillGenerator 类

```typescript
class SkillGenerator {
  constructor(basePath: string)

  // 生成技能
  async generateFromInput(
    userInput: string,
    options?: GenerateOptions
  ): Promise<GeneratedSkill>

  // 写入文件
  async writeSkillFiles(skill: GeneratedSkill): Promise<void>

  // 验证技能
  validateSkill(skill: GeneratedSkill): ValidationResult

  // 预览技能
  previewSkill(userInput: string): string
}
```

### 快捷函数

```typescript
// 创建技能
async function createSkill(
  userInput: string,
  options?: Options
): Promise<GeneratedSkill>

// 预览技能
function previewSkill(userInput: string): string
```

## 示例

### 示例 1: 创建日志分析器

```typescript
import { createSkill } from 'skill-generator';

const skill = await createSkill(
  "创建一个能分析Nginx访问日志的技能，统计IP访问次数",
  {
    name: "nginx-log-analyzer",
    autoWrite: true,
  }
);

// 输出:
// ✅ 技能已生成: nginx-log-analyzer
// 📁 路径: ./nginx-log-analyzer
// 📄 文件: 6 个文件已创建
```

### 示例 2: 预览技能

```typescript
import { previewSkill } from 'skill-generator';

const preview = previewSkill("创建一个代码搜索技能");

console.log(preview);
```

输出：
```
## 📋 技能预览

### 基本信息
- 名称: `code-searcher`
- 类型: search
- 描述: 搜索代码文件

### 触发条件
1. 搜索代码
2. 查找函数

### 技术规格
- 需要代码: 是
- 工具权限: Grep, Glob
```

### 示例 3: 自定义配置

```typescript
const skill = await createSkill("测试生成器", {
  name: "test-gen",
  description: "自动生成单元测试",
  type: SkillTemplateType.COMPLEX,
  autoWrite: true,
});
```

## 常见问题

### Q: 生成的代码能用吗？

A: 生成的是基础框架，需要根据具体需求完善业务逻辑。

### Q: 如何自定义技能名称？

A: 使用 `name` 选项或在输入中明确指定：

```
"创建一个叫 my-analyzer 的技能"
```

### Q: 生成的技能如何测试？

A:
1. 检查 SKILL.md 格式
2. 运行 `npm install && npm run build`
3. 在 Claude Code 中加载测试

### Q: 支持哪些编程语言？

A: 默认生成 TypeScript，可以手动修改为其他语言。

## 最佳实践

1. **明确需求**: 描述清楚技能要做什么
2. **提供上下文**: 包含使用场景和示例
3. **验证输出**: 检查生成的文件是否正确
4. **完善代码**: 填充具体的业务逻辑
5. **测试验证**: 确保技能按预期工作

## 故障排除

| 问题 | 解决方案 |
|-----|---------|
| 名称无效 | 确保使用 kebab-case 格式 |
| 文件未生成 | 检查 `autoWrite` 选项 |
| 代码报错 | 检查 tsconfig.json 配置 |
| 技能未触发 | 检查 SKILL.md 触发条件 |

## 开发

### 构建

```bash
npm install
npm run build
```

### 测试

```bash
npm test
```

## 相关链接

- [ai-skills 仓库](https://github.com/lernerwh/ai-skills)
- [Claude Code 文档](https://claude.ai/code)

## 更新日志

- **v1.0.0** (2026-01-28): 初始版本
  - 自动需求分析
  - 多种模板类型
  - 代码生成支持

## 许可证

MIT License
