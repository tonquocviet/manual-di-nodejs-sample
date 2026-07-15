# Manual Dependency Injection với Node.js và TypeScript

Repo này minh họa cách áp dụng **Dependency Injection thủ công**, không sử dụng InversifyJS hay bất kỳ DI Container nào.

## Mục tiêu

Sau khi đọc và chạy repo, bạn sẽ thấy rõ:

1. Dependency là gì.
2. Constructor Injection hoạt động như thế nào.
3. Business logic phụ thuộc vào abstraction thay vì implementation cụ thể.
4. Composition Root chịu trách nhiệm tạo và kết nối object.
5. Unit test có thể inject dependency giả mà không cần database thật.
6. Dependency giữ resource bên ngoài cần được giải phóng khi ứng dụng dừng.
7. Vì sao một IoC Container như InversifyJS có thể hữu ích khi dependency graph lớn lên.

## Dependency graph

```text
Express route
    ↓
UserController
    ↓
UserService
    ├── UserRepository
    └── Logger

UserRepository
    ↓
Database

Composition Root tạo toàn bộ object:

Shared dependencies:
ConsoleLogger
MockDatabase
MockRedisClient

User dependencies:
MockDatabase
        ↓
InMemoryUserRepository
        ↓
UserService
        ↓
UserController

Lifecycle:
MockRedisClient
        ↓
disposables
```

## Cấu trúc thư mục

```text
src/
├── application/
│   ├── ports/
│   │   ├── Logger.ts
│   │   └── UserRepository.ts
│   └── UserService.ts
├── domain/
│   └── User.ts
├── composition/
│   ├── shared-dependencies.ts
│   └── user-dependencies.ts
├── infrastructure/
│   ├── cache/
│   │   ├── RedisClient.ts
│   │   └── MockRedisClient.ts
│   ├── database/
│   │   ├── Database.ts
│   │   └── MockDatabase.ts
│   ├── lifecycle/
│   │   └── Disposable.ts
│   ├── logging/
│   │   └── ConsoleLogger.ts
│   └── repositories/
│       └── InMemoryUserRepository.ts
├── presentation/
│   └── UserController.ts
├── composition-root.ts
└── server.ts
```

## Cài đặt và chạy

```bash
npm install
npm run dev
```

Server chạy tại:

```text
http://localhost:3000
```

## API

### Tạo user

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Viet","email":"viet@example.com"}'
```

### Lấy user

```bash
curl http://localhost:3000/users/<USER_ID>
```

## Chạy test

```bash
npm test
```

## Điểm quan trọng nhất

`UserService` không tự tạo repository:

```ts
// Không nên:
this.userRepository = new InMemoryUserRepository();

// Nên:
constructor(
  private readonly userRepository: UserRepository
) {}
```

Dependency được chia theo module composition:

```ts
// composition/shared-dependencies.ts
const logger = new ConsoleLogger();
const database = new MockDatabase();
const redisClient = new MockRedisClient();
const disposables = [
  redisClient
];

// composition/user-dependencies.ts
const userRepository = new InMemoryUserRepository(database);

const userService = new UserService(
  userRepository,
  logger
);

const userController = new UserController(userService);
```

`composition-root.ts` chỉ gom các nhóm dependency lại:

```ts
const sharedDependencies = createSharedDependencies();
const userDependencies = createUserDependencies(sharedDependencies);

return {
  ...sharedDependencies,
  ...userDependencies
};
```

## Giải phóng dependency khi ứng dụng dừng

Dependency như Redis, PostgreSQL, message queue, scheduler hoặc HTTP client pool thường giữ connection/resource bên ngoài.

Dependency nào cần cleanup có thể implement `Disposable`:

```ts
export interface Disposable {
  dispose(): Promise<void>;
}
```

Ví dụ `MockRedisClient` có `dispose()`:

```ts
async dispose(): Promise<void> {
  this.values.clear();
  this.disposed = true;
}
```

`shared-dependencies.ts` gom các dependency cần cleanup vào `disposables`:

```ts
const redisClient = new MockRedisClient();

const disposables = [
  redisClient
];
```

`server.ts` bắt signal khi Node.js process dừng:

```ts
process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});
```

Trong `shutdown()`, server ngừng nhận request mới rồi gọi:

```ts
await closeServer();
await disposeAll(disposables);
```

## Vì sao interface được đặt trong application/ports?

`UserService` là business logic cấp cao. Nó chỉ nên biết mình cần một repository có các hành vi:

```ts
create()
findById()
```

Nó không cần biết repository lưu dữ liệu bằng:

- Array trong memory
- PostgreSQL
- MongoDB
- REST API
- File JSON

Đây là tư duy Dependency Inversion.

## Bài tập mở rộng

1. Tạo `PostgresUserRepository` nhưng không sửa `UserService`.
2. Tạo `SilentLogger` để không in log khi test.
3. Thêm `EmailService` và inject vào `UserService`.
4. Thêm một `UserIdGenerator` thay vì gọi `randomUUID()` trực tiếp.
5. Sau khi dependency graph lớn hơn, thử chuyển Composition Root sang InversifyJS.
