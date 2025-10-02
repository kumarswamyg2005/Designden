const mongoose = require("mongoose");

// Modified by Harsha Vardhan - small reliability improvements for cart timestamps
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
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
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure updatedAt is refreshed on each save (keeps timestamps consistent)
cartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Export as both Cart and CartItem for backwards compatibility
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
// Also export as CartItem for backwards compatibility with existing routes
module.exports.CartItem = Cart;
