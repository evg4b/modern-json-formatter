/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  cache: true,
  testEnvironment: 'jsdom',
  showSeed: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/.yarn/'],
  coverageProvider: 'v8',
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/jest.setup.ts',
  ],
  moduleDirectories: ['node_modules', 'src'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  verbose: true,
  moduleNameMapper: {
    '^@worker-core$': '<rootDir>worker-core',
    '^@core/(.*)$': '<rootDir>src/core/$1',
    '^@testing/(.*)$': '<rootDir>testing/$1',
    '^@testing$': '<rootDir>testing',
  },
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json',
      },
    ],
    '^.+\\.scss$': 'jest-transform-stub',
    '^.+\\.svg': 'jest-transform-stub',
  },
};
