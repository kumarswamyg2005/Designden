const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function seedUsers() {
  try {
    await mongoose.connect("mongodb://localhost:27017/designden");
    console.log("MongoDB Connected for seeding");

    const passwordHash = await bcrypt.hash("Admin@123", 10);

    const usersToSeed = [
      { email: "admin@designden.com", role: "admin", username: "admin", name: "System Admin" },
      { email: "manager@designden.com", role: "manager", username: "manager", name: "Production Manager" },
      { email: "designer@designden.com", role: "designer", username: "designer", name: "Lead Designer" },
      { email: "customer@designden.com", role: "customer", username: "customer", name: "Regular Customer" },
      { email: "delivery1@designden.com", role: "delivery", username: "delivery1", name: "Delivery Partner 1" },
    ];

    for (const u of usersToSeed) {
      const existing = await mongoose.connection.db.collection("users").findOne({ email: u.email });
      if (!existing) {
        await mongoose.connection.db.collection("users").insertOne({
          ...u,
          password: passwordHash,
          approved: true,
          twoFactorEnabled: false,
          createdAt: new Date(),
        });
        console.log(`✅ Seeded user: ${u.email}`);
      } else {
        await mongoose.connection.db.collection("users").updateOne(
          { email: u.email },
          { $set: { password: passwordHash, role: u.role, approved: true } }
        );
        console.log(`✅ Updated existing user: ${u.email}`);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seedUsers();
