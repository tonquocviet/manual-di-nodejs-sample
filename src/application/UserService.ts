import { randomUUID } from "node:crypto";
import type { User } from "../domain/User.js";
import type { Logger } from "./ports/Logger.js";
import type { UserRepository } from "./ports/UserRepository.js";

export interface RegisterUserInput {
  name: string;
  email: string;
}

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger
  ) {}

  async register(input: RegisterUserInput): Promise<User> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    if (!name) {
      throw new Error("Name is required");
    }

    if (!email) {
      throw new Error("Email is required");
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const user = await this.userRepository.create({
      id: randomUUID(),
      name,
      email
    });

    this.logger.info("User registered", {
      userId: user.id,
      email: user.email
    });

    return user;
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
