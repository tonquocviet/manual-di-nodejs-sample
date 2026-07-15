import type { Database } from "../infrastructure/database/Database.js";
import type { Logger } from "../application/ports/Logger.js";
import type { RedisClient } from "../infrastructure/cache/RedisClient.js";
import { UserService } from "../application/UserService.js";
import { CachedUserRepository } from "../infrastructure/repositories/CachedUserRepository.js";
import { InMemoryUserRepository } from "../infrastructure/repositories/InMemoryUserRepository.js";
import { UserController } from "../presentation/UserController.js";

export interface UserDependencyInputs {
  database: Database;
  logger: Logger;
  redisClient: RedisClient;
}

export function createUserDependencies(
  dependencies: UserDependencyInputs
) {
  const innerUserRepository = new InMemoryUserRepository(
    dependencies.database
  );

  const userRepository = new CachedUserRepository(
    innerUserRepository,
    dependencies.redisClient
  );

  const userService = new UserService(
    userRepository,
    dependencies.logger
  );

  const userController = new UserController(userService);

  return {
    innerUserRepository,
    userRepository,
    userService,
    userController
  };
}
