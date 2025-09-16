const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Product = require("../models/product");

// Middleware to check if user is logged in and is a designer
const isDesigner = (req, res, next) => {
  // Use designer-scoped session when available (multi-login)
  const sess = req.designerSession || req.session;
  if (!sess.user || sess.user.role !== "designer") {
    return res.redirect("/designer/login");
  }
  req.session = sess;
  next();
};

// Designer-scoped login routes (use designer cookie)
router.get("/login", (req, res) => {
  if (req.session && req.session.user && req.session.user.role === "designer") {
    return res.redirect("/designer/dashboard");
  }
  res.render("login", { title: "Designer Login", action: "/designer/login" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await require("../models/user").findOne({
      $or: [{ email }, { username: email }],
      role: "designer",
    });
    if (!user || user.password !== password) {
      return res.render("login", {
        title: "Designer Login",
        error: "Invalid email or password",
      });
    }
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return res.redirect("/designer/dashboard");
  } catch (e) {
    return res.render("login", {
      title: "Designer Login",
      error: "Login failed",
    });
  }
});

// Direct access login for designer (like admin)
router.get("/direct", async (req, res) => {
  try {
    const user = await require("../models/user").findOne({
      email: "designer@designden.com",
      role: "designer",
    });
    if (!user) return res.redirect("/designer/login");
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return res.redirect("/designer/dashboard");
  } catch (e) {
    return res.redirect("/designer/login");
  }
});

// Designer dashboard - Only show 3D custom design orders
router.get("/dashboard", isDesigner, async (req, res) => {
  try {
    const Customization = require("../models/customization");

    // Get assigned orders (only custom designs, not shop orders)
    const allAssignedOrders = await Order.find({
      designerId: req.session.user.id,
    })
      .populate("customerId", "username email")
      .populate({
        path: "items.customizationId",
        model: "Customization",
        populate: {
          path: "productId",
          model: "Product",
        },
      })
      .sort({ orderDate: -1 });

    // Filter to only show custom design orders (no productId means custom design)
    const customDesignOrders = allAssignedOrders
      .map((order) => {
        const customItems = order.items.filter(
          (item) => item.customizationId && !item.customizationId.productId
        );
        return customItems.length > 0 ? order : null;
      })
      .filter((order) => order !== null);

    // Calculate statistics
    const stats = {
      pending: customDesignOrders.filter(
        (o) => o.status === "pending" || o.status === "assigned"
      ).length,
      inProduction: customDesignOrders.filter(
        (o) => o.status === "in_production"
      ).length,
      shipped: customDesignOrders.filter((o) => o.status === "shipped").length,
      completed: customDesignOrders.filter(
        (o) => o.status === "completed" || o.status === "delivered"
      ).length,
    };

    res.render("designer/dashboard", {
      title: "Designer Workspace",
      user: req.session.user,
      orders: customDesignOrders,
      stats,
    });
  } catch (error) {
    console.error("Designer dashboard error:", error);
    res.render("designer/dashboard", {
      title: "Designer Workspace",
      user: req.session.user,
      orders: [],
      stats: {
        total: 0,
        pending: 0,
        inProduction: 0,
        completed: 0,
        shipped: 0,
      },
      error: "Failed to load orders",
    });
  }
});

// View order details with 3D customization info
router.get("/order/:orderId", isDesigner, async (req, res) => {
  try {
    const Customization = require("../models/customization");
    const Fabric = require("../models/fabric");

    const order = await Order.findById(req.params.orderId)
      .populate("customerId", "username email")
      .populate({
        path: "items.customizationId",
        model: "Customization",
        populate: [
          { path: "fabricId", model: "Fabric" },
          { path: "productId", model: "Product" },
        ],
      });

    if (!order || order.designerId.toString() !== req.session.user.id) {
      return res.redirect("/designer/dashboard");
    }

    // Filter custom design items only
    const customItems = order.items.filter(
      (item) => item.customizationId && !item.customizationId.productId
    );

    if (customItems.length === 0) {
      return res.redirect("/designer/dashboard");
    }

    res.render("designer/order-details", {
      title: "Custom Design Order",
      user: req.session.user,
      order,
      customItems,
    });
  } catch (error) {
    console.error("Order details error:", error);
    res.redirect("/designer/dashboard");
  }
});

// Accept order (designer accepts the work)
router.post("/order/:orderId/accept", isDesigner, async (req, res) => {
  try {
    const Notification = require("../models/notification");
    const order = await Order.findById(req.params.orderId).populate(
      "customerId",
      "username email"
    );

    if (!order || order.designerId.toString() !== req.session.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    order.status = "in_production";
    order.productionStartedAt = new Date();
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: "in_production",
      note: "Designer accepted the order and started working on your custom design",
      at: new Date(),
    });
    await order.save();

    // Notify customer with detailed message
    await Notification.create({
      userId: order.customerId._id,
      title: "🎨 Designer Started Working on Your Order!",
      message: `Great news! Your custom design order (#${order._id
        .toString()
        .slice(
          -6
        )}) is now in production. Our designer is working on creating your unique piece.`,
      meta: { orderId: order._id },
    });

    req.flash(
      "success_msg",
      "✅ Order accepted! You can now start working on the design."
    );
    res.json({
      success: true,
      order,
      message: "Order accepted and customer notified!",
      redirect: `/designer/order/${order._id}`,
    });
  } catch (error) {
    console.error("Accept order error:", error);
    req.flash("error_msg", "❌ Failed to accept order");
    res.status(500).json({
      error: "Failed to accept order",
      redirect: "/designer/dashboard",
    });
  }
});

// Update work progress
router.post("/order/:orderId/update-progress", isDesigner, async (req, res) => {
  try {
    const Notification = require("../models/notification");
    const { progressNote, progressPercentage } = req.body;

    const order = await Order.findById(req.params.orderId).populate(
      "customerId",
      "username email"
    );

    if (!order || order.designerId.toString() !== req.session.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Add progress update to timeline
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: order.status,
      note: `Progress Update: ${progressNote} (${progressPercentage}% complete)`,
      at: new Date(),
    });
    await order.save();

    // Notify customer of progress with detailed message
    const progressEmoji =
      progressPercentage >= 75 ? "🎉" : progressPercentage >= 50 ? "⚡" : "🔨";
    await Notification.create({
      userId: order.customerId._id,
      title: `${progressEmoji} Progress Update: ${progressPercentage}% Complete`,
      message: `Order #${order._id.toString().slice(-6)}: ${progressNote}`,
      meta: { orderId: order._id, progress: progressPercentage },
    });

    // Notify manager of progress update
    const User = require("../models/user");
    const managers = await User.find({ role: "manager" }).select("_id");
    for (const manager of managers) {
      await Notification.create({
        userId: manager._id,
        title: `${progressEmoji} Designer Progress Update`,
        message: `Order #${order._id
          .toString()
          .slice(-6)}: ${progressPercentage}% complete - ${progressNote}`,
        meta: { orderId: order._id, progress: progressPercentage },
      });
    }

    req.flash(
      "success_msg",
      `✅ Progress updated successfully! (${progressPercentage}% complete) - Customer and Manager notified!`
    );
    res.json({
      success: true,
      order,
      message: `Progress updated to ${progressPercentage}% and customer notified!`,
      redirect: `/designer/order/${order._id}`,
    });
  } catch (error) {
    console.error("Update progress error:", error);
    req.flash("error_msg", "❌ Failed to update progress");
    res.status(500).json({
      error: "Failed to update progress",
      redirect: "/designer/dashboard",
    });
  }
});

// ============ SUBMIT TO MANAGER (Designer→Manager Handoff) ============
router.post(
  "/order/:orderId/submit-to-manager",
  isDesigner,
  async (req, res) => {
    try {
      const Notification = require("../models/notification");
      const User = require("../models/user");
      const { completionNote } = req.body;

      const order = await Order.findById(req.params.orderId).populate(
        "customerId",
        "username email"
      );

      if (!order || order.designerId.toString() !== req.session.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Only allow submission from in_production status
      if (order.status !== "in_production") {
        req.flash(
          "error_msg",
          `❌ Cannot submit. Order status is: ${order.status}`
        );
        return res.status(400).json({
          error: `Order must be in production to submit. Current status: ${order.status}`,
          redirect: "/designer/dashboard",
        });
      }

      // Change status to ready_for_review
      order.status = "ready_for_review";
      order.timeline = order.timeline || [];
      order.timeline.push({
        status: "ready_for_review",
        note: `Designer completed work: ${
          completionNote || "Work finished, ready for manager review"
        }`,
        at: new Date(),
      });
      await order.save();

      // Notify all managers of submission
      const managers = await User.find({ role: "manager" }).select(
        "_id username"
      );
      for (const manager of managers) {
        await Notification.create({
          userId: manager._id,
          title: "📦 Designer Submitted Order for Review",
          message: `Order #${order._id
            .toString()
            .slice(
              -6
            )} has been completed by designer and is ready for your review and packing. Note: ${
            completionNote || "Ready for review"
          }`,
          meta: { orderId: order._id },
        });
      }

      // Notify customer of progress
      await Notification.create({
        userId: order.customerId._id,
        title: "🎉 Design Work Completed!",
        message: `Great news! Order #${order._id
          .toString()
          .slice(
            -6
          )} design work is complete and has been submitted to our manager for quality review and packing.`,
        meta: { orderId: order._id },
      });

      console.log(
        `[DESIGNER-HANDOFF] ✅ Order ${order._id} → READY_FOR_REVIEW (submitted by designer)`
      );

      req.flash(
        "success_msg",
        "✅ Work submitted to manager successfully! Manager will review and pack the order."
      );
      res.json({
        success: true,
        order,
        message: "Order submitted to manager for review!",
        redirect: `/designer/order/${order._id}`,
      });
    } catch (error) {
      console.error("Submit to manager error:", error);
      req.flash("error_msg", `❌ Failed to submit: ${error.message}`);
      res.status(500).json({
        error: "Failed to submit to manager",
        redirect: "/designer/dashboard",
      });
    }
  }
);

// Mark order ready for production/shipping
router.post("/order/:orderId/mark-ready", isDesigner, async (req, res) => {
  try {
    const Notification = require("../models/notification");
    const { completionNote } = req.body;

    const order = await Order.findById(req.params.orderId).populate(
      "customerId",
      "username email"
    );

    if (!order || order.designerId.toString() !== req.session.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    order.status = "completed";
    order.productionCompletedAt = new Date();
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: "completed",
      note: `Design work completed: ${completionNote}`,
      at: new Date(),
    });
    await order.save();

    // Notify customer with celebration message
    await Notification.create({
      userId: order.customerId._id,
      title: "🎊 Your Custom Design is Complete!",
      message: `Exciting news! Order #${order._id
        .toString()
        .slice(
          -6
        )} is finished. ${completionNote} Your item is now ready and will be prepared for shipping.`,
      meta: { orderId: order._id },
    });

    req.flash("success_msg", "✅ Order marked as ready and will be shipped!");
    res.json({
      success: true,
      order,
      message: "Order marked as completed and customer notified!",
      redirect: `/designer/order/${order._id}`,
    });
  } catch (error) {
    console.error("Mark ready error:", error);
    req.flash("error_msg", "❌ Failed to mark order ready");
    res.status(500).json({
      error: "Failed to mark order ready",
      redirect: "/designer/dashboard",
    });
  }
});

// Stock management routes for tailor
router.get("/products", isDesigner, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.render("designer/products", {
      title: "Product Management - Tailor",
      user: req.session.user,
      products,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/designer/dashboard");
  }
});

// Designer toggle product stock (optional for tailor)
router.post(
  "/product/:productId/toggle-stock",
  isDesigner,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) return res.redirect("/designer/products");
      product.inStock = !product.inStock;
      await product.save();
      res.redirect("/designer/products");
    } catch (e) {
      console.error("Designer toggle stock failed:", e);
      res.redirect("/designer/products");
    }
  }
);

// Update stock quantity - tailor
router.post(
  "/product/:productId/update-stock",
  isDesigner,
  async (req, res) => {
    try {
      const { stockQuantity } = req.body;

      // Validation
      const quantity = parseInt(stockQuantity);
      if (isNaN(quantity) || quantity < 0 || quantity > 10000) {
        req.flash(
          "error_msg",
          "Stock quantity must be a number between 0 and 10000"
        );
        return res.redirect("/designer/products");
      }

      const product = await Product.findById(req.params.productId);
      if (!product) {
        req.flash("error_msg", "Product not found");
        return res.redirect("/designer/products");
      }

      product.stockQuantity = quantity;
      if (product.stockQuantity === 0) {
        product.inStock = false;
      }
      await product.save();

      req.flash("success_msg", `Stock quantity updated to ${quantity}`);
      res.redirect("/designer/products");
    } catch (e) {
      console.error("Update stock failed:", e);
      req.flash("error_msg", "Failed to update stock quantity");
      res.redirect("/designer/products");
    }
  }
);

module.exports = router;
