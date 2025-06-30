// lib/utils/debounce.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

// Simple lock mechanism to prevent concurrent execution
const locks = new Map<string, boolean>();

export function withLock<T extends (...args: any[]) => Promise<any>>(
  key: string,
  func: T
): T {
  return (async (...args: Parameters<T>) => {
    if (locks.get(key)) {
      console.log(`🔒 Function ${key} is locked, skipping execution`);
      return;
    }

    locks.set(key, true);
    try {
      return await func.apply(null, args);
    } finally {
      locks.set(key, false);
    }
  }) as T;
}
