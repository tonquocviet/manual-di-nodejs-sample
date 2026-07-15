import { describe, expect, it } from "vitest";
import type { User } from "../domain/User.js";
import type { Logger } from "./ports/Logger.js";
import type {
  CreateUserInput,
  UserRepository
} from "./ports/UserRepository.js";
import { UserService } from "./UserService.js";

class FakeUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async create(input: CreateUserInput): Promise<User> {
    const user = { ...input };
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return (
      [...this.users.values()].find(
        (user) => user.email === email
      ) ?? null
    );
  }
}

class SilentLogger implements Logger {
  info(): void {}
  error(): void {}
}

describe("UserService", () => {
  it("registers a user using injected dependencies", async () => {
    const repository = new FakeUserRepository();
    const logger = new SilentLogger();

    const service = new UserService(repository, logger);

    const user = await service.register({
      name: "Viet",
      email: "VIET@example.com"
    });

    expect(user.name).toBe("Viet");
    expect(user.email).toBe("viet@example.com");
    expect(await repository.findById(user.id)).toEqual(user);
  });

  it("rejects duplicate emails", async () => {
    const service = new UserService(
      new FakeUserRepository(),
      new SilentLogger()
    );

    await service.register({
      name: "User One",
      email: "same@example.com"
    });

    await expect(
      service.register({
        name: "User Two",
        email: "same@example.com"
      })
    ).rejects.toThrow("Email already exists");
  });
});
