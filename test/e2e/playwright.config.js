const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: ".",
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  retries: 1,
  reporter: [["list"]],
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 5000,
    launchOptions: {
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-software-rasterizer",
      ],
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
