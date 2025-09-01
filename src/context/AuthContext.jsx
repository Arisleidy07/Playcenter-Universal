// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function generarCodigoUnico() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  let codigo = "USER-";
  for (let i = 0; i < 3; i++) codigo += letras.charAt(Math.floor(Math.random() * letras.length));
  for (let i = 0; i < 3; i++) codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
  return codigo;
}

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

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
        try { unsubscribeDoc(); } catch (e) { /* ignore */ }
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
        const [usersSnap, usuariosSnap] = await Promise.all([getDoc(usersRef), getDoc(usuariosRef)]);

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
            codigo: nuevoCodigo,
            displayName: user.displayName || "",
            email: user.email || "",
            createdAt: new Date(),
          };
          try {
            await setDoc(usersRef, payload, { merge: true });
          } catch (err) {
            console.warn("No fue posible crear users/{uid} automáticamente:", err);
          }
          listenRef = usersRef;
        }

        // ahora creamos el onSnapshot para actualizaciones en tiempo real
        unsubscribeDoc = onSnapshot(listenRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() || {};
            const merged = {
              uid: user.uid,
              ...data,
              displayName: user.displayName || data.displayName || "",
              email: user.email || data.email || "",
              isAdmin: data.admin === true,
            };
            setUsuarioInfo(merged);
          } else {
            // doc no existe (caso extremo) => set defaults
            const merged = {
              uid: user.uid,
              telefono: "",
              direccion: "",
              admin: false,
              codigo: "",
              displayName: user.displayName || "",
              email: user.email || user.email,
              isAdmin: false,
            };
            setUsuarioInfo(merged);
          }
          setLoading(false);
        }, (err) => {
          console.error("onSnapshot usuario error:", err);
          setLoading(false);
        });
      } catch (err) {
        console.error("Error inicializando listener de usuario:", err);
        // fallback: leer doc una vez y setear usuarioInfo
        try {
          const docRef = doc(db, "users", user.uid);
          const snap = await getDoc(docRef);
          const data = snap.exists() ? snap.data() : {};
          const merged = {
            uid: user.uid,
            ...data,
            displayName: user.displayName || data.displayName || "",
            email: user.email || data.email || "",
            isAdmin: data.admin === true,
          };
          setUsuarioInfo(merged);
        } catch (e) {
          console.error("Fallback read error:", e);
          setUsuarioInfo({
            uid: user.uid,
            displayName: user.displayName || "",
            email: user.email || "",
            telefono: "",
            direccion: "",
            isAdmin: false,
            codigo: "",
          });
        } finally {
          setLoading(false);
        }
      }
    });

    // cleanup completo al desmontar provider
    return () => {
      try { unsubscribeAuth(); } catch (e) { /* ignore */ }
      if (unsubscribeDoc) {
        try { unsubscribeDoc(); } catch (e) { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });

    const nuevoCodigo = generarCodigoUnico();
    const payload = {
      telefono: "",
      direccion: "",
      admin: false,
      codigo: nuevoCodigo,
      displayName: name,
      email,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), payload, { merge: true });

    setUsuario(auth.currentUser);
    setUsuarioInfo({
      uid: userCredential.user.uid,
      telefono: "",
      direccion: "",
      admin: false,
      codigo: nuevoCodigo,
      displayName: name,
      email,
      isAdmin: false,
    });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
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
      await setDoc(doc(db, "users", usuario.uid), { fotoURL: photoURL }, { merge: true });
      setUsuarioInfo((prev) => ({ ...prev, fotoURL: photoURL }));
    } catch (err) {
      console.warn("No se pudo persistir fotoURL en users/{uid}:", err);
    }
    return photoURL;
  }

  const value = {
    usuario,
    usuarioInfo,
    login,
    signup,
    logout,
    actualizarUsuarioInfo,
    subirImagen,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export default AuthContext;
