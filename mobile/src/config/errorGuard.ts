// Global JS error guard
// MUST be imported first (from index.ts) before any other app code.
//
// Background: in a release build, React Native's default global error handler
// forwards uncaught JS exceptions to native RCTFatal, which raises an
// NSException on ExceptionsManagerQueue and aborts the process (SIGABRT).
// This is what produced the App Store crash logs on iPad: any error thrown
// from a timer, event-emitter, or animation callback — a class of errors that
// neither the root ErrorBoundary nor promise .catch() can intercept — killed
// the app within ~200ms of launch.
//
// In production we log and report the error instead of aborting. In dev we
// keep the default handler so the RedBox still shows.

declare const ErrorUtils: {
  getGlobalHandler: () => (error: unknown, isFatal?: boolean) => void;
  setGlobalHandler: (handler: (error: unknown, isFatal?: boolean) => void) => void;
};

const reportError = (error: unknown, context: string) => {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[errorGuard] ${context}:`, message, stack ?? '');

  // Fire-and-forget analytics report so future crashes leave a trace we can
  // read in GA4 (the App Store .ips logs strip the JS message entirely).
  // Lazy import + double guard: the reporter itself must never throw.
  try {
    import('../utils/analytics')
      .then((analytics) =>
        analytics.trackJsError(context, message.slice(0, 100), (stack ?? '').slice(0, 100))
      )
      .catch(() => {});
  } catch {
    // ignore — reporting must never crash the app
  }
};

const installErrorGuard = () => {
  if (__DEV__) return; // keep RedBox behavior in development

  try {
    ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
      // Deliberately do NOT call the default handler: for isFatal errors it
      // triggers RCTFatal -> abort(). Log + report and let the app keep running.
      reportError(error, isFatal ? 'fatal_js_error' : 'js_error');
    });
  } catch {
    // ErrorUtils unavailable (should never happen in RN) — nothing to do
  }

  // Surface unhandled promise rejections in production logs/analytics too.
  // RN only warns about these in dev; in release they were silently dropped.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rejectionTracking = require('promise/setimmediate/rejection-tracking');
    rejectionTracking.enable({
      allRejections: true,
      onUnhandled: (_id: number, error: unknown) => reportError(error, 'unhandled_rejection'),
      onHandled: () => {},
    });
  } catch {
    // tracker unavailable — non-critical
  }
};

// Install at import time (module side effect): index.ts imports this module
// first, so the guard is active before any other module evaluates.
installErrorGuard();

export { installErrorGuard };
