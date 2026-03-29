# Hypium Assertion API Reference

Complete assertion and lifecycle API reference for `@ohos/hypium`.

## Test Lifecycle

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

## Assertion Methods

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

## Promise Assertions

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

## MockKit API (Fallback)

Use only when hand-written mocks are impractical.

```typescript
import { MockKit, when } from '@ohos/hypium';

const mocker = new MockKit();
const api = new ApiService();
const mockFn = mocker.mockFunc(api, api.fetchData);
when(mockFn)().afterReturn('mocked data');

afterEach(() => {
  mocker.clearAll();
});
```

| MockKit API | Description |
|-------------|-------------|
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

## Argument Matchers

```typescript
import { ArgumentMatchers } from '@ohos/hypium';

when(mockFn)(ArgumentMatchers.anyString).afterReturn('matched');
when(mockFn)(ArgumentMatchers.anyNumber).afterReturn('number matched');
when(mockFn)(ArgumentMatchers.any).afterReturn('any matched');
```
