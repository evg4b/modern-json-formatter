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
    'parser/**/*.js',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/jest.setup.ts',
    '!src/**/index.tsx',
  ],
  setupFiles: ['<rootDir>/src/jest.setup.ts'],
  verbose: true,
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
