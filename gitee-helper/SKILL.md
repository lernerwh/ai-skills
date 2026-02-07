---
name: gitee-helper
description: Gitee 代码托管平台辅助工具。使用 Playwright 自动化登录 Gitee，查询提交信息、获取代码变更统计等操作。需要环境变量 GITEE_USER 和 GITEE_PSW 配置账号密码。
---

# Gitee Helper

Gitee 代码托管平台的自动化辅助工具，基于 Playwright MCP 实现浏览器自动化操作。

## 环境要求

- **Playwright MCP**: 需要配置 Playwright MCP 服务器
- **环境变量**:
  - `GITEE_USER`: Gitee 账号（邮箱/手机号）
  - `GITEE_PSW`: Gitee 密码

## 功能

### 1. 登录 Gitee

自动登录 Gitee 账号。

**执行步骤**:
1. 导航到 `https://gitee.com/login`
2. 填写账号：从环境变量 `GITEE_USER` 获取
3. 填写密码：从环境变量 `GITEE_PSW` 获取
4. 点击登录按钮
5. 验证登录成功（检查是否跳转到用户工作台）

**关键点**:
- 密码输入框有前端加密 (`data-encrypt="true"`)，需触发 input/change 事件激活加密
- 登录成功后页面会跳转到用户工作台

### 2. 查询提交统计

获取指定提交的代码变更统计信息。

**输入参数**: Gitee 提交页面 URL
- 格式: `https://gitee.com/{用户}/{仓库}/commit/{哈希}`

**输出格式**: 精简统计
```
{文件数量} 个文件发生了变化，影响行数： +{新增行数} -{删除行数}
```

**执行步骤**:
1. 确保已登录 Gitee
2. 导航到提交页面
3. 使用 XPath `//*[@id="commit-show"]/div/div[5]/div/div[2]` 获取统计元素
4. 提取并返回统计文本

**关键 XPath**:
```javascript
const xpath = '//*[@id="commit-show"]/div/div[5]/div/div[2]';
const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
const element = result.singleNodeValue;
element.textContent.trim();
```

### 3. 获取提交列表

获取仓库分支的提交列表。

**输入参数**: Gitee 提交列表页面 URL
- 格式: `https://gitee.com/{用户}/{仓库}/commits/{分支}`

**输出格式**: 提交列表数组
```javascript
[
  { hash: "abc123", title: "提交标题", author: "作者", time: "时间" },
  ...
]
```

**执行步骤**:
1. 确保已登录 Gitee
2. 导航到 commits 列表页面
3. 提取每个 commit 的链接、标题、作者、时间等信息
4. 返回提交列表

**关键选择器**: 查找包含 commit 链接的元素

### 4. 批量查询提交统计

获取提交列表后，批量查询每个提交的统计信息。

**执行步骤**:
1. 先调用"获取提交列表"功能
2. 遍历提交列表，挨个调用"查询提交统计"功能
3. 汇总所有统计信息并返回

**输出格式**:
```
提交 1: {hash} - {统计信息}
提交 2: {hash} - {统计信息}
...
```

## 工作流程

```
用户请求 → 检查登录状态 → 未登录则执行登录 → 执行查询操作 → 返回结果
```

## 扩展点

可在此基础上扩展的功能：
- 查询 PR/Review 信息
- 获取 Issue 列表
- 克隆仓库代码
- 提交代码变更
