import { describe, expect, it } from "vitest";
import { DiContainer } from "./DiContainer.js";
import { registerSharedDependencies } from "./shared-dependencies.js";
import { TOKENS } from "./tokens.js";

describe("registerSharedDependencies", () => {
  it("registers RequestIdGenerator as transient", () => {
    const container = new DiContainer();

    registerSharedDependencies(container);

    const firstGenerator = container.resolve(TOKENS.requestIdGenerator);
    const secondGenerator = container.resolve(TOKENS.requestIdGenerator);

    expect(firstGenerator).not.toBe(secondGenerator);
    expect(firstGenerator.instanceId).not.toBe(
      secondGenerator.instanceId
    );
  });

  it("registers RequestContext as request scoped", () => {
    const container = new DiContainer();

    registerSharedDependencies(container);

    const firstRequestScope = container.createScope();
    const secondRequestScope = container.createScope();

    const firstContext = firstRequestScope.resolve(TOKENS.requestContext);
    const sameFirstContext = firstRequestScope.resolve(
      TOKENS.requestContext
    );
    const secondContext = secondRequestScope.resolve(
      TOKENS.requestContext
    );

    expect(firstContext).toBe(sameFirstContext);
    expect(firstContext).not.toBe(secondContext);
    expect(firstContext.requestId).not.toBe(secondContext.requestId);
  });
});
