export type Token<T> = symbol & {
  readonly __type?: T;
};

export type DependencyFactory<T> = (
  container: DiContainer
) => T;

interface Registration<T> {
  readonly lifetime: "singleton" | "transient" | "scoped";
  readonly factory: DependencyFactory<T>;
}

interface FoundRegistration<T> {
  readonly owner: DiContainer;
  readonly registration: Registration<T>;
}

// Token là một symbol duy nhất để định danh một dependency.
// Mục đích là để phân biệt các dependency khác nhau có cùng interface.
// Ví dụ: UserRepository có 2 implementation là InMemoryUserRepository và CachedUserRepository.
// Nếu không có token, container sẽ không biết dependency nào đang được register/resolve.
export function createToken<T>(description: string): Token<T> {
  return Symbol(description) as Token<T>;
}

// Tạo container
export class DiContainer {
  constructor(private readonly parent?: DiContainer) {}

  private readonly registrations = new Map<
    Token<unknown>,
    Registration<unknown>
  >();

  private readonly singletonInstances = new Map<
    Token<unknown>,
    unknown
  >();

  private readonly scopedInstances = new Map<
    Token<unknown>,
    unknown
  >();

  // Tạo scoped container
  // Sử dụng với mỗi HTTP request để:
  // - Tạo RequestContext duy nhất cho request đó
  // - Resolve dependencies với lifetime "scoped"
  createScope(): DiContainer {
    return new DiContainer(this);
  }

  // Đăng kí dependency là singleton
  // Mục đích của singleton là khi resolve dependency nhiều lần thì sẽ trả về CÙNG MỘT OBJECT.
  // Factory function chỉ được gọi một lần.
  // Sử dụng khi nào cần class instance duy nhất trong suốt vòng đời của ứng dụng.
  // Ví dụ: Database Connection, Logger, Config, ...
  registerSingleton<T>(
    token: Token<T>,
    factory: DependencyFactory<T>
  ): void {
    this.registrations.set(token, {
      lifetime: "singleton",
      factory: factory as DependencyFactory<unknown>
    });
  }

  // Đăng kí dependency là transient
  // Mục đích của transient là khi resolve dependency nhiều lần thì sẽ trả về OBJECT KHÁC NHAU.
  // Factory function được gọi mỗi lần resolve dependency.
  // Sử dụng khi nào cần class instance mới mỗi lần gọi
  // Ví dụ: Message Queue, Request Handler, Redis Client,... 
  registerTransient<T>(
    token: Token<T>,
    factory: DependencyFactory<T>
  ): void {
    this.registrations.set(token, {
      lifetime: "transient",
      factory: factory as DependencyFactory<unknown>
    });
  }

  // Đăng kí dependency là request scoped
  // Mục đích của scoped là trong cùng một scope thì resolve nhiều lần trả về CÙNG MỘT OBJECT.
  // Nhưng sang scope khác, container sẽ tạo object khác.
  // Với HTTP server, mỗi request thường tạo một scope riêng.
  // Ví dụ: RequestContext, CurrentUser, TenantContext, UnitOfWork,...
  registerScoped<T>(
    token: Token<T>,
    factory: DependencyFactory<T>
  ): void {
    this.registrations.set(token, {
      lifetime: "scoped",
      factory: factory as DependencyFactory<unknown>
    });
  }

  // Đăng kí dependency là value
  // value là object được tạo sẵn
  // Mặc định là singleton
  registerValue<T>(token: Token<T>, value: T): void {
    this.registerSingleton(token, () => value);
  }

  // Resolve dependency
  // Nếu là transient thì trả về object mới
  // Nếu là singleton thì trả về object đã tạo
  // Nếu là scoped thì trả về object trong scope hiện tại
  resolve<T>(token: Token<T>): T {
    const foundRegistration = this.findRegistration(
      token as Token<unknown>
    );

    if (!foundRegistration) {
      throw new Error(
        `Dependency is not registered: ${String(token.description)}`
      );
    }

    const { owner, registration } = foundRegistration;

    if (registration.lifetime === "transient") {
      return registration.factory(this) as T;
    }

    if (registration.lifetime === "scoped") {
      if (!this.scopedInstances.has(token as Token<unknown>)) {
        this.scopedInstances.set(
          token as Token<unknown>,
          registration.factory(this)
        );
      }

      return this.scopedInstances.get(token as Token<unknown>) as T;
    }

    if (!owner.singletonInstances.has(token as Token<unknown>)) {
      owner.singletonInstances.set(
        token as Token<unknown>,
        registration.factory(owner)
      );
    }

    return owner.singletonInstances.get(token as Token<unknown>) as T;
  }

  private findRegistration<T>(
    token: Token<T>
  ): FoundRegistration<unknown> | null {
    const registration = this.registrations.get(
      token as Token<unknown>
    );

    if (registration) {
      return {
        owner: this,
        registration
      };
    }

    return this.parent?.findRegistration(token) ?? null;
  }
}
