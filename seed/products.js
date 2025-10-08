const mongoose = require("mongoose")
const Product = require("../models/product")
const connectDB = require("../config/db")

// Sample product data
const products = [
  // Men's Collection
  {
    name: "Classic Cotton Hoodie",
    description: "A comfortable cotton hoodie perfect for casual wear. Features a front pocket and adjustable hood.",
    category: "Hoodie",
    gender: "Men",
    price: 1299,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Gray", "Navy Blue", "Maroon", "Forest Green"],
    patterns: ["Solid", "Striped", "Color Block"],
    fabrics: ["Cotton", "Fleece", "Cotton-Polyester Blend"],
    images: ["/images/classic-hoodie.jpeg"],
    inStock: true,
    featured: true,
    customizable: true,
    modelPath: "/models/hoodie_men.glb",
  },
  {
    name: "Premium Denim Jeans",
    description: "High-quality denim jeans with a modern fit. Durable and stylish for everyday wear.",
    category: "Jeans",
    gender: "Men",
    price: 1499,
    sizes: ["30", "32", "34", "36"],
    colors: ["Blue", "Black", "Gray", "Light Blue"],
    patterns: ["Solid", "Distressed", "Faded"],
    fabrics: ["Denim", "Stretch Denim", "Raw Denim"],
    images: ["/images/denim-jeans.webp"],
    inStock: true,
    featured: false,
    customizable: true,
    modelPath: "/models/jeans_men.glb",
  },
  {
    name: "Formal Shirt",
    description: "Crisp formal shirt made from premium cotton. Perfect for office wear or formal occasions.",
    category: "Shirt",
    gender: "Men",
    price: 999,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Blue", "Black", "Light Blue", "Pink", "Lavender"],
    patterns: ["Solid", "Checkered", "Striped", "Dotted", "Herringbone"],
    fabrics: ["Cotton", "Linen", "Oxford", "Poplin", "Twill"],
    images: ["/images/casual-tshirt.jpeg"], // Using casual t-shirt as formal shirt reference
    inStock: true,
    featured: false,
    customizable: true,
    modelPath: "/models/shirt_men.glb",
  },
  {
    name: "Casual T-Shirt",
    description: "Comfortable and stylish t-shirt for casual wear. Made from soft cotton fabric.",
    category: "T-Shirt",
    gender: "Men",
    price: 599,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Red", "Blue", "Black", "White", "Gray", "Green", "Yellow"],
    patterns: ["Solid", "Graphic Print", "Striped", "Color Block"],
    fabrics: ["Cotton", "Jersey", "Pima Cotton", "Cotton-Polyester Blend"],
    images: ["/images/casual-tshirt.jpeg"],
    inStock: true,
    featured: true,
    customizable: true,
    modelPath: "/models/tshirt_men.glb",
  },
  {
    name: "Winter Hoodie",
    description: "Warm and cozy hoodie perfect for winter. Features a thick lining and adjustable hood.",
    category: "Hoodie",
    gender: "Men",
    price: 1599,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "Gray", "Green", "Blue", "Red"],
    patterns: ["Solid", "Camo", "Color Block"],
    fabrics: ["Fleece", "Sherpa", "Cotton-Polyester Blend"],
    images: ["/images/winter-hoodie.webp"],
    inStock: true,
    featured: false,
    customizable: true,
    modelPath: "/models/hoodie_men.glb",
  },
  {
    name: "Polo T-Shirt",
    description: "Classic polo t-shirt with a comfortable fit. Perfect for casual and semi-formal occasions.",
    category: "T-Shirt",
    gender: "Men",
    price: 799,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Navy", "White", "Black", "Red", "Green", "Yellow"],
    patterns: ["Solid", "Striped", "Color Block"],
    fabrics: ["Cotton Pique", "Jersey", "Cotton-Polyester Blend"],
    images: ["/images/polo t-shirt.jpg"],
    inStock: true,
    featured: true,
    customizable: true,
    modelPath: "/models/polo_men.glb",
  },

  // Women's Collection
  {
    name: "Elegant Kurthi",
    description: "Beautiful traditional kurthi with intricate embroidery. Perfect for special occasions.",
    category: "Kurthi",
    gender: "Women",
    price: 1899,
    sizes: ["S", "M", "L"],
    colors: ["Red", "Green", "Blue", "Yellow", "Pink", "Purple", "Teal"],
    patterns: ["Embroidered", "Printed", "Solid", "Floral", "Geometric"],
    fabrics: ["Cotton", "Silk", "Rayon", "Georgette", "Chiffon"],
    images: ["/images/kurthi.jpeg"],
    inStock: true,
    featured: true,
    customizable: true,
    modelPath: "/models/kurthi_women.glb",
  },
  {
    name: "Designer Dress",
    description: "Elegant designer dress for special occasions. Features a flattering cut and premium fabric.",
    category: "Dress",
    gender: "Women",
    price: 2499,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Red", "Navy", "Burgundy", "Emerald", "Royal Blue"],
    patterns: ["Solid", "Floral", "Sequined", "Lace"],
    fabrics: ["Satin", "Chiffon", "Crepe", "Velvet", "Lace"],
    images: ["/images/women-tshirt.jpeg"], // Using women's t-shirt as designer dress reference
    inStock: true,
    featured: true,
    customizable: true,
    modelPath: "/models/dress_women.glb",
  },
  {
    name: "Silk Kurthi",
    description: "Luxurious silk kurthi with traditional design. Perfect for festivals and celebrations.",
    category: "Kurthi",
    gender: "Women",
    price: 2199,
    sizes: ["S", "M", "L"],
    colors: ["Gold", "Red", "Green", "Blue", "Purple", "Pink"],
    patterns: ["Embroidered", "Zari Work", "Printed", "Brocade"],
    fabrics: ["Silk", "Art Silk", "Banarasi Silk", "Raw Silk"],
    images: ["/images/kurthi.jpeg"], // Using same kurthi image for silk kurthi
    inStock: true,
    featured: true,
    customizable: true,
    modelPath: "/models/kurthi_silk_women.glb",
  },
  {
    name: "Women's Hoodie",
    description: "Stylish and comfortable hoodie for women. Perfect for casual outings and lounging.",
    category: "Hoodie",
    gender: "Women",
    price: 1399,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Pink", "Lavender", "Gray", "Black", "White", "Blue"],
    patterns: ["Solid", "Graphic Print", "Color Block"],
    fabrics: ["Cotton", "Fleece", "French Terry"],
    images: ["/images/women-hoodie.webp"],
    inStock: true,
    featured: false,
    customizable: true,
    modelPath: "/models/hoodie_women.glb",
  },
  {
    name: "Women's T-Shirt",
    description: "Comfortable and stylish t-shirt for women. Made from soft, breathable fabric.",
    category: "T-Shirt",
    gender: "Women",
    price: 699,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Black", "Pink", "Blue", "Red", "Yellow", "Green"],
    patterns: ["Solid", "Graphic Print", "Striped", "Floral"],
    fabrics: ["Cotton", "Jersey", "Modal", "Cotton-Polyester Blend"],
    images: ["/images/women-tshirt.jpeg"],
    inStock: true,
    featured: true,
    customizable: true,
    modelPath: "/models/tshirt_women.glb",
  },
  {
    name: "Casual Jeans",
    description: "Comfortable and stylish jeans for women. Perfect for everyday wear.",
    category: "Jeans",
    gender: "Women",
    price: 1299,
    sizes: ["26", "28", "30", "32", "34"],
    colors: ["Blue", "Black", "Gray", "White"],
    patterns: ["Solid", "Distressed", "Ripped", "Faded"],
    fabrics: ["Denim", "Stretch Denim", "Skinny Denim"],
    images: ["/images/women-jeans.jpeg"],
    inStock: true,
    featured: false,
    customizable: true,
    modelPath: "/models/jeans_women.glb",
  },
]

// Function to seed the database
const seedProducts = async () => {
  try {
    // Connect to the database
    await connectDB()

    // Delete existing products
    await Product.deleteMany({})
    console.log("Deleted existing products")

    // Insert new products
    await Product.insertMany(products)
    console.log("Added sample products")

    // Disconnect from the database
    mongoose.disconnect()
    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seeding function
seedProducts()
