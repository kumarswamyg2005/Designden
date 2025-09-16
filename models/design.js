const mongoose = require("mongoose");

const designSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  productImage: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  fabric: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  pattern: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
    enum: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  additionalNotes: {
    type: String,
  },
  category: {
    type: String,
    default: "T-Shirt", // Default category for images
  },
  price: {
    type: Number,
    default: 1200,
    min: 0,
  },
  sustainabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  wishlist: {
    type: Boolean,
    default: false,
  },
  variantGroupId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Design", designSchema);
