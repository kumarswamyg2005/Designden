# 🎨 DesignDen - Wireframes & UI Documentation

**Project**: DesignDen - Custom Clothing E-Commerce Platform  
**UI Framework**: Bootstrap 5.3.8 + Custom CSS  
**Design System**: Material Design Inspired  
**Responsive**: Mobile-First Approach

---

## 📱 Screen Layouts

### **1. Home Page (Landing)**

```
╔════════════════════════════════════════════════════════════════════╗
║  [DesignDen Logo]          [Home] [Shop] [Marketplace] [Login]    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║                 CONNECT WITH TALENTED DESIGNERS                    ║
║                                                                    ║
║         Browse hundreds of skilled freelance fashion designers     ║
║           ready to bring your custom clothing vision to life       ║
║                                                                    ║
║    [Browse Designers]  [Create a Design]  [Join as Designer]      ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║                   WHY CHOOSE OUR MARKETPLACE?                      ║
║                                                                    ║
║   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        ║
║   │  [👥]   │  │  [💰]   │  │  [⭐]   │  │  [🔒]   │        ║
║   │ Talented │  │   Fair   │  │ Quality  │  │  Secure  │        ║
║   │Designers │  │  Pricing │  │Guaranteed│  │ Payments │        ║
║   └──────────┘  └──────────┘  └──────────┘  └──────────┘        ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║                      HOW IT WORKS                                  ║
║                                                                    ║
║   1. Browse Designers  →  2. Place Order  →  3. Track Progress    ║
║               →  4. Receive Product  →  5. Leave Review            ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║  Footer: © 2026 DesignDen | Privacy | Terms | Contact             ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### **2. 3D Design Studio**

```
╔════════════════════════════════════════════════════════════════════╗
║  [DesignDen] [Home] [Shop] [Cart (2)] [Logout]                    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  ┌─────────────────────────────┬──────────────────────────────┐   ║
║  │                             │  CUSTOMIZATION PANEL         │   ║
║  │                             │                              │   ║
║  │        3D MODEL             │  Category: [T-Shirt ▼]      │   ║
║  │       (Three.js)            │  Gender:   [Men ▼]          │   ║
║  │                             │                              │   ║
║  │     [Rotate & Zoom]         │  ┌────────────────────────┐ │   ║
║  │                             │  │ Fabric:                │ │   ║
║  │      [T-Shirt Preview]      │  │ ◉ Cotton  ○ Silk      │ │   ║
║  │                             │  │ ○ Linen   ○ Polyester │ │   ║
║  │    Color: #FFFFFF           │  └────────────────────────┘ │   ║
║  │                             │                              │   ║
║  │   [OrbitControls Active]    │  Color: [🎨 Color Picker]   │   ║
║  │                             │                              │   ║
║  │                             │  Pattern: [Solid ▼]         │   ║
║  │                             │                              │   ║
║  │                             │  Graphic: [Dragon 1 ▼]      │   ║
║  │                             │  [Upload Custom]             │   ║
║  │                             │                              │   ║
║  │                             │  Size: [S] [M] [L] [XL]     │   ║
║  │                             │                              │   ║
║  └─────────────────────────────┼──────────────────────────────┤   ║
║                                │                              │   ║
║  [Reset View]  [Capture]      │  Price: ₹1,200.00           │   ║
║                                │  Sustainability: 75/100      │   ║
║                                │                              │   ║
║                                │  [Add to Cart] [Save Design] │   ║
║                                └──────────────────────────────┘   ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### **3. Shopping Cart**

```
╔════════════════════════════════════════════════════════════════════╗
║  [DesignDen] [Home] [Shop] [Cart (3)] [Profile ▼]                 ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║                        SHOPPING CART (3 items)                      ║
║                                                                     ║
║  ┌────────────────────────────────────────────────────────────┐   ║
║  │ [Image]  Custom T-Shirt - Blue Cotton                      │   ║
║  │          Size: M | Fabric: Cotton | Pattern: Solid         │   ║
║  │          Qty: [1] [-] [+]                    ₹1,200.00 [X] │   ║
║  └────────────────────────────────────────────────────────────┘   ║
║                                                                     ║
║  ┌────────────────────────────────────────────────────────────┐   ║
║  │ [Image]  Premium Hoodie - Black Polyester                  │   ║
║  │          Size: L | Fabric: Polyester | Graphic: Dragon     │   ║
║  │          Qty: [1] [-] [+]                    ₹2,400.00 [X] │   ║
║  └────────────────────────────────────────────────────────────┘   ║
║                                                                     ║
║  ┌────────────────────────────────────────────────────────────┐   ║
║  │ [Image]  Silk Dress - Red                                  │   ║
║  │          Size: S | Fabric: Silk | Pattern: Floral          │   ║
║  │          Qty: [2] [-] [+]                    ₹8,000.00 [X] │   ║
║  └────────────────────────────────────────────────────────────┘   ║
║                                                                     ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │                                            CART SUMMARY      │ ║
║  │                                                              │ ║
║  │  Subtotal (4 items):                           ₹11,600.00   │ ║
║  │  Shipping:                                          FREE     │ ║
║  │  Tax (18%):                                     ₹2,088.00   │ ║
║  │  ────────────────────────────────────────────────────────   │ ║
║  │  TOTAL:                                        ₹13,688.00   │ ║
║  │                                                              │ ║
║  │                            [Proceed to Checkout →]          │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                     ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### **4. Checkout Page**

```
╔════════════════════════════════════════════════════════════════════╗
║  [DesignDen] SECURE CHECKOUT [🔒]                                  ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  Steps: [1.Address ✓] → [2.Payment] → [3.Review] → [4.Confirm]   ║
║                                                                     ║
║  ┌─────────────────────────────────┬──────────────────────────┐   ║
║  │ SHIPPING ADDRESS                │   ORDER SUMMARY          │   ║
║  │                                 │                          │   ║
║  │ Name: [John Doe        ]        │  Items: 3                │   ║
║  │                                 │  Subtotal: ₹11,600.00    │   ║
║  │ Email: [john@email.com ]        │  Tax: ₹2,088.00         │   ║
║  │                                 │  Total: ₹13,688.00       │   ║
║  │ Phone: [+91 9876543210 ]        │                          │   ║
║  │                                 │  [Preview Items]         │   ║
║  │ Address:                        │                          │   ║
║  │ [123 Main Street       ]        │                          │   ║
║  │                                 │                          │   ║
║  │ City: [Mumbai          ]        │                          │   ║
║  │                                 │                          │   ║
║  │ State: [Maharashtra ▼  ]        │                          │   ║
║  │                                 │                          │   ║
║  │ Pincode: [400001       ]        │                          │   ║
║  │                                 │                          │   ║
║  │ ☐ Save as default address      │                          │   ║
║  │                                 │                          │   ║
║  └─────────────────────────────────┴──────────────────────────┘   ║
║                                                                     ║
║  PAYMENT METHOD                                                    ║
║  ◉ Credit/Debit Card  ○ UPI  ○ Net Banking  ○ Cash on Delivery   ║
║                                                                     ║
║  [Card Details Form...]                                            ║
║                                                                     ║
║                   [← Back to Cart]  [Place Order →]                ║
║                                                                     ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### **5. Designer Dashboard**

```
╔════════════════════════════════════════════════════════════════════╗
║  [DesignDen] Designer Dashboard                    [Profile ▼]     ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  Welcome back, Sarah Designer! 👋                                  ║
║  Availability: [●Available ▼] [Busy] [Not Accepting]               ║
║                                                                     ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          ║
║  │   12     │  │    8     │  │   4      │  │  ₹45,200 │          ║
║  │ Total    │  │  Active  │  │ Pending  │  │ Earnings │          ║
║  │ Orders   │  │  Orders  │  │ Approval │  │This Month│          ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘          ║
║                                                                     ║
║  Tabs: [Orders] [Portfolio] [Earnings] [Messages] [Settings]      ║
║  ┌───────────────────────────────────────────────────────────┐    ║
║  │ ACTIVE ORDERS                                    [Refresh] │    ║
║  ├───────────────────────────────────────────────────────────┤    ║
║  │ Order #DD-20260215-0042      Status: DESIGN_IN_PROGRESS   │    ║
║  │ Customer: John Doe           Progress: 50%                │    ║
║  │ Item: Custom T-Shirt         Due: 5 days                  │    ║
║  │ [View Details] [Update Progress] [Chat with Customer]     │    ║
║  ├───────────────────────────────────────────────────────────┤    ║
║  │ Order #DD-20260214-0035      Status: DESIGNER_ACCEPTED    │    ║
║  │ Customer: Jane Smith         Progress: 0%                 │    ║
║  │ Item: Silk Dress             Due: 10 days                 │    ║
║  │ [Start Design] [View Details] [Chat]                      │    ║
║  ├───────────────────────────────────────────────────────────┤    ║
║  │ NEW ORDER RECEIVED                                         │    ║
║  │ Order #DD-20260215-0048      Status: ASSIGNED_TO_DESIGNER │    ║
║  │ Customer: Mike Brown         Type: Custom Hoodie          │    ║
║  │ Budget: ₹3,500              Deadline: 15 days             │    ║
║  │ [Accept Order] [Reject Order] [View Requirements]         │    ║
║  └───────────────────────────────────────────────────────────┘    ║
║                                                                     ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### **6. Manager Dashboard**

```
╔════════════════════════════════════════════════════════════════════╗
║  [DesignDen] Manager Dashboard                     [Admin ▼]       ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  Manager Control Panel - Production & Delivery                     ║
║                                                                     ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          ║
║  │   45     │  │   18     │  │   12     │  │    8     │          ║
║  │  Total   │  │ Pending  │  │   In     │  │  Ready   │          ║
║  │  Orders  │  │ Assign   │  │Production│  │ Delivery │          ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘          ║
║                                                                     ║
║  Tabs: [All Orders] [Pending Assign] [Production] [Delivery]      ║
║        [Design Approval] [Stock] [Payouts]                         ║
║                                                                     ║
║  ┌───────────────────────────────────────────────────────────┐    ║
║  │ PENDING DESIGN APPROVAL                          [Filter] │    ║
║  ├───────────────────────────────────────────────────────────┤    ║
║  │ Order #DD-20260215-0042      Designer: Sarah Designer     │    ║
║  │ Status: DESIGN_READY         Submitted: 2 hours ago       │    ║
║  │ Customer: John Doe           Design Files: 3 images       │    ║
║  │ [View Design] [Approve] [Reject] [Request Changes]        │    ║
║  ├───────────────────────────────────────────────────────────┤    ║
║  │ PRODUCTION IN PROGRESS                                     │    ║
║  │ Order #DD-20260210-0028      Status: STITCHING (50%)      │    ║
║  │ Manager: You                 Started: 3 days ago          │    ║
║  │ Due: 7 days                  Milestone: 4/8               │    ║
║  │ [Update Progress] [View Timeline] [Complete Production]   │    ║
║  ├───────────────────────────────────────────────────────────┤    ║
║  │ READY FOR DELIVERY ASSIGNMENT                              │    ║
║  │ Order #DD-20260208-0015      Production: COMPLETED        │    ║
║  │ Customer: Alice Johnson      Location: Mumbai             │    ║
║  │ Delivery By: 20 Feb 2026     Pincode: 400001             │    ║
║  │ [Assign Delivery Person ▼] [Generate OTP] [View Details] │    ║
║  └───────────────────────────────────────────────────────────┘    ║
║                                                                     ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### **7. Admin Analytics Dashboard**

```
╔════════════════════════════════════════════════════════════════════╗
║  [DesignDen] Admin Analytics                      [Super Admin]    ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  System Overview - Last 30 Days                      [Date Range]  ║
║                                                                     ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          ║
║  │ ₹2.5L    │  │   342    │  │   28     │  │   156    │          ║
║  │ Revenue  │  │  Orders  │  │Designers │  │Customers │          ║
║  │  +15%    │  │  +22%    │  │  +8%     │  │  +35%    │          ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘          ║
║                                                                     ║
║  ┌─────────────────────────────────────────────────────────────┐  ║
║  │                     REVENUE TREND                           │  ║
║  │  ₹                                                          │  ║
║  │  60K ┤         ╭─╮                                          │  ║
║  │  50K ┤     ╭───╯ ╰─╮                                        │  ║
║  │  40K ┤ ╭───╯       ╰──╮                                     │  ║
║  │  30K ┼─╯              ╰────                                 │  ║
║  │      └───────────────────────────────────────────────────   │  ║
║  │       Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct     │  ║
║  └─────────────────────────────────────────────────────────────┘  ║
║                                                                     ║
║  Tabs: [Overview] [Orders] [Users] [Products] [Approvals]         ║
║        [Feedback] [Payouts]                                        ║
║                                                                     ║
║  ┌───────────────────────────────────────────────────────────┐    ║
║  │ PENDING APPROVALS                                5 items   │    ║
║  ├───────────────────────────────────────────────────────────┤    ║
║  │ ☐ Designer: Emily Rose         Applied: 2 days ago        │    ║
║  │   Experience: 5 years | Portfolio: 12 items               │    ║
║  │   [View Profile] [Approve] [Reject]                        │    ║
║  ├───────────────────────────────────────────────────────────┤    ║
║  │ ☐ Manager: Robert Smith        Applied: 1 day ago         │    ║
║  │   Experience: 3 years | Certifications: MBA               │    ║
║  │   [View Profile] [Approve] [Reject]                        │    ║
║  └───────────────────────────────────────────────────────────┘    ║
║                                                                     ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### **8. Order Tracking (Customer View)**

```
╔════════════════════════════════════════════════════════════════════╗
║  [DesignDen] Track Order #DD-20260215-0042         [Home] [Orders] ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║  Order Status: IN_PRODUCTION (62%)                                 ║
║  Estimated Delivery: 25 Feb 2026                                   ║
║                                                                     ║
║  ┌───────────────────────────────────────────────────────────┐    ║
║  │                    ORDER TIMELINE                          │    ║
║  │                                                            │    ║
║  │  ✓ Order Placed               15 Feb 2026, 10:30 AM       │    ║
║  │  │                                                         │    ║
║  │  ✓ Assigned to Manager        15 Feb 2026, 10:35 AM       │    ║
║  │  │                                                         │    ║
║  │  ✓ Designer Assigned          15 Feb 2026, 2:00 PM        │    ║
║  │  │  Designer: Sarah Designer                              │    ║
║  │  │                                                         │    ║
║  │  ✓ Design Phase Complete      18 Feb 2026, 5:30 PM        │    ║
║  │  │  Progress: 100%                                         │    ║
║  │  │                                                         │    ║
║  │  ✓ Design Approved            18 Feb 2026, 6:00 PM        │    ║
║  │  │                                                         │    ║
║  │  ● Production Started         19 Feb 2026, 9:00 AM        │    ║
║  │  │  Current: Assembly (62%)                               │    ║
║  │  │  Last Update: 2 hours ago                              │    ║
║  │  │                                                         │    ║
║  │  ○ Quality Check              Expected: 22 Feb 2026       │    ║
║  │  │                                                         │    ║
║  │  ○ Ready for Pickup           Expected: 23 Feb 2026       │    ║
║  │  │                                                         │    ║
║  │  ○ Out for Delivery           Expected: 24 Feb 2026       │    ║
║  │  │                                                         │    ║
║  │  ○ Delivered                  Expected: 25 Feb 2026       │    ║
║  │                                                            │    ║
║  └───────────────────────────────────────────────────────────┘    ║
║                                                                     ║
║  [Chat with Designer] [View Design Files] [Cancel Order]          ║
║                                                                     ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### **9. Designer-Customer Chat Interface**

```
╔════════════════════════════════════════════════════════════════════╗
║  Chat: Order #DD-20260215-0042                          [← Back]   ║
╠════════════════════════════════════════════════════════════════════╣
║  ┌──────────────────────────────────────────────────────────┐     ║
║  │ Sarah Designer                            [Designer] 🟢  │     ║
║  │ ──────────────────────────────────────────────────────── │     ║
║  │                                                          │     ║
║  │ [Customer] Hi! I'd like to discuss the design.          │     ║
║  │            10:30 AM                              ✓✓      │     ║
║  │                                                          │     ║
║  │                          [Designer] Hello! Of course.    │     ║
║  │                          What would you like to change?  │     ║
║  │                          ✓✓ 10:32 AM                     │     ║
║  │                                                          │     ║
║  │ [Customer] Can we make the sleeves longer?              │     ║
║  │            10:35 AM                              ✓✓      │     ║
║  │                                                          │     ║
║  │                          [Designer] Absolutely! Here's   │     ║
║  │                          the updated design preview:     │     ║
║  │                          [📎 design_v2.png]              │     ║
║  │                          ✓✓ 10:40 AM                     │     ║
║  │                                                          │     ║
║  │ [Customer] Perfect! Love it ❤️                          │     ║
║  │            10:42 AM                              ✓✓      │     ║
║  │                                                          │     ║
║  │                          [Designer] Great! I'll          │     ║
║  │                          proceed with production.        │     ║
║  │                          ✓ 10:45 AM                      │     ║
║  │                                                          │     ║
║  └──────────────────────────────────────────────────────── ─┘     ║
║                                                                     ║
║  [📎]  [Type your message here...]            [Send →]            ║
║                                                                     ║
║  Quick Actions: [Request Update] [Approve Design] [Report Issue]  ║
║                                                                     ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 🎨 Color Palette

### **Primary Colors**

```
Primary:    #667eea (Indigo Blue)
Secondary:  #764ba2 (Deep Purple)
Success:    #4CAF50 (Green)
Warning:    #FF9800 (Orange)
Danger:     #F44336 (Red)
Info:       #2196F3 (Blue)
```

### **Status Colors**

```
Pending:           #FFC107 (Amber)
In Progress:       #2196F3 (Blue)
Completed:         #4CAF50 (Green)
Cancelled:         #F44336 (Red)
Approved:          #00BCD4 (Cyan)
Rejected:          #FF5722 (Deep Orange)
```

---

## 📐 Design Patterns

### **Card Pattern**

```
┌────────────────────────────┐
│  [Icon]  Title             │
│  ───────────────────────   │
│  Description text goes     │
│  here with details about   │
│  the item or feature.      │
│                            │
│  [Action Button]           │
└────────────────────────────┘
```

### **Timeline Pattern**

```
✓ Event 1
│  Details...
│
● Event 2 (Current)
│  Details...
│
○ Event 3 (Future)
│  Details...
│
○ Event 4 (Future)
```

### **Progress Bar Pattern**

```
[▰▰▰▰▰▰▱▱▱▱] 60%
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
xs: 0px    - 575px   (Mobile)
sm: 576px  - 767px   (Large Mobile)
md: 768px  - 991px   (Tablet)
lg: 992px  - 1199px  (Desktop)
xl: 1200px - 1399px  (Large Desktop)
xxl: 1400px+         (Extra Large)
```

---

**Wireframe Version**: 1.0  
**Design System**: Bootstrap 5 + Custom Theme  
**Last Updated**: March 2026
