const http = require('http');

http.get('http://localhost:5176/openapi.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const spec = JSON.parse(data);
      
      console.log('🔍 SWAGGER VALIDATION - CHECK 1 OF 3\n');
      console.log('='*60);
      
      // Check basic structure
      console.log('\n📋 Basic Structure:');
      console.log(`✅ OpenAPI Version: ${spec.openapi}`);
      console.log(`✅ API Title: ${spec.info.title}`);
      console.log(`✅ API Version: ${spec.info.version}`);
      
      // Check paths
      const paths = Object.keys(spec.paths || {});
      console.log(`\n✅ Total API Paths: ${paths.length}`);
      
      // Check operations
      let totalOps = 0;
      let opsWithoutSummary = 0;
      let opsWithoutResponses = 0;
      let methods = {};
      
      for (const [path, pathItem] of Object.entries(spec.paths || {})) {
        for (const [method, operation] of Object.entries(pathItem)) {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
            totalOps++;
            methods[method.toUpperCase()] = (methods[method.toUpperCase()] || 0) + 1;
            
            if (!operation.summary && !operation.description) {
              opsWithoutSummary++;
            }
            
            if (!operation.responses || Object.keys(operation.responses).length === 0) {
              opsWithoutResponses++;
              console.log(`   ❌ No responses: ${method.toUpperCase()} ${path}`);
            }
          }
        }
      }
      
      console.log(`✅ Total Operations: ${totalOps}`);
      console.log(`\n📊 Operations by Method:`);
      for (const [method, count] of Object.entries(methods)) {
        console.log(`   ${method}: ${count}`);
      }
      
      if (opsWithoutSummary > 0) {
        console.log(`\n⚠️  Operations without summary/description: ${opsWithoutSummary}`);
      }
      
      if (opsWithoutResponses > 0) {
        console.log(`\n❌ Operations without responses: ${opsWithoutResponses}`);
      } else {
        console.log('\n✅ All operations have response definitions');
      }
      
      // Check schemas
      const schemas = Object.keys(spec.components?.schemas || {});
      console.log(`\n✅ Total Schemas: ${schemas.length}`);
      
      // Check for undefined schema references
      const findRefs = (obj, refs = []) => {
        if (typeof obj === 'object' && obj !== null) {
          if (obj.$ref) refs.push(obj.$ref);
          for (const val of Object.values(obj)) {
            findRefs(val, refs);
          }
        }
        return refs;
      };
      
      const allRefs = findRefs(spec.paths);
      const schemaRefs = allRefs.filter(ref => ref.startsWith('#/components/schemas/'));
      const undefinedRefs = schemaRefs.filter(ref => {
        const schemaName = ref.split('/').pop();
        return !schemas.includes(schemaName);
      });
      
      if (undefinedRefs.length > 0) {
        console.log(`\n❌ Undefined schema references: ${undefinedRefs.length}`);
        [...new Set(undefinedRefs)].slice(0, 10).forEach(ref => {
          console.log(`   - ${ref}`);
        });
      } else {
        console.log('✅ All schema references are valid');
      }
      
      // Check security schemes
      const securitySchemes = Object.keys(spec.components?.securitySchemes || {});
      console.log(`\n✅ Security Schemes: ${securitySchemes.join(', ') || 'None'}`);
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ CHECK 1 COMPLETE\n');
      
    } catch (err) {
      console.error('❌ Failed to parse OpenAPI JSON:', err.message);
    }
  });
}).on('error', (err) => {
  console.error('❌ Failed to fetch OpenAPI spec:', err.message);
});
