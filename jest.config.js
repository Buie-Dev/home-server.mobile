module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@env$': '<rootDir>/__tests__/__mocks__/@env.ts',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/__mocks__/',
    '/__tests__/setup\\.ts$',
    '/__tests__/helpers\\.tsx$',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-vector-icons|@react-native-vector-icons|react-native-paper|@react-native-async-storage|react-native-draggable-flatlist|@react-native-community)/)',
  ],
};
