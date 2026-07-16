export type Token<T> = symbol & {
  readonly __type?: T;
};

export type DependencyFactory<T> = (
  container: DiContainer
) => T;

interface Registration<T> {
  readonly lifetime: "singleton" | "transient";
  readonly factory: DependencyFactory<T>;
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
  private readonly registrations = new Map<
    Token<unknown>,
    Registration<unknown>
  >();

  private readonly singletonInstances = new Map<
    Token<unknown>,
    unknown
  >();

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

  // Đăng kí dependency là value
  // value là object được tạo sẵn
  // Mặc định là singleton
  registerValue<T>(token: Token<T>, value: T): void {
    this.registerSingleton(token, () => value);
  }

  // Resolve dependency
  // Nếu là transient thì trả về object mới
  // Nếu là singleton thì trả về object đã tạo
  resolve<T>(token: Token<T>): T {
    const registration = this.registrations.get(
      token as Token<unknown>
    );

    if (!registration) {
      throw new Error(
        `Dependency is not registered: ${String(token.description)}`
      );
    }

    if (registration.lifetime === "transient") {
      return registration.factory(this) as T;
    }

    if (!this.singletonInstances.has(token as Token<unknown>)) {
      this.singletonInstances.set(
        token as Token<unknown>,
        registration.factory(this)
      );
    }

    return this.singletonInstances.get(token as Token<unknown>) as T;
  }
}
