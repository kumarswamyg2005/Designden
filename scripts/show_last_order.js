const connectDB = require("../config/db");
const User = require("../models/user");
const Order = require("../models/order");
const Transaction = require("../models/transaction");

async function run() {
  await connectDB();

  const user = await User.findOne({ email: "test+autotest@example.com" });
  if (!user) {
    console.error("Test user not found. Run the test_place_now script first.");
    process.exit(1);
  }

  const order = await Order.findOne({ customerId: user._id }).sort({
    createdAt: -1,
  });
  if (!order) {
    console.error("No orders found for test user.");
    process.exit(1);
  }

  const transaction = await Transaction.findOne({ orderId: order._id }).sort({
    createdAt: -1,
  });

  console.log("Latest order for test user:");
  console.log(JSON.stringify(order.toObject(), null, 2));
  console.log("\nAssociated transaction:");
  console.log(
    JSON.stringify(transaction ? transaction.toObject() : {}, null, 2)
  );

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
