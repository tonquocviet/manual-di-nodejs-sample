export interface Disposable {
  dispose(): Promise<void>;
}

export async function disposeAll(
  disposables: readonly Disposable[]
): Promise<void> {
  for (const disposable of [...disposables].reverse()) {
    await disposable.dispose();
  }
}
