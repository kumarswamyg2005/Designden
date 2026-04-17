const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function resetPasswords() {
  try {
    await mongoose.connect("mongodb://localhost:27017/designden");
    console.log("MongoDB connected");

    const unifiedPassword = "Admin@123";
    const newHash = await bcrypt.hash(unifiedPassword, 10);

    // All known demo users in this repository
    const demoEmails = [
      "admin@designden.com",
      "manager@designden.com",
      "designer@designden.com",
      "customer@designden.com",
      "delivery1@designden.com",
      "priya.designer@example.com",
      "rahul.designer@example.com",
      "anita.designer@example.com",
      "kiran.designer@example.com",
    ];

    let updated = 0;
    for (const email of demoEmails) {
      const result = await mongoose.connection.db.collection("users").updateOne(
        { email },
        {
          $set: {
            password: newHash,
            approved: true,
            twoFactorEnabled: false,
          },
        },
      );

      if (result.matchedCount > 0) {
        updated += 1;
        console.log(`✅ ${email} password reset to: ${unifiedPassword}`);
      } else {
        console.log(`ℹ️  ${email} not found (skipped)`);
      }
    }

    await mongoose.disconnect();
    console.log(`\nDone! Updated ${updated} account(s).`);
    console.log(`All reset accounts now use password: ${unifiedPassword}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

resetPasswords();
