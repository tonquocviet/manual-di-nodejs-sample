import type { Logger } from "../application/ports/Logger.js";
import type { UserRepository } from "../application/ports/UserRepository.js";
import type { UserService } from "../application/UserService.js";
import type { RedisClient } from "../infrastructure/cache/RedisClient.js";
import type { Database } from "../infrastructure/database/Database.js";
import type { Disposable } from "../infrastructure/lifecycle/Disposable.js";
import type { RequestIdGenerator } from "../infrastructure/request/RequestIdGenerator.js";
import type { InMemoryUserRepository } from "../infrastructure/repositories/InMemoryUserRepository.js";
import type { UserController } from "../presentation/UserController.js";
import { createToken } from "./DiContainer.js";

export const TOKENS = {
  database: createToken<Database>("Database"),
  disposables: createToken<Disposable[]>("Disposable[]"),
  innerUserRepository: createToken<InMemoryUserRepository>(
    "InnerUserRepository"
  ),
  logger: createToken<Logger>("Logger"),
  redisClient: createToken<RedisClient & Disposable>("RedisClient"),
  requestIdGenerator: createToken<RequestIdGenerator>(
    "RequestIdGenerator"
  ),
  userController: createToken<UserController>("UserController"),
  userRepository: createToken<UserRepository>("UserRepository"),
  userService: createToken<UserService>("UserService")
};
