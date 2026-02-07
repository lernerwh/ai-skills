#!/usr/bin/env bash
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
