# Factory Injection Example

Thay vì inject một instance, inject function có nhiệm vụ tạo instance.

Ví dụ:

```ts
const service = new TenantUserReportService(createUserRepository);

await service.buildReport("tenant-a");
await service.buildReport("tenant-b");
```

`TenantUserReportService` không nhận trực tiếp `TenantUserRepository`. Nó nhận factory:

```ts
type TenantUserRepositoryFactory = (
  tenantId: string
) => TenantUserRepository;
```

Bên trong method, service gọi factory để lấy repository phù hợp với từng `tenantId`.

Factory Injection hữu ích khi dependency cần được tạo động theo request, tenant, transaction, user, hoặc runtime configuration.
