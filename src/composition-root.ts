import { DiContainer } from "./composition/DiContainer.js";
import { registerSharedDependencies } from "./composition/shared-dependencies.js";
import { TOKENS } from "./composition/tokens.js";
import { registerUserDependencies } from "./composition/user-dependencies.js";

/**
 * Composition Root
 *
 * Đây là nơi duy nhất chịu trách nhiệm:
 * - Tạo implementation cụ thể
 * - Kết nối dependency
 * - Xây dựng object graph của ứng dụng
 */
export function createApplicationDependencies() {
  const container = new DiContainer();

  // Đăng kí dependency
  registerSharedDependencies(container);
  registerUserDependencies(container);

  return {
    container,
    // Lấy các dependency từ container
    // Nếu là transient thì sẽ tạo object mới mỗi lần gọi
    // Nếu là singleton thì sẽ trả về object đã tạo
    database: container.resolve(TOKENS.database),
    disposables: container.resolve(TOKENS.disposables),
    innerUserRepository: container.resolve(TOKENS.innerUserRepository),
    logger: container.resolve(TOKENS.logger),
    redisClient: container.resolve(TOKENS.redisClient),
    userController: container.resolve(TOKENS.userController),
    userRepository: container.resolve(TOKENS.userRepository),
    userService: container.resolve(TOKENS.userService)
  };
}
