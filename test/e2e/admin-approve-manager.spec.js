const { test, expect } = require("@playwright/test");
const connectDB = require("../../config/db");
const User = require("../../models/user");

test("Admin approves manager and manager can login", async ({ page }) => {
  const unique = Date.now();
  const email = `e2e.manager.approve+${unique}@example.com`;

  // 1) Sign up manager
  await page.goto("http://localhost:3000/signup");
  await page.fill("#username", `e2e_manager_${unique}`);
  await page.fill("#email", email);
  await page.fill("#password", "test1234");
  await page.fill("#contactNumber", "9999999999");
  await page.selectOption("#role", "manager");

  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation({ waitUntil: "networkidle" }),
  ]);

  // Expect we were redirected to /manager or /manager/pending
  expect(page.url()).toMatch(/\/manager(\/pending)?/);

  // 2) Login as admin in a fresh context to approve
  // 2) Logout the current session so we can login as admin (same browser context)
  await page.goto("http://localhost:3000/logout");
  // Now go to login and sign in as seeded admin
  await page.goto("http://localhost:3000/login");
  await page.fill("#email", "admin@designden.com");
  await page.fill("#password", "admin123");
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation({ waitUntil: "networkidle" }),
  ]);

  // Go to admin pending managers page
  await page.goto("http://localhost:3000/admin/pending-managers");
  // Approve the first matching pending manager by email
  const approveSelector = `form[action^='/admin/approve-manager'] button`;
  await page.waitForSelector(approveSelector, { timeout: 5000 });
  // Find the row with our email and click its approve button
  const rows = await page.$$("table tbody tr");
  for (const row of rows) {
    const text = await row.textContent();
    if (text.includes(email)) {
      const btn = await row.$("form[action^='/admin/approve-manager'] button");
      await Promise.all([
        btn.click(),
        page.waitForNavigation({ waitUntil: "networkidle" }),
      ]);
      break;
    }
  }

  // 3) Log out admin
  await page.goto("http://localhost:3000/logout");

  // 4) Login as the manager we created and verify access to /manager
  await page.goto("http://localhost:3000/login");
  await page.fill("#email", email);
  await page.fill("#password", "test1234");
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation({ waitUntil: "networkidle" }),
  ]);

  // Sometimes login redirects to root; explicitly navigate to /manager and ensure it's accessible
  const resp = await page.goto("http://localhost:3000/manager");
  expect(resp.status()).toBe(200);

  // Validate in DB the user is approved
  await connectDB();
  const found = await User.findOne({ email });
  expect(found).not.toBeNull();
  expect(found.role).toBe("manager");
  expect(found.approved).toBe(true);
});
