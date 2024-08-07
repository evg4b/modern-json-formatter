/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  cache: true,
  testEnvironment: 'jsdom',
  collectCoverage: true,
  showSeed: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.yarn/',
  ],
  coverageProvider: 'v8',
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/jest.setup.ts',
    'tokenizer/**/*.js',
    'tokenizer/**/*.ts',
    '!tokenizer/**/*.test.ts',
    '!tokenizer/**/*.spec.ts',
    '!tokenizer/tests/**/*',
  ],
  moduleDirectories: ['node_modules', 'src'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  verbose: true,
  moduleNameMapper: {
    '^@packages/jq/(.*)$': '<rootDir>packages/jq/$1',
    '^@packages/tokenizer/(.*)$': '<rootDir>packages/tokenizer/$1',
  },
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json'
      },
    ],
    '^.+\\.scss$': 'jest-transform-stub',
  },
}
