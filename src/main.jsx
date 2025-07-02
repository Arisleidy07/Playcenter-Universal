import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CarritoProvider>
        <AuthModalProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthModalProvider>
      </CarritoProvider>
    </AuthProvider>
  </React.StrictMode>
);
