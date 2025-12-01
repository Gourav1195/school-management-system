// jest.config.js
// const nextJest = require('next/jest');
import nextJest from 'next/jest';
const createJestConfig = nextJest({
  dir: './', // Path to your Next.js app
});

const customJestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle absolute imports (like @/components/Button)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
};

module.exports = createJestConfig(customJestConfig);
