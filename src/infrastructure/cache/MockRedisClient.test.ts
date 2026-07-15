import { describe, expect, it } from "vitest";
import { MockRedisClient } from "./MockRedisClient.js";

describe("MockRedisClient", () => {
  it("stores values until it is disposed", async () => {
    const redisClient = new MockRedisClient();

    await redisClient.set("user:1", "Viet");

    expect(await redisClient.get("user:1")).toBe("Viet");

    await redisClient.dispose();

    await expect(redisClient.get("user:1")).rejects.toThrow(
      "Redis client is closed"
    );
  });
});
