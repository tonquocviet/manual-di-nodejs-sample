# Method Injection Example

`UserExportService` dùng cả hai kiểu injection để dễ so sánh:

```ts
const service = new UserExportService(repository);

await service.exportUsers(logger);
```

`repository` được truyền qua constructor vì service cần nó như dependency chính.

`logger` được truyền vào method `exportUsers()` vì dependency này chỉ cần cho hành động export cụ thể. Đây là Method Injection.
