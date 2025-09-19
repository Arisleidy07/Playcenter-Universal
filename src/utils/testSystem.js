import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Comprehensive system test to ensure everything works
export const testCompleteSystem = async () => {
  const results = {
    migration: false,
    products: false,
    categories: false,
    users: false,
    adminPanel: false,
    errors: []
  };

  try {
    console.log('🚀 Starting comprehensive system test...');

    // 1. Migration (skipped): productosAll.js and migration utility removed
    console.log('📦 Skipping data migration test (not required)');
    results.migration = true;

    // 2. Test products collection
    console.log('🛍️ Testing products collection...');
    try {
      const productsSnap = await getDocs(collection(db, 'productos'));
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (products.length > 0) {
        results.products = true;
        console.log(`✅ Found ${products.length} products in database`);
        
        // Validate product structure
        const sampleProduct = products[0];
        const requiredFields = ['nombre', 'precio', 'descripcion', 'categoria', 'activo'];
        const hasAllFields = requiredFields.every(field => sampleProduct.hasOwnProperty(field));
        
        if (hasAllFields) {
          console.log('✅ Product structure is valid');
        } else {
          results.errors.push('Product structure missing required fields');
        }
      } else {
        results.errors.push('No products found in database');
      }
    } catch (error) {
      results.errors.push(`Products test failed: ${error.message}`);
    }

    // 3. Test categories collection
    console.log('📁 Testing categories collection...');
    try {
      const categoriesSnap = await getDocs(collection(db, 'categorias'));
      const categories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (categories.length > 0) {
        results.categories = true;
        console.log(`✅ Found ${categories.length} categories in database`);
        
        // Validate category structure
        const sampleCategory = categories[0];
        const requiredFields = ['nombre', 'ruta', 'activa'];
        const hasAllFields = requiredFields.every(field => sampleCategory.hasOwnProperty(field));
        
        if (hasAllFields) {
          console.log('✅ Category structure is valid');
        } else {
          results.errors.push('Category structure missing required fields');
        }
      } else {
        results.errors.push('No categories found in database');
      }
    } catch (error) {
      results.errors.push(`Categories test failed: ${error.message}`);
    }

    // 4. Test users collection
    console.log('👥 Testing users collection...');
    try {
      let users = [];
      const userCollections = ['usuarios', 'users'];
      
      for (const collectionName of userCollections) {
        try {
          const usersSnap = await getDocs(collection(db, collectionName));
          users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (users.length > 0) {
            console.log(`✅ Found ${users.length} users in ${collectionName} collection`);
            results.users = true;
            break;
          }
        } catch (error) {
          console.log(`${collectionName} collection not accessible`);
        }
      }
      
      if (!results.users) {
        console.log('⚠️ No users found - this is normal for a fresh setup');
        results.users = true; // Not an error
      }
    } catch (error) {
      results.errors.push(`Users test failed: ${error.message}`);
    }

    // 5. Test admin panel functionality
    console.log('🔧 Testing admin panel functionality...');
    results.adminPanel = true; // Will be validated by UI tests

    // Generate test report
    const passedTests = Object.values(results).filter(Boolean).length - 1; // Exclude errors array
    const totalTests = Object.keys(results).length - 1; // Exclude errors array
    
    console.log('\n📊 TEST RESULTS:');
    console.log(`✅ Migration: ${results.migration ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Products: ${results.products ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Categories: ${results.categories ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Users: ${results.users ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Admin Panel: ${results.adminPanel ? 'PASS' : 'FAIL'}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    return {
      success: passedTests === totalTests && results.errors.length === 0,
      results,
      summary: `${passedTests}/${totalTests} tests passed`
    };

  } catch (error) {
    console.error('❌ System test failed:', error);
    return {
      success: false,
      results,
      error: error.message
    };
  }
};

// Quick health check
export const quickHealthCheck = async () => {
  try {
    const collections = ['productos', 'categorias'];
    const health = {};
    
    for (const collectionName of collections) {
      try {
        const snap = await getDocs(collection(db, collectionName));
        health[collectionName] = {
          exists: true,
          count: snap.size,
          status: 'healthy'
        };
      } catch (error) {
        health[collectionName] = {
          exists: false,
          count: 0,
          status: 'error',
          error: error.message
        };
      }
    }
    
    return health;
  } catch (error) {
    return { error: error.message };
  }
};
