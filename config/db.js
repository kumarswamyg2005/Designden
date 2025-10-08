const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    // Use environment variable for MongoDB URI if available, otherwise use local MongoDB
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/designden"

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
