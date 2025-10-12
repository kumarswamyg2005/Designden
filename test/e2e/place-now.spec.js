const { test, expect } = require("@playwright/test");

test("Place Now end-to-end", async ({ page }) => {
  // Login
  await page.goto("http://localhost:3000/login");
  await page.fill("#email", "test+autotest@example.com");
  await page.fill("#password", "test1234");
  await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation({ waitUntil: "networkidle" }),
  ]);

  // Visit shop
  await page.goto("http://localhost:3000/shop");

  // Click first product's View Details
  await page.click(".product-card a.btn-primary");
  await page.waitForLoadState("networkidle");

  // If customize available, click Customize
  const customizeLink = await page.$('a[href*="/shop/customize/"]');
  if (customizeLink) {
    await Promise.all([
      customizeLink.click(),
      page.waitForNavigation({ waitUntil: "networkidle" }),
    ]);

    // Fill customize form
    await page.fill("#name", "E2E Playwright Design");
    await page.selectOption("#fabric", { index: 1 });
    await page.selectOption("#size", { index: 1 });
    // select first color radio
    const colorRadio = await page.$('input[name="color"]');
    if (colorRadio) await colorRadio.check();
    // select first pattern radio (required)
    const patternRadio = await page.$('input[name="pattern"]');
    if (patternRadio) await patternRadio.check();

    // Submit via Place Order Now and wait for navigation if it occurs
    await Promise.all([
      page.click('button:has-text("Place Order Now")'),
      page
        .waitForNavigation({ waitUntil: "networkidle", timeout: 5000 })
        .catch(() => {}),
    ]);

    // Wait a short moment
    await page.waitForTimeout(500);

    // Connect to DB and assert order exists for test user
    const connectDB = require("../../config/db");
    const User = require("../../models/user");
    const Order = require("../../models/order");
    const Design = require("../../models/design");

    await connectDB();
    const testUser = await User.findOne({ email: "test+autotest@example.com" });
    if (!testUser) throw new Error("Test user not found in DB");

    const recentOrder = await Order.findOne({ customerId: testUser._id }).sort({
      createdAt: -1,
    });
    expect(recentOrder).not.toBeNull();

    if (recentOrder && recentOrder.designId) {
      const linkedDesign = await Design.findById(recentOrder.designId);
      // Ensure a design was linked and it belongs to the test user
      expect(linkedDesign).not.toBeNull();
      expect(String(linkedDesign.customerId)).toBe(String(testUser._id));
    }
  } else {
    test.skip();
  }
});
