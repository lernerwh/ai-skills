---
name: vite-webapp-builder
description: 快速创建 Vite 前端项目，编写 HTML/CSS 页面，启动开发服务器，用 Playwright 打开浏览器预览，并用 Peekaboo 截图。适合快速原型开发、对比页面制作、演示页面创建等场景。
---

# Vite Web App Builder

使用 Vite 快速创建前端项目并启动，编写页面内容，然后用 Playwright 和 Peekaboo 进行浏览器操作和截图。

## 核心步骤

### 1. 创建 Vite 项目

使用 Vite 创建新的前端项目：

```bash
# 进入目标目录
cd ~/code/web

# 使用 vanilla 模板创建项目
npm create vite@latest <project-name> -- --template vanilla

# 进入项目目录
cd <project-name>

# 安装依赖
npm install
```

**可用模板：**
- `vanilla` - 纯 HTML/CSS/JS
- `react` - React 项目
- `vue` - Vue 项目
- `svelte` - Svelte 项目

### 2. 编写页面内容

在 `index.html` 中编写页面内容，使用现代 CSS 技术：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题</title>
    <style>
        /* CSS 样式 */
        body {
            font-family: -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
    </style>
</head>
<body>
    <!-- 页面内容 -->
</body>
</html>
```

### 3. 启动开发服务器

```bash
# 启动 Vite 开发服务器（指定 host 和 port）
npm run dev -- --host 127.0.0.1 --port 5173 &

# 等待服务器启动
sleep 3

# 验证服务器是否运行
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/
```

**服务器运行后访问：** `http://127.0.0.1:5173/`

### 4. 使用 Playwright 打开页面

```bash
# 使用 mcporter 调用 Playwright MCP
mcporter call playwright.browser_navigate url:"http://127.0.0.1:5173/"
```

**验证页面加载：**
- 检查 Page URL 是否正确
- 检查 Page Title 是否显示
- 检查是否有 Console 错误

### 5. 使用 Peekaboo 截图

```bash
# 截取全屏（Retina 模式）
peekaboo image --mode screen --retina --path /tmp/screenshot.png

# 或者截取特定窗口
peekaboo image --mode window --app "Safari" --retina --path /tmp/screenshot.png
```

## 完整示例：创建对比页面

```bash
# 1. 创建项目
cd ~/code/web
npm create vite@latest comparison-page -- --template vanilla
cd comparison-page
npm install

# 2. 启动服务器
npm run dev -- --host 127.0.0.1 --port 5173 &

# 3. 等待启动
sleep 3

# 4. 用 Playwright 打开
mcporter call playwright.browser_navigate url:"http://127.0.0.1:5173/"

# 5. 截图
peekaboo image --mode screen --retina --path /tmp/comparison.png
```

## 常用场景

### 快速原型

```bash
# 创建项目
npm create vite@latest prototype -- --template vanilla
cd prototype

# 编写简单原型
# 编辑 index.html

# 启动并预览
npm run dev -- --host 127.0.0.1 --port 5173 &
```

### 对比页面制作

```bash
# 创建对比项目
npm create vite@latest demo -- --template vanilla

# 编写对比页面（双栏布局、卡片样式）
```

### 演示页面

```bash
# 创建演示项目
npm create vite@latest demo-app -- --template vanilla
npm install
npm run dev -- --host 127.0.0.1 --port 5173 &
```

## 注意事项

1. **端口冲突**：如果 5173 端口被占用，更换其他端口（如 3000、4173）
2. **后台运行**：使用 `&` 让服务器在后台运行，避免阻塞命令行
3. **清理进程**：完成后记得杀掉后台进程
   ```bash
   # 查找并杀掉 node 进程
   pkill -f "node.*vite"
   ```
4. **文件路径**：确保 HTML 文件路径正确，使用绝对路径或相对路径

## 进阶技巧

### 使用 React 模板

```bash
npm create vite@latest react-app -- --template react
cd react-app
npm install
npm run dev -- --host 127.0.0.1 --port 5173 &
```

### 使用 Vue 模板

```bash
npm create vite@latest vue-app -- --template vue
cd vue-app
npm install
npm run dev -- --host 127.0.0.1 --port 5173 &
```

### 添加样式框架

在 HTML 中引入 Tailwind CSS：

```html
<script src="https://cdn.tailwindcss.com"></script>
<body class="bg-gray-100 p-4">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <!-- 内容 -->
    </div>
</body>
```

## 故障排查

### 服务器无法启动

```bash
# 检查端口是否被占用
lsof -i:5173

# 更换端口
npm run dev -- --port 3000 &
```

### Playwright 无法打开

```bash
# 检查 mcporter 配置
mcporter list playwright

# 检查 Playwright MCP 是否正常运行
```

### Peekaboo 截图失败

```bash
# 检查权限
peekaboo permissions

# 授予屏幕录制和辅助功能权限（系统设置）
```
