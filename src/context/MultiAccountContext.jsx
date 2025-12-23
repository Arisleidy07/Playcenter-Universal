import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, functions, db } from "../firebase";
import { useAuth } from "./AuthContext";
import { httpsCallable } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";
import { notify } from "../utils/notificationBus";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const MultiAccountContext = createContext();

export function useMultiAccount() {
  return useContext(MultiAccountContext);
}

export function MultiAccountProvider({ children }) {
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [targetAccount, setTargetAccount] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const { usuario, usuarioInfo } = useAuth();

  // Cargar cuentas guardadas desde Firestore cuando el usuario inicia sesión
  useEffect(() => {
    if (!usuario?.uid) {
      setSavedAccounts([]);
      return;
    }

    setLoadingAccounts(true);
    const savedAccountsRef = collection(db, "users", usuario.uid, "savedAccounts");
    const q = query(savedAccountsRef, orderBy("lastActive", "desc"));

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const accounts = [];
        snapshot.forEach((doc) => {
          accounts.push({ id: doc.id, ...doc.data() });
        });

        // Agregar la cuenta actual al inicio si no está
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

        // Si la cuenta actual no está en la lista, agregarla
        const hasCurrentAccount = accounts.some((acc) => acc.uid === usuario.uid);
        if (!hasCurrentAccount) {
          accounts.unshift(currentAccountData);
        } else {
          // Actualizar la cuenta actual si ya existe
          const index = accounts.findIndex((acc) => acc.uid === usuario.uid);
          if (index !== -1) {
            accounts[index] = { ...accounts[index], ...currentAccountData };
            // Mover al inicio
            accounts.unshift(accounts.splice(index, 1)[0]);
          }
        }

        setSavedAccounts(accounts);

        // Sincronizar con localStorage como backup
        try {
          localStorage.setItem("pcu_saved_accounts", JSON.stringify(accounts));
        } catch (_) {}

        setLoadingAccounts(false);
      },
      (error) => {
        console.error("Error cargando cuentas guardadas:", error);
        // Fallback a localStorage si hay error
        try {
          const stored = localStorage.getItem("pcu_saved_accounts");
          if (stored) {
            setSavedAccounts(JSON.parse(stored));
          }
        } catch (_) {}
        setLoadingAccounts(false);
      }
    );

    return () => unsubscribe();
  }, [usuario?.uid, usuario?.email, usuarioInfo]);

  // Guardar cuenta actual en Firestore cuando cambia
  useEffect(() => {
    if (!usuario?.uid) return;

    const saveCurrentAccount = async () => {
      try {
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
          savedAt: new Date().toISOString(),
        };

        // Guardar en Firestore usando el email como ID único
        const accountDocRef = doc(
          db,
          "users",
          usuario.uid,
          "savedAccounts",
          usuario.email || usuario.uid
        );
        await setDoc(accountDocRef, currentAccountData, { merge: true });

        // Si hay una cuenta anterior guardada (cuando se agregó desde "Agregar cuenta")
        // Guardar esta cuenta nueva en la lista de la cuenta anterior
        try {
          const previousAccountUid = localStorage.getItem("pcu_adding_account_from");
          const previousAccountEmail = localStorage.getItem("pcu_adding_account_email");
          
          if (previousAccountUid && previousAccountUid !== usuario.uid) {
            // Guardar la cuenta actual en la lista de la cuenta anterior (cuenta principal)
            const previousAccountDocRef = doc(
              db,
              "users",
              previousAccountUid,
              "savedAccounts",
              usuario.email || usuario.uid
            );
            await setDoc(previousAccountDocRef, currentAccountData, { merge: true });
            
            // Limpiar los valores de localStorage
            localStorage.removeItem("pcu_adding_account_from");
            localStorage.removeItem("pcu_adding_account_email");
            
            notify("Cuenta agregada exitosamente", "success");
          }
        } catch (saveError) {
          console.error("Error guardando cuenta en cuenta anterior:", saveError);
          // Limpiar de todas formas
          localStorage.removeItem("pcu_adding_account_from");
          localStorage.removeItem("pcu_adding_account_email");
        }
      } catch (error) {
        console.error("Error guardando cuenta actual:", error);
      }
    };

    saveCurrentAccount();
  }, [usuario?.uid, usuario?.email, usuarioInfo]);

  const removeAccount = async (uid) => {
    if (!usuario?.uid) return;

    try {
      // Encontrar la cuenta a eliminar
      const accountToRemove = savedAccounts.find((acc) => acc.uid === uid);
      if (!accountToRemove) return;

      // Eliminar de Firestore
      try {
        const accountDocRef = doc(
          db,
          "users",
          usuario.uid,
          "savedAccounts",
          accountToRemove.email || accountToRemove.id || uid
        );
        await deleteDoc(accountDocRef);
      } catch (firestoreError) {
        console.error("Error eliminando cuenta de Firestore:", firestoreError);
      }

      // Actualizar estado local
      setSavedAccounts((prev) => {
        const newList = prev.filter((acc) => acc.uid !== uid);
        // Sincronizar con localStorage
        try {
          localStorage.setItem("pcu_saved_accounts", JSON.stringify(newList));
        } catch (_) {}
        return newList;
      });
    } catch (e) {
      console.warn("removeAccount error:", e);
    }
  };

  // Función para agregar una cuenta manualmente (cuando se hace login con otra cuenta)
  const addAccount = async (accountData) => {
    if (!usuario?.uid || !accountData?.uid) return;

    try {
      const accountToSave = {
        uid: accountData.uid,
        email: accountData.email,
        displayName:
          accountData.displayName ||
          (accountData.email ? accountData.email.split("@")[0] : "Usuario"),
        photoURL: accountData.photoURL || null,
        role: accountData.role || "user",
        lastActive: new Date().toISOString(),
        savedAt: new Date().toISOString(),
      };

      // Guardar en Firestore
      const accountDocRef = doc(
        db,
        "users",
        usuario.uid,
        "savedAccounts",
        accountData.email || accountData.uid
      );
      await setDoc(accountDocRef, accountToSave, { merge: true });

      // El listener de Firestore actualizará automáticamente el estado
    } catch (error) {
      console.error("Error agregando cuenta:", error);
      notify("Error al guardar la cuenta", "error");
    }
  };
  const clearTarget = () => setTargetAccount(null);

  const switchAccount = async (account) => {
    try {
      if (!account?.email) return;
      if (usuario && account.uid === usuario.uid) return;

      // Guardar el UID de la cuenta actual (desde la que se cambia)
      const currentAccountUid = usuario?.uid;
      const currentAccountEmail = usuario?.email;

      // 🚀 MOSTRAR LOADER FULLSCREEN
      setIsSwitching(true);

      // 1. Guardar la cuenta a la que se cambia en la lista de la cuenta actual (cuenta principal)
      if (currentAccountUid && account.uid !== currentAccountUid) {
        try {
          const accountToSave = {
            uid: account.uid,
            email: account.email,
            displayName: account.displayName || account.email?.split("@")[0] || "Usuario",
            photoURL: account.photoURL || null,
            role: account.role || "user",
            lastActive: new Date().toISOString(),
            savedAt: new Date().toISOString(),
            savedBy: currentAccountUid, // Guardar quién la agregó
          };

          // Guardar en la subcolección de la cuenta actual (cuenta principal)
          const accountDocRef = doc(
            db,
            "users",
            currentAccountUid,
            "savedAccounts",
            account.email || account.uid
          );
          await setDoc(accountDocRef, accountToSave, { merge: true });
        } catch (saveError) {
          console.error("Error guardando cuenta en Firestore:", saveError);
          // Continuar aunque falle el guardado
        }
      }

      // 2. Solicitar Custom Token del backend
      const issueToken = httpsCallable(functions, "issueSwitchToken");
      const response = await issueToken({ email: account.email });
      const { customToken } = response.data;

      if (!customToken) {
        setIsSwitching(false);
        notify("Error al obtener token de autenticación", "error");
        return;
      }

      // 3. Cerrar sesión actual
      try {
        await auth.signOut();
      } catch (_) {}

      // 4. CAMBIO INSTANTÁNEO con Custom Token
      await signInWithCustomToken(auth, customToken);

      // 5. Guardar la cuenta anterior en la lista de la nueva cuenta (para sincronización bidireccional)
      if (currentAccountUid && currentAccountEmail && account.uid) {
        try {
          const previousAccountData = {
            uid: currentAccountUid,
            email: currentAccountEmail,
            displayName:
              usuarioInfo?.displayName ||
              usuario?.displayName ||
              (currentAccountEmail ? currentAccountEmail.split("@")[0] : "Usuario"),
            photoURL: usuarioInfo?.fotoURL || usuario?.photoURL || null,
            role: usuarioInfo?.role || "user",
            lastActive: new Date().toISOString(),
            savedAt: new Date().toISOString(),
            savedBy: account.uid,
          };

          const previousAccountDocRef = doc(
            db,
            "users",
            account.uid,
            "savedAccounts",
            currentAccountEmail || currentAccountUid
          );
          await setDoc(previousAccountDocRef, previousAccountData, { merge: true });
        } catch (saveError) {
          console.error("Error guardando cuenta anterior:", saveError);
          // Continuar aunque falle
        }
      }

      // Pequeño delay para que se vea el loader
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 🎉 OCULTAR LOADER
      setIsSwitching(false);
    } catch (e) {
      console.error("❌ Error en switchAccount:", e);
      setIsSwitching(false);
      notify(
        "Error al cambiar de cuenta. Por favor intenta de nuevo.",
        "error",
        "Error"
      );
    }
  };

  return (
    <MultiAccountContext.Provider
      value={{
        savedAccounts,
        removeAccount,
        addAccount,
        switchAccount,
        targetAccount,
        clearTarget,
        isSwitching,
        loadingAccounts,
      }}
    >
      {children}
    </MultiAccountContext.Provider>
  );
}
