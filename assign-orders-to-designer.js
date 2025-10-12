// Assign custom design orders to designers
const mongoose = require("mongoose");
const User = require("./models/user");
const Order = require("./models/order");
const Customization = require("./models/customization");

const connectDB = require("./config/db");

async function assignOrdersToDesigners() {
  try {
    await connectDB();

    console.log("\n🔄 Assigning custom design orders to designers...\n");

    // Get a designer
    const designer = await User.findOne({ role: "designer" });

    if (!designer) {
      console.log("❌ No designer found in database!");
      process.exit(1);
    }

    console.log(`✅ Found designer: ${designer.username || designer.email}`);

    // Get all orders and find custom design orders
    const allOrders = await Order.find().populate({
      path: "items.customizationId",
      model: "Customization",
    });

    let assignedCount = 0;

    for (const order of allOrders) {
      // Check if order has custom items (no productId)
      const hasCustomItems = order.items.some(
        (item) => item.customizationId && !item.customizationId.productId
      );

      if (hasCustomItems && !order.designerId) {
        // Assign to designer
        order.designerId = designer._id;

        // Add timeline entry
        order.timeline = order.timeline || [];
        order.timeline.push({
          status: order.status,
          note: `Order assigned to designer ${
            designer.username || designer.email
          }`,
          at: new Date(),
        });

        await order.save();
        assignedCount++;

        console.log(
          `✅ Assigned order ${order._id.toString().substring(0, 8)}... to ${
            designer.username || designer.email
          }`
        );
      }
    }

    console.log(`\n📊 Total custom orders assigned: ${assignedCount}`);

    if (assignedCount === 0) {
      console.log(
        "\n⚠️  No custom design orders to assign. Orders might already be assigned or don't exist."
      );
    }

    console.log("\n✅ Assignment completed!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error assigning orders:", error);
    process.exit(1);
  }
}

assignOrdersToDesigners();
