/**
 * Central logger: dev = verbose, prod = errors and minimal audit only.
 * Never log PII or tokens.
 */

const isDev = __DEV__;

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, meta ?? '');
    }
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, meta ?? '');
    }
  },
  error: (message: string, error?: unknown) => {
    // Always log errors (dev and prod); never include PII/tokens.
    if (isDev) {
      console.error(`[ERROR] ${message}`, error ?? '');
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
};
