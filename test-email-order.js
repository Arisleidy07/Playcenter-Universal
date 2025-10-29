/**
 * 🧪 SCRIPT DE PRUEBA - CREAR PEDIDO Y ENVIAR EMAIL
 * 
 * Este script crea un pedido de prueba en Firestore que activará
 * automáticamente la función onOrderCreated y enviará un email.
 * 
 * IMPORTANTE: Solo ejecutar DESPUÉS de que las Cloud Functions estén desplegadas
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Configuración de Firebase (usa las mismas variables de tu .env)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Crear un pedido de prueba
 */
async function createTestOrder() {
  console.log('🧪 Creando pedido de prueba...');
  
  try {
    const testOrder = {
      // Email del cliente (TU EMAIL)
      email: "arisleidy0712@gmail.com",
      customerEmail: "arisleidy0712@gmail.com",
      
      // Información del cliente
      customerName: "Arisleidy (Prueba)",
      userId: "test-user-id",
      
      // Estado del pedido
      status: "Pendiente",
      
      // Items del pedido
      items: [
        {
          name: "Nintendo Switch OLED",
          quantity: 1,
          price: 12500,
          imagen: "https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fnintendo-switch.jpg"
        },
        {
          name: "The Legend of Zelda: TOTK",
          quantity: 1,
          price: 3500,
          imagen: "https://firebasestorage.googleapis.com/v0/b/playcenter-universal.appspot.com/o/productos%2Fzelda.jpg"
        }
      ],
      
      // Total
      total: 16000,
      
      // Método de pago
      paymentMethod: "Tarjeta de crédito",
      
      // Dirección de entrega
      shippingAddress: {
        nombre: "Arisleidy",
        direccion: "Calle Principal #123",
        ciudad: "Santiago",
        provincia: "Santiago",
        codigoPostal: "51000",
        telefono: "809-555-1234"
      },
      
      // Timestamp
      createdAt: serverTimestamp(),
      
      // NO incluir emailSent para que la función envíe el email
      // emailSent: false
    };
    
    // Crear el documento en Firestore
    const docRef = await addDoc(collection(db, 'orders'), testOrder);
    
    console.log('✅ Pedido de prueba creado con ID:', docRef.id);
    console.log('📧 Deberías recibir un email en: arisleidy0712@gmail.com');
    console.log('⏱️  Espera 5-10 segundos...');
    console.log('');
    console.log('📬 Revisa tu bandeja de entrada (y spam si no lo ves)');
    console.log('');
    console.log('🔍 Para ver los logs de la función:');
    console.log('   firebase functions:log --only onOrderCreated');
    
  } catch (error) {
    console.error('❌ Error al crear pedido de prueba:', error);
  }
}

// Ejecutar el test
createTestOrder()
  .then(() => {
    console.log('\n✨ Script completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
