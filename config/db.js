const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use environment variable for MongoDB URI if available, otherwise use local MongoDB
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/designden";

    // Remove deprecated options - they're no longer needed in MongoDB driver v4+
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
