import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import "./index.css";
import "rc-slider/assets/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <AuthModalProvider>
            <App />
          </AuthModalProvider>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>

  </React.StrictMode>
);
