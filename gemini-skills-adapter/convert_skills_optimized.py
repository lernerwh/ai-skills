#!/usr/bin/env python3
"""
Superpowers 技能转 Gemini CLI 优化版中英双语系统提示词

策略 1：注释式双语（推荐）
- 英文正文保持不变
- 关键术语添加中文注释
- 重要段落提供中文翻译
- 代码/命令完全不触碰
"""

import os
import re
from pathlib import Path
from typing import List, Tuple


class OptimizedBilingualConverter:
    """优化版中英双语转换器"""

    # 技能名称翻译
    SKILL_NAMES = {
        'brainstorming': '头脑风暴',
        'writing-plans': '编写计划',
        'systematic-debugging': '系统化调试',
        'test-driven-development': '测试驱动开发',
        'using-git-worktrees': '使用 Git 工作树',
        'subagent-driven-development': '子代理驱动开发',
        'executing-plans': '执行计划',
        'verification-before-completion': '完成前验证',
        'requesting-code-review': '请求代码审查',
        'receiving-code-review': '接收代码审查',
        'finishing-a-development-branch': '完成开发分支',
        'dispatching-parallel-agents': '分发并行任务',
        'writing-skills': '编写技能',
        'using-superpowers': '使用 Superpowers',
    }

    # 标题翻译（用于添加注释）
    TITLE_TRANSLATIONS = {
        'Overview': '概述',
        'Core principle': '核心原则',
        'When to Use': '使用时机',
        'The Process': '流程',
        'Instructions': '指令',
        'Description': '描述',
        'Key Principles': '关键原则',
        'Important Notes': '重要说明',
        'Red-Green-Refactor': '红绿重构循环',
        'The Iron Law': '铁律',
        'Exceptions': '例外情况',
    }

    # 重要段落翻译（英文 -> 中文）
    PARAGRAPH_TRANSLATIONS = {
        # brainstorming
        "Help turn ideas into fully formed designs and specs through natural collaborative dialogue.":
            "【通过自然的对话协作，将想法转化为完整的设计和规格】",

        "Start by understanding the current project context, then ask questions one at a time to refine the idea.":
            "【首先了解当前项目状态，然后逐个提问来完善想法】",

        "Once you understand what you're building, present the design in small sections (200-300 words), checking after each section whether it looks right so far.":
            "【一旦你理解了要构建的内容，分段展示设计（每段 200-300 字），每段后确认是否正确】",

        # TDD
        "Write the test first. Watch it fail. Write minimal code to pass.":
            "【先写测试。看它失败。编写最小代码让它通过】",

        "Core principle: If you didn't watch the test fail, you don't know if it tests the right thing.":
            "【核心原则：如果你没有看到测试失败，你就不知道它是否测试了正确的东西】",

        "Violating the letter of the rules is violating the spirit of the rules.":
            "【违反规则的字面意思就是违反规则的精神】",

        "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST":
            "【没有失败的测试，就不写生产代码】",

        "Write code before the test? Delete it. Start over.":
            "【在测试之前写了代码？删除它。重新开始】",

        # debugging
        "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes.":
            "【遇到任何 bug、测试失败或意外行为时使用，在提出修复方案之前】",

        # general
        "Follow these instructions EXACTLY":
            "【严格遵循这些指令】",

        "Do not skip any steps":
            "【不要跳过任何步骤】",

        "If the workflow doesn't apply to the current task, state that clearly":
            "【如果工作流程不适用于当前任务，明确说明】",

        # writing-plans
        "Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste.":
            "【编写全面的实现计划，假设工程师对代码库零背景且品味存疑】",

        "Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it.":
            "【记录他们需要知道的一切：每个任务要修改哪些文件、代码、测试、文档、如何测试】",

        # systematic-debugging
        "A 4-phase process for finding root causes of bugs and unexpected behavior.":
            "【一个 4 阶段流程，用于找出 bug 和意外行为的根本原因】",
    }

    def __init__(self, source_dir: str, output_dir: str):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def parse_skill_md(self, content: str) -> Tuple[dict, str]:
        """解析 SKILL.md 的 frontmatter 和 body"""
        frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
        if not frontmatter_match:
            return {}, content

        frontmatter_text = frontmatter_match.group(1)
        body = frontmatter_match.group(2)

        metadata = {}
        for line in frontmatter_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                metadata[key.strip()] = value.strip()

        return metadata, body

    def add_title_translation(self, line: str) -> str:
        """为标题添加中文注释"""
        for en_title, zh_title in self.TITLE_TRANSLATIONS.items():
            # 匹配 ## Title 或 ### Title 格式
            pattern = r'^(#{2,4})\s+' + re.escape(en_title) + r'\s*$'
            match = re.match(pattern, line, re.MULTILINE)
            if match:
                hashes = match.group(1)
                return f"{hashes} {en_title} ({zh_title})"

        return line

    def add_paragraph_translation(self, line: str) -> str:
        """为重要段落添加中文翻译（作为行尾注释）"""
        stripped = line.strip()

        # 检查是否是需要翻译的段落
        for en_paragraph, zh_translation in self.PARAGRAPH_TRANSLATIONS.items():
            if en_paragraph in stripped:
                # 避免重复添加
                if '【' not in line:
                    return line + '\n' + zh_translation

        return line

    def is_code_block(self, line: str, in_code_block: bool, code_block_lang: str) -> Tuple[bool, bool, str]:
        """
        判断是否在代码块中
        返回: (是代码块边界行, 新的 in_code_block 状态, 代码块语言)
        """
        if line.strip().startswith('```'):
            if in_code_block:
                # 代码块结束
                return True, False, ''
            else:
                # 代码块开始，提取语言
                lang_match = re.match(r'^```\s*(\w+)?', line.strip())
                lang = lang_match.group(1) if lang_match and lang_match.group(1) else ''
                return True, True, lang
        # 代码块内的行（非边界）
        return False, in_code_block, code_block_lang

    def is_list_item(self, line: str) -> bool:
        """判断是否是列表项"""
        return re.match(r'^\s*[-*]\s+', line) is not None

    def translate_heading_with_term(self, line: str) -> str:
        """翻译包含技术术语的标题"""
        # 处理类似 "### RED - Write Failing Test" 的格式
        match = re.match(r'^(#{2,4})\s+([A-Z-]+)\s+-\s+(.+)$', line)
        if match:
            hashes, term, description = match.groups()
            # 为术语添加中文注释
            term_translations = {
                'RED': 'RED (红 - 编写失败的测试)',
                'GREEN': 'GREEN (绿 - 编写最小代码)',
                'REFACTOR': 'REFACTOR (重构 - 清理代码)',
            }
            translated_term = term_translations.get(term, term)
            return f"{hashes} {translated_term} - {description}"

        return line

    def replace_superpowers_references(self, line: str) -> str:
        """替换 superpowers: 引用为 Gemini CLI 兼容格式"""
        # superpowers:skill-name -> 切换到技能 skill-name.md
        # 处理可能的前缀（如 > 或其他 markdown 标记）
        # 使用非贪婪匹配来保护前缀和后缀
        line = re.sub(
            r'superpowers:([a-zA-Z-]+)',
            r'切换到技能 \1.md (使用 gskill \1)',
            line
        )

        return line

    def convert_skill_to_bilingual(self, skill_path: Path) -> str:
        """转换单个技能为优化版双语格式"""
        with open(skill_path, 'r', encoding='utf-8') as f:
            content = f.read()

        metadata, body = self.parse_skill_md(content)
        skill_name = metadata.get('name', skill_path.parent.name)
        description = metadata.get('description', '')
        skill_name_zh = self.SKILL_NAMES.get(skill_name, skill_name)

        # 处理正文
        lines = body.split('\n')
        translated_lines = []
        in_code_block = False
        code_block_lang = ''

        for i, line in enumerate(lines):
            # 检查代码块状态
            is_boundary, in_code_block, code_block_lang = self.is_code_block(line, in_code_block, code_block_lang)

            if is_boundary:
                # ``` 标记行直接添加
                translated_lines.append(line)
                continue

            if in_code_block:
                # 在代码块中
                if code_block_lang == 'markdown':
                    # markdown 代码块需要替换 superpowers: 引用
                    translated_lines.append(self.replace_superpowers_references(line))
                else:
                    # 其他语言代码块完全不动
                    translated_lines.append(line)
                continue

            # 不在代码块中，正常处理
            # 处理标题（添加中文注释）
            new_line = self.add_title_translation(line)

            # 处理包含技术术语的标题
            new_line = self.translate_heading_with_term(new_line)

            # 替换 superpowers: 引用
            new_line = self.replace_superpowers_references(new_line)

            # 处理重要段落（添加中文翻译）
            if not self.is_list_item(new_line) and not new_line.startswith('#'):
                new_line = self.add_paragraph_translation(new_line)

            translated_lines.append(new_line)

        # 构建最终内容
        bilingual_format = f"""# {skill_name.replace('-', ' ').title()} ({skill_name_zh})

## Description / 描述
{description}

## Instructions / 指令

{chr(10).join(translated_lines)}

---

## 使用说明 / Usage Notes

### 技能触发 / When to Use
{description}

### 注意事项 / Important Notes
- Follow all instructions exactly / 严格遵循所有指令
- Code blocks and commands remain in English / 代码块和命令保持英文
- Technical terms are kept in original form / 技术术语保持原形式
- Skill references use gskill command / 技能引用使用 gskill 命令
"""

        return bilingual_format

    def convert_all(self):
        """转换所有技能"""
        skill_files = list(self.source_dir.glob('*/SKILL.md'))

        print(f"Found {len(skill_files)} skills to convert")
        print("Using optimized bilingual strategy (注释式双语)\n")

        for skill_file in skill_files:
            metadata, _ = self.parse_skill_md(skill_file.read_text(encoding='utf-8'))
            skill_name = metadata.get('name', skill_file.parent.name)
            skill_name_zh = self.SKILL_NAMES.get(skill_name, skill_name)

            # 转换
            bilingual_prompt = self.convert_skill_to_bilingual(skill_file)

            # 保存
            output_file = self.output_dir / f"{skill_name}.md"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(bilingual_prompt)

            print(f"  [OK] {skill_name_zh} ({skill_name}) -> {output_file.name}")

        # 生成使用说明
        self._generate_usage_guide(len(skill_files))

        print(f"\n[OK] Conversion complete! Skills saved to: {self.output_dir}")

    def _generate_usage_guide(self, skill_count: int):
        """生成使用指南"""
        guide = f"""# Superpowers 技能集 - Gemini CLI 双语版

本目录包含 {skill_count} 个 Superpowers 技能的优化版中英双语版本。

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
$env:GEMINI_SYSTEM_MD = "$(Get-Location)\test-driven-development.md"
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
gskill() {{
    export GEMINI_SYSTEM_MD="$HOME/gemini-skills-bilingual/$1.md"
    echo "[OK] 已切换到技能: $1"
}}
```

使用：
```bash
gskill systematic-debugging
gemini "帮我调试这个问题"
```

## 技能列表

"""

        for skill_name_en, skill_name_zh in sorted(self.SKILL_NAMES.items()):
            guide += f"- **{skill_name_zh}** (`{skill_name_en}.md`)\n"

        guide += f"""
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
"""

        guide_path = self.output_dir / "README.md"
        with open(guide_path, 'w', encoding='utf-8') as f:
            f.write(guide)

        # 复制切换脚本
        self._copy_switch_scripts()


    def _copy_switch_scripts(self):
        """复制切换脚本到输出目录"""
        script_dir = Path(__file__).parent

        # 复制 shell 脚本
        sh_script = script_dir / "gemini-skills" / "switch-skill.sh"
        if sh_script.exists():
            import shutil
            shutil.copy(sh_script, self.output_dir / "switch-skill.sh")

        # 复制 bat 脚本
        bat_script = script_dir / "gemini-skills" / "switch-skill.bat"
        if bat_script.exists():
            import shutil
            shutil.copy(bat_script, self.output_dir / "switch-skill.bat")


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="将 Superpowers 技能转换为 Gemini CLI 优化版中英双语系统提示词"
    )
    parser.add_argument(
        '--source',
        default='C:/Users/90956/.claude/plugins/cache/superpowers-marketplace/superpowers/4.2.0/skills',
        help='Superpowers 技能目录'
    )
    parser.add_argument(
        '--output',
        default='gemini-skills-bilingual',
        help='输出目录'
    )

    args = parser.parse_args()

    converter = OptimizedBilingualConverter(args.source, args.output)
    converter.convert_all()


if __name__ == '__main__':
    main()
