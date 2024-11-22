import type {Config} from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        ".ts": ["ts-jest", { tsconfig: "./tsconfig.jest.json" }]
      },
    roots: ['<rootDir>/src'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

export default config;