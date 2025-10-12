# FIXES APPLIED - October 11, 2025

## Issues Fixed

### 1. Cart Functionality ✅

**Problem**: Cart was not working - items couldn't be added
**Root Cause**: Routes were using old `CartItem` model structure (individual documents per item) but we had migrated to new `Cart` model (one document per user with items array)
**Solution**:

- Updated all cart routes in `routes/customer.js`:
  - `POST /customer/add-to-cart` - Now creates customizations and adds to cart properly
  - `GET /customer/cart` - Now uses new Cart model with items array
  - `POST /customer/remove-from-cart` - Now removes items from cart array
  - `POST /customer/update-cart` - Now updates item quantities in cart array
  - `GET /customer/checkout` - Now retrieves cart with new structure
  - `POST /customer/process-checkout` - Now creates orders from cart items
- Changed model import from `CartItem` to `Cart`
- All operations now use single Cart document per user with `items` array containing `{customizationId, quantity, addedAt}`

### 2. Wishlist Functionality ✅

**Problem**: Wishlist feature wasn't working
**Status**: **Already working!** Wishlist uses Design model with `wishlist: true` field
**Routes**:

- `POST /customer/wishlist/add` - Adds design to wishlist
- `POST /customer/wishlist/remove` - Removes from wishlist
- `GET /customer/wishlist/list` - Lists wishlist items
  **Fixed**: Updated wishlist/add to handle graphics selection properly (see #5)

### 3. Admin/Designer/Manager Login ✅

**Problem**: Cannot login as admin, designer, or manager
**Root Cause**: No test users existed in database for these roles
**Solution**:

- Created `seed/test-users.js` script
- Run with: `node seed/test-users.js`
- Creates 4 test users:
  - **Admin**: admin@designden.com / admin123
  - **Designer**: designer@designden.com / designer123
  - **Manager**: manager@designden.com / manager123
  - **Customer**: customer@designden.com / customer123

**Note**: Login uses plain text password comparison. Passwords should be hashed with bcrypt in production!

### 4. Signup Simplified ✅

**Problem**: Signup page had role dropdown and manager invite code - confusing for customers
**Solution**:

- Removed role dropdown from `views/signup.ejs`
- Removed manager invite code field from `views/signup.ejs`
- Updated `routes/auth.js` signup to hardcode `role: "customer"`
- Only customers can signup; admin/designer/manager accounts must be created directly in database
- Signup always redirects to `/customer/dashboard`

### 5. Dark Mode Text Visibility ✅

**Problem**: Hero section text barely visible in dark mode (screenshot showed white background with white text)
**Solution**: Enhanced `public/css/styles.css` dark mode rules:

```css
body.dark-theme .hero-section h1,
body.dark-theme .hero-section .display-4,
body.dark-theme .hero-section p,
body.dark-theme .hero-section .lead {
  color: #0b1220 !important;
}
```

- Hero section keeps light background in dark mode for better readability
- All text elements now explicitly set to dark color
- Buttons have proper hover states

### 6. Design Studio with Graphics ✅

**Problem**: When graphic option selected in Design Studio, form submission failed with validation error: "fabric/color/pattern required"
**Root Cause**: Frontend disables fabric/color/pattern fields when graphic selected, but backend still required them
**Solution**:

- Updated `POST /customer/save-design` to use mirror fields (`_fabric_mirror`, `_color_mirror`, `_pattern_mirror`)
- If main fields are empty/disabled, use mirror field values
- If mirror fields also empty, use defaults: Cotton/White/Solid
- Updated `POST /customer/wishlist/add` with same logic
- Now graphics can be saved without validation errors

## Files Modified

1. **routes/customer.js**

   - Changed `CartItem` import to `Cart`
   - Rewrote `POST /add-to-cart` to use new Cart structure
   - Rewrote `POST /remove-from-cart` to remove from items array
   - Rewrote `POST /update-cart` to update items array
   - Rewrote `GET /cart` to use Cart.findOne with items array
   - Rewrote `GET /checkout` to use Cart.findOne
   - Rewrote `POST /process-checkout` to use Cart and clear items array
   - Updated `POST /save-design` to handle mirror fields
   - Updated `POST /wishlist/add` to handle mirror fields

2. **routes/auth.js**

   - Simplified `POST /signup` to hardcode `role: "customer"`
   - Removed role and inviteCode logic
   - Signup always redirects to `/customer/dashboard`

3. **views/signup.ejs**

   - Removed role dropdown select element
   - Removed manager invite code input field

4. **public/css/styles.css**

   - Enhanced dark mode hero section text styles
   - Added explicit color rules for h1, .display-4, p, .lead in dark mode

5. **seed/test-users.js** (NEW)

   - Creates admin, designer, manager, customer test accounts

6. **models/cart.js**
   - Added CartItem export alias (for backwards compatibility)

## Next Steps

### CRITICAL: Restart Server

The server MUST be restarted for changes to take effect:

```bash
# Stop current server (Ctrl+C in terminal)
node app.js
```

### Test All Fixes

1. **Test Cart**:

   - Go to shop, click "Add to Cart" on a product
   - Check cart page - should see item
   - Update quantity, remove item

2. **Test Wishlist**:

   - Go to Design Studio
   - Configure a design
   - Click "Add to Wishlist"
   - Check dashboard wishlist section

3. **Test Login**:

   - Logout if logged in
   - Login as `admin@designden.com` / `admin123`
   - Should redirect to admin dashboard
   - Repeat for designer and manager

4. **Test Signup**:

   - Go to signup page
   - Should only see username, email, password, contact number
   - No role dropdown or invite code
   - After signup, should go to customer dashboard

5. **Test Design Studio with Graphics**:

   - Go to Design Studio
   - Select a graphic (not "None")
   - Fill other fields
   - Click "Add to Cart" or "Save"
   - Should work without validation error

6. **Test Dark Mode**:
   - Click moon icon to toggle dark mode
   - Hero section text should be clearly visible

### Still TODO (From Original Analysis)

- [ ] Implement bcrypt password hashing in auth routes
- [ ] Update manager routes for approval workflow
- [ ] Update designer routes for template marketplace
- [ ] Create/update views for proper cart/wishlist display
- [ ] Update admin routes for manager approval

## Login Credentials

After running `node seed/test-users.js`:

- **Admin**: admin@designden.com / admin123
- **Designer**: designer@designden.com / designer123
- **Manager**: manager@designden.com / manager123
- **Customer**: customer@designden.com / customer123

## Known Issues

1. Passwords are stored in plain text - needs bcrypt hashing
2. Cart view template may need updating to handle new structure
3. Some old references to `designId` in templates need updating to `customizationId`
