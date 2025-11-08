#!/usr/bin/env node

/**
 * Script para migrar todos los productos existentes a la tienda Playcenter Universal
 * Agrega los campos tienda_id y tienda_nombre a cada producto
 * 
 * Uso: node scripts/migrate-products-to-store.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer configuración de Firebase desde .env.local
const envPath = join(__dirname, '..', '.env.local');
let firebaseConfig;

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  firebaseConfig = {
    apiKey: lines.find(l => l.startsWith('VITE_FIREBASE_API_KEY'))?.split('=')[1]?.trim(),
    authDomain: lines.find(l => l.startsWith('VITE_FIREBASE_AUTH_DOMAIN'))?.split('=')[1]?.trim(),
    projectId: lines.find(l => l.startsWith('VITE_FIREBASE_PROJECT_ID'))?.split('=')[1]?.trim(),
    storageBucket: lines.find(l => l.startsWith('VITE_FIREBASE_STORAGE_BUCKET'))?.split('=')[1]?.trim(),
    messagingSenderId: lines.find(l => l.startsWith('VITE_FIREBASE_MESSAGING_SENDER_ID'))?.split('=')[1]?.trim(),
    appId: lines.find(l => l.startsWith('VITE_FIREBASE_APP_ID'))?.split('=')[1]?.trim()
  };
} catch (error) {
  console.error('❌ Error leyendo .env.local:', error);
  process.exit(1);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateProductsToStore() {
  console.log('📦 Iniciando migración de productos...\n');
  
  try {
    // Obtener todos los productos
    const productosRef = collection(db, 'productos');
    const snapshot = await getDocs(productosRef);
    
    if (snapshot.empty) {
      console.log('⚠️  No se encontraron productos para migrar.');
      process.exit(0);
    }
    
    console.log(`📊 Total de productos encontrados: ${snapshot.size}\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    // Actualizar cada producto
    for (const docSnapshot of snapshot.docs) {
      const productId = docSnapshot.id;
      const productData = docSnapshot.data();
      
      // Verificar si ya tiene tienda asignada
      if (productData.tienda_id) {
        console.log(`⏭️  ${productData.nombre || productId} - Ya tiene tienda asignada (${productData.tienda_id})`);
        skipped++;
        continue;
      }
      
      try {
        // Actualizar con los campos de tienda
        const productRef = doc(db, 'productos', productId);
        await updateDoc(productRef, {
          tienda_id: 'playcenter_universal',
          tienda_nombre: 'Playcenter Universal'
        });
        
        console.log(`✅ ${productData.nombre || productId} - Asignado a Playcenter Universal`);
        updated++;
      } catch (error) {
        console.error(`❌ Error en ${productId}:`, error.message);
        errors++;
      }
    }
    
    // Resumen
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Actualizados:    ${updated}`);
    console.log(`⏭️  Omitidos:        ${skipped}`);
    console.log(`❌ Errores:         ${errors}`);
    console.log(`📦 Total:           ${snapshot.size}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (updated > 0) {
      console.log('🎉 Migración completada exitosamente!');
      console.log('\n📝 Siguiente paso:');
      console.log('   Los productos ahora tienen los campos:');
      console.log('   - tienda_id: "playcenter_universal"');
      console.log('   - tienda_nombre: "Playcenter Universal"\n');
    }
    
    process.exit(errors > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Error general en la migración:', error);
    process.exit(1);
  }
}

migrateProductsToStore();
