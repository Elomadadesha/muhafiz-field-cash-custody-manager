type ErrorContext = {
  source?: string;
  details?: Record<string, unknown>;
};

export function reportError(error: unknown, context: ErrorContext = {}) {
  const normalized = error instanceof Error ? error : new Error(String(error));
  console.error('[Muhafiz error]', {
    name: normalized.name,
    message: normalized.message,
    stack: normalized.stack,
    ...context,
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, { source: 'window.error' });
  });
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, { source: 'unhandledrejection' });
  });
}
