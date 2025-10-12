const assert = require("assert");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/user");
const Product = require("../models/product");
const Customization = require("../models/customization");
const Design = require("../models/design");
const Order = require("../models/order");
const Transaction = require("../models/transaction");

describe("Place Now E2E (simulated)", function () {
  this.timeout(20000);

  let user, product, customization, design, order, transaction;

  before(async () => {
    await connectDB();

    user = await User.findOne({ email: "test+autotest@example.com" });
    if (!user) {
      user = new User({
        username: "autotest",
        email: "test+autotest@example.com",
        password: "test1234",
        role: "customer",
        contactNumber: "+10000000000",
      });
      await user.save();
    }

    product = await Product.findOne();
    if (!product) throw new Error("No product found. Seed DB first.");
  });

  it("should create customization, design, order, and transaction", async () => {
    customization = new Customization({
      userId: user._id,
      productId: product._id,
      name: "E2E Test",
      fabric:
        product.fabrics && product.fabrics[0] ? product.fabrics[0] : "Cotton",
      color: "White",
      pattern: "Solid",
      size: "M",
      additionalNotes: "E2E automated",
    });
    await customization.save();

    design = new Design({
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

    const basePrice = product.price || 50;
    const totalPrice = basePrice * 1;
    order = new Order({
      customerId: user._id,
      designId: design._id,
      quantity: 1,
      deliveryAddress: "E2E Address",
      totalPrice,
      status: "Payment Due",
    });
    await order.save();

    transaction = new Transaction({
      orderId: order._id,
      userId: user._id,
      amount: totalPrice,
      currency: "INR",
      method: "cod",
      status: "pending",
    });
    await transaction.save();

    // Assertions
    const fetchedOrder = await Order.findById(order._id);
    const fetchedTransaction = await Transaction.findOne({
      orderId: order._id,
    });

    assert(fetchedOrder, "Order was not created");
    assert.strictEqual(String(fetchedOrder.customerId), String(user._id));
    assert(fetchedTransaction, "Transaction was not created");
    assert.strictEqual(fetchedTransaction.amount, totalPrice);
  });

  after(async () => {
    // Cleanup created docs to avoid polluting DB
    try {
      if (transaction) await Transaction.findByIdAndDelete(transaction._id);
      if (order) await Order.findByIdAndDelete(order._id);
      if (design) await Design.findByIdAndDelete(design._id);
      if (customization)
        await Customization.findByIdAndDelete(customization._id);
      // Note: Do not delete user/product since they may be shared
    } catch (e) {
      console.warn("Cleanup failed:", e.message);
    }
    mongoose.disconnect();
  });
});
