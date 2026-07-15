import type { Logger } from "../../application/ports/Logger.js";

export class ConsoleLogger implements Logger {
  info(message: string, metadata?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, metadata ?? {});
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, metadata ?? {});
  }
}
