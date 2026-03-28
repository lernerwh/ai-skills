---
name: spec-enhancer
description: Analyze existing FEATURE_MAP.md and PROJECT_ANALYSIS.md to generate TDD-friendly enhanced spec for Android-to-HarmonyOS conversion. Triggers when user wants to generate enhanced spec, prepare TDD steps, analyze features for testing, or mentions: 生成spec, 增强spec, 生成测试spec, generate spec, enhance spec, TDD spec. Automatically decomposes features into testable units with dependency ordering.
argument-hint: <feature-map-path> <project-analysis-path> <android-source-path>
allowed-tools: Agent, Read, Write, Edit, Glob, Grep, Bash, Skill
---

# Spec Enhancer

分析现有的 FEATURE_MAP.md 和 PROJECT_ANALYSIS.md，为每个功能点生成 TDD-friendly 的增强 spec。

## Inputs

| Argument | Required | Description |
|----------|----------|-------------|
| `$ARGUMENTS[0]` | Yes | FEATURE_MAP.md 文件路径 |
| `$ARGUMENTS[1]` | Yes | PROJECT_ANALYSIS.md 文件路径 |
| `$ARGUMENTS[2]` | Yes | Android 源码根目录路径 |

## Output

生成 `enhanced-spec.md` 到 FEATURE_MAP.md 同级目录。

## Workflow

```
FEATURE_MAP.md + PROJECT_ANALYSIS.md + Android 源码
        │
        ▼
┌──────────────────────┐
│ 1. 提取功能点          │  从 FEATURE_MAP 的 ## 章节提取
│    (Feature Points)   │  每个顶级章节 = 一个 step
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 2. 识别可测试单元      │  分析 Android 源码中的
│    (Testable Units)   │  Helper/Utility/Model 类
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 3. 分析依赖关系        │  通过 import 和调用链
│    (Dependencies)     │  构建 step 依赖 DAG
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 4. 拓扑排序            │  确定最优 step 执行顺序
│    (Topological Sort) │  被依赖的 step 排在前面
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 5. 生成 enhanced-spec │  输出结构化的增强 spec 文档
│    (Output)           │
└──────────────────────┘
```

---

## Step 1: 提取功能点

### 1.1 解析 FEATURE_MAP.md

从 FEATURE_MAP.md 的结构中提取功能点。文档格式为：

```markdown
## 1. 媒体查看功能
### 1.1 图片查看
### 1.2 视频查看
## 2. 安全功能
### 2.1 密码保护
```

**提取规则：**
- 每个 `## n. xxx` 顶级章节 = 一个功能点 step
- 子章节 `### n.m xxx` = 该功能点的子功能
- 提取章节标题、位置信息、功能表格

### 1.2 过滤不可测试的功能

排除以下类型的功能点（它们依赖 UI 或平台 API，不适合 local unit test）：
- 纯 UI 渲染（如"全屏查看"、"手势支持"）
- 平台服务调用（如"指纹识别"、"通知管理"）
- 硬件依赖（如"相机操作"、"传感器"）

保留以下类型：
- 数据处理逻辑（排序、过滤、计算）
- 文件操作（路径处理、格式转换）
- 配置管理（设置读写、偏好存储）
- 数据模型（对象创建、属性计算）
- 业务规则（权限判断、条件验证）

---

## Step 2: 识别可测试单元

### 2.1 定位源文件

从 FEATURE_MAP 中每个功能点的 **位置** 字段提取 Android 源文件路径。

在 Android 源码根目录下查找对应文件。

### 2.2 分析源文件中的可测试函数

扫描源文件，识别以下模式的函数/方法：

**优先级 1（纯逻辑，最易测试）：**
- `object` 中的工具方法
- `companion object` 中的静态方法
- 顶层函数（top-level functions）
- 纯计算方法（输入 → 输出，无副作用）

**优先级 2（有依赖但可 mock）：**
- 接受接口参数的方法
- 可通过构造函数注入依赖的类
- Repository 模式的实现

**排除（不可测试）：**
- Activity/Fragment 生命周期方法
- 直接操作 View 的方法
- 调用 Android 系统 API 且无法 mock 的方法

### 2.3 生成测试用例表

对每个可测试函数，生成测试用例描述：

```markdown
| 函数/类 | 描述 | 输入 | 预期输出 | 测试类型 |
|---------|------|------|---------|---------|
| Medium.isImage() | 判断是否为图片 | type='image/jpeg' | true | 正常 |
| Medium.isImage() | 非图片类型 | type='video/mp4' | false | 正常 |
| MediaHelper.filterByType() | 过滤图片列表 | [img, video, img], 'image' | [img, img] | 正常 |
| MediaHelper.filterByType() | 空列表 | [], 'image' | [] | 边界 |
| ConfigHelper.parseSortOrder() | 无效排序值 | 'invalid' | throw Error | 异常 |
```

---

## Step 3: 分析依赖关系

### 3.1 构建 step 依赖图

分析每个功能点的 import 关系和类引用，确定 step 间的依赖：

```
基础数据模型 (Medium, Directory)
    ↑ 被以下所有 step 依赖
配置管理 (ConfigHelper)
    ↑ 被媒体扫描依赖
媒体扫描 (MediaHelper)
    ↑ 被图片查看、视频查看依赖
文件操作 (FileOperator)
    ↑ 被回收站依赖
```

### 3.2 依赖规则

| 规则 | 说明 |
|------|------|
| 数据模型最优先 | Model 类不依赖其他业务类，必须排第一 |
| 工具类次之 | Utility/Helper 不依赖业务逻辑，排第二 |
| 业务逻辑在后 | 业务逻辑依赖模型和工具，排第三 |
| 无依赖的 step 可并行 | 理论上可并行，但当前串行执行 |

---

## Step 4: 生成 Enhanced Spec

### 4.1 输出格式

```markdown
# Enhanced Spec: {项目名称}

**生成时间**: {日期}
**源文档**: FEATURE_MAP.md, PROJECT_ANALYSIS.md
**总 Step 数**: {n}

---

## Step 1: {功能点名称}

### 源文件映射
- Android: `{相对路径}`（完整路径: `{android-root}/{相对路径}`）
- HarmonyOS 目标: `entry/src/main/ets/{package-path}/{FileName}.ets`

### 逻辑层可测试单元
| 函数/类 | 描述 | 输入 | 预期输出 | 测试类型 |
|---------|------|------|---------|---------|
| ... | ... | ... | ... | ... |

### 验收标准
- [ ] 所有测试用例通过
- [ ] 覆盖正常路径和异常路径
- [ ] 不依赖 UI 层或平台 API（全部通过 mock 隔离）
- [ ] 测试文件位于 `entry/src/test/ets/steps/step{n}_{name}/`

### 依赖
（无依赖 / 依赖 Step {n}: {名称}）

---

## Step 2: ...
```

### 4.2 文件名规则

- step 目录名: `step{n}_{english_name}`（小写，下划线分隔）
- 例如: `step1_basic_models`, `step2_config_management`, `step3_media_scan`

---

## Self-Check

生成 enhanced-spec.md 后，自动进行以下检查：

1. **完整性检查**：每个 step 是否都包含源文件映射、可测试单元表、验收标准、依赖
2. **依赖闭环检查**：step 依赖图中是否存在循环依赖（如果有，需手动拆解）
3. **可测试性检查**：可测试单元是否都是纯逻辑（无 UI/平台 API 依赖）
4. **覆盖度检查**：功能点总数 vs 可测试功能点数，计算覆盖率

---

## Error Handling

| 错误 | 处理 |
|------|------|
| FEATURE_MAP.md 不存在 | 报错退出，提示路径 |
| PROJECT_ANALYSIS.md 不存在 | 报错退出，提示路径 |
| Android 源码目录不存在 | 报错退出，提示路径 |
| 源文件引用的路径不存在 | 跳过该文件，记录警告 |
| 某功能点无任何可测试单元 | 仍然保留该 step，但标记为 "无可测试单元，跳过" |
| 循环依赖 | 报错退出，列出循环依赖链，建议手动调整 |
