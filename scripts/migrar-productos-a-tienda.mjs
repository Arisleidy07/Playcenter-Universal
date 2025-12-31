#!/usr/bin/env node
/**
 * Script de migración: Asignar storeId a productos existentes
 *
 * Este script actualiza TODOS los productos existentes para que tengan:
 * - storeId: "playcenter_universal"
 * - storeName: "Playcenter Universal"
 * - ownerUid: El UID del admin
 * - ownerName: "Playcenter"
 *
 * USAR SOLO UNA VEZ después de implementar el sistema multi-vendor.
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config({ path: ".env.local" });

// Configuración de Firebase
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

const ADMIN_UID = "tu_uid_aqui"; // ⚠️ REEMPLAZAR con el UID real del admin

async function migrarProductos() {
  console.log("🚀 Iniciando migración de productos...\n");

  try {
    // 1. Obtener todos los productos
    const productosRef = collection(db, "productos");
    const snapshot = await getDocs(productosRef);

    console.log(` Total de productos encontrados: ${snapshot.size}\n`);

    let actualizados = 0;
    let yaConTienda = 0;
    let errores = 0;

    // 2. Iterar sobre cada producto
    for (const docSnap of snapshot.docs) {
      const producto = docSnap.data();

      // Si ya tiene storeId, saltar
      if (producto.storeId) {
        yaConTienda++;
        console.log(
          `⏭️  ${producto.nombre || docSnap.id} - Ya tiene tienda asignada`
        );
        continue;
      }

      try {
        // Actualizar con los datos de Playcenter Universal
        await updateDoc(doc(db, "productos", docSnap.id), {
          storeId: "playcenter_universal",
          storeName: "Playcenter Universal",
          ownerUid: ADMIN_UID,
          ownerName: "Playcenter",
        });

        actualizados++;
        console.log(` ${producto.nombre || docSnap.id} - Actualizado`);
      } catch (error) {
        errores++;
        console.error(
          ` ${producto.nombre || docSnap.id} - Error:`,
          error.message
        );
      }
    }

    // 3. Resumen
    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMEN DE MIGRACIÓN");
    console.log("=".repeat(60));
    console.log(` Productos actualizados: ${actualizados}`);
    console.log(`⏭️  Productos que ya tenían tienda: ${yaConTienda}`);
    console.log(` Errores: ${errores}`);
    console.log(` Total procesado: ${snapshot.size}`);
    console.log("=".repeat(60) + "\n");

    console.log("✨ Migración completada!");
  } catch (error) {
    console.error("\n💥 Error fatal en la migración:", error);
    process.exit(1);
  }
}

// Ejecutar migración
migrarProductos()
  .then(() => {
    console.log("\n👋 Proceso finalizado. Puedes cerrar esta ventana.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
