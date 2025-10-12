// Debug script to test add-to-cart functionality
const mongoose = require("mongoose");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const Fabric = require("./models/fabric");
const Customization = require("./models/customization");

async function testAddToCart() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/design-den");
    console.log("Connected to MongoDB");

    // Find a test product
    const product = await Product.findOne();
    console.log("Test product:", product ? product.name : "No products found");

    // Find test user (customer)
    const user = await User.findOne({ role: "customer" });
    console.log("Test user:", user ? user.email : "No customer found");

    if (!product || !user) {
      console.log("Missing test data - product or user not found");
      process.exit(1);
    }

    // Check/create default fabric
    let defaultFabric = await Fabric.findOne({ type: "Cotton" });
    if (!defaultFabric) {
      defaultFabric = new Fabric({
        name: "Default Cotton",
        type: "Cotton",
        pricePerMeter: 0,
        available: true,
      });
      await defaultFabric.save();
      console.log("Created default fabric");
    }

    // Create customization
    const customization = new Customization({
      userId: user._id,
      fabricId: defaultFabric._id,
      designTemplateId: null,
      customImage:
        product.images && product.images.length > 0 ? product.images[0] : null,
      customText: `${product.name}`,
      size: "M",
      color: "Default",
      price: product.price,
    });

    await customization.save();
    console.log("Customization created:", customization._id);

    // Find or create cart
    let cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      cart = new Cart({
        userId: user._id,
        items: [
          {
            customizationId: customization._id,
            quantity: 1,
          },
        ],
      });
    } else {
      cart.items.push({
        customizationId: customization._id,
        quantity: 1,
      });
    }

    await cart.save();
    console.log("✅ Cart updated successfully!");
    console.log("Cart items count:", cart.items.length);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testAddToCart();
