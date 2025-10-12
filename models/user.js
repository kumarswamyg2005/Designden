const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "designer", "manager", "admin"],
    default: "customer",
  },
  // Deprecated: Use DesignerProfile.status instead for designers
  // Kept for backward compatibility with manager approvals
  approved: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
