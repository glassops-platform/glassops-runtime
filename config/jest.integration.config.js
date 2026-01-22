/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "../src",
  testMatch: ["**/*.integration.test.ts"],
  // Longer timeout for integration tests
  testTimeout: 30000,
  // Don't transform node_modules except for specific packages
  transformIgnorePatterns: ["/node_modules/"],
  // Coverage settings for integration tests
  collectCoverage: true,
  coverageDirectory: "../coverage/integration",
  coverageReporters: ["text", "lcov", "html"],
  // Collect coverage from all source files
  collectCoverageFrom: [
    "**/*.ts",
    "!**/*.test.ts",
    "!**/*.integration.test.ts",
    "!**/node_modules/**",
  ],
  // Setup file for integration test environment
  setupFilesAfterEnv: ["<rootDir>/../config/jest.integration.setup.js"],
};
