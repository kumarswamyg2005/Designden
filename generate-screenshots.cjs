/**
 * generate-screenshots.cjs
 * ──────────────────────────────────────────────────────────────
 * Renders the Database Schema and Wireframes HTML templates with
 * Puppeteer (headless Chrome) and saves PNG screenshots to the
 * screenshots/ folder.
 *
 * Usage:  node generate-screenshots.cjs
 * ──────────────────────────────────────────────────────────────
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname);
const TEMPLATES = path.join(ROOT, "screenshots", "templates");
const OUT = path.join(ROOT, "screenshots");

// Make sure the output folder exists
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const targets = [
  {
    name: "01_database_schema",
    file: path.join(TEMPLATES, "schema.html"),
    // Wide viewport so the ER diagram renders fully
    viewport: { width: 1800, height: 900, deviceScaleFactor: 2 },
    // Wait for Mermaid to finish drawing before snapping
    waitFor: ".mermaid svg",
    extraDelay: 2000,
    fullPage: true,
  },
  {
    name: "02_wireframes",
    file: path.join(TEMPLATES, "wireframes.html"),
    viewport: { width: 1500, height: 900, deviceScaleFactor: 2 },
    waitFor: null,
    extraDelay: 500,
    fullPage: true,
  },
  {
    name: "03_team_contributions",
    file: path.join(TEMPLATES, "contributions.html"),
    viewport: { width: 1500, height: 900, deviceScaleFactor: 2 },
    waitFor: null,
    extraDelay: 500,
    fullPage: true,
  },
];

(async () => {
  console.log("\n🚀  Launching Puppeteer …");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const t of targets) {
      const outFile = path.join(OUT, `${t.name}.png`);
      console.log(`\n📸  Rendering  ${t.name} …`);

      const page = await browser.newPage();
      await page.setViewport(t.viewport);

      const url = `file://${t.file}`;
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      // Wait for a specific element (e.g. Mermaid SVG)
      if (t.waitFor) {
        try {
          await page.waitForSelector(t.waitFor, { timeout: 15000 });
        } catch (_) {
          console.warn(
            `    ⚠️  Selector "${t.waitFor}" not found within timeout — continuing anyway.`,
          );
        }
      }

      // Extra delay to let any JS animations/renders settle
      if (t.extraDelay) {
        await new Promise((r) => setTimeout(r, t.extraDelay));
      }

      await page.screenshot({
        path: outFile,
        fullPage: t.fullPage,
        type: "png",
      });

      await page.close();

      const { size } = fs.statSync(outFile);
      console.log(
        `    ✅  Saved  ${path.relative(ROOT, outFile)}  (${(size / 1024).toFixed(1)} KB)`,
      );
    }
  } finally {
    await browser.close();
  }

  console.log("\n✨  Done!  Screenshots saved to  screenshots/\n");
})();
