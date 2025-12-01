#!/usr/bin/env node
/**
 * Script URGENTE: Restaurar tienda principal de Playcenter
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { readFileSync } from "fs";

// Leer .env.local manualmente
const envContent = readFileSync(".env.local", "utf8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function restaurarTienda() {
  console.log("🏪 RESTAURANDO TIENDA PRINCIPAL...\n");

  try {
    const tiendaPrincipal = {
      nombre: "Playcenter Universal",
      descripcion:
        "La tienda oficial de Playcenter. Encuentra los mejores productos de tecnología, gaming, accesorios y más. Calidad garantizada y envíos a toda República Dominicana.",
      eslogan: "Tu destino para todo lo que necesitas",
      logo: "/logo.png",
      banner: "/banner-playcenter.jpg",
      telefono: "809-123-4567",
      direccion: "Santiago, República Dominicana",
      ownerUid: "admin_playcenter",
      ownerEmail: "arisleidy0712@gmail.com",
      ownerName: "Playcenter Team",
      createdAt: new Date(),
      activa: true,
      principal: true,
      stats: {
        productos: 0,
        ventas: 0,
        calificacion: 5.0,
      },
    };

    const docRef = await addDoc(collection(db, "stores"), tiendaPrincipal);

    console.log("✅ ¡TIENDA PRINCIPAL RESTAURADA!");
    console.log(`📦 ID: ${docRef.id}`);
    console.log(`🏪 Nombre: ${tiendaPrincipal.nombre}`);
    console.log("\n🎉 Ya puedes verla en /tiendas");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }

  process.exit(0);
}

restaurarTienda();
