import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  increment,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

/**
 * Hook personalizado para manejar seguimiento de usuarios/tiendas
 * Arquitectura: Instagram/Twitter style
 *
 * @param {string} targetUserId - UID del usuario/tienda a seguir
 * @returns {Object} { isFollowing, toggleFollow, loading }
 */
export function useFollow(targetUserId) {
  const { usuario } = useAuth(); // Usuario actual (el que da click)
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ═══════════════════════════════════════════════════════════
  // 1. VERIFICAR ESTADO INICIAL AL CARGAR
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!usuario || !targetUserId) {
      setLoading(false);
      return;
    }

    // No puedes seguirte a ti mismo
    if (usuario.uid === targetUserId) {
      setIsFollowing(false);
      setLoading(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        // Verificamos si existe el documento de relación
        // Ruta: users/{targetUserId}/followers/{usuario.uid}
        const relationshipRef = doc(
          db,
          "users",
          targetUserId,
          "followers",
          usuario.uid
        );

        const snapshot = await getDoc(relationshipRef);

        setIsFollowing(snapshot.exists());
      } catch (error) {
        console.error("Error verificando estado de seguimiento:", error);
        setIsFollowing(false);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [usuario, targetUserId]);

  // ═══════════════════════════════════════════════════════════
  // 2. FUNCIÓN DE TOGGLE (SEGUIR/DEJAR DE SEGUIR)
  // ═══════════════════════════════════════════════════════════
  const toggleFollow = async () => {
    if (!usuario) {
      alert("Debes iniciar sesión para seguir cuentas.");
      return;
    }

    if (usuario.uid === targetUserId) {
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      const targetUserRef = doc(db, "users", targetUserId);
      const myUserRef = doc(db, "users", usuario.uid);
      const followersRef = doc(
        db,
        "users",
        targetUserId,
        "followers",
        usuario.uid
      );
      const followingRef = doc(
        db,
        "users",
        usuario.uid,
        "following",
        targetUserId
      );

      if (previousState === true) {
        // DEJAR DE SEGUIR
        const followersSnap = await getDoc(followersRef);

        if (followersSnap.exists()) {
          // Primero borrar documentos
          await deleteDoc(followersRef);
          await deleteDoc(followingRef);

          // Luego decrementar contadores
          await updateDoc(targetUserRef, {
            "stats.seguidores": increment(-1),
          });
          await updateDoc(myUserRef, {
            "stats.seguidos": increment(-1),
          });

          console.log(`✅ Dejaste de seguir`);
        }
      } else {
        // SEGUIR
        const followersSnap = await getDoc(followersRef);

        if (followersSnap.exists()) {
          setIsFollowing(true);
          return;
        }

        const targetDoc = await getDoc(targetUserRef);
        const targetData = targetDoc.data();

        // Primero crear documentos
        await setDoc(followersRef, {
          uid: usuario.uid,
          displayName: usuario.displayName || "Usuario",
          photoURL: usuario.photoURL || null,
          seguidoEn: serverTimestamp(),
        });

        await setDoc(followingRef, {
          uid: targetUserId,
          displayName: targetData?.displayName || "Usuario",
          photoURL: targetData?.photoURL || null,
          storeName: targetData?.storeName || null,
          seguidoEn: serverTimestamp(),
        });

        // Luego incrementar contadores
        await updateDoc(targetUserRef, {
          "stats.seguidores": increment(1),
        });
        await updateDoc(myUserRef, {
          "stats.seguidos": increment(1),
        });

        console.log(`✅ Ahora sigues`);
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);

      // ────────────────────────────────────────────────────
      // ROLLBACK: Si falla, revertimos el estado visual
      // ────────────────────────────────────────────────────
      setIsFollowing(previousState);

      // Mensaje de error al usuario
      if (error.code === "permission-denied") {
        alert("No tienes permisos para realizar esta acción.");
      } else if (error.code === "not-found") {
        alert("El usuario no existe.");
      } else {
        alert("Error al actualizar. Intenta de nuevo.");
      }
    }
  };

  return {
    isFollowing,
    toggleFollow,
    loading,
  };
}
