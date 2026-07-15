import { describe, expect, it } from "vitest";
import type { Logger } from "../../application/ports/Logger.js";
import type {
  ExportUser,
  UserExportRepository
} from "./UserExportService.js";
import { UserExportService } from "./UserExportService.js";

class FakeUserExportRepository implements UserExportRepository {
  constructor(private readonly users: ExportUser[]) {}

  async findAll(): Promise<ExportUser[]> {
    return this.users;
  }
}

class CapturingLogger implements Logger {
  readonly infoCalls: Array<{
    message: string;
    metadata?: Record<string, unknown>;
  }> = [];

  info(message: string, metadata?: Record<string, unknown>): void {
    this.infoCalls.push({ message, metadata });
  }

  error(): void {}
}

describe("UserExportService method injection example", () => {
  it("receives logger through the exportUsers method", async () => {
    const repository = new FakeUserExportRepository([
      {
        id: "user-1",
        name: "Viet",
        email: "viet@example.com"
      },
      {
        id: "user-2",
        name: "An",
        email: "an@example.com"
      }
    ]);
    const logger = new CapturingLogger();

    const service = new UserExportService(repository);

    const csv = await service.exportUsers(logger);

    expect(csv).toBe(
      [
        "user-1,Viet,viet@example.com",
        "user-2,An,an@example.com"
      ].join("\n")
    );

    expect(logger.infoCalls).toEqual([
      {
        message: "Users exported",
        metadata: {
          total: 2
        }
      }
    ]);
  });
});
