// Script para arreglar la conexión de la tienda del admin
// Ejecutar con: node scripts/fix-admin-store.mjs

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";

// Configuración de Firebase (copia de tu .env.local)
const firebaseConfig = {
  apiKey: "AIzaSyAJh1HiEj81NYcWdGwB_9k1ZfsCZZyQcaw",
  authDomain: "playcenter-universal.firebaseapp.com",
  projectId: "playcenter-universal",
  storageBucket: "playcenter-universal.firebasestorage.app",
  messagingSenderId: "676374706782",
  appId: "1:676374706782:web:b39edbb4f3d5aac34df4c3",
  measurementId: "G-LVXV11RCHY",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixAdminStore() {
  try {
    console.log("🔧 Iniciando corrección de tienda admin...\n");

    // 1. Verificar que existe la tienda playcenter_universal
    const storeDoc = await getDoc(doc(db, "tiendas", "playcenter_universal"));
    if (!storeDoc.exists()) {
      console.error(" No existe la tienda playcenter_universal");
      return;
    }
    console.log(" Tienda playcenter_universal encontrada");
    console.log("   Nombre:", storeDoc.data().nombre);

    // 2. Buscar usuarios admin
    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", "admin")
    );
    const usersSnap = await getDocs(usersQuery);

    if (usersSnap.empty) {
      console.log("⚠️  No se encontraron usuarios admin por role");

      // Buscar por isAdmin
      const usersQuery2 = query(
        collection(db, "users"),
        where("isAdmin", "==", true)
      );
      const usersSnap2 = await getDocs(usersQuery2);

      if (usersSnap2.empty) {
        console.log(" No se encontraron usuarios admin");
        return;
      }

      console.log(
        `\n📋 Encontrados ${usersSnap2.docs.length} usuarios admin por isAdmin`
      );
      await updateAdmins(usersSnap2.docs);
    } else {
      console.log(
        `\n📋 Encontrados ${usersSnap.docs.length} usuarios admin por role`
      );
      await updateAdmins(usersSnap.docs);
    }

    console.log("\n ¡Corrección completada!");
    process.exit(0);
  } catch (error) {
    console.error(" Error:", error);
    process.exit(1);
  }
}

async function updateAdmins(adminDocs) {
  for (const adminDoc of adminDocs) {
    const adminData = adminDoc.data();
    const adminId = adminDoc.id;

    console.log(
      `\n Procesando admin: ${adminData.displayName || adminData.email}`
    );
    console.log(`   UID: ${adminId}`);
    console.log(`   storeId actual: ${adminData.storeId || "ninguno"}`);

    // Actualizar perfil del admin
    if (adminData.storeId !== "playcenter_universal") {
      await updateDoc(doc(db, "users", adminId), {
        storeId: "playcenter_universal",
        storeName: "Playcenter Universal",
        isSeller: true,
      });
      console.log("    Perfil actualizado");
    } else {
      console.log("   ℹ️  Perfil ya tiene storeId correcto");
    }

    // Actualizar productos del admin
    const productosQuery = query(
      collection(db, "productos"),
      where("ownerUid", "==", adminId)
    );
    const productosSnap = await getDocs(productosQuery);

    console.log(`    Encontrados ${productosSnap.docs.length} productos`);

    let updatedCount = 0;
    for (const productDoc of productosSnap.docs) {
      const productData = productDoc.data();
      if (productData.storeId !== "playcenter_universal") {
        await updateDoc(doc(db, "productos", productDoc.id), {
          storeId: "playcenter_universal",
          storeName: "Playcenter Universal",
        });
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`    ${updatedCount} productos actualizados`);
    } else {
      console.log("   ℹ️  Todos los productos ya tienen storeId correcto");
    }
  }
}

// Ejecutar
fixAdminStore();
