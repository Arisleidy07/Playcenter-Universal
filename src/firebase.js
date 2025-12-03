// src/firebase.js
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { setLogLevel } from "firebase/firestore";

// Suprimir logs verbosos de Firestore en producción
if (import.meta.env.PROD) {
  setLogLevel("error"); // Solo mostrar errores críticos
}

const firebaseConfig = {
  apiKey: "AIzaSyCraPDyyhOJs9IJtVMCe2b1VNFYkbtqWEg",
  authDomain: "playcenter-universal.firebaseapp.com",
  projectId: "playcenter-universal",
  storageBucket: "playcenter-universal.firebasestorage.app",
  messagingSenderId: "876884906641",
  appId: "1:876884906641:web:a0a5b7526b7f4161452530",
  measurementId: "G-4MPL62WSKW",
};

const app = initializeApp(firebaseConfig);
// Forzar long-polling para eliminar errores QUIC completamente
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Forzar long-polling siempre
  experimentalAutoDetectLongPolling: false, // No auto-detectar, usar force
});
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Configurar persistencia LOCAL para que la sesión se mantenga incluso después de cerrar el navegador
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // console.log("✅ Persistencia de sesión configurada (LOCAL)");
  })
  .catch((error) => {
    // console.error("❌ Error al configurar persistencia:", error);
  });

export { db, auth, storage, functions };
