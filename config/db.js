const mongoose = require("mongoose");

// Track connection state to avoid multiple connections in serverless
let isConnected = false;

const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    console.log("MongoDB: Using existing connection");
    return;
  }

  try {
    // Use environment variable for MongoDB URI if available, otherwise use local MongoDB
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/designden";

    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    // Set mongoose options for better serverless compatibility
    mongoose.set("strictQuery", false);

    // Remove deprecated options - they're no longer needed in MongoDB driver v4+
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    isConnected = false;

    // In production (Vercel), log but don't exit
    if (process.env.NODE_ENV === "production") {
      console.error(
        "Failed to connect to MongoDB. Check MONGODB_URI environment variable."
      );
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
