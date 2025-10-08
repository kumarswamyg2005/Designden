// app.js
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");

// Import routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customer");
const designerRoutes = require("./routes/designer");
const adminRoutes = require("./routes/admin");
const feedbackRoutes = require("./routes/feedback");
const shopRoutes = require("./routes/shop");

// Import models
const User = require("./models/user");
const CartItem = require("./models/cart");

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/";
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
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
  saveUninitialized: false,
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

// Debugging session middleware
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

// Middleware to set cart count for logged-in customers
app.use(async (req, res, next) => {
  if (req.session.user && req.session.user.role === "customer") {
    try {
      const count = await CartItem.countDocuments({
        userId: req.session.user.id,
      });
      res.locals.cartCount = count;
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

// 404 route
app.use((req, res) => {
  res
    .status(404)
    .render("404", { title: "Page Not Found", user: req.session.user || null });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Seed default users (admin & designer)
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
    await ensureUser(
      "Tailor",
      "tailor@designden.com",
      "tailor123",
      "designer",
      "0000000001"
    );
  } catch (e) {
    console.warn("User seed skipped:", e.message);
  }
};
seedDefaultUsers();
