# Higher-Order Function Injection Example

Higher-Order Function Injection nghĩa là ta inject dependencies vào một function, và function đó trả về một function nghiệp vụ đã được cấu hình sẵn.

Ví dụ:

```ts
const sendInactiveUserDigest = createSendInactiveUserDigest({
  userRepository,
  emailSender,
  clock,
  logger
});

await sendInactiveUserDigest(30);
```

`createSendInactiveUserDigest()` là higher-order function vì nó trả về một function khác.

Các dependency không nằm trong class constructor. Chúng được giữ trong closure của function được trả về.

Cách này hợp với code theo phong cách functional, use case nhỏ, hoặc khi bạn muốn tránh tạo class chỉ để gom một method.
