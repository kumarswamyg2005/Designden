const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/user");
const Product = require("../models/product");
const Customization = require("../models/customization");
const Design = require("../models/design");
const Order = require("../models/order");
const Transaction = require("../models/transaction");

async function run() {
  await connectDB();

  // Find or create a test customer
  let user = await User.findOne({ email: "test+autotest@example.com" });
  if (!user) {
    user = new User({
      username: "autotest",
      email: "test+autotest@example.com",
      password: "test1234",
      role: "customer",
      contactNumber: "+10000000000",
    });
    await user.save();
    console.log("Created test user:", user._id.toString());
  } else {
    console.log("Found test user:", user._id.toString());
  }

  // Pick a product
  const product = await Product.findOne();
  if (!product) {
    console.error("No product found in DB. Please seed products first.");
    process.exit(1);
  }
  console.log("Using product:", product.name, product._id.toString());

  // Create customization
  const customization = new Customization({
    userId: user._id,
    productId: product._id,
    name: "Auto Test Design",
    fabric:
      product.fabrics && product.fabrics[0] ? product.fabrics[0] : "Cotton",
    color: "White",
    pattern: "Solid",
    size: "M",
    additionalNotes: "Automated test",
  });
  await customization.save();
  console.log("Saved customization:", customization._id.toString());

  // Create design from customization
  const design = new Design({
    customerId: user._id,
    productId: product._id,
    productImage:
      product.images && product.images[0] ? product.images[0] : null,
    name: customization.name,
    fabric: customization.fabric,
    color: customization.color,
    pattern: customization.pattern,
    size: customization.size,
    additionalNotes: customization.additionalNotes,
    price: product.price,
  });
  await design.save();
  console.log("Saved design:", design._id.toString());

  // Create order (placeNow behavior)
  const basePrice = product.price || 50;
  const totalPrice = basePrice * 1;
  const order = new Order({
    customerId: user._id,
    designId: design._id,
    quantity: 1,
    deliveryAddress: "Test Address",
    totalPrice,
    status: "Payment Due",
  });
  await order.save();
  console.log("Created order:", order._id.toString());

  // Create transaction stub
  const transaction = new Transaction({
    orderId: order._id,
    userId: user._id,
    amount: totalPrice,
    currency: "INR",
    method: "cod",
    status: "pending",
  });
  await transaction.save();
  console.log("Created transaction:", transaction._id.toString());

  console.log("Done.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
