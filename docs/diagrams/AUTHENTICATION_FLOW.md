# Authentication & Security Flow

This diagram shows the complete authentication, authorization, and security mechanisms.

```mermaid
graph TD
    A[User Accesses Application] --> B{Authenticated?}
    B -->|No| C[Redirect to Login Page]
    B -->|Yes| D[Check Session Validity]

    C --> E[Login Form]
    E --> F[Enter Email & Password]
    F --> G[Submit Credentials]

    G --> H[POST /api/auth/login]
    H --> I{Rate Limit Check}
    I -->|Exceeded| J[429 Error - Wait 30s]
    I -->|OK| K[Validate Credentials]

    K --> L{Valid?}
    L -->|No| M[Return 401 Error]
    M --> N[Increment Failed Attempts]
    N --> O{Attempts > 5?}
    O -->|Yes| P[Temporary Lock - 30s]
    O -->|No| E
    P --> E

    L -->|Yes| Q[Generate 2FA OTP]
    Q --> R[Send Email via Nodemailer]
    R --> S[Store OTP in Session]
    S --> T[2FA Verification Page]

    T --> U[Enter OTP Code]
    U --> V[POST /api/auth/verify-otp]
    V --> W{OTP Valid?}
    W -->|No| X[Return 401 Error]
    X --> Y{Attempts < 3?}
    Y -->|Yes| T
    Y -->|No| Z[Session Destroyed]
    Z --> C

    W -->|Yes| AA[Create Session]
    AA --> AB[Set Session Cookie]
    AB --> AC[Store User Data]
    AC --> AD[Redirect to Dashboard]

    D --> AE{Session Valid?}
    AE -->|No| AF[Destroy Session]
    AF --> C
    AE -->|Yes| AG{User Role?}

    AG -->|Customer| AH[/customer/dashboard]
    AG -->|Designer| AI[/designer/dashboard]
    AG -->|Manager| AJ[/manager/dashboard]
    AG -->|Admin| AK[/admin/dashboard]
    AG -->|Delivery| AL[/delivery/dashboard]

    AH --> AM[Check isApproved]
    AI --> AN[Check isApproved]
    AJ --> AO[Check isApproved]
    AK --> AM
    AL --> AP[Check isApproved]

    AN --> AQ{Approved?}
    AO --> AQ
    AP --> AQ
    AM --> AR[Access Granted]

    AQ -->|No| AS[Pending Approval Page]
    AQ -->|Yes| AR

    AR --> AT[Protected Route Access]
    AT --> AU[Middleware Validation]
    AU --> AV{Authorization?}
    AV -->|No| AW[403 Forbidden]
    AV -->|Yes| AX[Resource Access Granted]

    AX --> AY[User Activity]
    AY --> AZ{Logout?}
    AZ -->|No| AY
    AZ -->|Yes| BA[POST /api/auth/logout]
    BA --> BB[Destroy Session]
    BB --> BC[Clear Cookies]
    BC --> BD[Redirect to Home]

    style A fill:#90EE90
    style AR fill:#FFD700
    style AW fill:#FF6B6B
    style BD fill:#87CEEB
```

## Authentication Components

### **1. Registration Flow**

#### **Endpoint**: `POST /api/auth/register`

```javascript
Request Body:
{
  email: "user@example.com",
  password: "securePassword123",
  name: "John Doe",
  phone: "1234567890",
  role: "customer|designer|manager|admin|delivery",
  address: { street, city, state, pincode }
}

Response:
{
  success: true,
  message: "Registration successful",
  user: { id, email, name, role, isApproved }
}
```

**Validation**:

- Email format check
- Password strength (min 6 characters)
- Phone number format
- Role verification
- Duplicate email check

**Password Hashing**:

```javascript
const bcrypt = require("bcrypt");
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

**Auto-Approval**:

- `customer` → ✅ Auto-approved
- `designer` → ❌ Requires admin approval
- `manager` → ❌ Requires admin approval
- `admin` → ❌ Manual creation only
- `delivery` → ❌ Requires admin approval

### **2. Login Flow**

#### **Endpoint**: `POST /api/auth/login`

```javascript
Request Body:
{
  email: "user@example.com",
  password: "securePassword123"
}

Response:
{
  success: true,
  message: "OTP sent to email",
  requiresOTP: true
}
```

**Steps**:

1. Rate limiting check (5 attempts per 30s)
2. Credential validation
3. Password comparison with bcrypt
4. Generate 6-digit OTP
5. Send email via Nodemailer
6. Store OTP in session (5-minute expiry)

**Rate Limiting**:

```javascript
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowsMs: 30 * 1000, // 30 seconds
  max: 5, // 5 attempts
  message: "Too many login attempts",
});
```

### **3. Two-Factor Authentication (2FA)**

#### **OTP Generation**

```javascript
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

#### **Email Template**

```html
Subject: DesignDen Login Verification Your OTP code is: 123456 This code expires
in 5 minutes. Do not share this code with anyone.
```

#### **Endpoint**: `POST /api/auth/verify-otp`

```javascript
Request Body:
{
  email: "user@example.com",
  otp: "123456"
}

Response:
{
  success: true,
  user: { id, email, name, role, isApproved },
  redirectUrl: "/customer/dashboard"
}
```

**Verification**:

- OTP match check
- Expiry validation (5 minutes)
- Attempt limit (3 max)
- Session creation on success

### **4. Session Management**

#### **Configuration**

```javascript
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  }),
);
```

#### **Session Data**

```javascript
req.session = {
  userId: "ObjectId",
  email: "user@example.com",
  role: "customer",
  isApproved: true,
  loginTime: Date.now(),
};
```

### **5. Authorization Middleware**

#### **Role-Based Access Control**

```javascript
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!req.session.isApproved) {
      return res.status(403).json({ error: "Account pending approval" });
    }

    next();
  };
}

// Usage
app.get("/api/designer/orders", requireRole("designer"), getDesignerOrders);
```

#### **Protected Routes**

| Route             | Roles Allowed |
| ----------------- | ------------- |
| `/api/customer/*` | customer      |
| `/api/designer/*` | designer      |
| `/api/manager/*`  | manager       |
| `/api/admin/*`    | admin         |
| `/api/delivery/*` | delivery      |

### **6. Security Headers (Helmet)**

```javascript
const helmet = require("helmet");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
    frameguard: { action: "deny" },
    xssFilter: true,
    noSniff: true,
  }),
);
```

**Protection Against**:

- XSS (Cross-Site Scripting)
- Clickjacking
- MIME sniffing
- Man-in-the-Middle attacks

### **7. CSRF Protection**

```javascript
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

// Apply to checkout endpoint
app.post("/api/customer/checkout", csrfProtection, handleCheckout);

// Generate token
app.get("/api/auth/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### **8. Password Reset Flow**

#### **Request Reset**

```javascript
POST /api/auth/forgot-password
Body: { email: "user@example.com" }

Response: {
  success: true,
  message: "Reset OTP sent to email"
}
```

#### **Verify & Reset**

```javascript
POST /api/auth/reset-password
Body: {
  email: "user@example.com",
  otp: "123456",
  newPassword: "newSecurePassword"
}

Response: {
  success: true,
  message: "Password updated successfully"
}
```

### **9. Logout Flow**

#### **Endpoint**: `POST /api/auth/logout`

```javascript
// Destroy session
req.session.destroy((err) => {
  if (err) {
    return res.status(500).json({ error: "Logout failed" });
  }

  // Clear cookie
  res.clearCookie("connect.sid");

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});
```

### **10. Security Best Practices**

#### **Password Requirements**

- Minimum 6 characters
- Stored as bcrypt hash (10 rounds)
- Never logged or exposed
- Reset via OTP only

#### **Session Security**

- HTTPOnly cookies
- Secure flag in production
- SameSite protection
- 7-day expiration
- MongoDB session store

#### **API Security**

- Rate limiting on authentication endpoints
- CORS configuration
- Request size limits (50MB for uploads)
- Input validation and sanitization

#### **Monitoring**

```javascript
const morgan = require("morgan");
app.use(morgan("combined")); // Log all requests
```

### **11. Error Handling**

| Error Code | Meaning           | Action              |
| ---------- | ----------------- | ------------------- |
| 401        | Unauthorized      | Redirect to login   |
| 403        | Forbidden         | Show access denied  |
| 429        | Too Many Requests | Rate limit exceeded |
| 500        | Server Error      | Show error message  |

### **12. Frontend Integration**

#### **API Service** (`src/services/api.js`)

```javascript
// Auto-include credentials
axios.defaults.withCredentials = true;

// Interceptor for 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

#### **Protected Route Component**

```javascript
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  if (!user.isApproved && user.role !== "customer") {
    return <Navigate to="/pending-approval" />;
  }

  return children;
}
```

## Testing Credentials

| Role     | Email                  | Password    | Approved |
| -------- | ---------------------- | ----------- | -------- |
| Admin    | admin@designden.com    | admin123    | ✅       |
| Manager  | manager@designden.com  | manager123  | ✅       |
| Designer | designer@designden.com | designer123 | ✅       |
| Delivery | delivery@designden.com | delivery123 | ✅       |
| Customer | (Signup)               | -           | ✅ Auto  |
