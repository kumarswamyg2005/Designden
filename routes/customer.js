const express = require("express")
const router = express.Router()
const User = require("../models/user")
const Design = require("../models/design")
const Order = require("../models/order")
const Customization = require("../models/customization")
const Product = require("../models/product")
const CartItem = require("../models/cart")

// Middleware to check if user is logged in and is a customer
const isCustomer = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "customer") {
    return res.redirect("/login")
  }
  next()
}

// Customer dashboard
router.get("/dashboard", isCustomer, async (req, res) => {
  try {
    // Get customer's orders
    const orders = await Order.find({ customerId: req.session.user.id })
      .populate({
        path: "designId",
        populate: {
          path: "productId",
          model: "Product"
        }
      })
      .sort({ orderDate: -1 })

    // If AJAX request, return JSON
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ orders })
    }

    res.render("customer/dashboard", {
      title: "Customer Dashboard",
      user: req.session.user,
      orders,
    })
  } catch (error) {
    console.error(error)
    res.render("customer/dashboard", {
      title: "Customer Dashboard",
      user: req.session.user,
      orders: [],
      error: "Failed to load orders",
    })
  }
})

// Design studio
router.get("/design-studio", isCustomer, (req, res) => {
  res.render("customer/design-studio", {
    title: "Design Studio",
    user: req.session.user,
  })
})

// Update the save-design route to properly handle the "Add to Cart" action
router.post("/save-design", isCustomer, async (req, res) => {
  try {
    const { name, fabric, color, pattern, size, additionalNotes, category } = req.body
    const formAction = req.body.formAction || "save" // Check which button was clicked

    // Create default product image based on category
    const getCategoryImage = (category) => {
      const categoryImages = {
        'Hoodie': '/images/classic-hoodie.jpeg',
        'Shirt': '/images/casual-tshirt.jpeg',
        'T-Shirt': '/images/casual-tshirt.jpeg',
        'Kurthi': '/images/kurthi.jpeg',
        'Jeans': '/images/denim-jeans.webp',
        'Dress': '/images/women-tshirt.jpeg'
      }
      return categoryImages[category] || '/images/casual-tshirt.jpeg'
    }

    // Create new design
    const design = new Design({
      customerId: req.session.user.id,
      productImage: getCategoryImage(category),
      name,
      fabric,
      color,
      pattern,
      size,
      additionalNotes,
      category, // Add category field
    })

    await design.save()

    // If the "Add to Cart" button was clicked
    if (formAction === "addToCart") {
      // Create new cart item
      const cartItem = new CartItem({
        userId: req.session.user.id,
        designId: design._id,
        quantity: 1,
      })

      await cartItem.save()

      return res.redirect("/customer/cart")
    }

    // Otherwise, proceed to place order
    res.redirect(`/customer/place-order/${design._id}`)
  } catch (error) {
    console.error(error)
    res.render("customer/design-studio", {
      title: "Design Studio",
      user: req.session.user,
      error: "Failed to save design",
      formData: req.body,
    })
  }
})

// Add a new route specifically for adding to cart
router.post("/add-to-cart-design", isCustomer, async (req, res) => {
  try {
    const { name, fabric, color, pattern, size, additionalNotes, category } = req.body

    // Create default product image based on category
    const getCategoryImage = (category) => {
      const categoryImages = {
        'Hoodie': '/images/classic-hoodie.jpeg',
        'Shirt': '/images/casual-tshirt.jpeg',
        'T-Shirt': '/images/casual-tshirt.jpeg',
        'Kurthi': '/images/kurthi.jpeg',
        'Jeans': '/images/denim-jeans.webp',
        'Dress': '/images/women-tshirt.jpeg'
      }
      return categoryImages[category] || '/images/casual-tshirt.jpeg'
    }

    // Create new design
    const design = new Design({
      customerId: req.session.user.id,
      productImage: getCategoryImage(category),
      name,
      fabric,
      color,
      pattern,
      size,
      additionalNotes,
      category, // Add category field
    })

    await design.save()

    // Create new cart item
    const cartItem = new CartItem({
      userId: req.session.user.id,
      designId: design._id,
      quantity: 1,
    })

    await cartItem.save()

    res.redirect("/customer/cart")
  } catch (error) {
    console.error(error)
    res.render("customer/design-studio", {
      title: "Design Studio",
      user: req.session.user,
      error: "Failed to add design to cart",
      formData: req.body,
    })
  }
})

// Place order form
router.get("/place-order/:designId", isCustomer, async (req, res) => {
  try {
    const design = await Design.findById(req.params.designId)

    if (!design || design.customerId.toString() !== req.session.user.id) {
      return res.redirect("/customer/design-studio")
    }

    res.render("customer/place-order", {
      title: "Place Order",
      user: req.session.user,
      design,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/customer/design-studio")
  }
})

// Place order for customized product
router.get("/place-order-customized/:customizationId", isCustomer, async (req, res) => {
  try {
    const customization = await Customization.findById(req.params.customizationId).populate("productId")

    if (!customization || customization.userId.toString() !== req.session.user.id) {
      return res.redirect("/shop")
    }

    res.render("customer/place-order-customized", {
      title: "Place Order",
      user: req.session.user,
      customization,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/shop")
  }
})

// Submit order
router.post("/place-order", isCustomer, async (req, res) => {
  try {
    const { designId, quantity, deliveryAddress } = req.body

    // Get the design to access its price
    const design = await Design.findById(designId)
    
    // Calculate price using design price or fallback
    const basePrice = design.price || 50 // Use design price or fallback
    const totalPrice = basePrice * Number.parseInt(quantity)

    // Create new order
    const order = new Order({
      customerId: req.session.user.id,
      designId,
      quantity,
      deliveryAddress,
      totalPrice,
    })

    await order.save()

    res.redirect("/customer/dashboard")
  } catch (error) {
    console.error(error)
    res.redirect("/customer/design-studio")
  }
})

// Submit order for customized product
router.post("/place-order-customized", isCustomer, async (req, res) => {
  try {
    const { customizationId, quantity, deliveryAddress } = req.body

    const customization = await Customization.findById(customizationId).populate("productId")

    if (!customization) {
      return res.redirect("/shop")
    }

    // Calculate price based on product price
    const basePrice = customization.productId.price
    const totalPrice = basePrice * Number.parseInt(quantity)

    // Create a design from the customization
    const design = new Design({
      customerId: req.session.user.id,
      name: customization.name,
      fabric: customization.fabric,
      color: customization.color,
      pattern: customization.pattern,
      size: customization.size,
      additionalNotes: customization.additionalNotes,
      category: customization.productId.category, // Add product category
      price: customization.productId.price, // Add product price
    })

    await design.save()

    // Create new order
    const order = new Order({
      customerId: req.session.user.id,
      designId: design._id,
      quantity,
      deliveryAddress,
      totalPrice,
    })

    await order.save()

    res.redirect("/customer/dashboard")
  } catch (error) {
    console.error(error)
    res.redirect("/shop")
  }
})

// View order details
router.get("/order/:orderId", isCustomer, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: "designId",
        populate: {
          path: "productId",
          model: "Product"
        }
      })
      .populate("designerId", "username email")

    if (!order || order.customerId.toString() !== req.session.user.id) {
      return res.redirect("/customer/dashboard")
    }

    res.render("customer/order-details", {
      title: "Order Details",
      user: req.session.user,
      order,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/customer/dashboard")
  }
})

// View cart
router.get("/cart", isCustomer, async (req, res) => {
  try {
    // Get cart items
    const cartItems = await CartItem.find({ userId: req.session.user.id })
      .populate({
        path: "designId",
        populate: {
          path: "productId",
          model: "Product"
        }
      })
      .sort({ addedAt: -1 })

    res.render("customer/cart", {
      title: "Your Cart",
      user: req.session.user,
      cartItems,
    })
  } catch (error) {
    console.error(error)
    res.render("customer/cart", {
      title: "Your Cart",
      user: req.session.user,
      cartItems: [],
      error: "Failed to load cart items",
    })
  }
})

// Add design to cart
router.post("/add-to-cart", isCustomer, async (req, res) => {
  try {
    const { designId, productId, quantity, size, color } = req.body

    // Handle design from design studio
    if (designId) {
      // Check if design exists
      const design = await Design.findById(designId)
      if (!design) {
        return res.redirect("/customer/design-studio")
      }

      // Check if item already in cart
      const existingItem = await CartItem.findOne({
        userId: req.session.user.id,
        designId: designId,
      })

      if (existingItem) {
        // Update quantity
        existingItem.quantity = Number(quantity || 1)
        await existingItem.save()
      } else {
        // Create new cart item
        const cartItem = new CartItem({
          userId: req.session.user.id,
          designId: designId,
          quantity: Number(quantity || 1),
        })
        await cartItem.save()
      }
    }
    // Handle product from shop
    else if (productId) {
      // Check if product exists
      const product = await Product.findById(productId)
      if (!product) {
        return res.redirect("/shop")
      }

      // Create a design from the product
      const design = new Design({
        customerId: req.session.user.id,
        productId: product._id,
        productImage: product.images && product.images.length > 0 ? product.images[0] : null,
        name: product.name,
        fabric: product.fabrics[0], // Default to first fabric
        color: color || product.colors[0], // Use selected color or default
        pattern: "Solid", // Default pattern
        size: size || product.sizes[0], // Use selected size or default
        additionalNotes: `Added from shop: ${product.name}`,
        category: product.category, // Add product category
        price: product.price, // Use actual product price
      })

      await design.save()

      // Create new cart item with the design
      const cartItem = new CartItem({
        userId: req.session.user.id,
        designId: design._id,
        quantity: Number(quantity || 1),
      })
      await cartItem.save()
    } else {
      return res.redirect("/customer/dashboard")
    }

    res.redirect("/customer/cart")
  } catch (error) {
    console.error("Add to cart error:", error)
    res.redirect(req.headers.referer || "/customer/dashboard")
  }
})

// Remove item from cart
router.post("/remove-from-cart", isCustomer, async (req, res) => {
  try {
    const { cartItemId } = req.body

    // Find and delete cart item
    const cartItem = await CartItem.findById(cartItemId)
    if (cartItem && cartItem.userId.toString() === req.session.user.id) {
      await CartItem.findByIdAndDelete(cartItemId)
    }

    res.redirect("/customer/cart")
  } catch (error) {
    console.error(error)
    res.redirect("/customer/cart")
  }
})

// Update cart item quantity
router.post("/update-cart", isCustomer, async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body

    // Find and update cart item
    const cartItem = await CartItem.findById(cartItemId)
    if (cartItem && cartItem.userId.toString() === req.session.user.id) {
      cartItem.quantity = Number(quantity)
      await cartItem.save()
    }

    res.redirect("/customer/cart")
  } catch (error) {
    console.error(error)
    res.redirect("/customer/cart")
  }
})

// Checkout from cart
router.get("/checkout", isCustomer, async (req, res) => {
  try {
    // Get cart items
    const cartItems = await CartItem.find({ userId: req.session.user.id })
      .populate({
        path: "designId",
        populate: {
          path: "productId",
          model: "Product"
        }
      })

    if (cartItems.length === 0) {
      return res.redirect("/customer/cart")
    }

    res.render("customer/checkout", {
      title: "Checkout",
      user: req.session.user,
      cartItems,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/customer/cart")
  }
})

// Process checkout
router.post("/process-checkout", isCustomer, async (req, res) => {
  try {
    const { deliveryAddress } = req.body

    // Get cart items
    const cartItems = await CartItem.find({ userId: req.session.user.id })
      .populate({
        path: "designId",
        populate: {
          path: "productId",
          model: "Product"
        }
      })

    if (cartItems.length === 0) {
      return res.redirect("/customer/cart")
    }

    // Create orders for each cart item
    for (const item of cartItems) {
      // Calculate price using actual design/product price
      const basePrice = item.designId.price || 50 // Use design price or fallback to 50
      const totalPrice = basePrice * item.quantity

      // Create new order
      const order = new Order({
        customerId: req.session.user.id,
        designId: item.designId._id,
        quantity: item.quantity,
        deliveryAddress,
        totalPrice,
      })

      await order.save()

      // Remove item from cart
      await CartItem.findByIdAndDelete(item._id)
    }

    res.redirect("/customer/dashboard")
  } catch (error) {
    console.error(error)
    res.redirect("/customer/checkout")
  }
})

module.exports = router
