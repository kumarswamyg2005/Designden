const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");
const Order = require("../models/order");

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

// Render feedback form
router.get("/submit/:orderId", isLoggedIn, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: "items.customizationId",
        populate: [
          { path: "productId" },
          { path: "designId" },
          { path: "fabricId" },
        ],
      })
      .populate("customerId", "username email");

    if (
      !order ||
      order.customerId._id.toString() !== req.session.user.id ||
      (order.status !== "completed" && order.status !== "delivered")
    ) {
      req.flash(
        "error_msg",
        "❌ Invalid order or order not eligible for feedback"
      );
      return res.redirect("/customer/dashboard");
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ orderId: order._id });
    if (existingFeedback) {
      req.flash(
        "info_msg",
        "ℹ️ You have already submitted feedback for this order"
      );
      return res.redirect("/customer/dashboard");
    }

    res.render("feedback", {
      title: "Submit Feedback",
      user: req.session.user,
      order,
    });
  } catch (error) {
    console.error("Feedback form error:", error);
    req.flash("error_msg", "❌ Error loading feedback form");
    res.redirect("/customer/dashboard");
  }
});

// Submit feedback
router.post("/submit", isLoggedIn, async (req, res) => {
  try {
    const { orderId, rating, comments } = req.body;

    // Server-side validation
    if (!rating || !["1", "2", "3", "4", "5"].includes(rating.toString())) {
      req.flash("error_msg", "Please select a valid rating (1-5 stars)");
      return res.redirect(`/feedback/submit/${orderId}`);
    }

    if (
      !comments ||
      comments.trim().length < 10 ||
      comments.trim().length > 1000
    ) {
      req.flash("error_msg", "Comments must be between 10 and 1000 characters");
      return res.redirect(`/feedback/submit/${orderId}`);
    }

    const order = await Order.findById(orderId);

    if (
      !order ||
      order.customerId.toString() !== req.session.user.id ||
      (order.status !== "completed" && order.status !== "delivered")
    ) {
      req.flash(
        "error_msg",
        "Invalid order or order not eligible for feedback"
      );
      return res.redirect("/customer/dashboard");
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ orderId });
    if (existingFeedback) {
      req.flash(
        "info_msg",
        "You have already submitted feedback for this order"
      );
      return res.redirect("/customer/dashboard");
    }

    // Create new feedback
    const feedback = new Feedback({
      orderId,
      customerId: req.session.user.id,
      rating: parseInt(rating),
      comments: comments.trim(),
    });

    await feedback.save();

    req.flash(
      "success_msg",
      "✅ Thank you for your feedback! Your review has been submitted successfully."
    );
    res.redirect("/customer/dashboard");
  } catch (error) {
    console.error("Submit feedback error:", error);
    req.flash("error_msg", "❌ Failed to submit feedback. Please try again.");
    res.redirect("/customer/dashboard");
  }
});

// View all feedback (admin only)
router.get("/all", isLoggedIn, async (req, res) => {
  try {
    if (req.session.user.role !== "admin") {
      return res.redirect("/");
    }

    const feedbacks = await Feedback.find()
      .populate({
        path: "orderId",
        populate: [
          { path: "customerId", select: "username email" },
          { path: "designerId", select: "username email" },
          {
            path: "items.customizationId",
            populate: [
              { path: "productId" },
              { path: "designId" },
              { path: "fabricId" },
            ],
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.render("admin/feedbacks", {
      title: "All Feedbacks",
      user: req.session.user,
      feedbacks,
    });
  } catch (error) {
    console.error("View all feedbacks error:", error);
    res.redirect("/admin/dashboard");
  }
});

module.exports = router;
