// / <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  resolve: { 
    alias: {
        '\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.ts'
      },
    },   
},);