/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.cjs"],
  moduleFileExtensions: ["cjs", "js", "json"],
  collectCoverageFrom: ["src/utils/**/*.cjs"],
  coverageDirectory: "coverage",
  verbose: true,
  testTimeout: 15000,
};
