# Superpowers 技能集 - Gemini CLI 双语版

本目录包含 14 个 Superpowers 技能的优化版中英双语版本。

## 翻译策略

采用**注释式双语**策略：
- 英文正文保持不变（确保技术精确性）
- 关键术语添加中文注释
- 重要段落提供中文翻译
- 代码/命令完全保持英文

## 快速开始

### 方法 1：设置环境变量

```bash
# Linux/macOS
export GEMINI_SYSTEM_MD=$(pwd)/test-driven-development.md
gemini "帮我实现这个功能"

# Windows (PowerShell)
$env:GEMINI_SYSTEM_MD = "$(Get-Location)	est-driven-development.md"
gemini "帮我实现这个功能"
```

### 方法 2：使用切换脚本

```bash
# 切换到测试驱动开发技能
./switch-skill.sh test-driven-development

# 切换到头脑风暴技能
./switch-skill.sh brainstorming
```

### 方法 3：Shell 函数（推荐）

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
gskill() {
    export GEMINI_SYSTEM_MD="$HOME/gemini-skills-bilingual/$1.md"
    echo "[OK] 已切换到技能: $1"
}
```

使用：
```bash
gskill systematic-debugging
gemini "帮我调试这个问题"
```

## 技能列表

- **头脑风暴** (`brainstorming.md`)
- **分发并行任务** (`dispatching-parallel-agents.md`)
- **执行计划** (`executing-plans.md`)
- **完成开发分支** (`finishing-a-development-branch.md`)
- **接收代码审查** (`receiving-code-review.md`)
- **请求代码审查** (`requesting-code-review.md`)
- **子代理驱动开发** (`subagent-driven-development.md`)
- **系统化调试** (`systematic-debugging.md`)
- **测试驱动开发** (`test-driven-development.md`)
- **使用 Git 工作树** (`using-git-worktrees.md`)
- **使用 Superpowers** (`using-superpowers.md`)
- **完成前验证** (`verification-before-completion.md`)
- **编写计划** (`writing-plans.md`)
- **编写技能** (`writing-skills.md`)

## 典型工作流示例

### 开发新功能

```bash
# 1. 头脑风暴 - 设计阶段
gskill brainstorming
gemini "我想添加用户登录功能，应该怎么设计？"

# 2. 编写实现计划
gskill writing-plans
gemini "根据刚才的设计，帮我写详细的实现计划"

# 3. 使用 Git 工作树创建隔离环境
gskill using-git-worktrees
gemini "为新功能创建独立的工作区"

# 4. 测试驱动开发
gskill test-driven-development
gemini "开始实现第一项任务"

# 5. 完成开发分支
gskill finishing-a-development-branch
gemini "功能完成了，准备合并"
```

### 调试问题

```bash
# 系统化调试
gskill systematic-debugging
gemini "测试失败了，帮我找出原因"

# 验证修复
gskill verification-before-completion
gemini "修复完成了，帮我验证"
```

## 与原版差异

| 特性 | Claude Code 原版 | Gemini CLI 双语版 |
|------|-----------------|------------------|
| 技能触发 | 自动检测 | 手动切换 |
| 技能间调用 | Skill 工具 | 切换系统提示词 |
| 语言 | 纯英文 | 中英双语 |
| 代码精度 | 高 | 高（代码保持英文） |

## 许可证

本适配器基于 Superpowers 的 MIT 许可证。
Superpowers 原项目：https://github.com/obra/superpowers
