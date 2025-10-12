const mongoose = require("mongoose");

const customerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  shippingAddresses: [
    {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      isDefault: { type: Boolean, default: false },
    },
  ],
  phone: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CustomerProfile", customerProfileSchema);
