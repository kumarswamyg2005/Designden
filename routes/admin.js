const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");

// Middleware to check if user is logged in and is an admin
const isAdmin = (req, res, next) => {
  // Use admin-scoped session when available (multi-login)
  const sess = req.adminSession || req.session;
  if (!sess.user || sess.user.role !== "admin") {
    return res.redirect("/admin/login");
  }
  req.session = sess;
  next();
};

// Admin-scoped login routes (use admin cookie)
router.get("/login", (req, res) => {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return res.redirect("/admin/dashboard");
  }
  res.render("login", { title: "Admin Login", action: "/admin/login" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await require("../models/user").findOne({
      $or: [{ email }, { username: email }],
      role: "admin",
    });
    if (!user || user.password !== password) {
      return res.render("login", {
        title: "Admin Login",
        error: "Invalid email or password",
      });
    }
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    return res.redirect("/admin/dashboard");
  } catch (e) {
    return res.render("login", { title: "Admin Login", error: "Login failed" });
  }
});

// Admin dashboard - Analytics focused
router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    // Get all orders for analytics
    const allOrders = await Order.find({})
      .populate("customerId", "username email")
      .populate("items.customizationId")
      .sort({ orderDate: -1 });

    // Calculate statistics
    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter(
      (o) => o.status === "completed" || o.status === "delivered"
    ).length;
    const pendingOrders = allOrders.filter(
      (o) => o.status === "pending"
    ).length;
    const inProductionOrders = allOrders.filter(
      (o) => o.status === "in_production"
    ).length;
    const shippedOrders = allOrders.filter(
      (o) => o.status === "shipped"
    ).length;

    // Calculate revenue
    const totalRevenue = allOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );
    const completedRevenue = allOrders
      .filter((o) => o.status === "completed" || o.status === "delivered")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const pendingRevenue = allOrders
      .filter((o) => o.status === "pending")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Get all products with stock info
    const products = await Product.find({});
    const totalProducts = products.length;
    const lowStockProducts = products.filter(
      (p) => p.inStock === false || (p.stock && p.stock < 10)
    ).length;

    // Get user statistics
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalDesigners = await User.countDocuments({ role: "designer" });
    const totalManagers = await User.countDocuments({ role: "manager" });

    // Recent orders (last 10)
    const recentOrders = allOrders.slice(0, 10);

    // Monthly revenue data (last 6 months)
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthOrders = allOrders.filter((o) => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      const monthRevenue = monthOrders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      );
      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        revenue: monthRevenue,
        orders: monthOrders.length,
      });
    }

    res.render("admin/dashboard", {
      title: "Admin Dashboard - Analytics",
      user: req.session.user,
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        inProductionOrders,
        shippedOrders,
        totalRevenue,
        completedRevenue,
        pendingRevenue,
        totalProducts,
        lowStockProducts,
        totalCustomers,
        totalDesigners,
        totalManagers,
      },
      recentOrders,
      monthlyData,
      products: products.slice(0, 10), // Top 10 products
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      user: req.session.user,
      stats: {},
      recentOrders: [],
      monthlyData: [],
      products: [],
      error: "Failed to load analytics data",
    });
  }
});

// View all orders
router.get("/orders", isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "username email")
      .populate({
        path: "items.customizationId",
        select: "price customText productId fabricId",
      })
      .sort({ orderDate: -1 });

    res.render("admin/orders", {
      title: "All Orders",
      user: req.session.user,
      orders,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.redirect("/admin/dashboard");
  }
});

// Assign order to designer
router.post("/assign-order/:orderId", isAdmin, async (req, res) => {
  try {
    const { designerId } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order || order.status !== "Pending") {
      return res.redirect("/admin/dashboard");
    }

    // Update order and ensure designerId stored
    order.designerId = designerId;
    order.status = "Assigned";
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: "Assigned",
      note: `Assigned to designer ${designerId}`,
      at: new Date(),
    });
    await order.save();

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/dashboard");
  }
});

// View order details
router.get("/order/:orderId", isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("customerId", "username email contactNumber")
      .populate("designerId", "username email")
      .populate({
        path: "designId",
        populate: {
          path: "productId",
          model: "Product",
        },
      });

    if (!order) {
      return res.redirect("/admin/dashboard");
    }

    // Get all designers for reassignment
    const designers = await User.find({ role: "designer" });

    res.render("admin/order-details", {
      title: "Order Details",
      user: req.session.user,
      order,
      designers,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/dashboard");
  }
});

// Update order status (admin)
router.post("/order/:orderId/update-status", isAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.redirect("/admin/dashboard");
    }

    // Basic whitelist for statuses allowed by admin
    const allowed = [
      "Pending",
      "Assigned",
      "In Progress",
      "In Production",
      "Completed",
      "Cancelled",
    ];
    const nextStatus = allowed.includes(status) ? status : order.status;
    if (nextStatus !== order.status) {
      order.status = nextStatus;
      order.timeline = order.timeline || [];
      order.timeline.push({
        status: nextStatus,
        note: note || "",
        at: new Date(),
      });
    }
    await order.save();

    // Support AJAX
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.json({ ok: true, order });
    }

    res.redirect(`/admin/order/${req.params.orderId}`);
  } catch (error) {
    console.error("Admin update-status error:", error);
    res.redirect(`/admin/order/${req.params.orderId}`);
  }
});

// Stock management routes
router.get("/products", isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.render("admin/products", {
      title: "Product Management",
      user: req.session.user,
      products,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/admin/dashboard");
  }
});

// Toggle product stock (admin)
router.post("/product/:productId/toggle-stock", isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.redirect("/admin/products");
    product.inStock = !product.inStock;
    await product.save();
    res.redirect("/admin/products");
  } catch (e) {
    console.error("Toggle stock failed:", e);
    res.redirect("/admin/products");
  }
});

// Update stock quantity
router.post("/product/:productId/update-stock", isAdmin, async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.redirect("/admin/products");

    product.stockQuantity = parseInt(stockQuantity) || 0;
    if (product.stockQuantity === 0) {
      product.inStock = false;
    }
    await product.save();
    res.redirect("/admin/products");
  } catch (e) {
    console.error("Update stock failed:", e);
    res.redirect("/admin/products");
  }
});

module.exports = router;

// Pending managers management
// List pending managers
router.get("/pending-managers", isAdmin, async (req, res) => {
  try {
    const pending = await User.find({ role: "manager", approved: false }).sort({
      createdAt: -1,
    });
    res.render("admin/pending-managers", {
      title: "Pending Managers",
      user: req.session.user,
      pending,
    });
  } catch (e) {
    console.error("Failed to list pending managers:", e);
    res.redirect("/admin/dashboard");
  }
});

// Approve manager
router.post("/approve-manager/:userId", isAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.userId);
    if (!u) return res.redirect("/admin/pending-managers");
    u.approved = true;
    await u.save();
    // Optionally create a notification model here if desired
    res.redirect("/admin/pending-managers");
  } catch (e) {
    console.error("Approve manager failed:", e);
    res.redirect("/admin/pending-managers");
  }
});

// Reject manager (delete or mark rejected)
router.post("/reject-manager/:userId", isAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.userId);
    if (!u) return res.redirect("/admin/pending-managers");
    // For now, mark as not approved and role back to customer (or delete)
    u.approved = false;
    u.role = "customer";
    await u.save();
    res.redirect("/admin/pending-managers");
  } catch (e) {
    console.error("Reject manager failed:", e);
    res.redirect("/admin/pending-managers");
  }
});
