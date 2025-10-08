const mongoose = require("mongoose")

const cartItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Design",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("CartItem", cartItemSchema)
