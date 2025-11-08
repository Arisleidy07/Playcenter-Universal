#!/usr/bin/env node

/**
 * Script para inicializar la tienda principal "Playcenter Universal"
 * Este script crea la tienda principal en Firestore
 * 
 * Uso: node scripts/init-playcenter-store.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

// Datos de la tienda principal
const playcenterStore = {
  id: 'playcenter_universal',
  nombre: 'Playcenter Universal',
  propietario_id: 'ADMIN', // Cambiar por tu userID real si lo conoces
  descripcion: 'Tienda oficial del sistema Playcenter Universal. Encuentra los mejores productos de tecnología, videojuegos y entretenimiento.',
  logo: '/logo.png', // Ajustar a la ruta real de tu logo
  banner: '/banner.jpg', // Ajustar a la ruta real de tu banner
  estado: 'activa',
  principal: true,
  fecha_creacion: serverTimestamp(),
  // Información adicional
  categorias_destacadas: [
    'Videojuegos',
    'Consolas',
    'Accesorios',
    'Tecnología'
  ],
  redes_sociales: {
    facebook: '',
    instagram: '',
    twitter: ''
  },
  contacto: {
    telefono: '',
    email: '',
    whatsapp: ''
  },
  estadisticas: {
    total_productos: 0,
    total_ventas: 0,
    valoracion_promedio: 5.0
  }
};

async function initializePlaycenterStore() {
  console.log('🏪 Inicializando tienda Playcenter Universal...\n');
  
  try {
    // Crear documento en Firestore
    const storeRef = doc(db, 'tiendas', 'playcenter_universal');
    await setDoc(storeRef, playcenterStore);
    
    console.log('✅ Tienda creada exitosamente!');
    console.log('\n📋 Detalles de la tienda:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ID:           ${playcenterStore.id}`);
    console.log(`Nombre:       ${playcenterStore.nombre}`);
    console.log(`Descripción:  ${playcenterStore.descripcion}`);
    console.log(`Estado:       ${playcenterStore.estado}`);
    console.log(`Principal:    ${playcenterStore.principal ? 'Sí' : 'No'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📝 Siguiente paso:');
    console.log('   Ejecuta: node scripts/migrate-products-to-store.mjs');
    console.log('   Para asignar todos los productos existentes a esta tienda.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear la tienda:', error);
    process.exit(1);
  }
}

initializePlaycenterStore();
