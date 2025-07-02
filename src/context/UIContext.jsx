import { createContext, useContext, useState } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <UIContext.Provider value={{ modalAbierto, setModalAbierto }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  return useContext(UIContext);
}
