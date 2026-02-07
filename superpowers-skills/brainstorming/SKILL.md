---
name: brainstorming
description: Use when starting any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
---

# Brainstorming (头脑风暴)

## Overview (概述)

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.
【通过自然的对话协作，将想法转化为完整的设计和规格】

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design in small sections (200-300 words), checking after each section whether it looks right so far.
【首先了解当前项目状态，然后逐个提问来完善想法】

## When to Use (使用时机)

**Mandatory before:**
- Creating new features
- Building components
- Adding functionality
- Modifying behavior
- Any creative implementation work

**Violating this rule means:** Implementing without understanding requirements, leading to rework.

## The Process (流程)

### Understanding the idea
- Check out the current project state first (files, docs, recent commits)
- Ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible, but open-ended is fine too
- Only one question per message - if a topic needs more exploration, break it into multiple questions
- Focus on understanding: purpose, constraints, success criteria

### Exploring approaches
- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

### Presenting the design
- Once you believe you understand what you're building, present the design
- Break it into sections of 200-300 words
- Ask after each section whether it looks right so far
- Cover: architecture, components, data flow, error handling, testing
- Be ready to go back and clarify if something doesn't make sense

## After the Design

### Documentation
- Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Use skill: writing-plans for detailed implementation planning
- Commit the design document to git

### Implementation (if continuing)
- Ask: "Ready to set up for implementation?"
- Use skill: using-git-worktrees to create isolated workspace
- Use skill: writing-plans to create detailed implementation plan

## Key Principles (关键原则)

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design in sections, validate each
- **Be flexible** - Go back and clarify when something doesn't make sense

## Related Skills

- **using-git-worktrees** - Create isolated workspace for implementation
- **writing-plans** - Create detailed implementation plan from design

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Asking multiple questions at once | One question per message |
| Skipping project context check | Always check current state first |
| Presenting entire design at once | Break into 200-300 word sections |
| No alternative approaches | Always propose 2-3 options with trade-offs |
| Assuming without verifying | Ask after each section if it looks right |

## Red Flags

**Never:**
- Skip asking questions to "save time"
- Present complete design without validation checkpoints
- Assume constraints without asking
- Skip exploring alternatives
- Jump to implementation without approved design

**Always:**
- Check project context first
- One question per message
- Validate design in sections
- Explore 2-3 approaches
- Get approval before proceeding to implementation
