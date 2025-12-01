import { db } from "../firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

let isFixing = false;
let hasFixed = false;

/**
 * AUTO-ARREGLA los contadores de seguidores
 * Se ejecuta automáticamente una sola vez
 */
export async function autoFixFollowers() {
  // Si se está arreglando, no hacer nada
  if (isFixing) {
    return;
  }

  isFixing = true;
  console.log("🔧 Verificando contadores...");

  try {
    const usersSnap = await getDocs(collection(db, "users"));
    let arreglados = 0;

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const data = userDoc.data();

      // Contar seguidores REALES
      const followersSnap = await getDocs(
        collection(db, `users/${uid}/followers`)
      );
      const followingSnap = await getDocs(
        collection(db, `users/${uid}/following`)
      );

      const realSeguidores = followersSnap.size;
      const realSeguidos = followingSnap.size;
      const actualSeguidores = data.stats?.seguidores || 0;
      const actualSeguidos = data.stats?.seguidos || 0;

      // Si están mal, arreglar
      if (
        actualSeguidores !== realSeguidores ||
        actualSeguidos !== realSeguidos
      ) {
        arreglados++;
        await setDoc(
          doc(db, "users", uid),
          {
            stats: {
              seguidores: realSeguidores,
              seguidos: realSeguidos,
              publicaciones: data.stats?.publicaciones || 0,
            },
          },
          { merge: true }
        );
      }
    }

    if (arreglados > 0) {
      console.log(`✅ Contadores corregidos: ${arreglados} usuarios`);
    } else {
      console.log(`✓ Todos los contadores están correctos`);
    }
  } catch (error) {
    console.error("Error en auto-fix:", error);
  } finally {
    isFixing = false;
  }
}
