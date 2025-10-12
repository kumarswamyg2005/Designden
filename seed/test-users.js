const mongoose = require("mongoose");
const User = require("../models/user");
const connectDB = require("../config/db");

async function seedTestUsers() {
  try {
    await connectDB();

    // Create test users for each role
    const testUsers = [
      {
        username: "admin",
        email: "admin@designden.com",
        password: "admin123", // In production, this should be hashed
        contactNumber: "1234567890",
        role: "admin",
        approved: true,
      },
      {
        username: "designer",
        email: "designer@designden.com",
        password: "designer123",
        contactNumber: "1234567891",
        role: "designer",
        approved: true,
      },
      {
        username: "manager",
        email: "manager@designden.com",
        password: "manager123",
        contactNumber: "1234567892",
        role: "manager",
        approved: true,
      },
      {
        username: "customer",
        email: "customer@designden.com",
        password: "customer123",
        contactNumber: "1234567893",
        role: "customer",
        approved: true,
      },
    ];

    // Delete existing test users
    await User.deleteMany({
      email: {
        $in: testUsers.map((u) => u.email),
      },
    });

    // Create new test users
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created test ${userData.role}: ${userData.email}`);
    }

    console.log("\n✅ Test users created successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin:    admin@designden.com / admin123");
    console.log("Designer: designer@designden.com / designer123");
    console.log("Manager:  manager@designden.com / manager123");
    console.log("Customer: customer@designden.com / customer123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding test users:", error);
    process.exit(1);
  }
}

seedTestUsers();
