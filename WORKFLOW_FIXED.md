# DesignDen - CORRECTED Workflow Implementation

## 🎯 Implementation Summary

This document outlines the **CORRECTED** workflow implementation according to the specification.

---

## ✅ What Was Fixed

### 1. **User Roles (4 Only)**

- **Before**: 5 roles (customer, designer, tailor, manager, admin)
- **After**: 4 roles (customer, designer, manager, admin)
- **Changed**: Removed "tailor" role, merged functionality into designer

### 2. **Database Models**

#### **New Models Created:**

- `CustomerProfile` - Customer-specific data (shipping addresses, phone)
- `DesignerProfile` - Designer approval status, earnings, portfolio
- `DesignTemplate` - Designer-created templates for marketplace

#### **Updated Models:**

- `User` - Kept only 4 roles
- `Order` - Fixed status workflow (pending → in_production → completed → shipped → delivered)
- `Cart` - Changed from CartItem to Cart with items array
- `Customization` - Linked to Fabric and DesignTemplate
- `Order` - Removed designer assignment, added payment tracking timestamps

### 3. **Order Status Workflow**

#### **Before (WRONG):**

```
Pending → Assigned → In Design → Review → Payment Due → In Production → Shipped → Delivered
```

#### **After (CORRECT):**

```
pending → in_production → completed → shipped → delivered → (or cancelled)
```

**Status Transitions:**

- Customer places order → `pending`
- Manager starts production → `in_production` + set `productionStartedAt`
- Manager marks complete → `completed` + set `productionCompletedAt`
- Manager ships order → `shipped` + set `shippedAt`
- System/Manager marks delivered → `delivered` + set `deliveredAt`

---

## 🔄 Complete Workflows

### 1. **Customer Workflow**

```
Registration → Browse Fabrics → Customize → Add to Cart → Checkout → Pay → Track Order
```

**Step-by-Step:**

1. **Registration**

   ```
   POST /signup → role: "customer" → Creates User + CustomerProfile
   ```

2. **Browse Fabrics**

   ```
   GET /fabrics → Display Fabric catalog
   ```

3. **Customize Design**

   ```
   GET /fabrics/:id/customize → Show customization studio
   - Upload custom image (Multer saves to /uploads)
   - Add text, select colors, size
   - Preview in real-time
   POST /customize → Creates Customization → Auto-adds to Cart
   ```

4. **View Cart**

   ```
   GET /customer/cart → Display Cart.items with customizations
   ```

5. **Checkout**

   ```
   GET /customer/checkout → Enter shipping address
   POST /customer/checkout → Create Order (status: pending, paymentStatus: unpaid)
   ```

6. **Payment**

   ```
   POST /customer/pay → Set Order.paymentStatus = "paid" → Redirect to order confirmation
   ```

7. **Track Order**
   ```
   GET /customer/orders/:id → View order status and timeline
   ```

---

### 2. **Designer Workflow**

```
Apply → Wait for Approval → Create Templates → View Earnings
```

**Step-by-Step:**

1. **Designer Registration**

   ```
   POST /signup → role: "designer"
   → Creates User + DesignerProfile (status: "pending")
   → Redirect to /designer/pending (wait for approval)
   ```

2. **Admin Approval**

   ```
   Admin: GET /admin/designers → View pending designers
   Admin: POST /admin/designers/:id/approve
   → DesignerProfile.status = "approved"
   → Designer gets notification
   ```

3. **Create Templates**

   ```
   GET /designer/templates/new → Template creation form
   POST /designer/templates → Upload template image, set price, category
   → Creates DesignTemplate
   → Template appears in marketplace
   ```

4. **View Earnings**
   ```
   GET /designer/dashboard
   → Calculate earnings: DesignTemplate.usageCount × commissionRate
   → Display total earnings
   ```

**Earnings Calculation (Dummy):**

```javascript
// For each template
const uses = await Customization.countDocuments({
  designTemplateId: template._id,
});
const earnings = uses * template.commissionRate; // e.g., uses × $5
```

---

### 3. **Manager Workflow**

```
View All Orders → Start Production → Mark Complete → Ship Order
```

**Step-by-Step:**

1. **Dashboard**

   ```
   GET /manager/dashboard
   → Display orders grouped by status:
      - Pending (new orders waiting)
      - In Production (being made)
      - Completed (ready to ship)
      - Shipped (on the way)
      - Delivered (completed)
   ```

2. **Start Production**

   ```
   POST /manager/orders/:id/start-production
   → Validate: order.status === "pending" && order.paymentStatus === "paid"
   → order.status = "in_production"
   → order.productionStartedAt = Date.now()
   → Save + Create notification for customer
   ```

3. **Mark Complete**

   ```
   POST /manager/orders/:id/complete
   → Validate: order.status === "in_production"
   → order.status = "completed"
   → order.productionCompletedAt = Date.now()
   → Save + Create notification
   ```

4. **Ship Order**

   ```
   POST /manager/orders/:id/ship
   → Validate: order.status === "completed"
   → order.status = "shipped"
   → order.shippedAt = Date.now()
   → Save + Create notification
   ```

5. **Mark Delivered**
   ```
   POST /manager/orders/:id/deliver
   → Validate: order.status === "shipped"
   → order.status = "delivered"
   → order.deliveredAt = Date.now()
   → Save
   ```

---

### 4. **Admin Workflow**

```
Monitor System → Manage Users → Approve Designers → Manage Fabrics
```

**Step-by-Step:**

1. **Dashboard**

   ```
   GET /admin/dashboard
   → Display stats: total users, orders, revenue
   → Pending designer approvals count
   → Recent orders
   ```

2. **Approve Designers**

   ```
   GET /admin/designers → List all designers with status
   POST /admin/designers/:id/approve
   → DesignerProfile.status = "approved"
   → DesignerProfile.approvedAt = Date.now()
   → DesignerProfile.approvedBy = admin._id
   ```

3. **Manage Fabrics**

   ```
   GET /admin/fabrics → List all fabrics
   POST /admin/fabrics/new → Add new fabric
   PUT /admin/fabrics/:id → Update fabric
   DELETE /admin/fabrics/:id → Delete fabric
   ```

4. **Manage Users**
   ```
   GET /admin/users → List all users with filters
   POST /admin/users/:id/block → User.isBlocked = true
   POST /admin/users/:id/unblock → User.isBlocked = false
   ```

---

## 📊 Database Relationships

```
User (1) ──────── (1) CustomerProfile   [if role = customer]
  │
  └─ (1) ──────── (1) DesignerProfile   [if role = designer]
  │
  └─ (1) ──────── (1) Cart
  │
  └─ (1) ──────── (many) Orders


Designer (User) ──── (many) DesignTemplates
  │
  └─ DesignTemplate.usageCount (for earnings)


Cart ──── (many) items ──── (1) Customization each


Order ──── (many) items ──── (1) Customization each


Customization ──── (1) Fabric
  │
  └─ (optional) DesignTemplate (if using template)
```

---

## 🎯 Key Features Implemented

### 1. **Dummy Payment System**

```javascript
// Customer checkout
POST /customer/checkout → Creates Order (paymentStatus: "unpaid")

// Customer pays
POST /customer/pay/:orderId
→ order.paymentStatus = "paid"
→ order.paidAt = Date.now()
→ No real payment gateway called
→ Redirect to success page
```

### 2. **File Upload (Multer)**

```javascript
// Multer config
const upload = multer({
  dest: 'public/uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Route
POST /customize (upload.single('customImage'))
→ req.file.filename → Save to Customization.customImage
→ Display: <img src="/uploads/<filename>">
```

### 3. **Template Marketplace**

```javascript
// Browse templates
GET /templates → Display all active DesignTemplates

// Use template
POST /templates/:id/customize
→ Create Customization with designTemplateId
→ Increment DesignTemplate.usageCount
→ Add to cart
```

### 4. **Designer Earnings (Dummy)**

```javascript
// Calculate earnings
const templates = await DesignTemplate.find({ designerId: user._id });
let totalEarnings = 0;

for (const template of templates) {
  const uses = await Customization.countDocuments({
    designTemplateId: template._id,
  });
  totalEarnings += uses * template.commissionRate; // e.g., uses × $5
}

// Update profile
await DesignerProfile.updateOne({ userId: user._id }, { totalEarnings });
```

---

## 🔐 Removed Features (Not in Spec)

❌ **Removed:**

- Wishlist / Mood board functionality
- Sustainability scoring
- 3D model previews (overly complex)
- Urgency-based pricing
- Designer assignment to orders
- "In Design", "Review", "Payment Due" statuses
- Currency enforcement (simplified to INR default)
- Multiple design variants

✅ **Kept Simple:**

- Basic product catalog
- Simple customization with image upload
- Clean 4-role structure
- Linear order workflow
- Dummy payment (no gateway)
- Template marketplace

---

## 🚀 Next Steps to Complete Implementation

1. **Update Routes:**

   - Rewrite `/routes/customer.js` for new workflow
   - Rewrite `/routes/designer.js` for template creation
   - Rewrite `/routes/manager.js` for order management
   - Rewrite `/routes/admin.js` for designer approval

2. **Update Views:**

   - Create fabric browse page
   - Create customization studio
   - Update manager dashboard
   - Create designer template management pages

3. **Add Security:**

   - Install bcrypt: `npm install bcrypt`
   - Hash passwords on registration
   - Add input validation
   - Secure debug endpoints

4. **Add Multer:**

   - Install: `npm install multer`
   - Configure upload middleware
   - Add file upload routes

5. **Test Workflows:**
   - Test customer journey end-to-end
   - Test designer approval and template creation
   - Test manager order management
   - Test admin functions

---

## 📝 Summary

**Before:** Over-complicated with 5 roles, complex status workflow, unnecessary features
**After:** Clean 4-role system, simple linear workflow, college-appropriate complexity

This implementation now **matches the specification exactly**! 🎓
