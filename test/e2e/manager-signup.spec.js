const { test, expect } = require("@playwright/test");
const connectDB = require("../../config/db");
const User = require("../../models/user");

test("Manager signup end-to-end", async ({ page }) => {
  const unique = Date.now();
  const email = `e2e.manager+${unique}@example.com`;

  // Visit signup
  await page.goto("http://localhost:3000/signup");

  await page.fill("#username", `e2e_manager_${unique}`);
  await page.fill("#email", email);
  await page.fill("#password", "test1234");
  await page.fill("#contactNumber", "9999999999");
  await page.selectOption("#role", "manager");

  // Submit and wait for navigation / redirect
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation({ waitUntil: "networkidle" }),
  ]);

  // Ensure we landed on the manager dashboard (or /manager)
  const url = page.url();
  expect(url).toContain("/manager");

  // Confirm the manager exists in DB
  await connectDB();
  const found = await User.findOne({ email });
  expect(found).not.toBeNull();
  expect(found.role).toBe("manager");
});
