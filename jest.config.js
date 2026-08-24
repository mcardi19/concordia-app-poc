module.exports = {
  preset: 'jest-expo',
  /* Gesture handler's own setup stubs its native module, for sheets/drawers. */
  setupFiles: ['react-native-gesture-handler/jestSetup', './jest.setup.js'],
  /*
    Resolves `react-native-worklets` to its JS implementation instead of the
    `.native` one, whose native module does not exist under Jest. Without it
    every component that reaches Reanimated throws on import.
  */
  resolver: 'react-native-worklets/jest/resolver',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)', '**/*.test.(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
};
