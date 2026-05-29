import { LocalStorageService, type KeyValueStorage } from './LocalStorageService';

export type Identifiable = {
  id: string;
};

export class JsonCollectionRepository<T extends Identifiable> {
  constructor(
    private readonly key: string,
    private readonly storage: KeyValueStorage = LocalStorageService,
  ) {}

  async list(): Promise<T[]> {
    const raw = await this.storage.getItem(this.key);
    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as T[];
  }

  async replace(items: T[]) {
    await this.storage.setItem(this.key, JSON.stringify(items));
  }

  async seed(items: T[]) {
    const current = await this.list();
    if (current.length === 0) {
      await this.replace(items);
    }
  }

  async create(item: T) {
    const current = await this.list();
    await this.replace([...current, item]);
  }

  async update(id: string, patch: Partial<T>) {
    const current = await this.list();
    await this.replace(current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async upsert(item: T) {
    const current = await this.list();
    const exists = current.some((currentItem) => currentItem.id === item.id);
    await this.replace(exists ? current.map((currentItem) => (currentItem.id === item.id ? item : currentItem)) : [...current, item]);
  }

  async delete(id: string) {
    const current = await this.list();
    await this.replace(current.filter((item) => item.id !== id));
  }

  async clear() {
    await this.storage.removeItem(this.key);
  }
}
