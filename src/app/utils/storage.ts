export const STORAGE_PREFIX = 'epub:v1:';

/**
 * Read a value from `epub:v1:<suffix>`. If absent and a legacy bare key is
 * supplied, the legacy value is moved into the new key (one-shot migration).
 */
export function readStorage(suffix: string, legacyKey?: string): string | null {
  const key = STORAGE_PREFIX + suffix;
  const current = localStorage.getItem(key);
  if (current !== null) return current;
  if (legacyKey) {
    const legacy = localStorage.getItem(legacyKey);
    if (legacy !== null) {
      try {
        localStorage.setItem(key, legacy);
        localStorage.removeItem(legacyKey);
      } catch { /* quota */ }
      return legacy;
    }
  }
  return null;
}

export function writeStorage(suffix: string, value: string): void {
  try { localStorage.setItem(STORAGE_PREFIX + suffix, value); } catch { /* quota */ }
}
