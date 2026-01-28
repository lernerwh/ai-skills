---
name: skill-generator
description: Automatically generate new skills based on user requirements. Use when user asks to create a new skill, automate repetitive tasks, or build custom functionality. This meta-skill creates complete, ready-to-use skill templates with proper structure and documentation.
---

# Skill Generator - 技能自动生成器

让 AI 自动创建新技能的元技能。

## 触发条件

此 skill 在以下情况下自动触发:

1. **创建技能请求**: 用户明确要求创建新技能
   - "帮我创建一个xxx技能"
   - "写一个能做xxx的skill"
   - "生成一个新技能"

2. **重复性任务识别**: AI 识别到用户在执行重复性任务
   - 当同一个操作模式出现 3 次以上
   - 用户说"这个操作很频繁"
   - AI 判断任务可自动化

3. **功能扩展请求**: 用户想要添加新功能
   - "能不能让CLI学会xxx"
   - "如何实现xxx能力"

## 使用流程

```
用户需求 → 需求分析 → 技能设计 → 代码生成 → 验证测试 → 注册
```

### Step 1: 需求收集

首先向用户确认以下信息:

```markdown
请确认新技能的信息:

1. **技能名称** (英文，kebab-case): 例如 `log-analyzer`
2. **功能描述**: 这个技能做什么？
3. **触发场景**: 什么时候自动触发？
4. **输入参数**: 需要哪些参数？
5. **工具权限**: 需要哪些工具？(Read/Write/Bash/WebSearch等)
```

### Step 2: 生成技能

使用以下模板生成新技能:

```markdown
## 新技能: [技能名称]

### 基本信息
- **名称**: [name]
- **描述**: [description]
- **版本**: 1.0.0

### 目录结构
```
[name]/
├── skills/[name]/
│   ├── SKILL.md          # 技能定义
│   ├── README.md         # 使用说明
│   └── template.md       # 模板文件(可选)
├── .claude-plugin/
│   └── plugin.json
└── package.json
```

### SKILL.md 内容
[根据技能描述生成 frontmatter 和详细文档]

### README.md 内容
[包含使用示例、配置说明、限制等]
```

### Step 3: 验证与注册

1. 检查生成的 SKILL.md 格式是否正确
2. 确认描述清晰且触发条件明确
3. 将技能添加到 ai-skills 仓库
4. 提交并推送到远程仓库

## 技能模板

### 基础模板

```yaml
---
name: your-skill-name
description: Clear, concise description of when and why to use this skill
---

# Your Skill Name

技能的详细描述。

## 触发条件

1. **场景一**: 描述
2. **场景二**: 描述

## 使用方式

示例代码或命令

## 配置

需要的环境变量或配置项

## 限制

已知的限制或注意事项
```

### 高级模板 (带代码)

对于需要代码实现的技能，添加:

```
your-skill/
├── src/
│   ├── index.ts         # 主入口
│   ├── types.ts         # 类型定义
│   └── utils/           # 工具函数
├── dist/                # 编译输出
└── package.json
```

## 输出格式

生成新技能后，提供以下信息:

```markdown
## ✅ 技能创建成功

**名称**: [skill-name]
**路径**: [path]
**描述**: [description]

### 下一步:
1. 检查生成的文件是否正确
2. 根据需要修改 SKILL.md 和 README.md
3. 如果有代码实现，运行 `npm install && npm run build`
4. 提交到 git: `git add . && git commit -m "Add [skill-name] skill"`
5. 推送到远程: `git push`

### 使用方式:
在 Claude Code 中直接使用该技能，或通过 `/[skill-name]` 调用
```

## 技能命名规范

- 使用小写字母和连字符: `log-analyzer`, `code-reviewer`
- 名称应简洁且描述性强
- 避免使用通用名称: `helper`, `tool` (太模糊)
- 推荐使用动词: `search-`, `analyze-`, `generate-`

## 常见技能类型

| 类型 | 示例名称 | 描述 |
|-----|---------|------|
| 搜索类 | `log-searcher`, `code-finder` | 搜索日志、代码等 |
| 分析类 | `error-analyzer`, `perf-checker` | 分析错误、性能等 |
| 生成类 | `test-generator`, `doc-builder` | 生成测试、文档等 |
| 操作类 | `git-cleaner`, `dep-updater` | 执行特定操作 |

## 安全考虑

生成技能时注意:

1. **权限最小化**: 只请求必要的工具权限
2. **输入验证**: 在 SKILL.md 中说明参数要求
3. **错误处理**: 在 README.md 中说明可能的错误
4. **沙箱执行**: 危险操作需要用户确认

## 示例

### 示例 1: 创建日志分析技能

```
用户: 帮我创建一个能分析应用日志的技能

AI: 我来帮你创建一个日志分析技能。

[生成 skill: log-analyzer]
- SKILL.md: 定义触发条件和使用方式
- README.md: 使用说明和示例
- src/log-parser.ts: 日志解析逻辑
```

### 示例 2: 自动识别重复任务

```
用户: [第3次执行类似的git清理操作]

AI: 我注意到你经常需要清理git分支。要我创建一个
`git-cleaner` 技能来自动化这个操作吗？
```

## 相关技能

- **code-reviewer**: 审查生成的代码质量
- **test-generator**: 为新技能生成测试
