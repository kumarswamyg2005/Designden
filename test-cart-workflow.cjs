const http = require('http');

const BASE_URL = 'http://localhost:5173';
let sessionCookie = '';

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
  console.log('║              🧪 CART WORKFLOW COMPREHENSIVE TEST                     ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  let testsPassed = 0;
  let testsFailed = 0;
  let productId = null;
  let cartItemId = null;

  // TEST 1: Check server health
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: Server Health Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await makeRequest('GET', '/api/csrf-token');
    if (res.status === 200) {
      console.log('✅ Server is running and responding');
      testsPassed++;
    } else {
      console.log('❌ Server responded with status:', res.status);
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Server not reachable:', error.message);
    testsFailed++;
    return;
  }

  // TEST 2: Check session (is user logged in?)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: Session Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await makeRequest('GET', '/api/auth/session');
    if (res.data.success && res.data.user) {
      console.log('✅ User is logged in');
      console.log(`   User: ${res.data.user.username} (${res.data.user.role})`);
      testsPassed++;
      
      if (res.data.user.role !== 'customer') {
        console.log('⚠️  Warning: User role is not "customer" - cart operations may fail');
      }
    } else {
      console.log('❌ No active session - user not logged in');
      console.log('   Please login at http://localhost:5173 first!');
      testsFailed++;
      console.log('\n🛑 Stopping tests - login required for cart operations\n');
      return;
    }
  } catch (error) {
    console.log('❌ Session check failed:', error.message);
    testsFailed++;
    return;
  }

  // TEST 3: Get available products
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: Get Available Products');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await makeRequest('GET', '/api/shop/products');
    if (res.status === 200 && res.data.products && res.data.products.length > 0) {
      productId = res.data.products[0]._id;
      console.log(`✅ Found ${res.data.products.length} products`);
      console.log(`   Using product: ${res.data.products[0].name} (${productId})`);
      testsPassed++;
    } else {
      console.log('⚠️  No products found in database');
      console.log('   Will skip add-to-cart test');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Failed to fetch products:', error.message);
    testsFailed++;
  }

  // TEST 4: Get current cart
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 4: Get Current Cart');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const res = await makeRequest('GET', '/api/customer/cart');
    if (res.status === 200 && res.data.success) {
      console.log('✅ Cart retrieved successfully');
      console.log(`   Cart has ${res.data.cart.items.length} item(s)`);
      
      if (res.data.cart.items.length > 0) {
        cartItemId = res.data.cart.items[0]._id;
        console.log(`   First item ID: ${cartItemId}`);
      }
      testsPassed++;
    } else {
      console.log('❌ Failed to get cart:', res.data.message);
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Cart retrieval error:', error.message);
    testsFailed++;
  }

  // TEST 5: Add item to cart (if we have a product)
  if (productId) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 5: Add Item to Cart');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const res = await makeRequest('POST', '/api/customer/cart', {
        productId: productId,
        quantity: 2,
        size: 'M',
        color: 'Blue'
      });
      
      if (res.status === 200 && res.data.success) {
        console.log('✅ Item added to cart successfully');
        testsPassed++;
        
        // Get cart again to get the new item ID
        const cartRes = await makeRequest('GET', '/api/customer/cart');
        if (cartRes.data.cart.items.length > 0) {
          cartItemId = cartRes.data.cart.items[cartRes.data.cart.items.length - 1]._id;
          console.log(`   New cart item ID: ${cartItemId}`);
        }
      } else {
        console.log('❌ Failed to add item:', res.data.message);
        console.log('   Status:', res.status);
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Add to cart error:', error.message);
      testsFailed++;
    }
  }

  // TEST 6: Update cart item quantity
  if (cartItemId) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 6: Update Cart Item Quantity');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const res = await makeRequest('PUT', `/api/customer/cart/${cartItemId}`, {
        quantity: 5
      });
      
      if (res.status === 200 && res.data.success) {
        console.log('✅ Cart item quantity updated successfully');
        console.log('   New quantity: 5');
        testsPassed++;
      } else {
        console.log('❌ Failed to update cart item:', res.data.message);
        console.log('   Status:', res.status);
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Update cart error:', error.message);
      testsFailed++;
    }
  } else {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 6: Update Cart Item Quantity');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏭️  Skipped - no cart items available');
  }

  // TEST 7: Delete cart item
  if (cartItemId) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 7: Delete Cart Item');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const res = await makeRequest('DELETE', `/api/customer/cart/${cartItemId}`);
      
      if (res.status === 200 && res.data.success) {
        console.log('✅ Cart item deleted successfully');
        testsPassed++;
      } else {
        console.log('❌ Failed to delete cart item:', res.data.message);
        testsFailed++;
      }
    } catch (error) {
      console.log('❌ Delete cart error:', error.message);
      testsFailed++;
    }
  } else {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 7: Delete Cart Item');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏭️  Skipped - no cart items available');
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                         TEST SUMMARY                                 ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📊 Total Tests: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Cart workflow is working properly! ✅\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above for details.\n');
  }
}

testWorkflow().catch(err => {
  console.error('Fatal error:', err);
});
