#!/usr/bin/env node

/**
 * Script para configurar la cuenta de administrador como dueña de Playcenter Universal
 * Este script actualiza la tienda para asignar el propietario correcto
 *
 * Uso: node scripts/setup-admin-owner.mjs <USER_EMAIL>
 * Ejemplo: node scripts/setup-admin-owner.mjs admin@playcenter.com
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer configuración de Firebase desde .env.local
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupAdminOwner() {
  console.log(
    "👑 Configurando cuenta de administrador como dueña de Playcenter Universal...\n"
  );

  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error("❌ Error: Debes proporcionar el email del administrador");
    console.log("Uso: node scripts/setup-admin-owner.mjs <USER_EMAIL>");
    console.log(
      "Ejemplo: node scripts/setup-admin-owner.mjs admin@playcenter.com\n"
    );
    process.exit(1);
  }

  try {
    // Buscar el usuario por email en la colección usuarios
    console.log(`🔍 Buscando usuario con email: ${userEmail}...`);
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    let userId = null;

    if (!querySnapshot.empty) {
      userId = querySnapshot.docs[0].id;
      console.log(`✅ Usuario encontrado con ID: ${userId}`);
    } else {
      console.log("⚠️  Usuario no encontrado en la colección usuarios");
      console.log("Por favor, ingresa el UID del usuario manualmente:");

      // En un entorno real, podrías usar readline para obtener input
      // Por ahora, mostraremos instrucciones
      console.log("\n📝 Instrucciones:");
      console.log("1. Ve a Firebase Console > Authentication");
      console.log("2. Busca tu usuario y copia el UID");
      console.log(
        "3. Ejecuta: node scripts/setup-admin-owner.mjs <UID> --uid\n"
      );
      process.exit(1);
    }

    // Verificar si existe la tienda Playcenter Universal
    console.log("\n🔍 Verificando tienda Playcenter Universal...");
    const storeRef = doc(db, "tiendas", "playcenter_universal");
    const storeDoc = await getDoc(storeRef);

    if (!storeDoc.exists()) {
      console.log("⚠️  La tienda no existe. Creándola...");

      const playcenterStore = {
        id: "playcenter_universal",
        nombre: "Playcenter Universal",
        propietario_id: userId,
        descripcion:
          "Tienda oficial del sistema Playcenter Universal. Encuentra los mejores productos de tecnología, videojuegos y entretenimiento.",
        logo: "/logo.png",
        banner: "/banner.jpg",
        estado: "activa",
        principal: true,
        es_admin: true,
        categorias_destacadas: [
          "Videojuegos",
          "Consolas",
          "Accesorios",
          "Tecnología",
        ],
        redes_sociales: {
          facebook: "",
          instagram: "",
          twitter: "",
        },
        contacto: {
          telefono: "",
          email: userEmail,
          whatsapp: "",
        },
        estadisticas: {
          total_productos: 0,
          total_ventas: 0,
          valoracion_promedio: 5.0,
        },
        seguidores: 0,
        ventas: 0,
        valoracion_promedio: 5.0,
      };

      await setDoc(storeRef, playcenterStore);
      console.log("✅ Tienda creada exitosamente!");
    } else {
      console.log("✅ Tienda encontrada. Actualizando propietario...");

      await updateDoc(storeRef, {
        propietario_id: userId,
        principal: true,
        es_admin: true,
        "contacto.email": userEmail,
      });

      console.log("✅ Tienda actualizada exitosamente!");
    }

    // Actualizar el documento del usuario para marcarla como admin
    console.log("\n🔍 Actualizando perfil de usuario...");
    const userDocRef = doc(db, "usuarios", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      await updateDoc(userDocRef, {
        es_admin: true,
        rol: "admin",
        tienda_id: "playcenter_universal",
      });
      console.log("✅ Perfil de usuario actualizado!");
    } else {
      console.log("⚠️  Creando documento de usuario...");
      await setDoc(userDocRef, {
        email: userEmail,
        es_admin: true,
        rol: "admin",
        tienda_id: "playcenter_universal",
      });
      console.log("✅ Documento de usuario creado!");
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 ¡Configuración completada exitosamente!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`👤 Usuario:       ${userEmail}`);
    console.log(`🆔 User ID:       ${userId}`);
    console.log(`🏪 Tienda:        Playcenter Universal`);
    console.log(`👑 Rol:           Administrador`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📝 Próximos pasos:");
    console.log("1. Recarga la página del perfil");
    console.log('2. Deberías ver "Playcenter Universal" como tu tienda');
    console.log(
      "3. Tendrás acceso completo a todas las funciones de administrador\n"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la configuración:", error);
    console.error("Detalles:", error.message);
    process.exit(1);
  }
}

setupAdminOwner();
