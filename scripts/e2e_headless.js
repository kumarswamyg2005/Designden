(async () => {
  const puppeteer = require("puppeteer");
  const connectDB = require("../config/db");
  const Order = require("../models/order");

  await connectDB();

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    // Visit login page
    await page.goto("http://localhost:3000/login", {
      waitUntil: "networkidle2",
    });
    await page.type("#email", "test+autotest@example.com");
    await page.type("#password", "test1234");
    await Promise.all([
      page.click("button[type=submit]"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    // Go to design studio
    await page.goto("http://localhost:3000/customer/design-studio", {
      waitUntil: "networkidle2",
    });

    // Fill out form
    await page.type("#name", "E2E Headless Design");
    await page.select("#category", "T-Shirt");
    await page.select("#gender", "Men");
    await page.select("#fabric", "Cotton");
    await page.select("#size", "M");
    await page.select("#pattern", "Solid");
    await page.click("#colorWhite"); // may not exist; fallback

    // Press Reset to ensure no error
    const resetBtn = await page.$("#resetModel");
    if (resetBtn) await resetBtn.click();

    // Submit the form (should be POST to /customer/save-design)
    await Promise.all([
      page.click("button[type=submit]"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    // After saving, it should redirect to place-order page - fetch latest order
    const order = await Order.findOne().sort({ createdAt: -1 }).lean();
    console.log("Latest order:", order ? order._id : "none");
  } catch (e) {
    console.error("E2E headless error:", e);
    process.exitCode = 1;
  } finally {
    await browser.close();
    process.exit();
  }
})();
