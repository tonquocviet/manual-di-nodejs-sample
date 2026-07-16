import { randomUUID } from "node:crypto";

export class RequestIdGenerator {
  readonly instanceId = randomUUID();

  generate(): string {
    return `${this.instanceId}:${randomUUID()}`;
  }
}
