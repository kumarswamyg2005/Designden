const express = require("express")
const router = express.Router()
const Order = require("../models/order")
const Product = require("../models/product")

// Middleware to check if user is logged in and is a designer
const isDesigner = (req, res, next) => {
  // Use designer-scoped session when available (multi-login)
  const sess = req.designerSession || req.session
  if (!sess.user || sess.user.role !== "designer") {
    return res.redirect("/designer/login")
  }
  req.session = sess
  next()
}

// Designer-scoped login routes (use designer cookie)
router.get('/login', (req, res) => {
  if (req.session && req.session.user && req.session.user.role === 'designer') {
    return res.redirect('/designer/dashboard')
  }
  res.render('login', { title: 'Designer Login' })
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await require('../models/user').findOne({ $or: [{ email }, { username: email }], role: 'designer' })
    if (!user || user.password !== password) {
      return res.render('login', { title: 'Designer Login', error: 'Invalid email or password' })
    }
    req.session.user = { id: user._id, username: user.username, email: user.email, role: user.role }
    return res.redirect('/designer/dashboard')
  } catch (e) {
    return res.render('login', { title: 'Designer Login', error: 'Login failed' })
  }
})

// Designer dashboard
router.get("/dashboard", isDesigner, async (req, res) => {
  try {
    // Get assigned orders
    const assignedOrders = await Order.find({ designerId: req.session.user.id })
      .populate("customerId", "username email")
      .populate({
        path: "designId",
        populate: {
          path: "productId",
          model: "Product"
        }
      })
      .sort({ orderDate: -1 })

    res.render("designer/dashboard", {
      title: "Designer Dashboard",
      user: req.session.user,
      assignedOrders,
    })
  } catch (error) {
    console.error(error)
    res.render("designer/dashboard", {
      title: "Designer Dashboard",
      user: req.session.user,
      assignedOrders: [],
      error: "Failed to load orders",
    })
  }
})

// View order details
router.get("/order/:orderId", isDesigner, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("customerId", "username email contactNumber")
      .populate({
        path: "designId",
        populate: {
          path: "productId",
          model: "Product"
        }
      })

    if (!order || order.designerId.toString() !== req.session.user.id) {
      return res.redirect("/designer/dashboard")
    }

    res.render("designer/order-details", {
      title: "Order Details",
      user: req.session.user,
      order,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/designer/dashboard")
  }
})

// Update order status
router.post("/update-status/:orderId", isDesigner, async (req, res) => {
  try {
    const { status } = req.body

    const order = await Order.findById(req.params.orderId)

    if (!order || order.designerId.toString() !== req.session.user.id) {
      return res.redirect("/designer/dashboard")
    }

    // Update status
    order.status = status
    await order.save()

    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ ok: true, order })
    }

    res.redirect("/designer/order/" + req.params.orderId)
  } catch (error) {
    console.error(error)
    res.redirect("/designer/dashboard")
  }
})

// Stock management routes for tailor
router.get('/products', isDesigner, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 })
    res.render('designer/products', {
      title: 'Product Management - Tailor',
      user: req.session.user,
      products
    })
  } catch (error) {
    console.error(error)
    res.redirect('/designer/dashboard')
  }
})

// Designer toggle product stock (optional for tailor)
router.post('/product/:productId/toggle-stock', isDesigner, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
    if (!product) return res.redirect('/designer/products')
    product.inStock = !product.inStock
    await product.save()
    res.redirect('/designer/products')
  } catch (e) {
    console.error('Designer toggle stock failed:', e)
    res.redirect('/designer/products')
  }
})

// Update stock quantity - tailor
router.post('/product/:productId/update-stock', isDesigner, async (req, res) => {
  try {
    const { stockQuantity } = req.body
    const product = await Product.findById(req.params.productId)
    if (!product) return res.redirect('/designer/products')
    
    product.stockQuantity = parseInt(stockQuantity) || 0
    if (product.stockQuantity === 0) {
      product.inStock = false
    }
    await product.save()
    res.redirect('/designer/products')
  } catch (e) {
    console.error('Update stock failed:', e)
    res.redirect('/designer/products')
  }
})

module.exports = router
