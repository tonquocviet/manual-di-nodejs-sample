import { describe, expect, it } from "vitest";
import type { Logger } from "../../application/ports/Logger.js";
import type {
  Clock,
  DigestUser,
  EmailMessage,
  EmailSender,
  InactiveUserRepository
} from "./SendInactiveUserDigest.js";
import { createSendInactiveUserDigest } from "./SendInactiveUserDigest.js";

class FakeInactiveUserRepository implements InactiveUserRepository {
  readonly requestedCutoffDates: Date[] = [];

  constructor(private readonly users: DigestUser[]) {}

  async findInactiveSince(cutoffDate: Date): Promise<DigestUser[]> {
    this.requestedCutoffDates.push(cutoffDate);

    return this.users.filter(
      (user) => user.lastLoginAt.getTime() < cutoffDate.getTime()
    );
  }
}

class CapturingEmailSender implements EmailSender {
  readonly messages: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<void> {
    this.messages.push(message);
  }
}

class FixedClock implements Clock {
  constructor(private readonly currentDate: Date) {}

  now(): Date {
    return this.currentDate;
  }
}

class CapturingLogger implements Logger {
  readonly infoCalls: Array<{
    message: string;
    metadata?: Record<string, unknown>;
  }> = [];

  info(message: string, metadata?: Record<string, unknown>): void {
    this.infoCalls.push({ message, metadata });
  }

  error(): void {}
}

describe("createSendInactiveUserDigest higher-order function injection example", () => {
  it("injects dependencies into a higher-order function", async () => {
    const userRepository = new FakeInactiveUserRepository([
      {
        id: "user-1",
        name: "Viet",
        email: "viet@example.com",
        lastLoginAt: new Date("2026-06-01T00:00:00.000Z")
      },
      {
        id: "user-2",
        name: "An",
        email: "an@example.com",
        lastLoginAt: new Date("2026-07-10T00:00:00.000Z")
      }
    ]);
    const emailSender = new CapturingEmailSender();
    const clock = new FixedClock(
      new Date("2026-07-15T00:00:00.000Z")
    );
    const logger = new CapturingLogger();

    const sendInactiveUserDigest = createSendInactiveUserDigest({
      userRepository,
      emailSender,
      clock,
      logger
    });

    const result = await sendInactiveUserDigest(30);

    expect(result).toEqual({
      cutoffDate: new Date("2026-06-15T00:00:00.000Z"),
      sent: 1
    });

    expect(emailSender.messages).toEqual([
      {
        to: "viet@example.com",
        subject: "We miss you",
        body: "Hi Viet, come back and see what is new."
      }
    ]);

    expect(userRepository.requestedCutoffDates).toEqual([
      new Date("2026-06-15T00:00:00.000Z")
    ]);

    expect(logger.infoCalls).toEqual([
      {
        message: "Inactive user digest sent",
        metadata: {
          cutoffDate: "2026-06-15T00:00:00.000Z",
          sent: 1
        }
      }
    ]);
  });
});
