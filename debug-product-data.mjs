import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqKGVJKwpmxLgUn2Qs8n4aTCJGo7Ej7Ow",
  authDomain: "playcenter-f7f48.firebaseapp.com",
  projectId: "playcenter-f7f48",
  storageBucket: "playcenter-f7f48.appspot.com",
  messagingSenderId: "1092527848623",
  appId: "1:1092527848623:web:bb3b2d8e5b7b8f8e8f8e8f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugProductData() {
  try {
    console.log("🔍 Obteniendo productos de Firebase...\n");

    const q = query(collection(db, "productos"), limit(3));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("❌ No se encontraron productos");
      return;
    }

    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`📦 PRODUCTO ${index + 1} (ID: ${doc.id})`);
      console.log(`   Nombre: ${data.nombre || "Sin nombre"}`);
      console.log(`   Imagen principal: ${data.imagen ? "SÍ" : "NO"}`);
      console.log(
        `   Imágenes galería: ${
          data.imagenes ? `${data.imagenes.length} imágenes` : "NO"
        }`
      );
      console.log(
        `   Videos galería: ${
          data.videoUrls ? `${data.videoUrls.length} videos` : "NO"
        }`
      );
      console.log(
        `   Imágenes extra: ${
          data.imagenesExtra ? `${data.imagenesExtra.length} extras` : "NO"
        }`
      );

      // Mostrar estructura completa del primer producto
      if (index === 0) {
        console.log("\n📋 ESTRUCTURA COMPLETA DEL PRIMER PRODUCTO:");
        console.log(JSON.stringify(data, null, 2));
      }

      console.log("\n" + "─".repeat(50) + "\n");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugProductData();
