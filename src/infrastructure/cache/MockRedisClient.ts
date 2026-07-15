import type { Disposable } from "../lifecycle/Disposable.js";
import type { RedisClient } from "./RedisClient.js";

export class MockRedisClient implements RedisClient, Disposable {
  private readonly values = new Map<string, string>();
  private disposed = false;

  async get(key: string): Promise<string | null> {
    this.assertIsOpen();

    return this.values.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.assertIsOpen();

    this.values.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.assertIsOpen();

    this.values.delete(key);
  }

  async dispose(): Promise<void> {
    this.values.clear();
    this.disposed = true;
  }

  private assertIsOpen(): void {
    if (this.disposed) {
      throw new Error("Redis client is closed");
    }
  }
}
