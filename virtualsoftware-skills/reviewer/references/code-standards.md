# 代码规范参考

此文件是 `company-config/code-standards.yaml` 的详细说明，用于代码审核参考。

## 命名规范

### 变量命名（camelCase）
```typescript
// ✅ 正确
const userName = 'John';
const totalPrice = 100;
const isValid = true;

// ❌ 错误
const user_name = 'John';
const TotalPrice = 100;
const ISVALID = true;
```

### 常量命名（UPPER_SNAKE_CASE）
```typescript
// ✅ 正确
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
const API_BASE_URL = 'https://api.example.com';

// ❌ 错误
const maxRetryCount = 3;
const default_timeout = 5000;
```

### 函数命名（camelCase + 动词开头）
```typescript
// ✅ 正确
function getUserInfo() {}
function calculateTotal() {}
function validateInput() {}

// ❌ 错误
function userInfo() {}
function Total() {}
```

### 类命名（PascalCase）
```typescript
// ✅ 正确
class UserService {}
class OrderController {}
class DataValidator {}

// ❌ 错误
class userService {}
class order_controller {}
```

### 接口命名（PascalCase，可选 I 前缀）
```typescript
// ✅ 正确
interface IUserService {}
interface Repository {}
interface Logger {}
```

## 代码质量标准

### 函数长度
- **最大行数**：50 行
- **理想行数**：20 行以内
- **超过限制**：需要拆分

### 文件大小
- **最大行数**：300 行
- **理想行数**：100-200 行
- **超过限制**：需要拆分模块

### 圈复杂度
- **最大值**：10
- **理想值**：5 以内
- **超过限制**：需要简化逻辑

### 嵌套深度
- **最大深度**：3 层
- **超过限制**：需要提取函数

```typescript
// ❌ 嵌套过深
function process(data) {
  if (data) {
    if (data.items) {
      if (data.items.length > 0) {
        for (const item of data.items) {
          if (item.active) {
            // 太深了
          }
        }
      }
    }
  }
}

// ✅ 提前返回
function process(data) {
  if (!data?.items?.length) return;

  const activeItems = data.items.filter(item => item.active);
  activeItems.forEach(processItem);
}
```

## TypeScript 规范

### 类型定义
```typescript
// ✅ 正确
function fetchUser(id: string): Promise<User> {}
const users: User[] = [];

// ❌ 错误
function fetchUser(id: any): any {}
const users = []; // 隐式 any[]
```

### 避免 any
```typescript
// ❌ 错误
function process(data: any) {}

// ✅ 正确
function process(data: unknown) {
  if (typeof data === 'string') {
    // ...
  }
}
```

### 使用可选链
```typescript
// ❌ 错误
const name = user && user.profile && user.profile.name;

// ✅ 正确
const name = user?.profile?.name;
```

## React 规范

### 组件结构
```typescript
// ✅ 正确
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
};
```

### Hooks 规范
```typescript
// ✅ 正确 - 使用 useCallback
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ✅ 正确 - 使用 useMemo
const expensiveValue = useMemo(() => {
  return computeExpensive(data);
}, [data]);
```

## 安全检查清单

### XSS 防护
```typescript
// ❌ 危险
element.innerHTML = userInput;

// ✅ 安全
element.textContent = userInput;
// 或使用 DOMPurify
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### SQL 注入防护
```typescript
// ❌ 危险
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 安全 - 使用参数化查询
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

### 输入验证
```typescript
// ✅ 正确
function processInput(input: string) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }
  if (input.length > MAX_LENGTH) {
    throw new Error('Input too long');
  }
  return input.trim();
}
```

## 常见问题模式

### 魔法数字
```typescript
// ❌ 错误
setTimeout(callback, 5000);

// ✅ 正确
const DEBOUNCE_DELAY = 5000;
setTimeout(callback, DEBOUNCE_DELAY);
```

### 重复代码
```typescript
// ❌ 错误 - 重复
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateUserEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ 正确 - 复用
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateEmail(email: string) {
  return EMAIL_REGEX.test(email);
}
```

### 错误处理
```typescript
// ❌ 错误 - 吞掉错误
try {
  doSomething();
} catch (e) {
  // 什么也不做
}

// ✅ 正确
try {
  doSomething();
} catch (error) {
  logger.error('Failed to do something', error);
  throw new ApplicationError('Operation failed', error);
}
```
