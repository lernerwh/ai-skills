---
name: harmonyos-local-test-writer
description: Use when writing HarmonyOS/ArkTS local unit test cases with Hypium framework. Triggers when user asks to write tests, create test cases, add unit tests for HarmonyOS/ArkTS code. Also use when user mentions: 写测试用例, 编写测试, unit test, Hypium, 本地测试代码, test.ets, mock test, 测试覆盖, test coverage, 为...写测试, 给...添加测试, 如何测试, test a function, 测试某个方法. Use proactively even if user doesn't explicitly say "test" but wants to verify code correctness, add test files, or improve code quality through testing.
---

# HarmonyOS Local Unit Test Writer

Guide for writing Hypium-based local unit tests for HarmonyOS/ArkTS applications.

## Related Skills

This skill works together with `harmonyos-local-test`:
- **This skill**: Write test cases (create test files, mock dependencies, write assertions)
- **harmonyos-local-test**: Run tests and fix runtime issues (SDK errors, hvigorw commands, test execution)

Typical workflow:
1. Use this skill to write test cases
2. Use `harmonyos-local-test` to run them and see results
3. If tests fail, return to this skill to fix the test logic
4. If runtime errors occur, use `harmonyos-local-test` to fix environment issues

## Test File Locations

| Test Type | Directory | Purpose |
|-----------|-----------|---------|
| Local Unit Test | `entry/src/test/ets/` | Pure logic tests, no UI dependency |
| UI/Ability Test | `entry/src/ohosTest/ets/test/` | Tests requiring ability context |

## Basic Test Structure

```typescript
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium';

export default function myTest() {
  describe('MyTestSuite', () => {
    // Runs once before all tests
    beforeAll(() => {
      // Setup shared resources
    });

    // Runs before each test
    beforeEach(() => {
      // Reset test state
    });

    // Runs after each test
    afterEach(() => {
      // Cleanup after each test
    });

    // Runs once after all tests
    afterAll(() => {
      // Release shared resources
    });

    it('testCaseName', 0, () => {
      // Test logic here
      expect(actual).assertEqual(expected);
    });
  });
}
```

## Core APIs

### Test Lifecycle

| API | Description |
|-----|-------------|
| `describe(name, fn)` | Define a test suite |
| `it(name, filter, fn)` | Define a test case (filter usually 0) |
| `beforeAll(fn)` | Run once before all tests |
| `beforeEach(fn)` | Run before each test |
| `afterEach(fn)` | Run after each test |
| `afterAll(fn)` | Run once after all tests |
| `xdescribe(name, fn)` | Skip entire suite |
| `xit(name, filter, fn)` | Skip specific test |

### Assertion Methods

| Method | Description | Example |
|--------|-------------|---------|
| `assertEqual(val)` | Strict equality | `expect(a).assertEqual(b)` |
| `assertContain(val)` | String/array contains | `expect('abc').assertContain('b')` |
| `assertTrue()` | Value is true | `expect(flag).assertTrue()` |
| `assertFalse()` | Value is false | `expect(flag).assertFalse()` |
| `assertNull()` | Value is null | `expect(val).assertNull()` |
| `assertUndefined()` | Value is undefined | `expect(val).assertUndefined()` |
| `assertLarger(val)` | Greater than | `expect(5).assertLarger(3)` |
| `assertLess(val)` | Less than | `expect(3).assertLess(5)` |
| `assertInstanceOf(type)` | Type check | `expect('str').assertInstanceOf('String')` |
| `assertNaN()` | Is NaN | `expect(NaN).assertNaN()` |
| `assertClose(expected, precision)` | Approximate equality | `expect(1.01).assertClose(1, 0.1)` |
| `assertDeepEquals(val)` | Deep equality for objects/arrays | `expect(obj1).assertDeepEquals(obj2)` |
| `assertFail()` | Always fail | `expect().assertFail()` |
| `assertThrowError(msg)` | Expects error to be thrown | `expect(fn).assertThrowError('Error msg')` |
| `not()` | Negate assertion | `expect(1).not().assertEqual(2)` |
| `message(msg)` | Custom error message | `expect(1).message('Should be 2').assertEqual(2)` |

### Promise Assertions

```typescript
// Promise state assertions
expect(promise).assertPromiseIsPending();
expect(promise).assertPromiseIsResolved();
expect(promise).assertPromiseIsRejected();

// Promise with value assertions
expect(promise).assertPromiseIsResolvedWith(expectedValue);
expect(promise).assertPromiseIsRejectedWith(expectedValue);
expect(promise).assertPromiseIsRejectedWithError(ErrorType, 'message');
```

## Writing Test Cases

### Step 1: Identify Test Target

Before writing tests, identify:
1. What function/class to test
2. What inputs to test (normal, edge cases, error cases)
3. Expected outputs for each input

### Step 2: Create Test File

Follow naming convention: `<TargetName>.test.ets`

```
entry/src/test/ets/
├── utils/
│   ├── Calculator.test.ets    # Tests for Calculator.ets
│   └── StringHelper.test.ets  # Tests for StringHelper.ets
└── List.test.ets
```

### Step 3: Write Test Cases

```typescript
import { describe, it, expect, beforeEach } from '@ohos/hypium';

export default function calculatorTest() {
  describe('Calculator', () => {
    let calc: Calculator;

    beforeEach(() => {
      calc = new Calculator();
    });

    it('should add two numbers correctly', 0, () => {
      expect(calc.add(2, 3)).assertEqual(5);
    });

    it('should handle negative numbers', 0, () => {
      expect(calc.add(-1, -2)).assertEqual(-3);
    });

    it('should throw error for invalid input', 0, () => {
      expect(() => calc.add('a' as any, 1)).assertThrowError('Invalid input');
    });
  });
}
```

## Mock Capabilities

Use MockKit when testing code with dependencies.

```typescript
import { describe, it, expect, MockKit, when } from '@ohos/hypium';

class ApiService {
  fetchData(): string {
    return 'real data';
  }
}

export default function serviceTest() {
  describe('ServiceTest with Mock', () => {
    it('should return mocked data', 0, () => {
      const mocker = new MockKit();
      const api = new ApiService();

      // Mock the method
      const mockFn = mocker.mockFunc(api, api.fetchData);

      // Define mock behavior
      when(mockFn)().afterReturn('mocked data');

      // Test with mocked data
      expect(api.fetchData()).assertEqual('mocked data');

      // Cleanup
      mocker.clear(api);
    });
  });
}
```

### Mock APIs

| API | Description |
|-----|-------------|
| `new MockKit()` | Create mock kit instance |
| `mockFunc(obj, method)` | Mock a method on object |
| `when(mockFn)(...args)` | Set up expectation with args |
| `afterReturn(value)` | Return specified value |
| `afterReturnNothing()` | Return undefined |
| `afterAction(fn)` | Execute custom function |
| `afterThrow(msg)` | Throw error |
| `verify(name, args).times(n)` | Verify call count |
| `clear(obj)` | Restore mocked object |
| `clearAll()` | Clear all mocks |

### Argument Matchers

```typescript
import { MockKit, ArgumentMatchers } from '@ohos/hypium';

when(mockFn)(ArgumentMatchers.anyString).afterReturn('matched');
when(mockFn)(ArgumentMatchers.anyNumber).afterReturn('number matched');
when(mockFn)(ArgumentMatchers.any).afterReturn('any matched');
```

## Common Patterns

### Testing Async Code

```typescript
it('async test with done', 0, (done: Function) => {
  setTimeout(() => {
    expect(result).assertEqual(expected);
    done();
  }, 1000);
});

it('promise test', 0, async () => {
  const result = await asyncFunction();
  expect(result).assertEqual(expected);
});
```

### Testing Array/Collection

```typescript
it('array test', 0, () => {
  const arr = [1, 2, 3];
  expect(arr.length).assertEqual(3);
  expect(arr).assertContain(2);
});

it('map deep equality', 0, () => {
  const map1 = new Map([[1, 'a']]);
  const map2 = new Map([[1, 'a']]);
  expect(map1).assertDeepEquals(map2);
});
```

### Skip Tests

```typescript
// Skip entire suite
xdescribe('SkippedSuite', () => {
  it('wont run', 0, () => {});
});

// Skip single test
it('normal test', 0, () => {});
xit('skipped test', 0, () => {});
```

### Error Handling

```typescript
// Test error throwing
it('should throw error for invalid input', 0, () => {
  expect(() => divide(10, 0)).assertThrowError('Division by zero');
});

// Test error with try-catch
it('should handle errors gracefully', 0, async () => {
  try {
    await fetchData();
    expect().assertFail(); // Should not reach here
  } catch (error) {
    expect(error.message).assertContain('Network error');
  }
});

// Test error type
it('should throw TypeError', 0, () => {
  expect(() => process(null)).assertThrowError('TypeError');
});
```

### Performance Testing

```typescript
it('should complete within 100ms', 0, async () => {
  const start = Date.now();
  await performTask();
  const duration = Date.now() - start;
  expect(duration).assertLess(100);
});

it('should handle large datasets efficiently', 0, () => {
  const largeArray = Array(10000).fill(0);
  const start = Date.now();
  processArray(largeArray);
  const duration = Date.now() - start;
  expect(duration).assertLess(1000); // Should complete in 1 second
});
```

## Advanced Patterns

### Test Fixtures

Use fixtures to manage complex test setup and teardown:

```typescript
class DatabaseFixture {
  private db: Database;

  async setup(): Promise<Database> {
    this.db = new Database(':memory:');
    await this.db.initialize();
    return this.db;
  }

  async teardown(): Promise<void> {
    await this.db.close();
  }

  async clear(): Promise<void> {
    await this.db.clearAllTables();
  }
}

export default function databaseTest() {
  describe('DatabaseTest', () => {
    let fixture: DatabaseFixture;
    let db: Database;

    beforeAll(async () => {
      fixture = new DatabaseFixture();
      db = await fixture.setup();
    });

    afterAll(async () => {
      await fixture.teardown();
    });

    beforeEach(async () => {
      await fixture.clear();
    });

    it('should insert user', 0, async () => {
      await db.insertUser({ name: 'Alice' });
      const users = await db.getAllUsers();
      expect(users.length).assertEqual(1);
    });
  });
}
```

### Parameterized Tests

Test multiple inputs with the same logic:

```typescript
// Simple parameterization
const testCases = [
  { input: 1, expected: 1 },
  { input: 2, expected: 4 },
  { input: 3, expected: 9 },
  { input: -1, expected: 1 },
  { input: 0, expected: 0 }
];

testCases.forEach(({ input, expected }) => {
  it(`should square ${input} to ${expected}`, 0, () => {
    expect(square(input)).assertEqual(expected);
  });
});

// Complex parameterization
interface TestCase {
  description: string;
  input: string;
  expected: boolean;
}

const validationTests: TestCase[] = [
  { description: 'valid email', input: 'user@example.com', expected: true },
  { description: 'missing @', input: 'userexample.com', expected: false },
  { description: 'empty string', input: '', expected: false },
  { description: 'null value', input: null, expected: false }
];

validationTests.forEach(({ description, input, expected }) => {
  it(`should validate email: ${description}`, 0, () => {
    expect(isValidEmail(input)).assertEqual(expected);
  });
});
```

### Test Data Factories

Create reusable test data generators:

```typescript
// Factory function
function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    age: 25,
    ...overrides
  };
}

// Usage in tests
it('should process adult user', 0, () => {
  const user = createTestUser({ age: 30 });
  expect(canAccessAdultContent(user)).assertTrue();
});

it('should reject minor user', 0, () => {
  const user = createTestUser({ age: 15 });
  expect(canAccessAdultContent(user)).assertFalse();
});

// Factory with relationships
function createTestPost(overrides: Partial<Post> = {}): Post {
  const author = createTestUser();
  return {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    author,
    createdAt: new Date(),
    ...overrides
  };
}
```

### Testing Event Listeners

```typescript
it('should emit event when data changes', 0, () => {
  const emitter = new EventEmitter();
  let eventFired = false;

  emitter.on('dataChanged', (data) => {
    eventFired = true;
    expect(data).assertEqual('new data');
  });

  emitter.emit('dataChanged', 'new data');
  expect(eventFired).assertTrue();
});

// Testing callback removal
it('should not fire after listener removed', 0, () => {
  const emitter = new EventEmitter();
  let callCount = 0;

  const handler = () => callCount++;
  emitter.on('test', handler);
  emitter.emit('test');
  expect(callCount).assertEqual(1);

  emitter.off('test', handler);
  emitter.emit('test');
  expect(callCount).assertEqual(1); // Should still be 1
});
```

### Testing Callbacks

```typescript
it('should call callback with result', 0, (done: Function) => {
  fetchData((result: string) => {
    expect(result).assertEqual('success');
    done();
  });
});

it('should handle callback errors', 0, (done: Function) => {
  fetchWithError((error: Error, result: string) => {
    expect(error).assertNotNull();
    expect(result).assertNull();
    done();
  });
});
```

## Best Practices

1. **One assertion per test** - Keep tests focused
2. **Descriptive names** - `shouldReturnSumWhenAddingTwoNumbers`
3. **Test edge cases** - Empty input, null, max values
4. **Isolate tests** - Don't share state between tests
5. **Use beforeEach** - Reset state before each test
6. **Clean up mocks** - Always call `mocker.clear()` or `clearAll()`
7. **Use factories** - Create reusable test data generators for consistency
8. **Test behavior, not implementation** - Focus on what the code does, not how

## Common Pitfalls

### ❌ Pitfall 1: Forgetting to Clean Up Mocks

```typescript
// ❌ BAD: Mock persists across tests
it('test1', 0, () => {
  const mocker = new MockKit();
  mocker.mockFunc(api, api.fetchData);
  // ... test code
  // Missing: mocker.clear(api)
});

// ✅ GOOD: Always clean up mocks
let mocker: MockKit;

beforeEach(() => {
  mocker = new MockKit();
});

afterEach(() => {
  mocker.clearAll();
});

it('test1', 0, () => {
  mocker.mockFunc(api, api.fetchData);
  // ... test code
  // Mock will be cleaned in afterEach
});
```

### ❌ Pitfall 2: Not Waiting for Async Operations

```typescript
// ❌ BAD: Test finishes before async completes
it('should fetch data', 0, () => {
  fetchData().then(result => {
    expect(result).assertEqual('data'); // Never runs!
  });
});

// ✅ GOOD: Use async/await
it('should fetch data', 0, async () => {
  const result = await fetchData();
  expect(result).assertEqual('data');
});

// ✅ GOOD: Use done callback
it('should fetch data', 0, (done: Function) => {
  fetchData().then(result => {
    expect(result).assertEqual('data');
    done();
  });
});
```

### ❌ Pitfall 3: Tests Depend on Execution Order

```typescript
// ❌ BAD: Tests share mutable state
let user: User;

it('test1', 0, () => {
  user = { name: 'Alice' };
  expect(user.name).assertEqual('Alice');
});

it('test2', 0, () => {
  // Assumes test1 ran first
  expect(user.name).assertEqual('Alice'); // Flaky!
});

// ✅ GOOD: Each test is independent
beforeEach(() => {
  user = { name: 'Alice' };
});

it('test1', 0, () => {
  user.name = 'Bob';
  expect(user.name).assertEqual('Bob');
});

it('test2', 0, () => {
  // Fresh state from beforeEach
  expect(user.name).assertEqual('Alice');
});
```

### ❌ Pitfall 4: Testing Implementation Details

```typescript
// ❌ BAD: Testing internal state
it('should process data', 0, () => {
  const processor = new DataProcessor();
  processor.process('data');
  expect(processor._internalCounter).assertEqual(1); // Fragile!
});

// ✅ GOOD: Testing observable behavior
it('should return processed result', 0, () => {
  const processor = new DataProcessor();
  const result = processor.process('data');
  expect(result.status).assertEqual('success');
});
```

### ❌ Pitfall 5: Overly Complex Tests

```typescript
// ❌ BAD: Multiple responsibilities in one test
it('should do everything', 0, async () => {
  const user = await createUser();
  const order = await createOrder(user);
  const payment = await processPayment(order);
  await sendEmail(user, payment);
  await updateInventory(order);
  // Too many things to fail!
});

// ✅ GOOD: One concept per test
it('should create user with valid data', 0, async () => {
  const user = await createUser({ name: 'Alice' });
  expect(user.id).assertNotNull();
  expect(user.name).assertEqual('Alice');
});
```

### ❌ Pitfall 6: Hard-Coded Test Data

```typescript
// ❌ BAD: Hard-coded values everywhere
it('test1', 0, () => {
  const user = { id: 1, name: 'Alice', email: 'alice@test.com' };
  // ...
});

it('test2', 0, () => {
  const user = { id: 1, name: 'Alice', email: 'alice@test.com' };
  // ...
});

// ✅ GOOD: Use test data factory
function createTestUser(overrides = {}) {
  return {
    id: 1,
    name: 'Alice',
    email: 'alice@test.com',
    ...overrides
  };
}

it('test1', 0, () => {
  const user = createTestUser();
  // ...
});

it('test2', 0, () => {
  const user = createTestUser({ name: 'Bob' });
  // ...
});
```

## Running Tests

```bash
# Run all local unit tests
hvigorw test -p module=entry@default --no-daemon

# Run specific test suite
hvigorw test -p module=entry@default -p scope=MyTestSuite

# Run specific test case
hvigorw test -p module=entry@default -p scope=MyTestSuite#testCaseName
```

## Checklist for Writing Tests

- [ ] Import required APIs from `@ohos/hypium`
- [ ] Create test file in correct directory (`src/test/ets/` for local tests)
- [ ] Use `export default function` wrapper
- [ ] Use descriptive test suite and case names
- [ ] Include positive, negative, and edge case tests
- [ ] Clean up resources in `afterEach`/`afterAll`
- [ ] Clean up mocks if used

## Test Coverage

Tests generate coverage reports showing how much of your code is tested.

### Coverage Report Location

```
entry/.test/default/outputs/test/reports/index.html
```

Open this HTML file in a browser to see:
- Line coverage: Which lines of code were executed
- Function coverage: Which functions were called
- Branch coverage: Which conditional branches were taken

### Running Tests with Coverage

```bash
# Run with coverage (default)
hvigorw test -p module=entry@default --no-daemon

# Run without coverage (faster)
hvigorw test -p module=entry@default -p coverage=false --no-daemon
```

### Coverage Targets

Good coverage goals for a healthy codebase:

| Metric | Target | Reasoning |
|--------|--------|-----------|
| **Functions** | >80% | Most functions should have at least one test |
| **Branches** | >70% | Test main paths and critical edge cases |
| **Statements** | >80% | Most code lines should execute during tests |
| **Lines** | >80% | Similar to statements |

### Interpreting Coverage

**High coverage (≥80%)** means:
- ✅ Most code paths are exercised
- ✅ Tests catch regressions
- ✅ Safe to refactor

**Low coverage (<50%)** means:
- ⚠️ Untested code may have bugs
- ⚠️ Refactoring is risky
- ⚠️ Should write more tests

**Note:** 100% coverage doesn't guarantee bug-free code. Focus on testing:
- Critical business logic
- Edge cases and error paths
- Complex algorithms
- Security-sensitive code

### Example Coverage Report

```
File: Calculator.ets
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Statements: 85.7% (12/14)
Branches:   75.0% (6/8)
Functions: 100.0% (4/4)
Lines:      87.5% (14/16)

Uncovered lines: 23, 45-47
```

This tells you:
- Lines 23 and 45-47 need tests
- Branch coverage could be improved
- All functions have at least basic tests
