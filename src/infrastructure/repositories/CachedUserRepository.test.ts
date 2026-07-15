import { describe, expect, it } from "vitest";
import type { User } from "../../domain/User.js";
import type {
  CreateUserInput,
  UserRepository
} from "../../application/ports/UserRepository.js";
import { MockRedisClient } from "../cache/MockRedisClient.js";
import { CachedUserRepository } from "./CachedUserRepository.js";

class CountingUserRepository implements UserRepository {
  findByIdCalls = 0;
  findByEmailCalls = 0;

  private readonly users = new Map<string, User>();

  constructor(users: User[]) {
    for (const user of users) {
      this.users.set(user.id, user);
    }
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = { ...input };
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    this.findByIdCalls += 1;

    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.findByEmailCalls += 1;

    return (
      [...this.users.values()].find(
        (user) => user.email === email
      ) ?? null
    );
  }
}

describe("CachedUserRepository", () => {
  it("decorates a user repository with cache behavior", async () => {
    const user: User = {
      id: "user-1",
      name: "Viet",
      email: "viet@example.com"
    };
    const innerRepository = new CountingUserRepository([user]);
    const redisClient = new MockRedisClient();
    const repository = new CachedUserRepository(
      innerRepository,
      redisClient
    );

    expect(await repository.findById(user.id)).toEqual(user);
    expect(await repository.findById(user.id)).toEqual(user);

    expect(innerRepository.findByIdCalls).toBe(1);
  });

  it("caches users created through the decorator", async () => {
    const innerRepository = new CountingUserRepository([]);
    const redisClient = new MockRedisClient();
    const repository = new CachedUserRepository(
      innerRepository,
      redisClient
    );

    const user = await repository.create({
      id: "user-2",
      name: "An",
      email: "an@example.com"
    });

    expect(await repository.findByEmail(user.email)).toEqual(user);
    expect(innerRepository.findByEmailCalls).toBe(0);
  });
});
