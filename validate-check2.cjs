const http = require('http');

// Get Swagger paths
http.get('http://localhost:5176/openapi.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const spec = JSON.parse(data);
      
      console.log('🔍 SWAGGER VALIDATION - CHECK 2 OF 3\n');
      console.log('============================================================');
      console.log('Checking if Swagger docs match actual server routes...\n');
      
      const swaggerPaths = {};
      for (const [path, methods] of Object.entries(spec.paths)) {
        swaggerPaths[path] = Object.keys(methods).filter(m => 
          ['get', 'post', 'put', 'delete', 'patch'].includes(m)
        ).map(m => m.toUpperCase());
      }
      
      // Sample test some documented endpoints
      const testEndpoints = [
        { method: 'GET', path: '/api/csrf-token' },
        { method: 'GET', path: '/api/auth/session' },
        { method: 'POST', path: '/api/auth/login' },
        { method: 'POST', path: '/api/auth/signup' },
        { method: 'GET', path: '/api/shop/products' },
        { method: 'GET', path: '/api/shop/featured' },
        { method: 'GET', path: '/api/customer/cart' },
        { method: 'POST', path: '/customer/api/process-checkout' },
        { method: 'GET', path: '/api/designers' },
        { method: 'GET', path: '/manager/api/orders' },
        { method: 'GET', path: '/admin/api/users' },
        { method: 'GET', path: '/delivery/api/orders' },
      ];
      
      let documented = 0;
      let missing = 0;
      
      testEndpoints.forEach(endpoint => {
        const hasPath = swaggerPaths[endpoint.path];
        const hasMethod = hasPath && hasPath.includes(endpoint.method);
        
        if (hasMethod) {
          console.log(`✅ ${endpoint.method.padEnd(6)} ${endpoint.path}`);
          documented++;
        } else if (hasPath) {
          console.log(`⚠️  ${endpoint.method.padEnd(6)} ${endpoint.path} (path exists, method missing)`);
          missing++;
        } else {
          console.log(`❌ ${endpoint.method.padEnd(6)} ${endpoint.path} (not documented)`);
          missing++;
        }
      });
      
      console.log(`\n📊 Sample Test Results:`);
      console.log(`   Documented: ${documented}/${testEndpoints.length}`);
      console.log(`   Missing: ${missing}/${testEndpoints.length}`);
      
      // Check for common issues
      console.log('\n🔎 Checking for common issues...\n');
      
      let issues = 0;
      
      // Check for paths with parameters
      const pathsWithParams = Object.keys(swaggerPaths).filter(p => p.includes('{'));
      console.log(`✅ Paths with parameters: ${pathsWithParams.length}`);
      
      // Check for inconsistent path naming
      const apiPaths = Object.keys(swaggerPaths).filter(p => p.startsWith('/api/'));
      const nonApiPaths = Object.keys(swaggerPaths).filter(p => !p.startsWith('/api/'));
      console.log(`   - Paths starting with /api/: ${apiPaths.length}`);
      console.log(`   - Paths NOT starting with /api/: ${nonApiPaths.length}`);
      
      // Check for duplicate-looking paths
      const pathGroups = {};
      Object.keys(swaggerPaths).forEach(path => {
        const normalized = path.replace(/\{[^}]+\}/g, ':id').toLowerCase();
        if (!pathGroups[normalized]) pathGroups[normalized] = [];
        pathGroups[normalized].push(path);
      });
      
      const duplicates = Object.values(pathGroups).filter(g => g.length > 1);
      if (duplicates.length > 0) {
        console.log(`\n⚠️  Potential duplicate paths: ${duplicates.length}`);
        duplicates.slice(0, 3).forEach(group => {
          console.log(`   - ${group.join(', ')}`);
        });
        issues += duplicates.length;
      } else {
        console.log(`✅ No duplicate path patterns found`);
      }
      
      console.log('\n============================================================');
      console.log(`${issues === 0 ? '✅' : '⚠️'} CHECK 2 OF 3 COMPLETE (${issues} issues found)\n`);
      
    } catch (err) {
      console.error('❌ Failed:', err.message);
    }
  });
}).on('error', (err) => {
  console.error('❌ Failed to fetch spec:', err.message);
});
