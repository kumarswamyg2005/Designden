const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Customization = require("../models/customization");
const Design = require("../models/design");
const CartItem = require("../models/cart");
const Transaction = require("../models/transaction");

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

// Shop home page with filters
router.get("/", async (req, res) => {
  try {
    // Get filter parameters
    const { category, gender, minPrice, maxPrice, size, sort } = req.query;

    // Build filter object
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (gender) {
      filter.gender = gender;
    }

    if (size) {
      filter.sizes = size;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Build sort object
    let sortOption = {};
    if (sort === "price-low-high") {
      sortOption = { price: 1 };
    } else if (sort === "price-high-low") {
      sortOption = { price: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else {
      // Default sort
      sortOption = { createdAt: -1 };
    }

    // Allow all users to see all products - customers will see out-of-stock indicators

    // Get all products with filters
    const products = await Product.find(filter).sort(sortOption);

    // Debug log: show applied filter and how many products were returned
    console.log(
      "[shop] Applied filter:",
      JSON.stringify(filter),
      "sort:",
      JSON.stringify(sortOption),
      "=> products found:",
      products.length
    );

    // Get all categories, genders, and sizes for filter options
    const categories = await Product.distinct("category");
    const genders = await Product.distinct("gender");
    const sizes = [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "26",
      "28",
      "30",
      "32",
      "34",
      "36",
    ];

    // Get min and max prices for the price range filter
    const priceRange = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const minPriceValue =
      priceRange.length > 0 ? Math.floor(priceRange[0].minPrice) : 0;
    const maxPriceValue =
      priceRange.length > 0 ? Math.ceil(priceRange[0].maxPrice) : 1000;

    // If request is XHR (AJAX) return JSON so client can update via Fetch
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
      const productsJson = products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price || 0,
        image: p.images && p.images.length > 0 ? p.images[0] : '/placeholder.svg?height=300&width=300',
        category: p.category,
        gender: p.gender,
        inStock: !!p.inStock,
        stockQuantity: p.stockQuantity || 0,
        customizable: !!p.customizable,
      }));

      return res.json({
        products: productsJson,
        categories,
        genders,
        sizes,
        filters: {
          category,
          gender,
          minPrice: minPrice || minPriceValue,
          maxPrice: maxPrice || maxPriceValue,
          size,
          sort: sort || 'newest',
        },
        count: productsJson.length,
      });
    }

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
    });
  } catch (error) {
    console.error(error);
    res.render("shop/index", {
      title: "Shop",
      user: req.session.user,
      products: [],
      error: "Failed to load products",
    });
  }
});

// Product details page
router.get("/product/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.redirect("/shop");
    }

    // Get related products (same category)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    res.render("shop/product-details", {
      title: product.name,
      user: req.session.user,
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/shop");
  }
});

// Customize product page
router.get("/customize/:productId", isLoggedIn, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product || !product.customizable) {
      return res.redirect("/shop");
    }

    res.render("shop/customize-product", {
      title: "Customize " + product.name,
      user: req.session.user,
      product,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/shop");
  }
});

// Save customization
router.post("/save-customization", isLoggedIn, async (req, res) => {
  try {
    const { productId, name, fabric, color, pattern, size, additionalNotes } =
      req.body;
    const formAction = req.body.formAction || "save"; // 'save' | 'addToCart' | 'placeNow'

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
    });

    await customization.save();

    // Get product for image reference
    const product = await Product.findById(productId);

    // Create a design from the customization
    const design = new Design({
      customerId: req.session.user.id,
      productId: productId,
      productImage:
        product && product.images && product.images.length > 0
          ? product.images[0]
          : null,
      name,
      fabric,
      color,
      pattern,
      size,
      additionalNotes:
        additionalNotes || `Customized from product ID: ${productId}`,
      price: product && product.price ? product.price : undefined,
    });

    await design.save();

    // If user chose to add to cart
    if (formAction === "addToCart") {
      const cartItem = new CartItem({
        userId: req.session.user.id,
        designId: design._id,
        quantity: 1,
      });
      await cartItem.save();
      return res.redirect("/customer/cart");
    }

    // If user chose to place order immediately (one-click)
    if (formAction === "placeNow") {
      // calculate price (use product price or design.price fallback)
      const basePrice =
        product && product.price ? product.price : design.price || 50;
      const totalPrice = basePrice * 1;

      // create order (deliveryAddress placeholder - user can update later)
      const Order = require("../models/order");
      const order = new Order({
        customerId: req.session.user.id,
        designId: design._id,
        quantity: 1,
        deliveryAddress: req.body.deliveryAddress || "To be provided",
        totalPrice,
        status: "Payment Due",
      });

      await order.save();

      // Create a transaction stub
      const transaction = new Transaction({
        orderId: order._id,
        userId: req.session.user.id,
        amount: totalPrice,
        currency: "INR",
        method: req.body.paymentMethod || "cod",
        status: "pending",
      });

      await transaction.save();

      return res.redirect(`/customer/order/${order._id}`);
    }

    // Default behavior: redirect to cart
    const cartItem = new CartItem({
      userId: req.session.user.id,
      designId: design._id,
      quantity: 1,
    });

    await cartItem.save();

    // Redirect to cart
    res.redirect("/customer/cart");
  } catch (error) {
    console.error(error);
    res.redirect("/shop");
  }
});

// Add to cart - properly implement with Cart model
router.post("/add-to-cart", isLoggedIn, async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;
    const userId = req.session.user.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Check stock availability
    if (!product.inStock || product.stockQuantity <= 0) {
      return res.status(400).send("Product out of stock");
    }

    // Create a customization from the product (shop items are pre-made)
    const Customization = require("../models/customization");
    const customization = new Customization({
      customerId: userId,
      fabricId: null,
      designTemplateId: null,
      customImage:
        product.images && product.images.length > 0 ? product.images[0] : null,
      customText: `Shop item: ${product.name}, Size: ${size || "M"}, Color: ${
        color || product.colors[0]
      }`,
      price: product.price,
    });
    await customization.save();

    // Find or create cart for this user
    const Cart = require("../models/cart");
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        items: [
          {
            customizationId: customization._id,
            quantity: Number(quantity || 1),
          },
        ],
      });
    } else {
      // Check if customization already in cart
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.customizationId.toString() === customization._id.toString()
      );

      if (existingItemIndex >= 0) {
        // Update quantity
        cart.items[existingItemIndex].quantity += Number(quantity || 1);
      } else {
        // Add new item
        cart.items.push({
          customizationId: customization._id,
          quantity: Number(quantity || 1),
        });
      }
    }

    cart.updatedAt = Date.now();
    await cart.save();

    // Redirect to cart
    res.redirect("/customer/cart");
  } catch (error) {
    console.error("Shop add to cart error:", error);
    res.redirect("/shop");
  }
});

module.exports = router;
