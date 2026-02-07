# Gemini CLI Superpowers 技能适配器

将 Superpowers 技能集适配到 Gemini CLI 的独立工具集。

## 功能特性

✅ **独立技能** - 每个 Superpowers 技能转换为独立的 Gemini 系统提示词
✅ **一键切换** - 快速在不同技能之间切换
✅ **跨平台** - 支持 Linux/macOS 和 Windows
✅ **零依赖** - 纯 Python 实现，无需额外依赖

## 快速开始

### 1. 转换技能

```bash
# 克隆或下载此项目
cd ai-skills/gemini-skills-adapter

# 运行转换脚本
python convert_skills.py --source "/path/to/superpowers/skills" --output "gemini-skills"
```

### 2. 使用技能

```bash
# 方法 1: 直接设置环境变量
export GEMINI_SYSTEM_MD=$(pwd)/gemini-skills/brainstorming.md
gemini "帮我设计一个用户认证功能"

# 方法 2: 使用切换脚本
cd gemini-skills
./switch-skill.sh writing-plans
gemini "根据刚才的设计，写实现计划"
```

### 3. Windows 使用

```cmd
REM 使用批处理脚本切换
cd gemini-skills
switch-skill.bat systematic-debugging
gemini "帮我调试这个测试失败问题"
```

## 技能列表

| 技能 | 文件名 | 适用场景 |
|------|--------|----------|
| brainstorming | `brainstorming.md` | 功能设计、需求分析、架构探索 |
| writing-plans | `writing-plans.md` | 将设计转换为详细实现计划 |
| systematic-debugging | `systematic-debugging.md` | 系统化调试、根因分析 |
| test-driven-development | `test-driven-development.md` | TDD 红绿重构循环 |
| using-git-worktrees | `using-git-worktrees.md` | 创建隔离的开发工作区 |
| subagent-driven-development | `subagent-driven-development.md` | 子代理驱动的开发流程 |
| executing-plans | `executing-plans.md` | 按计划批量执行任务 |
| verification-before-completion | `verification-before-completion.md` | 完成前验证 |
| requesting-code-review | `requesting-code-review.md` | 请求代码审查 |
| receiving-code-review | `receiving-code-review.md` | 接收和处理代码审查反馈 |
| finishing-a-development-branch | `finishing-a-development-branch.md` | 完成开发分支的收尾工作 |
| dispatching-parallel-agents | `dispatching-parallel-agents.md` | 并行分发任务到多个代理 |
| writing-skills | `writing-skills.md` | 编写新技能的元技能 |
| using-superpowers | `using-superpowers.md` | Superpowers 使用指南 |

## 工作流示例

### 场景：开发新功能

```bash
# 1. 头脑风暴 - 设计阶段
./switch-skill.sh brainstorming
gemini "我想添加用户登录功能，应该怎么设计？"

# 2. 编写实现计划
./switch-skill.sh writing-plans
gemini "根据刚才的设计，帮我写详细的实现计划"

# 3. 创建工作区
./switch-skill.sh using-git-worktrees
gemini "为新功能创建隔离的工作区"

# 4. 执行开发
./switch-skill.sh executing-plans
gemini "按照计划开始实现这个功能"

# 5. 完成分支
./switch-skill.sh finishing-a-development-branch
gemini "功能开发完成了，帮我收尾"
```

### 场景：调试问题

```bash
# 1. 系统化调试
./switch-skill.sh systematic-debugging
gemini "我的测试失败了，帮我找出原因"

# 2. 验证修复
./switch-skill.sh verification-before-completion
gemini "修复完成了，帮我验证是否真正解决了问题"
```

## 与 Claude Code Superpowers 的差异

| 特性 | Claude Code | Gemini CLI 适配版 |
|------|-------------|------------------|
| 技能触发 | 自动检测 | 手动切换 |
| 技能间调用 | `Skill` 工具 | 切换系统提示词 |
| 任务跟踪 | `TodoWrite` | 手动跟踪 |
| 子代理 | 原生支持 | 需手动启动新会话 |

## 高级配置

### 持久化技能选择

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
# 默认技能
export GEMINI_SYSTEM_MD="$HOME/gemini-skills/brainstorming.md"

# 快速切换函数
gskill() {
    export GEMINI_SYSTEM_MD="$HOME/gemini-skills/$1.md"
    echo "✅ 已切换到技能: $1"
}
```

使用：
```bash
gskill writing-plans
gemini "..."
```

### 技能组合

可以创建组合技能文件：

```markdown
# combined-tdd-and-review.md

## Instructions

合并以下两个技能的工作流：
1. test-driven-development
2. requesting-code-review

在编写代码时严格遵循 TDD，每个任务完成后请求代码审查。
```

## 注意事项

1. **手动切换** - Gemini CLI 不支持自动技能检测，需要手动切换
2. **上下文限制** - 切换技能会重置会话上下文
3. **子代理** - 需要在新的 Gemini 会话中手动启动

## 许可证

本适配器基于 Superpowers 的 MIT 许可证。
Superpowers 原项目：https://github.com/obra/superpowers
