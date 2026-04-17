const http = require('http');

const BASE_URL = 'http://localhost:5176';
const endpoints = [
  { method: 'GET', path: '/api/csrf-token', auth: false },
  { method: 'GET', path: '/api/auth/session', auth: false },
  { method: 'POST', path: '/api/auth/signup', auth: false },
  { method: 'POST', path: '/api/auth/login', auth: false },
  { method: 'POST', path: '/api/auth/logout', auth: true },
  { method: 'GET', path: '/api/auth/2fa/status', auth: true },
  { method: 'POST', path: '/api/auth/2fa/setup', auth: true },
  { method: 'POST', path: '/api/auth/2fa/verify', auth: true },
  { method: 'POST', path: '/api/auth/2fa/disable', auth: true },
  { method: 'POST', path: '/api/auth/2fa/send-login-code', auth: false },
  { method: 'GET', path: '/api/auth/2fa/backup-codes', auth: true },
  { method: 'GET', path: '/api/shop/products', auth: false },
  { method: 'GET', path: '/api/shop/featured', auth: false },
  { method: 'GET', path: '/api/designers', auth: false },
  { method: 'GET', path: '/api/customer/cart', auth: true },
  { method: 'POST', path: '/api/customer/cart', auth: true },
  { method: 'GET', path: '/api/customer/addresses', auth: true },
  { method: 'GET', path: '/api/customer/profile', auth: true },
  { method: 'GET', path: '/customer/api/orders', auth: true },
  { method: 'POST', path: '/customer/api/process-checkout', auth: true },
  { method: 'GET', path: '/customer/designs', auth: true },
  { method: 'GET', path: '/customer/wishlist/list', auth: true },
  { method: 'GET', path: '/api/pincode/560001', auth: false },
  { method: 'GET', path: '/api/delivery-partners', auth: false },
  { method: 'GET', path: '/api/marketplace/designers', auth: false },
  { method: 'GET', path: '/api/marketplace/designs', auth: false },
  { method: 'GET', path: '/api/graphics/available', auth: false },
  { method: 'GET', path: '/api/graphics/all', auth: true },
  { method: 'GET', path: '/api/platform/commission-info', auth: false },
  { method: 'POST', path: '/feedback/submit', auth: true },
  { method: 'GET', path: '/feedback/all', auth: true },
  { method: 'GET', path: '/designer/api/orders', auth: true },
  { method: 'GET', path: '/designer/dashboard', auth: true },
  { method: 'GET', path: '/api/designer/portfolio', auth: true },
  { method: 'GET', path: '/api/designer/profile', auth: true },
  { method: 'GET', path: '/api/designer/earnings', auth: true },
  { method: 'GET', path: '/api/designer/payout/requests', auth: true },
  { method: 'GET', path: '/manager/api/orders', auth: true },
  { method: 'GET', path: '/manager/dashboard', auth: true },
  { method: 'GET', path: '/manager/api/products', auth: true },
  { method: 'GET', path: '/manager/api/designers', auth: true },
  { method: 'GET', path: '/manager/api/delivery-persons', auth: true },
  { method: 'GET', path: '/delivery/api/orders', auth: true },
  { method: 'GET', path: '/delivery/dashboard', auth: true },
  { method: 'GET', path: '/delivery/api/statistics', auth: true },
  { method: 'GET', path: '/admin/api/users', auth: true },
  { method: 'GET', path: '/admin/api/user-stats', auth: true },
  { method: 'GET', path: '/admin/dashboard', auth: true },
  { method: 'GET', path: '/admin/feedbacks', auth: true },
  { method: 'GET', path: '/api/admin/designers', auth: true },
  { method: 'GET', path: '/api/admin/products', auth: true },
  { method: 'GET', path: '/api/admin/payout/requests', auth: true },
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, BASE_URL);
    const options = {
      method: endpoint.method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        let result = '✅ Working';
        
        if (status >= 500) {
          result = '❌ Server Error';
        } else if (status === 404) {
          result = '❌ Not Found';
        } else if (status === 401 && endpoint.auth) {
          result = '🔒 Auth Required (OK)';
        } else if (status === 401 && !endpoint.auth) {
          result = '⚠️  Unexpected Auth';
        } else if (status >= 400) {
          result = '⚠️  Client Error';
        }
        
        resolve({ ...endpoint, status, result });
      });
    });

    req.on('error', () => resolve({ ...endpoint, status: 0, result: '❌ Connection Failed' }));
    req.on('timeout', () => { req.destroy(); resolve({ ...endpoint, status: 0, result: '⏱️  Timeout' }); });
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing', endpoints.length, 'API endpoints...\n');
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    const authLabel = result.auth ? '🔒' : '🌐';
    console.log(`${result.result.padEnd(25)} ${authLabel} ${result.method.padEnd(6)} ${result.path} (${result.status})`);
  }
  
  console.log('\n📊 Summary:');
  const working = results.filter(r => r.status >= 200 && r.status < 300).length;
  const authRequired = results.filter(r => r.status === 401 && r.auth).length;
  const errors = results.filter(r => r.status >= 500 || r.status === 0 || r.status === 404).length;
  const warnings = results.filter(r => r.status >= 400 && r.status < 500 && !(r.status === 401 && r.auth)).length;
  
  console.log(`✅ Working: ${working}`);
  console.log(`🔒 Auth Required (Expected): ${authRequired}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📝 Total: ${results.length}`);
}

runTests();
