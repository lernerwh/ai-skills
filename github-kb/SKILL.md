---
name: github-kb
description: Use when searching GitHub for code examples, documentation, discussions, or solutions related to the user's question. Automatically triggers when context indicates need for implementation patterns, debugging help, technology selection, or best practices.
---

# GitHub Knowledge Base Search Skill

智能搜索 GitHub 代码示例、文档、讨论和解决方案的 skill。

## 触发条件

此 skill 在以下情况下自动触发:

1. **实现类问题**: 用户询问如何实现某个功能
   - "如何实现用户认证?"
   - "怎么写 React hooks?"
   - "how to implement OAuth?"

2. **调试类问题**: 用户遇到错误或 bug
   - "为什么我的代码报错?"
   - "useEffect 出现问题"
   - "bug in authentication"

3. **选型类问题**: 用户询问使用什么技术或库
   - "用什么状态管理?"
   - "哪个 HTTP 库好?"
   - "推荐方案"

4. **最佳实践**: 用户寻求建议或推荐
   - "有什么建议?"
   - "最佳实践?"
   - "推荐做法"

## 使用场景

- 搜索代码示例和实现模式
- 查找调试问题和解决方案
- 技术选型和库推荐
- 学习最佳实践和设计模式
- 探索热门项目和开源工具

## 搜索策略

skill 会根据问题类型自动选择最佳搜索组合:

| 问题类型 | 搜索目标 | 查询优化 |
|---------|---------|---------|
| 实现类 | Code + Repositories | 添加 "example" |
| 调试类 | Issues + Discussions | 添加 "error fix" |
| 选型类 | Repositories | 添加 "stars:>100" |
| 最佳实践 | Code + README | 添加 "best practices" |

## 输出格式

提供三层结果呈现:

1. **摘要层**: 总数统计、分类、关键发现
2. **详情层**: Top 结果的详细信息 (代码示例、项目描述、讨论摘要)
3. **链接层**: 原始 GitHub 链接

## 配置

需要设置 `GITHUB_TOKEN` 环境变量:

```bash
export GITHUB_TOKEN=your_token_here
```

获取 token: https://github.com/settings/tokens

## 限制

- GitHub API 速率限制: 5000 次/小时 (认证请求)
- Discussions 搜索使用 Issues 作为临时替代方案
- 每次搜索最多返回 100 个结果
