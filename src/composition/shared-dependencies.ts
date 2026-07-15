import { MockDatabase } from "../infrastructure/database/MockDatabase.js";
import { ConsoleLogger } from "../infrastructure/logging/ConsoleLogger.js";

export function createSharedDependencies() {
  const logger = new ConsoleLogger();
  const database = new MockDatabase();

  return {
    database,
    logger
  };
}
