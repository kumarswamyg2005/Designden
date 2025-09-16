// app.js
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");

// Import routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customer");
const designerRoutes = require("./routes/designer");
const adminRoutes = require("./routes/admin");
const feedbackRoutes = require("./routes/feedback");
const shopRoutes = require("./routes/shop");

// Import models
const User = require("./models/user");
const Cart = require("./models/cart");
const Product = require("./models/product");

// Connect to MongoDB using shared connector
const connectDB = require("./config/db");
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
const customerSession = session({
  secret: "designden_secret_key_12345",
  resave: false,
  saveUninitialized: true, // Changed to true to allow flash messages without logged-in session
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  name: "designden.sid",
});

const designerSession = session({
  secret: "designden_designer_secret_12345",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  name: "designer.sid",
});

const adminSession = session({
  secret: "designden_admin_secret_12345",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  name: "admin.sid",
});

// Use customer session globally
app.use(customerSession);

// Flash messages middleware
app.use(flash());

// Middleware to make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.info_msg = req.flash("info_msg");
  res.locals.warning_msg = req.flash("warning_msg");
  next();
});

// Conditional request/session debug logging (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log("Session ID:", req.sessionID);
    console.log(
      "Session user:",
      req.session.user
        ? `${req.session.user.username} (${req.session.user.role})`
        : "Not logged in"
    );
    console.log("---");
    next();
  });
}

// Middleware to set cart count for logged-in customers
app.use(async (req, res, next) => {
  if (req.session.user && req.session.user.role === "customer") {
    try {
      // Find the user's cart and count items in the array
      const cart = await Cart.findOne({ userId: req.session.user.id });
      res.locals.cartCount = cart && cart.items ? cart.items.length : 0;
    } catch (err) {
      console.error("Error counting cart items:", err);
      res.locals.cartCount = 0;
    }
  } else {
    res.locals.cartCount = 0;
  }
  next();
});

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Diagnostic route for add-to-cart testing
app.get("/test-cart", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "test-add-to-cart.html"));
});

// Routes
app.use("/", authRoutes);
app.use("/customer", customerRoutes);

// Designer routes with separate session
app.use(
  "/designer",
  (req, res, next) => designerSession(req, res, next),
  (req, res, next) => {
    req.designerSession = req.session;
    next();
  },
  designerRoutes
);

// Admin routes with separate session
app.use(
  "/admin",
  (req, res, next) => adminSession(req, res, next),
  (req, res, next) => {
    req.adminSession = req.session;
    next();
  },
  adminRoutes
);

app.use("/feedback", feedbackRoutes);
app.use("/shop", shopRoutes);
const managerRoutes = require("./routes/manager");
app.use("/manager", managerRoutes);

// Debug endpoint: returns product count and a few sample products
// Debug endpoint: admin-only or protected by DEV_DEBUG_TOKEN
app.get("/_debug/products", async (req, res) => {
  try {
    const devToken = process.env.DEV_DEBUG_TOKEN || null;
    const provided = req.query.token || req.headers["x-dev-debug-token"];

    // Allow access if logged in user is admin
    if (req.session.user && req.session.user.role === "admin") {
      const count = await Product.countDocuments();
      const sample = await Product.find()
        .limit(6)
        .select("name price category gender images");
      return res.json({ count, sample });
    }

    // Allow access if a valid dev token is provided (for local debug)
    if (devToken && provided && provided === devToken) {
      const count = await Product.countDocuments();
      const sample = await Product.find()
        .limit(6)
        .select("name price category gender images");
      return res.json({ count, sample });
    }

    return res.status(403).json({ error: "Forbidden" });
  } catch (err) {
    console.error("Debug route error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Temporary debug echo endpoint to inspect incoming requests and session
app.post("/_debug/echo", express.json(), (req, res) => {
  try {
    const safeHeaders = {};
    // pick a few headers to log
    [
      "host",
      "user-agent",
      "referer",
      "cookie",
      "content-type",
      "x-requested-with",
    ].forEach((h) => {
      if (req.headers[h]) safeHeaders[h] = req.headers[h];
    });

    console.log("[DEBUG ECHO] received", req.method, req.url);
    console.log("[DEBUG ECHO] headers:", safeHeaders);
    console.log("[DEBUG ECHO] body keys:", Object.keys(req.body || {}));
    console.log(
      "[DEBUG ECHO] session.user=",
      req.session && req.session.user
        ? `${req.session.user.username}(${req.session.user.id})`
        : "NO_SESSION"
    );

    res.json({
      ok: true,
      headers: safeHeaders,
      bodyKeys: Object.keys(req.body || {}),
      sessionUser: req.session && req.session.user ? req.session.user : null,
    });
  } catch (err) {
    console.error("[DEBUG ECHO] error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 404 route
app.use((req, res) => {
  res
    .status(404)
    .render("404", { title: "Page Not Found", user: req.session.user || null });
});

// Seed default users (admin & designer) - only in development
const seedDefaultUsers = async () => {
  try {
    const ensureUser = async (
      username,
      email,
      password,
      role,
      contactNumber
    ) => {
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({ username, email, password, role, contactNumber });
        await user.save();
        console.log(`Seeded ${role}: ${email}`);
      }
    };
    await ensureUser(
      "Admin",
      "admin@designden.com",
      "admin123",
      "admin",
      "0000000000"
    );
    // Only one designer account: designer@designden.com
    await ensureUser(
      "Designer",
      "designer@designden.com",
      "designer123",
      "designer",
      "0000000001"
    );
  } catch (e) {
    console.warn("User seed skipped:", e.message);
  }
};

// Only seed in development or when explicitly running the server
if (process.env.NODE_ENV !== "production" || require.main === module) {
  seedDefaultUsers();
}

// Start server only if running directly (not in Vercel serverless)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
