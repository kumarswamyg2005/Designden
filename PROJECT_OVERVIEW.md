# DesignDen - Complete Project Documentation

> **Last Updated**: January 30, 2026  
> **Tech Stack**: MERN (MongoDB, Express, React 19, Node.js)  
> **Frontend Framework**: React 19.2.0 + Vite + Bootstrap 5  
> **State Management**: Redux Toolkit + Context API  
> **Database**: MongoDB with Mongoose ODM

---

## 🎯 Project Overview

**DesignDen** is a full-stack custom clothing e-commerce platform connecting customers with freelance fashion designers. The platform facilitates:

- **Custom clothing design** with 3D preview
- **Ready-made shop** for pre-designed items
- **Designer marketplace** with 80% commission model
- **Real-time order tracking** with production milestones
- **Live customer-designer chat** for order collaboration
- **OTP-based delivery verification**

---

## 👥 User Roles & Capabilities

### 1. **Customer**

- Browse designer marketplace
- Create custom designs with 3D studio
- Shop ready-made products
- Add items to cart & checkout
- Track order progress in real-time
- Chat with assigned designer
- Leave reviews & feedback

### 2. **Designer**

- Manage shop availability (Open/Closed)
- Accept/reject order assignments
- Update production progress (0-100%) with 8 milestones
- Chat with customers
- Mark orders as complete
- View earnings (80% commission)

### 3. **Manager**

- Assign custom orders to designers
- Assign completed orders to delivery personnel
- Manage product stock
- Process designer payouts
- View order analytics

### 4. **Delivery**

- View assigned deliveries
- Update delivery status
- Generate & verify OTP for delivery completion
- Update live location tracking

### 5. **Admin**

- System-wide analytics & reporting
- Approve/reject manager signups
- Manage products & designers
- View all feedbacks
- System configuration

---

## 🏗️ Architecture Overview

### **Frontend Structure**

```
src/
├── pages/                  # Route components by role
│   ├── Home.jsx           # Landing page
│   ├── Login.jsx          # Authentication
│   ├── Signup.jsx         # Registration
│   ├── customer/          # Customer pages
│   ├── designer/          # Designer pages (Dashboard.jsx = 1046 lines)
│   ├── manager/           # Manager pages
│   ├── delivery/          # Delivery pages
│   ├── admin/             # Admin pages
│   ├── shop/              # Shop pages
│   └── marketplace/       # Designer marketplace
├── components/            # Reusable components
│   ├── Header.jsx         # Navigation with cart badge
│   ├── Footer.jsx
│   ├── ProtectedRoute.jsx # Role-based access control
│   ├── LoadingSpinner.jsx
│   └── Toast.jsx          # Redux notifications
├── context/               # React Context providers
│   ├── AuthContext.jsx    # Authentication state
│   ├── CartContext.jsx    # Shopping cart state
│   ├── FlashContext.jsx   # Flash messages
│   └── ThemeContext.jsx   # Dark/Light mode
├── store/                 # Redux Toolkit store
│   ├── index.js           # Store configuration
│   └── slices/            # Redux slices
│       ├── authSlice.js
│       ├── ordersSlice.js # 1265 lines, 30+ thunks
│       ├── cartSlice.js
│       ├── productsSlice.js
│       ├── notificationsSlice.js
│       └── uiSlice.js
├── services/
│   └── api.js             # Axios instance + API endpoints (500 lines)
├── utils/
│   ├── currency.js        # formatPrice() helper
│   └── validation.js      # Form validators
└── styles/
    └── styles.css         # Global styles (1415 lines)
```

### **Backend Structure**

```
server.cjs                 # Express server (8201 lines)
├── MongoDB Schemas:
│   ├── User              # With designerProfile nested schema
│   ├── Product           # With 3D modelPath
│   ├── Order             # Complex workflow tracking
│   ├── Cart
│   ├── Design            # Custom designs
│   ├── Message           # Customer-Designer chat
│   ├── ProductionMilestone
│   ├── DeliveryPartner
│   └── Feedback
└── API Routes:
    ├── /api/auth/*       # Authentication
    ├── /customer/*       # Customer operations
    ├── /designer/*       # Designer operations
    ├── /manager/*        # Manager operations
    ├── /delivery/*       # Delivery operations
    ├── /admin/*          # Admin operations
    └── /api/shop/*       # Public shop
```

---

## 📊 Database Schemas (MongoDB)

### **User Schema**

```javascript
{
  username: String,
  name: String,
  email: String,
  password: String (bcrypt hashed),
  contactNumber: String,
  role: Enum["customer", "designer", "manager", "admin", "delivery"],
  approved: Boolean (default: true, false for managers pending approval),
  twoFactorEnabled: Boolean,
  addresses: [{
    street, city, state, pincode, isDefault
  }],
  designerProfile: {  // Only for designers
    bio: String,
    specializations: [String],
    experience: Number,
    portfolio: [{ title, description, image, category }],
    rating: Number (0-5),
    completedOrders: Number,
    isAvailable: Boolean,
    availabilityStatus: Enum["available", "busy", "not_accepting"],
    priceRange: { min, max },
    turnaroundDays: Number
  }
}
```

### **Order Schema** (Critical!)

```javascript
{
  userId: ObjectId (ref: User),
  orderNumber: String (e.g., "DD-20231201-001"),
  items: [{
    productId: ObjectId (ref: Product),
    designId: ObjectId (ref: Design),
    quantity: Number,
    size: String,
    color: String,
    price: Number
  }],
  totalAmount: Number,
  orderType: Enum["shop", "custom"],

  // STATUS FLOW (Critical for understanding workflow)
  status: Enum[
    // Common
    "pending",              // Order placed
    "assigned_to_manager",  // Auto-assigned to manager
    "confirmed",            // Manager confirmed
    "processing",           // Manager processing

    // Custom order only
    "assigned_to_designer", // Manager assigned to designer
    "designer_accepted",    // Designer accepted
    "in_production",        // Designer working
    "production_completed", // Designer finished

    // Delivery flow
    "ready_for_pickup",     // Ready for delivery
    "picked_up",            // Delivery picked up
    "in_transit",           // In transit
    "out_for_delivery",     // Out for delivery
    "delivered",            // Delivered

    // Other
    "cancelled",
    "returned"
  ],

  // Progress tracking (for custom orders)
  progressPercentage: Number (0-100),
  currentMilestone: String,

  // Personnel assignments
  managerId: ObjectId (ref: User),
  designerId: ObjectId (ref: User),
  deliveryPersonId: ObjectId (ref: User),

  // Delivery OTP
  deliveryOTP: {
    code: String (4-digit),
    generatedAt: Date,
    verified: Boolean
  },

  shippingAddress: { name, email, phone, street, city, state, zipCode },
  paymentStatus: Enum["pending", "completed", "failed", "refunded"],

  // Timestamps
  createdAt, managerAssignedAt, designerAcceptedAt,
  productionStartedAt, productionCompletedAt, deliveredAt
}
```

### **Message Schema** (Chat)

```javascript
{
  orderId: ObjectId (ref: Order),
  senderId: ObjectId (ref: User),
  senderRole: Enum["customer", "designer", "manager"],
  receiverId: ObjectId (ref: User),
  receiverRole: Enum["customer", "designer", "manager"],
  message: String,
  attachments: [{ type: "image"|"file", url, name }],
  read: Boolean,
  messageType: String (e.g., "progress_update"),
  createdAt: Date
}
```

---

## 🔄 Order Workflow (Critical Understanding)

### **Shop Order Flow**

```
CUSTOMER places order
    ↓
AUTO-ASSIGNED → Manager (status: "assigned_to_manager")
    ↓
MANAGER confirms → Status: "ready_for_pickup"
    ↓
MANAGER assigns → Delivery Person
    ↓
DELIVERY picks up → Generates OTP → Status: "out_for_delivery"
    ↓
CUSTOMER provides OTP → Status: "delivered"
```

### **Custom Order Flow**

```
CUSTOMER creates custom design & places order
    ↓
AUTO-ASSIGNED → Manager (status: "assigned_to_manager")
    ↓
MANAGER assigns → Designer (status: "assigned_to_designer")
    ↓
DESIGNER accepts → Status: "designer_accepted"
    ↓
DESIGNER starts → Status: "in_production", progressPercentage: 0
    ↓
DESIGNER updates progress → progressPercentage: 10, 25, 40... (8 milestones)
    ↓
DESIGNER completes → Status: "production_completed", progressPercentage: 100
    ↓
MANAGER assigns → Delivery Person
    ↓
DELIVERY picks up → Generates OTP → Status: "out_for_delivery"
    ↓
CUSTOMER provides OTP → Status: "delivered"
```

### **8 Production Milestones**

```javascript
[
  { id: 1, name: "Design Review", percentage: 10, icon: "eye" },
  { id: 2, name: "Material Selection", percentage: 25, icon: "boxes" },
  { id: 3, name: "Pattern Making", percentage: 40, icon: "cut" },
  { id: 4, name: "Fabric Cutting", percentage: 55, icon: "scissors" },
  { id: 5, name: "Stitching", percentage: 70, icon: "tshirt" },
  { id: 6, name: "Quality Check", percentage: 85, icon: "search" },
  { id: 7, name: "Final Touches", percentage: 95, icon: "magic" },
  { id: 8, name: "Ready for Delivery", percentage: 100, icon: "check-circle" },
];
```

---

## 🔐 Authentication System

### **Flow**

```
User enters credentials → POST /api/auth/login
→ Backend: bcrypt.compare(password, hashedPassword)
→ If valid: Create express-session
→ Return { user: {...}, role: "..." }
→ Frontend: Store in AuthContext & redirect by role
```

### **2FA (Email-based)**

```
User enables 2FA → POST /api/auth/2fa/setup
→ Backend generates 6-digit code
→ Sends email via nodemailer
→ Code stored in memory Map (5 min expiry)
→ User enters code → Verify → twoFactorEnabled: true
```

### **Protected Routes**

```javascript
// ProtectedRoute.jsx
<ProtectedRoute allowedRoles={["designer"]}>
  <DesignerDashboard />
</ProtectedRoute>

// Checks:
1. User logged in? → If no, redirect to /login
2. User role in allowedRoles? → If no, redirect to /
3. If both pass → Render component
```

---

## 🛒 Cart System

### **CartContext.jsx**

```javascript
const [cart, setCart] = useState(null);
const [cartCount, setCartCount] = useState(0);

// Fetch cart on mount
useEffect(() => {
  customerAPI.getCart().then((res) => {
    setCart(res.data.cart);
    setCartCount(
      res.data.cart.items.reduce((sum, item) => sum + item.quantity, 0),
    );
  });
}, []);

// Add to cart
const addToCart = async (item) => {
  await customerAPI.addToCart(item);
  await fetchCart(); // Refresh
};
```

### **Cart Badge in Header**

```jsx
<Link to="/customer/cart">
  <i className="fas fa-shopping-cart"></i> Cart
  {cartCount > 0 && <span className="badge bg-danger">{cartCount}</span>}
</Link>
```

---

## 📡 API Service Layer (api.js)

### **Axios Configuration**

```javascript
const API_URL =
  import.meta.env.VITE_API_URL || "https://backend-gw9o.onrender.com";
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies for session
  headers: { "Content-Type": "application/json" },
});

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error("Cannot connect to backend"));
    }
    return Promise.reject(error);
  },
);
```

### **API Endpoints by Role**

```javascript
// Customer
customerAPI.getOrders()          → GET /customer/api/orders
customerAPI.getCart()            → GET /api/customer/cart
customerAPI.addToCart(data)      → POST /api/customer/cart
customerAPI.processCheckout(data)→ POST /customer/api/process-checkout

// Designer
designerAPI.getOrders()          → GET /designer/api/orders
designerAPI.startProduction(id)  → POST /designer/orders/:id/start
designerAPI.updateProgress(id, progress) → POST /designer/orders/:id/progress
designerAPI.completeOrder(id)    → POST /designer/orders/:id/complete

// Manager
managerAPI.getOrders()           → GET /manager/api/orders
managerAPI.assignToDesigner(id, designerId) → POST /manager/order/:id/assign
managerAPI.getDesigners()        → GET /manager/api/designers

// Admin
adminAPI.getDashboard()          → GET /admin/dashboard
adminAPI.getDesigners()          → GET /api/admin/designers
adminAPI.approveManager(id)      → POST /admin/approve-manager/:id
```

---

## 🎨 Designer Dashboard (Key Component)

**File**: `src/pages/designer/Dashboard.jsx` (1046 lines)

### **Core State**

```javascript
const [availabilityStatus, setAvailabilityStatus] = useState("available"); // "available" | "not_accepting"
const [selectedOrder, setSelectedOrder] = useState(null);
const [progressValue, setProgressValue] = useState(0); // 0-100
const [selectedMilestone, setSelectedMilestone] = useState(null);
const [chatOrder, setChatOrder] = useState(null);
const [showChatPanel, setShowChatPanel] = useState(false);
const [showProgressModal, setShowProgressModal] = useState(false);
const [showCompleteModal, setShowCompleteModal] = useState(false);
const [showStatusModal, setShowStatusModal] = useState(false);
```

### **Redux Integration**

```javascript
// Selectors
const orders = useSelector(selectOrders);
const loading = useSelector(selectOrdersLoading);
const chatMessages = useSelector(selectMessages);

// Actions
dispatch(fetchDesignerOrders());
dispatch(acceptOrder(orderId));
dispatch(startProduction(orderId));
dispatch(updateProgress({ orderId, progressPercentage, note }));
dispatch(completeProduction({ orderId, notes }));
dispatch(fetchOrderMessages(orderId));
dispatch(sendOrderMessage({ orderId, message }));
```

### **Key Features**

1. **Availability Toggle**: Open/Closed shop status
2. **Order Statistics**: 4 cards (Pending, Accepted, In Production, Completed)
3. **Order Cards**: Display customer info, design items, progress bars
4. **Action Buttons**: Accept, Start, Update Progress, Complete (based on status)
5. **Chat Panel**: Slide-in panel with quick action buttons
6. **Progress Modal**: 8 milestone grid + manual slider
7. **Complete Modal**: Final notes + confirmation

### **Actions by Order Status**

```javascript
// assigned_to_designer → Show "Accept Order" button
// designer_accepted → Show "Start Production" button
// in_production → Show "Update Progress" button
// in_production (100%) → Show "Complete" button
```

---

## 🔴 Redux Store (store/slices/ordersSlice.js)

### **Key Async Thunks** (30+ total)

```javascript
// Fetch
fetchDesignerOrders(); // Designer's assigned orders
fetchUserOrders(); // Customer's orders
fetchAllOrders(role); // Admin/Manager all orders

// Designer actions
acceptOrder(orderId); // Accept assigned order
startProduction(orderId); // Start production
updateProgress({ orderId, progressPercentage, note });
completeProduction({ orderId, notes });

// Manager actions
assignOrderToDesigner({ orderId, designerId });
assignOrderToDelivery({ orderId, deliveryPersonId });

// Delivery actions
pickupOrder(orderId);
deliverOrderWithOTP({ orderId, otp, receivedBy, signature });

// Chat
fetchOrderMessages(orderId);
sendOrderMessage({ orderId, message, attachments });
```

### **State Structure**

```javascript
{
  orders: [],              // Array of order objects
  currentOrder: null,      // Selected order details
  messages: [],            // Chat messages for current order
  designers: [],           // Available designers (for manager)
  deliveryPersons: [],     // Available delivery persons
  loading: false,
  error: null
}
```

---

## 🎨 3D Model Viewer (Design Studio)

**Technology**: Three.js + React Three Fiber + @react-three/drei

### **How It Works**

```javascript
// ModelViewer.jsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

<Canvas camera={{ position: [0, 0, 5] }}>
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} />

  {/* Load 3D model */}
  <ClothingModel path="/models/tshirt_men.glb" color={selectedColor} />

  {/* User can rotate/zoom */}
  <OrbitControls enableZoom={true} />
</Canvas>;

// Load GLB model
const { scene } = useGLTF(modelPath);

// Apply color to model
useEffect(() => {
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set(selectedColor);
    }
  });
}, [selectedColor]);
```

### **Design Flow**

```
1. User selects category (T-Shirt, Hoodie) + gender (Men, Women)
2. Load appropriate model: /models/tshirt_men.glb
3. User picks color → Model color updates in real-time
4. User selects fabric/pattern → Price calculated dynamically
5. User adds graphic (optional) → Overlaid on model
6. "Add to Cart" → Saved with isCustomOrder: true
```

---

## 💡 Key Design Patterns

### **1. Hybrid State Management**

- **Context API**: UI state (auth, cart, theme, flash)
- **Redux Toolkit**: Server data (orders, products)
- **Why**: Context for simple global state, Redux for complex async operations

### **2. Optimistic UI Updates**

```javascript
// Update UI immediately
setCart((prev) => [...prev, newItem]);

// Then sync with backend
await api.post("/cart", newItem);

// If fails, revert
if (error) setCart(originalCart);
```

### **3. Role-Based Component Rendering**

```javascript
const { isCustomer, isDesigner, isManager } = useAuth();

{
  isCustomer && <Link to="/customer/cart">Cart</Link>;
}
{
  isDesigner && <Link to="/designer/dashboard">Dashboard</Link>;
}
{
  isManager && <Link to="/manager">Manager</Link>;
}
```

### **4. Compound Components**

```javascript
// Modal pattern
{
  showModal && (
    <div className="modal">
      <ModalHeader onClose={handleClose} />
      <ModalBody>{content}</ModalBody>
      <ModalFooter>
        <Button onClick={handleSave}>Save</Button>
      </ModalFooter>
    </div>
  );
}
```

---

## 🚀 Running the Application

### **Development**

```bash
# Install dependencies
npm install

# Start backend (Port 5174)
node server.cjs

# Start frontend (Port 5173) - in separate terminal
npm run dev

# Both together
npm start  # Uses concurrently
```

### **Environment Variables**

```bash
# .env (Backend)
MONGODB_URI=mongodb://localhost:27017/designden
PORT=5174
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# .env (Frontend)
VITE_API_URL=http://localhost:5174
```

### **Build & Deploy**

```bash
# Frontend build
npm run build  # → dist/

# Backend deploy (already on Render.com)
# Frontend deploy (Vercel configured via vercel.json)
```

---

## 📁 Critical Files Reference

| File                               | Lines | Purpose                                   |
| ---------------------------------- | ----- | ----------------------------------------- |
| `server.cjs`                       | 8201  | Express server with all API routes        |
| `src/pages/designer/Dashboard.jsx` | 1046  | Designer dashboard with chat & progress   |
| `src/store/slices/ordersSlice.js`  | 1265  | Redux order management (30+ thunks)       |
| `src/services/api.js`              | 500   | Axios configuration & API endpoints       |
| `src/styles/styles.css`            | 1415  | Global styles & animations                |
| `src/App.jsx`                      | 451   | Router configuration & protected routes   |
| `src/context/AuthContext.jsx`      | 200   | Authentication state & session management |
| `src/context/CartContext.jsx`      | 130   | Shopping cart state & operations          |

---

## 🔑 Test Credentials

| Role     | Email                  | Password    |
| -------- | ---------------------- | ----------- |
| Admin    | admin@designden.com    | admin123    |
| Manager  | manager@designden.com  | manager123  |
| Designer | designer@designden.com | designer123 |
| Delivery | delivery@designden.com | delivery123 |
| Customer | (signup to create)     | -           |

---

## 🎯 Key Business Logic

### **Designer Commission**: 80%

```javascript
const designerEarnings = orderTotal * 0.8;
const platformFee = orderTotal * 0.2;
```

### **Price Calculation**

```javascript
const basePrice = 500;
const fabricPrice = { Cotton: 100, Silk: 200, Polyester: 50 };
const patternPrice = { Solid: 0, Striped: 50, Printed: 100 };
const graphicPrice = 200;

const total =
  basePrice +
  fabricPrice[fabric] +
  patternPrice[pattern] +
  (hasGraphic ? graphicPrice : 0);
```

### **OTP Generation**

```javascript
const generateOTP = () => Math.floor(1000 + Math.random() * 9000); // 4-digit
```

---

## 🐛 Common Issues & Solutions

### **1. Cart count not updating**

**Cause**: Cart items array not being summed correctly  
**Fix**: Check `CartContext.jsx` line 50-55 - should sum quantities

### **2. Protected route redirects infinitely**

**Cause**: Auth loading state not handled  
**Fix**: Check `ProtectedRoute.jsx` - must check `loading` first

### **3. Order status not updating**

**Cause**: Redux state not refetching after mutation  
**Fix**: Call `dispatch(fetchDesignerOrders())` after status update

### **4. 3D model not loading**

**Cause**: Model file path incorrect or CORS  
**Fix**: Ensure models in `/public/models/` and served statically

---

## 📚 Dependencies Summary

### **Core**

- `react@19.2.0`, `react-dom@19.2.0`
- `react-router-dom@7.9.6`
- `vite@7.2.4`

### **State Management**

- `@reduxjs/toolkit@2.11.0`
- `react-redux@9.2.0`
- `redux-persist@6.0.0`

### **UI**

- `bootstrap@5.3.8`
- `react-bootstrap@2.10.10`

### **3D**

- `three@0.181.2`
- `@react-three/fiber@9.4.0`
- `@react-three/drei@10.7.7`

### **Backend**

- `express@4.18.2`
- `mongoose@8.0.0`
- `bcryptjs@3.0.3`
- `express-session@1.17.3`
- `nodemailer@7.0.12`
- `cors@2.8.5`

---

## 🎓 Learning Resources

### **Understand This Project By Reading**

1. `server.cjs` lines 1-500: Schemas & auth
2. `src/App.jsx`: Route structure
3. `src/pages/designer/Dashboard.jsx`: Complex component example
4. `src/store/slices/ordersSlice.js`: Redux patterns
5. `docs/TECHNICAL_IMPLEMENTATION.md`: Detailed explanations

### **Key Concepts**

- **React Context**: Global state without prop drilling
- **Redux Toolkit**: Async operations with createAsyncThunk
- **Protected Routes**: HOC pattern for authentication
- **Optimistic UI**: Update UI before server confirmation
- **Session-based Auth**: Express-session + cookies

---

## 📝 Notes for AI Assistance

When helping with this project:

1. **Always check order status** before suggesting actions (see Order Workflow section)
2. **Designer dashboard** is the most complex component - reference it for patterns
3. **Redux vs Context**: Use Redux for server data, Context for UI state
4. **API calls**: Always use services/api.js, never raw axios
5. **Protected routes**: All role-specific pages must be wrapped in ProtectedRoute
6. **Cart count**: Calculated by summing item quantities, not item count
7. **Order type matters**: "shop" vs "custom" determines workflow
8. **Progress updates**: Only for custom orders with status "in_production"

---

**Project Maintainer**: Kumaraswamy  
**Last Full Code Review**: January 30, 2026  
**Total Lines of Code**: ~15,000+  
**Backend**: Live on Render.com  
**Frontend**: Configured for Vercel deployment
