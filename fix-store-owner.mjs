import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

// Configuración de Firebase (usar la misma que en tu app)
const firebaseConfig = {
  // Copia aquí tu configuración de Firebase
  // desde src/firebase.js
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixStoreOwner() {
  try {
    console.log('🔧 Verificando tienda Playcenter Universal...');
    
    const storeRef = doc(db, 'tiendas', 'playcenter_universal');
    const storeDoc = await getDoc(storeRef);
    
    if (storeDoc.exists()) {
      const data = storeDoc.data();
      console.log('📄 Datos actuales:', data);
      
      // Aquí necesitas poner TU UID de usuario
      // Ve a la consola del navegador cuando estés logueada para obtenerlo
      const YOUR_UID = 'TU_UID_AQUI'; // Reemplazar con tu UID real
      
      const updates = {
        ownerId: YOUR_UID,
        owner_id: YOUR_UID,
        createdBy: YOUR_UID,
        // También asegurar otros campos
        principal: true,
        estado: 'activa'
      };
      
      await updateDoc(storeRef, updates);
      console.log('✅ Tienda actualizada con ownership correcto');
      
    } else {
      console.log('❌ Tienda no encontrada');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixStoreOwner();
