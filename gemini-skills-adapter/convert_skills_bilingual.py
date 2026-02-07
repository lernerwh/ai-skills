#!/usr/bin/env python3
"""
Superpowers 技能转 Gemini CLI 中英双语系统提示词

策略：
- 指令说明：中文
- 技术术语：保持英文
- 代码/命令：保持英文
- 重要概念：双语标注
"""

import os
import re
import glob
from pathlib import Path
from datetime import datetime


class BilingualConverter:
    """中英双语转换器"""

    # 术语翻译表（保持英文的术语）
    KEEP_ENGLISH_TERMS = {
        # TDD 相关
        'Test-Driven Development': 'Test-Driven Development (TDD 测试驱动开发)',
        'Red-Green-Refactor': 'Red-Green-Refactor (红绿重构循环)',
        'failing test': 'failing test (失败的测试)',
        'production code': 'production code (生产代码)',
        'RED': 'RED (红 - 编写失败的测试)',
        'GREEN': 'GREEN (绿 - 编写最小代码)',
        'REFACTOR': 'REFACTOR (重构 - 清理代码)',

        # Git 相关
        'worktree': 'worktree (工作树)',
        'commit': 'commit (提交)',
        'branch': 'branch (分支)',
        'merge': 'merge (合并)',

        # 开发流程
        'brainstorming': 'brainstorming (头脑风暴)',
        'debugging': 'debugging (调试)',
        'code review': 'code review (代码审查)',
        'subagent': 'subagent (子代理)',

        # 技能名称
        'writing-plans': 'writing-plans (编写计划)',
        'executing-plans': 'executing-plans (执行计划)',
        'systematic-debugging': 'systematic-debugging (系统化调试)',
        'test-driven-development': 'test-driven-development (测试驱动开发)',
        'using-git-worktrees': 'using-git-worktrees (使用 Git 工作树)',
    }

    # 完整段落翻译
    TRANSLATIONS = {
        # brainstorming
        "Help turn ideas into fully formed designs and specs through natural collaborative dialogue.":
            "通过自然的对话协作，将想法转化为完整的设计和规格。",

        "Start by understanding the current project context, then ask questions one at a time to refine the idea.":
            "首先了解当前项目状态，然后逐个提问来完善想法。",

        "Ask questions one at a time to refine the idea.":
            "每次只问一个问题来完善想法。",

        "Only one question per message - if a topic needs more exploration, break it into multiple questions.":
            "每条消息只提一个问题 - 如果主题需要更多探索，拆分成多个问题。",

        # TDD
        "Write the test first. Watch it fail. Write minimal code to pass.":
            "先写测试。看它失败。编写最小代码让它通过。",

        "Core principle: If you didn't watch the test fail, you don't know if it tests the right thing.":
            "核心原则：如果你没有看到测试失败，你就不知道它是否测试了正确的东西。",

        "Violating the letter of the rules is violating the spirit of the rules.":
            "违反规则的字面意思就是违反规则的精神。",

        "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST":
            "没有失败的测试，就不写生产代码",

        "Write code before the test? Delete it. Start over.":
            "在测试之前写了代码？删除它。重新开始。",

        # debugging
        "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes.":
            "遇到任何 bug、测试失败或意外行为时使用，在提出修复方案之前。",

        # general
        "Follow these instructions EXACTLY":
            "严格遵循这些指令",

        "Do not skip any steps":
            "不要跳过任何步骤",

        "If the workflow doesn't apply to the current task, state that clearly":
            "如果工作流程不适用于当前任务，明确说明",
    }

    def __init__(self, source_dir: str, output_dir: str):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def parse_skill_md(self, content: str) -> tuple[dict, str]:
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

    def translate_line(self, line: str) -> str:
        """翻译单行文本（混合策略）"""
        # 首先检查完整段落翻译
        line_stripped = line.strip()
        if line_stripped in self.TRANSLATIONS:
            return self.TRANSLATIONS[line_stripped]

        # 检查是否是代码行（保持英文）
        if self._is_code_line(line):
            return line

        # 替换术语
        result = line
        for en_term, bilingual in self.KEEP_ENGLISH_TERMS.items():
            result = re.sub(
                r'\b' + re.escape(en_term) + r'\b',
                bilingual,
                result,
                flags=re.IGNORECASE
            )

        return result

    def _is_code_line(self, line: str) -> bool:
        """判断是否是代码行"""
        code_indicators = [
            'def ', 'class ', 'function ', 'const ', 'let ', 'var ',
            'npm test', 'git commit', 'git add', 'pytest', 'jest',
            '```', 'test(', 'describe(', 'it(',
            '#!/', '/bin/', 'import ', 'from ',
        ]
        return any(indicator in line for indicator in code_indicators)

    def translate_block(self, block: str) -> str:
        """翻译文本块"""
        lines = block.split('\n')
        translated_lines = []

        for line in lines:
            # 跳过代码块
            if line.strip().startswith('```'):
                translated_lines.append(line)
                # 查找代码块结束
                # 这里简化处理，实际需要更复杂的状态机
                continue

            # 跳过纯代码行
            if self._is_code_line(line):
                translated_lines.append(line)
            else:
                translated_lines.append(self.translate_line(line))

        return '\n'.join(translated_lines)

    def convert_skill_to_bilingual(self, skill_path: Path) -> str:
        """转换单个技能为中英双语格式"""
        with open(skill_path, 'r', encoding='utf-8') as f:
            content = f.read()

        metadata, body = self.parse_skill_md(content)
        skill_name = metadata.get('name', skill_path.parent.name)
        description = metadata.get('description', '')

        # 转换为双语格式
        bilingual_format = f"""# {skill_name.replace('-', ' ').title()}

## Description / 描述
{description}

## Instructions / 指令

{self.translate_block(body)}

## Important Notes / 重要说明
- Follow these instructions EXACTLY / 严格遵循这些指令
- Do not skip any steps / 不要跳过任何步骤
- If the workflow doesn't apply to the current task, state that clearly / 如果工作流程不适用，明确说明
"""
        return bilingual_format

    def convert_all(self):
        """转换所有技能"""
        skill_files = list(self.source_dir.glob('*/SKILL.md'))

        print(f"Found {len(skill_files)} skills to convert")

        for skill_file in skill_files:
            metadata, _ = self.parse_skill_md(skill_file.read_text(encoding='utf-8'))
            skill_name = metadata.get('name', skill_file.parent.name)

            # 转换
            bilingual_prompt = self.convert_skill_to_bilingual(skill_file)

            # 保存
            output_file = self.output_dir / f"{skill_name}.md"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(bilingual_prompt)

            print(f"  [OK] Converted: {skill_name} -> {output_file.name}")

        print(f"\n[OK] Done! Skills saved to: {self.output_dir}")


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="将 Superpowers 技能转换为 Gemini CLI 中英双语系统提示词"
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

    converter = BilingualConverter(args.source, args.output)
    converter.convert_all()


if __name__ == '__main__':
    main()
