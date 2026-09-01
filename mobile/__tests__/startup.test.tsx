/**
 * Startup smoke test.
 *
 * Renders the real <App /> and drives it through every startup phase that ran
 * on Apple's review iPad when build 93 crashed at launch:
 *   1. full module-graph evaluation (all imports, module-scope code)
 *   2. first render + mount effects (theme/unit init, auth listener)
 *   3. the 1500ms deferred native-module init (notifications/analytics/RC)
 *   4. the 8s boot watchdog
 *
 * The test fails on ANY uncaught error or unhandled rejection surfaced during
 * those phases — the exact error class that RCTFatal turns into a SIGABRT in
 * a release build.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

describe('app startup', () => {
  it('boots without throwing through deferred init and watchdog', async () => {
    jest.useFakeTimers();

    const uncaught: unknown[] = [];
    const prevHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error) => {
      uncaught.push(error);
    });

    let renderer!: TestRenderer.ReactTestRenderer;
    try {
      // Phase 1+2: module evaluation, first render, mount effects
      const App = require('../App').default;
      await act(async () => {
        renderer = TestRenderer.create(React.createElement(App));
      });
      expect(renderer.toJSON()).toBeTruthy();

      // Phase 3: 1500ms deferred init (notifications, analytics, RevenueCat)
      await act(async () => {
        await jest.advanceTimersByTimeAsync(2000);
      });

      // Phase 4: 8s boot watchdog fires; app must settle on a real screen
      await act(async () => {
        await jest.advanceTimersByTimeAsync(8500);
      });
      expect(renderer.toJSON()).toBeTruthy();

      expect(uncaught).toEqual([]);
    } finally {
      ErrorUtils.setGlobalHandler(prevHandler);
      if (renderer) {
        await act(async () => {
          renderer.unmount();
        });
      }
      jest.useRealTimers();
    }
  });
});
