import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCraPDyyhOJs9IJtVMCe2b1VNFYkbtqWEg",
  authDomain: "playcenter-universal.firebaseapp.com",
  projectId: "playcenter-universal",
  storageBucket: "playcenter-universal.firebasestorage.app",
  messagingSenderId: "876884906641",
  appId: "1:876884906641:web:a0a5b7526b7f4161452530"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🧪 Creando pedido de prueba...\n');

// Crear pedido de prueba
const testOrder = {
  email: "arisleidy0712@gmail.com",
  customerEmail: "arisleidy0712@gmail.com",
  customerName: "Arisleidy (Prueba)",
  userId: "test-user-" + Date.now(),
  status: "Pendiente",
  items: [
    {
      name: "Nintendo Switch OLED",
      quantity: 1,
      price: 12500,
      imagen: "https://m.media-amazon.com/images/I/61yBP4W2mLL._AC_SL1500_.jpg"
    },
    {
      name: "The Legend of Zelda: Tears of the Kingdom",
      quantity: 1,
      price: 3500,
      imagen: "https://m.media-amazon.com/images/I/81A2wJ9v82L._AC_SL1500_.jpg"
    }
  ],
  total: 16000,
  paymentMethod: "Tarjeta de crédito",
  shippingAddress: {
    nombre: "Arisleidy",
    direccion: "Calle Principal #123",
    ciudad: "Santiago",
    provincia: "Santiago",
    codigoPostal: "51000",
    telefono: "809-555-1234"
  },
  createdAt: new Date()
};

try {
  const docRef = await addDoc(collection(db, 'orders'), testOrder);
  console.log('✅ Pedido creado con ID:', docRef.id);
  console.log('\n📧 Email enviado a: arisleidy0712@gmail.com');
  console.log('⏱️  Espera 10-15 segundos...');
  console.log('\n📬 Revisa tu bandeja de entrada (y carpeta de spam)');
  console.log('\n🔍 Para ver los logs:');
  console.log('   firebase functions:log --only onOrderCreated\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
