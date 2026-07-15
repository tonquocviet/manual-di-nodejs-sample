# Inject Collection Example

Inject Collection là inject nhiều dependency cùng chung interface vào một service.

Ví dụ:

```ts
const service = new NotificationService([
  emailChannel,
  smsChannel,
  auditLogChannel
]);

await service.notify(message);
```

`NotificationService` không tự tạo `EmailChannel`, `SmsChannel`, hay `AuditLogChannel`.

Nó chỉ nhận một collection:

```ts
constructor(
  private readonly channels: NotificationChannel[]
) {}
```

Cách này hữu ích khi một workflow cần chạy nhiều handler, channel, rule, strategy, middleware, hoặc plugin cùng interface.
