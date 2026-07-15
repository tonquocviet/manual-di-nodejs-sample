import { ConsoleLogger } from "./infrastructure/logging/ConsoleLogger.js";
import { InMemoryUserRepository } from "./infrastructure/repositories/InMemoryUserRepository.js";
import { UserService } from "./application/UserService.js";
import { UserController } from "./presentation/UserController.js";

/**
 * Composition Root
 *
 * Đây là nơi duy nhất chịu trách nhiệm:
 * - Tạo implementation cụ thể
 * - Kết nối dependency
 * - Xây dựng object graph của ứng dụng
 */
export function createApplicationDependencies() {
  const logger = new ConsoleLogger();

  const userRepository = new InMemoryUserRepository();

  const userService = new UserService(
    userRepository,
    logger
  );

  const userController = new UserController(userService);

  return {
    logger,
    userRepository,
    userService,
    userController
  };
}
