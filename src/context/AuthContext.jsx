// src/context/AuthContext.jsx
import { updateProfile } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { initializeApp } from "firebase/app";

// Tu configuración Firebase (pon la tuya)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Observador de estado de sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Función para iniciar sesión
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Función para crear usuario
function signup(email, password, name) {
  return createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
    return updateProfile(userCredential.user, {
      displayName: name,
    });
  });
}

  // Función para cerrar sesión
  function logout() {
    return signOut(auth);
  }

  const value = {
    usuario,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
