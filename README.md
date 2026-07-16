# Manual DI Node.js Sample

Minh họa cách dùng Dependency Injection trong Node.js + TypeScript, có DI container tự viết và không dùng thư viện DI container như InversifyJS.

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

### 6. Decorator Pattern Kết Hợp DI

Decorator nhận một dependency gốc, bọc nó lại, thêm chức năng mới, nhưng vẫn giữ cùng interface để code đang dùng dependency đó không cần thay đổi.

Ví dụ:

```text
src/infrastructure/repositories/CachedUserRepository.ts
```

`CachedUserRepository` implement `UserRepository`, nhưng bên trong nhận thêm:

```ts
innerRepository: UserRepository
redisClient: RedisClient
```

Nó decorate repository thật bằng cache Redis:

```text
UserService
    ↓
UserRepository interface
    ↓
CachedUserRepository
    ↓
InMemoryUserRepository
```

Composition lắp decorator tại:

```text
src/composition/user-dependencies.ts
```

### 7. DI Container Tự Viết

Project có một DI container nhỏ tự viết, không dùng thư viện bên ngoài.

Xem tại:

```text
src/composition/DiContainer.ts
src/composition/tokens.ts
```

Container hỗ trợ:

- `registerSingleton()`
- `registerTransient()`
- `registerScoped()`
- `registerValue()`
- `resolve()`
- `createScope()`

Ví dụ ý tưởng:

```ts
container.registerSingleton(TOKENS.logger, () => new ConsoleLogger());

const logger = container.resolve(TOKENS.logger);
```

`tokens.ts` định nghĩa token cho từng dependency:

```ts
TOKENS.logger
TOKENS.database
TOKENS.redisClient
TOKENS.requestContext
TOKENS.userRepository
TOKENS.userService
TOKENS.userController
```

Container cần token để biết dependency nào đang được register/resolve.

### 8. Composition Root

Dependency graph được đăng ký thủ công vào DI container.

```text
src/composition-root.ts
src/composition/DiContainer.ts
src/composition/tokens.ts
src/composition/shared-dependencies.ts
src/composition/user-dependencies.ts
```

`composition-root.ts` tạo container, đăng ký module, rồi resolve dependency cần dùng:

```ts
const container = new DiContainer();

registerSharedDependencies(container);
registerUserDependencies(container);

const userController = container.resolve(TOKENS.userController);
```

`shared-dependencies.ts` register dependency dùng chung:

- `ConsoleLogger`
- `MockDatabase`
- `MockRedisClient`
- `RequestIdGenerator`
- `RequestContext`
- `disposables`

`RequestIdGenerator` dùng `registerTransient()`:

```ts
container.registerTransient(
  TOKENS.requestIdGenerator,
  () => new RequestIdGenerator()
);
```

`RequestIdGenerator` được dùng bên trong factory của `RequestContext` để tạo request id:

```ts
container.resolve(TOKENS.requestIdGenerator).generate()
```

`RequestContext` dùng `registerScoped()`:

```ts
container.registerScoped(
  TOKENS.requestContext,
  (container) =>
    new RequestContext(
      container.resolve(TOKENS.requestIdGenerator).generate()
    )
);
```

Trong `server.ts`, mỗi HTTP request tạo một scope riêng:

```ts
const requestContainer = container.createScope();
const requestContext = requestContainer.resolve(TOKENS.requestContext);

response.locals.requestContainer = requestContainer;
response.locals.requestContext = requestContext;
response.setHeader("X-Request-Id", requestContext.requestId);
```

Ý nghĩa:

```text
Cùng một request:
  resolve RequestContext nhiều lần -> cùng object

Request khác:
  resolve RequestContext -> object khác
```

`user-dependencies.ts` register dependency riêng của user module:

- `InMemoryUserRepository`
- `CachedUserRepository`
- `UserService`
- `UserController`

### 9. DI Lifecycle Và Resource Cleanup

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
