const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Hoodie", "Shirt", "T-Shirt", "Kurthi", "Jeans", "Dress"],
  },
  gender: {
    type: String,
    required: true,
    enum: ["Men", "Women", "Unisex"],
  },
  price: {
    type: Number,
    required: true,
  },
  sizes: [
    {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "26", "28", "30", "32", "34", "36"],
    },
  ],
  colors: [
    {
      type: String,
    },
  ],
  patterns: [
    {
      type: String,
    },
  ],
  fabrics: [
    {
      type: String,
    },
  ],
  images: [
    {
      type: String,
    },
  ],
  inStock: {
    type: Boolean,
    default: true,
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  customizable: {
    type: Boolean,
    default: false,
  },
  modelPath: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Product", productSchema)
