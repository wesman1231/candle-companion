import type { Config } from 'jest';

const config: Config = {
  // Use the ts-jest preset designed specifically for ES Modules
  preset: 'ts-jest/presets/default-esm',
  
  testEnvironment: 'node',
  clearMocks: true,
  coverageProvider: "v8",

  // Tell ts-jest to use ESM config
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  // Maps your runtime '.js' extensions back to the '.ts' source files during tests
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;