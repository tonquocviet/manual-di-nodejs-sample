import type { Disposable } from "../infrastructure/lifecycle/Disposable.js";
import { MockRedisClient } from "../infrastructure/cache/MockRedisClient.js";
import { MockDatabase } from "../infrastructure/database/MockDatabase.js";
import { ConsoleLogger } from "../infrastructure/logging/ConsoleLogger.js";

export function createSharedDependencies() {
  const logger = new ConsoleLogger();
  const database = new MockDatabase();
  const redisClient = new MockRedisClient();
  const disposables: Disposable[] = [
    redisClient
  ];

  return {
    database,
    disposables,
    logger,
    redisClient
  };
}
