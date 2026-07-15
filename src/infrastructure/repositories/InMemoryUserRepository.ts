import type { User } from "../../domain/User.js";
import type {
  CreateUserInput,
  UserRepository
} from "../../application/ports/UserRepository.js";
import type { Database } from "../database/Database.js";

const USERS_COLLECTION = "users";

export class InMemoryUserRepository implements UserRepository {
  constructor(private readonly database: Database) {}

  async create(input: CreateUserInput): Promise<User> {
    return this.database.insert<User>(USERS_COLLECTION, {
      ...input
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.database.findById<User>(USERS_COLLECTION, id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.database.findOne<User>(
      USERS_COLLECTION,
      (user) => user.email === email
    );
  }
}
