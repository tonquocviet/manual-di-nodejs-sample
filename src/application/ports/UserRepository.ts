import type { User } from "../../domain/User.js";

export interface CreateUserInput {
  id: string;
  name: string;
  email: string;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
