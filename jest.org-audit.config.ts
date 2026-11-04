import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/container'],
  testMatch: ['<rootDir>/tests/container/**/*.test.ts'],
}

export default config
