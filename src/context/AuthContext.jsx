// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  sendPasswordResetEmail,
  EmailAuthProvider,
  linkWithCredential,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Lista de emails admin - verificar por email en lugar de UID
const ADMIN_EMAILS = ["arisleidy0712@gmail.com"];

function isAdminEmail(email) {
  if (!email) {
    console.log("⚠️ isAdminEmail: email vacío");
    return false;
  }
  const emailLower = email.toLowerCase().trim();
  const result = ADMIN_EMAILS.includes(emailLower);
  console.log(`🔍 isAdminEmail("${email}") = ${result}`);
  return result;
}

function generarCodigoUnico() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  let codigo = "USER-";
  for (let i = 0; i < 3; i++)
    codigo += letras.charAt(Math.floor(Math.random() * letras.length));
  for (let i = 0; i < 3; i++)
    codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
  return codigo;
}

// Buscar usuario existente por email (para unificar cuentas Google y Email/Password)
async function findUserByEmail(email) {
  try {
    const emailLower = email.toLowerCase().trim();
    console.log("🔍 Buscando usuario con email:", emailLower);

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", emailLower));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      console.log("✅ Usuario encontrado con ID:", userDoc.id);
      return { id: userDoc.id, data: userDoc.data() };
    }

    console.log("⚠️ No se encontró usuario con ese email");
    return null;
  } catch (error) {
    console.error("❌ Error buscando usuario:", error);
    return null;
  }
}

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener de auth; además creamos un listener en tiempo real al doc correcto del usuario
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // limpiar listener anterior si existía
      if (unsubscribeDoc) {
        try {
          unsubscribeDoc();
        } catch (e) {
          /* ignore */
        }
        unsubscribeDoc = null;
      }

      setUsuario(user);

      if (!user) {
        setUsuarioInfo(null);
        setLoading(false);
        return;
      }

      try {
        // referencias
        const usersRef = doc(db, "users", user.uid);
        const usuariosRef = doc(db, "usuarios", user.uid);

        // ver si alguno existe
        const [usersSnap, usuariosSnap] = await Promise.all([
          getDoc(usersRef),
          getDoc(usuariosRef),
        ]);

        let listenRef = null;

        if (usersSnap.exists()) {
          listenRef = usersRef;
        } else if (usuariosSnap.exists()) {
          listenRef = usuariosRef;
        } else {
          // si no existe, creamos users/{uid} con defaults (y luego lo escuchamos)
          const nuevoCodigo = generarCodigoUnico();
          const payload = {
            telefono: "",
            direccion: "",
            admin: false,
            role: "buyer",
            isSeller: false,
            storeName: "",
            storeDescription: "",
            storeImage: "",
            storePhone: "",
            storeAddress: "",
            codigo: nuevoCodigo,
            displayName: user.displayName || "",
            email: user.email || "",
            createdAt: new Date(),
          };
          try {
            await setDoc(usersRef, payload, { merge: true });
          } catch (err) {
            console.warn(
              "No fue posible crear users/{uid} automáticamente:",
              err
            );
          }
          listenRef = usersRef;
        }

        // ahora creamos el onSnapshot para actualizaciones en tiempo real
        unsubscribeDoc = onSnapshot(
          listenRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() || {};
              const userEmail = user.email || data.email || "";
              const merged = {
                uid: user.uid,
                ...data,
                displayName: user.displayName || data.displayName || "",
                email: userEmail,
                fotoURL: data.fotoURL || user.photoURL || "",
                isAdmin: isAdminEmail(userEmail) || data.admin === true,
                admin: isAdminEmail(userEmail) || data.admin === true,
                role: data.role || "buyer",
                isSeller: data.isSeller === true || data.role === "seller",
                storeName: data.storeName || "",
                storeDescription: data.storeDescription || "",
                storeImage: data.storeImage || "",
                storePhone: data.storePhone || "",
                storeAddress: data.storeAddress || "",
              };
              console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
              console.log("🔐 USUARIO CARGADO EN AUTHCONTEXT");
              console.log("📧 Email:", userEmail);
              console.log("🆔 UID:", user.uid);
              console.log("👑 isAdmin (merged):", merged.isAdmin);
              console.log("👑 admin (merged):", merged.admin);
              console.log("✅ isAdminEmail():", isAdminEmail(userEmail));
              console.log("📦 data.admin:", data.admin);
              console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
              setUsuarioInfo(merged);
            } else {
              // doc no existe (caso extremo) => set defaults
              const userEmail = user.email || "";
              const merged = {
                uid: user.uid,
                telefono: "",
                direccion: "",
                admin: isAdminEmail(userEmail),
                codigo: "",
                displayName: user.displayName || "",
                email: userEmail,
                fotoURL: user.photoURL || "",
                isAdmin: isAdminEmail(userEmail),
              };
              setUsuarioInfo(merged);
            }
            setLoading(false);
          },
          (err) => {
            console.error("onSnapshot usuario error:", err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error inicializando listener de usuario:", err);
        // fallback: leer doc una vez y setear usuarioInfo
        try {
          const docRef = doc(db, "users", user.uid);
          const snap = await getDoc(docRef);
          const data = snap.exists() ? snap.data() : {};
          const userEmail = user.email || data.email || "";
          const merged = {
            uid: user.uid,
            ...data,
            displayName: user.displayName || data.displayName || "",
            email: userEmail,
            fotoURL: data.fotoURL || user.photoURL || "",
            isAdmin: isAdminEmail(userEmail) || data.admin === true,
            admin: isAdminEmail(userEmail) || data.admin === true,
          };
          setUsuarioInfo(merged);
        } catch (e) {
          console.error("Fallback read error:", e);
          const userEmail = user.email || "";
          setUsuarioInfo({
            uid: user.uid,
            displayName: user.displayName || "",
            email: userEmail,
            fotoURL: user.photoURL || "",
            telefono: "",
            direccion: "",
            isAdmin: isAdminEmail(userEmail),
            admin: isAdminEmail(userEmail),
            codigo: "",
          });
        } finally {
          setLoading(false);
        }
      }
    });

    // cleanup completo al desmontar provider
    return () => {
      try {
        unsubscribeAuth();
      } catch (e) {
        /* ignore */
      }
      if (unsubscribeDoc) {
        try {
          unsubscribeDoc();
        } catch (e) {
          /* ignore */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userCredential.user, { displayName: name });

    const nuevoCodigo = generarCodigoUnico();
    const emailLower = (email || "").toLowerCase().trim();
    const isAdmin = isAdminEmail(emailLower);

    const payload = {
      telefono: "",
      direccion: "",
      admin: isAdmin,
      role: "buyer",
      isSeller: false,
      storeName: "",
      storeDescription: "",
      storeImage: "",
      storePhone: "",
      storeAddress: "",
      codigo: nuevoCodigo,
      displayName: name,
      email: emailLower,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), payload, {
      merge: true,
    });

    console.log("🔐 Nuevo usuario registrado - Admin:", isAdmin);

    setUsuario(auth.currentUser);
    setUsuarioInfo({
      uid: userCredential.user.uid,
      telefono: "",
      direccion: "",
      admin: isAdmin,
      isAdmin: isAdmin,
      role: "buyer",
      isSeller: false,
      storeName: "",
      storeDescription: "",
      storeImage: "",
      storePhone: "",
      storeAddress: "",
      codigo: nuevoCodigo,
      displayName: name,
      email: emailLower,
    });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    try {
      // Limpiar estados locales inmediatamente
      setUsuario(null);
      setUsuarioInfo(null);

      // Cerrar sesión en Firebase
      await signOut(auth);

      // Limpiar TODO el localStorage relacionado al usuario
      localStorage.removeItem("user");
      localStorage.removeItem("usuarioInfo");
      localStorage.removeItem("carrito");
      localStorage.removeItem("favoritos");
      localStorage.removeItem("lastLoginEmail");
      localStorage.removeItem("lastUserData");

      console.log("✅ Sesión cerrada y datos limpiados completamente");
    } catch (error) {
      console.error("Error durante logout:", error);
      // Aunque falle, limpiar estados locales y localStorage
      setUsuario(null);
      setUsuarioInfo(null);
      localStorage.removeItem("user");
      localStorage.removeItem("usuarioInfo");
      localStorage.removeItem("carrito");
      localStorage.removeItem("favoritos");
      throw error;
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("✅ Email de recuperación enviado a:", email);
      return { success: true };
    } catch (error) {
      console.error("❌ Error al enviar email de recuperación:", error);
      throw error;
    }
  }

  async function checkSignInMethods(email) {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔍 VERIFICANDO MÉTODOS PARA:", email);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log("✅ MÉTODOS ENCONTRADOS:", methods);
      console.log("📊 Cantidad de métodos:", methods.length);
      console.log("🔍 ¿Incluye google.com?", methods.includes("google.com"));
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return methods;
    } catch (error) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ ERROR al verificar métodos para:", email);
      console.error("❌ Error:", error);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return [];
    }
  }

  async function linkPasswordToAccount(password) {
    if (!usuario) throw new Error("No user logged in");
    try {
      const credential = EmailAuthProvider.credential(usuario.email, password);
      await linkWithCredential(usuario, credential);
      console.log("✅ Contraseña vinculada exitosamente");
      return { success: true };
    } catch (error) {
      console.error("❌ Error al vincular contraseña:", error);
      throw error;
    }
  }

  async function actualizarUsuarioInfo(data) {
    if (!usuario) throw new Error("No user logged in");
    const docRef = doc(db, "users", usuario.uid);
    try {
      // Usar setDoc con merge: true para no fallar si el doc no existe
      await setDoc(docRef, data, { merge: true });

      // leer de vuelta el doc guardado para devolver el estado actualizado
      const updatedSnap = await getDoc(docRef);
      const updatedData = updatedSnap.exists() ? updatedSnap.data() : {};

      const merged = {
        uid: usuario.uid,
        ...updatedData,
        displayName: usuario.displayName || updatedData.displayName || "",
        email: usuario.email || updatedData.email || "",
        isAdmin: updatedData.admin === true,
      };

      // actualizar estado local — onSnapshot probablemente ya haga esto, pero lo hacemos para coherencia inmediata
      setUsuarioInfo(merged);

      // si se envió displayName y es diferente, actualizar perfil de auth también
      if (data.displayName && usuario.displayName !== data.displayName) {
        try {
          await updateProfile(usuario, { displayName: data.displayName });
          setUsuario(auth.currentUser);
        } catch (err) {
          console.warn("Error actualizando displayName en auth:", err);
        }
      }

      return merged;
    } catch (err) {
      console.error("actualizarUsuarioInfo error:", err);
      throw err;
    }
  }

  async function subirImagen(file) {
    if (!usuario) throw new Error("No user logged in");
    const fileRef = ref(storage, `usuarios/${usuario.uid}/perfil.jpg`);
    await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);
    await updateProfile(usuario, { photoURL });
    setUsuario(auth.currentUser);
    // persistimos la url en el doc users/{uid}
    try {
      await setDoc(
        doc(db, "users", usuario.uid),
        { fotoURL: photoURL },
        { merge: true }
      );
      setUsuarioInfo((prev) => ({ ...prev, fotoURL: photoURL }));
    } catch (err) {
      console.warn("No se pudo persistir fotoURL en users/{uid}:", err);
    }
    return photoURL;
  }

  async function convertirseEnVendedor(storeData) {
    if (!usuario) throw new Error("No user logged in");
    const docRef = doc(db, "users", usuario.uid);

    try {
      const payload = {
        role: "seller",
        isSeller: true,
        storeName: storeData.storeName || "",
        storeDescription: storeData.storeDescription || "",
        storeImage: storeData.storeImage || "",
        storePhone: storeData.storePhone || "",
        storeAddress: storeData.storeAddress || "",
        sellerActivatedAt: new Date(),
      };

      await setDoc(docRef, payload, { merge: true });

      // Actualizar estado local
      setUsuarioInfo((prev) => ({
        ...prev,
        ...payload,
      }));

      return true;
    } catch (err) {
      console.error("Error al convertirse en vendedor:", err);
      throw err;
    }
  }

  async function actualizarTienda(storeData) {
    if (!usuario) throw new Error("No user logged in");
    if (!usuarioInfo?.isSeller) throw new Error("User is not a seller");

    const docRef = doc(db, "users", usuario.uid);

    try {
      await setDoc(docRef, storeData, { merge: true });

      setUsuarioInfo((prev) => ({
        ...prev,
        ...storeData,
      }));

      return true;
    } catch (err) {
      console.error("Error al actualizar tienda:", err);
      throw err;
    }
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔐 LOGIN CON GOOGLE");
      console.log("📧 Email:", user.email);
      console.log("🆔 UID de Google:", user.uid);

      // Buscar si ya existe perfil con este email
      const existingUser = await findUserByEmail(user.email);

      if (existingUser && existingUser.id !== user.uid) {
        console.log("✅ PERFIL EXISTENTE - Copiando datos al nuevo UID");
        console.log("📁 UID anterior:", existingUser.id);
        console.log("📁 UID nuevo (Google):", user.uid);

        // Copiar perfil al nuevo UID para mantener avatar y datos
        const newDocRef = doc(db, "users", user.uid);
        const userEmail = (user.email || "").toLowerCase().trim();
        await setDoc(
          newDocRef,
          {
            ...existingUser.data,
            fotoURL: user.photoURL || existingUser.data.fotoURL || "",
            displayName:
              user.displayName || existingUser.data.displayName || "",
            admin: isAdminEmail(userEmail) || existingUser.data.admin === true,
            linkedAccounts: {
              originalUID: existingUser.id,
              googleUID: user.uid,
              unified: true,
            },
          },
          { merge: true }
        );
        console.log("✅ Perfil unificado - Avatar y datos preservados");
        console.log("🔐 Admin:", isAdminEmail(userEmail));
      } else if (!existingUser) {
        console.log("🆕 NUEVO PERFIL - Creando");
        const docRef = doc(db, "users", user.uid);
        const nuevoCodigo = generarCodigoUnico();
        const userEmail = (user.email || "").toLowerCase().trim();
        await setDoc(
          docRef,
          {
            telefono: "",
            direccion: "",
            admin: isAdminEmail(userEmail),
            role: "buyer",
            isSeller: false,
            storeName: "",
            storeDescription: "",
            storeImage: "",
            storePhone: "",
            storeAddress: "",
            codigo: nuevoCodigo,
            displayName: user.displayName || "",
            email: userEmail,
            fotoURL: user.photoURL || "",
            createdAt: new Date(),
            loginMethod: "google",
          },
          { merge: true }
        );
        console.log("✅ Perfil nuevo creado");
        console.log("🔐 Admin:", isAdminEmail(userEmail));
      } else {
        console.log("✅ Mismo UID - Solo actualizar");
      }

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return result;
    } catch (err) {
      console.error("Error al iniciar sesión con Google:", err);
      throw err;
    }
  }

  async function loginWithApple() {
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verificar si el usuario ya existe en Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      // Si no existe, crear el documento
      if (!docSnap.exists()) {
        const nuevoCodigo = generarCodigoUnico();
        const payload = {
          telefono: "",
          direccion: "",
          admin: false,
          role: "buyer",
          isSeller: false,
          storeName: "",
          storeDescription: "",
          storeImage: "",
          storePhone: "",
          storeAddress: "",
          codigo: nuevoCodigo,
          displayName: user.displayName || "Usuario Apple",
          email: user.email || "",
          fotoURL: user.photoURL || "",
          createdAt: new Date(),
          loginMethod: "apple",
        };

        await setDoc(docRef, payload, { merge: true });
      }

      return result;
    } catch (err) {
      console.error("Error al iniciar sesión con Apple:", err);
      throw err;
    }
  }

  const value = {
    usuario,
    usuarioInfo,
    login,
    signup,
    logout,
    resetPassword,
    checkSignInMethods,
    linkPasswordToAccount,
    actualizarUsuarioInfo,
    subirImagen,
    convertirseEnVendedor,
    actualizarTienda,
    loginWithGoogle,
    loginWithApple,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
