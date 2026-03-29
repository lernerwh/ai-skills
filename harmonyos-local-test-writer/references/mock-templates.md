# HarmonyOS Test Mock Templates

Complete, copy-paste-ready mock implementations for HarmonyOS local unit tests.

## Table of Contents

1. [MockRdbStore - In-Memory Database Mock](#mockrdbstore)
2. [MockPreferences - In-Memory Preferences Mock](#mockpreferences)
3. [MockMediumDao - DAO Interface Mock](#mockmediumdao)

---

## MockRdbStore

In-memory relational database mock. Place in `entry/src/test/mock/MockRdbStore.ets`.

Supports: createTable, insert, update, delete, query, count, transactions (no-op), singleton factory with reset.

```typescript
import { ValuesBucket } from '@kit.ArkData';

function copyValuesBucket(source: ValuesBucket): ValuesBucket {
  const result: ValuesBucket = {};
  const keys = Object.keys(source);
  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = source[keys[i]];
  }
  return result;
}

function mergeValuesBuckets(base: ValuesBucket, override: ValuesBucket): ValuesBucket {
  const result: ValuesBucket = {};
  const baseKeys = Object.keys(base);
  for (let i = 0; i < baseKeys.length; i++) {
    result[baseKeys[i]] = base[baseKeys[i]];
  }
  const overrideKeys = Object.keys(override);
  for (let i = 0; i < overrideKeys.length; i++) {
    result[overrideKeys[i]] = override[overrideKeys[i]];
  }
  return result;
}

export class MockRdbStore {
  private tables: Map<string, Map<number, ValuesBucket>> = new Map();
  private nextId: number = 1;
  private version: number = 1;
  private name: string;

  constructor(name: string = 'mock_db', version: number = 1) {
    this.name = name;
    this.version = version;
  }

  createTable(tableName: string): void {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new Map());
    }
  }

  insert(tableName: string, values: ValuesBucket): number {
    if (!this.tables.has(tableName)) {
      this.createTable(tableName);
    }
    const table = this.tables.get(tableName)!;
    const id = this.nextId++;
    const row = mergeValuesBuckets(values, { id: id } as ValuesBucket);
    table.set(id, row);
    return id;
  }

  update(tableName: string, values: ValuesBucket,
    predicates?: Record<string, Object | string | number | boolean>): number {
    if (!this.tables.has(tableName)) {
      return 0;
    }
    const table = this.tables.get(tableName)!;
    let affected = 0;
    const ids: number[] = [];
    table.forEach((row, id) => { ids.push(id); });
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const row = table.get(id)!;
      if (this.matchesPredicates(row, predicates)) {
        table.set(id, mergeValuesBuckets(row, values));
        affected++;
      }
    }
    return affected;
  }

  delete(tableName: string,
    predicates?: Record<string, Object | string | number | boolean>): number {
    if (!this.tables.has(tableName)) {
      return 0;
    }
    const table = this.tables.get(tableName)!;
    const idsToDelete: number[] = [];
    table.forEach((row, id) => {
      if (this.matchesPredicates(row, predicates)) {
        idsToDelete.push(id);
      }
    });
    for (let i = 0; i < idsToDelete.length; i++) {
      table.delete(idsToDelete[i]);
    }
    return idsToDelete.length;
  }

  query(tableName: string,
    predicates?: Record<string, Object | string | number | boolean>,
    columns?: string[]): ValuesBucket[] {
    if (!this.tables.has(tableName)) {
      return [];
    }
    const table = this.tables.get(tableName)!;
    const results: ValuesBucket[] = [];
    table.forEach((row, _id) => {
      if (this.matchesPredicates(row, predicates)) {
        results.push(copyValuesBucket(row));
      }
    });
    return results;
  }

  queryById(tableName: string, id: number): ValuesBucket | undefined {
    if (!this.tables.has(tableName)) {
      return undefined;
    }
    const table = this.tables.get(tableName)!;
    if (table.has(id)) {
      return copyValuesBucket(table.get(id)!);
    }
    return undefined;
  }

  count(tableName: string,
    predicates?: Record<string, Object | string | number | boolean>): number {
    return this.query(tableName, predicates).length;
  }

  clearTable(tableName: string): void {
    if (this.tables.has(tableName)) {
      this.tables.get(tableName)!.clear();
    }
  }

  clearAll(): void {
    this.tables.clear();
    this.nextId = 1;
  }

  executeSql(sql: string): boolean { return true; }
  beginTransaction(): void { /* no-op */ }
  setTransactionSuccessful(): void { /* no-op */ }
  endTransaction(): void { /* no-op */ }

  private matchesPredicates(row: ValuesBucket,
    predicates?: Record<string, Object | string | number | boolean>): boolean {
    if (!predicates) {
      return true;
    }
    const keys = Object.keys(predicates);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (row[key] !== predicates[key]) {
        return false;
      }
    }
    return true;
  }
}

// Singleton factory with reset support
export class MockRdbStoreFactory {
  private static instance: MockRdbStore | null = null;

  static getInstance(): MockRdbStore {
    if (!MockRdbStoreFactory.instance) {
      MockRdbStoreFactory.instance = new MockRdbStore();
    }
    return MockRdbStoreFactory.instance;
  }

  static createNew(name: string = 'mock_db', version: number = 1): MockRdbStore {
    return new MockRdbStore(name, version);
  }

  static reset(): void {
    MockRdbStoreFactory.instance = null;
  }
}
```

**Usage:**
```typescript
import { MockRdbStore } from './mock/MockRdbStore';

const store = new MockRdbStore('my_db.db', 1);
store.createTable('users');
store.insert('users', { name: 'Alice', age: 25 } as ValuesBucket);
const users = store.query('users', { name: 'Alice' } as Record<string, string>);
```

---

## MockPreferences

In-memory preferences storage mock. Place in `entry/src/test/mock/MockPreferences.ets`.

Supports: string, number, boolean, and array types; multi-instance factory with reset.

```typescript
type PrefValue = string | number | boolean | Array<string> | Array<number> | Array<boolean>;

export class MockPreferences {
  private data: Map<string, PrefValue> = new Map();
  private name: string;

  constructor(name: string = 'mock_prefs') {
    this.name = name;
  }

  putString(key: string, value: string): void { this.data.set(key, value); }
  getString(key: string, defaultValue?: string): string | undefined {
    if (this.data.has(key)) {
      const value = this.data.get(key);
      return typeof value === 'string' ? value : defaultValue;
    }
    return defaultValue;
  }

  putNumber(key: string, value: number): void { this.data.set(key, value); }
  getNumber(key: string, defaultValue?: number): number | undefined {
    if (this.data.has(key)) {
      const value = this.data.get(key);
      return typeof value === 'number' ? value : defaultValue;
    }
    return defaultValue;
  }

  putBoolean(key: string, value: boolean): void { this.data.set(key, value); }
  getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    if (this.data.has(key)) {
      const value = this.data.get(key);
      return typeof value === 'boolean' ? value : defaultValue;
    }
    return defaultValue;
  }

  putStringArray(key: string, values: Array<string>): void { this.data.set(key, values); }
  getStringArray(key: string, defaultValue?: Array<string>): Array<string> | undefined {
    if (this.data.has(key)) {
      const value = this.data.get(key);
      return Array.isArray(value) ? value as Array<string> : defaultValue;
    }
    return defaultValue;
  }

  putNumberArray(key: string, values: Array<number>): void { this.data.set(key, values); }
  getNumberArray(key: string, defaultValue?: Array<number>): Array<number> | undefined {
    if (this.data.has(key)) {
      const value = this.data.get(key);
      return Array.isArray(value) ? value as Array<number> : defaultValue;
    }
    return defaultValue;
  }

  has(key: string): boolean { return this.data.has(key); }
  getAllKeys(): string[] { return Array.from(this.data.keys()); }
  delete(key: string): void { this.data.delete(key); }
  clear(): void { this.data.clear(); }
  size(): number { return this.data.size; }
  flush(): void { /* no-op */ }
  flushAsync(): Promise<void> { return Promise.resolve(); }
}

// Multi-instance singleton factory (separated by name)
export class MockPreferencesFactory {
  private static instances: Map<string, MockPreferences> = new Map();

  static getInstance(name: string = 'mock_prefs'): MockPreferences {
    if (!MockPreferencesFactory.instances.has(name)) {
      MockPreferencesFactory.instances.set(name, new MockPreferences(name));
    }
    return MockPreferencesFactory.instances.get(name)!;
  }

  static createNew(name: string = 'mock_prefs'): MockPreferences {
    return new MockPreferences(name);
  }

  static reset(): void {
    MockPreferencesFactory.instances.clear();
  }

  static clearInstance(name: string): void {
    MockPreferencesFactory.instances.delete(name);
  }
}
```

---

## MockMediumDao

Example of a hand-written mock that implements a DAO interface. Define directly in your test file.

```typescript
import { MediumDao } from '../main/ets/interfaces/MediumDao';
import { Medium } from '../main/ets/models/Medium';

class MockMediumDao implements MediumDao {
  private media: Array<Medium> = [];

  setTestData(media: Array<Medium>): void {
    this.media = media;
  }

  getAllData(): Array<Medium> {
    return this.media;
  }

  async getMediaFromPath(path: string): Promise<Array<Medium>> {
    return this.media.filter(m =>
      m.parentPath.toLowerCase() === path.toLowerCase() && m.deletedTS === 0
    );
  }

  async getFavorites(): Promise<Array<Medium>> {
    return this.media.filter(m => m.isFavorite && m.deletedTS === 0);
  }

  async getFavoritesCount(): Promise<number> {
    return this.media.filter(m => m.isFavorite && m.deletedTS === 0).length;
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

  async insertAll(media: Array<Medium>): Promise<void> {
    for (const m of media) {
      await this.insert(m);
    }
  }

  async deleteMedia(...media: Medium[]): Promise<void> {
    const paths = media.map(m => m.path.toLowerCase());
    this.media = this.media.filter(m => !paths.includes(m.path.toLowerCase()));
  }

  async deleteMediumPath(path: string): Promise<void> {
    this.media = this.media.filter(m =>
      m.path.toLowerCase() !== path.toLowerCase()
    );
  }

  async updateMedium(oldPath: string, newParentPath: string,
    newFilename: string, newFullPath: string): Promise<void> {
    const medium = this.media.find(m =>
      m.path.toLowerCase() === oldPath.toLowerCase()
    );
    if (medium) {
      medium.parentPath = newParentPath;
      medium.name = newFilename;
      medium.path = newFullPath;
    }
  }

  async updateFavorite(path: string, isFavorite: boolean): Promise<void> {
    const medium = this.media.find(m =>
      m.path.toLowerCase() === path.toLowerCase()
    );
    if (medium) {
      medium.isFavorite = isFavorite;
    }
  }

  async clearFavorites(): Promise<void> {
    for (const m of this.media) {
      m.isFavorite = false;
    }
  }

  async clearRecycleBin(): Promise<void> {
    this.media = this.media.filter(m => m.deletedTS === 0);
  }
}
```
