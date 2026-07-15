export interface TenantUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface TenantUserRepository {
  countActiveUsers(): Promise<number>;
  findRecentUsers(limit: number): Promise<TenantUser[]>;
}

export type TenantUserRepositoryFactory = (
  tenantId: string
) => TenantUserRepository;

export interface TenantUserReport {
  tenantId: string;
  activeUsers: number;
  recentUsers: TenantUser[];
}

export class TenantUserReportService {
  constructor(
    private readonly createUserRepository: TenantUserRepositoryFactory
  ) {}

  async buildReport(tenantId: string): Promise<TenantUserReport> {
    const userRepository = this.createUserRepository(tenantId);

    const [activeUsers, recentUsers] = await Promise.all([
      userRepository.countActiveUsers(),
      userRepository.findRecentUsers(3)
    ]);

    return {
      tenantId,
      activeUsers,
      recentUsers
    };
  }
}
