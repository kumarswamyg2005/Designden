# 🔌 DesignDen - Complete API Documentation

**Version**: 1.0.0  
**Base URL (Production)**: https://backend-gw9o.onrender.com  
**Base URL (Development)**: http://localhost:5174  
**Protocol**: HTTPS (Production) / HTTP (Development)  
**Authentication**: Session-based (Express Session + Cookies)

---

## 📑 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Customer APIs](#customer-apis)
3. [Designer APIs](#designer-apis)
4. [Manager APIs](#manager-apis)
5. [Admin APIs](#admin-apis)
6. [Delivery APIs](#delivery-apis)
7. [Public/Shared APIs](#publicshared-apis)
8. [Error Codes](#error-codes)

---

## 🔐 Authentication APIs

### **POST /api/auth/login**

Login user with email/password and optional 2FA

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "twoFactorCode": "123456" // Optional, required if 2FA enabled
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "approved": true
  }
}
```

**Response (2FA Required):**

```json
{
  "success": false,
  "requires2FA": true,
  "message": "2FA code sent to your email"
}
```

---

### **POST /api/auth/signup**

Register new user account

**Request:**

```json
{
  "username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "contactNumber": "+91 9876543210",
  "role": "customer" // customer|designer|manager|delivery
}
```

**Response:**

```json
{
  "success": true,
  "message": "Signup successful. Awaiting approval for designer/manager roles.",
  "user": {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "approved": true
  }
}
```

---

### **POST /api/auth/logout**

Logout current user

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### **GET /api/auth/session**

Check current session status

**Response:**

```json
{
  "authenticated": true,
  "user": {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### **POST /api/auth/2fa/setup**

Enable 2FA for current user

**Response:**

```json
{
  "success": true,
  "message": "2FA verification code sent to your email",
  "method": "email"
}
```

---

### **POST /api/auth/2fa/verify**

Verify 2FA code to enable 2FA

**Request:**

```json
{
  "token": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

---

### **POST /api/auth/2fa/disable**

Disable 2FA for current user

**Request:**

```json
{
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

---

## 🛍️ Customer APIs

### **GET /customer/api/orders**

Get all orders for logged-in customer

**Response:**

```json
{
  "success": true,
  "orders": [
    {
      "_id": "65abc123...",
      "orderNumber": "DD-20260302-0001",
      "totalAmount": 1200,
      "status": "in_production",
      "orderType": "custom",
      "items": [...],
      "createdAt": "2026-03-02T10:30:00Z"
    }
  ]
}
```

---

### **GET /customer/order/:id**

Get specific order details

**Response:**

```json
{
  "success": true,
  "order": {
    "_id": "65abc123...",
    "orderNumber": "DD-20260302-0001",
    "status": "in_production",
    "items": [...],
    "timeline": [...],
    "designFiles": [...],
    "progressPercentage": 62
  }
}
```

---

### **GET /api/customer/cart**

Get shopping cart for current user

**Response:**

```json
{
  "success": true,
  "cart": {
    "_id": "65cart123...",
    "userId": "65abc123...",
    "items": [
      {
        "_id": "item123",
        "productId": {
          "name": "Cotton T-Shirt",
          "price": 500
        },
        "quantity": 2,
        "size": "M",
        "color": "Blue"
      }
    ],
    "updatedAt": "2026-03-02T10:30:00Z"
  }
}
```

---

### **POST /api/customer/cart**

Add item to cart

**Request:**

```json
{
  "productId": "65prod123...", // OR designId
  "designId": null,
  "quantity": 1,
  "size": "M",
  "color": "Blue"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item added to cart",
  "cart": {
    /* updated cart */
  }
}
```

---

### **PUT /api/customer/cart/:itemId**

Update cart item quantity

**Request:**

```json
{
  "quantity": 3
}
```

**Response:**

```json
{
  "success": true,
  "message": "Cart updated",
  "cart": {
    /* updated cart */
  }
}
```

---

### **DELETE /api/customer/cart/:itemId**

Remove item from cart

**Response:**

```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### **POST /customer/api/process-checkout**

Process checkout and create order

**Request:**

```json
{
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  },
  "paymentMethod": "card", // card|upi|netbanking|cod
  "items": [
    {
      "productId": "65prod123...",
      "quantity": 1,
      "size": "M",
      "color": "Blue",
      "price": 500
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "65order123...",
    "orderNumber": "DD-20260302-0001",
    "totalAmount": 1200,
    "status": "pending"
  }
}
```

---

### **POST /customer/design-studio**

Create custom design

**Request:**

```json
{
  "name": "My Custom T-Shirt",
  "category": "T-Shirt",
  "gender": "Men",
  "fabric": "Cotton",
  "color": "#FFFFFF",
  "pattern": "Solid",
  "size": "M",
  "graphic": "dragon1.png",
  "customText": "",
  "estimatedPrice": 1200,
  "previewImage": "data:image/png;base64,..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Design created successfully",
  "design": {
    "_id": "65design123...",
    "name": "My Custom T-Shirt",
    "estimatedPrice": 1200
  }
}
```

---

### **GET /customer/wishlist/list**

Get user wishlist

**Response:**

```json
{
  "success": true,
  "wishlist": [
    {
      "_id": "65wish123...",
      "productId": {
        "name": "Silk Dress",
        "price": 3000,
        "images": [...]
      },
      "addedAt": "2026-03-01T15:00:00Z"
    }
  ]
}
```

---

### **POST /customer/wishlist/add**

Add item to wishlist

**Request:**

```json
{
  "productId": "65prod123...", // OR designId
  "designId": null
}
```

**Response:**

```json
{
  "success": true,
  "message": "Added to wishlist"
}
```

---

### **PUT /api/orders/:orderId/design/customer-approve**

Customer approves design submitted by designer

**Response:**

```json
{
  "success": true,
  "message": "Design approved successfully",
  "order": {
    /* updated order */
  }
}
```

---

### **PUT /api/orders/:orderId/design/customer-reject**

Customer rejects design and requests revision

**Request:**

```json
{
  "reason": "Sleeves need to be longer"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Design rejected. Designer notified.",
  "order": {
    /* updated order */
  }
}
```

---

## 🎨 Designer APIs

### **GET /designer/api/orders**

Get all orders assigned to designer

**Response:**

```json
{
  "success": true,
  "orders": [
    {
      "_id": "65order123...",
      "orderNumber": "DD-20260302-0001",
      "status": "designer_accepted",
      "userId": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [...],
      "designProgress": 0
    }
  ]
}
```

---

### **POST /designer/order/:id/accept**

Accept assigned order

**Response:**

```json
{
  "success": true,
  "message": "Order accepted successfully",
  "order": {
    "status": "designer_accepted"
  }
}
```

---

### **POST /designer/order/:id/reject**

Reject assigned order

**Request:**

```json
{
  "reason": "Too complex for current workload"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order rejected. Manager notified."
}
```

---

### **PUT /api/orders/:orderId/design/progress**

Update design progress

**Request:**

```json
{
  "progress": 50,
  "note": "Initial concept completed"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Progress updated",
  "order": {
    "designProgress": 50
  }
}
```

---

### **PUT /api/orders/:orderId/design/submit**

Submit design for customer approval

**Request:**

```json
{
  "notes": "Design completed as per requirements",
  "files": [
    {
      "url": "data:image/png;base64,...",
      "name": "design_front.png",
      "type": "image"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Design submitted for customer approval",
  "order": {
    "status": "design_pending_customer_approval"
  }
}
```

---

### **GET /api/designer/profile**

Get designer profile

**Response:**

```json
{
  "success": true,
  "designer": {
    "_id": "65designer123...",
    "name": "Sarah Designer",
    "email": "sarah@example.com",
    "designerProfile": {
      "bio": "Fashion designer with 5 years experience",
      "specializations": ["T-Shirts", "Ethnic Wear"],
      "experience": 5,
      "rating": 4.8,
      "completedOrders": 120,
      "isAvailable": true,
      "availabilityStatus": "available",
      "designFee": 500
    }
  }
}
```

---

### **PUT /api/designer/profile**

Update designer profile

**Request:**

```json
{
  "designerProfile": {
    "bio": "Updated bio",
    "specializations": ["T-Shirts", "Hoodies", "Ethnic Wear"],
    "designFee": 600
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### **PUT /api/designer/availability**

Update availability status

**Request:**

```json
{
  "status": "busy", // available|busy|not_accepting
  "isAvailable": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Availability updated"
}
```

---

### **GET /api/designer/earnings**

Get earnings summary

**Response:**

```json
{
  "success": true,
  "earnings": {
    "totalEarnings": 45000,
    "availableForPayout": 32000,
    "pendingEarnings": 13000,
    "completedPayouts": 150000,
    "designerRate": 50,
    "details": [...]
  }
}
```

---

### **POST /api/designer/payout/request**

Request payout

**Request:**

```json
{
  "amount": 30000,
  "upiId": "designer@upi"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payout request submitted",
  "request": {
    "_id": "65payout123...",
    "amount": 30000,
    "status": "pending"
  }
}
```

---

## 📋 Manager APIs

### **GET /manager/api/orders**

Get all orders (manager view)

**Response:**

```json
{
  "success": true,
  "orders": [
    {
      "_id": "65order123...",
      "orderNumber": "DD-20260302-0001",
      "status": "pending",
      "orderType": "custom",
      "userId": {...},
      "designerId": null,
      "deliveryPersonId": null,
      "totalAmount": 1200
    }
  ]
}
```

---

### **POST /manager/order/:id/assign**

Assign order to designer

**Request:**

```json
{
  "designerId": "65designer123..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order assigned to designer",
  "order": {
    "status": "assigned_to_designer",
    "designerId": "65designer123..."
  }
}
```

---

### **POST /manager/order/:id/assign-delivery**

Assign order to delivery person

**Request:**

```json
{
  "deliveryPersonId": "65delivery123...",
  "deliverySlot": {
    "date": "2026-03-05",
    "timeSlot": "9AM-12PM"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Delivery assigned",
  "order": {
    "deliveryPersonId": "65delivery123...",
    "deliveryOTP": {
      "code": "1234"
    }
  }
}
```

---

### **PUT /api/orders/:orderId/design/approve**

Approve designer submitted design

**Response:**

```json
{
  "success": true,
  "message": "Design approved. Production can begin.",
  "order": {
    "status": "design_approved"
  }
}
```

---

### **PUT /api/orders/:orderId/design/reject**

Reject design and request revision

**Request:**

```json
{
  "reason": "Color doesn't match requirements"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Design rejected. Designer notified.",
  "order": {
    "status": "design_rejected"
  }
}
```

---

### **PUT /api/orders/:orderId/production/start**

Start production phase

**Response:**

```json
{
  "success": true,
  "message": "Production started",
  "order": {
    "status": "in_production",
    "productionStartedAt": "2026-03-02T10:00:00Z"
  }
}
```

---

### **PUT /api/orders/:orderId/production/progress**

Update production milestone

**Request:**

```json
{
  "progressPercentage": 50,
  "currentMilestone": "Stitching",
  "notes": "Halfway through stitching"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Production progress updated",
  "order": {
    "progressPercentage": 50,
    "status": "production_milestone"
  }
}
```

---

### **PUT /api/orders/:orderId/production/complete**

Mark production as complete

**Response:**

```json
{
  "success": true,
  "message": "Production completed",
  "order": {
    "status": "production_completed",
    "progressPercentage": 100
  }
}
```

---

### **GET /manager/api/designers**

Get available designers

**Response:**

```json
{
  "success": true,
  "designers": [
    {
      "_id": "65designer123...",
      "name": "Sarah Designer",
      "designerProfile": {
        "rating": 4.8,
        "completedOrders": 120,
        "availabilityStatus": "available",
        "specializations": ["T-Shirts", "Ethnic Wear"]
      }
    }
  ]
}
```

---

## 👨‍💼 Admin APIs

### **GET /admin/api/orders**

Get all orders (admin view)

**Response:**

```json
{
  "success": true,
  "orders": [...],
  "stats": {
    "total": 342,
    "pending": 45,
    "completed": 250,
    "cancelled": 12
  }
}
```

---

### **GET /admin/api/users**

Get all users

**Query Parameters:**

- `role`: Filter by role (customer|designer|manager|delivery)

**Response:**

```json
{
  "success": true,
  "users": [
    {
      "_id": "65user123...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "approved": true,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

---

### **GET /admin/api/analytics**

Get analytics dashboard data

**Response:**

```json
{
  "success": true,
  "analytics": {
    "revenue": {
      "total": 250000,
      "thisMonth": 45000,
      "growth": 15
    },
    "orders": {
      "total": 342,
      "thisMonth": 68,
      "growth": 22
    },
    "users": {
      "customers": 156,
      "designers": 28,
      "managers": 5
    }
  }
}
```

---

### **POST /admin/api/approve-designer**

Approve designer registration

**Request:**

```json
{
  "userId": "65designer123..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Designer approved"
}
```

---

### **GET /admin/api/feedbacks**

Get all customer feedbacks

**Response:**

```json
{
  "success": true,
  "feedbacks": [
    {
      "_id": "65feedback123...",
      "userId": {...},
      "rating": 5,
      "comment": "Excellent service!",
      "createdAt": "2026-03-01T12:00:00Z"
    }
  ]
}
```

---

## 🚚 Delivery APIs

### **GET /delivery/api/orders**

Get assigned delivery orders

**Response:**

```json
{
  "success": true,
  "orders": [
    {
      "_id": "65order123...",
      "orderNumber": "DD-20260302-0001",
      "status": "out_for_delivery",
      "shippingAddress": {...},
      "deliveryOTP": {
        "code": "1234"
      }
    }
  ]
}
```

---

### **POST /delivery/order/:id/verify-otp**

Verify OTP for delivery

**Request:**

```json
{
  "otp": "1234"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP verified. Order delivered.",
  "order": {
    "status": "delivered",
    "deliveredAt": "2026-03-02T15:30:00Z"
  }
}
```

---

## 🌐 Public/Shared APIs

### **GET /api/shop/products**

Get all shop products

**Query Parameters:**

- `category`: Filter by category
- `gender`: Filter by gender (Men/Women)
- `featured`: Only featured products (true/false)

**Response:**

```json
{
  "success": true,
  "products": [
    {
      "_id": "65prod123...",
      "name": "Cotton T-Shirt",
      "description": "Premium cotton t-shirt",
      "price": 500,
      "category": "T-Shirt",
      "gender": "Men",
      "inStock": true,
      "images": [...],
      "featured": true
    }
  ]
}
```

---

### **GET /api/designers**

Get designer marketplace

**Response:**

```json
{
  "success": true,
  "designers": [
    {
      "_id": "65designer123...",
      "name": "Sarah Designer",
      "designerProfile": {
        "rating": 4.8,
        "completedOrders": 120,
        "specializations": ["T-Shirts"],
        "designFee": 500
      }
    }
  ]
}
```

---

### **GET /api/products/:productId/reviews**

Get product reviews

**Response:**

```json
{
  "success": true,
  "reviews": [
    {
      "_id": "65review123...",
      "userId": {...},
      "rating": 5,
      "title": "Excellent quality",
      "comment": "Love the fabric!",
      "verified": true,
      "helpful": ["user1", "user2"],
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ],
  "stats": {
    "average": 4.6,
    "total": 45
  }
}
```

---

### **POST /api/products/:productId/reviews**

Add product review

**Request:**

```json
{
  "rating": 5,
  "title": "Great product",
  "comment": "Exceeded expectations!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Review added successfully",
  "review": {...}
}
```

---

## ❌ Error Codes

| Code | Message               | Description                |
| ---- | --------------------- | -------------------------- |
| 400  | Bad Request           | Invalid request parameters |
| 401  | Unauthorized          | Not authenticated          |
| 403  | Forbidden             | Insufficient permissions   |
| 404  | Not Found             | Resource not found         |
| 409  | Conflict              | Duplicate resource         |
| 422  | Validation Error      | Invalid data format        |
| 429  | Too Many Requests     | Rate limit exceeded        |
| 500  | Internal Server Error | Server error               |

### **Error Response Format**

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message"
  }
}
```

---

**API Version**: 1.0  
**Last Updated**: March 2, 2026  
**Support**: kumaritsme1510@gmail.com
