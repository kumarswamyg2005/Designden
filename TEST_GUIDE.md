# Quick Test Guide - Manager Assignment & Shop Orders

## ✅ Both Issues Fixed!

### Issue 1: Manager Assignment - FIXED ✅

### Issue 2: Shop Orders Auto-Approval - FIXED ✅

---

## 🧪 Test Scenario 1: Shop Order (Auto-Approved)

### Steps:

1. **Login as Customer**

   ```
   URL: http://localhost:3000/login
   Any customer account
   ```

2. **Browse Shop Products**

   ```
   URL: http://localhost:3000/shop
   Select any ready-made product (T-shirt, Hoodie, etc.)
   ```

3. **Add to Cart & Checkout**

   - Click "Add to Cart"
   - Go to cart
   - Click "Proceed to Checkout"
   - Enter delivery address
   - Click "Place Order"

4. **✅ Expected Result**:

   - Order placed successfully
   - Order status: **"in_production"** (automatic!)
   - Customer receives notification: "Order Confirmed & In Production!"
   - NO manager assignment needed

5. **Verify in Manager Dashboard**:
   ```
   Login: manager@designden.com / manager123
   URL: http://localhost:3000/manager/dashboard
   ```
   - Order shows with 🛍️ **"Shop Order"** badge (green)
   - Actions column shows **"Auto-Approved"** (NOT "Assign Designer")
   - Order NOT in "Pending Orders" section

---

## 🧪 Test Scenario 2: Custom Design Order (Needs Assignment)

### Steps:

1. **Login as Customer**

   ```
   URL: http://localhost:3000/login
   Any customer account
   ```

2. **Create Custom Design**

   ```
   URL: http://localhost:3000/customer/design-studio
   Create a 3D custom design
   Select fabric, color, size, add custom text/image
   ```

3. **Add to Cart & Checkout**

   - Click "Add to Cart"
   - Go to cart
   - Click "Proceed to Checkout"
   - Enter delivery address
   - Click "Place Order"

4. **✅ Expected Result**:

   - Order placed successfully
   - Order status: **"pending"** (waits for assignment)
   - Order appears in manager's "Pending Orders"

5. **Assign Designer (Manager)**:

   ```
   Login: manager@designden.com / manager123
   URL: http://localhost:3000/manager/dashboard
   ```

   - Find the order in "Pending Orders" section
   - Order shows with 🎨 **"Custom Design"** badge (blue)
   - Click **"Assign Designer"** button
   - Modal opens with designer selection
   - Select "Designer (designer@designden.com)"
   - Click "Assign Designer"

   **✅ Expected Result**:

   - Alert: "Designer assigned successfully!"
   - Page reloads
   - Order moves to "assigned" status
   - Order appears in designer's dashboard
   - Customer receives notification: "Order Assigned to Designer"

6. **Verify in Designer Dashboard**:
   ```
   Login: designer@designden.com / designer123
   URL: http://localhost:3000/designer/dashboard
   ```
   - Order appears in designer's order list
   - Status: "Assigned" (blue badge)
   - Click "View & Work" to see order details
   - Click "Accept Order" to start work

---

## 🧪 Test Scenario 3: Mixed Cart

### Steps:

1. **Add both shop product AND custom design to cart**

   - Add 1 shop product (e.g., T-shirt from shop)
   - Add 1 custom design (from design studio)
   - Checkout together

2. **✅ Expected Result**:
   - Order is treated as **custom order** (because it contains custom design)
   - Status: **"pending"**
   - Requires manager assignment
   - Shows as "Custom Design" in manager dashboard

---

## 🔍 What to Check

### In Manager Dashboard:

- [ ] Pending orders show "Type" column
- [ ] Shop orders have green "Shop Order" badge
- [ ] Custom orders have blue "Custom Design" badge
- [ ] Shop orders show "Auto-Approved" (no assign button)
- [ ] Custom orders show "Assign Designer" button
- [ ] Assignment modal works correctly
- [ ] Error messages show if assignment fails

### In Customer Dashboard:

- [ ] Shop orders immediately show "in_production" status
- [ ] Custom orders show "pending" until assigned
- [ ] Notifications received for both order types

### In Designer Dashboard:

- [ ] Only assigned custom orders appear
- [ ] Shop orders do NOT appear (they're auto-processed)
- [ ] Can accept, update progress, complete, and ship custom orders

---

## 🐛 Troubleshooting

### If Manager Assignment Fails:

1. Check browser console for errors (F12)
2. Verify designer@designden.com exists:
   ```bash
   node scripts/ensure-single-designer.js
   ```
3. Check server logs for error messages
4. Error should now show: "Failed to assign designer: [reason]"

### If Shop Orders Don't Auto-Approve:

1. Check if product has `productId` in customization
2. Check server logs for "[CHECKOUT]" messages
3. Verify order status in database
4. Check if notification was created

---

## 📊 Success Criteria

✅ **Manager Assignment Works**:

- Modal opens successfully
- Designer selection dropdown shows designer@designden.com
- Assignment completes without errors
- Success alert appears
- Order status changes to "assigned"
- Notifications sent to designer and customer

✅ **Shop Orders Auto-Approved**:

- Order automatically gets "in_production" status
- No manual assignment needed
- Customer receives immediate confirmation
- Order does NOT appear in "Pending Orders" for manager
- Timeline shows "auto-approved" message

---

## 🚀 Quick Commands

```bash
# Ensure only one designer exists
node scripts/ensure-single-designer.js

# Restart server
node app.js

# Access points
Manager: http://localhost:3000/manager/login
Designer: http://localhost:3000/designer/login
Customer: http://localhost:3000/login
Shop: http://localhost:3000/shop
Design Studio: http://localhost:3000/customer/design-studio
```

---

**Status**: ✅ Ready for Testing
**Server**: Running on http://localhost:3000
**Date**: October 12, 2025
