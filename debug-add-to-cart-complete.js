// Comprehensive Add-to-Cart Debug Script
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const Fabric = require("./models/fabric");
const Customization = require("./models/customization");

async function runDiagnostic() {
  try {
    console.log("🔍 ADD-TO-CART DIAGNOSTIC STARTING...\n");

    // 1. Database Connection
    console.log("1️⃣ Testing database connection...");
    await mongoose.connect("mongodb://localhost:27017/designden");
    console.log("✅ Database connected successfully\n");

    // 2. Check Products
    console.log("2️⃣ Checking products...");
    const productCount = await Product.countDocuments();
    const products = await Product.find({}, "name price inStock").limit(3);
    console.log(`   Found ${productCount} products`);
    products.forEach((p) => {
      console.log(`   - ${p.name}: $${p.price} (In Stock: ${p.inStock})`);
    });

    if (productCount === 0) {
      console.log("❌ NO PRODUCTS FOUND - This is the main issue!");
      return;
    }
    console.log("✅ Products available\n");

    // 3. Check Users
    console.log("3️⃣ Checking users...");
    const userCount = await User.countDocuments({ role: "customer" });
    const customers = await User.find(
      { role: "customer" },
      "email username"
    ).limit(3);
    console.log(`   Found ${userCount} customers`);
    customers.forEach((u) => {
      console.log(`   - ${u.email} (${u.username})`);
    });

    if (userCount === 0) {
      console.log("❌ NO CUSTOMERS FOUND - Need to create test customer!");
      return;
    }
    console.log("✅ Customers available\n");

    // 4. Test Fabric Creation
    console.log("4️⃣ Testing fabric creation...");
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
        console.log("✅ Created default fabric");
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate key, fabric already exists
          defaultFabric = await Fabric.findOne({ name: "Default Cotton" });
          console.log("✅ Default fabric exists (found after duplicate error)");
        } else {
          throw err;
        }
      }
    } else {
      console.log("✅ Default fabric exists");
    }

    // 5. Test Full Add-to-Cart Flow
    console.log("\n5️⃣ Testing full add-to-cart flow...");
    const testProduct = products[0];
    const testCustomer = customers[0];

    console.log(`   Using product: ${testProduct.name}`);
    console.log(`   Using customer: ${testCustomer.email}`);

    // Create customization
    const customization = new Customization({
      userId: testCustomer._id,
      fabricId: defaultFabric._id,
      designTemplateId: null,
      customImage:
        testProduct.images && testProduct.images.length > 0
          ? testProduct.images[0]
          : null,
      customText: `${testProduct.name}`,
      size: "M",
      color: "Default",
      price: testProduct.price,
    });

    await customization.save();
    console.log("✅ Customization created:", customization._id);

    // Find or create cart
    let cart = await Cart.findOne({ userId: testCustomer._id });

    if (!cart) {
      cart = new Cart({
        userId: testCustomer._id,
        items: [
          {
            customizationId: customization._id,
            quantity: 1,
          },
        ],
      });
      console.log("✅ Created new cart");
    } else {
      cart.items.push({
        customizationId: customization._id,
        quantity: 1,
      });
      console.log("✅ Added to existing cart");
    }

    await cart.save();
    console.log("✅ Cart saved successfully!");

    // Verify cart contents
    const savedCart = await Cart.findOne({ userId: testCustomer._id }).populate(
      "items.customizationId"
    );

    console.log(
      `✅ Cart verification: ${savedCart.items.length} items in cart`
    );

    console.log("\n🎉 ADD-TO-CART FLOW WORKS PERFECTLY!");
    console.log("\n📝 NEXT STEPS:");
    console.log("1. Make sure you are logged in as a customer");
    console.log("2. Go to /shop and select a product");
    console.log("3. Choose size and color");
    console.log('4. Click "Add to Cart"');
    console.log("\nLogin credentials:");
    console.log("Email: customer@designden.com");
    console.log("Password: customer123");
  } catch (error) {
    console.error("❌ DIAGNOSTIC ERROR:", error);
    console.log("\n🔧 POTENTIAL FIXES:");
    console.log("1. Check if MongoDB is running");
    console.log("2. Seed the database with products and users");
    console.log("3. Check route paths and middleware");
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runDiagnostic();
