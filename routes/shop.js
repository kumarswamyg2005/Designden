const express = require("express")
const router = express.Router()
const Product = require("../models/product")
const Customization = require("../models/customization")
const Design = require("../models/design")
const CartItem = require("../models/cart")

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login")
  }
  next()
}

// Shop home page with filters
router.get("/", async (req, res) => {
  try {
    // Get filter parameters
    const { category, gender, minPrice, maxPrice, size, sort } = req.query

    // Build filter object
    const filter = {}

    if (category) {
      filter.category = category
    }

    if (gender) {
      filter.gender = gender
    }

    if (size) {
      filter.sizes = size
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    // Build sort object
    let sortOption = {}
    if (sort === "price-low-high") {
      sortOption = { price: 1 }
    } else if (sort === "price-high-low") {
      sortOption = { price: -1 }
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 }
    } else {
      // Default sort
      sortOption = { createdAt: -1 }
    }

    // Allow all users to see all products - customers will see out-of-stock indicators
    
    // Get all products with filters
    const products = await Product.find(filter).sort(sortOption)

    // Get all categories, genders, and sizes for filter options
    const categories = await Product.distinct("category")
    const genders = await Product.distinct("gender")
    const sizes = ["XS", "S", "M", "L", "XL", "XXL", "26", "28", "30", "32", "34", "36"]

    // Get min and max prices for the price range filter
    const priceRange = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ])

    const minPriceValue = priceRange.length > 0 ? Math.floor(priceRange[0].minPrice) : 0
    const maxPriceValue = priceRange.length > 0 ? Math.ceil(priceRange[0].maxPrice) : 1000

    res.render("shop/index", {
      title: "Shop",
      user: req.session.user,
      products,
      categories,
      genders,
      sizes,
      minPriceValue,
      maxPriceValue,
      filters: {
        category,
        gender,
        minPrice: minPrice || minPriceValue,
        maxPrice: maxPrice || maxPriceValue,
        size,
        sort: sort || "newest",
      },
    })
  } catch (error) {
    console.error(error)
    res.render("shop/index", {
      title: "Shop",
      user: req.session.user,
      products: [],
      error: "Failed to load products",
    })
  }
})

// Product details page
router.get("/product/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)

    if (!product) {
      return res.redirect("/shop")
    }

    // Get related products (same category)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4)

    res.render("shop/product-details", {
      title: product.name,
      user: req.session.user,
      product,
      relatedProducts,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/shop")
  }
})

// Customize product page
router.get("/customize/:productId", isLoggedIn, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)

    if (!product || !product.customizable) {
      return res.redirect("/shop")
    }

    res.render("shop/customize-product", {
      title: "Customize " + product.name,
      user: req.session.user,
      product,
    })
  } catch (error) {
    console.error(error)
    res.redirect("/shop")
  }
})

// Save customization
router.post("/save-customization", isLoggedIn, async (req, res) => {
  try {
    const { productId, name, fabric, color, pattern, size, additionalNotes } = req.body

    // Create new customization
    const customization = new Customization({
      userId: req.session.user.id,
      productId,
      name,
      fabric,
      color,
      pattern,
      size,
      additionalNotes,
    })

    await customization.save()

    // Get product for image reference
    const product = await Product.findById(productId)
    
    // Create a design from the customization
    const design = new Design({
      customerId: req.session.user.id,
      productId: productId,
      productImage: product && product.images && product.images.length > 0 ? product.images[0] : null,
      name,
      fabric,
      color,
      pattern,
      size,
      additionalNotes: additionalNotes || `Customized from product ID: ${productId}`,
    })

    await design.save()

    // Add to cart
    const cartItem = new CartItem({
      userId: req.session.user.id,
      designId: design._id,
      quantity: 1,
    })

    await cartItem.save()

    // Redirect to cart
    res.redirect("/customer/cart")
  } catch (error) {
    console.error(error)
    res.redirect("/shop")
  }
})

// Add to cart (would need a cart model in a real app)
router.post("/add-to-cart", isLoggedIn, async (req, res) => {
  try {
    const { productId, size, quantity } = req.body

    // In a real app, you would add to cart here
    // For now, just redirect back to the product page

    res.redirect(`/shop/product/${productId}`)
  } catch (error) {
    console.error(error)
    res.redirect("/shop")
  }
})

module.exports = router
