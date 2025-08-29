import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);

      if (user) {
        const docRef = doc(db, "users", user.uid);
        let docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          const nuevoCodigo = generarCodigoUnico();
          await setDoc(docRef, {
            telefono: "",
            direccion: "",
            admin: false,
            codigo: nuevoCodigo,
            displayName: user.displayName || "",
            email: user.email || "",
          });
          docSnap = await getDoc(docRef);
        }

        let data = docSnap.data();
        if (!data.codigo) {
          const nuevoCodigo = generarCodigoUnico();
          await updateDoc(docRef, { codigo: nuevoCodigo });
          data = { ...data, codigo: nuevoCodigo };
        }

        setUsuarioInfo({
          uid: user.uid,
          ...data,
          displayName: user.displayName || data.displayName || "",
          email: user.email || data.email || "",
          isAdmin: data.admin === true,
        });
      } else {
        setUsuarioInfo(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });

    const nuevoCodigo = generarCodigoUnico();
    await setDoc(doc(db, "users", userCredential.user.uid), {
      telefono: "",
      direccion: "",
      admin: false,
      codigo: nuevoCodigo,
      displayName: name,
      email,
    });

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
    await updateDoc(docRef, data);

    const updatedSnap = await getDoc(docRef);
    const updatedData = updatedSnap.exists() ? updatedSnap.data() : {};

    const merged = {
      uid: usuario.uid,
      ...updatedData,
      displayName: usuario.displayName || updatedData.displayName || "",
      email: usuario.email || updatedData.email || "",
      isAdmin: updatedData.admin === true,
    };

    setUsuarioInfo(merged);

    if (data.displayName && usuario.displayName !== data.displayName) {
      await updateProfile(usuario, { displayName: data.displayName });
      setUsuario(auth.currentUser);
    }

    return merged;
  }

  async function subirImagen(file) {
    if (!usuario) throw new Error("No user logged in");
    const fileRef = ref(storage, `usuarios/${usuario.uid}/perfil.jpg`);
    await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);
    await updateProfile(usuario, { photoURL });
    setUsuario(auth.currentUser);
    setUsuarioInfo((prev) => ({ ...prev, photoURL }));
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
