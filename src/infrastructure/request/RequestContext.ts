// Để lưu thông tin của 1 HTTP request:
// - Request ID
// - Current user
// - Tenant ID
// - Transaction/Unit of work
// -> Những thứ có thể thay đổi theo từng request
export class RequestContext {
  constructor(readonly requestId: string) {}
}
