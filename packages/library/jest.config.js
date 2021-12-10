module.exports = {
  roots: ['<rootDir>/src'],
  testEnvironment: '<rootDir>/jest.environment.js',
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx|js)$': 'ts-jest',
  },
}
