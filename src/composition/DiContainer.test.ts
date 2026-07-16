import { describe, expect, it } from "vitest";
import { createToken, DiContainer } from "./DiContainer.js";

describe("DiContainer", () => {
  it("resolves singleton dependencies once", () => {
    const token = createToken<{ id: number }>("Service");
    const container = new DiContainer();
    let created = 0;

    container.registerSingleton(token, () => {
      created += 1;

      return {
        id: created
      };
    });

    expect(container.resolve(token)).toBe(container.resolve(token));
    expect(created).toBe(1);
  });

  it("resolves transient dependencies every time", () => {
    const token = createToken<{ id: number }>("Service");
    const container = new DiContainer();
    let created = 0;

    container.registerTransient(token, () => {
      created += 1;

      return {
        id: created
      };
    });

    expect(container.resolve(token)).not.toBe(container.resolve(token));
    expect(created).toBe(2);
  });

  it("throws when resolving an unregistered dependency", () => {
    const token = createToken("MissingService");
    const container = new DiContainer();

    expect(() => container.resolve(token)).toThrow(
      "Dependency is not registered: MissingService"
    );
  });
});
