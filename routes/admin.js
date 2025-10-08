const express = require("express")
const router = express.Router()
const Order = require("../models/order")
const User = require("../models/user")
const Product = require("../models/product")

// Middleware to check if user is logged in and is an admin
const isAdmin = (req, res, next) => {
  // Use admin-scoped session when available (multi-login)
  const sess = req.adminSession || req.session
  if (!sess.user || sess.user.role !== "admin") {
    return res.redirect("/admin/login")
  }
  req.session = sess
  next()
}

// Admin-scoped login routes (use admin cookie)
router.get('/login', (req, res) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return res.redirect('/admin/dashboard')
  }
  res.render('login', { title: 'Admin Login' })
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await require('../models/user').findOne({ $or: [{ email }, { username: email }], role: 'admin' })
    if (!user || user.password !== password) {
      return res.render('login', { title: 'Admin Login', error: 'Invalid email or password' })
    }
    req.session.user = { id: user._id, username: user.username, email: user.email, role: user.role }
    return res.redirect('/admin/dashboard')
  } catch (e) {
    return res.render('login', { title: 'Admin Login', error: 'Login failed' })
  }
})

// Admin dashboard
router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    // Get all orders
    const pendingOrders = await Order.find({ status: "Pending" })
      .populate("customerId", "username email")
      .populate({
        path: "designId",
        populate: {
          path: "productId",
          model: "Product"
        }
      })
      .sort({ orderDate: -1 })

    const assignedOrders = await Order.find({ status: { $ne: "Pending" } })
      .populate("customerId", "username email")
      .populate("designerId", "username email")
      .populate({
        path: "designId",
        populate: {
          path: "productId",
          model: "Product"
        }
      })
      .sort({ orderDate: -1 })

    // Get all designers
    const designers = await User.find({ role: "designer" })

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      user: req.session.user,
      pendingOrders,
      assignedOrders,
      designers,
    })
  } catch (error) {
    console.error(error)
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      user: req.session.user,
      pendingOrders: [],
      assignedOrders: [],
      designers: [],
      error: "Failed to load data",
    })
  }
})

// Assign order to designer
router.post("/assign-order/:orderId", isAdmin, async (req, res) => {
  try {
    const { designerId } = req.body

    const order = await Order.findById(req.params.orderId)

    if (!order || order.status !== "Pending") {
      return res.redirect("/admin/dashboard")
    }

    // Update order and ensure designerId stored
    order.designerId = designerId
    order.status = "Assigned"
    await order.save()

    res.redirect("/admin/dashboard")
  } catch (error) {
    console.error(error)
    res.redirect("/admin/dashboard")
  }
})

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
          model: "Product"
        }
      })

    if (!order) {
      return res.redirect("/admin/dashboard")
    }

    // Get all designers for reassignment
    const designers = await User.find({ role: "designer" })

    res.render("admin/order-details", {
      title: "Order Details",
      user: req.session.user,
      order,
      designers,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/admin/dashboard")
  }
})

// Stock management routes
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 })
    res.render('admin/products', {
      title: 'Product Management',
      user: req.session.user,
      products
    })
  } catch (error) {
    console.error(error)
    res.redirect('/admin/dashboard')
  }
})

// Toggle product stock (admin)
router.post('/product/:productId/toggle-stock', isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
    if (!product) return res.redirect('/admin/products')
    product.inStock = !product.inStock
    await product.save()
    res.redirect('/admin/products')
  } catch (e) {
    console.error('Toggle stock failed:', e)
    res.redirect('/admin/products')
  }
})

// Update stock quantity
router.post('/product/:productId/update-stock', isAdmin, async (req, res) => {
  try {
    const { stockQuantity } = req.body
    const product = await Product.findById(req.params.productId)
    if (!product) return res.redirect('/admin/products')
    
    product.stockQuantity = parseInt(stockQuantity) || 0
    if (product.stockQuantity === 0) {
      product.inStock = false
    }
    await product.save()
    res.redirect('/admin/products')
  } catch (e) {
    console.error('Update stock failed:', e)
    res.redirect('/admin/products')
  }
})

module.exports = router
