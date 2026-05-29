import type { WeatherForecast } from '../types';
import { LocalStorageService, type KeyValueStorage } from './LocalStorageService';

export class WeatherCacheRepository {
  constructor(
    private readonly key: string,
    private readonly storage: KeyValueStorage = LocalStorageService,
  ) {}

  async get(): Promise<WeatherForecast | null> {
    const raw = await this.storage.getItem(this.key);
    return raw ? (JSON.parse(raw) as WeatherForecast) : null;
  }

  async getFresh(now = new Date(), freshnessMinutes = 60): Promise<WeatherForecast | null> {
    const cached = await this.get();
    if (!cached) {
      return null;
    }

    const updatedAt = new Date(cached.updatedAt).getTime();
    if (!Number.isFinite(updatedAt)) {
      return null;
    }

    const ageMs = now.getTime() - updatedAt;
    return ageMs <= freshnessMinutes * 60 * 1000 ? cached : null;
  }

  async save(forecast: WeatherForecast) {
    await this.storage.setItem(this.key, JSON.stringify(forecast));
  }

  async clear() {
    await this.storage.removeItem(this.key);
  }
}
