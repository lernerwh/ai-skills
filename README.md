# AI Skills Collection

这是我的个人 AI 技能集合，供 Claude Code 和其他 AI 助手使用。

## 📦 包含的技能

### 🤖 Skill Generator (skill-generator)
**元技能** - 让 AI 自动创建新技能的技能。

**功能**：
- 根据用户需求自动生成新技能模板
- 提供技能命名规范和最佳实践
- 自动生成 SKILL.md 和 README.md
- 支持带代码实现的复杂技能

**使用场景**：
- 用户说"帮我创建一个xxx技能"
- AI 识别到重复性任务需要自动化
- 需要快速搭建新技能框架

**示例**：
```
"帮我创建一个日志分析技能"
"写一个自动生成单元测试的skill"
```

### 🔍 GitHub Knowledge Base (github-kb)
从 GitHub 仓库中搜索和检索代码示例、文档、讨论和解决方案的技能。

**功能**：
- 搜索 GitHub 上的代码示例
- 查找技术文档和最佳实践
- 检索问题讨论和解决方案

**使用场景**：
- 需要查找实现示例时
- 遇到技术问题需要参考解决方案时
- 学习新的技术栈或库的使用方法时

## 🚀 在其他终端安装

### 方法 1：克隆到本地

```bash
# 克隆这个仓库到你的技能目录
git clone https://github.com/lernerwh/ai-skills.git ~/.claude/skills
```

### 方法 2：手动复制技能

```bash
# 复制特定技能到你的 AI 助手技能目录
cp -r ai-skills/github-kb /path/to/your/skills/directory/
```

## 📝 技能结构

```
ai-skills/
├── skill-generator/     # 技能生成器 (元技能)
│   ├── skills/
│   │   └── skill-generator/
│   │       ├── SKILL.md        # 技能定义文件
│   │       ├── README.md       # 技能使用说明
│   │       └── skill-template.md  # 技能模板
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── package.json
├── github-kb/           # GitHub 知识库技能
│   ├── skills/
│   │   └── github-kb/
│   │       ├── SKILL.md        # 技能定义文件
│   │       ├── README.md       # 技能使用说明
│   │       ├── src/            # 源代码
│   │       └── dist/           # 编译输出
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── package.json
└── README.md           # 仓库总说明
```

## 🔧 添加新技能

1. 在仓库中创建新目录：`your-skill-name/`
2. 添加 `SKILL.md` 定义文件
3. 添加 `README.md` 使用说明
4. 提交并推送

## 📄 许可证

Copyright © 2026 lernerwh

---

**最后更新**: 2026-01-28
