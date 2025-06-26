// src/context/AuthContext.jsx
import { initializeApp } from "firebase/app";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// ✅ Tu configuración REAL de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCraPDyyhOJs9IJtVMCe2b1VNFYkbtqWEg",
  authDomain: "playcenter-universal.firebaseapp.com",
  projectId: "playcenter-universal",
  storageBucket: "playcenter-universal.appspot.com",
  messagingSenderId: "876884906641",
  appId: "1:876884906641:web:a0a5b7526b7f4161452530",
  measurementId: "G-4MPL62WSKW",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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
          setUsuarioInfo(docSnap.data());
        } else {
          await setDoc(docRef, { telefono: "", direccion: "" });
          setUsuarioInfo({ telefono: "", direccion: "" });
        }
      } else {
        setUsuarioInfo(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await setDoc(doc(db, "users", userCredential.user.uid), {
      telefono: "",
      direccion: "",
    });
    setUsuario(userCredential.user);
    setUsuarioInfo({ telefono: "", direccion: "" });
  }

  function logout() {
    return signOut(auth);
  }

  async function actualizarUsuarioInfo(data) {
    if (!usuario) throw new Error("No user logged in");
    const docRef = doc(db, "users", usuario.uid);
    await updateDoc(docRef, data);
    setUsuarioInfo((prev) => ({ ...prev, ...data }));
  }

  async function subirImagen(file) {
    if (!usuario) throw new Error("No user logged in");
    const fileRef = ref(storage, `usuarios/${usuario.uid}/perfil.jpg`);
    await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);
    await updateProfile(usuario, { photoURL });
    setUsuario({ ...usuario, photoURL });
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

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
