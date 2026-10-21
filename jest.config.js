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
};
