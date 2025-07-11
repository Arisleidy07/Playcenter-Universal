// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
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

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);

      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          if (!data.codigo) {
            const nuevoCodigo = generarCodigoUnico();
            await updateDoc(docRef, { codigo: nuevoCodigo });
            data.codigo = nuevoCodigo;
          }

          setUsuarioInfo({
            ...data,
            displayName: user.displayName || data.displayName || "",
            email: user.email || data.email || "",
            isAdmin: data.admin === true,
          });
        } else {
          const nuevoCodigo = generarCodigoUnico();
          await setDoc(docRef, {
            telefono: "",
            direccion: "",
            admin: false,
            codigo: nuevoCodigo,
            displayName: user.displayName || "",
            email: user.email || "",
          });
          setUsuarioInfo({
            telefono: "",
            direccion: "",
            admin: false,
            codigo: nuevoCodigo,
            displayName: user.displayName || "",
            email: user.email || "",
            isAdmin: false,
          });
        }
      } else {
        setUsuarioInfo(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await updateProfile(userCredential.user, { displayName: name });
    } catch (err) {
      console.error("Error actualizando displayName:", err);
    }

    const nuevoCodigo = generarCodigoUnico();

    await setDoc(doc(db, "users", userCredential.user.uid), {
      telefono: "",
      direccion: "",
      admin: false,
      codigo: nuevoCodigo,
      displayName: name,
      email: email,
    });

    // Refrescar usuario actualizado
    setUsuario(auth.currentUser);
    setUsuarioInfo({
      telefono: "",
      direccion: "",
      admin: false,
      codigo: nuevoCodigo,
      displayName: name,
      email: email,
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
    await updateDoc(docRef, data);

    setUsuarioInfo((prev) => ({ ...prev, ...data }));

    if (data.displayName && usuario.displayName !== data.displayName) {
      await updateProfile(usuario, { displayName: data.displayName });
      setUsuario(auth.currentUser);
    }
  }

  async function subirImagen(file) {
    if (!usuario) throw new Error("No user logged in");
    const fileRef = ref(storage, `usuarios/${usuario.uid}/perfil.jpg`);
    await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);
    await updateProfile(usuario, { photoURL });
    setUsuario(auth.currentUser);
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
