import type { Logger } from "../../application/ports/Logger.js";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export interface DigestUser {
  id: string;
  name: string;
  email: string;
  lastLoginAt: Date;
}

export interface InactiveUserRepository {
  findInactiveSince(cutoffDate: Date): Promise<DigestUser[]>;
}

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

export interface Clock {
  now(): Date;
}

export interface SendInactiveUserDigestDependencies {
  userRepository: InactiveUserRepository;
  emailSender: EmailSender;
  clock: Clock;
  logger: Logger;
}

export interface SendInactiveUserDigestResult {
  cutoffDate: Date;
  sent: number;
}

export type SendInactiveUserDigest = (
  daysInactive: number
) => Promise<SendInactiveUserDigestResult>;

export function createSendInactiveUserDigest(
  dependencies: SendInactiveUserDigestDependencies
): SendInactiveUserDigest {
  return async function sendInactiveUserDigest(daysInactive) {
    if (daysInactive <= 0) {
      throw new Error("daysInactive must be greater than zero");
    }

    const cutoffDate = new Date(
      dependencies.clock.now().getTime() -
        daysInactive * MILLISECONDS_PER_DAY
    );

    const users =
      await dependencies.userRepository.findInactiveSince(cutoffDate);

    for (const user of users) {
      await dependencies.emailSender.send({
        to: user.email,
        subject: "We miss you",
        body: `Hi ${user.name}, come back and see what is new.`
      });
    }

    dependencies.logger.info("Inactive user digest sent", {
      cutoffDate: cutoffDate.toISOString(),
      sent: users.length
    });

    return {
      cutoffDate,
      sent: users.length
    };
  };
}
