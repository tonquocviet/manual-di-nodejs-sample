import { describe, expect, it } from "vitest";
import type {
  TenantUser,
  TenantUserRepository,
  TenantUserRepositoryFactory
} from "./TenantUserReportService.js";
import { TenantUserReportService } from "./TenantUserReportService.js";

class FakeTenantUserRepository implements TenantUserRepository {
  constructor(private readonly users: TenantUser[]) {}

  async countActiveUsers(): Promise<number> {
    return this.users.filter((user) => user.isActive).length;
  }

  async findRecentUsers(limit: number): Promise<TenantUser[]> {
    return this.users.slice(0, limit);
  }
}

describe("TenantUserReportService factory injection example", () => {
  it("injects a repository factory instead of one repository instance", async () => {
    const requestedTenantIds: string[] = [];

    const repositoriesByTenantId = new Map<
      string,
      TenantUserRepository
    >([
      [
        "tenant-a",
        new FakeTenantUserRepository([
          {
            id: "user-a-1",
            name: "Viet",
            email: "viet@tenant-a.test",
            isActive: true
          },
          {
            id: "user-a-2",
            name: "An",
            email: "an@tenant-a.test",
            isActive: false
          }
        ])
      ],
      [
        "tenant-b",
        new FakeTenantUserRepository([
          {
            id: "user-b-1",
            name: "Bao",
            email: "bao@tenant-b.test",
            isActive: true
          }
        ])
      ]
    ]);

    const createUserRepository: TenantUserRepositoryFactory = (
      tenantId
    ) => {
      requestedTenantIds.push(tenantId);

      const repository = repositoriesByTenantId.get(tenantId);

      if (!repository) {
        throw new Error("Unknown tenant");
      }

      return repository;
    };

    const service = new TenantUserReportService(createUserRepository);

    const tenantAReport = await service.buildReport("tenant-a");
    const tenantBReport = await service.buildReport("tenant-b");

    expect(requestedTenantIds).toEqual(["tenant-a", "tenant-b"]);
    expect(tenantAReport).toMatchObject({
      tenantId: "tenant-a",
      activeUsers: 1
    });
    expect(tenantAReport.recentUsers).toHaveLength(2);

    expect(tenantBReport).toMatchObject({
      tenantId: "tenant-b",
      activeUsers: 1
    });
    expect(tenantBReport.recentUsers).toHaveLength(1);
  });
});
