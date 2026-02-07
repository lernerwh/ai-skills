#!/usr/bin/env python3
"""
Superpowers 技能转 Gemini CLI 系统提示词

将 SKILL.md 转换为 Gemini CLI 兼容的系统提示词格式
"""

import os
import re
import glob
import shutil
from pathlib import Path
from datetime import datetime


class SuperpowersConverter:
    """Superpowers 技能转 Gemini 格式转换器"""

    def __init__(self, source_dir: str, output_dir: str):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def parse_skill_md(self, content: str) -> tuple[dict, str]:
        """解析 SKILL.md 的 frontmatter 和 body"""
        # 提取 YAML frontmatter
        frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
        if not frontmatter_match:
            return {}, content

        frontmatter_text = frontmatter_match.group(1)
        body = frontmatter_match.group(2)

        # 解析 YAML
        metadata = {}
        for line in frontmatter_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                metadata[key.strip()] = value.strip()

        return metadata, body

    def convert_skill_to_gemini_format(self, skill_path: Path) -> str:
        """转换单个技能为 Gemini 系统提示词格式"""
        with open(skill_path, 'r', encoding='utf-8') as f:
            content = f.read()

        metadata, body = self.parse_skill_md(content)
        skill_name = metadata.get('name', skill_path.parent.name)
        description = metadata.get('description', '')

        # 转换为 Gemini 系统提示词格式
        gemini_format = f"""# {skill_name.replace('-', ' ').title()}

## Description
{description}

## Instructions

{self._process_body(body)}

## Important Notes
- Follow these instructions EXACTLY
- Do not skip any steps
- If the workflow doesn't apply to the current task, state that clearly
"""
        return gemini_format

    def _process_body(self, body: str) -> str:
        """处理技能内容，移除特定于 Claude 的引用"""
        # 移除 superpowers: 技能引用
        body = re.sub(r'superpowers:[\w-]+', '[RELATED WORKFLOW]', body)

        # 移除 Skill 工具引用
        body = re.sub(r'Skill\([^)]+\)', '[Use related workflow]', body)

        # 移除 TodoWrite 引用
        body = re.sub(r'TodoWrite\([^)]+\)', '[Track this task]', body)

        return body

    def convert_all(self):
        """转换所有技能"""
        skill_files = list(self.source_dir.glob('*/SKILL.md'))

        print(f"Found {len(skill_files)} skills to convert")

        for skill_file in skill_files:
            metadata, _ = self.parse_skill_md(skill_file.read_text(encoding='utf-8'))
            skill_name = metadata.get('name', skill_file.parent.name)

            # 转换
            gemini_prompt = self.convert_skill_to_gemini_format(skill_file)

            # 保存
            output_file = self.output_dir / f"{skill_name}.md"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(gemini_prompt)

            print(f"  [OK] Converted: {skill_name} -> {output_file.name}")

        # 生成技能切换脚本
        self._generate_switch_script()

        # 生成索引
        self._generate_index(skill_files)

        print(f"\n[OK] Done! Skills saved to: {self.output_dir}")

    def _generate_switch_script(self):
        """生成技能切换脚本"""
        script_content = """#!/usr/bin/env bash
# Superpowers 技能切换脚本
# 用法: ./switch-skill.sh <skill-name>

SKILLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="$1"

if [ -z "$SKILL_NAME" ]; then
    echo "用法: $0 <skill-name>"
    echo ""
    echo "可用技能:"
    ls -1 "$SKILLS_DIR"/*.md | xargs -n1 basename | sed 's/.md$//' | grep -v switch-skill
    exit 1
fi

SKILL_FILE="$SKILLS_DIR/${SKILL_NAME}.md"

if [ ! -f "$SKILL_FILE" ]; then
    echo "❌ 技能不存在: $SKILL_NAME"
    echo ""
    echo "可用技能:"
    ls -1 "$SKILLS_DIR"/*.md | xargs -n1 basename | sed 's/.md$//' | grep -v switch-skill
    exit 1
fi

export GEMINI_SYSTEM_MD="$SKILL_FILE"
echo "✅ 已切换到技能: $SKILL_NAME"
echo "   系统提示词: $SKILL_FILE"
"""

        script_path = self.output_dir / "switch-skill.sh"
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script_content)

        # Windows 版本
        batch_content = """@echo off
REM Superpowers 技能切换脚本 (Windows)
REM 用法: switch-skill.bat <skill-name>

setlocal
set "SKILLS_DIR=%~dp0"
set "SKILL_NAME=%~1"

if "%SKILL_NAME%"=="" (
    echo 用法: %~nx0 ^<skill-name^>
    echo.
    echo 可用技能:
    dir /b "%SKILLS_DIR%*.md" | findstr /v "switch-skill"
    exit /b 1
)

set "SKILL_FILE=%SKILLS_DIR%%SKILL_NAME%.md"

if not exist "%SKILL_FILE%" (
    echo ❌ 技能不存在: %SKILL_NAME%
    echo.
    echo 可用技能:
    dir /b "%SKILLS_DIR%*.md" | findstr /v "switch-skill"
    exit /b 1
)

set GEMINI_SYSTEM_MD=%SKILL_FILE%
echo ✅ 已切换到技能: %SKILL_NAME%
echo    系统提示词: %SKILL_FILE%
"""

        batch_path = self.output_dir / "switch-skill.bat"
        with open(batch_path, 'w', encoding='utf-8') as f:
            f.write(batch_content)

    def _generate_index(self, skill_files):
        """生成技能索引文件"""
        index_content = "# Superpowers 技能索引\n\n"
        index_content += "这是为 Gemini CLI 转换的 Superpowers 技能集。\n\n"
        index_content += "## 使用方法\n\n"
        index_content += "```bash\n# 切换到某个技能\nexport GEMINI_SYSTEM_MD=/path/to/skill.md\n\n"
        index_content += "# 或使用切换脚本\n./switch-skill.sh brainstorming\n```\n\n"
        index_content += "## 技能列表\n\n"

        for skill_file in skill_files:
            metadata, _ = self.parse_skill_md(skill_file.read_text(encoding='utf-8'))
            skill_name = metadata.get('name', skill_file.parent.name)
            description = metadata.get('description', '')

            index_content += f"### {skill_name}\n\n"
            index_content += f"**描述:** {description}\n\n"
            index_content += f"**文件:** `{skill_name}.md`\n\n"

        index_path = self.output_dir / "INDEX.md"
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(index_content)


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="将 Superpowers 技能转换为 Gemini CLI 系统提示词格式"
    )
    parser.add_argument(
        '--source',
        default='C:/Users/90956/.claude/plugins/cache/superpowers-marketplace/superpowers/4.2.0/skills',
        help='Superpowers 技能目录'
    )
    parser.add_argument(
        '--output',
        default='gemini-skills',
        help='输出目录'
    )

    args = parser.parse_args()

    converter = SuperpowersConverter(args.source, args.output)
    converter.convert_all()


if __name__ == '__main__':
    main()
