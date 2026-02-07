# Gitee Helper

Gitee 代码托管平台的自动化辅助技能，基于 Playwright MCP 实现浏览器自动化操作。

## 功能

- **自动登录**: 使用环境变量中的账号密码自动登录 Gitee
- **提交统计**: 查询指定提交的代码变更统计信息

## 环境要求

1. **Playwright MCP**: 需要配置 Playwright MCP 服务器
2. **环境变量**:
   ```bash
   GITEE_USER=your_email@example.com
   GITEE_PSW=your_password
   ```

## 使用示例

### 查询提交统计

```
帮我查询这个 Gitee 提交的统计信息：
https://gitee.com/jw909/arkui_ace_engine/commit/414137ab001d182d93e732e3a348afe434b5efd4
```

**输出示例**:
```
15 个文件发生了变化，影响行数： +171 -91
```

## 目录结构

```
gitee-helper/
├── SKILL.md           # 技能定义（自动触发）
├── README.md          # 使用文档
├── scripts/           # 辅助脚本
│   ├── login.js       # 登录逻辑
│   └── commit-stats.js # 提交统计查询
└── references/        # 参考文档（预留）
```

## 扩展

该技能设计为可扩展结构，可在 `scripts/` 目录中添加更多功能模块：

- PR/Review 查询
- Issue 管理
- 代码克隆
- 仓库操作等

## License

MIT
