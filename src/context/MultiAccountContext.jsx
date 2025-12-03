import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, functions } from "../firebase";
import { useAuth } from "./AuthContext";
import { httpsCallable } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";

const MultiAccountContext = createContext();

export function useMultiAccount() {
  return useContext(MultiAccountContext);
}

export function MultiAccountProvider({ children }) {
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [targetAccount, setTargetAccount] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const { usuario, usuarioInfo } = useAuth();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pcu_saved_accounts");
      if (stored) {
        setSavedAccounts(JSON.parse(stored));
      }
    } catch (_) {}
  }, []);

  // Mezclar/actualizar la cuenta actual al tope cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      setSavedAccounts((prev) => {
        const otherAccounts = prev.filter((acc) => acc.uid !== usuario.uid);
        const currentAccountData = {
          uid: usuario.uid,
          email: usuario.email,
          displayName:
            usuarioInfo?.displayName ||
            usuario?.displayName ||
            (usuario?.email ? usuario.email.split("@")[0] : "Usuario"),
          photoURL: usuarioInfo?.fotoURL || usuario?.photoURL || null,
          role: usuarioInfo?.role || "user",
          lastActive: new Date().toISOString(),
        };
        const updated = [currentAccountData, ...otherAccounts];
        try {
          localStorage.setItem("pcu_saved_accounts", JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    }
  }, [usuario, usuarioInfo]);

  const removeAccount = (uid) => {
    try {
      setSavedAccounts((prev) => {
        const newList = prev.filter((acc) => acc.uid !== uid);
        try {
          localStorage.setItem("pcu_saved_accounts", JSON.stringify(newList));
        } catch (_) {}
        return newList;
      });
    } catch (e) {
      // console.warn("removeAccount error:", e);
    }
  };
  const clearTarget = () => setTargetAccount(null);

  const switchAccount = async (account) => {
    try {
      if (!account?.email) return;
      if (usuario && account.uid === usuario.uid) return;

      // 🚀 MOSTRAR LOADER FULLSCREEN
      setIsSwitching(true);

      // console.log("🔄 Cambio INSTANTÁNEO a:", account.email);

      // 1. Solicitar Custom Token del backend
      const issueToken = httpsCallable(functions, "issueSwitchToken");
      // console.log("📞 Llamando a Cloud Function...");

      const response = await issueToken({ email: account.email });
      const { customToken } = response.data;

      if (!customToken) {
        // console.error("❌ No se recibió custom token");
        setIsSwitching(false);
        return;
      }

      // console.log("✅ Custom token recibido");

      // 2. Cerrar sesión actual
      try {
        await auth.signOut();
        // console.log("🚪 Sesión cerrada");
      } catch (_) {}

      // 3. CAMBIO INSTANTÁNEO con Custom Token
      await signInWithCustomToken(auth, customToken);
      // console.log("🎉 ¡Cambio completado instantáneamente!");

      // Pequeño delay para que se vea el loader
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 🎉 OCULTAR LOADER
      setIsSwitching(false);
    } catch (e) {
      // console.error("❌ Error en switchAccount:", e);
      setIsSwitching(false);
      alert("Error al cambiar de cuenta. Por favor intenta de nuevo.");
    }
  };

  return (
    <MultiAccountContext.Provider
      value={{
        savedAccounts,
        removeAccount,
        switchAccount,
        targetAccount,
        clearTarget,
        isSwitching,
      }}
    >
      {children}
    </MultiAccountContext.Provider>
  );
}
