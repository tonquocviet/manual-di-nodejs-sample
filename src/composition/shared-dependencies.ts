import type { Disposable } from "../infrastructure/lifecycle/Disposable.js";
import { MockRedisClient } from "../infrastructure/cache/MockRedisClient.js";
import { MockDatabase } from "../infrastructure/database/MockDatabase.js";
import { ConsoleLogger } from "../infrastructure/logging/ConsoleLogger.js";
import { RequestIdGenerator } from "../infrastructure/request/RequestIdGenerator.js";
import type { DiContainer } from "./DiContainer.js";
import { TOKENS } from "./tokens.js";

// Đăng kí các dependency dùng chung
export function registerSharedDependencies(
  container: DiContainer
): void {
  container.registerSingleton(TOKENS.logger, () => new ConsoleLogger());
  container.registerSingleton(TOKENS.database, () => new MockDatabase());
  container.registerSingleton(
    TOKENS.redisClient,
    () => new MockRedisClient()
  );
  // Mỗi request sẽ tạo một requestIdGenerator mới -> transient
  container.registerTransient(
    TOKENS.requestIdGenerator,
    () => new RequestIdGenerator()
  );

  container.registerSingleton(TOKENS.disposables, (container) => {
    const disposables: Disposable[] = [
      container.resolve(TOKENS.redisClient)
    ];

    return disposables;
  });
}
