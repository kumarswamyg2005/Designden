const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // Optional: assigned by manager for custom orders
  },
  items: [
    {
      customizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customization",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: [
      "pending",
      "assigned",
      "in_production",
      "completed",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid",
  },
  paidAt: {
    type: Date,
  },
  productionStartedAt: {
    type: Date,
  },
  productionCompletedAt: {
    type: Date,
  },
  shippedAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  // Timeline of status changes
  timeline: [
    {
      status: {
        type: String,
        required: true,
      },
      note: {
        type: String,
        default: "",
      },
      at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);
