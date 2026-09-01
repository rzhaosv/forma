/* eslint-env jest */
// Mocks for device-native modules that have no JS fallback under jest.
// Everything else (Firebase web SDK, zustand stores, navigation, screens)
// runs for real so the startup smoke test exercises the true launch path.

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// A permissive async stub: any property access returns an async jest.fn so
// new native calls added later don't break the harness.
const anyAsyncModule = () =>
  new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === '__esModule') return true;
        if (!(prop in target)) target[prop] = jest.fn(async () => undefined);
        return target[prop];
      },
    }
  );

jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: { apps: [{ name: '[DEFAULT]' }] },
}));

jest.mock('@react-native-firebase/analytics', () => {
  const instance = anyAsyncModule();
  return { __esModule: true, default: () => instance };
});

jest.mock('react-native-purchases', () => {
  const instance = anyAsyncModule();
  instance.getCustomerInfo = jest.fn(async () => ({ entitlements: { active: {} } }));
  instance.getOfferings = jest.fn(async () => ({ current: null }));
  instance.configure = jest.fn(() => undefined);
  instance.setLogLevel = jest.fn(() => undefined);
  return {
    __esModule: true,
    default: instance,
    PACKAGE_TYPE: { ANNUAL: 'ANNUAL', MONTHLY: 'MONTHLY', WEEKLY: 'WEEKLY', LIFETIME: 'LIFETIME' },
    LOG_LEVEL: { DEBUG: 'DEBUG', ERROR: 'ERROR' },
  };
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  __esModule: true,
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(async () => ({ data: null })),
    signOut: jest.fn(async () => undefined),
  },
  statusCodes: {},
}));

jest.mock('expo-av', () => ({
  __esModule: true,
  Audio: {
    Recording: jest.fn(),
    Sound: jest.fn(),
    requestPermissionsAsync: jest.fn(async () => ({ granted: false })),
    setAudioModeAsync: jest.fn(async () => undefined),
  },
}));

// Nitro-based HealthKit has no JS fallback; the app lazy-requires it inside
// try/catch, so a throwing mock exercises the guarded "unavailable" path.
jest.mock('@kingstinct/react-native-healthkit', () => {
  throw new Error('HealthKit native module unavailable in test');
});
