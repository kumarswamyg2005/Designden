const mongoose = require("mongoose");

const customizationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fabricId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fabric",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    // If present, this is a shop order; if null, it's a custom design
  },
  designTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DesignTemplate",
    // Optional: customer can use a template or customize from scratch
  },
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Design",
    // Optional: track original design (including wishlist items) for cleanup
  },
  customImage: {
    type: String, // Path to uploaded custom image
  },
  customText: {
    type: String,
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
    enum: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "26",
      "28",
      "30",
      "32",
      "34",
      "36",
    ],
  },
  additionalNotes: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Customization", customizationSchema);
