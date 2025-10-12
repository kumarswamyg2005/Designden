const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Design = require("../models/design");
const Order = require("../models/order");
const Customization = require("../models/customization");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Fabric = require("../models/fabric");

// Middleware to check if user is logged in and is a customer
const isCustomer = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "customer") {
    return res.redirect("/login");
  }
  next();
};

// Customer dashboard
router.get("/dashboard", isCustomer, async (req, res) => {
  try {
    // Get customer's orders
    const orders = await Order.find({ customerId: req.session.user.id })
      .populate({
        path: "items.customizationId",
        model: "Customization",
      })
      .sort({ orderDate: -1 });

    // If AJAX request, return JSON (also include wishlist items)
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      const wishlist = await Design.find({
        customerId: req.session.user.id,
        wishlist: true,
      }).sort({ createdAt: -1 });
      return res.json({ orders, wishlist });
    }

    const wishlist = await Design.find({
      customerId: req.session.user.id,
      wishlist: true,
    }).sort({ createdAt: -1 });

    // Get order success message if exists
    const orderSuccess = req.session.orderSuccess;
    delete req.session.orderSuccess; // Clear it after reading

    res.render("customer/dashboard", {
      title: "Customer Dashboard",
      user: req.session.user,
      orders,
      orderSuccess,
      wishlist,
    });
  } catch (error) {
    console.error(error);
    res.render("customer/dashboard", {
      title: "Customer Dashboard",
      user: req.session.user,
      orders: [],
      error: "Failed to load orders",
    });
  }
});
// Wishlist list (AJAX)
router.get("/wishlist/list", isCustomer, async (req, res) => {
  try {
    const items = await Design.find({
      customerId: req.session.user.id,
      wishlist: true,
    }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (e) {
    res.status(500).json({ items: [] });
  }
});

// Design studio
router.get("/design-studio", isCustomer, (req, res) => {
  res.render("customer/design-studio", {
    title: "Design Studio",
    user: req.session.user,
  });
});

// Helpful GET handler for save-design to avoid 404 when browsers submit GET by mistake
router.get("/save-design", (req, res) => {
  console.log(
    "[save-design GET] Received GET; redirecting to design-studio. Session user=",
    req.session && req.session.user ? req.session.user.username : "none"
  );
  // If user not logged in, redirect to login; otherwise redirect to customer design studio
  if (!req.session.user || req.session.user.role !== "customer") {
    return res.redirect("/login");
  }
  return res.redirect("/customer/design-studio");
});

// Update the save-design route to properly handle the "Add to Cart" action
router.post("/save-design", isCustomer, async (req, res) => {
  try {
    // DEBUG: Log session and formAction to help trace save/addToCart issues
    console.log(
      "[save-design] session.user=",
      req.session && req.session.user
        ? `${req.session.user.username}(${req.session.user.id})`
        : "NO_SESSION"
    );
    console.log(
      "[save-design] body keys=",
      Object.keys(req.body),
      "formAction=",
      req.body.formAction
    );
    const {
      name,
      size,
      additionalNotes,
      category,
      urgency,
      graphic,
      _fabric_mirror,
      _color_mirror,
      _pattern_mirror,
    } = req.body;

    // Use mirror fields if main fields are disabled (when graphic is selected)
    const fabric = req.body.fabric || _fabric_mirror || "Cotton";
    const color = req.body.color || _color_mirror || "White";
    const pattern = req.body.pattern || _pattern_mirror || "Solid";

    const formAction = req.body.formAction || "save"; // Check which button was clicked

    // Create default product image based on category
    const getCategoryImage = (category) => {
      const categoryImages = {
        Hoodie: "/images/classic-hoodie.jpeg",
        Shirt: "/images/casual-tshirt.jpeg",
        "T-Shirt": "/images/casual-tshirt.jpeg",
        Kurthi: "/images/kurthi.jpeg",
        Jeans: "/images/denim-jeans.webp",
        Dress: "/images/women-tshirt.jpeg",
      };
      return categoryImages[category] || "/images/casual-tshirt.jpeg";
    };

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
      sustainabilityScore: await (async () => {
        try {
          const fab = await Fabric.findOne({ name: fabric });
          return fab && typeof fab.sustainabilityScore === "number"
            ? fab.sustainabilityScore
            : 50;
        } catch (e) {
          return 50;
        }
      })(),
    });

    await design.save();

    // If the "Add to Cart" button was clicked
    if (formAction === "addToCart") {
      // Create a customization from the design
      const customization = new Customization({
        customerId: req.session.user.id,
        fabricId: null,
        designTemplateId: null,
        customImage: null,
        customText: design.additionalNotes,
        price: design.price || 50,
      });
      await customization.save();

      // Find or create cart
      let cart = await Cart.findOne({ userId: req.session.user.id });
      if (!cart) {
        cart = new Cart({
          userId: req.session.user.id,
          items: [{ customizationId: customization._id, quantity: 1 }],
        });
      } else {
        cart.items.push({ customizationId: customization._id, quantity: 1 });
      }
      await cart.save();

      return res.redirect("/customer/cart");
    }

    // Otherwise, proceed to place order with urgency-based pricing hint via query
    res.redirect(
      `/customer/place-order/${design._id}?urgency=${encodeURIComponent(
        urgency || "standard"
      )}`
    );
  } catch (error) {
    console.error("[save-design] ERROR saving design:", error);
    // If AJAX/fetch request, return JSON so client can surface the error
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res
        .status(500)
        .json({ error: "Failed to save design", details: error.message });
    }
    res.render("customer/design-studio", {
      title: "Design Studio",
      user: req.session.user,
      error: "Failed to save design",
      formData: req.body,
    });
  }
});

// Add a new route specifically for adding to cart
router.post("/add-to-cart-design", isCustomer, async (req, res) => {
  try {
    const { name, fabric, color, pattern, size, additionalNotes, category } =
      req.body;

    // Create default product image based on category
    const getCategoryImage = (category) => {
      const categoryImages = {
        Hoodie: "/images/classic-hoodie.jpeg",
        Shirt: "/images/casual-tshirt.jpeg",
        "T-Shirt": "/images/casual-tshirt.jpeg",
        Kurthi: "/images/kurthi.jpeg",
        Jeans: "/images/denim-jeans.webp",
        Dress: "/images/women-tshirt.jpeg",
      };
      return categoryImages[category] || "/images/casual-tshirt.jpeg";
    };

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
    });

    await design.save();

    // Create a customization from the design
    const customization = new Customization({
      customerId: req.session.user.id,
      fabricId: null,
      designTemplateId: null,
      customImage: null,
      customText: design.additionalNotes,
      price: design.price || 50,
    });
    await customization.save();

    // Find or create cart and add item
    let cart = await Cart.findOne({ userId: req.session.user.id });
    if (!cart) {
      cart = new Cart({
        userId: req.session.user.id,
        items: [{ customizationId: customization._id, quantity: 1 }],
      });
    } else {
      cart.items.push({ customizationId: customization._id, quantity: 1 });
    }
    await cart.save();

    res.redirect("/customer/cart");
  } catch (error) {
    console.error(error);
    res.render("customer/design-studio", {
      title: "Design Studio",
      user: req.session.user,
      error: "Failed to add design to cart",
      formData: req.body,
    });
  }
});

// Place order form
router.get("/place-order/:designId", isCustomer, async (req, res) => {
  try {
    const design = await Design.findById(req.params.designId);

    if (!design || design.customerId.toString() !== req.session.user.id) {
      return res.redirect("/customer/design-studio");
    }

    // Adjust price for urgency if provided
    let hintedUrgency = (req.query && req.query.urgency) || "standard";
    const basePrice = design.price || 50;
    const price =
      hintedUrgency === "express" ? Math.round(basePrice * 1.2) : basePrice;

    res.render("customer/place-order", {
      title: "Place Order",
      user: req.session.user,
      design: Object.assign({}, design.toObject(), { price }),
    });
  } catch (error) {
    console.error(error);
    res.redirect("/customer/design-studio");
  }
});

// Place order for customized product
router.get(
  "/place-order-customized/:customizationId",
  isCustomer,
  async (req, res) => {
    try {
      const customization = await Customization.findById(
        req.params.customizationId
      ).populate("productId");

      if (
        !customization ||
        customization.userId.toString() !== req.session.user.id
      ) {
        return res.redirect("/shop");
      }

      res.render("customer/place-order-customized", {
        title: "Place Order",
        user: req.session.user,
        customization,
      });
    } catch (error) {
      console.error(error);
      res.redirect("/shop");
    }
  }
);

// Submit order
router.post("/place-order", isCustomer, async (req, res) => {
  try {
    const { designId, quantity, deliveryAddress, urgency, basePrice } =
      req.body;

    // Get the design to access its price
    const design = await Design.findById(designId);

    if (!design) {
      console.error("[PLACE-ORDER] Design not found:", designId);
      return res.redirect("/customer/design-studio");
    }

    // Calculate price using design price or provided base with urgency
    const base = Number(basePrice) > 0 ? Number(basePrice) : design.price || 50;
    const unit = urgency === "express" ? Math.round(base * 1.2) : base;
    const totalPrice = unit * Number.parseInt(quantity);

    // Get default fabric for the customization
    const Fabric = require("../models/fabric");
    const defaultFabric =
      (await Fabric.findOne({ name: /cotton/i })) || (await Fabric.findOne());

    // Create customization from design (for new order structure)
    const customization = new Customization({
      userId: req.session.user.id,
      fabricId: defaultFabric ? defaultFabric._id : null,
      productId: null, // NULL means custom 3D design (not shop product)
      designId: design._id, // Track original design for wishlist cleanup
      customImage: design.productImage, // Customer's 3D design screenshot
      customText: design.additionalNotes || design.name || "Custom 3D Design",
      color: design.color || "Default",
      size: design.size || "M",
      price: unit,
    });

    await customization.save();
    console.log(
      "[PLACE-ORDER] Created customization:",
      customization._id,
      "for custom 3D design"
    );

    // Create new order with items array (modern structure)
    const order = new Order({
      customerId: req.session.user.id,
      items: [
        {
          customizationId: customization._id,
          quantity: Number.parseInt(quantity),
          price: unit,
        },
      ],
      deliveryAddress,
      totalPrice,
      status: "pending", // Custom designs need manager approval/assignment
    });

    await order.save();
    console.log(
      "[PLACE-ORDER] Order created successfully:",
      order._id,
      "Status: pending (awaiting manager assignment)"
    );

    // Remove from wishlist if this was a wishlist item
    if (design.wishlist === true) {
      await Design.deleteOne({ _id: design._id });
      console.log(
        "[PLACE-ORDER] Removed wishlist item after order:",
        design._id
      );
    }

    res.redirect("/customer/dashboard");
  } catch (error) {
    console.error("[PLACE-ORDER] Error:", error);
    res.redirect("/customer/design-studio");
  }
});

// Submit order for customized product
router.post("/place-order-customized", isCustomer, async (req, res) => {
  try {
    const { customizationId, quantity, deliveryAddress } = req.body;

    const customization = await Customization.findById(
      customizationId
    ).populate("productId");

    if (!customization) {
      return res.redirect("/shop");
    }

    // Calculate price based on product price
    const basePrice = customization.productId.price;
    const totalPrice = basePrice * Number.parseInt(quantity);

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
    });

    await design.save();

    // Create new order
    const order = new Order({
      customerId: req.session.user.id,
      designId: design._id,
      quantity,
      deliveryAddress,
      totalPrice,
    });

    await order.save();

    res.redirect("/customer/dashboard");
  } catch (error) {
    console.error(error);
    res.redirect("/shop");
  }
});

// View order details
router.get("/order/:orderId", isCustomer, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate({
      path: "items.customizationId",
      model: "Customization",
      populate: [
        { path: "productId", model: "Product" }, // Populate product for shop orders
        { path: "fabricId", model: "Fabric" }, // Populate fabric details
      ],
    });

    if (!order || order.customerId.toString() !== req.session.user.id) {
      return res.redirect("/customer/dashboard");
    }

    res.render("customer/order-details", {
      title: "Order Details",
      user: req.session.user,
      order,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/customer/dashboard");
  }
});

// View cart
router.get("/cart", isCustomer, async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ userId: req.session.user.id }).populate({
      path: "items.customizationId",
      model: "Customization",
    });

    // Format cart items for the view (backwards compatible)
    let cartItems = [];
    if (cart && cart.items) {
      cartItems = cart.items.map((item) => ({
        _id: item._id,
        customizationId: item.customizationId,
        quantity: item.quantity,
        addedAt: item.addedAt,
        // For backwards compatibility with views expecting designId
        designId: item.customizationId,
      }));
    }

    res.render("customer/cart", {
      title: "Your Cart",
      user: req.session.user,
      cartItems,
    });
  } catch (error) {
    console.error("Cart display error:", error);
    res.render("customer/cart", {
      title: "Your Cart",
      user: req.session.user,
      cartItems: [],
      error: "Failed to load cart items",
    });
  }
});

// Wishlist: add current design configuration (mood board item)
router.post("/wishlist/add", isCustomer, async (req, res) => {
  try {
    const {
      name,
      size,
      additionalNotes,
      category,
      graphic,
      _fabric_mirror,
      _color_mirror,
      _pattern_mirror,
    } = req.body;

    // Use mirror fields if main fields are disabled (when graphic is selected)
    const fabric = req.body.fabric || _fabric_mirror || "Cotton";
    const color = req.body.color || _color_mirror || "White";
    const pattern = req.body.pattern || _pattern_mirror || "Solid";

    const design = new Design({
      customerId: req.session.user.id,
      name: name || "Wishlist Design",
      fabric,
      color,
      pattern,
      size: size || "M",
      additionalNotes,
      category: category || "T-Shirt",
      wishlist: true,
    });
    await design.save();
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.json({ ok: true, id: design._id });
    }
    res.redirect("/customer/dashboard");
  } catch (e) {
    console.error("Wishlist add failed:", e);
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.status(500).json({ ok: false });
    }
    res.redirect("/customer/dashboard");
  }
});

// Remove from wishlist
router.post("/wishlist/remove", isCustomer, async (req, res) => {
  try {
    const { designId } = req.body;
    const d = await Design.findOne({
      _id: designId,
      customerId: req.session.user.id,
      wishlist: true,
    });
    if (d) {
      await Design.deleteOne({ _id: d._id });
      req.flash("success_msg", "✅ Item removed from wishlist");
    }
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.json({ ok: true });
    }
    res.redirect("/customer/dashboard");
  } catch (e) {
    req.flash("error_msg", "❌ Failed to remove item from wishlist");
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.status(500).json({ ok: false });
    }
    res.redirect("/customer/dashboard");
  }
});

// Add design to cart
router.post("/add-to-cart", isCustomer, async (req, res) => {
  try {
    const { designId, productId, quantity, size, color, customizationId } =
      req.body;
    const userId = req.session.user.id;

    console.log("[ADD-TO-CART] Request data:", {
      designId,
      productId,
      quantity,
      size,
      color,
      customizationId,
      userId,
    });

    let finalCustomizationId = customizationId;

    // Handle design from design studio (if designId provided)
    if (designId) {
      // Check if design exists
      const design = await Design.findById(designId);
      if (!design) {
        return res
          .status(404)
          .json({ success: false, error: "Design not found" });
      }

      // Get default fabric or create one
      let defaultFabric = await Fabric.findOne({ type: "Cotton" });
      if (!defaultFabric) {
        try {
          defaultFabric = new Fabric({
            name: "Default Cotton",
            type: "Cotton",
            pricePerMeter: 0,
            available: true,
          });
          await defaultFabric.save();
          console.log("[ADD-TO-CART] Created new default fabric");
        } catch (fabricError) {
          // If duplicate key error, fabric was created by another request
          if (fabricError.code === 11000) {
            defaultFabric = await Fabric.findOne({ name: "Default Cotton" });
            console.log(
              "[ADD-TO-CART] Using existing fabric after duplicate error"
            );
          } else {
            throw fabricError;
          }
        }
      }

      // Ensure fabric was found/created
      if (!defaultFabric) {
        console.log("[ADD-TO-CART] ERROR: Could not get/create default fabric");
        return res
          .status(500)
          .json({ success: false, error: "Fabric initialization failed" });
      }

      // Create a customization from the design
      const customization = new Customization({
        userId: userId,
        fabricId: defaultFabric._id,
        designTemplateId: null,
        designId: design._id, // Track original design for wishlist cleanup
        customImage: design.productImage,
        customText: design.additionalNotes || "Custom Design",
        size: size || "M",
        color: color || "Default",
        price: design.price || 50,
      });
      await customization.save();
      finalCustomizationId = customization._id;

      console.log(
        "[ADD-TO-CART] Created customization from design:",
        design._id,
        "Wishlist:",
        design.wishlist
      );
    }
    // Handle product from shop
    else if (productId) {
      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        console.log("[ADD-TO-CART] Product not found:", productId);
        return res
          .status(404)
          .json({ success: false, error: "Product not found" });
      }

      console.log(
        "[ADD-TO-CART] Product found:",
        product.name,
        "Size:",
        size,
        "Color:",
        color
      );

      // Get default fabric or create one
      let defaultFabric = await Fabric.findOne({ type: "Cotton" });
      if (!defaultFabric) {
        try {
          defaultFabric = new Fabric({
            name: "Default Cotton",
            type: "Cotton",
            pricePerMeter: 0,
            available: true,
          });
          await defaultFabric.save();
          console.log("[ADD-TO-CART] Created new default fabric");
        } catch (fabricError) {
          // If duplicate key error, fabric was created by another request
          if (fabricError.code === 11000) {
            defaultFabric = await Fabric.findOne({ name: "Default Cotton" });
            console.log(
              "[ADD-TO-CART] Using existing fabric after duplicate error"
            );
          } else {
            throw fabricError;
          }
        }
      }

      // Ensure fabric was found/created
      if (!defaultFabric) {
        console.log("[ADD-TO-CART] ERROR: Could not get/create default fabric");
        return res
          .status(500)
          .json({ success: false, error: "Fabric initialization failed" });
      }

      // Create a customization from the product
      const customization = new Customization({
        userId: userId,
        fabricId: defaultFabric._id,
        productId: product._id, // Mark as shop order
        designTemplateId: null,
        customImage:
          product.images && product.images.length > 0
            ? product.images[0]
            : null,
        customText: `${product.name}`,
        size: size || "M",
        color: color || "Default",
        price: product.price,
      });

      console.log("[ADD-TO-CART] Creating customization:", {
        userId,
        fabricId: defaultFabric._id,
        size: size || "M",
        color: color || "Default",
        price: product.price,
      });

      await customization.save();
      console.log(
        "[ADD-TO-CART] Customization saved successfully:",
        customization._id
      );
      finalCustomizationId = customization._id;
    }

    // If no customizationId was created, return error
    if (!finalCustomizationId) {
      console.log("[ADD-TO-CART] ERROR: No customization ID created");
      return res
        .status(400)
        .json({ success: false, error: "No item to add to cart" });
    }

    console.log(
      "[ADD-TO-CART] Adding to cart, customizationId:",
      finalCustomizationId
    );

    // Find or create cart for this user
    let cart = await Cart.findOne({ userId });
    console.log("[ADD-TO-CART] Existing cart found:", cart ? "Yes" : "No");

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        items: [
          {
            customizationId: finalCustomizationId,
            quantity: Number(quantity || 1),
          },
        ],
      });
    } else {
      // Check if customization already in cart
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.customizationId.toString() === finalCustomizationId.toString()
      );

      if (existingItemIndex >= 0) {
        // Update quantity
        cart.items[existingItemIndex].quantity += Number(quantity || 1);
      } else {
        // Add new item
        cart.items.push({
          customizationId: finalCustomizationId,
          quantity: Number(quantity || 1),
        });
      }
    }

    cart.updatedAt = Date.now();
    await cart.save();

    console.log(
      "[ADD-TO-CART] SUCCESS! Cart saved with",
      cart.items.length,
      "items"
    );

    // Return JSON for AJAX requests, redirect for form submissions
    if (req.xhr || req.headers.accept.includes("application/json")) {
      return res.json({ success: true, message: "Added to cart" });
    }
    res.redirect("/customer/cart");
  } catch (error) {
    console.error("Add to cart error:", error);
    if (req.xhr || req.headers.accept.includes("application/json")) {
      return res.status(500).json({ success: false, error: error.message });
    }
    res.redirect(req.headers.referer || "/customer/dashboard");
  }
});

// Remove item from cart
router.post("/remove-from-cart", isCustomer, async (req, res) => {
  try {
    const { customizationId } = req.body;
    const userId = req.session.user.id;

    // Find user's cart
    const cart = await Cart.findOne({ userId });
    if (cart) {
      // Remove item from cart
      cart.items = cart.items.filter(
        (item) => item.customizationId.toString() !== customizationId
      );
      cart.updatedAt = Date.now();
      await cart.save();
    }

    res.redirect("/customer/cart");
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.redirect("/customer/cart");
  }
});

// Update cart item quantity
router.post("/update-cart", isCustomer, async (req, res) => {
  try {
    const { customizationId, quantity } = req.body;
    const userId = req.session.user.id;

    // Find user's cart
    const cart = await Cart.findOne({ userId });
    if (cart) {
      const item = cart.items.find(
        (item) => item.customizationId.toString() === customizationId
      );
      if (item) {
        item.quantity = Number(quantity);
        cart.updatedAt = Date.now();
        await cart.save();
      }
    }

    res.redirect("/customer/cart");
  } catch (error) {
    console.error("Update cart error:", error);
    res.redirect("/customer/cart");
  }
});

// Checkout from cart
router.get("/checkout", isCustomer, async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ userId: req.session.user.id }).populate({
      path: "items.customizationId",
      model: "Customization",
    });

    if (!cart || cart.items.length === 0) {
      return res.redirect("/customer/cart");
    }

    // Format cart items for the view
    const cartItems = cart.items.map((item) => ({
      _id: item._id,
      customizationId: item.customizationId,
      quantity: item.quantity,
      designId: item.customizationId, // Backwards compatibility
    }));

    res.render("customer/checkout", {
      title: "Checkout",
      user: req.session.user,
      cartItems,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.redirect("/customer/cart");
  }
});

// Process checkout
router.post("/process-checkout", isCustomer, async (req, res) => {
  try {
    const { deliveryAddress } = req.body;

    // Get user's cart with design info to check for wishlist items
    const cart = await Cart.findOne({ userId: req.session.user.id }).populate({
      path: "items.customizationId",
      model: "Customization",
      populate: {
        path: "designId",
        model: "Design",
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.redirect("/customer/cart");
    }

    const cartItems = cart.items;

    // Create orders for each cart item
    const orderItems = [];
    let orderTotalPrice = 0;
    let isShopOrder = true; // Assume shop order unless proven otherwise

    for (const item of cartItems) {
      // Calculate price using customization price
      const basePrice = item.customizationId.price || 50;
      const itemTotal = basePrice * item.quantity;
      orderTotalPrice += itemTotal;

      // CRITICAL: Check if this is a custom 3D design from Design Studio
      // - Shop products (ready-made): Have productId → Auto-approve
      // - Design Studio (3D custom): NO productId → Needs designer assignment
      if (!item.customizationId.productId) {
        isShopOrder = false; // This is a custom design from Design Studio
        console.log(
          "[CHECKOUT] Custom design detected (no productId) - requires designer assignment"
        );
      } else {
        console.log(
          "[CHECKOUT] Shop product detected (has productId:",
          item.customizationId.productId,
          ") - will auto-approve"
        );
      }

      orderItems.push({
        customizationId: item.customizationId._id,
        quantity: item.quantity,
        price: basePrice, // Required field
      });
    }

    console.log(
      "[CHECKOUT] Creating order with",
      orderItems.length,
      "items. Total:",
      orderTotalPrice,
      "Shop order (ready-made):",
      isShopOrder,
      "Custom design (3D):",
      !isShopOrder
    );

    // Auto-approve shop orders to "in_production" (no designer assignment needed)
    // Custom orders stay "pending" (require manager to assign designer)
    const orderStatus = isShopOrder ? "in_production" : "pending";

    // Create new order with all items
    const order = new Order({
      customerId: req.session.user.id,
      items: orderItems,
      deliveryAddress,
      status: orderStatus,
      paymentStatus: "unpaid", // Correct enum value
      totalPrice: orderTotalPrice, // Required field
      productionStartedAt: isShopOrder ? new Date() : undefined, // Auto-start production for shop orders
    });

    // Add timeline for shop orders
    if (isShopOrder) {
      order.timeline = [
        {
          status: "in_production",
          note: "Shop order auto-approved and moved to production",
          at: new Date(),
        },
      ];
    }

    await order.save();
    console.log(
      "[CHECKOUT] Order created successfully:",
      order._id,
      "Status:",
      orderStatus
    );

    // Auto-progress shop orders through statuses (ready-made products only)
    if (isShopOrder) {
      console.log(
        `[SHOP-AUTO-PROGRESS] Order ${order._id} will auto-progress through statuses`
      );

      // Stage 1: Packing (completed) - after 3 seconds
      setTimeout(async () => {
        try {
          const orderToUpdate = await Order.findById(order._id).populate(
            "customerId",
            "username email"
          );
          if (orderToUpdate && orderToUpdate.status === "in_production") {
            orderToUpdate.status = "completed";
            orderToUpdate.productionCompletedAt = new Date();
            orderToUpdate.timeline = orderToUpdate.timeline || [];
            orderToUpdate.timeline.push({
              status: "completed",
              note: "Shop order packing completed",
              at: new Date(),
            });
            await orderToUpdate.save();

            const Notification = require("../models/notification");
            await Notification.create({
              userId: orderToUpdate.customerId._id,
              title: "📦 Order Packing Complete!",
              message: `Your order #${orderToUpdate._id
                .toString()
                .slice(-6)} has been packed and is ready for shipping.`,
              meta: { orderId: orderToUpdate._id },
            });

            console.log(
              `[SHOP-AUTO-PROGRESS] ✅ Order ${orderToUpdate._id} → COMPLETED (packed)`
            );
          }
        } catch (error) {
          console.error(
            `[SHOP-AUTO-PROGRESS] Error marking order as completed:`,
            error
          );
        }
      }, 3000); // 3 seconds

      // Stage 2: Shipped - after 6 seconds (3 + 3)
      setTimeout(async () => {
        try {
          const orderToUpdate = await Order.findById(order._id).populate(
            "customerId",
            "username email"
          );
          if (orderToUpdate && orderToUpdate.status === "completed") {
            orderToUpdate.status = "shipped";
            orderToUpdate.shippedAt = new Date();
            orderToUpdate.timeline = orderToUpdate.timeline || [];
            orderToUpdate.timeline.push({
              status: "shipped",
              note: "Shop order shipped for delivery",
              at: new Date(),
            });
            await orderToUpdate.save();

            const Notification = require("../models/notification");
            await Notification.create({
              userId: orderToUpdate.customerId._id,
              title: "🚚 Order Shipped!",
              message: `Your order #${orderToUpdate._id
                .toString()
                .slice(-6)} is on its way to you!`,
              meta: { orderId: orderToUpdate._id },
            });

            console.log(
              `[SHOP-AUTO-PROGRESS] ✅ Order ${orderToUpdate._id} → SHIPPED`
            );
          }
        } catch (error) {
          console.error(
            `[SHOP-AUTO-PROGRESS] Error marking order as shipped:`,
            error
          );
        }
      }, 6000); // 6 seconds total

      // Stage 3: Delivered - after 9 seconds (3 + 3 + 3)
      setTimeout(async () => {
        try {
          const orderToUpdate = await Order.findById(order._id).populate(
            "customerId",
            "username email"
          );
          if (orderToUpdate && orderToUpdate.status === "shipped") {
            orderToUpdate.status = "delivered";
            orderToUpdate.deliveredAt = new Date();
            orderToUpdate.paymentStatus = "paid"; // Mark as paid when delivered
            orderToUpdate.timeline = orderToUpdate.timeline || [];
            orderToUpdate.timeline.push({
              status: "delivered",
              note: "Shop order delivered successfully - Payment confirmed",
              at: new Date(),
            });
            await orderToUpdate.save();

            const Notification = require("../models/notification");
            await Notification.create({
              userId: orderToUpdate.customerId._id,
              title: "✅ Order Delivered!",
              message: `Your order #${orderToUpdate._id
                .toString()
                .slice(
                  -6
                )} has been delivered successfully! Enjoy your purchase!`,
              meta: { orderId: orderToUpdate._id },
            });

            console.log(
              `[SHOP-AUTO-PROGRESS] ✅ Order ${orderToUpdate._id} → DELIVERED (complete)`
            );
          }
        } catch (error) {
          console.error(
            `[SHOP-AUTO-PROGRESS] Error marking order as delivered:`,
            error
          );
        }
      }, 9000); // 9 seconds total
    }

    // Remove wishlist items that were ordered
    const wishlistDesignIds = [];
    for (const item of cartItems) {
      if (
        item.customizationId.designId &&
        item.customizationId.designId.wishlist === true
      ) {
        wishlistDesignIds.push(item.customizationId.designId._id);
      }
    }

    if (wishlistDesignIds.length > 0) {
      await Design.deleteMany({
        _id: { $in: wishlistDesignIds },
        customerId: req.session.user.id,
        wishlist: true,
      });
      console.log(
        "[CHECKOUT] Removed",
        wishlistDesignIds.length,
        "wishlist items after order"
      );
    }

    // Send notification for shop orders (ready-made products only)
    if (isShopOrder) {
      const Notification = require("../models/notification");
      await Notification.create({
        userId: req.session.user.id,
        title: "✅ Shop Order Confirmed & In Production!",
        message: `Your ready-made product order #${order._id
          .toString()
          .slice(
            -6
          )} has been confirmed and is now being prepared. Total: ₹${orderTotalPrice.toFixed(
          2
        )}`,
        meta: { orderId: order._id },
      });
      console.log("[CHECKOUT] Notification sent for auto-approved shop order");
    } else {
      console.log(
        "[CHECKOUT] Custom design order pending manager assignment - no auto-approval"
      );
    }

    // Clear the user's cart
    cart.items = [];
    await cart.save();

    // Redirect with success message
    req.session.orderSuccess = {
      orderId: order._id,
      totalPrice: orderTotalPrice,
      itemCount: orderItems.length,
      isShopOrder: isShopOrder,
    };
    res.redirect("/customer/dashboard");
  } catch (error) {
    console.error(error);
    res.redirect("/customer/checkout");
  }
});

module.exports = router;
