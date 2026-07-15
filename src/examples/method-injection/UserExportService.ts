import type { Logger } from "../../application/ports/Logger.js";

export interface ExportUser {
  id: string;
  name: string;
  email: string;
}

export interface UserExportRepository {
  findAll(): Promise<ExportUser[]>;
}

export class UserExportService {
  constructor(
    private readonly userExportRepository: UserExportRepository
  ) {}

  // Method Injection
  async exportUsers(logger: Logger): Promise<string> {
    const users = await this.userExportRepository.findAll();

    logger.info("Users exported", {
      total: users.length
    });

    return users
      .map((user) => `${user.id},${user.name},${user.email}`)
      .join("\n");
  }
}
