import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, functions, db } from "../firebase";
import { useAuth } from "./AuthContext";
import { httpsCallable } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";
import { notify } from "../utils/notificationBus";
import { fixBucket } from "../utils/imageUtils";
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

  const normalizePhotoUrl = (u) => {
    try {
      if (!u) return null;
      const fixed = fixBucket(String(u));
      return fixed || null;
    } catch {
      return null;
    }
  };

  // Cargar cuentas guardadas desde Firestore cuando el usuario inicia sesión
  useEffect(() => {
    if (!usuario?.uid) {
      setSavedAccounts([]);
      return;
    }

    setLoadingAccounts(true);
    const savedAccountsRef = collection(
      db,
      "users",
      usuario.uid,
      "savedAccounts",
    );
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
          photoURL: normalizePhotoUrl(
            usuarioInfo?.fotoURL || usuario?.photoURL,
          ),
          role: usuarioInfo?.role || "user",
          lastActive: new Date().toISOString(),
        };

        // Si la cuenta actual no está en la lista, agregarla
        const hasCurrentAccount = accounts.some(
          (acc) => acc.uid === usuario.uid,
        );
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

        // Merge con respaldo local para no perder cuentas previas si Firestore está vacío
        let merged = accounts;
        let localOnly = [];
        try {
          const stored = localStorage.getItem("pcu_saved_accounts");
          if (stored) {
            const local = JSON.parse(stored);
            const seenKeys = new Set(
              merged.map((a) => (a.email || a.uid || a.id || "").toLowerCase()),
            );
            local.forEach((a) => {
              const key = String(a.email || a.uid || a.id || "").toLowerCase();
              if (key && !seenKeys.has(key)) {
                merged.push(a);
                localOnly.push(a);
                seenKeys.add(key);
              }
            });
          }
        } catch (_) {}

        setSavedAccounts(merged);

        // Persistir de vuelta el merge a localStorage
        try {
          localStorage.setItem("pcu_saved_accounts", JSON.stringify(merged));
        } catch (_) {}

        // Intentar subir a Firestore las cuentas que sólo existían localmente (migración)
        Promise.all(
          (localOnly || []).map(async (acc) => {
            try {
              const docRef = doc(
                db,
                "users",
                usuario.uid,
                "savedAccounts",
                acc.email || acc.uid || acc.id,
              );
              await setDoc(
                docRef,
                {
                  uid: acc.uid,
                  email: acc.email,
                  displayName:
                    acc.displayName ||
                    (acc.email ? acc.email.split("@")[0] : "Usuario"),
                  photoURL: normalizePhotoUrl(acc.photoURL),
                  role: acc.role || "user",
                  lastActive: acc.lastActive || new Date().toISOString(),
                  savedAt: acc.savedAt || new Date().toISOString(),
                },
                { merge: true },
              );
            } catch (e) {
              console.warn("No se pudo migrar cuenta local a Firestore:", e);
            }
          }),
        ).finally(() => setLoadingAccounts(false));
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
      },
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
          photoURL: normalizePhotoUrl(
            usuarioInfo?.fotoURL || usuario?.photoURL,
          ),
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
          usuario.email || usuario.uid,
        );
        await setDoc(accountDocRef, currentAccountData, { merge: true });

        // Si hay una cuenta anterior guardada (cuando se agregó desde "Agregar cuenta")
        // Guardar esta cuenta nueva en la lista de la cuenta anterior
        try {
          const previousAccountUid = localStorage.getItem(
            "pcu_adding_account_from",
          );
          const previousAccountEmail = localStorage.getItem(
            "pcu_adding_account_email",
          );
          const addIntent = localStorage.getItem("pcu_add_account_intent");
          const tsRaw = localStorage.getItem("pcu_adding_account_ts");
          const ts = tsRaw ? parseInt(tsRaw, 10) : 0;
          const recent =
            Number.isFinite(ts) && Date.now() - ts < 15 * 60 * 1000; // 15 min
          const manualSwitch = localStorage.getItem("pcu_manual_switch");
          const mTsRaw = localStorage.getItem("pcu_manual_switch_ts");
          const mTs = mTsRaw ? parseInt(mTsRaw, 10) : 0;
          const manualRecent =
            Number.isFinite(mTs) && Date.now() - mTs < 5 * 60 * 1000; // 5 min

          if (
            previousAccountUid &&
            previousAccountUid !== usuario.uid &&
            addIntent === "1" &&
            recent &&
            !(manualSwitch === "1" && manualRecent)
          ) {
            // Guardar la cuenta actual en la lista de la cuenta anterior (cuenta principal)
            const previousAccountDocRef = doc(
              db,
              "users",
              previousAccountUid,
              "savedAccounts",
              usuario.email || usuario.uid,
            );
            await setDoc(previousAccountDocRef, currentAccountData, {
              merge: true,
            });

            // Intentar regresar automáticamente a la sesión anterior para NO cambiar de cuenta
            try {
              if (previousAccountEmail) {
                setIsSwitching(true);
                const issueToken = httpsCallable(functions, "issueSwitchToken");
                const res = await issueToken({ email: previousAccountEmail });
                const token = res?.data?.customToken;
                if (token) {
                  await signInWithCustomToken(auth, token);
                }
              }
            } catch (switchBackError) {
              console.warn(
                "No se pudo volver a la cuenta anterior automáticamente:",
                switchBackError,
              );
            } finally {
              setIsSwitching(false);
            }

            notify("Cuenta agregada exitosamente", "success");
          }

          // Limpieza SIEMPRE de flags para evitar cambios automáticos no deseados
          localStorage.removeItem("pcu_adding_account_from");
          localStorage.removeItem("pcu_adding_account_email");
          localStorage.removeItem("pcu_add_account_intent");
          localStorage.removeItem("pcu_adding_account_ts");
          localStorage.removeItem("pcu_manual_switch");
          localStorage.removeItem("pcu_manual_switch_ts");
        } catch (saveError) {
          console.error(
            "Error guardando cuenta en cuenta anterior:",
            saveError,
          );
          // Limpiar de todas formas
          localStorage.removeItem("pcu_adding_account_from");
          localStorage.removeItem("pcu_adding_account_email");
          localStorage.removeItem("pcu_add_account_intent");
          localStorage.removeItem("pcu_adding_account_ts");
          localStorage.removeItem("pcu_manual_switch");
          localStorage.removeItem("pcu_manual_switch_ts");
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
          accountToRemove.email || accountToRemove.id || uid,
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
        photoURL: normalizePhotoUrl(accountData.photoURL),
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
        accountData.email || accountData.uid,
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
    const targetEmail = String(account?.email || account?.id || "")
      .trim()
      .toLowerCase();
    const currentEmail = String(usuario?.email || "")
      .trim()
      .toLowerCase();

    if (!targetEmail) {
      notify("Cuenta inválida", "error");
      return;
    }
    if (
      usuario &&
      (account.uid === usuario.uid || targetEmail === currentEmail)
    ) {
      // Misma cuenta, no hacer nada
      return;
    }

    const currentAccountUid = usuario?.uid;
    const currentAccountEmail = usuario?.email;

    setIsSwitching(true);
    try {
      localStorage.setItem("pcu_manual_switch", "1");
      localStorage.setItem("pcu_manual_switch_ts", String(Date.now()));
    } catch (_) {}

    try {
      // 1. Guardar la cuenta destino en la lista de la cuenta actual
      if (currentAccountUid && account.uid !== currentAccountUid) {
        try {
          const accountToSave = {
            uid: account.uid,
            email: targetEmail,
            displayName:
              account.displayName ||
              (account.email ? account.email.split("@")[0] : "Usuario"),
            photoURL: normalizePhotoUrl(account.photoURL),
            role: account.role || "user",
            lastActive: new Date().toISOString(),
            savedAt: new Date().toISOString(),
            savedBy: currentAccountUid,
          };
          const accountDocRef = doc(
            db,
            "users",
            currentAccountUid,
            "savedAccounts",
            account.email || account.uid,
          );
          await setDoc(accountDocRef, accountToSave, { merge: true });
        } catch (_) {
          // no bloquear el switch si falla el guardado
        }
      }

      // 2. Solicitar Custom Token del backend
      const issueSwitchToken = httpsCallable(functions, "issueSwitchToken");
      const result = await issueSwitchToken({
        email: targetEmail,
        uid: account.uid,
      });
      const customToken = result?.data?.customToken;
      if (!customToken) {
        throw new Error("El servidor no devolvió un token válido");
      }

      // 3. Cerrar sesión y entrar con el Custom Token
      try {
        await auth.signOut();
      } catch (_) {}
      await signInWithCustomToken(auth, customToken);

      // 4. Esperar a que auth.currentUser refleje el cambio (~6s max)
      for (let i = 0; i < 60; i++) {
        const curr = auth.currentUser;
        const currEmail = (curr?.email || "").trim().toLowerCase();
        if (
          currEmail === targetEmail ||
          (account?.uid && curr?.uid === account.uid)
        ) {
          break;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 100));
      }

      const finalUser = auth.currentUser;
      const finalEmail = (finalUser?.email || "").trim().toLowerCase();
      const finalUid = finalUser?.uid || "";
      const targetUid = account?.uid || "";
      if (
        finalEmail !== targetEmail &&
        (!targetUid || finalUid !== targetUid)
      ) {
        throw new Error("Cambio de cuenta no aplicado");
      }

      // 5. Guardado bidireccional: cuenta anterior en la lista de la nueva cuenta
      if (currentAccountUid && currentAccountEmail && account.uid) {
        try {
          const previousAccountData = {
            uid: currentAccountUid,
            email: currentAccountEmail,
            displayName:
              usuarioInfo?.displayName ||
              usuario?.displayName ||
              (currentAccountEmail
                ? currentAccountEmail.split("@")[0]
                : "Usuario"),
            photoURL: normalizePhotoUrl(
              usuarioInfo?.fotoURL || usuario?.photoURL,
            ),
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
            currentAccountEmail || currentAccountUid,
          );
          await setDoc(previousAccountDocRef, previousAccountData, {
            merge: true,
          });
        } catch (_) {}
      }

      notify(`Cuenta activa: ${account.displayName || targetEmail}`, "success");
    } catch (e) {
      console.error("[switchAccount] error:", e);
      const code = e?.code || "";
      const msg =
        code === "functions/not-found"
          ? "La cuenta destino no existe."
          : code === "functions/unauthenticated"
            ? "Debes iniciar sesión primero."
            : code === "functions/internal" || code.startsWith("functions/")
              ? "No se pudo generar el token. Verifica que la Cloud Function esté desplegada."
              : "Error al cambiar de cuenta.";
      notify(msg, "error");
    } finally {
      setIsSwitching(false);
      try {
        localStorage.removeItem("pcu_manual_switch");
        localStorage.removeItem("pcu_manual_switch_ts");
      } catch (_) {}
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
