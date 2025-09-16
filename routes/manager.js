const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Notification = require("../models/notification");

const isManager = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "manager") {
    return res.redirect("/login");
  }
  // Also verify the user is approved in DB
  const User = require("../models/user");
  User.findById(req.session.user.id)
    .then((u) => {
      if (!u || (u.role === "manager" && !u.approved)) {
        return res.redirect("/manager/pending");
      }
      next();
    })
    .catch((e) => {
      console.error("Manager check error:", e);
      return res.status(500).render("manager/pending", {
        title: "Manager Pending",
        user: req.session.user,
        error: "Server error while checking approval",
      });
    });
};

// Manager dashboard - comprehensive view with assignment and inventory
router.get("/", isManager, async (req, res) => {
  try {
    const User = require("../models/user");
    const Product = require("../models/product");

    // Fetch all orders with customer info
    const allOrders = await Order.find()
      .populate("customerId", "username email")
      .populate({
        path: "items.customizationId",
        select: "price customText productId fabricId",
      })
      .populate("designerId", "username email")
      .sort({ orderDate: -1 });

    // Calculate order statistics
    // Only show recent pending orders (last 30 days) to avoid showing old/stale orders
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pendingOrders = allOrders.filter(
      (o) => o.status === "pending" && new Date(o.orderDate) >= thirtyDaysAgo
    );
    const inProductionOrders = allOrders.filter(
      (o) => o.status === "in_production"
    );
    const readyForReviewOrders = allOrders.filter(
      (o) => o.status === "ready_for_review"
    );
    const completedOrders = allOrders.filter(
      (o) => o.status === "completed" || o.status === "delivered"
    );
    const shippedOrders = allOrders.filter((o) => o.status === "shipped");
    const cancelledOrders = allOrders.filter((o) => o.status === "cancelled");

    // Fetch designers for assignment
    const designers = await User.find({ role: "designer" }).select(
      "username email"
    );

    // Fetch products for inventory management
    const products = await Product.find().sort({ name: 1 });
    const lowStockProducts = products.filter(
      (p) => p.inStock === false || (p.stockQuantity && p.stockQuantity < 5)
    );

    // Calculate designer performance
    const designerStats = designers.map((designer) => {
      const assignedOrders = allOrders.filter(
        (o) =>
          o.designerId &&
          o.designerId._id.toString() === designer._id.toString()
      );
      const completedByDesigner = assignedOrders.filter(
        (o) => o.status === "completed" || o.status === "delivered"
      );
      return {
        designer,
        totalAssigned: assignedOrders.length,
        completed: completedByDesigner.length,
        inProgress: assignedOrders.filter((o) => o.status === "in_production")
          .length,
      };
    });

    res.render("manager/dashboard", {
      title: "Manager Dashboard",
      user: req.session.user,
      orders: allOrders,
      pendingOrders,
      inProductionOrders,
      readyForReviewOrders,
      completedOrders,
      shippedOrders,
      cancelledOrders,
      designers,
      designerStats,
      products,
      lowStockProducts,
      stats: {
        totalOrders: allOrders.length,
        pendingCount: pendingOrders.length,
        inProductionCount: inProductionOrders.length,
        readyForReviewCount: readyForReviewOrders.length,
        completedCount: completedOrders.length,
        shippedCount: shippedOrders.length,
        cancelledCount: cancelledOrders.length,
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
      },
    });
  } catch (e) {
    console.error("Manager dashboard error:", e);
    res.render("manager/dashboard", {
      title: "Manager Dashboard",
      user: req.session.user,
      orders: [],
      pendingOrders: [],
      inProductionOrders: [],
      readyForReviewOrders: [],
      completedOrders: [],
      shippedOrders: [],
      cancelledOrders: [],
      designers: [],
      designerStats: [],
      products: [],
      lowStockProducts: [],
      stats: {},
      error: e.message,
    });
  }
});

// Assign order to designer (only designer@designden.com)
router.post("/orders/:orderId/assign", isManager, async (req, res) => {
  try {
    const { designerId } = req.body;
    const User = require("../models/user");

    // Verify designer exists and is the only authorized designer
    const designer = await User.findOne({
      _id: designerId,
      role: "designer",
      email: "designer@designden.com",
    });

    if (!designer) {
      return res.status(403).json({
        error: "Invalid designer. Only designer@designden.com can be assigned.",
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.designerId = designerId;
    if (order.status === "pending") {
      order.status = "assigned";
    }
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: "assigned",
      note: `Order assigned to ${designer.username}`,
      at: new Date(),
    });
    await order.save();

    // Notify designer
    await Notification.create({
      userId: designerId,
      title: "New Order Assigned",
      message: `You have been assigned order ${order._id}`,
      meta: { orderId: order._id },
    });

    // Notify customer
    await Notification.create({
      userId: order.customerId,
      title: "Order Assigned to Designer",
      message: `Your order has been assigned to our designer and will be processed soon.`,
      meta: { orderId: order._id },
    });

    // Notify customer
    await Notification.create({
      userId: order.customerId,
      title: "Order In Production",
      message: `Your order ${order._id} has been assigned to a designer and is now in production.`,
      meta: { orderId: order._id },
    });

    req.flash(
      "success_msg",
      `✅ Designer assigned successfully! Order moved to production.`
    );
    res.json({ ok: true, order, redirect: "/manager" });
  } catch (e) {
    console.error("Assign order error:", e);
    req.flash("error_msg", `❌ Failed to assign designer: ${e.message}`);
    res.status(500).json({ error: e.message, redirect: "/manager" });
  }
});

// Approve order (move to In Production)
router.post("/orders/:orderId/approve", isManager, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = "in_production";
    await order.save();

    await Notification.create({
      userId: order.customerId,
      title: "Order Approved",
      message: `Your order ${order._id} is approved and moved to production.`,
      meta: { orderId: order._id },
    });

    res.json({ ok: true, order });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Reject order (move to Cancelled)
router.post("/orders/:orderId/reject", isManager, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      req.flash("error_msg", "❌ Order not found");
      return res
        .status(404)
        .json({ error: "Order not found", redirect: "/manager" });
    }

    order.status = "cancelled";
    await order.save();

    await Notification.create({
      userId: order.customerId,
      title: "Order Cancelled",
      message: `Your order ${order._id} was cancelled by manager.`,
      meta: { orderId: order._id },
    });

    req.flash(
      "success_msg",
      "✅ Order rejected successfully. Customer has been notified."
    );
    res.json({ ok: true, order, redirect: "/manager" });
  } catch (e) {
    console.error(e);
    req.flash("error_msg", `❌ Failed to reject order: ${e.message}`);
    res.status(500).json({ error: e.message, redirect: "/manager" });
  }
});

// Update product stock status
router.post(
  "/products/:productId/toggle-stock",
  isManager,
  async (req, res) => {
    try {
      const Product = require("../models/product");
      const product = await Product.findById(req.params.productId);

      if (!product) {
        req.flash("error_msg", "❌ Product not found");
        return res
          .status(404)
          .json({ error: "Product not found", redirect: "/manager" });
      }

      product.inStock = !product.inStock;
      await product.save();

      req.flash(
        "success_msg",
        `✅ Stock status updated! Product is now ${
          product.inStock ? "in stock" : "out of stock"
        }.`
      );
      res.json({ ok: true, product, redirect: "/manager" });
    } catch (e) {
      console.error("Toggle stock error:", e);
      req.flash("error_msg", `❌ Failed to update stock status: ${e.message}`);
      res.status(500).json({ error: e.message, redirect: "/manager" });
    }
  }
);

// Update product stock quantity
router.post(
  "/products/:productId/update-quantity",
  isManager,
  async (req, res) => {
    try {
      const Product = require("../models/product");
      const { quantity } = req.body;

      const product = await Product.findById(req.params.productId);

      if (!product) {
        req.flash("error_msg", "❌ Product not found");
        return res
          .status(404)
          .json({ error: "Product not found", redirect: "/manager" });
      }

      product.stockQuantity = parseInt(quantity) || 0;
      if (product.stockQuantity > 0) {
        product.inStock = true;
      }
      await product.save();

      req.flash(
        "success_msg",
        `✅ Product quantity updated to ${product.stockQuantity}!`
      );
      res.json({ ok: true, product, redirect: "/manager" });
    } catch (e) {
      console.error("Update quantity error:", e);
      req.flash("error_msg", `❌ Failed to update quantity: ${e.message}`);
      res.status(500).json({ error: e.message, redirect: "/manager" });
    }
  }
);

// ============ MANUAL ORDER STATUS MANAGEMENT (Amazon-style workflow) ============

// Mark order as COMPLETED (Packing done)
router.post("/orders/:orderId/mark-completed", isManager, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "customerId",
      "username email"
    );

    if (!order) {
      req.flash("error_msg", "❌ Order not found");
      return res
        .status(404)
        .json({ error: "Order not found", redirect: "/manager" });
    }

    // Only allow progression from in_production OR ready_for_review
    if (
      order.status !== "in_production" &&
      order.status !== "ready_for_review"
    ) {
      req.flash(
        "error_msg",
        `❌ Cannot mark as completed. Order status is: ${order.status}`
      );
      return res.status(400).json({
        error: `Order must be in production or ready for review to mark as completed. Current status: ${order.status}`,
        redirect: "/manager",
      });
    }

    order.status = "completed";
    order.productionCompletedAt = new Date();
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: "completed",
      note: "Order packing completed by manager",
      at: new Date(),
    });
    await order.save();

    // Notify customer
    await Notification.create({
      userId: order.customerId._id,
      title: "📦 Order Packing Complete!",
      message: `Your order #${order._id
        .toString()
        .slice(-6)} has been packed and is ready for shipping.`,
      meta: { orderId: order._id },
    });

    console.log(
      `[MANUAL-WORKFLOW] ✅ Order ${order._id} → COMPLETED (packed by manager)`
    );

    req.flash("success_msg", "✅ Order marked as COMPLETED (Packing done)!");
    res.json({ ok: true, order, redirect: "/manager" });
  } catch (e) {
    console.error("Mark completed error:", e);
    req.flash("error_msg", `❌ Failed to mark as completed: ${e.message}`);
    res.status(500).json({ error: e.message, redirect: "/manager" });
  }
});

// Mark order as SHIPPED (Out for delivery)
router.post("/orders/:orderId/mark-shipped", isManager, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "customerId",
      "username email"
    );

    if (!order) {
      req.flash("error_msg", "❌ Order not found");
      return res
        .status(404)
        .json({ error: "Order not found", redirect: "/manager" });
    }

    // Only allow progression from completed
    if (order.status !== "completed") {
      req.flash(
        "error_msg",
        `❌ Cannot ship. Order must be packed first. Current status: ${order.status}`
      );
      return res.status(400).json({
        error: `Order must be completed (packed) before shipping. Current status: ${order.status}`,
        redirect: "/manager",
      });
    }

    order.status = "shipped";
    order.shippedAt = new Date();
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: "shipped",
      note: "Order shipped - Out for delivery",
      at: new Date(),
    });
    await order.save();

    // Notify customer
    await Notification.create({
      userId: order.customerId._id,
      title: "🚚 Order Shipped!",
      message: `Your order #${order._id
        .toString()
        .slice(-6)} is out for delivery and on its way to you!`,
      meta: { orderId: order._id },
    });

    console.log(
      `[MANUAL-WORKFLOW] ✅ Order ${order._id} → SHIPPED (out for delivery)`
    );

    req.flash("success_msg", "✅ Order marked as SHIPPED (Out for delivery)!");
    res.json({ ok: true, order, redirect: "/manager" });
  } catch (e) {
    console.error("Mark shipped error:", e);
    req.flash("error_msg", `❌ Failed to mark as shipped: ${e.message}`);
    res.status(500).json({ error: e.message, redirect: "/manager" });
  }
});

// Mark order as DELIVERED (Final step)
router.post("/orders/:orderId/mark-delivered", isManager, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "customerId",
      "username email"
    );

    if (!order) {
      req.flash("error_msg", "❌ Order not found");
      return res
        .status(404)
        .json({ error: "Order not found", redirect: "/manager" });
    }

    // Only allow progression from shipped
    if (order.status !== "shipped") {
      req.flash(
        "error_msg",
        `❌ Cannot deliver. Order must be shipped first. Current status: ${order.status}`
      );
      return res.status(400).json({
        error: `Order must be shipped before delivery. Current status: ${order.status}`,
        redirect: "/manager",
      });
    }

    order.status = "delivered";
    order.deliveredAt = new Date();
    order.paymentStatus = "paid"; // Mark as paid when delivered (COD)
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: "delivered",
      note: "Order delivered successfully - Payment confirmed (COD)",
      at: new Date(),
    });
    await order.save();

    // Notify customer
    await Notification.create({
      userId: order.customerId._id,
      title: "✅ Order Delivered!",
      message: `Your order #${order._id
        .toString()
        .slice(
          -6
        )} has been delivered successfully! Thank you for shopping with us!`,
      meta: { orderId: order._id },
    });

    console.log(
      `[MANUAL-WORKFLOW] ✅ Order ${order._id} → DELIVERED (complete & paid)`
    );

    req.flash(
      "success_msg",
      "✅ Order marked as DELIVERED! Payment confirmed."
    );
    res.json({ ok: true, order, redirect: "/manager" });
  } catch (e) {
    console.error("Mark delivered error:", e);
    req.flash("error_msg", `❌ Failed to mark as delivered: ${e.message}`);
    res.status(500).json({ error: e.message, redirect: "/manager" });
  }
});

module.exports = router;
