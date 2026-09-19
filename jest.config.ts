import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@events/(.*)$': '<rootDir>/src/events/$1',
    '^@notifications/(.*)$': '<rootDir>/src/notifications/$1',
    '^@channels/(.*)$': '<rootDir>/src/channels/$1',
    '^@preferences/(.*)$': '<rootDir>/src/preferences/$1',
    '^@compliance/(.*)$': '<rootDir>/src/compliance/$1',
    '^@templates/(.*)$': '<rootDir>/src/templates/$1',
    '^@analytics/(.*)$': '<rootDir>/src/analytics/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  },
  verbose: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
};

export default config;
