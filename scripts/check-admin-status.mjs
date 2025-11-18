#!/usr/bin/env node

/**
 * Script para verificar el estado de la cuenta de administrador
 *
 * Uso: node scripts/check-admin-status.mjs <USER_EMAIL>
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer configuración de Firebase
const envPath = join(__dirname, "..", ".env.local");
let firebaseConfig;

try {
  const envContent = readFileSync(envPath, "utf-8");
  const lines = envContent.split("\n");

  firebaseConfig = {
    apiKey: lines
      .find((l) => l.startsWith("VITE_FIREBASE_API_KEY"))
      ?.split("=")[1]
      ?.trim(),
    authDomain: lines
      .find((l) => l.startsWith("VITE_FIREBASE_AUTH_DOMAIN"))
      ?.split("=")[1]
      ?.trim(),
    projectId: lines
      .find((l) => l.startsWith("VITE_FIREBASE_PROJECT_ID"))
      ?.split("=")[1]
      ?.trim(),
    storageBucket: lines
      .find((l) => l.startsWith("VITE_FIREBASE_STORAGE_BUCKET"))
      ?.split("=")[1]
      ?.trim(),
    messagingSenderId: lines
      .find((l) => l.startsWith("VITE_FIREBASE_MESSAGING_SENDER_ID"))
      ?.split("=")[1]
      ?.trim(),
    appId: lines
      .find((l) => l.startsWith("VITE_FIREBASE_APP_ID"))
      ?.split("=")[1]
      ?.trim(),
  };
} catch (error) {
  console.error("❌ Error leyendo .env.local:", error);
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAdminStatus() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error("❌ Error: Debes proporcionar el email del usuario");
    console.log("Uso: node scripts/check-admin-status.mjs <USER_EMAIL>\n");
    process.exit(1);
  }

  console.log("🔍 Verificando estado de la cuenta...\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    // Buscar usuario por email
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("⚠️  Usuario no encontrado en la colección usuarios");
      console.log(`📧 Email buscado: ${userEmail}`);
      console.log("\n💡 Esto puede significar:");
      console.log("   1. El usuario no ha completado su perfil");
      console.log("   2. El email es incorrecto");
      console.log("   3. Necesitas ejecutar el script de configuración\n");
      process.exit(1);
    }

    const userId = querySnapshot.docs[0].id;
    const userData = querySnapshot.docs[0].data();

    console.log("👤 INFORMACIÓN DEL USUARIO");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email:        ${userData.email || "N/A"}`);
    console.log(`🆔 User ID:      ${userId}`);
    console.log(`👑 Es Admin:     ${userData.es_admin ? "✅ SÍ" : "❌ NO"}`);
    console.log(`📝 Rol:          ${userData.rol || "N/A"}`);
    console.log(`🏪 Tienda ID:    ${userData.tienda_id || "N/A"}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Buscar tiendas del usuario
    console.log("🏪 TIENDAS DEL USUARIO");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const tiendasQuery = query(
      collection(db, "tiendas"),
      where("propietario_id", "==", userId)
    );
    const tiendasSnap = await getDocs(tiendasQuery);

    if (tiendasSnap.empty) {
      console.log("⚠️  No se encontraron tiendas asignadas directamente");
    } else {
      tiendasSnap.forEach((doc, index) => {
        const tienda = doc.data();
        console.log(`\n📦 Tienda ${index + 1}:`);
        console.log(`   ID:          ${doc.id}`);
        console.log(`   Nombre:      ${tienda.nombre}`);
        console.log(`   Principal:   ${tienda.principal ? "✅ SÍ" : "❌ NO"}`);
        console.log(`   Estado:      ${tienda.estado}`);
      });
    }

    // Verificar Playcenter Universal
    console.log("\n\n🏪 PLAYCENTER UNIVERSAL");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const playcenterRef = doc(db, "tiendas", "playcenter_universal");
    const playcenterDoc = await getDoc(playcenterRef);

    if (!playcenterDoc.exists()) {
      console.log("❌ La tienda Playcenter Universal NO existe");
      console.log("\n💡 Solución:");
      console.log(
        "   Ejecuta: node scripts/setup-admin-owner.mjs " + userEmail
      );
    } else {
      const playcenter = playcenterDoc.data();
      console.log("✅ La tienda existe");
      console.log(`📝 Nombre:           ${playcenter.nombre}`);
      console.log(`👤 Propietario ID:   ${playcenter.propietario_id || "N/A"}`);
      console.log(
        `👑 Es Admin:         ${playcenter.es_admin ? "✅ SÍ" : "❌ NO"}`
      );
      console.log(
        `⭐ Principal:        ${playcenter.principal ? "✅ SÍ" : "❌ NO"}`
      );
      console.log(`📊 Estado:           ${playcenter.estado}`);

      if (playcenter.propietario_id === userId) {
        console.log(
          "\n✅ ¡PERFECTO! Eres la propietaria de Playcenter Universal"
        );
      } else if (
        playcenter.propietario_id === "ADMIN" ||
        !playcenter.propietario_id
      ) {
        console.log("\n⚠️  La tienda no tiene propietario asignado");
        console.log("💡 Solución:");
        console.log(
          "   Ejecuta: node scripts/setup-admin-owner.mjs " + userEmail
        );
      } else {
        console.log("\n⚠️  La tienda tiene otro propietario");
        console.log(`   Propietario actual: ${playcenter.propietario_id}`);
        console.log("💡 Solución:");
        console.log(
          "   Ejecuta: node scripts/setup-admin-owner.mjs " + userEmail
        );
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Resumen y recomendaciones
    console.log("📋 RESUMEN Y RECOMENDACIONES");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const esAdmin = userData.es_admin === true;
    const tieneTienda = !tiendasSnap.empty;
    const playcenterExiste = playcenterDoc.exists();
    const esPropietaria =
      playcenterDoc.exists() && playcenterDoc.data().propietario_id === userId;

    if (esAdmin && esPropietaria) {
      console.log("✅ ¡TODO ESTÁ PERFECTO!");
      console.log("   - Eres administradora");
      console.log("   - Eres propietaria de Playcenter Universal");
      console.log("   - Tu tienda debería aparecer en el perfil");
      console.log("\n💡 Si no aparece en el perfil:");
      console.log("   1. Limpia el caché del navegador");
      console.log("   2. Cierra sesión y vuelve a iniciar sesión");
      console.log("   3. Revisa la consola del navegador (F12)");
    } else {
      console.log("⚠️  CONFIGURACIÓN INCOMPLETA\n");

      if (!esAdmin) {
        console.log("❌ No estás marcada como administradora");
      }
      if (!esPropietaria) {
        console.log("❌ No eres propietaria de Playcenter Universal");
      }

      console.log("\n💡 Solución:");
      console.log(
        `   Ejecuta: node scripts/setup-admin-owner.mjs ${userEmail}`
      );
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    console.error("Detalles:", error.message);
    process.exit(1);
  }
}

checkAdminStatus();
