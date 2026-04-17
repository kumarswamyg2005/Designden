const http = require('http');

const BASE_URL = 'http://localhost:5173';
let sessionCookie = '';

// Test credentials
const TEST_USER = {
  username: 'customer',
  password: 'password123'
};

// Helper to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    };
    
    if (sessionCookie) {
      options.headers['Cookie'] = sessionCookie;
    }

    const req = http.request(options, (res) => {
      // Capture cookies
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
      }

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testWorkflow() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║         🧪 CART WORKFLOW - COMPLETE END-TO-END TEST                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  let testsPassed = 0;
  let testsFailed = 0;
  let productId = null;
  let cartItemId = null;

  // TEST 1: Server Health
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: Server Health Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await makeRequest('GET', '/api/csrf-token');
    if (res.status === 200) {
      console.log('✅ Server responding');
      testsPassed++;
    } else {
      console.log('❌ Server error:', res.status);
      testsFailed++;
      return;
    }
  } catch (error) {
    console.log('❌ Server unreachable:', error.message);
    testsFailed++;
    return;
  }

  // TEST 2: Login
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: User Login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await makeRequest('POST', '/api/auth/login', TEST_USER);
    if (res.status === 200 && res.data.success && res.data.user) {
      console.log(`✅ Login successful`);
      console.log(`   User: ${res.data.user.username} (${res.data.user.role})`);
      testsPassed++;
    } else {
      console.log('❌ Login failed:', res.data.message || 'Unknown error');
      console.log('   Note: Make sure user exists with username="customer", password="password123"');
      testsFailed++;
      return;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    testsFailed++;
    return;
  }

  // TEST 3: Verify Session
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: Verify Session Persistence');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await makeRequest('GET', '/api/auth/session');
    if (res.data.success && res.data.user) {
      console.log('✅ Session is persistent');
      testsPassed++;
    } else {
      console.log('❌ Session not maintained');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Session check failed:', error.message);
    testsFailed++;
  }

  // TEST 4: Get Products
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 4: Fetch Available Products');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await makeRequest('GET', '/api/shop/products');
    if (res.status === 200 && res.data.products && res.data.products.length > 0) {
      productId = res.data.products[0]._id;
      console.log(`✅ Found ${res.data.products.length} products`);
      console.log(`   Selected: "${res.data.products[0].name}"`);
      testsPassed++;
    } else {
      console.log('⚠️  No products in database - skipping add to cart');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Product fetch failed:', error.message);
    testsFailed++;
  }

  // TEST 5: Get Cart (Initial State)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 5: Get Cart (Initial State)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await makeRequest('GET', '/api/customer/cart');
    if (res.status === 200 && res.data.success) {
      console.log(`✅ Cart retrieved`);
      console.log(`   Initial items: ${res.data.cart.items.length}`);
      testsPassed++;
    } else {
      console.log('❌ Cart retrieval failed:', res.data.message);
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Cart error:', error.message);
    testsFailed++;
  }

  // TEST 6: Add Item to Cart
  if (productId) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 6: Add Item to Cart');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const res = await makeRequest('POST', '/api/customer/cart', {
        productId: productId,
        quantity: 2,
        size: 'M',
        color: 'Blue'
      });
      
      if (res.status === 200 && res.data.success) {
        console.log('✅ Item added to cart');
        console.log('   Quantity: 2, Size: M, Color: Blue');
        testsPassed++;
        
        // Get cart to retrieve item ID
        const cartRes = await makeRequest('GET', '/api/customer/cart');
        if (cartRes.data.cart.items.length > 0) {
          cartItemId = cartRes.data.cart.items[cartRes.data.cart.items.length - 1]._id;
          console.log(`   Cart item ID: ${cartItemId}`);
        }
      } else {
        console.log('❌ Add to cart failed:', res.data.message);
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Add to cart error:', error.message);
      testsFailed++;
    }
  }

  // TEST 7: Update Cart Item
  if (cartItemId) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 7: Update Cart Item Quantity');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const res = await makeRequest('PUT', `/api/customer/cart/${cartItemId}`, {
        quantity: 5
      });
      
      if (res.status === 200 && res.data.success) {
        console.log('✅ Quantity updated: 2 → 5');
        testsPassed++;
      } else {
        console.log('❌ Update failed:', res.data.message);
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Update error:', error.message);
      testsFailed++;
    }
  }

  // TEST 8: Verify Update
  if (cartItemId) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 8: Verify Quantity Update');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const res = await makeRequest('GET', '/api/customer/cart');
      const item = res.data.cart.items.find(i => i._id === cartItemId);
      
      if (item && item.quantity === 5) {
        console.log('✅ Update verified - quantity is now 5');
        testsPassed++;
      } else {
        console.log('❌ Update not reflected - quantity is', item?.quantity);
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Verification error:', error.message);
      testsFailed++;
    }
  }

  // TEST 9: Delete Cart Item
  if (cartItemId) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 9: Delete Cart Item');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const res = await makeRequest('DELETE', `/api/customer/cart/${cartItemId}`);
      
      if (res.status === 200 && res.data.success) {
        console.log('✅ Item deleted from cart');
        testsPassed++;
      } else {
        console.log('❌ Delete failed:', res.data.message);
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Delete error:', error.message);
      testsFailed++;
    }
  }

  // TEST 10: Verify Deletion
  if (cartItemId) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 10: Verify Item Deletion');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const res = await makeRequest('GET', '/api/customer/cart');
      const item = res.data.cart.items.find(i => i._id === cartItemId);
      
      if (!item) {
        console.log('✅ Deletion verified - item no longer in cart');
        testsPassed++;
      } else {
        console.log('❌ Item still in cart after deletion');
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Verification error:', error.message);
      testsFailed++;
    }
  }

  // TEST 11: Logout
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 11: User Logout');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await makeRequest('POST', '/api/auth/logout');
    if (res.status === 200 && res.data.success) {
      console.log('✅ Logout successful');
      testsPassed++;
    } else {
      console.log('❌ Logout failed');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Logout error:', error.message);
    testsFailed++;
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                         📊 TEST SUMMARY                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
  
  const total = testsPassed + testsFailed;
  const successRate = ((testsPassed / total) * 100).toFixed(1);
  
  console.log(`✅ Tests Passed: ${testsPassed}/${total}`);
  console.log(`❌ Tests Failed: ${testsFailed}/${total}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 SUCCESS! CART WORKFLOW IS 100% FUNCTIONAL! 🎉');
    console.log('\n✨ All operations work correctly:');
    console.log('   • User login & session management ✅');
    console.log('   • Get cart ✅');
    console.log('   • Add items to cart ✅');
    console.log('   • Update cart item quantity ✅');
    console.log('   • Delete cart items ✅');
    console.log('   • User logout ✅\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review the errors above.\n');
  }
}

testWorkflow().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
});
