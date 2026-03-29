---
name: harmonyos-local-test-writer
description: Use when writing HarmonyOS/ArkTS local unit test cases with Hypium framework. Triggers when user asks to write tests, create test cases, add unit tests for HarmonyOS/ArkTS code. Also use when user mentions: 写测试用例, 编写测试, unit test, Hypium, 本地测试代码, test.ets, mock test, 测试覆盖, test coverage, 为...写测试, 给...添加测试, 如何测试, test a function, 测试某个方法, TDD, 测试驱动. Use proactively even if user doesn't explicitly say "test" but wants to verify code correctness, add test files, or improve code quality through testing.
---
<!-- References: assertion-api.md, mock-templates.md -->

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
| Local Unit Test | `entry/src/test/` | Pure logic tests, no UI dependency |
| UI/Ability Test | `entry/src/ohosTest/ets/test/` | Tests requiring ability context |

```
entry/src/test/
├── List.test.ets                  # Test registry (MUST exist)
├── *.test.ets                     # Individual test files
└── mock/
    ├── MockRdbStore.ets           # Shared database mock
    └── MockPreferences.ets        # Shared preferences mock
```

## Test Registration (CRITICAL)

Every `.test.ets` file MUST be registered in `List.test.ets`. Without registration, the test framework will not discover or execute your tests.

### How Registration Works

1. In your test file, export a default function:
```typescript
export default function myFeatureTest() {
  describe('MyFeature', () => {
    // ... test cases
  });
}
```

2. In `List.test.ets`, import and call it:
```typescript
import myFeatureTest from './MyFeature.test';

export default function testsuite() {
  // ... other tests
  myFeatureTest();  // This line is mandatory
}
```

Forgetting this step is the #1 reason tests silently don't run. Always verify List.test.ets after creating a new test file.

## ArkTS Testing Limitations

ArkTS is NOT TypeScript. These constraints catch many developers off guard:

| Limitation | Workaround |
|------------|------------|
| Cannot mock `Context` | Pass `as object` or use empty class |
| Cannot create Fake system services | Build in-memory mocks (see Mock Patterns) |
| No `Partial<T>` | Use `ValuesBucket = {}` with explicit keys |
| No `Record<string, any>` | Use `Map<string, T>` or `ValuesBucket` |
| Strict type checking | Use `as object` for dependency injection |
| `export default function` required | Always wrap `describe()` in `export default function` |
| No spread on interface | Use manual copy functions or factory functions |
| No dynamic property access on typed objects | Use `ValuesBucket` |

## Basic Test Structure

```typescript
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium';

export default function mediumTest() {
  describe('Medium', () => {
    beforeAll(() => { /* Setup shared resources */ });
    beforeEach(() => { /* Reset test state */ });
    afterEach(() => { /* Cleanup */ });
    afterAll(() => { /* Release shared resources */ });

    it('should create Medium with correct properties', 0, () => {
      // Given
      const medium = new Medium();
      medium.name = 'photo.jpg';

      // Then
      expect(medium.name).assertEqual('photo.jpg');
    });
  });
}
```

For the full list of lifecycle APIs, assertion methods, and Promise assertions, see `references/assertion-api.md`.

## Writing Test Cases

### Given-When-Then Style (Recommended)

Structure each test with clear Given/When/Then comments — it makes test intent obvious at a glance:

```typescript
it('should return READY state when all dependencies are ready', 0, async () => {
  // Given: all dependencies ready
  setup.permissionChecker.hasPermission = true;

  // When: call initialize
  const result: StartupResult = await service.initialize(setup.context as object);

  // Then: returns READY state
  expect(result.state).assertEqual(InitializationState.READY);
});
```

### Steps to Create a Test

1. **Identify** what to test — function/class, inputs (normal, edge, error), expected outputs
2. **Create file** — `<TargetName>.test.ets` in `entry/src/test/`
3. **Write cases** — use `export default function` wrapper, `describe`/`it` structure
4. **Register** — add import and call to `List.test.ets` (see Test Registration above)

Example:
```typescript
import { describe, it, expect, beforeEach } from '@ohos/hypium';

export default function mediumTest() {
  describe('Medium', () => {
    let medium: Medium;

    beforeEach(() => {
      medium = new Medium();
      medium.name = 'photo.jpg';
    });

    it('should have correct default properties', 0, () => {
      expect(medium.isFavorite).assertFalse();
      expect(medium.deletedTS).assertEqual(0);
    });
  });
}
```

## Mock Patterns (4 Proven Approaches)

Use these battle-tested patterns from real HarmonyOS projects. For complete mock implementations you can copy into your project, see `references/mock-templates.md`.

### Pattern A: Hand-written Mock (implements Interface)

**Best for:** DAO layer, repository interfaces

Define a mock class in your test file that implements the target interface. Use an in-memory array to simulate storage:

```typescript
class MockMediumDao implements MediumDao {
  private media: Array<Medium> = [];

  setTestData(media: Array<Medium>): void { this.media = media; }
  getAllData(): Array<Medium> { return this.media; }

  async getMediaFromPath(path: string): Promise<Array<Medium>> {
    return this.media.filter(m =>
      m.parentPath.toLowerCase() === path.toLowerCase() && m.deletedTS === 0
    );
  }

  async insert(medium: Medium): Promise<void> {
    const index = this.media.findIndex(m =>
      m.path.toLowerCase() === medium.path.toLowerCase()
    );
    if (index >= 0) {
      this.media[index] = medium;
    } else {
      this.media.push(medium);
    }
  }

  // ... implement remaining interface methods
}
```

### Pattern B: Stub with Behavior Verification

**Best for:** Service layer tests, verifying call sequences and error handling

Create Stub classes with `shouldFail` flag and `callOrder` tracking. Use a global counter to verify execution order:

```typescript
let globalOrderCounter: number = 0;
function nextOrder(): number { globalOrderCounter++; return globalOrderCounter; }

class StubDatabaseHelper {
  public shouldFail: boolean = false;
  public callOrder: number[] = [];

  async init(_context: object): Promise<void> {
    this.callOrder.push(nextOrder());
    if (this.shouldFail) {
      throw new Error('Database init failed');
    }
  }
}

class StubPermissionChecker {
  public hasPermission: boolean = true;
  public callOrder: number[] = [];

  async checkMediaPermission(): Promise<boolean> {
    this.callOrder.push(nextOrder());
    return this.hasPermission;
  }
}

// Assembly class ties everything together
class ServiceSetup {
  dbHelper: StubDatabaseHelper = new StubDatabaseHelper();
  permissionChecker: StubPermissionChecker = new StubPermissionChecker();
  context: TestContext = new TestContext();

  createService(): StartupService {
    return new StartupService(
      this.dbHelper as object,
      this.prefsHelper as object,
      this.permissionChecker as object
    );
  }
}

// In tests — verify call order
beforeEach(() => { globalOrderCounter = 0; });

it('should verify initialization call order', 0, async () => {
  await service.initialize(setup.context as object);

  expect(setup.dbHelper.callOrder[0]).assertEqual(1);       // db first
  expect(setup.permissionChecker.callOrder[0]).assertEqual(3); // permission third
});
```

### Pattern C: Shared Mock Files (mock/ directory)

**Best for:** Cross-suite reusable mocks (database, preferences, etc.)

Place shared mocks in `entry/src/test/mock/` as independent `.ets` files. Each includes a singleton factory with `reset()` support.

For the complete MockRdbStore and MockPreferences implementations (ready to copy into your project), see `references/mock-templates.md`.

Usage in test files:
```typescript
import { MockRdbStore } from './mock/MockRdbStore';
import { MockPreferences } from './mock/MockPreferences';

let mockStore: MockRdbStore;
let mockPrefs: MockPreferences;

beforeEach(() => {
  mockStore = new MockRdbStore('my_db.db', 1);
  mockStore.createTable('settings');
  mockStore.createTable('media');
  mockPrefs = new MockPreferences('my_prefs');
});

afterEach(() => {
  MockRdbStoreFactory.reset();
  MockPreferencesFactory.reset();
});
```

### Pattern D: `as object` Dependency Injection

**Best for:** Bypassing ArkTS strict type checking for constructor injection

When a service expects typed dependencies, use `as object` to inject stubs. This is necessary because ArkTS enforces structural typing strictly — a Stub class with compatible methods but no inheritance will fail type checks. `as object` bypasses the compile-time check, and the runtime calls methods by name (duck typing).

```typescript
// The service expects typed dependencies
const service = new StartupService(
  setup.dbHelper as object,         // Bypasses type check
  setup.prefsHelper as object,
  setup.permissionChecker as object
);
```

## Common Patterns

### Singleton Reset (Essential for Test Isolation)

If a class has a `static getInstance()` method, it carries state across tests. Always reset it in `beforeEach` and `afterEach` — otherwise Test A's state silently leaks into Test B, causing flaky "works alone, fails together" failures.

```typescript
describe('DatabaseHelper', () => {
  beforeEach(() => {
    DatabaseHelper.resetInstance();
    helper = DatabaseHelper.getInstance();
  });

  afterEach(() => {
    DatabaseHelper.resetInstance();
  });
});
```

### Async Mock Pattern

For async interfaces, return Promise directly or use `async/await`:

```typescript
// Simulate async failure
class StubDatabaseHelper {
  async init(_context: object): Promise<void> {
    if (this.shouldFail) {
      throw new Error(this.errorMessage);
    }
  }
}

// Explicit Promise.resolve()
class MockPreferences {
  flushAsync(): Promise<void> { return Promise.resolve(); }
}

// In tests, always use async/await
it('should handle async operations', 0, async () => {
  const result = await service.initialize(context as object);
  expect(result.state).assertEqual(InitializationState.READY);
});
```

### ValuesBucket / HarmonyOS Test Data

Use `ValuesBucket` from `@kit.ArkData` for database-related test data — it's the only way to do dynamic property access in ArkTS:

```typescript
import { ValuesBucket } from '@kit.ArkData';

function createSettingsValues(key: string, value: string, updatedAt: number): ValuesBucket {
  const bucket: ValuesBucket = {};
  bucket['key'] = key;
  bucket['value'] = value;
  bucket['updated_at'] = updatedAt;
  return bucket;
}

// Usage
const values = createSettingsValues('theme', 'dark', Date.now());
mockStore.insert('settings', values);
const results = mockStore.query('settings');
expect(results[0]['key']).assertEqual('theme');
```

### Enum and Constant Verification

```typescript
it('should have correct enum values', 0, () => {
  expect(InitializationState.READY).assertEqual(0);
  expect(InitializationState.ERROR).assertEqual(3);
});

it('should define all required constants', 0, () => {
  expect(Constants.SETTINGS_TABLE).assertEqual('settings');
});
```

### Skip Tests

```typescript
xdescribe('SkippedSuite', () => { it('wont run', 0, () => {}); });
xit('skipped test', 0, () => {});
```

## Advanced Patterns

### Test Fixtures (HarmonyOS Style)

Use a setup function that creates a fresh mock store and resets singletons:

```typescript
function setupMockStore(): SetupResult {
  const result = new SetupResult();
  DatabaseHelper.resetInstance();
  result.helper = DatabaseHelper.getInstance();
  result.mockStore = new MockRdbStore('simple_gallery.db', DATABASE_VERSION);
  result.mockStore.createTable('settings');
  result.mockStore.createTable('media');
  return result;
}

describe('DatabaseHelper', () => {
  beforeEach(() => {
    const setup = setupMockStore();
    helper = setup.helper!;
    mockStore = setup.mockStore!;
  });
  afterEach(() => { DatabaseHelper.resetInstance(); });
});
```

### Parameterized Tests

```typescript
const formatTestCases = [
  { input: 'photo.jpg', expected: 'image' },
  { input: 'video.mp4', expected: 'video' },
  { input: 'doc.pdf', expected: 'unknown' },
];

formatTestCases.forEach(({ input, expected }) => {
  it(`should classify ${input} as ${expected}`, 0, () => {
    expect(classifyMedia(input)).assertEqual(expected);
  });
});
```

## Best Practices

1. **One assertion per test** — focused tests are easier to debug
2. **Descriptive names** — `should <expected> when <condition>`
3. **Test edge cases** — empty input, null, boundary values
4. **Isolate tests** — reset singletons in `afterEach`
5. **Register in List.test.ets** — every test file must be imported and called there
6. **Use `as object` for DI** — the standard way to bypass ArkTS strict typing
7. **Use Given-When-Then comments** — makes test intent clear
8. **Prefer hand-written mocks over MockKit** — more reliable in ArkTS environment

## Common Pitfalls

### Forgetting to Register in List.test.ets
Test file exists but tests never run. Always add import + call to List.test.ets.

### Singleton Not Reset Between Tests
State from Test A leaks into Test B. Add `Xxx.resetInstance()` in `afterEach`.

### Not Waiting for Async Operations
```typescript
// BAD: assertion never runs
it('test', 0, () => { fetchData().then(r => expect(r).assertEqual('x')); });
// GOOD: use async/await
it('test', 0, async () => { expect(await fetchData()).assertEqual('x'); });
```

### Using TypeScript Features Not Available in ArkTS
No `Partial<T>`, no `Record<string, any>`, no spread on interfaces. Use `ValuesBucket` for dynamic data.

### Trying to Mock System Context
Cannot create real `Context` in unit tests. Use `class TestContext {}` and pass `as object`.

### Tests Depend on Execution Order
Don't share mutable state between tests. Use `beforeEach` to reset.

## Checklist for Writing Tests

- [ ] Import required APIs from `@ohos/hypium`
- [ ] Create test file in `entry/src/test/`
- [ ] Use `export default function` wrapper
- [ ] Register in `List.test.ets` (import + call)
- [ ] Use descriptive suite and case names
- [ ] Include positive, negative, and edge case tests
- [ ] Reset singletons in `beforeEach`/`afterEach`
- [ ] Use `as object` for dependency injection
- [ ] Verify registration: List.test.ets contains import and function call

## Test Coverage

Coverage reports are at `entry/.test/default/outputs/test/reports/index.html`.

```bash
# Run with coverage (default)
hvigorw test -p module=entry@default --no-daemon

# Run without coverage (faster)
hvigorw test -p module=entry@default -p coverage=false --no-daemon
```

Good targets: Functions >80%, Branches >70%, Statements >80%.

See `harmonyos-local-test` skill for detailed running instructions, troubleshooting, and `ohpm install` prerequisites.
