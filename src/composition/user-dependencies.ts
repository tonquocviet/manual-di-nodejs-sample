import { UserService } from "../application/UserService.js";
import { CachedUserRepository } from "../infrastructure/repositories/CachedUserRepository.js";
import { InMemoryUserRepository } from "../infrastructure/repositories/InMemoryUserRepository.js";
import { UserController } from "../presentation/UserController.js";
import type { DiContainer } from "./DiContainer.js";
import { TOKENS } from "./tokens.js";

// Đăng kí các dependency riêng của user module
export function registerUserDependencies(
  container: DiContainer
): void {
  container.registerSingleton(TOKENS.innerUserRepository, (container) =>
    new InMemoryUserRepository(container.resolve(TOKENS.database))
  );

  container.registerSingleton(TOKENS.userRepository, (container) =>
    new CachedUserRepository(
      container.resolve(TOKENS.innerUserRepository),
      container.resolve(TOKENS.redisClient)
    )
  );

  container.registerSingleton(TOKENS.userService, (container) =>
    new UserService(
      container.resolve(TOKENS.userRepository),
      container.resolve(TOKENS.logger)
    )
  );

  container.registerSingleton(TOKENS.userController, (container) =>
    new UserController(container.resolve(TOKENS.userService))
  );
}
