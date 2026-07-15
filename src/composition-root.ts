import { createSharedDependencies } from "./composition/shared-dependencies.js";
import { createUserDependencies } from "./composition/user-dependencies.js";

/**
 * Composition Root
 *
 * Đây là nơi duy nhất chịu trách nhiệm:
 * - Tạo implementation cụ thể
 * - Kết nối dependency
 * - Xây dựng object graph của ứng dụng
 */
export function createApplicationDependencies() {
  const sharedDependencies = createSharedDependencies();
  const userDependencies = createUserDependencies(sharedDependencies);

  return {
    ...sharedDependencies,
    ...userDependencies
  };
}
