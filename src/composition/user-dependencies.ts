import type { Database } from "../infrastructure/database/Database.js";
import type { Logger } from "../application/ports/Logger.js";
import { UserService } from "../application/UserService.js";
import { InMemoryUserRepository } from "../infrastructure/repositories/InMemoryUserRepository.js";
import { UserController } from "../presentation/UserController.js";

export interface UserDependencyInputs {
  database: Database;
  logger: Logger;
}

export function createUserDependencies(
  dependencies: UserDependencyInputs
) {
  const userRepository = new InMemoryUserRepository(
    dependencies.database
  );

  const userService = new UserService(
    userRepository,
    dependencies.logger
  );

  const userController = new UserController(userService);

  return {
    userRepository,
    userService,
    userController
  };
}
