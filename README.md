# Manual DI Node.js Sample

Dự án này minh họa cách dùng Dependency Injection thủ công trong Node.js + TypeScript, không dùng DI container.

## Những gì đã thể hiện

### 1. Constructor Injection

`UserService` nhận dependency qua constructor:

- `UserRepository`
- `Logger`

Xem tại:

```text
src/application/UserService.ts
src/composition/user-dependencies.ts
```

`InMemoryUserRepository` cũng nhận `Database` qua constructor:

```text
src/infrastructure/repositories/InMemoryUserRepository.ts
```

Ý nghĩa: class không tự `new` dependency bên trong, dependency được tạo từ bên ngoài rồi truyền vào.

### 2. Method Injection

Dependency được truyền trực tiếp vào method khi gọi.

Ví dụ:

```text
src/examples/method-injection/UserExportService.ts
```

`UserExportService` nhận repository qua constructor, nhưng nhận `Logger` qua method `exportUsers(logger)`.

### 3. Factory Injection

Thay vì inject một repository cụ thể, service nhận một factory function để tạo repository khi cần.

Ví dụ:

```text
src/examples/factory-injection/TenantUserReportService.ts
```

`TenantUserReportService` nhận:

```ts
TenantUserRepositoryFactory
```

rồi tạo repository theo `tenantId` trong `buildReport()`.

### 4. Higher-Order Function Injection

Dependencies được inject vào một function, function đó trả về một function nghiệp vụ đã được cấu hình sẵn.

Ví dụ:

```text
src/examples/higher-order-function-injection/SendInactiveUserDigest.ts
```

`createSendInactiveUserDigest(dependencies)` trả về function `sendInactiveUserDigest(daysInactive)`.

### 5. Inject Collection

Inject nhiều implementation cùng chung interface vào một service.

Ví dụ:

```text
src/examples/inject-collection/NotificationService.ts
```

`NotificationService` nhận:

```ts
NotificationChannel[]
```

để gửi notification qua nhiều channel.

## Composition Root

Dependency graph được tạo thủ công trong composition layer.

```text
src/composition-root.ts
src/composition/shared-dependencies.ts
src/composition/user-dependencies.ts
```

`composition-root.ts` chỉ gom dependency:

```ts
const sharedDependencies = createSharedDependencies();
const userDependencies = createUserDependencies(sharedDependencies);
```

`shared-dependencies.ts` tạo dependency dùng chung:

- `ConsoleLogger`
- `MockDatabase`
- `MockRedisClient`
- `disposables`

`user-dependencies.ts` tạo dependency riêng của user module:

- `InMemoryUserRepository`
- `UserService`
- `UserController`

## DI Lifecycle Và Resource Cleanup

Một số dependency chỉ là object trong memory, không cần cleanup thủ công.

Một số dependency giữ resource bên ngoài, ví dụ:

- Redis connection
- Database connection pool
- Message queue
- Scheduler
- HTTP client pool

Những dependency này nên implement `Disposable`:

```text
src/infrastructure/lifecycle/Disposable.ts
```

```ts
export interface Disposable {
  dispose(): Promise<void>;
}
```

Ví dụ Redis mock:

```text
src/infrastructure/cache/MockRedisClient.ts
```

`MockRedisClient` implement:

```ts
RedisClient
Disposable
```

và có method:

```ts
dispose()
```

Các dependency cần cleanup được gom vào `disposables`:

```text
src/composition/shared-dependencies.ts
```

Khi Node.js process dừng, `server.ts` bắt signal:

```text
SIGINT
SIGTERM
```

Xem tại:

```text
src/server.ts
```

Thứ tự shutdown:

1. Dừng HTTP server để không nhận request mới.
2. Gọi `disposeAll(disposables)`.
3. Mỗi dependency tự cleanup qua `dispose()`.
4. Process exit.

## Cấu Trúc Chính

```text
src/
├── application/
├── composition/
├── domain/
├── examples/
├── infrastructure/
├── presentation/
├── composition-root.ts
└── server.ts
```

## Chạy Dự Án

```bash
npm install
npm run dev
```

Server chạy tại:

```text
http://localhost:3000
```

API tester cho môi trường dev:

```text
http://localhost:3000/dev/api-tester
```

## API

Tạo user:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Viet","email":"viet@example.com"}'
```

Lấy user:

```bash
curl http://localhost:3000/users/<USER_ID>
```

## Kiểm Tra

```bash
npm run build
npm test
```
