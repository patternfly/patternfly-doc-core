// / <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    // Vitest configuration options
  },
  resolve: { 
    alias: {
        '\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.ts'
      },
    },   
},);