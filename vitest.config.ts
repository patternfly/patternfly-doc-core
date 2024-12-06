// / <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    // Vitest configuration options
  },
  resolve: { 
    alias: {
        '\\.(css|less)$': '<rootDir>/node_modules/@patternfly/react-styles/__mocks__/styleMock.js'
      },
    },   
},);