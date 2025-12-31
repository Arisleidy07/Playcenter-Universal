#!/usr/bin/env node
/**
 * Script para crear/restaurar la tienda principal de Playcenter Universal
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
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

// ⚙️ CONFIGURACIÓN DE LA TIENDA PRINCIPAL
const TIENDA_PRINCIPAL = {
  nombre: "Playcenter Universal",
  descripcion:
    "La tienda oficial de Playcenter. Encuentra los mejores productos de tecnología, gaming, accesorios y más. Calidad garantizada y envíos a toda República Dominicana.",
  eslogan: "Tu destino para todo lo que necesitas",
  logo: "/logo.png", // Ajusta según tu logo
  banner: "/banner-playcenter.jpg", // Ajusta según tu banner
  telefono: "809-123-4567", // ⚠️ AJUSTAR
  direccion: "Santiago, República Dominicana", // ⚠️ AJUSTAR
  ownerUid: "TU_UID_AQUI", // ⚠️ REEMPLAZAR con tu UID
  ownerEmail: "arisleidy0712@gmail.com",
  ownerName: "Playcenter Team",
  createdAt: new Date(),
  activa: true,
  principal: true, // Marca como tienda principal
  stats: {
    productos: 0,
    ventas: 0,
    calificacion: 5.0,
  },
};

async function crearTiendaPrincipal() {
  console.log(" Creando/Restaurando Tienda Principal de Playcenter...\n");

  try {
    // 1. Verificar si ya existe una tienda principal
    console.log(" Verificando si ya existe tienda principal...");
    const q = query(collection(db, "stores"), where("principal", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.size > 0) {
      console.log("⚠️  Ya existe una tienda principal:");
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   - ID: ${doc.id}`);
        console.log(`   - Nombre: ${data.nombre}`);
        console.log(`   - Activa: ${data.activa ? "Sí" : "No"}`);
      });
      console.log("\n❓ ¿Quieres crear otra tienda principal de todos modos?");
      console.log(
        "   Si solo quieres activar la existente, hazlo desde Firebase Console."
      );
      return;
    }

    // 2. Crear la tienda principal
    console.log("✨ Creando nueva tienda principal...");
    const docRef = await addDoc(collection(db, "stores"), TIENDA_PRINCIPAL);

    console.log("\n" + "=".repeat(60));
    console.log(" TIENDA PRINCIPAL CREADA EXITOSAMENTE");
    console.log("=".repeat(60));
    console.log(` ID de la tienda: ${docRef.id}`);
    console.log(` Nombre: ${TIENDA_PRINCIPAL.nombre}`);
    console.log(` Email: ${TIENDA_PRINCIPAL.ownerEmail}`);
    console.log(` Activa: Sí`);
    console.log(`⭐ Principal: Sí`);
    console.log("=".repeat(60));

    console.log("\n📋 Próximos pasos:");
    console.log("1. Ve a https://playcenter.com/tiendas");
    console.log("2. Deberías ver la tienda principal");
    console.log(
      "3. Asigna productos existentes a esta tienda (usa script migrar-productos-a-tienda.mjs)"
    );

    console.log("\n✨ ¡Listo!");
  } catch (error) {
    console.error("\n💥 Error al crear tienda principal:", error);
    console.error("\nDetalles del error:", error.message);
    process.exit(1);
  }
}

// Ejecutar
crearTiendaPrincipal()
  .then(() => {
    console.log("\n👋 Proceso finalizado. Puedes cerrar esta ventana.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
