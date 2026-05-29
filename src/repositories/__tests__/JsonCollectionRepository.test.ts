import { describe, expect, it } from 'vitest';

import { JsonCollectionRepository } from '../JsonCollectionRepository';
import type { KeyValueStorage } from '../LocalStorageService';

type TestItem = {
  id: string;
  label: string;
  completed?: boolean;
};

class MemoryStorage implements KeyValueStorage {
  private values = new Map<string, string>();

  async getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  async removeItem(key: string) {
    this.values.delete(key);
  }
}

describe('JsonCollectionRepository', () => {
  it('persists create, update, toggle, and delete operations', async () => {
    const repo = new JsonCollectionRepository<TestItem>('items', new MemoryStorage());

    await repo.create({ id: 'one', label: 'Water plants', completed: false });
    await repo.create({ id: 'two', label: 'Buy milk', completed: false });
    await repo.update('one', { completed: true });
    await repo.delete('two');

    expect(await repo.list()).toEqual([{ id: 'one', label: 'Water plants', completed: true }]);
  });

  it('seeds data only when the collection is empty', async () => {
    const repo = new JsonCollectionRepository<TestItem>('items', new MemoryStorage());

    await repo.seed([{ id: 'one', label: 'Seeded' }]);
    await repo.create({ id: 'two', label: 'User item' });
    await repo.seed([{ id: 'three', label: 'Should not overwrite' }]);

    expect(await repo.list()).toEqual([
      { id: 'one', label: 'Seeded' },
      { id: 'two', label: 'User item' },
    ]);
  });
});
