// Test designer database connection
const mongoose = require("mongoose");
const User = require("./models/user");
const Order = require("./models/order");
const Customization = require("./models/customization");

const connectDB = require("./config/db");

async function testDesignerConnection() {
  try {
    // Connect to database
    await connectDB();

    console.log("\n✅ Database connected successfully!\n");

    // Check for designer users
    const designers = await User.find({ role: "designer" });
    console.log(`📊 Designers in database: ${designers.length}`);
    designers.forEach((d) => {
      console.log(`  - ${d.username} (${d.email})`);
    });

    // Check for orders assigned to designers
    const designerOrders = await Order.find({
      designerId: { $exists: true, $ne: null },
    })
      .populate("customerId", "username")
      .populate("designerId", "username");

    console.log(`\n📦 Orders assigned to designers: ${designerOrders.length}`);
    if (designerOrders.length > 0) {
      designerOrders.forEach((order) => {
        console.log(
          `  - Order ${order._id.toString().substring(0, 8)}... assigned to ${
            order.designerId ? order.designerId.username : "Unknown"
          } (Status: ${order.status})`
        );
      });
    }

    // Check for custom design orders (no productId)
    const allOrders = await Order.find().populate({
      path: "items.customizationId",
      model: "Customization",
    });

    let customOrdersCount = 0;
    let shopOrdersCount = 0;

    allOrders.forEach((order) => {
      const hasCustomItems = order.items.some(
        (item) => item.customizationId && !item.customizationId.productId
      );
      if (hasCustomItems) {
        customOrdersCount++;
      } else {
        shopOrdersCount++;
      }
    });

    console.log(`\n🎨 Custom design orders: ${customOrdersCount}`);
    console.log(`🛒 Shop product orders: ${shopOrdersCount}`);
    console.log(`📊 Total orders: ${allOrders.length}`);

    // Check customizations
    const customizations = await Customization.find();
    const customDesigns = customizations.filter((c) => !c.productId);
    const shopCustomizations = customizations.filter((c) => c.productId);

    console.log(`\n✨ Customizations in database: ${customizations.length}`);
    console.log(`  - Custom designs (no productId): ${customDesigns.length}`);
    console.log(
      `  - Shop customizations (has productId): ${shopCustomizations.length}`
    );

    console.log("\n✅ Designer database connection test completed!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error testing designer connection:", error);
    process.exit(1);
  }
}

testDesignerConnection();
