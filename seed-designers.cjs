/**
 * Run: node seed-designers.cjs
 * Seeds/updates all sample designers directly to MongoDB Atlas.
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://kumaritsme1510_db_user:Password123!@designden.tyq15rx.mongodb.net/designden?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  approved: Boolean,
  contactNumber: String,
  twoFactorEnabled: { type: Boolean, default: false },
  designerProfile: mongoose.Schema.Types.Mixed,
}, { strict: false });

const User = mongoose.model("User", userSchema);

async function seedDesigners() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB Atlas");

  const sampleDesigners = [
    {
      email: "priya.designer@example.com",
      username: "priya_designer",
      name: "Priya Sharma",
      role: "designer",
      approved: true,
      contactNumber: "9876543210",
      designerProfile: {
        bio: "Award-winning fashion designer with 8 years of experience. Specializing in elegant ethnic wear and modern fusion designs that blend traditional craftsmanship with contemporary aesthetics.",
        specializations: ["Ethnic Wear", "Fusion", "Party Wear", "Bridal"],
        experience: 8,
        portfolio: [
          { imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop", title: "Bridal Lehenga" },
          { imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop", title: "Silk Saree" },
          { imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop", title: "Ethnic Kurta" },
        ],
        rating: 4.8, totalRatings: 156, completedOrders: 234,
        isAvailable: true, priceRange: { min: 1500, max: 5000 }, turnaroundDays: 5,
        badges: ["Top Rated", "Premium Designer", "Quick Delivery"],
      },
    },
    {
      email: "rahul.designer@example.com",
      username: "rahul_designer",
      name: "Rahul Verma",
      role: "designer",
      approved: true,
      contactNumber: "9876543211",
      designerProfile: {
        bio: "Creative streetwear designer focused on bold, unique styles. Expert in casual wear, T-shirt designs, and urban fashion that makes you stand out from the crowd.",
        specializations: ["T-Shirts", "Casual Wear", "Streetwear", "Hoodies"],
        experience: 5,
        portfolio: [
          { imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop", title: "Graphic Tees" },
          { imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop", title: "Street Style" },
          { imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop", title: "Hoodie Collection" },
        ],
        rating: 4.5, totalRatings: 89, completedOrders: 145,
        isAvailable: true, priceRange: { min: 800, max: 2500 }, turnaroundDays: 3,
        badges: ["Fast Delivery", "Rising Star", "Customer Favorite"],
      },
    },
    {
      email: "anita.designer@example.com",
      username: "anita_designer",
      name: "Anita Patel",
      role: "designer",
      approved: true,
      contactNumber: "9876543212",
      designerProfile: {
        bio: "Experienced tailor and formal wear specialist with precision fitting skills. Known for impeccable business attire, suits, and professional clothing that makes lasting impressions.",
        specializations: ["Formal Wear", "Business Attire", "Suits", "Dresses"],
        experience: 12,
        portfolio: [
          { imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop", title: "Executive Suits" },
          { imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=400&fit=crop", title: "Formal Dresses" },
          { imageUrl: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop", title: "Business Shirts" },
        ],
        rating: 4.9, totalRatings: 203, completedOrders: 312,
        isAvailable: true, priceRange: { min: 2000, max: 8000 }, turnaroundDays: 7,
        badges: ["Top Rated", "Expert Tailor", "Premium"],
      },
    },
    {
      email: "kiran.designer@example.com",
      username: "kiran_designer",
      name: "Kiran Reddy",
      role: "designer",
      approved: true,
      contactNumber: "9876543213",
      designerProfile: {
        bio: "Young and innovative designer pushing boundaries in sustainable fashion. Eco-friendly designs using organic fabrics and ethical production methods.",
        specializations: ["Sustainable Fashion", "Eco-Friendly", "Casual", "Kids Wear"],
        experience: 3,
        portfolio: [
          { imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop", title: "Organic Cotton" },
          { imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=400&fit=crop", title: "Kids Collection" },
          { imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop", title: "Eco Fashion" },
        ],
        rating: 4.3, totalRatings: 45, completedOrders: 67,
        isAvailable: true, priceRange: { min: 600, max: 2000 }, turnaroundDays: 4,
        badges: ["Eco Champion", "New Talent", "Quick Response"],
      },
    },
  ];

  const password = await bcrypt.hash("password123", 10);

  let created = 0, updated = 0;
  for (const d of sampleDesigners) {
    const existing = await User.findOne({ email: d.email });
    if (!existing) {
      await User.create({ ...d, password, twoFactorEnabled: false });
      console.log(`✅ Created: ${d.name}`);
      created++;
    } else {
      await User.updateOne(
        { email: d.email },
        { $set: { approved: true, role: "designer", designerProfile: d.designerProfile, name: d.name } }
      );
      console.log(`🔄 Updated: ${d.name}`);
      updated++;
    }
  }

  console.log(`\nDone — ${created} created, ${updated} updated`);
  await mongoose.disconnect();
  process.exit(0);
}

seedDesigners().catch((e) => { console.error(e); process.exit(1); });
