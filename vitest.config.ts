/// <reference types="vitest" />
import { getViteConfig } from 'astro/config'

const customConfig = {
  resolve: {
    alias: {
      '\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.ts',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFilesAfterEnv: './test.setup.js',
    server: {
      deps: {
        inline: ['@patternfly/react-core', '@patternfly/react-styles'],
      }
    },
  },
}

export default getViteConfig(customConfig)
