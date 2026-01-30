# 👕 DesignDen - Custom Clothing E-Commerce Platform

> A full-stack MERN custom clothing e-commerce platform connecting customers with freelance fashion designers. Features 3D design studio, real-time order tracking, designer-customer chat, and production milestone management.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://design-den1.vercel.app)
[![Backend](https://img.shields.io/badge/backend-render.com-blue)](https://backend-gw9o.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🌟 Key Features

### For Customers

- 🎨 **3D Design Studio** - Create custom clothing with real-time 3D preview using Three.js
- 🛍️ **Shop Ready-Made** - Browse pre-designed items with advanced filtering
- 💬 **Live Chat** - Real-time communication with assigned designers
- 📦 **Order Tracking** - Track production progress with 8 detailed milestones
- 🔒 **Secure Checkout** - Multiple payment options with OTP delivery verification

### For Designers

- 🎯 **Smart Dashboard** - Accept orders, manage production, track earnings (80% commission)
- 📊 **Progress Management** - 8-stage milestone system (10% → 100%)
- 💬 **Customer Communication** - Built-in chat with quick action buttons
- 🏪 **Shop Control** - Toggle availability status (Open/Closed)
- 📈 **Portfolio Management** - Showcase work with ratings and specializations

### For Managers

- 📋 **Order Assignment** - Assign custom orders to available designers
- 🚚 **Delivery Coordination** - Manage delivery partner assignments
- 📊 **Stock Management** - Control product inventory
- 💰 **Payout Processing** - Handle designer commission payments

### For Delivery Personnel

- 📍 **Live Tracking** - GPS-based location updates
- 🔐 **OTP Verification** - 4-digit code for secure delivery confirmation
- 📸 **Proof of Delivery** - Capture signature and photos
- 📊 **Statistics Dashboard** - Track delivery performance

### For Admins

- 📊 **System Analytics** - Comprehensive dashboard with revenue tracking
- ✅ **Approval System** - Approve/reject designer and manager signups
- 📝 **Feedback Management** - View and analyze customer feedback
- 🔍 **Order Oversight** - Monitor all orders across the platform

## 🚀 Tech Stack

### Frontend

- **Framework**: React 19.2.0 with Vite 7.2.4
- **State Management**: Redux Toolkit + Context API (hybrid approach)
- **Routing**: React Router v7.9.6
- **UI Framework**: Bootstrap 5.3.8 + React Bootstrap 2.10.10
- **3D Graphics**: Three.js 0.181.2 + @react-three/fiber + @react-three/drei
- **HTTP Client**: Axios 1.13.2

### Backend

- **Runtime**: Node.js with Express 4.18.2
- **Database**: MongoDB with Mongoose 8.0.0
- **Authentication**: Session-based with express-session + bcrypt
- **Email Service**: Nodemailer 7.0.12 (2FA)
- **Security**: CORS 2.8.5, bcryptjs 3.0.3

### Deployment

- **Frontend**: Vercel (with SPA routing)
- **Backend**: Render.com
- **Database**: MongoDB Atlas

## 📋 System Architecture

### 5 User Roles

1. **Customer** - Browse, design, order, track
2. **Designer** - Accept orders, manage production, earn 80% commission
3. **Manager** - Assign orders, coordinate delivery
4. **Delivery** - Handle deliveries with OTP verification
5. **Admin** - System oversight and analytics

### Order Workflow

#### Shop Orders

```
Customer → Manager (auto-assigned) → Delivery → Delivered (OTP)
```

#### Custom Orders

```
Customer → Manager → Designer (8 milestones) → Manager → Delivery → Delivered (OTP)
```

### 8 Production Milestones

1. Design Review (10%)
2. Material Selection (25%)
3. Pattern Making (40%)
4. Fabric Cutting (55%)
5. Stitching (70%)
6. Quality Check (85%)
7. Final Touches (95%)
8. Ready for Delivery (100%)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/kumarswamyg2005/design-den1.git
cd design-den1
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
# Create .env file
VITE_API_URL=https://backend-gw9o.onrender.com
# For local development: VITE_API_URL=http://localhost:5174
```

4. **Start development server**

```bash
npm run dev
```

Visit `http://localhost:5173`

### Backend Setup (Optional for local development)

If running backend locally:

```bash
# Backend runs on port 5174
node server.cjs
```

**MongoDB Connection**: Set `MONGODB_URI` in backend or use default localhost:27017/designden

## 🎯 Core Features Breakdown

### 3D Design Studio

- **Real-time 3D Preview**: Rotate and zoom clothing models
- **Customization Options**: Colors, fabrics, patterns, sizes
- **Graphic Overlay**: 11 dragon graphics + custom uploads
- **Dynamic Pricing**: Base price + fabric + pattern + graphic
- **Model Types**: T-shirts, Hoodies, Jeans, Dresses (Men/Women)
- **Technology**: Three.js with OrbitControls

### Chat System

- **Order-based Messaging**: Customer-Designer communication per order
- **Quick Actions**: Pre-defined response buttons
- **Message History**: Persistent chat with timestamps
- **Progress Notifications**: Automatic updates on milestone completion
- **Attachment Support**: Images and files (schema ready)

### Order Management (16 Status States)

- `pending` → `assigned_to_manager` → `confirmed` → `processing`
- `assigned_to_designer` → `designer_accepted` → `in_production`
- `production_completed` → `ready_for_pickup` → `picked_up`
- `in_transit` → `out_for_delivery` → `delivered`
- Also: `cancelled`, `returned`, `return_requested`

### Security Features

- **Session-based Authentication**: express-session with bcrypt hashing
- **2FA Email Verification**: 6-digit codes with 5-minute expiry
- **Role-based Access Control**: Protected routes per user role
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configured for production domains

## 📁 Project Structure

```
design-den-react/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.jsx       # Navigation with cart badge
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx       # Page wrapper
│   │   ├── ProtectedRoute.jsx  # Role-based routing
│   │   ├── LoadingSpinner.jsx
│   │   ├── Toast.jsx        # Redux notifications
│   │   └── ...
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx  # Authentication state
│   │   ├── CartContext.jsx  # Shopping cart
│   │   ├── ThemeContext.jsx # Dark/Light mode
│   │   └── FlashContext.jsx # Flash messages
│   ├── pages/               # Route components by role
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── customer/        # Customer pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── DesignStudio.jsx  # 3D customization
│   │   │   └── TrackOrder.jsx
│   │   ├── designer/        # Designer pages
│   │   │   ├── Dashboard.jsx     # 1345 lines, complex
│   │   │   ├── Products.jsx
│   │   │   └── Earnings.jsx
│   │   ├── manager/         # Manager pages
│   │   ├── delivery/        # Delivery pages
│   │   └── admin/           # Admin pages
│   ├── store/               # Redux Toolkit
│   │   ├── index.js         # Store configuration
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── ordersSlice.js    # 1265 lines, 30+ thunks
│   │       ├── cartSlice.js
│   │       ├── productsSlice.js
│   │       └── notificationsSlice.js
│   ├── services/
│   │   └── api.js           # 500+ lines, API endpoints
│   ├── utils/
│   │   ├── currency.js      # formatPrice helper
│   │   ├── validation.js    # Form validators
│   │   └── clothingModels.js # 3D model paths
│   ├── styles/              # CSS files
│   │   ├── styles.css       # 1415 lines, global styles
│   │   ├── globals.css
│   │   └── cartAnimation.css
│   └── assets/              # Static files
│       ├── images/
│       │   └── graphics/    # 11 dragon graphics
│       └── models/          # 3D GLB files
├── public/                  # Public static files
│   ├── images/
│   └── models/
├── server.cjs               # 8201 lines, Express backend
├── package.json
├── vite.config.js
├── vercel.json             # Vercel deployment config
└── PROJECT_OVERVIEW.md     # Detailed documentation
```

## 🔌 API Documentation

### Authentication API

```javascript
authAPI.login({ email, password, twoFactorCode });
authAPI.signup({ username, email, password, role });
authAPI.logout();
authAPI.checkSession();
authAPI.setup2FA();
authAPI.verify2FA(token);
```

### Customer API

```javascript
customerAPI.getOrders();
customerAPI.getCart();
customerAPI.addToCart({ productId, quantity, size, color });
customerAPI.processCheckout({ items, shippingAddress });
customerAPI.createDesign({ category, fabric, color, graphic });
customerAPI.getWishlist();
```

### Designer API

```javascript
designerAPI.getOrders();
designerAPI.acceptOrder(orderId);
designerAPI.startProduction(orderId);
designerAPI.updateProgress(orderId, { progressPercentage, note });
designerAPI.completeOrder(orderId);
designerAPI.getPortfolio();
```

### Manager API

```javascript
managerAPI.getOrders();
managerAPI.assignToDesigner(orderId, designerId);
managerAPI.assignToDelivery(orderId, deliveryPersonId);
managerAPI.getDesigners();
managerAPI.updateStock(productId, data);
```

### Admin API

```javascript
adminAPI.getDashboard();
adminAPI.getOrders();
adminAPI.approveManager(userId);
adminAPI.getDesigners();
adminAPI.getFeedbacks();
```

## 🗄️ Database Schemas

### User Schema

```javascript
{
  username: String,
  email: String,
  password: String (bcrypt hashed),
  role: Enum["customer", "designer", "manager", "admin", "delivery"],
  approved: Boolean,
  twoFactorEnabled: Boolean,
  addresses: [{ street, city, state, pincode, isDefault }],
  designerProfile: {
    bio: String,
    specializations: [String],
    experience: Number,
    portfolio: [{ title, description, image }],
    rating: Number,
    completedOrders: Number,
    isAvailable: Boolean,
    availabilityStatus: Enum["available", "busy", "not_accepting"],
    priceRange: { min, max },
    turnaroundDays: Number
  }
}
```

### Order Schema

```javascript
{
  orderNumber: String, // "DD-20260130-0001"
  userId: ObjectId,
  items: [{ productId, designId, quantity, size, color, price }],
  totalAmount: Number,
  orderType: Enum["shop", "custom"],
  status: Enum[16 states],
  progressPercentage: Number, // 0-100 for custom orders
  currentMilestone: String,
  managerId: ObjectId,
  designerId: ObjectId,
  deliveryPersonId: ObjectId,
  deliveryOTP: { code, generatedAt, verified },
  shippingAddress: { name, email, phone, street, city, state, zipCode },
  paymentStatus: Enum["pending", "completed", "failed"],
  timeline: [{ status, note, by, at }]
}
```

### Design Schema

```javascript
{
  userId: ObjectId,
  designerId: ObjectId,
  name: String,
  category: String,
  fabric: String,
  color: String,
  pattern: String,
  size: String,
  graphic: String,
  customText: String,
  estimatedPrice: Number,
  basePrice: Number
}
```

## 🎨 Key Components

### Designer Dashboard (1345 lines)

**Features:**

- Shop status toggle (Open/Closed)
- 4 statistics cards (Pending, Accepted, In Production, Completed)
- Order cards with customer info and progress bars
- Chat panel slide-in with quick actions
- Progress modal with 8 milestone grid + manual slider
- Complete production modal with notes
- Status change confirmation modal

**State Management:**

- 15+ local state variables
- Redux selectors for orders, loading, messages
- useCallback for performance optimization

### Order Tracking System

**Features:**

- Real-time status updates
- Timeline visualization
- Production milestone progress
- Delivery OTP verification
- Live chat integration

## � Business Logic

### Designer Commission System

- **Designer Earnings**: 80% of order total
- **Platform Fee**: 20% of order total
- **Tiered Rates**: Earnings increase with total completed orders
- **Payout Minimum**: ₹500
- **Hold Period**: 7 days before earnings available for withdrawal

### Price Calculation

```javascript
basePrice = 500 (INR)
+ fabric cost (Cotton: 100, Silk: 200, Polyester: 50)
+ pattern cost (Solid: 0, Striped: 50, Printed: 100)
+ graphic cost (200 if graphic selected)
= total estimated price
```

### OTP Delivery System

- **Code Generation**: 4-digit random number
- **Validity**: Single-use only
- **Purpose**: Secure delivery confirmation
- **Verification**: Customer provides OTP to delivery person

## 🧪 Testing

### Test Credentials

| Role     | Email                  | Password    |
| -------- | ---------------------- | ----------- |
| Admin    | admin@designden.com    | admin123    |
| Manager  | manager@designden.com  | manager123  |
| Designer | designer@designden.com | designer123 |
| Delivery | delivery@designden.com | delivery123 |
| Customer | (signup to create)     | -           |

### Running Tests

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable: `VITE_API_URL`
4. Deploy

### Backend (Render.com)

1. Create new Web Service
2. Connect repository
3. Configure:
   - Build Command: (none needed)
   - Start Command: `node server.cjs`
4. Add environment variables:
   - `MONGODB_URI`
   - `EMAIL_USER`
   - `EMAIL_PASS`
5. Deploy

### Environment Variables

**Frontend (.env)**

```env
VITE_API_URL=https://backend-gw9o.onrender.com
```

**Backend**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/designden
PORT=5174
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Components**: 30+
- **Pages**: 40+
- **API Endpoints**: 100+
- **Database Collections**: 15+
- **User Roles**: 5
- **Order Status States**: 16
- **Production Milestones**: 8

## 🛠️ Development Guidelines

### Code Style

- Use ES6+ features
- Functional components with hooks
- Destructuring for props
- Meaningful variable names
- Comments for complex logic

### State Management Strategy

- **Redux**: Server data, complex state
- **Context**: UI state, auth, theme
- **Local State**: Component-specific data

### API Error Handling

```javascript
try {
  const response = await api.someEndpoint();
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error(error.response.data.message);
  } else if (error.request) {
    // No response from server
    console.error("Network error");
  } else {
    // Other errors
    console.error(error.message);
  }
}
```

## 🐛 Common Issues & Solutions

**Issue**: Images not loading
**Solution**: Use imports for images in src/assets

```javascript
import image from "../assets/images/image.jpg";
<img src={image} alt="..." />;
```

**Issue**: API calls failing
**Solution**:

- Check backend is running
- Verify VITE_API_URL in .env
- Check CORS configuration in server.cjs

**Issue**: Routes not working after deployment
**Solution**: Ensure vercel.json has correct rewrites configuration

**Issue**: 3D models not rendering
**Solution**:

- Models must be in public/models/
- Check file paths in clothingModels.js
- Verify Three.js dependencies installed

## 📚 Documentation

- **PROJECT_OVERVIEW.md** - Comprehensive technical documentation
- **DEPLOYMENT_CHECKLIST.md** - Deployment guide
- **MARKETPLACE_README.md** - Designer marketplace documentation
- **VERCEL_DEPLOYMENT.md** - Vercel-specific deployment guide
- **docs/** - Individual contributor documentation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- **Kumaraswamy** - Full Stack Development
- **Contributors** - See docs/ folder for individual contributions

## 🔗 Links

- **Live Demo**: https://design-den1.vercel.app
- **Backend API**: https://backend-gw9o.onrender.com
- **GitHub**: https://github.com/kumarswamyg2005/design-den1

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Email: kumaritsme1510@gmail.com

---

**Built with ❤️ using MERN Stack**

_Last Updated: January 30, 2026_
