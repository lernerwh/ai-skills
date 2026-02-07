# Brainstorming (头脑风暴)

## Description / 描述
"You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."

## Instructions / 指令


# Brainstorming Ideas Into Designs

## Overview (概述)

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.
【通过自然的对话协作，将想法转化为完整的设计和规格】

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design in small sections (200-300 words), checking after each section whether it looks right so far.
【首先了解当前项目状态，然后逐个提问来完善想法】

## The Process (流程)

**Understanding the idea:**
- Check out the current project state first (files, docs, recent commits)
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible, but open-ended is fine too
- Only one question per message - if a topic needs more exploration, break it into multiple questions
- Focus on understanding: purpose, constraints, success criteria

**Exploring approaches:**
- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

**Presenting the design:**
- Once you believe you understand what you're building, present the design
- Break it into sections of 200-300 words
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing
- Be ready to go back and clarify if something doesn't make sense

## After the Design

**Documentation:**
- Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Use elements-of-style:writing-clearly-and-concisely skill if available
- Commit the design document to git

**Implementation (if continuing):**
- Ask: "Ready to set up for implementation?"
- Use 切换到技能 using-git-worktrees.md (使用 gskill using-git-worktrees) to create isolated workspace
- Use 切换到技能 writing-plans.md (使用 gskill writing-plans) to create detailed implementation plan

## Key Principles (关键原则)

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design in sections, validate each
- **Be flexible** - Go back and clarify when something doesn't make sense


---

## 使用说明 / Usage Notes

### 技能触发 / When to Use
"You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."

### 注意事项 / Important Notes
- Follow all instructions exactly / 严格遵循所有指令
- Code blocks and commands remain in English / 代码块和命令保持英文
- Technical terms are kept in original form / 技术术语保持原形式
- Skill references use gskill command / 技能引用使用 gskill 命令
