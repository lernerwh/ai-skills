# TDD（测试驱动开发）实践指南

## 什么是 TDD

TDD（Test-Driven Development）是一种软件开发方法，要求在编写功能代码之前先编写测试。

## TDD 循环（Red-Green-Refactor）

```
┌────────────────────────────────────────┐
│                                        │
│    ┌─────────┐                         │
│    │  RED    │ 编写一个失败的测试       │
│    └────┬────┘                         │
│         │                              │
│         ▼                              │
│    ┌─────────┐                         │
│    │  GREEN  │ 编写最少的代码使测试通过  │
│    └────┬────┘                         │
│         │                              │
│         ▼                              │
│    ┌──────────┐                        │
│    │ REFACTOR │ 重构代码，保持测试通过   │
│    └────┬─────┘                        │
│         │                              │
│         └──────────────────────┐       │
│                                │       │
└────────────────────────────────┼───────┘
                                 │
                                 ▼
                            重复循环
```

## TDD 最佳实践

### 1. 小步前进
- 每次只测试一个功能点
- 测试代码要简单明了
- 快速迭代，频繁运行测试

### 2. FIRST 原则
- **F**ast（快速）：测试应该快速执行
- **I**ndependent（独立）：测试之间不应有依赖
- **R**epeatable（可重复）：在任何环境都能运行
- **S**elf-validating（自验证）：测试结果应该是明确的通过/失败
- **T**imely（及时）：测试应该及时编写

### 3. 测试命名
```typescript
// 好的命名
it('should return empty array when no items found', () => {});
it('should throw error when input is negative', () => {});

// 不好的命名
it('test1', () => {});
it('works', () => {});
```

### 4. Arrange-Act-Assert 模式
```typescript
it('should calculate total price correctly', () => {
  // Arrange - 准备测试数据
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];

  // Act - 执行被测试的函数
  const total = calculateTotal(items);

  // Assert - 验证结果
  expect(total).toBe(35);
});
```

## 测试覆盖范围

### 应该测试的内容
1. **核心业务逻辑**
   - 计算函数
   - 数据转换
   - 状态变更

2. **边界条件**
   - 空输入
   - 极值
   - 特殊字符

3. **异常处理**
   - 错误输入
   - 网络错误
   - 权限错误

4. **集成点**
   - API 调用（Mock）
   - 数据库操作（Mock）

### 不需要测试的内容
1. 第三方库的功能
2. 简单的 getter/setter
3. 框架本身的功能

## Mock 和 Stub

### 何时使用 Mock
- 外部 API 调用
- 数据库操作
- 时间相关操作
- 复杂的依赖

### Vitest Mock 示例
```typescript
import { vi } from 'vitest';

// Mock 模块
vi.mock('../api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mocked' }))
}));

// Mock 函数
const mockCallback = vi.fn();
mockCallback.mockReturnValue('mocked value');
mockCallback.mockImplementation(() => 'custom implementation');
```

## 测试数据管理

### 使用工厂函数
```typescript
// test-factories/user.ts
export function createTestUser(overrides = {}) {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
  };
}

// 使用
const user = createTestUser({ name: 'Custom Name' });
```

### 使用 Fixtures
```typescript
// fixtures/todos.ts
export const todoFixtures = {
  single: { id: '1', title: 'Test Todo', completed: false },
  list: [
    { id: '1', title: 'Todo 1', completed: false },
    { id: '2', title: 'Todo 2', completed: true }
  ]
};
```

## 常见测试模式

### 1. 参数化测试
```typescript
describe.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 2, 4]
])('add(%i, %i)', (a, b, expected) => {
  it(`should return ${expected}`, () => {
    expect(add(a, b)).toBe(expected);
  });
});
```

### 2. 快照测试
```typescript
it('should match snapshot', () => {
  const { container } = render(<Button>Click me</Button>);
  expect(container).toMatchSnapshot();
});
```

### 3. 异步测试
```typescript
it('should fetch data asynchronously', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

it('should handle promise rejection', async () => {
  await expect(fetchError()).rejects.toThrow('Network error');
});
```

## 覆盖率目标

| 类型 | 目标 | 说明 |
|------|------|------|
| 语句覆盖率 | 80% | 执行的代码语句比例 |
| 分支覆盖率 | 75% | 执行的条件分支比例 |
| 函数覆盖率 | 85% | 调用的函数比例 |
| 行覆盖率 | 80% | 执行的代码行比例 |

## 测试命令

```bash
# 运行所有测试
npm test

# 运行特定文件
npm test -- utils.test.ts

# 监听模式
npm test -- --watch

# 生成覆盖率报告
npm test -- --coverage

# 更新快照
npm test -- -u
```

## 常见问题

### 1. 测试太慢
- 减少 Mock 的复杂度
- 使用 --only 运行特定测试
- 避免在测试中等待真实时间

### 2. 测试不稳定
- 避免共享状态
- 每个测试后清理环境
- 使用 beforeEach/afterEach

### 3. 难以测试
- 考虑重构代码
- 使用依赖注入
- 分离关注点
