/**
 * DesignDen - Complete OpenAPI 3.0 Annotations
 * 
 * Role-Based Access Control (RBAC):
 * - customer: Shopping, orders, design studio, wishlist, reviews
 * - designer: Design fulfillment, portfolio, earnings, payouts
 * - manager: Production management, assign designers/delivery
 * - admin: System administration, user management, analytics
 * - delivery: Order pickup, delivery, OTP verification
 * 
 * Authentication: Session-based with cookies (connect.sid)
 * CSRF: Required for POST/PUT/DELETE via x-csrf-token header
 */

// =============================================================================
// SECURITY - CSRF Token
// =============================================================================

/**
 * @openapi
 * /api/csrf-token:
 *   get:
 *     tags: [Security]
 *     summary: Generate CSRF token
 *     description: |
 *       Generates a CSRF token and stores it in session.
 *       **Must be called before any POST/PUT/DELETE request.**
 *       Include the returned token in the `x-csrf-token` header.
 *     responses:
 *       200:
 *         description: CSRF token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 csrfToken:
 *                   type: string
 *                   example: "abc123def456..."
 */

// =============================================================================
// AUTHENTICATION
// =============================================================================

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     description: |
 *       Authenticates user and creates a session cookie.
 *       
 *       **2FA Flow**: If user has 2FA enabled:
 *       1. First call returns `requires2FA: true`
 *       2. Code is sent to user's email
 *       3. Call login again with `twoFactorCode` included
 *       
 *       **Rate Limited**: 5 attempts per 30 seconds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             normalLogin:
 *               summary: Standard login
 *               value:
 *                 email: "customer@example.com"
 *                 password: "password123"
 *             with2FA:
 *               summary: Login with 2FA code
 *               value:
 *                 email: "customer@example.com"
 *                 password: "password123"
 *                 twoFactorCode: "123456"
 *     responses:
 *       200:
 *         description: Login successful or 2FA required
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/AuthSuccessResponse'
 *                 - $ref: '#/components/schemas/TwoFactorRequiredResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many login attempts
 */

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register new user account
 *     description: |
 *       Creates a new user account.
 *       
 *       **Role Restrictions**:
 *       - `customer` and `delivery`: Auto-approved
 *       - `designer` and `manager`: Requires admin approval
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           example:
 *             username: "johndoe"
 *             name: "John Doe"
 *             email: "john@example.com"
 *             password: "password123"
 *             contactNumber: "+91 9876543210"
 *             role: "customer"
 *     responses:
 *       200:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       400:
 *         description: User already exists or validation error
 */

/**
 * @openapi
 * /api/auth/session:
 *   get:
 *     tags: [Auth]
 *     summary: Get current session
 *     description: Returns the logged-in user from session cookie. Use to check authentication state.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Session state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 authenticated:
 *                   type: boolean
 *                 user:
 *                   nullable: true
 *                   $ref: '#/components/schemas/UserSession'
 */

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     description: Destroys the session and clears the cookie.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 */

// =============================================================================
// TWO-FACTOR AUTHENTICATION
// =============================================================================

/**
 * @openapi
 * /api/auth/2fa/setup:
 *   post:
 *     tags: [2FA]
 *     summary: Start 2FA setup
 *     description: |
 *       Initiates 2FA setup by sending verification code to user's email.
 *       **Required**: User must be logged in.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Verification code sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "2FA verification code sent to your email"
 *                 method:
 *                   type: string
 *                   example: "email"
 *       401:
 *         description: Not authenticated
 */

/**
 * @openapi
 * /api/auth/2fa/verify:
 *   post:
 *     tags: [2FA]
 *     summary: Verify 2FA code and enable
 *     description: Verifies the setup code and enables 2FA for the account.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit verification code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA enabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 *       400:
 *         description: Invalid or expired code
 */

/**
 * @openapi
 * /api/auth/2fa/send-login-code:
 *   post:
 *     tags: [2FA]
 *     summary: Resend 2FA login code
 *     description: |
 *       Resends the 2FA verification code during login.
 *       Use when the original code expires (5 minutes).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Code resent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 */

/**
 * @openapi
 * /api/auth/2fa/disable:
 *   post:
 *     tags: [2FA]
 *     summary: Disable 2FA
 *     description: Disables 2FA after password verification.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current account password for verification
 *     responses:
 *       200:
 *         description: 2FA disabled
 *       401:
 *         description: Invalid password
 */

/**
 * @openapi
 * /api/auth/2fa/status:
 *   get:
 *     tags: [2FA]
 *     summary: Get 2FA status
 *     description: Returns whether 2FA is enabled for the current user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 2FA status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 twoFactorEnabled:
 *                   type: boolean
 *                 method:
 *                   type: string
 *                   example: "email"
 */

/**
 * @openapi
 * /api/auth/2fa/backup-codes:
 *   post:
 *     tags: [2FA]
 *     summary: Generate backup codes
 *     description: Generates one-time backup codes for account recovery.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Backup codes generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 */

// =============================================================================
// SHOP - PUBLIC PRODUCT CATALOG
// =============================================================================

/**
 * @openapi
 * /api/shop/products:
 *   get:
 *     tags: [Shop]
 *     summary: List shop products
 *     description: |
 *       Returns products available in the shop.
 *       **Public endpoint** - no authentication required.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (T-Shirt, Shirt, Dress, etc.)
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Men, Women, Unisex]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */

/**
 * @openapi
 * /api/shop/products/{id}:
 *   get:
 *     tags: [Shop]
 *     summary: Get product by ID
 *     description: Returns detailed information about a specific product.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ObjectId
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */

/**
 * @openapi
 * /api/shop/featured:
 *   get:
 *     tags: [Shop]
 *     summary: Get featured products
 *     description: Returns products marked as featured for homepage display.
 *     responses:
 *       200:
 *         description: Featured products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */

// =============================================================================
// CART - CUSTOMER ONLY
// =============================================================================

/**
 * @openapi
 * /api/customer/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get shopping cart
 *     description: |
 *       Returns the current user's shopping cart with populated product details.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart contents
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a customer account
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     description: |
 *       Adds a product or custom design to the shopping cart.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *           examples:
 *             shopItem:
 *               summary: Add shop product
 *               value:
 *                 productId: "65abc123..."
 *                 quantity: 2
 *                 size: "M"
 *                 color: "Blue"
 *             customDesign:
 *               summary: Add custom design
 *               value:
 *                 designId: "65def456..."
 *                 quantity: 1
 *                 size: "L"
 *     responses:
 *       200:
 *         description: Item added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessageResponse'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a customer account
 */

/**
 * @openapi
 * /api/customer/cart/{itemId}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 *     description: |
 *       Updates the quantity of an item in the cart.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Quantity updated
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     description: |
 *       Removes an item from the shopping cart.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed
 */

// =============================================================================
// CHECKOUT - CUSTOMER ONLY
// =============================================================================

/**
 * @openapi
 * /customer/api/process-checkout:
 *   post:
 *     tags: [Checkout]
 *     summary: Process checkout and create orders
 *     description: |
 *       Creates order(s) from cart items or provided items.
 *       
 *       **Role Required**: `customer`
 *       
 *       **Flow**:
 *       1. Validates shipping address and payment method
 *       2. Creates separate orders for shop items vs custom designs
 *       3. Generates order number (DD-YYYYMMDD-NNNN)
 *       4. Clears cart on success
 *       5. Assigns to manager for processing
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *           example:
 *             paymentMethod: "card"
 *             shippingAddress:
 *               name: "John Doe"
 *               phone: "+91 9876543210"
 *               street: "123 Main Street"
 *               city: "Mumbai"
 *               state: "Maharashtra"
 *               zipCode: "400001"
 *             notes: "Please deliver to security"
 *     responses:
 *       200:
 *         description: Order(s) created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderSummary'
 *       400:
 *         description: Empty cart or validation error
 *       401:
 *         description: Not authenticated
 */

// =============================================================================
// CUSTOMER ORDERS
// =============================================================================

/**
 * @openapi
 * /customer/api/orders:
 *   get:
 *     tags: [Customer Orders]
 *     summary: Get customer's orders
 *     description: |
 *       Returns all orders placed by the logged-in customer.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Order list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderSummary'
 */

/**
 * @openapi
 * /customer/order/{id}:
 *   get:
 *     tags: [Customer Orders]
 *     summary: Get order details
 *     description: |
 *       Returns detailed information about a specific order.
 *       Customer can only view their own orders.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ObjectId
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       403:
 *         description: Not authorized to view this order
 *       404:
 *         description: Order not found
 */

/**
 * @openapi
 * /customer/order/{id}/cancel:
 *   post:
 *     tags: [Customer Orders]
 *     summary: Cancel an order
 *     description: |
 *       Cancels an order if it's still in cancellable status (pending, confirmed).
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Order cannot be cancelled (already in production/shipped)
 */

/**
 * @openapi
 * /customer/api/order/{id}/tracking:
 *   get:
 *     tags: [Customer Orders]
 *     summary: Get order tracking info
 *     description: |
 *       Returns detailed tracking information for an order.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tracking information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tracking:
 *                   $ref: '#/components/schemas/TrackingInfo'
 */

/**
 * @openapi
 * /api/orders/{id}/design/customer-approve:
 *   put:
 *     tags: [Customer Orders]
 *     summary: Approve submitted design
 *     description: |
 *       Customer approves the design submitted by designer.
 *       This allows production to begin.
 *       
 *       **Role Required**: `customer`
 *       **Order must be**: `design_pending_customer_approval`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Design approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/OrderDetail'
 */

/**
 * @openapi
 * /api/orders/{id}/design/customer-reject:
 *   put:
 *     tags: [Customer Orders]
 *     summary: Reject submitted design
 *     description: |
 *       Customer rejects the design and requests revision.
 *       Designer is notified to make changes.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Sleeves need to be longer"
 *     responses:
 *       200:
 *         description: Design rejected, revision requested
 */

// =============================================================================
// DESIGN STUDIO - CUSTOMER
// =============================================================================

/**
 * @openapi
 * /customer/save-design:
 *   post:
 *     tags: [Design Studio]
 *     summary: Save custom design
 *     description: |
 *       Saves a custom design created in the 3D Design Studio.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DesignCreateRequest'
 *           example:
 *             name: "My Custom Dragon Tee"
 *             category: "T-Shirt"
 *             gender: "Men"
 *             fabric: "Cotton"
 *             color: "#FFFFFF"
 *             pattern: "Solid"
 *             size: "M"
 *             graphic: "dragon1.png"
 *             estimatedPrice: 1200
 *             previewImage: "data:image/png;base64,..."
 *     responses:
 *       200:
 *         description: Design saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 design:
 *                   $ref: '#/components/schemas/Design'
 */

/**
 * @openapi
 * /customer/designs:
 *   get:
 *     tags: [Design Studio]
 *     summary: Get customer's saved designs
 *     description: |
 *       Returns all designs created by the logged-in customer.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Design list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 designs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Design'
 */

/**
 * @openapi
 * /customer/designs/{id}:
 *   get:
 *     tags: [Design Studio]
 *     summary: Get specific design
 *     description: |
 *       Returns details of a specific design.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Design details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 design:
 *                   $ref: '#/components/schemas/Design'
 */

// =============================================================================
// WISHLIST - CUSTOMER
// =============================================================================

/**
 * @openapi
 * /customer/wishlist/add:
 *   post:
 *     tags: [Wishlist]
 *     summary: Add item to wishlist
 *     description: |
 *       Adds a product or design to the customer's wishlist.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WishlistAddRequest'
 *     responses:
 *       200:
 *         description: Added to wishlist
 *       409:
 *         description: Item already in wishlist
 */

/**
 * @openapi
 * /customer/wishlist/list:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get wishlist
 *     description: |
 *       Returns the customer's wishlist with populated product details.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Wishlist items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 wishlist:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WishlistItem'
 */

/**
 * @openapi
 * /customer/wishlist/remove/{id}:
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove from wishlist
 *     description: |
 *       Removes an item from the wishlist.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wishlist item ObjectId
 *     responses:
 *       200:
 *         description: Item removed
 */

// =============================================================================
// ADDRESSES - CUSTOMER
// =============================================================================

/**
 * @openapi
 * /api/customer/addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: Get saved addresses
 *     description: |
 *       Returns all saved shipping addresses for the customer.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Address list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 addresses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SavedAddress'
 *   post:
 *     tags: [Addresses]
 *     summary: Add new address
 *     description: |
 *       Adds a new shipping address to the customer's account.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [street, city, state, pincode]
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address added
 */

/**
 * @openapi
 * /api/customer/addresses/{id}:
 *   put:
 *     tags: [Addresses]
 *     summary: Update address
 *     description: |
 *       Updates an existing saved address.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SavedAddress'
 *     responses:
 *       200:
 *         description: Address updated
 *   delete:
 *     tags: [Addresses]
 *     summary: Delete address
 *     description: |
 *       Deletes a saved address.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted
 */

/**
 * @openapi
 * /api/customer/profile:
 *   put:
 *     tags: [Addresses]
 *     summary: Update customer profile
 *     description: |
 *       Updates customer profile information.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */

// =============================================================================
// REVIEWS
// =============================================================================

/**
 * @openapi
 * /api/products/{productId}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get product reviews
 *     description: Returns all reviews for a product. **Public endpoint.**
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reviews with statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 stats:
 *                   $ref: '#/components/schemas/ReviewStats'
 *   post:
 *     tags: [Reviews]
 *     summary: Add product review
 *     description: |
 *       Adds a review for a product.
 *       Review is marked as "verified" if user has purchased the product.
 *       
 *       **Role Required**: `customer` (authenticated)
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreateRequest'
 *     responses:
 *       200:
 *         description: Review added
 *       400:
 *         description: Already reviewed this product
 */

/**
 * @openapi
 * /api/products/{productId}/can-review:
 *   get:
 *     tags: [Reviews]
 *     summary: Check if user can review
 *     description: |
 *       Checks if the current user can review the product.
 *       Returns whether they've purchased it and already reviewed.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review eligibility
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canReview:
 *                   type: boolean
 *                 hasPurchased:
 *                   type: boolean
 *                 hasReviewed:
 *                   type: boolean
 */

/**
 * @openapi
 * /api/reviews/{reviewId}:
 *   put:
 *     tags: [Reviews]
 *     summary: Update review
 *     description: |
 *       Updates an existing review. User can only update their own reviews.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreateRequest'
 *     responses:
 *       200:
 *         description: Review updated
 *       403:
 *         description: Not authorized to edit this review
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete review
 *     description: |
 *       Deletes a review. User can only delete their own reviews.
 *       
 *       **Role Required**: `customer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */

/**
 * @openapi
 * /api/reviews/{reviewId}/helpful:
 *   post:
 *     tags: [Reviews]
 *     summary: Mark review as helpful
 *     description: |
 *       Marks a review as helpful. Toggle action.
 *       
 *       **Requires authentication**
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Helpfulness toggled
 */

// =============================================================================
// DESIGNER DASHBOARD
// =============================================================================

/**
 * @openapi
 * /designer/dashboard:
 *   get:
 *     tags: [Designer Dashboard]
 *     summary: Get designer dashboard
 *     description: |
 *       Returns dashboard statistics for the designer.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                     pendingOrders:
 *                       type: integer
 *                     completedOrders:
 *                       type: integer
 *                     earnings:
 *                       type: number
 */

/**
 * @openapi
 * /designer/api/orders:
 *   get:
 *     tags: [Designer Dashboard]
 *     summary: Get designer's assigned orders
 *     description: |
 *       Returns all orders assigned to the logged-in designer.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Order list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderDetail'
 */

/**
 * @openapi
 * /designer/order/{id}:
 *   get:
 *     tags: [Designer Dashboard]
 *     summary: Get order details (designer view)
 *     description: |
 *       Returns detailed order information for assigned order.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       403:
 *         description: Order not assigned to this designer
 */

/**
 * @openapi
 * /designer/api/order/{id}/accept:
 *   post:
 *     tags: [Designer Dashboard]
 *     summary: Accept assigned order
 *     description: |
 *       Designer accepts an order assigned by manager.
 *       Status changes to `designer_accepted`.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order accepted
 */

/**
 * @openapi
 * /designer/api/order/{id}/submit-design:
 *   post:
 *     tags: [Designer Dashboard]
 *     summary: Submit design for approval
 *     description: |
 *       Designer submits completed design for customer approval.
 *       Status changes to `design_pending_customer_approval`.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DesignSubmitRequest'
 *     responses:
 *       200:
 *         description: Design submitted
 */

/**
 * @openapi
 * /api/orders/{id}/design/progress:
 *   put:
 *     tags: [Designer Dashboard]
 *     summary: Update design progress
 *     description: |
 *       Updates the design progress percentage.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DesignProgressRequest'
 *     responses:
 *       200:
 *         description: Progress updated
 */

/**
 * @openapi
 * /api/orders/{id}/design/submit:
 *   put:
 *     tags: [Designer Dashboard]
 *     summary: Submit design with files
 *     description: |
 *       Submits design files for the order.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DesignSubmitRequest'
 *     responses:
 *       200:
 *         description: Design submitted
 */

/**
 * @openapi
 * /api/orders/{id}/design/submit-to-manager:
 *   put:
 *     tags: [Designer Dashboard]
 *     summary: Submit to manager after customer approval
 *     description: |
 *       After customer approves design, designer submits to manager for production.
 *       Status changes to `design_ready`.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submitted to manager
 */

// =============================================================================
// DESIGNER PORTFOLIO & PROFILE
// =============================================================================

/**
 * @openapi
 * /api/designer/profile:
 *   get:
 *     tags: [Designer Portfolio]
 *     summary: Get designer's own profile
 *     description: |
 *       Returns the logged-in designer's profile information.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Designer profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 designer:
 *                   $ref: '#/components/schemas/Designer'
 *   put:
 *     tags: [Designer Portfolio]
 *     summary: Update designer profile
 *     description: |
 *       Updates the designer's profile information.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DesignerProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @openapi
 * /api/designer/portfolio:
 *   get:
 *     tags: [Designer Portfolio]
 *     summary: Get portfolio items
 *     description: |
 *       Returns the designer's portfolio items.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Portfolio items
 */

/**
 * @openapi
 * /api/designer/portfolio/{id}:
 *   put:
 *     tags: [Designer Portfolio]
 *     summary: Update portfolio item
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Portfolio item updated
 *   delete:
 *     tags: [Designer Portfolio]
 *     summary: Delete portfolio item
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Portfolio item deleted
 */

// =============================================================================
// DESIGNER EARNINGS
// =============================================================================

/**
 * @openapi
 * /api/designer/earnings:
 *   get:
 *     tags: [Designer Earnings]
 *     summary: Get earnings summary
 *     description: |
 *       Returns the designer's earnings breakdown.
 *       
 *       **Role Required**: `designer`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Earnings summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 earnings:
 *                   $ref: '#/components/schemas/EarningsSummary'
 */

/**
 * @openapi
 * /api/designer/payout/requests:
 *   get:
 *     tags: [Designer Earnings]
 *     summary: Get payout requests
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Payout requests
 */

/**
 * @openapi
 * /api/designer/payout/request:
 *   post:
 *     tags: [Designer Earnings]
 *     summary: Request payout
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayoutRequest'
 *     responses:
 *       200:
 *         description: Payout request created
 *       400:
 *         description: Insufficient available balance
 */

// =============================================================================
// MANAGER DASHBOARD
// =============================================================================

/**
 * @openapi
 * /manager/dashboard:
 *   get:
 *     tags: [Manager Dashboard]
 *     summary: Get manager dashboard
 *     description: |
 *       Returns dashboard statistics for production management.
 *       
 *       **Role Required**: `manager`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */

/**
 * @openapi
 * /manager/api/orders:
 *   get:
 *     tags: [Manager Dashboard]
 *     summary: Get all orders
 *     description: |
 *       Returns all orders with filtering options.
 *       
 *       **Role Required**: `manager`
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: orderType
 *         schema:
 *           type: string
 *           enum: [shop, custom]
 *     responses:
 *       200:
 *         description: Order list
 */

/**
 * @openapi
 * /manager/order/{id}:
 *   get:
 *     tags: [Manager Dashboard]
 *     summary: Get order details
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */

/**
 * @openapi
 * /manager/order/{id}/status:
 *   put:
 *     tags: [Manager Dashboard]
 *     summary: Update order status
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/OrderStatus'
 *     responses:
 *       200:
 *         description: Status updated
 */

// =============================================================================
// MANAGER - DESIGNER MANAGEMENT
// =============================================================================

/**
 * @openapi
 * /manager/api/designers:
 *   get:
 *     tags: [Manager - Designers]
 *     summary: Get available designers
 *     description: |
 *       Returns list of approved designers for order assignment.
 *       
 *       **Role Required**: `manager`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Designer list
 */

/**
 * @openapi
 * /manager/api/order/{id}/assign-designer:
 *   post:
 *     tags: [Manager - Designers]
 *     summary: Assign order to designer
 *     description: |
 *       Assigns a custom order to a designer.
 *       Status changes to `assigned_to_designer`.
 *       
 *       **Role Required**: `manager`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [designerId]
 *             properties:
 *               designerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order assigned
 */

/**
 * @openapi
 * /api/orders/{id}/design/approve:
 *   put:
 *     tags: [Manager - Designers]
 *     summary: Approve design
 *     description: |
 *       Manager approves the submitted design for production.
 *       
 *       **Role Required**: `manager`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Design approved
 */

/**
 * @openapi
 * /api/orders/{id}/design/reject:
 *   put:
 *     tags: [Manager - Designers]
 *     summary: Reject design
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Design rejected
 */

// =============================================================================
// PRODUCTION MANAGEMENT
// =============================================================================

/**
 * @openapi
 * /api/orders/{id}/production/start:
 *   put:
 *     tags: [Production]
 *     summary: Start production
 *     description: |
 *       Starts the production phase for an approved order.
 *       
 *       **Role Required**: `manager`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Production started
 */

/**
 * @openapi
 * /api/orders/{id}/production/progress:
 *   put:
 *     tags: [Production]
 *     summary: Update production progress
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductionProgressRequest'
 *     responses:
 *       200:
 *         description: Progress updated
 */

/**
 * @openapi
 * /api/orders/{id}/production/complete:
 *   put:
 *     tags: [Production]
 *     summary: Complete production
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Production completed
 */

/**
 * @openapi
 * /api/order/{orderId}/milestones:
 *   get:
 *     tags: [Production]
 *     summary: Get production milestones
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone list
 *   post:
 *     tags: [Production]
 *     summary: Add production milestone
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [milestone]
 *             properties:
 *               milestone:
 *                 $ref: '#/components/schemas/ProductionMilestone'
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Milestone added
 */

// =============================================================================
// MANAGER - DELIVERY ASSIGNMENT
// =============================================================================

/**
 * @openapi
 * /manager/api/delivery-persons:
 *   get:
 *     tags: [Manager - Delivery]
 *     summary: Get available delivery persons
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Delivery person list
 */

/**
 * @openapi
 * /manager/api/order/{id}/assign-delivery:
 *   post:
 *     tags: [Manager - Delivery]
 *     summary: Assign delivery person
 *     description: |
 *       Assigns a delivery person to a completed order.
 *       Generates delivery OTP for verification.
 *       
 *       **Role Required**: `manager`
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deliveryPersonId]
 *             properties:
 *               deliveryPersonId:
 *                 type: string
 *               deliverySlot:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   timeSlot:
 *                     type: string
 *     responses:
 *       200:
 *         description: Delivery assigned
 */

// =============================================================================
// MANAGER - PRODUCTS
// =============================================================================

/**
 * @openapi
 * /manager/api/products:
 *   get:
 *     tags: [Manager - Products]
 *     summary: Get all products
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Product list
 */

/**
 * @openapi
 * /manager/api/product/{id}/stock:
 *   put:
 *     tags: [Manager - Products]
 *     summary: Update product stock
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stockQuantity]
 *             properties:
 *               stockQuantity:
 *                 type: integer
 *               inStock:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Stock updated
 */

/**
 * @openapi
 * /manager/api/product:
 *   post:
 *     tags: [Manager - Products]
 *     summary: Add new product
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreateRequest'
 *     responses:
 *       200:
 *         description: Product added
 */

/**
 * @openapi
 * /manager/api/product/{id}:
 *   delete:
 *     tags: [Manager - Products]
 *     summary: Delete product
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */

// =============================================================================
// ADMIN DASHBOARD
// =============================================================================

/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     tags: [Admin Dashboard]
 *     summary: Get admin dashboard
 *     description: |
 *       Returns comprehensive dashboard statistics.
 *       
 *       **Role Required**: `admin`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */

/**
 * @openapi
 * /admin/api/orders:
 *   get:
 *     tags: [Admin Dashboard]
 *     summary: Get all orders (admin)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Orders with stats
 */

/**
 * @openapi
 * /admin/order/{id}:
 *   get:
 *     tags: [Admin Dashboard]
 *     summary: Get order details (admin)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */

/**
 * @openapi
 * /admin/order/{id}/status:
 *   put:
 *     tags: [Admin Dashboard]
 *     summary: Update order status (admin)
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/OrderStatus'
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @openapi
 * /admin/feedbacks:
 *   get:
 *     tags: [Admin Dashboard]
 *     summary: Get all feedbacks
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Feedback list
 */

// =============================================================================
// ADMIN - USER MANAGEMENT
// =============================================================================

/**
 * @openapi
 * /admin/api/users:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Get all users
 *     description: |
 *       Returns all users with optional role filter.
 *       
 *       **Role Required**: `admin`
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, designer, manager, delivery]
 *     responses:
 *       200:
 *         description: User list
 */

/**
 * @openapi
 * /admin/api/user-stats:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Get user statistics
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 */

/**
 * @openapi
 * /api/admin/designers:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Get all designers
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Designer list
 */

/**
 * @openapi
 * /api/admin/designers/{id}:
 *   get:
 *     tags: [Admin - Users]
 *     summary: Get designer details
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Designer details
 */

/**
 * @openapi
 * /api/admin/designers/{id}/approve:
 *   put:
 *     tags: [Admin - Users]
 *     summary: Approve designer
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Designer approved
 */

/**
 * @openapi
 * /api/admin/designers/{id}:
 *   put:
 *     tags: [Admin - Users]
 *     summary: Update designer
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Designer updated
 */

// =============================================================================
// ADMIN - PAYOUTS
// =============================================================================

/**
 * @openapi
 * /api/admin/payout/requests:
 *   get:
 *     tags: [Admin - Payouts]
 *     summary: Get all payout requests
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Payout request list
 */

/**
 * @openapi
 * /api/admin/payout/{id}/process:
 *   put:
 *     tags: [Admin - Payouts]
 *     summary: Process payout request
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payout processed
 */

/**
 * @openapi
 * /api/admin/products:
 *   get:
 *     tags: [Admin Dashboard]
 *     summary: Get all products (admin)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Product list
 */

/**
 * @openapi
 * /api/admin/products/{id}:
 *   put:
 *     tags: [Admin Dashboard]
 *     summary: Update product (admin)
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated
 */

// =============================================================================
// DELIVERY DASHBOARD
// =============================================================================

/**
 * @openapi
 * /delivery/dashboard:
 *   get:
 *     tags: [Delivery Dashboard]
 *     summary: Get delivery dashboard
 *     description: |
 *       Returns dashboard for delivery person.
 *       
 *       **Role Required**: `delivery`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */

/**
 * @openapi
 * /delivery/api/orders:
 *   get:
 *     tags: [Delivery Dashboard]
 *     summary: Get assigned deliveries
 *     description: |
 *       Returns orders assigned to the delivery person.
 *       
 *       **Role Required**: `delivery`
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Delivery orders
 */

/**
 * @openapi
 * /delivery/order/{id}:
 *   get:
 *     tags: [Delivery Dashboard]
 *     summary: Get delivery order details
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery order details
 */

/**
 * @openapi
 * /delivery/api/statistics:
 *   get:
 *     tags: [Delivery Dashboard]
 *     summary: Get delivery statistics
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Delivery statistics
 */

/**
 * @openapi
 * /delivery/api/order/{id}/pickup:
 *   post:
 *     tags: [Delivery Dashboard]
 *     summary: Mark order as picked up
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order picked up
 */

/**
 * @openapi
 * /delivery/api/order/{id}/location:
 *   put:
 *     tags: [Delivery Dashboard]
 *     summary: Update delivery location
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated
 */

/**
 * @openapi
 * /delivery/api/order/{id}/in-transit:
 *   post:
 *     tags: [Delivery Dashboard]
 *     summary: Mark order in transit
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @openapi
 * /delivery/api/order/{id}/out-for-delivery:
 *   post:
 *     tags: [Delivery Dashboard]
 *     summary: Mark out for delivery
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @openapi
 * /delivery/api/order/{id}/deliver:
 *   post:
 *     tags: [Delivery Dashboard]
 *     summary: Complete delivery with OTP
 *     description: Verifies OTP and marks order as delivered.
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryVerifyOTPRequest'
 *     responses:
 *       200:
 *         description: Order delivered
 *       400:
 *         description: Invalid OTP
 */

// =============================================================================
// ORDER TRACKING
// =============================================================================

/**
 * @openapi
 * /api/order/{orderId}/track:
 *   get:
 *     tags: [Order Tracking]
 *     summary: Get order tracking information
 *     description: |
 *       Returns comprehensive tracking information including timeline and delivery status.
 *       
 *       **Requires authentication**
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tracking information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tracking:
 *                   $ref: '#/components/schemas/TrackingInfo'
 */

// =============================================================================
// MESSAGING
// =============================================================================

/**
 * @openapi
 * /api/order/{orderId}/messages:
 *   get:
 *     tags: [Messaging]
 *     summary: Get order messages
 *     description: |
 *       Returns conversation history for an order.
 *       
 *       **Requires authentication**
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message list
 *   post:
 *     tags: [Messaging]
 *     summary: Send message
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       200:
 *         description: Message sent
 */

/**
 * @openapi
 * /api/order/{orderId}/messages/unread:
 *   get:
 *     tags: [Messaging]
 *     summary: Get unread message count
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unread count
 */

// =============================================================================
// MARKETPLACE - PUBLIC
// =============================================================================

/**
 * @openapi
 * /api/designers:
 *   get:
 *     tags: [Marketplace]
 *     summary: Get designer marketplace
 *     description: Returns list of approved designers. **Public endpoint.**
 *     responses:
 *       200:
 *         description: Designer list
 */

/**
 * @openapi
 * /api/designers/{id}:
 *   get:
 *     tags: [Marketplace]
 *     summary: Get designer profile
 *     description: Returns public profile of a designer. **Public endpoint.**
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Designer profile
 */

/**
 * @openapi
 * /api/marketplace/designs:
 *   get:
 *     tags: [Marketplace]
 *     summary: Browse marketplace designs
 *     description: Returns designs available in marketplace. **Public endpoint.**
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: designer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Design list
 */

/**
 * @openapi
 * /api/marketplace/designers:
 *   get:
 *     tags: [Marketplace]
 *     summary: Browse marketplace designers
 *     description: Returns designers with availability and ratings. **Public endpoint.**
 *     responses:
 *       200:
 *         description: Designer list
 */

/**
 * @openapi
 * /api/marketplace/designers/{id}:
 *   get:
 *     tags: [Marketplace]
 *     summary: Get marketplace designer details
 *     description: Returns detailed designer profile with portfolio. **Public endpoint.**
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Designer details
 */

/**
 * @openapi
 * /api/platform/commission-info:
 *   get:
 *     tags: [Marketplace]
 *     summary: Get platform commission info
 *     description: Returns information about platform commission rates. **Public endpoint.**
 *     responses:
 *       200:
 *         description: Commission information
 */

// =============================================================================
// FEEDBACK
// =============================================================================

/**
 * @openapi
 * /feedback/submit:
 *   post:
 *     tags: [Feedback]
 *     summary: Submit feedback
 *     security:
 *       - cookieAuth: []
 *       - csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackSubmitRequest'
 *     responses:
 *       200:
 *         description: Feedback submitted
 */

/**
 * @openapi
 * /feedback/all:
 *   get:
 *     tags: [Feedback]
 *     summary: Get all feedbacks
 *     description: Returns all customer feedbacks. **Public endpoint.**
 *     responses:
 *       200:
 *         description: Feedback list
 */

// =============================================================================
// UTILITY ENDPOINTS
// =============================================================================

/**
 * @openapi
 * /api/pincode/{pincode}:
 *   get:
 *     tags: [Shop]
 *     summary: Check pincode serviceability
 *     description: Checks if delivery is available for a pincode. **Public endpoint.**
 *     parameters:
 *       - in: path
 *         name: pincode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pincode serviceability
 */

/**
 * @openapi
 * /api/delivery-partners:
 *   get:
 *     tags: [Shop]
 *     summary: Get delivery partners
 *     description: Returns available delivery partners. **Public endpoint.**
 *     responses:
 *       200:
 *         description: Delivery partner list
 */

/**
 * @openapi
 * /api/graphics/all:
 *   get:
 *     tags: [Design Studio]
 *     summary: Get all graphics
 *     description: Returns all available graphics for design studio. **Public endpoint.**
 *     responses:
 *       200:
 *         description: Graphics list
 */

/**
 * @openapi
 * /api/graphics/available:
 *   get:
 *     tags: [Design Studio]
 *     summary: Get available graphics
 *     description: Returns graphics available for use. **Public endpoint.**
 *     responses:
 *       200:
 *         description: Available graphics
 */

module.exports = {};
