---
name: gitcode-helper
description: GitCode 代码托管平台辅助工具。使用 Playwright 自动化登录 GitCode，查询提交信息、获取代码变更统计、查询 PR/MR 信息等操作。需要环境变量 GITCODE_USER 和 GITCODE_PSW 配置账号密码。当用户需要： (1) 查询 GitCode 提交统计，(2) 获取 GitCode 仓库提交列表，(3) 查询 MR/PR 信息，(4) 批量分析代码变更，或任何 GitCode 相关的自动化查询操作时使用此技能。
---

# GitCode Helper

GitCode 代码托管平台的自动化辅助工具，基于 Playwright MCP 实现浏览器自动化操作。

## 环境要求

- **Playwright MCP**: 需要配置 Playwright MCP 服务器
- **环境变量**:
  - `GITCODE_USER`: GitCode 账号（邮箱/手机号/用户名）
  - `GITCODE_PSW`: GitCode 密码

## 功能

### 1. 登录 GitCode

自动登录 GitCode 账号。

**完整登录流程**:
```javascript
(async () => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // 步骤1: 处理用户协议弹窗（如果出现）
  const allButtons = document.querySelectorAll('button, div[role="button"], span');
  for (let btn of allButtons) {
    const text = btn.textContent.trim();
    if (text.includes('同意') && text.includes('登录')) {
      btn.click();
      break;
    }
  }

  await sleep(1000);

  // 步骤2: 点击登录按钮打开弹窗
  const loginBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === '登录');
  if (loginBtns.length > 0) {
    loginBtns[0].click();
  }

  await sleep(1500);

  // 步骤3: 点击密码登录标签
  const tabs = document.querySelectorAll('.login-modal-tab');
  for (let tab of tabs) {
    if (tab.textContent.trim() === '密码登录') {
      tab.click();
      break;
    }
  }

  await sleep(500);

  // 步骤4: 填写账号（从环境变量 GITCODE_USER 获取）
  const usernameInput = document.querySelector('input[placeholder="请填写手机号/用户名/邮箱"]');
  if (usernameInput) {
    usernameInput.value = 'jw909'; // 替换为环境变量值
    usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
    usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
    usernameInput.focus();
  }

  await sleep(300);

  // 步骤5: 填写密码（从环境变量 GITCODE_PSW 获取）
  const passwordInput = document.querySelector('input[placeholder="请填写密码"]');
  if (passwordInput) {
    passwordInput.value = 'PASSWORD'; // 替换为环境变量值
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  await sleep(500);

  // 步骤6: 点击登录按钮
  const submitBtn = document.querySelector('button.login-modal-button');
  if (submitBtn) {
    submitBtn.click();
  }

  // 步骤7: 等待登录完成并验证
  await sleep(3000);
  const currentUrl = window.location.href;
  const isLoggedIn = !currentUrl.includes('/users/sign_in');

  return { success: isLoggedIn, currentUrl };
})();
```

**关键选择器**:
- 用户协议同意按钮: 查找包含"同意"和"登录"文本的按钮
- 登录按钮（页面）: `button` 且 `textContent === '登录'`
- 密码登录标签: `.login-modal-tab` 且 `textContent === '密码登录'`
- 账号输入框: `input[placeholder="请填写手机号/用户名/邮箱"]`
- 密码输入框: `input[placeholder="请填写密码"]`
- 登录按钮（弹窗）: `button.login-modal-button`

**关键点**:
- GitCode 现已迁移到 AtomGit 平台（gitcode.com 域名）
- **首次访问需要同意用户协议**：会弹出"用户协议与隐私政策提示"
- 需要点击"登录"按钮打开登录弹窗
- 登录弹窗默认显示"小程序登录"，需切换到"密码登录"标签
- 使用 DevUI 组件库的样式类名
- 需要触发 `input` 和 `change` 事件确保值被正确识别
- 可能需要处理验证码（如果账号有安全设置）

### 2. 查询提交统计

获取指定提交的代码变更统计信息。

**输入参数**: GitCode 提交页面 URL
- 格式: `https://gitcode.net/{用户}/{仓库}/-/commit/{哈希}`

**输出格式**: 精简统计
```
{文件数量} 个文件发生了变化，影响行数： +{新增行数} -{删除行数}
```

**执行步骤**:
1. 确保已登录 GitCode
2. 导航到提交页面
3. 提取统计信息（文件变更数、新增行数、删除行数）
4. 返回格式化的统计文本

**关键选择器**:
```javascript
// GitCode 使用 GitLab 架构，统计信息在特定的 class 中
const statsText = document.querySelector('.diff-stats')?.textContent;
```

### 3. 获取提交列表

获取仓库分支的提交列表。

**输入参数**: GitCode 提交列表页面 URL
- 格式: `https://gitcode.net/{用户}/{仓库}/-/commits/{分支}`

**输出格式**: 提交列表数组
```javascript
[
  { hash: "abc123", title: "提交标题", author: "作者", time: "时间", url: "提交链接" },
  ...
]
```

**执行步骤**:
1. 确保已登录 GitCode
2. 导航到 commits 列表页面
3. 提取每个 commit 的链接、标题、作者、时间等信息
4. 返回提交列表

**关键选择器**: 查找包含 commit 链接的 `<ul class="commit-list">` 元素

### 4. 查询 MR（Merge Request）信息

获取 MR 列表和详情。

**输入参数**: GitCode MR 列表页面 URL
- 格式: `https://gitcode.net/{用户}/{仓库}/-/merge_requests`

**输出格式**: MR 列表数组
```javascript
[
  {
    id: "1",
    title: "MR 标题",
    author: "作者",
    status: "open/merged/closed",
    url: "MR 链接"
  },
  ...
]
```

**执行步骤**:
1. 确保已登录 GitCode
2. 导航到 MR 列表页面
3. 提取每个 MR 的状态、标题、作者等信息
4. 返回 MR 列表

### 5. 批量查询提交统计

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
汇总: 共 N 个提交，{总文件数} 个文件变更，+{总新增行} -{总删除行}
```

### 6. 获取 MR 变更统计

获取指定 MR 的代码变更统计。

**输入参数**: GitCode MR 页面 URL
- 格式: `https://gitcode.net/{用户}/{仓库}/-/merge_requests/{ID}`

**输出格式**: MR 变更统计
```
MR #{ID}: {标题}
变更统计: {文件数} 个文件，+{新增行} -{删除行}
```

## 工作流程

```
用户请求 → 检查登录状态 → 未登录则执行登录 → 执行查询操作 → 返回结果
```

## GitCode 与 Gitee 的主要区别

1. **登录系统**: GitCode 使用 CSDN 统一登录，Gitee 使用自有登录系统
2. **URL 结构**: GitCode 使用 GitLab 风格的 URL（`/-/commit/`），Gitee 使用传统路径
3. **页面结构**: GitCode 基于 GitLab 架构，DOM 结构与 Gitee 不同
4. **术语**: GitCode 使用 "Merge Request" (MR)，Gitee 使用 "Pull Request" (PR)

## 扩展点

可在此基础上扩展的功能：
- 查询 Issue 列表和详情
- 获取 CI/CD 流水线状态
- 查询仓库分支和标签信息
- 提交代码变更（需要额外权限）
- 创建和管理 MR
- 代码评论和审查功能
