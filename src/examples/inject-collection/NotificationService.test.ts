import { describe, expect, it } from "vitest";
import type {
  NotificationChannel,
  NotificationMessage
} from "./NotificationService.js";
import { NotificationService } from "./NotificationService.js";

class CapturingNotificationChannel implements NotificationChannel {
  readonly sentMessages: NotificationMessage[] = [];

  constructor(readonly name: string) {}

  async send(message: NotificationMessage): Promise<void> {
    this.sentMessages.push(message);
  }
}

describe("NotificationService inject collection example", () => {
  it("injects a collection of notification channels", async () => {
    const emailChannel = new CapturingNotificationChannel("email");
    const smsChannel = new CapturingNotificationChannel("sms");
    const auditLogChannel =
      new CapturingNotificationChannel("audit-log");

    const service = new NotificationService([
      emailChannel,
      smsChannel,
      auditLogChannel
    ]);

    const message: NotificationMessage = {
      recipientId: "user-1",
      subject: "Welcome",
      body: "Thanks for joining."
    };

    await service.notify(message);

    expect(emailChannel.sentMessages).toEqual([message]);
    expect(smsChannel.sentMessages).toEqual([message]);
    expect(auditLogChannel.sentMessages).toEqual([message]);
  });
});
