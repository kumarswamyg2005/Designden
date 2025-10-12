// Test script to verify add-to-cart functionality
const mongoose = require("mongoose");
const User = require("./models/user");
const Product = require("./models/product");
const Fabric = require("./models/fabric");
const Customization = require("./models/customization");
const Cart = require("./models/cart");

async function testAddToCart() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/design-den");
    console.log("✅ Connected to MongoDB");

    // Find a test user
    const user = await User.findOne({ role: "customer" });
    if (!user) {
      console.log("❌ No customer user found");
      return;
    }
    console.log("✅ Found user:", user.username);

    // Find a test product
    const product = await Product.findOne({ inStock: true });
    if (!product) {
      console.log("❌ No product found");
      return;
    }
    console.log("✅ Found product:", product.name);

    // Get or create default fabric
    let defaultFabric = await Fabric.findOne({ type: "Cotton" });
    if (!defaultFabric) {
      defaultFabric = new Fabric({
        name: "Default Cotton",
        type: "Cotton",
        pricePerMeter: 0,
        available: true,
      });
      await defaultFabric.save();
      console.log("✅ Created default fabric");
    } else {
      console.log("✅ Found default fabric:", defaultFabric.name);
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

    console.log("Creating customization with data:", {
      userId: user._id,
      fabricId: defaultFabric._id,
      size: "M",
      color: "Default",
      price: product.price,
    });

    await customization.save();
    console.log("✅ Customization created:", customization._id);

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
    console.log("✅ Cart saved with", cart.items.length, "items");

    // Verify
    const verifyCart = await Cart.findOne({ userId: user._id }).populate(
      "items.customizationId"
    );
    console.log("\n📦 Cart contents:");
    verifyCart.items.forEach((item, index) => {
      console.log(
        `  ${index + 1}. ${item.customizationId.customText} - Qty: ${
          item.quantity
        } - ₹${item.customizationId.price}`
      );
    });

    console.log("\n✅ TEST PASSED: Add to cart is working!");
  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}

testAddToCart();
