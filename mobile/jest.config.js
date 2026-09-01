module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    // ESM-only file jest cannot parse; provides optional build-time defaults
    '^\\./postinstall\\.mjs$': '<rootDir>/__mocks__/firebasePostinstall.js',
    // Nested under expo's node_modules; Metro resolves it, plain node doesn't
    '^@expo/vector-icons(/.*)?$': '<rootDir>/node_modules/expo/node_modules/@expo/vector-icons$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-purchases|@react-native-google-signin/.*|@kingstinct/.*|react-native-nitro-modules|react-native-chart-kit|firebase|@firebase/.*))',
  ],
};
