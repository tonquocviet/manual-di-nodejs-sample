import type { UserRepository } from "../../application/ports/UserRepository.js";
import type { User } from "../../domain/User.js";
import type { RedisClient } from "../cache/RedisClient.js";
import type { CreateUserInput } from "../../application/ports/UserRepository.js";

export class CachedUserRepository implements UserRepository {
  constructor(
    private readonly innerRepository: UserRepository,
    private readonly redisClient: RedisClient
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const user = await this.innerRepository.create(input);

    await this.cacheUser(user);

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const cacheKey = this.userByIdKey(id);
    const cachedUser = await this.readCachedUser(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.innerRepository.findById(id);

    if (user) {
      await this.cacheUser(user);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const cachedUserId = await this.redisClient.get(
      this.userIdByEmailKey(email)
    );

    if (cachedUserId) {
      const cachedUser = await this.findById(cachedUserId);

      if (cachedUser) {
        return cachedUser;
      }
    }

    const user = await this.innerRepository.findByEmail(email);

    if (user) {
      await this.cacheUser(user);
    }

    return user;
  }

  private async cacheUser(user: User): Promise<void> {
    await Promise.all([
      this.redisClient.set(this.userByIdKey(user.id), JSON.stringify(user)),
      this.redisClient.set(this.userIdByEmailKey(user.email), user.id)
    ]);
  }

  private async readCachedUser(key: string): Promise<User | null> {
    const cachedValue = await this.redisClient.get(key);

    if (!cachedValue) {
      return null;
    }

    try {
      return JSON.parse(cachedValue) as User;
    } catch {
      await this.redisClient.del(key);
      return null;
    }
  }

  private userByIdKey(id: string): string {
    return `users:by-id:${id}`;
  }

  private userIdByEmailKey(email: string): string {
    return `users:id-by-email:${email}`;
  }
}
