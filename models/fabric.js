const mongoose = require("mongoose");

const fabricSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  pricePerMeter: { type: Number, default: 0 },
  sustainabilityScore: { type: Number, min: 0, max: 100, default: 50 },
  images: [{ type: String }],
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Fabric", fabricSchema);
