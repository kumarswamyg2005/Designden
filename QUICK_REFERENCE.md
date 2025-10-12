# 🚀 DesignDen - Quick Reference Guide

## 📚 Documentation Files

1. **PROBLEMS_FOUND_SUMMARY.md** - Complete analysis of problems found and fixed
2. **WORKFLOW_FIXED.md** - Detailed workflow implementation guide
3. **IMPLEMENTATION_SUMMARY.md** - What needs to be done next
4. **This File** - Quick reference for developers

---

## ✅ What's Already Done

### **✔️ Database Models (100% Complete)**

- User model (4 roles only)
- CustomerProfile
- DesignerProfile
- DesignTemplate
- Order (correct statuses)
- Cart (correct structure)
- Customization (fabric-based)
- Fabric (already existed)
- Transaction, Notification, Feedback (already existed)

### **✔️ Security Utilities (100% Complete)**

- Password hashing (bcrypt)
- Input validation
- XSS prevention
- Timing-safe comparison
- File upload (Multer)

### **✔️ Dependencies (100% Complete)**

```bash
✅ bcrypt
✅ multer
```

### **✔️ Documentation (100% Complete)**

- Complete workflow documentation
- Implementation guide
- Problems analysis
- CodeRabbit security findings

---

## ⏳ What Needs Implementation

### **Priority 1: Authentication**

File: `routes/auth.js`

```javascript
// TODO: Update POST /signup
- Hash password with utils/password.hashPassword()
- Create CustomerProfile if role=customer
- Create DesignerProfile if role=designer (status=pending)

// TODO: Update POST /login
- Use utils/password.comparePassword() instead of plaintext
- Validate inputs with utils/validation
```

### **Priority 2: Customer Routes**

File: `routes/customer.js`

```javascript
// NEW Routes Needed:
GET  /fabrics                      // Browse fabric catalog
GET  /fabrics/:id/customize        // Customization studio
POST /fabrics/:id/customize        // Create customization → add to cart
GET  /customer/cart                // View cart
POST /customer/cart/remove/:id     // Remove from cart
GET  /customer/checkout            // Checkout page
POST /customer/checkout            // Create order
POST /customer/pay/:orderId        // Dummy payment
GET  /customer/orders              // Order history
GET  /customer/orders/:id          // Order details
```

### **Priority 3: Manager Routes**

File: `routes/manager.js`

```javascript
// REWRITE Needed:
GET  /manager/dashboard                     // Orders grouped by status
POST /manager/orders/:id/start-production  // pending → in_production
POST /manager/orders/:id/complete          // in_production → completed
POST /manager/orders/:id/ship              // completed → shipped
POST /manager/orders/:id/deliver           // shipped → delivered

// Must validate status transitions!
// Must use MongoDB transactions!
```

### **Priority 4: Designer Routes**

File: `routes/designer.js`

```javascript
// REWRITE Needed:
GET  /designer/pending                // Waiting for approval
GET  /designer/dashboard              // Earnings dashboard
GET  /designer/templates              // My templates
GET  /designer/templates/new          // Create template form
POST /designer/templates              // Create template
PUT  /designer/templates/:id          // Update template
DELETE /designer/templates/:id        // Delete template
```

### **Priority 5: Admin Routes**

File: `routes/admin.js`

```javascript
// ADD New Routes:
GET  /admin/designers                 // List all designers
POST /admin/designers/:id/approve     // Approve designer
POST /admin/designers/:id/reject      // Reject designer
GET  /admin/fabrics                   // Manage fabrics
POST /admin/fabrics                   // Add fabric
PUT  /admin/fabrics/:id               // Update fabric
DELETE /admin/fabrics/:id             // Delete fabric
```

---

## 📂 Directory Structure

```
design-den-main/
├── models/                     ✅ COMPLETE
│   ├── user.js                 ✅ Fixed (4 roles)
│   ├── customerProfile.js      ✅ New
│   ├── designerProfile.js      ✅ New
│   ├── designTemplate.js       ✅ New
│   ├── order.js                ✅ Fixed (correct statuses)
│   ├── cart.js                 ✅ Fixed (new structure)
│   ├── customization.js        ✅ Fixed (fabric-based)
│   └── fabric.js               ✅ Exists
│
├── utils/                      ✅ COMPLETE
│   ├── password.js             ✅ bcrypt utilities
│   ├── validation.js           ✅ Input validation
│   ├── security.js             ✅ Timing-safe comparison
│   └── upload.js               ✅ Multer config
│
├── routes/                     ⏳ NEEDS UPDATE
│   ├── auth.js                 ⏳ Add bcrypt
│   ├── customer.js             ⏳ Rewrite for fabric workflow
│   ├── designer.js             ⏳ Rewrite for templates
│   ├── manager.js              ⏳ Rewrite for order workflow
│   └── admin.js                ⏳ Add designer approval
│
├── views/                      ⏳ NEEDS UPDATE
│   ├── fabrics/                ⏳ Create (catalog, customize)
│   ├── customer/               ⏳ Update (cart, checkout, payment)
│   ├── designer/               ⏳ Create (templates, earnings)
│   └── manager/                ⏳ Update (dashboard)
│
├── seed/                       ⏳ NEEDS UPDATE
│   └── fabrics.js              ⏳ Create fabric seed data
│
└── public/uploads/             ✅ Created
```

---

## 🎯 Correct Order Statuses

```javascript
// ONLY THESE STATUSES (6 total):
const ORDER_STATUSES = {
  PENDING: 'pending',           // Customer placed order, waiting for payment
  IN_PRODUCTION: 'in_production', // Manager started production
  COMPLETED: 'completed',       // Production done, ready to ship
  SHIPPED: 'shipped',          // Order shipped
  DELIVERED: 'delivered',      // Order delivered
  CANCELLED: 'cancelled'       // Order cancelled
};

// Status Transitions:
pending → in_production (Manager only, if paid)
in_production → completed (Manager only)
completed → shipped (Manager only)
shipped → delivered (Manager only)
any → cancelled (Manager/Admin only)
```

---

## 🔑 Authentication Example

### **Signup (with bcrypt)**

```javascript
const { hashPassword } = require("../utils/password");
const {
  validateRequiredFields,
  sanitizeString,
} = require("../utils/validation");

router.post("/signup", async (req, res) => {
  // 1. Validate
  const validation = validateRequiredFields(req.body, [
    "username",
    "email",
    "password",
    "contactNumber",
  ]);
  if (!validation.valid) {
    return res.render("signup", {
      error: "Missing required fields",
      formData: req.body,
    });
  }

  // 2. Sanitize
  const username = sanitizeString(req.body.username, 50);
  const email = sanitizeString(req.body.email, 100);
  const password = req.body.password; // Don't sanitize password
  const role = req.body.role || "customer";

  // 3. Hash password
  const hashedPassword = await hashPassword(password);

  // 4. Create user
  const user = new User({
    username,
    email,
    password: hashedPassword, // HASHED!
    contactNumber: req.body.contactNumber,
    role,
  });
  await user.save();

  // 5. Create profile
  if (role === "customer") {
    await CustomerProfile.create({ userId: user._id });
  } else if (role === "designer") {
    await DesignerProfile.create({
      userId: user._id,
      status: "pending",
    });
  }

  // 6. Login user
  req.session.user = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  res.redirect(`/${role}/dashboard`);
});
```

### **Login (with bcrypt)**

```javascript
const { comparePassword } = require("../utils/password");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user
  const user = await User.findOne({
    $or: [{ email }, { username: email }],
  });

  if (!user) {
    return res.render("login", { error: "Invalid credentials" });
  }

  // 2. Compare password with bcrypt
  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    return res.render("login", { error: "Invalid credentials" });
  }

  // 3. Check designer approval
  if (user.role === "designer") {
    const profile = await DesignerProfile.findOne({ userId: user._id });
    if (profile.status !== "approved") {
      return res.redirect("/designer/pending");
    }
  }

  // 4. Login user
  req.session.user = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  res.redirect(`/${user.role}/dashboard`);
});
```

---

## 🛍️ Customer Workflow Example

### **Fabric Customization with Image Upload**

```javascript
const upload = require("../utils/upload");

router.post(
  "/fabrics/:id/customize",
  upload.single("customImage"),
  async (req, res) => {
    try {
      const fabric = await Fabric.findById(req.params.id);

      // Create customization
      const customization = new Customization({
        userId: req.session.user.id,
        fabricId: fabric._id,
        customImage: req.file ? req.file.filename : null, // Uploaded image
        customText: req.body.customText,
        color: req.body.color,
        size: req.body.size,
        price: fabric.pricePerMeter * 2, // Example pricing
      });
      await customization.save();

      // Add to cart
      let cart = await Cart.findOne({ userId: req.session.user.id });
      if (!cart) {
        cart = new Cart({ userId: req.session.user.id, items: [] });
      }

      cart.items.push({
        customizationId: customization._id,
        quantity: 1,
      });
      await cart.save();

      res.redirect("/customer/cart");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating customization");
    }
  }
);
```

---

## 👨‍💼 Manager Workflow Example

### **Start Production (with validation)**

```javascript
router.post("/orders/:id/start-production", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // VALIDATE
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        error: "Cannot start production",
        currentStatus: order.status,
      });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        error: "Order must be paid first",
      });
    }

    // UPDATE
    order.status = "in_production";
    order.productionStartedAt = new Date();
    await order.save();

    // NOTIFY
    await Notification.create({
      userId: order.customerId,
      title: "Production Started",
      message: `Your order #${order._id} is now in production!`,
      meta: { orderId: order._id },
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🎨 Designer Earnings Example

```javascript
router.get("/designer/dashboard", async (req, res) => {
  // Get designer's templates
  const templates = await DesignTemplate.find({
    designerId: req.session.user.id,
  });

  // Calculate earnings
  let totalEarnings = 0;
  const templatesWithEarnings = [];

  for (const template of templates) {
    // Count how many times template was used
    const usageCount = await Customization.countDocuments({
      designTemplateId: template._id,
    });

    const earnings = usageCount * template.commissionRate; // e.g., uses × $5
    totalEarnings += earnings;

    templatesWithEarnings.push({
      ...template.toObject(),
      usageCount,
      earnings,
    });
  }

  // Update profile
  await DesignerProfile.updateOne(
    { userId: req.session.user.id },
    { totalEarnings }
  );

  res.render("designer/dashboard", {
    user: req.session.user,
    templates: templatesWithEarnings,
    totalEarnings,
  });
});
```

---

## 🔒 Security Checklist

- [ ] All passwords hashed with bcrypt
- [ ] All inputs validated before use
- [ ] All user data escaped in views (XSS prevention)
- [ ] Debug endpoints restricted to development
- [ ] Token comparison uses timingSafeEqual
- [ ] File uploads validated (type, size)
- [ ] MongoDB transactions for atomic operations
- [ ] CSRF protection added
- [ ] Rate limiting on auth routes

---

## 🧪 Testing Workflow

```bash
# 1. Start server
node app.js

# 2. Test Customer Flow
1. Register as customer → Check CustomerProfile created
2. Browse fabrics → Check fabric list displays
3. Customize fabric → Upload image, check saved to /uploads
4. View cart → Check customization in cart
5. Checkout → Check order created (status=pending, paymentStatus=unpaid)
6. Pay → Check paymentStatus=paid
7. Track order → Check status updates

# 3. Test Designer Flow
1. Register as designer → Check DesignerProfile created (status=pending)
2. Try to create template → Should redirect to /designer/pending
3. Admin approves → Check status=approved
4. Create template → Upload image, check saved
5. Customer uses template → Check usageCount increments
6. Check earnings → Verify calculation (uses × $5)

# 4. Test Manager Flow
1. View dashboard → Check orders grouped by status
2. Try start production on unpaid order → Should fail
3. Start production on paid order → Check status changes
4. Complete → Check status transition
5. Ship → Check status transition
6. Deliver → Check status=delivered

# 5. Test Admin Flow
1. View pending designers → Check list
2. Approve designer → Check status updates
3. Manage fabrics → CRUD operations
4. Manage users → Block/unblock
```

---

## 📚 API Endpoints Reference

### **Authentication**

```
POST /signup          - Register new user
POST /login           - Login user
GET  /logout          - Logout user
```

### **Customer**

```
GET  /fabrics                    - Browse fabric catalog
GET  /fabrics/:id/customize      - Customization studio
POST /fabrics/:id/customize      - Create customization
GET  /customer/cart              - View cart
POST /customer/cart/remove/:id   - Remove from cart
GET  /customer/checkout          - Checkout page
POST /customer/checkout          - Create order
POST /customer/pay/:id           - Dummy payment
GET  /customer/orders            - Order history
GET  /customer/orders/:id        - Order details
```

### **Designer**

```
GET    /designer/pending          - Waiting for approval
GET    /designer/dashboard        - Earnings dashboard
GET    /designer/templates        - My templates
GET    /designer/templates/new    - Create template form
POST   /designer/templates        - Create template
PUT    /designer/templates/:id    - Update template
DELETE /designer/templates/:id    - Delete template
```

### **Manager**

```
GET  /manager/dashboard                  - Orders dashboard
POST /manager/orders/:id/start           - Start production
POST /manager/orders/:id/complete        - Mark complete
POST /manager/orders/:id/ship            - Ship order
POST /manager/orders/:id/deliver         - Mark delivered
```

### **Admin**

```
GET  /admin/dashboard              - Admin dashboard
GET  /admin/designers              - List all designers
POST /admin/designers/:id/approve  - Approve designer
POST /admin/designers/:id/reject   - Reject designer
GET  /admin/fabrics                - Manage fabrics
POST /admin/fabrics                - Add fabric
PUT  /admin/fabrics/:id            - Update fabric
DELETE /admin/fabrics/:id          - Delete fabric
```

---

## 🎓 Summary

### **Foundation:** ✅ 100% Complete

- Database models fixed
- Security utilities created
- Dependencies installed
- Documentation complete

### **Next Steps:** ⏳ Implementation

1. Update auth routes (bcrypt)
2. Rewrite customer routes
3. Rewrite manager routes
4. Rewrite designer routes
5. Update admin routes
6. Create/update views
7. Test workflows

**You now have everything you need to implement the corrected workflow!** 🚀
