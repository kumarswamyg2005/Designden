const mongoose = require("mongoose");

const designTemplateSchema = new mongoose.Schema({
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: ["Hoodie", "Shirt", "T-Shirt", "Kurthi", "Jeans", "Dress", "Other"],
  },
  fabricId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fabric",
  },
  images: [
    {
      type: String, // Path to uploaded template image
    },
  ],
  basePrice: {
    type: Number,
    required: true,
    default: 0,
  },
  commissionRate: {
    type: Number,
    default: 5, // $5 per use as per spec
  },
  tags: [
    {
      type: String,
    },
  ],
  usageCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model("DesignTemplate", designTemplateSchema);
