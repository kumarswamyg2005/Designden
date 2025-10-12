# 🎯 Complete Async Operations Reference

## ✅ ALL ASYNC FLOWS IN YOUR APPLICATION

You have **10+ async operations** implemented! Here are the best ones to show:

---

## 🏆 TOP 3 RECOMMENDED FOR VIDEO DEMO

### ✅ **Flow 1: Shop Product Filtering** (BEST CHOICE)

**File:** `views/shop/index.ejs` (line 327)  
**Endpoint:** `GET /shop?category=X&gender=Y&size=Z`  
**Method:** Fetch API  
**Why Best:** Easiest to demo, visible loading spinner, clear DOM update

**Code:**

```javascript
fetch(`/shop?${params.toString()}`, {
  method: "GET",
  headers: { "X-Requested-With": "XMLHttpRequest" },
});
```

**Demo Steps:**

1. Open `/shop` page
2. Open DevTools → Network tab → Filter "Fetch/XHR"
3. Click "Women" filter
4. Show XHR request in Network tab
5. Show HTML response
6. Show products grid updating

---

### ✅ **Flow 2: Add to Cart** (BEST CHOICE)

**File:** `routes/customer.js` (line 615)  
**Endpoint:** `POST /customer/add-to-cart`  
**Method:** Fetch API + Form submission  
**Why Best:** Standard e-commerce flow, JSON response, cart updates

**Backend Code:**

```javascript
router.post("/add-to-cart", isCustomer, async (req, res) => {
  // Processes product/customization
  // Creates cart item
  // Returns JSON response
});
```

**Demo Steps:**

1. Navigate to product detail page
2. Click "Add to Cart"
3. Show POST request in Network tab
4. Show request payload (productId, customization)
5. Show JSON response
6. Show cart badge update

---

### ✅ **Flow 3: Wishlist Management** (GOOD CHOICE)

**File:** `views/customer/design-studio.ejs` (line 1158)  
**Endpoint:** `POST /customer/wishlist/add`  
**Method:** Fetch API with JSON  
**Why Best:** Clean AJAX, JSON payload, instant feedback

**Frontend Code:**

```javascript
const resp = await fetch("/customer/wishlist/add", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  body: JSON.stringify({
    /* design data */
  }),
});
```

**Demo Steps:**

1. Open design studio
2. Create/select a design
3. Click "Add to Wishlist"
4. Show POST request with JSON payload
5. Show JSON response
6. Show success message

---

## 🎯 ALTERNATIVE FLOWS (Also Available)

### Flow 4: Remove from Wishlist

**File:** `views/customer/dashboard.ejs` (line 165)  
**Endpoint:** `POST /customer/wishlist/remove`  
**Method:** Fetch API

```javascript
await fetch("/customer/wishlist/remove", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ designId: id }),
});
```

---

### Flow 5: Manager Order Approval

**File:** `views/manager/dashboard.ejs` (line 422)  
**Endpoint:** `POST /manager/orders/:id/reject`  
**Method:** Fetch API

```javascript
const res = await fetch("/manager/orders/" + orderId + "/reject", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});
```

---

### Flow 6: Manager Assign Order

**File:** `views/manager/dashboard.ejs` (line 454)  
**Endpoint:** `POST /manager/orders/:id/assign`  
**Method:** Fetch API

```javascript
const res = await fetch("/manager/orders/" + orderId + "/assign", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ designerId }),
});
```

---

### Flow 7: Product Stock Toggle

**File:** `views/manager/dashboard.ejs` (line 480)  
**Endpoint:** `POST /manager/products/:id/toggle-stock`  
**Method:** Fetch API

```javascript
const res = await fetch("/manager/products/" + productId + "/toggle-stock", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});
```

---

### Flow 8: Designer Accept Order

**File:** `views/designer/order-details.ejs` (line 712)  
**Endpoint:** `POST /designer/order/:id/accept`  
**Method:** Fetch API

```javascript
const res = await fetch(`/designer/order/${orderId}/accept`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});
```

---

### Flow 9: Designer Update Progress

**File:** `views/designer/order-details.ejs` (line 745)  
**Endpoint:** `POST /designer/order/:id/update-progress`  
**Method:** Fetch API

```javascript
const res = await fetch(`/designer/order/${orderId}/update-progress`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ progress: percentage }),
});
```

---

### Flow 10: Designer Mark Ready

**File:** `views/designer/order-details.ejs` (line 781)  
**Endpoint:** `POST /designer/order/:id/mark-ready`  
**Method:** Fetch API

---

## 📊 ASYNC FLOW COMPARISON

| Flow             | Visibility | Demo Ease  | Network Impact | User Role |
| ---------------- | ---------- | ---------- | -------------- | --------- |
| **Shop Filter**  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | GET Request    | Customer  |
| **Add to Cart**  | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | POST + JSON    | Customer  |
| **Wishlist Add** | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | POST + JSON    | Customer  |
| Wishlist Remove  | ⭐⭐⭐     | ⭐⭐⭐     | POST + JSON    | Customer  |
| Manager Approve  | ⭐⭐⭐     | ⭐⭐⭐     | POST           | Manager   |
| Designer Accept  | ⭐⭐⭐     | ⭐⭐⭐     | POST           | Designer  |
| Stock Toggle     | ⭐⭐       | ⭐⭐       | POST           | Manager   |

**Recommendation:** Use **Shop Filter**, **Add to Cart**, and **Wishlist Add** for video

---

## 🎬 HOW TO SHOW EACH FLOW IN VIDEO

### Network Tab Setup

1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Click **Network** tab
3. Filter by: **Fetch/XHR**
4. Check: **Preserve log** (to keep requests visible)
5. Click **Clear** (🚫 icon) before each demo

---

### For Each Flow, Show:

#### 1️⃣ **Request Details**

- Request URL
- Request Method (GET/POST)
- Request Headers
- Request Payload (if POST)

#### 2️⃣ **Response Details**

- Status Code (200 OK, 201 Created, etc.)
- Response Headers
- Response Body (JSON or HTML)
- Response Time

#### 3️⃣ **Frontend Update**

- DOM changes (products update, cart badge, etc.)
- Loading states (spinners, opacity)
- Success/error messages
- URL updates (if applicable)

---

## 🎯 VIDEO DEMO STRUCTURE (REFINED)

### Timestamps for 3 Async Flows:

**03:30–04:10 (40 sec) — Flow 1: Shop Filter**

- Action: Click "Women" filter
- Network: Show GET request to `/shop?gender=Women`
- Show: Request parameters, HTML response
- Show: Products grid updating without reload

**04:10–04:50 (40 sec) — Flow 2: Add to Cart**

- Action: Click "Add to Cart" on product
- Network: Show POST to `/customer/add-to-cart`
- Show: Request payload (productId, size, etc.)
- Show: JSON response `{success: true, message: "..."}`
- Show: Cart count updating

**04:50–05:30 (40 sec) — Flow 3: Wishlist**

- Action: Click "Add to Wishlist" in design studio
- Network: Show POST to `/customer/wishlist/add`
- Show: JSON request body (design data)
- Show: JSON response
- Show: Success notification

**05:30–06:00 (30 sec) — Wrap-up**

- Mention error handling (try-catch blocks)
- Mention loading states
- Mention all operations are asynchronous
- Mention MongoDB database operations

---

## 💡 PRO TIPS FOR NETWORK TAB DEMO

### Make Requests Stand Out:

1. **Slow down network** (DevTools → Network → Throttling → Slow 3G)

   - This makes loading spinners more visible
   - Shows async nature clearly

2. **Use color highlighting:**

   - XHR requests show in yellow/orange
   - Make sure only Fetch/XHR filter is on

3. **Zoom in on important parts:**

   - Right-click request → "Copy as fetch"
   - Show in console to explain

4. **Explain what you're showing:**
   - "This is the request being sent..."
   - "Here's the server response..."
   - "Notice the status is 200 OK..."

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: Network tab shows no requests

**Solution:**

- Clear cache (Cmd+Shift+R)
- Disable ad blockers
- Check "Preserve log" is ON
- Try different browser (Chrome recommended)

### Issue: Fetch fails during demo

**Solution:**

- Have backup screen recording ready
- Explain from code instead: "Here's what happens..."
- Show the backend route code

### Issue: Response is too large to show

**Solution:**

- Use **Preview** tab instead of **Response** tab
- Scroll to important parts only
- Mention "Response contains 50 products, here's a sample..."

---

## 📝 SCRIPT FOR ASYNC SECTION

```
"Now let's examine the asynchronous data handling using the browser's
Network tab. I have the Network tab filtered to show only AJAX requests.

[FLOW 1]
First, I'll apply a product filter. Watch the Network tab...
*Click Women filter*
Notice the XHR request to /shop with gender=Women as a parameter.
The server returns filtered products as HTML, which our JavaScript
parses and injects into the DOM - all without a page reload.

[FLOW 2]
Next, let's add a product to the cart.
*Click Add to Cart*
See the POST request to /customer/add-to-cart with the product details.
The server processes the request and returns JSON confirmation.
Notice the cart count updates instantly.

[FLOW 3]
Finally, saving a design to the wishlist.
*Click Add to Wishlist*
This sends a POST request with the design data as JSON.
The server saves to MongoDB and returns a success status.
All three flows demonstrate asynchronous communication with proper
error handling and user feedback."
```

---

## ✅ FINAL CHECKLIST FOR ASYNC DEMO

- [ ] DevTools Network tab open
- [ ] Filtered to Fetch/XHR only
- [ ] Preserve log enabled
- [ ] Network tab cleared before each demo
- [ ] Screen zoomed to make requests visible
- [ ] Three flows prepared and tested
- [ ] Backup plan if live demo fails
- [ ] Script memorized

---

**YOU HAVE EXCELLENT ASYNC IMPLEMENTATIONS! 🚀**

Your application has:

- ✅ Proper fetch API usage
- ✅ JSON request/response handling
- ✅ Error handling
- ✅ Loading states
- ✅ DOM updates
- ✅ Multiple async flows across different user roles

This will make an impressive video demo! 🎬
