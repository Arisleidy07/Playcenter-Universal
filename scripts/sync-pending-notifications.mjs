/**
 * Script para sincronizar notificaciones de solicitudes pendientes existentes
 * Ejecutar una vez: node scripts/sync-pending-notifications.mjs
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// Configuración de Firebase (usa las mismas credenciales de tu .env.local)
const firebaseConfig = {
  apiKey:
    process.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCPkNONrnvPEgrHHZ3LPy5lODDs0VGowlM",
  authDomain:
    process.env.VITE_FIREBASE_AUTH_DOMAIN || "pcu-base.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "pcu-base",
  storageBucket:
    process.env.VITE_FIREBASE_STORAGE_BUCKET || "pcu-base.firebasestorage.app",
  messagingSenderId:
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "665713411498",
  appId:
    process.env.VITE_FIREBASE_APP_ID ||
    "1:665713411498:web:8c035a52a8a9a850a3b8a5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncPendingNotifications() {
  console.log("🔄 Sincronizando notificaciones de solicitudes pendientes...\n");

  try {
    // 1. Obtener todas las solicitudes pendientes
    const solicitudesRef = collection(db, "solicitudes_vendedor");
    const q = query(solicitudesRef, where("estado", "==", "pendiente"));
    const snapshot = await getDocs(q);

    console.log(
      `📋 Encontradas ${snapshot.docs.length} solicitudes pendientes\n`
    );

    if (snapshot.docs.length === 0) {
      console.log("✅ No hay solicitudes pendientes para sincronizar");
      return;
    }

    // 2. Verificar si ya existen notificaciones para estas solicitudes
    const notificationsRef = collection(db, "notifications");
    const existingNotifs = await getDocs(
      query(notificationsRef, where("type", "==", "solicitud_vendedor"))
    );

    const existingSolicitudIds = new Set(
      existingNotifs.docs
        .map((doc) => doc.data().metadata?.solicitudId)
        .filter(Boolean)
    );

    console.log(
      `📌 Ya existen ${existingSolicitudIds.size} notificaciones de solicitudes\n`
    );

    // 3. Crear notificaciones para las que no existen
    let created = 0;
    let skipped = 0;

    for (const doc of snapshot.docs) {
      const solicitud = { id: doc.id, ...doc.data() };

      if (existingSolicitudIds.has(solicitud.id)) {
        console.log(
          `⏭️  Saltando: ${solicitud.tiendaNombre} (ya tiene notificación)`
        );
        skipped++;
        continue;
      }

      // Crear notificación
      await addDoc(collection(db, "notifications"), {
        type: "solicitud_vendedor",
        title: "Nueva solicitud de tienda",
        message: `${
          solicitud.nombreContacto || "Alguien"
        } quiere abrir la tienda "${solicitud.tiendaNombre}"`,
        targetType: "admin",
        targetUserId: null,
        actionUrl: "/admin?tab=solicitudes",
        actionLabel: "Ver solicitud",
        metadata: {
          solicitudId: solicitud.id,
          tiendaNombre: solicitud.tiendaNombre,
          email: solicitud.email,
        },
        read: false,
        createdAt: serverTimestamp(),
      });

      console.log(`✅ Creada notificación para: ${solicitud.tiendaNombre}`);
      created++;
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📊 RESUMEN:`);
    console.log(`   - Notificaciones creadas: ${created}`);
    console.log(`   - Solicitudes saltadas: ${skipped}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  process.exit(0);
}

syncPendingNotifications();
