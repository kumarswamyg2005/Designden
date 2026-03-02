const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function fixManagerAccount() {
  try {
    await mongoose.connect("mongodb://localhost:27017/designden");
    console.log("✅ MongoDB connected");

    // Check if manager exists
    const manager = await mongoose.connection.db
      .collection("users")
      .findOne({ email: "manager@designden.com" });

    if (!manager) {
      console.log("❌ Manager account not found. Creating new account...");

      const hashedPassword = await bcrypt.hash("manager123", 10);

      await mongoose.connection.db.collection("users").insertOne({
        username: "manager",
        name: "Manager User",
        email: "manager@designden.com",
        password: hashedPassword,
        contactNumber: "1234567890",
        role: "manager",
        approved: true, // Important!
        twoFactorEnabled: false,
        addresses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("✅ Manager account created successfully");
      console.log("   Email: manager@designden.com");
      console.log("   Password: manager123");
    } else {
      console.log("✅ Manager account found");
      console.log("   Email:", manager.email);
      console.log("   Role:", manager.role);
      console.log("   Approved:", manager.approved);
      console.log("   Has password:", !!manager.password);

      // Test password
      const isPasswordValid = await bcrypt.compare(
        "manager123",
        manager.password,
      );
      console.log("   Password 'manager123' valid:", isPasswordValid);

      // Fix if needed
      let needsUpdate = false;
      const updates = {};

      if (!manager.approved) {
        console.log("⚠️  Manager is not approved. Fixing...");
        updates.approved = true;
        needsUpdate = true;
      }

      if (!isPasswordValid) {
        console.log("⚠️  Password doesn't match. Resetting to 'manager123'...");
        updates.password = await bcrypt.hash("manager123", 10);
        needsUpdate = true;
      }

      if (needsUpdate) {
        await mongoose.connection.db
          .collection("users")
          .updateOne({ email: "manager@designden.com" }, { $set: updates });
        console.log("✅ Manager account updated successfully");
      } else {
        console.log("✅ Manager account is correctly configured");
      }
    }

    // Also check and fix other accounts
    console.log("\n📋 Checking all test accounts...");

    const accounts = [
      {
        email: "admin@designden.com",
        password: "admin123",
        role: "admin",
        approved: true,
      },
      {
        email: "designer@designden.com",
        password: "designer123",
        role: "designer",
        approved: true,
      },
      {
        email: "delivery@designden.com",
        password: "delivery123",
        role: "delivery",
        approved: true,
      },
      {
        email: "customer@designden.com",
        password: "customer123",
        role: "customer",
        approved: true,
      },
    ];

    for (const account of accounts) {
      const user = await mongoose.connection.db
        .collection("users")
        .findOne({ email: account.email });

      if (!user) {
        console.log(`❌ ${account.role} not found, creating...`);
        const hashedPassword = await bcrypt.hash(account.password, 10);
        await mongoose.connection.db.collection("users").insertOne({
          username: account.role,
          name: `${account.role.charAt(0).toUpperCase() + account.role.slice(1)} User`,
          email: account.email,
          password: hashedPassword,
          contactNumber: "1234567890",
          role: account.role,
          approved: account.approved,
          twoFactorEnabled: false,
          addresses: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ ${account.role} account created`);
      } else {
        // Verify password and approved status
        const isPasswordValid = await bcrypt.compare(
          account.password,
          user.password,
        );
        const needsFix = !isPasswordValid || !user.approved;

        if (needsFix) {
          const updates = {};
          if (!isPasswordValid) {
            updates.password = await bcrypt.hash(account.password, 10);
          }
          if (!user.approved) {
            updates.approved = true;
          }

          await mongoose.connection.db
            .collection("users")
            .updateOne({ email: account.email }, { $set: updates });
          console.log(`✅ ${account.role} account fixed`);
        } else {
          console.log(`✅ ${account.role} account OK`);
        }
      }
    }

    console.log("\n✅ All test accounts are ready!");
    console.log("\n📝 Login Credentials:");
    console.log("   Admin:    admin@designden.com / admin123");
    console.log("   Manager:  manager@designden.com / manager123");
    console.log("   Designer: designer@designden.com / designer123");
    console.log("   Delivery: delivery@designden.com / delivery123");
    console.log("   Customer: customer@designden.com / customer123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

fixManagerAccount();
