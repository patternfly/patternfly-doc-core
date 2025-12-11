/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/cli'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
    '^.+\\.m?jsx?$': 'babel-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/helpers/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.ts',
    '^astro:content$': '<rootDir>/src/__mocks__/astro-content.ts',
    '(.+)\\.js': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test.setup.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(change-case|@?nanostores|react-docgen|strip-indent|@patternfly/react-icons)/)',
  ],
}

export default config
