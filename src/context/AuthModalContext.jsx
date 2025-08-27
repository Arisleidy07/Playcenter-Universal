import React, { createContext, useContext, useState } from "react";

const AuthModalContext = createContext();

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modo, setModo] = useState("login"); // Controla si es login o signup

  function abrirModal(modoInicial = "login") {
    setModo(modoInicial); // Forzar "login" o "signup" al abrir
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
  }

  return (
    <AuthModalContext.Provider value={{ modalAbierto, setModalAbierto, abrirModal, cerrarModal, modo, setModo }}>
      {children}
    </AuthModalContext.Provider>
  );
}
