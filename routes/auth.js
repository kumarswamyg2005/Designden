const express = require("express");
const router = express.Router();
const User = require("../models/user");
// Note: Admin/Designer scoped logins live at /admin/login and /designer/login

// Render signup page
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

// Handle signup form submission
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, contactNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        title: "Sign Up",
        error: "Email already in use",
        formData: req.body,
      });
    }

    // Create new user - ONLY customers can signup
    // Admins, designers, and managers can only login (created by system)
    const user = new User({
      username,
      email,
      password, // Note: In a real app, you would hash this password
      contactNumber,
      role: "customer", // Always customer for signup
      approved: true, // Customers are auto-approved
    });

    // Try saving normally; if there's an enum validation error for role
    // (possible if an older schema is loaded), fall back to saving without
    // validation so manager signups are not blocked. Log a warning when we
    // bypass validation so it can be investigated.
    try {
      await user.save();
    } catch (saveErr) {
      console.error("Signup save error:", saveErr);
      // If the error mentions enum/role, attempt a fallback save without validation
      const isEnumError =
        saveErr &&
        saveErr.errors &&
        saveErr.errors.role &&
        saveErr.errors.role.kind === "enum";
      if (isEnumError) {
        console.warn(
          "Enum validation failed for role during signup; attempting fallback save without validation."
        );
        try {
          await user.save({ validateBeforeSave: false });
        } catch (fallbackErr) {
          console.error("Fallback save also failed for signup:", fallbackErr);
          throw fallbackErr;
        }
      } else {
        throw saveErr;
      }
    }

    // Set session for the newly created user
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Save session explicitly to ensure cookie is set before redirect
    req.session.save((err) => {
      if (err) {
        console.error("Session save error after signup:", err);
        // Fallback: still attempt to redirect
      }

      // Signup is only for customers, always redirect to customer dashboard
      return res.redirect("/customer/dashboard");
    });
  } catch (error) {
    console.error(error);
    res.render("signup", {
      title: "Sign Up",
      error: "An error occurred during signup",
      formData: req.body,
    });
  }
});

// Render login page
router.get("/login", (req, res) => {
  // If already logged in, redirect to role dashboard to avoid stale POST/resubmit issues
  if (req.session.user) {
    if (req.session.user.role === "customer")
      return res.redirect("/customer/dashboard");
    if (req.session.user.role === "designer")
      return res.redirect("/designer/dashboard");
    if (req.session.user.role === "admin")
      return res.redirect("/admin/dashboard");
    return res.redirect("/");
  }
  res.render("login", { title: "Login" });
});

// Handle login form submission
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);

    // Find user by email or username (more flexible)
    const user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });

    console.log("User found:", user ? "Yes" : "No");
    if (user) {
      console.log("User details:", {
        username: user.username,
        email: user.email,
        role: user.role,
      });
    }

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      console.log("Login failed: Invalid credentials");
      return res.render("login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    // Set user in session with proper session saving (base customer)
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    console.log("Session before save:", req.session);

    // Explicitly save the session
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
      } else {
        console.log(
          "Session saved successfully for user:",
          req.session.user.username
        );
      }
    });

    console.log("User logged in:", req.session.user);

    // Redirect based on role
    if (user.role === "customer") {
      return res.redirect("/customer/dashboard");
    } else if (user.role === "designer") {
      return res.redirect("/designer/dashboard");
    } else if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    } else if (user.role === "manager") {
      // If manager is not yet approved, send them to pending page
      if (!user.approved) return res.redirect("/manager/pending");
      return res.redirect("/manager");
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", {
      title: "Login",
      error: "An error occurred during login: " + error.message,
    });
  }
});

// Home route
router.get("/", (req, res) => {
  console.log(
    "Home page accessed, user:",
    req.session.user
      ? `${req.session.user.username} (${req.session.user.role})`
      : "Not logged in"
  );
  res.render("home", { user: req.session.user });
});

// Design Studio route (accessible without login)
router.get("/design-studio", (req, res) => {
  res.render("customer/design-studio", {
    title: "Design Studio",
    user: req.session.user,
  });
});

// Multi-login guide route
router.get("/multi-login", (req, res) => {
  res.render("multi-login-guide", {
    title: "Multi-Login Guide",
    user: req.session.user,
  });
});

// Logout route
router.get("/logout", (req, res) => {
  console.log(
    "Logout requested for user:",
    req.session.user ? req.session.user.username : "No user"
  );
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    res.clearCookie("designden.sid");
    res.redirect("/login");
  });
});

module.exports = router;
