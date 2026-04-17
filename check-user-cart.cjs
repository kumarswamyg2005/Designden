const http = require('http');

// First get session to see if logged in
http.get('http://localhost:5173/api/auth/session', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const session = JSON.parse(data);
      
      console.log('🔍 SESSION CHECK:');
      console.log('Logged in:', session.success);
      
      if (!session.success) {
        console.log('\n❌ Not logged in! Please login first at http://localhost:5173');
        return;
      }
      
      console.log('User:', session.user.username, `(${session.user.role})`);
      
      // Now get cart
      http.get('http://localhost:5173/api/customer/cart', (res2) => {
        let cartData = '';
        res2.on('data', chunk => cartData += chunk);
        res2.on('end', () => {
          try {
            const cart = JSON.parse(cartData);
            
            console.log('\n🛒 CART CHECK:');
            if (!cart.success) {
              console.log('❌ Error:', cart.message);
              return;
            }
            
            if (!cart.cart || cart.cart.items.length === 0) {
              console.log('📭 Cart is empty!');
              console.log('\n💡 To test PUT, first add an item:');
              console.log('   POST http://localhost:5173/api/customer/cart');
              console.log('   Body: { "productId": "65abc123...", "quantity": 1, "size": "M", "color": "Blue" }');
              return;
            }
            
            console.log('✅ Cart has', cart.cart.items.length, 'item(s)\n');
            
            cart.cart.items.forEach((item, index) => {
              console.log(`Item ${index + 1}:`);
              console.log(`  Item ID: ${item._id} ⬅️ USE THIS for PUT request!`);
              console.log(`  Product: ${item.productId?.name || 'N/A'}`);
              console.log(`  Quantity: ${item.quantity}`);
              console.log(`  Size: ${item.size || 'N/A'}`);
              console.log(`  Color: ${item.color || 'N/A'}`);
              console.log('');
            });
            
            console.log('📝 To update an item, use:');
            console.log(`   PUT http://localhost:5173/api/customer/cart/${cart.cart.items[0]._id}`);
            console.log('   Body: { "quantity": 5 }');
            
          } catch (err) {
            console.error('Error parsing cart:', err.message);
          }
        });
      }).on('error', (err) => {
        console.error('Error fetching cart:', err.message);
      });
      
    } catch (err) {
      console.error('Error parsing session:', err.message);
    }
  });
}).on('error', (err) => {
  console.error('Error checking session:', err.message);
});
