import { describe, expect, it } from "vitest";
import type { User } from "../../domain/User.js";
import { MockDatabase } from "../database/MockDatabase.js";
import { InMemoryUserRepository } from "./InMemoryUserRepository.js";

describe("InMemoryUserRepository", () => {
  it("uses the injected database", async () => {
    const database = new MockDatabase();
    const repository = new InMemoryUserRepository(database);

    const existingUser: User = {
      id: "user-1",
      name: "Existing User",
      email: "existing@example.com"
    };

    await database.insert("users", existingUser);

    expect(await repository.findById(existingUser.id)).toEqual(existingUser);
    expect(await repository.findByEmail(existingUser.email)).toEqual(
      existingUser
    );

    const createdUser = await repository.create({
      id: "user-2",
      name: "Created User",
      email: "created@example.com"
    });

    expect(await database.findById<User>("users", createdUser.id)).toEqual(
      createdUser
    );
  });
});
