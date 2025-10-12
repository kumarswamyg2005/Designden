# Manager Workflow Clarification

## Current System Analysis (October 12, 2025)

### Order Types and Approval Process

#### 1. **Shop Orders (Ready-Made Products)**

- **Source**: Customer buys from `/shop` (pre-made t-shirts)
- **Identification**: Has `productId` in Customization
- **Status Flow**: `pending` → **AUTO-APPROVED to `in_production`** → `completed` → `shipped` → `delivered`
- **Manager Action**: ❌ NO action needed (auto-approved)
- **Designer Assignment**: ❌ NOT required (ready-made products)
- **Badge in Manager Dashboard**: 🟦 "Auto-Approved" (blue badge)

#### 2. **3D Design Studio Orders (Custom Designs)**

- **Source**: Customer creates custom design in `/customer/design-studio`
- **Identification**: NO `productId` in Customization (only `customImage` with 3D design)
- **Status Flow**: `pending` → **MANAGER ASSIGNS DESIGNER** → `assigned` → `in_production` → `completed` → `shipped` → `delivered`
- **Manager Action**: ✅ **MUST assign to designer@designden.com**
- **Designer Assignment**: ✅ REQUIRED (custom fabrication needed)
- **Badge in Manager Dashboard**: 🟣 "Custom Design" (purple badge)

---

## Current Issue Reported

### User Request:

> "WHERE IS THE APPROVE OPTION IN MANAGER PAGE FOR 3D DESIGN STUDIO CHECK IT"

### Analysis:

**There is NO "Approve" button for 3D Design Studio orders - this is BY DESIGN.**

**Why?**

- **Shop orders** = Auto-approved (no human intervention)
- **Custom design orders** = Require **designer assignment** (not simple approval)

The workflow is:

1. Customer creates custom 3D design
2. Order status = `pending`
3. **Manager assigns designer** (not "approves")
4. Order status changes to `assigned`
5. Designer accepts → `in_production`
6. Designer completes → rest of flow

---

## Manager Dashboard Current State

### Pending Orders Table Actions:

```javascript
<% if (isCustomOrder) { %>
  <!-- Custom Design from 3D Studio -->
  <button class="btn btn-sm btn-primary assign-btn">
    <i class="fas fa-user-plus"></i> Assign Designer
  </button>
<% } else { %>
  <!-- Shop Product -->
  <span class="badge bg-info">
    <i class="fas fa-check-circle"></i> Auto-Approved
  </span>
<% } %>
```

### Order Type Detection:

```javascript
// Check if custom design order (no productId)
const isCustomOrder =
  order.items &&
  order.items.some(
    (item) => item.customizationId && !item.customizationId.productId
  );
```

---

## Routes Analysis

### Manager Routes (`routes/manager.js`)

#### 1. Assign Designer (POST `/manager/orders/:orderId/assign`)

- **Purpose**: Assign custom design order to designer
- **Effect**: Changes status from `pending` → `assigned`
- **Notifications**: Sends to designer AND customer
- **Used for**: 3D Design Studio orders

#### 2. Approve Order (POST `/manager/orders/:orderId/approve`)

- **Purpose**: Manually approve an order
- **Effect**: Changes status from `pending` → `in_production`
- **Current Usage**: ⚠️ NOT USED in dashboard UI (button doesn't exist)
- **JavaScript**: Has approve button listeners but buttons not rendered

#### 3. Reject Order (POST `/manager/orders/:orderId/reject`)

- **Purpose**: Cancel an order
- **Effect**: Changes status to `cancelled`
- **Current Usage**: ⚠️ NOT USED in dashboard UI

---

## Recommendation

### Option 1: Keep Current Design (RECOMMENDED)

**Rationale**: Current workflow is correct and logical.

**Actions**:

- ✅ Keep "Assign Designer" button for custom designs
- ✅ Keep "Auto-Approved" badge for shop orders
- ✅ Document that custom orders don't have "approve" - they have "assign"
- ❌ No code changes needed

**User Education**:

> "For 3D Design Studio orders, the manager **assigns** the designer instead of 'approving'. The designer then accepts and produces the custom item. Shop orders auto-approve and don't need assignment."

### Option 2: Add Manual Approval Button for Custom Designs

**Rationale**: Give manager control over which custom orders go to designer.

**Changes Needed**:

1. Add "Approve & Assign" button for custom orders
2. Change workflow: `pending` → `approved` (manager) → `assigned` (assign to designer) → `in_production`
3. Update dashboard to show both "Approve" and "Assign" buttons

**Downside**: Adds extra step that may not be needed.

### Option 3: Add Separate "Reject" Button

**Rationale**: Allow manager to reject custom designs before assignment.

**Changes Needed**:

1. Add "Reject" button next to "Assign Designer"
2. Update modal to have two actions: "Assign" or "Reject"
3. Route already exists: `/manager/orders/:orderId/reject`

---

## Current JavaScript in Dashboard

```javascript
// Line 407-428: Approve button handler (NOT USED - buttons don't exist)
document.querySelectorAll(".approve-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const id = btn.getAttribute("data-id");
    if (!confirm("Approve order and move to production?")) return;
    try {
      const res = await fetch("/manager/orders/" + id + "/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        alert("Order approved!");
        location.reload();
      } else {
        alert("Failed to approve order");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  });
});
```

**Issue**: JavaScript handler exists but `.approve-btn` buttons are never rendered in HTML.

---

## Proposed Solution

### Keep Current Workflow + Add Reject Option

**Manager Dashboard Updates**:

```html
<% if (isCustomOrder) { %>
<!-- Custom Design Actions -->
<div class="btn-group btn-group-sm" role="group">
  <button
    class="btn btn-primary assign-btn"
    data-order-id="<%= order._id %>"
    data-bs-toggle="modal"
    data-bs-target="#assignModal-<%= order._id %>"
  >
    <i class="fas fa-user-plus"></i> Assign Designer
  </button>
  <button class="btn btn-danger reject-btn" data-order-id="<%= order._id %>">
    <i class="fas fa-times"></i> Reject
  </button>
</div>
<% } else { %>
<!-- Shop Product Badge -->
<span class="badge bg-info">
  <i class="fas fa-check-circle"></i> Auto-Approved
</span>
<% } %>
```

**Add Reject Handler JavaScript**:

```javascript
document.querySelectorAll(".reject-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const id = btn.getAttribute("data-order-id");
    if (!confirm("Reject this custom design order? This cannot be undone."))
      return;

    try {
      const res = await fetch("/manager/orders/" + id + "/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        alert("Order rejected and customer notified");
        location.reload();
      } else {
        alert("Failed to reject order");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  });
});
```

---

## Summary

**Current State**:

- ✅ Shop orders auto-approve (correct)
- ✅ Custom design orders require designer assignment (correct)
- ❌ No "Approve" button for custom designs (this is intentional - they get assigned, not approved)
- ⚠️ Approve route exists but unused
- ⚠️ Reject route exists but unused

**User Confusion**:

- User expects "Approve" button for custom designs
- System uses "Assign Designer" instead (more accurate)

**Recommendation**: Keep current workflow, add reject button if needed, document that assignment replaces approval for custom orders.
