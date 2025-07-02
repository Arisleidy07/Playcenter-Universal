import React, { createContext, useContext, useState } from "react";

const AuthModalContext = createContext();

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  function abrirModal() {
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
  }

  return (
    <AuthModalContext.Provider value={{ modalAbierto, setModalAbierto, abrirModal, cerrarModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}
