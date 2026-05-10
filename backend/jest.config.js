const common = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1'
  },

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },

  globalSetup: './tests/jest/globalSetup.ts',
  globalTeardown: './tests/jest/globalTeardown.ts',

  clearMocks: true,
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
  setupFiles: ['./tests/jest/setupEnvVars.ts'],
  transformIgnorePatterns: ['/node_modules/', 'dist/']
};

const unit = {
  ...common,
  displayName: 'unit',
  testMatch: ['**/*.spec.[jt]s']
};

const integration = {
  ...common,
  displayName: 'integration',
  testMatch: ['**/*.e2e-spec.[jt]s']
};

module.exports = {
  maxWorkers: 4,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'lcov'],
  testTimeout: 20000,
  forceExit: true,
  detectOpenHandles: true,
  testEnvironment: 'node',
  projects: [integration, unit]
};
