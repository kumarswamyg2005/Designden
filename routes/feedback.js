const express = require("express")
const router = express.Router()
const Feedback = require("../models/feedback")
const Order = require("../models/order")

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login")
  }
  next()
}

// Render feedback form
router.get("/submit/:orderId", isLoggedIn, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("designId")

    if (!order || order.customerId.toString() !== req.session.user.id || order.status !== "Completed") {
      return res.redirect("/customer/dashboard")
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ orderId: order._id })
    if (existingFeedback) {
      return res.redirect("/customer/dashboard")
    }

    res.render("feedback", {
      title: "Submit Feedback",
      user: req.session.user,
      order,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/customer/dashboard")
  }
})

// Submit feedback
router.post("/submit", isLoggedIn, async (req, res) => {
  try {
    const { orderId, rating, comments } = req.body

    const order = await Order.findById(orderId)

    if (!order || order.customerId.toString() !== req.session.user.id || order.status !== "Completed") {
      return res.redirect("/customer/dashboard")
    }

    // Create new feedback
    const feedback = new Feedback({
      orderId,
      customerId: req.session.user.id,
      rating,
      comments,
    })

    await feedback.save()

    res.redirect("/customer/dashboard")
  } catch (error) {
    console.error(error)
    res.redirect("/customer/dashboard")
  }
})

// View all feedback (admin only)
router.get("/all", isLoggedIn, async (req, res) => {
  try {
    if (req.session.user.role !== "admin") {
      return res.redirect("/")
    }

    const feedbacks = await Feedback.find()
      .populate({
        path: "orderId",
        populate: [
          { path: "customerId", select: "username email" },
          { path: "designerId", select: "username email" },
          { path: "designId" },
        ],
      })
      .sort({ createdAt: -1 })

    res.render("admin/feedbacks", {
      title: "All Feedbacks",
      user: req.session.user,
      feedbacks,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/admin/dashboard")
  }
})

module.exports = router
