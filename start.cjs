/**
 * DesignDen Smart Startup
 * Starts backend first, waits for it to bind a port, then starts Vite.
 * This ensures Vite reads the correct VITE_API_URL from .env.local.
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const portFile = path.join(__dirname, ".port");

// Remove stale .port file from previous run
try {
  fs.unlinkSync(portFile);
} catch (_) {}

console.log("🚀 Starting DesignDen...\n");

// ── 1. Start backend ─────────────────────────────────────────
const server = spawn("node", ["server.cjs"], {
  stdio: "inherit",
  cwd: __dirname,
});

server.on("error", (err) => {
  console.error("❌ Failed to start backend:", err.message);
  process.exit(1);
});

server.on("exit", (code) => {
  if (code !== null && code !== 0) {
    console.error(`❌ Backend exited with code ${code}`);
    process.exit(code);
  }
});

// ── 2. Wait for .port file (max 15 seconds) ──────────────────
let elapsed = 0;
const INTERVAL = 100;
const MAX_WAIT = 15000;

const poll = setInterval(() => {
  elapsed += INTERVAL;

  if (fs.existsSync(portFile)) {
    clearInterval(poll);
    const port = fs.readFileSync(portFile, "utf8").trim();
    console.log(`\n🎨 Backend ready on port ${port} — starting frontend...\n`);

    // ── 3. Start Vite ───────────────────────────────────────
    const vite = spawn("npx", ["vite"], {
      stdio: "inherit",
      cwd: __dirname,
      shell: true,
    });

    vite.on("error", (err) => {
      console.error("❌ Failed to start Vite:", err.message);
      server.kill();
      process.exit(1);
    });

    // Forward Ctrl+C to both processes
    process.on("SIGINT", () => {
      vite.kill("SIGINT");
      server.kill("SIGINT");
      process.exit(0);
    });
  } else if (elapsed >= MAX_WAIT) {
    clearInterval(poll);
    console.error("❌ Backend did not start within 15 seconds. Aborting.");
    server.kill();
    process.exit(1);
  }
}, INTERVAL);
